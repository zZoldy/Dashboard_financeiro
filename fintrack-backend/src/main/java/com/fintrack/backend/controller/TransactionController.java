package com.fintrack.backend.controller;

import com.fintrack.backend.dto.TransactionDTO;
import com.fintrack.backend.model.*;
import com.fintrack.backend.repository.CategoryRepository;
import com.fintrack.backend.repository.UserRepository;
import com.fintrack.backend.repository.TransactionRepository;
import com.fintrack.backend.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Controller REST para lançamentos de movimentações financeiras (Transactions).
 * Integra regras de segurança e balanceamento de saldos das carteiras associadas.
 * 
 * @author Desenvolvedor Java Sênior
 */
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário logado não encontrado."));
    }

    /**
     * Retorna todas as transações das carteiras operadas pelo usuário logado.
     */
    @GetMapping
    public ResponseEntity<List<Transaction>> getAll() {
        User loggedUser = getAuthenticatedUser();
        List<Transaction> transactions = transactionRepository.findByWalletUserId(loggedUser.getId());
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        User loggedUser = getAuthenticatedUser();
        return transactionRepository.findById(id)
                .map(t -> {
                    if (!t.getWallet().getUserId().equals(loggedUser.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Acesso negado.");
                    }
                    return ResponseEntity.ok(t);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Cria e consolida uma transação financeira na carteira especificada.
     */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody TransactionDTO dto) {
        User loggedUser = getAuthenticatedUser();

        // Carrega e valida se a carteira informada pertence ao usuário logado
        Wallet wallet = walletRepository.findById(dto.getWalletId())
                .orElseThrow(() -> new RuntimeException("Carteira não encontrada. ID: " + dto.getWalletId()));

        if (!wallet.getUserId().equals(loggedUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("A carteira de destino não pertence ao usuário autenticado.");
        }

        // Carrega a categoria
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada. ID: " + dto.getCategoryId()));

        // Prepara a entidade JPA
        Transaction transaction = new Transaction();
        transaction.setWallet(wallet);
        transaction.setCategory(category);
        transaction.setDescricao(dto.getDescricao());
        transaction.setValor(dto.getValor());
        transaction.setTipo(dto.getTipo());
        transaction.setStatus(dto.getStatus());
        transaction.setMetodoPagamento(dto.getMetodoPagamento());
        transaction.setCodigoPagamento(dto.getCodigoPagamento());

        // Parse inteligente da data de transação
        if (dto.getDataTransacao() != null && !dto.getDataTransacao().isEmpty()) {
            try {
                // Tenta remover o sufixo 'Z' se vier no formato UTC do Luxon/JS
                String cleanDate = dto.getDataTransacao().replace("Z", "");
                if (cleanDate.contains(".")) {
                    cleanDate = cleanDate.substring(0, cleanDate.indexOf("."));
                }
                transaction.setDataTransacao(LocalDateTime.parse(cleanDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            } catch (Exception e) {
                transaction.setDataTransacao(LocalDateTime.now());
            }
        } else {
            transaction.setDataTransacao(LocalDateTime.now());
        }

        // Ajusta o saldo da carteira caso a transação já surja como 'PAGA'
        if (transaction.getStatus() == TransactionStatus.PAGO) {
            atualizarSaldoCarteira(wallet, transaction.getValor(), transaction.getTipo(), true);
        }

        Transaction saved = transactionRepository.save(transaction);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * Atualiza os dados de uma determinada transação.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody TransactionDTO dto) {
        User loggedUser = getAuthenticatedUser();

        return transactionRepository.findById(id)
                .map(t -> {
                    if (!t.getWallet().getUserId().equals(loggedUser.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Acesso negado.");
                    }

                    // Se a transação anterior era PAGA, desfaz o impacto anterior no saldo
                    if (t.getStatus() == TransactionStatus.PAGO) {
                        atualizarSaldoCarteira(t.getWallet(), t.getValor(), t.getTipo(), false);
                    }

                    // Carrega nova Wallet se tiver mudado
                    Wallet wallet = walletRepository.findById(dto.getWalletId()).orElse(t.getWallet());
                    if (!wallet.getUserId().equals(loggedUser.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Carteira de destino inválida.");
                    }

                    Category category = categoryRepository.findById(dto.getCategoryId()).orElse(t.getCategory());

                    t.setWallet(wallet);
                    t.setCategory(category);
                    t.setDescricao(dto.getDescricao());
                    t.setValor(dto.getValor());
                    t.setTipo(dto.getTipo());
                    t.setStatus(dto.getStatus());
                    t.setMetodoPagamento(dto.getMetodoPagamento());
                    t.setCodigoPagamento(dto.getCodigoPagamento());

                    // Aplica novo impacto no saldo caso a transação atualizada seja PAGA
                    if (t.getStatus() == TransactionStatus.PAGO) {
                        atualizarSaldoCarteira(wallet, t.getValor(), t.getTipo(), true);
                    }

                    Transaction updated = transactionRepository.save(t);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Consolida o pagamento de uma conta pendente de forma isolada.
     */
    @PutMapping("/{id}/pay")
    public ResponseEntity<?> pay(@PathVariable Long id) {
        User loggedUser = getAuthenticatedUser();

        return transactionRepository.findById(id)
                .map(t -> {
                    if (!t.getWallet().getUserId().equals(loggedUser.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Acesso negado.");
                    }

                    if (t.getStatus() != TransactionStatus.PAGO) {
                        t.setStatus(TransactionStatus.PAGO);
                        atualizarSaldoCarteira(t.getWallet(), t.getValor(), t.getTipo(), true);
                        Transaction saved = transactionRepository.save(t);
                        return ResponseEntity.ok(saved);
                    }

                    return ResponseEntity.ok(t); // já estava paga
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Exclui uma transação e estorna o saldo da carteira correspondente.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        User loggedUser = getAuthenticatedUser();

        return transactionRepository.findById(id)
                .map(t -> {
                    if (!t.getWallet().getUserId().equals(loggedUser.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Acesso negado.");
                    }

                    // Se a transação a ser excluída estava paga, desfaz o saldo dela primeiro!
                    if (t.getStatus() == TransactionStatus.PAGO) {
                        atualizarSaldoCarteira(t.getWallet(), t.getValor(), t.getTipo(), false);
                    }

                    transactionRepository.delete(t);
                    return ResponseEntity.noContent().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Responsável por adicionar ou subtrair saldo da carteira do usuário.
     * 
     * @param wallet Carteira de destino
     * @param valor Valor monetário da operação
     * @param tipo Tipo de Transação (ENTRADA / SAIDA)
     * @param aplicar true para aplicar efeito financeiro, false para estornar o efeito
     */
    private void atualizarSaldoCarteira(Wallet wallet, Double valor, TransactionType tipo, boolean aplicar) {
        double saldoAtual = wallet.getSaldoAtual();
        boolean isAdicionar = (tipo == TransactionType.ENTRADA && aplicar) || (tipo == TransactionType.SAIDA && !aplicar);
        
        if (isAdicionar) {
            wallet.setSaldoAtual(saldoAtual + valor);
        } else {
            wallet.setSaldoAtual(saldoAtual - valor);
        }
        walletRepository.save(wallet);
    }
}

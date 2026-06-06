package com.fintrack.backend.controller;

import com.fintrack.backend.model.User;
import com.fintrack.backend.model.Wallet;
import com.fintrack.backend.repository.UserRepository;
import com.fintrack.backend.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * Controller REST para gerenciar a coleção de Carteiras (Wallets) sob o domínio do usuário logado.
 * Segue restrições estritas de isolamento por ID de usuário recuperado via JWT.
 * 
 * @author Desenvolvedor Java Sênior
 */
@RestController
@RequestMapping("/api/wallets")
public class WalletController {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Auxiliar seguro para recuperar o Usuário atualmente autenticado na sessão JWT.
     */
    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário logado não encontrado na base de dados."));
    }

    /**
     * Retorna apenas as carteiras correspondentes ao usuário logado.
     */
    @GetMapping
    public ResponseEntity<List<Wallet>> getAll(Principal principal) {
        User loggedUser = getAuthenticatedUser();
        List<Wallet> wallets = walletRepository.findByUserId(loggedUser.getId());
        return ResponseEntity.ok(wallets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        User loggedUser = getAuthenticatedUser();
        return walletRepository.findById(id)
                .map(wallet -> {
                    if (!wallet.getIdUsuario().equals(loggedUser.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Acesso negado a esta carteira.");
                    }
                    return ResponseEntity.ok(wallet);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Registra ou cria uma nova Wallet vinculando automaticamente ao Usuário autenticado.
     */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Wallet wallet) {
        User loggedUser = getAuthenticatedUser();
        
        // Garante o vínculo de segurança
        wallet.setUser(loggedUser);
        
        // Se for uma Wallet nova, saldo inicial inicializa
        if (wallet.getSaldoAtual() == null) {
            wallet.setSaldoAtual(0.0);
        }

        Wallet saved = walletRepository.save(wallet);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * Atualiza dados de uma carteira existente, garantindo o direito de propriedade.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Wallet walletDetails) {
        User loggedUser = getAuthenticatedUser();

        return walletRepository.findById(id)
                .map(wallet -> {
                    if (!wallet.getIdUsuario().equals(loggedUser.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Não é permitido alterar carteiras de terceiros.");
                    }
                    
                    wallet.setNome(walletDetails.getNome());
                    wallet.setSaldoAtual(walletDetails.getSaldoAtual());
                    wallet.setTipo(walletDetails.getTipo());
                    wallet.setInstituicaoFinanceira(walletDetails.getInstituicaoFinanceira());
                    
                    Wallet updated = walletRepository.save(wallet);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Remove uma carteira do usuário logado se encontrada.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        User loggedUser = getAuthenticatedUser();

        return walletRepository.findById(id)
                .map(wallet -> {
                    if (!wallet.getIdUsuario().equals(loggedUser.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Operação não permitida.");
                    }
                    
                    walletRepository.delete(wallet);
                    return ResponseEntity.noContent().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

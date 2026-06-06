package com.fintrack.backend.controller;

import com.fintrack.backend.dto.SubscriptionDTO;
import com.fintrack.backend.model.*;
import com.fintrack.backend.repository.CategoryRepository;
import com.fintrack.backend.repository.UserRepository;
import com.fintrack.backend.repository.SubscriptionRepository;
import com.fintrack.backend.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST para gerenciar as assinaturas recorrentes (Subscriptions) do usuário autenticado.
 * 
 * @author Desenvolvedor Java Sênior
 */
@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

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
     * Retorna todas as assinaturas vinculadas às carteiras pertencentes ao usuário logado.
     */
    @GetMapping
    public ResponseEntity<List<Subscription>> getAll() {
        User loggedUser = getAuthenticatedUser();
        List<Subscription> subscriptions = subscriptionRepository.findByWalletUserId(loggedUser.getId());
        return ResponseEntity.ok(subscriptions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        User loggedUser = getAuthenticatedUser();
        return subscriptionRepository.findById(id)
                .map(sub -> {
                    if (!sub.getWallet().getUserId().equals(loggedUser.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Acesso não autorizado.");
                    }
                    return ResponseEntity.ok(sub);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Registra uma nova assinatura recorrente de desbaste financeiro.
     */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody SubscriptionDTO dto) {
        User loggedUser = getAuthenticatedUser();

        Wallet wallet = walletRepository.findById(dto.getWalletId())
                .orElseThrow(() -> new RuntimeException("Carteira não encontrada. ID: " + dto.getWalletId()));

        if (!wallet.getUserId().equals(loggedUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("A carteira informada não pertence ao usuário.");
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada. ID: " + dto.getCategoryId()));

        Subscription subscription = new Subscription();
        subscription.setWallet(wallet);
        subscription.setCategory(category);
        subscription.setNomeServico(dto.getNomeServico());
        subscription.setValor(dto.getValor());
        subscription.setDiaVencimento(dto.getDiaVencimento());
        subscription.setPeriodicidade(dto.getPeriodicidade());
        subscription.setAtiva(dto.getAtiva() != null ? dto.getAtiva() : true);

        Subscription saved = subscriptionRepository.save(subscription);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * Altera dados cadastrais de uma assinatura pertencente ao usuário.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody SubscriptionDTO dto) {
        User loggedUser = getAuthenticatedUser();

        return subscriptionRepository.findById(id)
                .map(sub -> {
                    if (!sub.getWallet().getUserId().equals(loggedUser.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Operação não permitida.");
                    }

                    Wallet wallet = walletRepository.findById(dto.getWalletId()).orElse(sub.getWallet());
                    if (!wallet.getUserId().equals(loggedUser.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Carteira inválida.");
                    }

                    Category category = categoryRepository.findById(dto.getCategoryId()).orElse(sub.getCategory());

                    sub.setWallet(wallet);
                    sub.setCategory(category);
                    sub.setNomeServico(dto.getNomeServico());
                    sub.setValor(dto.getValor());
                    sub.setDiaVencimento(dto.getDiaVencimento());
                    sub.setPeriodicidade(dto.getPeriodicidade());
                    sub.setAtiva(dto.getAtiva() != null ? dto.getAtiva() : sub.getAtiva());

                    Subscription updated = subscriptionRepository.save(sub);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Alterna o estado de ativação (ativa / inativa) de uma assinatura de forma isolada.
     */
    @PutMapping("/{id}/toggle")
    public ResponseEntity<?> toggleActive(@PathVariable Long id) {
        User loggedUser = getAuthenticatedUser();

        return subscriptionRepository.findById(id)
                .map(sub -> {
                    if (!sub.getWallet().getUserId().equals(loggedUser.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Acesso negado.");
                    }

                    sub.setAtiva(!sub.getAtiva());
                    Subscription updated = subscriptionRepository.save(sub);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Remove o plano de assinatura do banco.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        User loggedUser = getAuthenticatedUser();

        return subscriptionRepository.findById(id)
                .map(sub -> {
                    if (!sub.getWallet().getUserId().equals(loggedUser.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Acesso negado.");
                    }

                    subscriptionRepository.delete(sub);
                    return ResponseEntity.noContent().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

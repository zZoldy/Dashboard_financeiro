package com.fintrack.backend.repository;

import com.fintrack.backend.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositório JPA para a entidade {@link Transaction}.
 * 
 * @author Desenvolvedor Java Sênior
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /**
     * Recupera todas as transações das contas vinculadas a um ID de usuário.
     * 
     * @param userId ID do usuário proprietário das carteiras
     * @return Lista de Transações
     */
    List<Transaction> findByWalletUserId(Long userId);

    /**
     * Recupera todas as transações das contas vinculadas ao e-mail de um usuário logado.
     * 
     * @param email E-mail do usuário no token de acesso
     * @return Lista de Transações
     */
    List<Transaction> findByWalletUserEmail(String email);
}

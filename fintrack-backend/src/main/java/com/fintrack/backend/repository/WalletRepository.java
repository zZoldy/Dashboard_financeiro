package com.fintrack.backend.repository;

import com.fintrack.backend.model.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositório JPA para a entidade {@link Wallet}.
 * 
 * @author Desenvolvedor Java Sênior
 */
@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {

    /**
     * Recupera todas as contas/carteiras vinculadas a um respectivo ID de usuário.
     * 
     * @param userId ID do usuário logado
     * @return Lista de Carteiras correspondente
     */
    List<Wallet> findByUserId(Long userId);

    /**
     * Recupera todas as contas/carteiras vinculadas ao e-mail de um usuário logado.
     * 
     * @param email E-mail do usuário autenticado no JWT
     * @return Lista de Carteiras correspondente
     */
    List<Wallet> findByUserEmail(String email);
}

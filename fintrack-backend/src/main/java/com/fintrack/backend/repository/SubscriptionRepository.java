package com.fintrack.backend.repository;

import com.fintrack.backend.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositório JPA para a entidade {@link Subscription}.
 * 
 * @author Desenvolvedor Java Sênior
 */
@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    /**
     * Recupera todas as assinaturas recorrentes vinculadas a um ID de usuário.
     * 
     * @param userId ID do usuário logado
     * @return Lista de Assinaturas
     */
    List<Subscription> findByWalletUserId(Long userId);

    /**
     * Recupera todas as assinaturas recorrentes vinculadas ao e-mail do usuário no JWT.
     * 
     * @param email E-mail do usuário autenticado
     * @return Lista de Assinaturas
     */
    List<Subscription> findByWalletUserEmail(String email);
}

package com.fintrack.backend.repository;

import com.fintrack.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Interface de persistência para as operações da entidade {@link User}.
 * Estende {@link JpaRepository} fornecendo operações CRUD nativas sob o banco de dados MySQL.
 *
 * @author Desenvolvedor Java Sênior
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Busca um usuário pelo e-mail (que funciona como identificador único).
     *
     * @param email E-mail cadastrado
     * @return Um Optional contendo o Usuário, caso ele exista.
     */
    Optional<User> findByEmail(String email);
}

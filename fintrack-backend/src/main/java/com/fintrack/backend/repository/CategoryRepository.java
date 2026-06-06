package com.fintrack.backend.repository;

import com.fintrack.backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositório JPA para a entidade {@link Category}.
 * 
 * @author Desenvolvedor Java Sênior
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
}

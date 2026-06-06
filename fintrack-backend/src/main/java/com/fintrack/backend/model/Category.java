package com.fintrack.backend.model;

import jakarta.persistence.*;

/**
 * Entidade representando as categorias financeiras (ex: Lazer, Salário, Alimentação).
 * 
 * @author Desenvolvedor Java Sênior
 */
@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CategoryType tipo;

    public Category() {
    }

    public Category(String nome, CategoryType tipo) {
        this.nome = nome;
        this.tipo = tipo;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public CategoryType getTipo() {
        return tipo;
    }

    public void setTipo(CategoryType tipo) {
        this.tipo = tipo;
    }
}

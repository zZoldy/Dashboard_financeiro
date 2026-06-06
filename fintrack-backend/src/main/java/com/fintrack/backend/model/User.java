package com.fintrack.backend.model;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * Entidade que representa o usuário do sistema FinTrack no banco de dados MySQL.
 * Implementa a interface {@link UserDetails} do Spring Security para integrar a autenticação nativa.
 *
 * @author Desenvolvedor Java Sênior
 */
@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 255)
    private String senha;

    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    // Construtor Padrão exigido pela JPA
    public User() {
    }

    // Construtor completo para registro
    public User(String nome, String email, String senha) {
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.dataCriacao = LocalDateTime.now();
    }

    // Getters e Setters das propriedades
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    // Métodos da interface UserDetails para controle de autoridades e acessos

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Por padrão, todos os usuários têm a role padrão de usuário (ROLE_USER)
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        return this.senha;
    }

    @Override
    public String getUsername() {
        return this.email; // O e-mail será o identificador/subject do usuário no escopo de segurança
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Conta não expirada por padrão
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Conta desbloqueada por padrão
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Credenciais válidas por padrão
    }

    @Override
    public boolean isEnabled() {
        return true; // Conta habilitada por padrão
    }
}

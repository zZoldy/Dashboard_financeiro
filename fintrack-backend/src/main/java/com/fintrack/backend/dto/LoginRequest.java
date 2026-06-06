package com.fintrack.backend.dto;

/**
 * Objeto de Transferência de Dados DTO para receber requisições de Login.
 *
 * @author Desenvolvedor Java Sênior
 */
public class LoginRequest {

    private String email;
    private String senha;

    // Construtores
    public LoginRequest() {
    }

    public LoginRequest(String email, String senha) {
        this.email = email;
        this.senha = senha;
    }

    // Getters e Setters
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
}

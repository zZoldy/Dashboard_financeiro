package com.fintrack.backend.dto;

/**
 * Objeto de Transferência de Dados DTO enviado no sucesso da autenticação.
 * Contém o Token JWT gerado e os dados descarregados do usuário para exibição ou armazenamento no Client.
 *
 * @author Desenvolvedor Java Sênior
 */
public class LoginResponse {

    private String token;
    private Long id;
    private String nome;
    private String email;

    // Construtores
    public LoginResponse() {
    }

    public LoginResponse(String token, Long id, String nome, String email) {
        this.token = token;
        this.id = id;
        this.nome = nome;
        this.email = email;
    }

    // Getters e Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}

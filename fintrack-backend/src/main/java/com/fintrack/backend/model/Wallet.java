package com.fintrack.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

/**
 * Entidade representando a carteira ou conta financeira do usuário (Wallet).
 * Todas as carteiras pertencem a um usuário logado.
 * 
 * @author Desenvolvedor Java Sênior
 */
@Entity
@Table(name = "wallets")
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(name = "saldo_atual", nullable = false)
    @JsonProperty("saldo_atual")
    private Double saldoAtual = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private WalletType tipo;

    @Column(name = "instituicao_financeira", nullable = false, length = 100)
    @JsonProperty("instituicao_financeira")
    private String instituicaoFinanceira;

    public Wallet() {
    }

    public Wallet(User user, String nome, Double saldoAtual, WalletType tipo, String instituicaoFinanceira) {
        this.user = user;
        this.nome = nome;
        this.saldoAtual = saldoAtual;
        this.tipo = tipo;
        this.instituicaoFinanceira = instituicaoFinanceira;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    @JsonProperty("user_id")
    public Long getUserId() {
        return user != null ? user.getId() : null;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Double getSaldoAtual() {
        return saldoAtual;
    }

    public void setSaldoAtual(Double saldoAtual) {
        this.saldoAtual = saldoAtual;
    }

    public WalletType getTipo() {
        return tipo;
    }

    public void setTipo(WalletType tipo) {
        this.tipo = tipo;
    }

    public String getInstituicaoFinanceira() {
        return instituicaoFinanceira;
    }

    public void setInstituicaoFinanceira(String instituicaoFinanceira) {
        this.instituicaoFinanceira = instituicaoFinanceira;
    }
}

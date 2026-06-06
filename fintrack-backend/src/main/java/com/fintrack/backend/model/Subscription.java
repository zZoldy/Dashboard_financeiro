package com.fintrack.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

/**
 * Entidade representando as assinaturas / despesas recorrentes do usuário (ex: Netflix, Spotify).
 * Vinculadas a uma carteira padrão para débito e uma categoria específica.
 * 
 * @author Desenvolvedor Java Sênior
 */
@Entity
@Table(name = "subscriptions")
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    @JsonIgnore
    private Wallet wallet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @JsonIgnore
    private Category category;

    @Column(name = "nome_servico", nullable = false, length = 100)
    @JsonProperty("nome_servico")
    private String nomeServico;

    @Column(nullable = false)
    private Double valor;

    @Column(name = "dia_vencimento", nullable = false)
    @JsonProperty("dia_vencimento")
    private Integer diaVencimento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SubscriptionPeriodicity periodicidade;

    @Column(nullable = false)
    private Boolean ativa = true;

    public Subscription() {
    }

    public Subscription(Wallet wallet, Category category, String nomeServico, Double valor, Integer diaVencimento, 
                        SubscriptionPeriodicity periodicidade, Boolean ativa) {
        this.wallet = wallet;
        this.category = category;
        this.nomeServico = nomeServico;
        this.valor = valor;
        this.diaVencimento = diaVencimento;
        this.periodicidade = periodicidade;
        this.ativa = ativa;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Wallet getWallet() {
        return wallet;
    }

    public void setWallet(Wallet wallet) {
        this.wallet = wallet;
    }

    @JsonProperty("wallet_id")
    public Long getWalletId() {
        return wallet != null ? wallet.getId() : null;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    @JsonProperty("category_id")
    public Long getCategoryId() {
        return category != null ? category.getId() : null;
    }

    public String getNomeServico() {
        return nomeServico;
    }

    public void setNomeServico(String nomeServico) {
        this.nomeServico = nomeServico;
    }

    public Double getValor() {
        return valor;
    }

    public void setValor(Double valor) {
        this.valor = valor;
    }

    public Integer getDiaVencimento() {
        return diaVencimento;
    }

    public void setDiaVencimento(Integer diaVencimento) {
        this.diaVencimento = diaVencimento;
    }

    public SubscriptionPeriodicity getPeriodicidade() {
        return periodicidade;
    }

    public void setPeriodicidade(SubscriptionPeriodicity periodicidade) {
        this.periodicidade = periodicidade;
    }

    public Boolean getAtiva() {
        return ativa;
    }

    public void setAtiva(Boolean ativa) {
        this.ativa = ativa;
    }
}

package com.fintrack.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fintrack.backend.model.SubscriptionPeriodicity;

/**
 * Objeto de Transferência de Dados DTO para receber informações de assinaturas (Subscriptions) do React.
 * 
 * @author Desenvolvedor Java Sênior
 */
public class SubscriptionDTO {

    private Long id;

    @JsonProperty("wallet_id")
    private Long walletId;

    @JsonProperty("category_id")
    private Long categoryId;

    @JsonProperty("nome_servico")
    private String nomeServico;

    private Double valor;

    @JsonProperty("dia_vencimento")
    private Integer diaVencimento;

    private SubscriptionPeriodicity periodicidade;
    private Boolean ativa = true;

    public SubscriptionDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getWalletId() {
        return walletId;
    }

    public void setWalletId(Long walletId) {
        this.walletId = walletId;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
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

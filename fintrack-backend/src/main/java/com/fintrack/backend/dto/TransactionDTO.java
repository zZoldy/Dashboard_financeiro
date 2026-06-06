package com.fintrack.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fintrack.backend.model.PaymentMethod;
import com.fintrack.backend.model.TransactionStatus;
import com.fintrack.backend.model.TransactionType;

/**
 * Objeto de Transferência de Dados DTO para receber lançamentos de transações vindas do React.
 * 
 * @author Desenvolvedor Java Sênior
 */
public class TransactionDTO {

    private Long id;

    @JsonProperty("wallet_id")
    private Long walletId;

    @JsonProperty("category_id")
    private Long categoryId;

    private String descricao;
    private Double valor;

    @JsonProperty("data_transacao")
    private String dataTransacao;

    private TransactionType tipo;
    private TransactionStatus status;

    @JsonProperty("metodo_pagamento")
    private PaymentMethod metodoPagamento;

    @JsonProperty("codigo_pagamento")
    private String codigoPagamento;

    public TransactionDTO() {
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

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Double getValor() {
        return valor;
    }

    public void setValor(Double valor) {
        this.valor = valor;
    }

    public String getDataTransacao() {
        return dataTransacao;
    }

    public void setDataTransacao(String dataTransacao) {
        this.dataTransacao = dataTransacao;
    }

    public TransactionType getTipo() {
        return tipo;
    }

    public void setTipo(TransactionType tipo) {
        this.tipo = tipo;
    }

    public TransactionStatus getStatus() {
        return status;
    }

    public void setStatus(TransactionStatus status) {
        this.status = status;
    }

    public PaymentMethod getMetodoPagamento() {
        return metodoPagamento;
    }

    public void setMetodoPagamento(PaymentMethod metodoPagamento) {
        this.metodoPagamento = metodoPagamento;
    }

    public String getCodigoPagamento() {
        return codigoPagamento;
    }

    public void setCodigoPagamento(String codigoPagamento) {
        this.codigoPagamento = codigoPagamento;
    }
}

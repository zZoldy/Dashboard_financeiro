/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: number;
  nome: string;
  email: string;
  data_criacao: string;
}

export enum WalletType {
  CORRENTE = "CORRENTE",
  POUPANCA = "POUPANCA",
  INVESTIMENTO = "INVESTIMENTO"
}

export interface Wallet {
  id: number;
  user_id: number;
  nome: string;
  saldo_atual: number;
  tipo: WalletType;
  instituicao_financeira: string;
}

export enum CategoryType {
  ENTRADA = "ENTRADA",
  SAIDA = "SAIDA"
}

export interface Category {
  id: number;
  nome: string;
  tipo: CategoryType;
}

export enum TransactionType {
  ENTRADA = "ENTRADA",
  SAIDA = "SAIDA"
}

export enum TransactionStatus {
  PENDENTE = "PENDENTE",
  PAGO = "PAGO",
  VENCIDO = "VENCIDO",
  CANCELADO = "CANCELADO"
}

export enum PaymentMethod {
  PIX = "PIX",
  BOLETO = "BOLETO",
  CARTAO = "CARTAO",
  AUTOMATICO = "AUTOMATICO"
}

export interface Transaction {
  id: number;
  wallet_id: number;
  category_id: number;
  descricao: string;
  valor: number;
  data_transacao: string;
  tipo: TransactionType;
  status: TransactionStatus;
  metodo_pagamento: PaymentMethod;
  codigo_pagamento: string;
}

export enum SubscriptionPeriodicity {
  MENSAL = "MENSAL",
  ANUAL = "ANUAL"
}

export interface Subscription {
  id: number;
  wallet_id: number;
  category_id: number;
  nome_servico: string;
  valor: number;
  dia_vencimento: number;
  periodicidade: SubscriptionPeriodicity;
  ativa: boolean;
}

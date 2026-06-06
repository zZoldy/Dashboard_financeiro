/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Transaction, Wallet, Category, TransactionType, TransactionStatus, PaymentMethod } from "../types";
import { Plus, Filter, Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Tag, HelpCircle, Trash2 } from "lucide-react";

interface TransactionsViewProps {
  transactions: Transaction[];
  wallets: Wallet[];
  categories: Category[];
  onAddTransaction: (transaction: Omit<Transaction, "id">) => void;
  onDeleteTransaction: (id: number) => void;
  onPayClick: (transaction: Transaction) => void;
}

export default function TransactionsView({
  transactions,
  wallets,
  categories,
  onAddTransaction,
  onDeleteTransaction,
  onPayClick
}: TransactionsViewProps) {
  
  const [showForm, setShowForm] = useState(false);
  
  // Filtering states
  const [filterType, setFilterType] = useState<"ALL" | "ENTRADA" | "SAIDA">("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDENTE" | "PAGO">("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState(0);
  const [tipo, setTipo] = useState<TransactionType>(TransactionType.SAIDA);
  const [walletId, setWalletId] = useState(wallets.length > 0 ? wallets[0].id : 1);
  const [categoryId, setCategoryId] = useState(categories.length > 0 ? categories[0].id : 1);
  const [status, setStatus] = useState<TransactionStatus>(TransactionStatus.PENDENTE);
  const [metodo, setMetodo] = useState<PaymentMethod>(PaymentMethod.PIX);
  const [codigo, setCodigo] = useState("");

  const walletMap = wallets.reduce((acc, w) => {
    acc[w.id] = w;
    return acc;
  }, {} as { [key: number]: Wallet });

  const categoryMap = categories.reduce((acc, c) => {
    acc[c.id] = c;
    return acc;
  }, {} as { [key: number]: Category });

  // Filter computation
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "ALL" || t.tipo === filterType;
    const matchesStatus = filterStatus === "ALL" || t.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const generateMockPaymentCode = (method: PaymentMethod, label: string) => {
    if (method === PaymentMethod.PIX) {
      return `00020101021126580014br.gov.bcb.pix0114filipekk31@pix.com5204000053039865802BR5915${label.slice(0, 15)}6009CURITIBA62070503***6304`;
    } else {
      // Barcode
      return `34191.79001 ${Math.floor(10000 + Math.random() * 90000)}.${Math.floor(10000 + Math.random() * 90000)} ${Math.floor(10000 + Math.random() * 90000)} ${Math.floor(1 + Math.random() * 9)} ${Math.floor(10000000 + Math.random() * 90000000)}`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao || valor <= 0) return;

    const paymentCode = codigo || generateMockPaymentCode(metodo, descricao);

    onAddTransaction({
      wallet_id: Number(walletId),
      category_id: Number(categoryId),
      descricao,
      valor,
      data_transacao: new Date().toISOString(),
      tipo,
      status,
      metodo_pagamento: metodo,
      codigo_pagamento: paymentCode
    });

    // Reset Form
    setDescricao("");
    setValor(0);
    setCodigo("");
    setShowForm(false);
  };

  return (
    <div id="transactions-view-panel" className="space-y-6">
      
      {/* Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#E1E1E6]">Livro de Lançamentos (Transações)</h1>
          <p className="text-sm text-[#8D8D99] mt-1">Registre novos fluxos de caixa e gerencie pagamentos de contas.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-[#00B37E] hover:bg-[#029a6d] text-white text-sm font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Lançamento
        </button>
      </div>

      {/* Form Launch Input */}
      {showForm && (
        <div className="bg-[#202024] p-5 rounded-xl border border-[#00B37E]/30 shadow-lg space-y-4 animate-slide-in">
          <h3 className="font-semibold text-sm uppercase text-[#00B37E] tracking-wider flex items-center gap-2 border-b border-[#323238] pb-2">
            <Plus className="w-5 h-5" />
            Lançar Receita ou Despesa Bancária
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs text-[#8D8D99] mb-1.5 font-medium">Descrição da Transação</label>
              <input 
                type="text" 
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                placeholder="Ex: Assinatura ChatGPT Plus"
                className="w-full bg-[#121214] text-[#E1E1E6] text-xs p-3 rounded border border-[#323238] focus:outline-none focus:border-[#00B37E]"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-[#8D8D99] mb-1.5 font-medium">Valor Monetário (R$)</label>
              <input 
                type="number" 
                step="0.01"
                value={valor > 0 ? valor : ""}
                onChange={e => setValor(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full bg-[#121214] text-[#E1E1E6] text-xs p-3 rounded border border-[#323238] focus:outline-none focus:border-[#00B37E]"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-[#8D8D99] mb-1.5 font-medium">Direção do Lançamento</label>
              <select 
                value={tipo}
                onChange={e => setTipo(e.target.value as TransactionType)}
                className="w-full bg-[#121214] text-[#E1E1E6] text-xs p-3 rounded border border-[#323238] focus:outline-none focus:border-[#00B37E]"
              >
                <option value={TransactionType.SAIDA}>Saída / Despesa (-)</option>
                <option value={TransactionType.ENTRADA}>Entrada / Receita (+)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#8D8D99] mb-1.5 font-medium">Carteira Bancária de Origem</label>
              <select 
                value={walletId}
                onChange={e => setWalletId(Number(e.target.value))}
                className="w-full bg-[#121214] text-[#E1E1E6] text-xs p-3 rounded border border-[#323238] focus:outline-none focus:border-[#00B37E]"
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.nome} - Balance: R$ {w.saldo_atual.toLocaleString("pt-BR")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#8D8D99] mb-1.5 font-medium">Categoria</label>
              <select 
                value={categoryId}
                onChange={e => setCategoryId(Number(e.target.value))}
                className="w-full bg-[#121214] text-[#E1E1E6] text-xs p-3 rounded border border-[#323238] focus:outline-none focus:border-[#00B37E]"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    ({c.tipo}) {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#8D8D99] mb-1.5 font-medium">Estado de Pagamento</label>
              <select 
                value={status}
                onChange={e => setStatus(e.target.value as TransactionStatus)}
                className="w-full bg-[#121214] text-[#E1E1E6] text-xs p-3 rounded border border-[#323238] focus:outline-none focus:border-[#00B37E]"
              >
                <option value={TransactionStatus.PAGO}>Pago / Liquidado</option>
                <option value={TransactionStatus.PENDENTE}>Pendente de Quitação</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#8D8D99] mb-1.5 font-medium">Método Utilizado</label>
              <select 
                value={metodo}
                onChange={e => setMetodo(e.target.value as PaymentMethod)}
                className="w-full bg-[#121214] text-[#E1E1E6] text-xs p-3 rounded border border-[#323238] focus:outline-none focus:border-[#00B37E]"
              >
                <option value={PaymentMethod.PIX}>Pix (Chave/Código)</option>
                <option value={PaymentMethod.BOLETO}>Boleto (Bancário)</option>
                <option value={PaymentMethod.CARTAO}>Cartão de Crédito</option>
                <option value={PaymentMethod.AUTOMATICO}>Débito Automático</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#8D8D99] mb-1.5 font-medium">Chave Pix / Linha de Boleto (Opcional)</label>
              <input 
                type="text" 
                value={codigo}
                onChange={e => setCodigo(e.target.value)}
                placeholder="Gerada automaticamente se vazio"
                className="w-full bg-[#121214] text-[#E1E1E6] text-xs p-3 rounded border border-[#323238] focus:outline-none focus:border-[#00B37E]"
              />
            </div>

            <div className="md:col-span-4 flex gap-3 pt-2">
              <button 
                type="submit"
                className="py-3 px-6 bg-[#00B37E] hover:bg-[#029a6d] text-white text-xs font-semibold rounded-lg transition-all border border-[#00B37E] shadow"
              >
                Confirmar Lançamento Ledger
              </button>
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="py-3 px-6 bg-[#121214] border border-[#323238] hover:bg-[#202024] text-[#8D8D99] text-xs font-semibold rounded-lg transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtering Section - Controls bar */}
      <div className="bg-[#202024] p-4 rounded-xl border border-[#323238] flex flex-col md:flex-row items-center gap-4 justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input 
            type="text"
            placeholder="Pesquisar por descrição..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#121214] text-[#E1E1E6] text-xs pl-3.5 pr-8 py-2.5 rounded-lg border border-[#323238] focus:outline-none focus:border-[#00B37E]"
          />
        </div>

        {/* Filters Selectors Group */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          
          <div className="flex items-center gap-1.5 bg-[#121214] px-2.5 py-1.5 rounded-lg border border-[#323238]">
            <Filter className="w-3.5 h-3.5 text-[#8D8D99]" />
            <span className="text-[10px] text-[#8D8D99] uppercase font-mono font-semibold">Tipo:</span>
            <select 
              value={filterType}
              onChange={e => setFilterType(e.target.value as any)}
              className="bg-transparent text-xs text-[#E1E1E6] focus:outline-none font-medium cursor-pointer"
            >
              <option value="ALL">Todos os Tipos</option>
              <option value="ENTRADA">Apenas Entradas</option>
              <option value="SAIDA">Apenas Saídas</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#121214] px-2.5 py-1.5 rounded-lg border border-[#323238]">
            <span className="text-[10px] text-[#8D8D99] uppercase font-mono font-semibold">Status:</span>
            <select 
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="bg-transparent text-xs text-[#E1E1E6] focus:outline-none font-medium cursor-pointer"
            >
              <option value="ALL">Qualquer Status</option>
              <option value="PENDENTE">Status: Pendente</option>
              <option value="PAGO">Status: Pago</option>
            </select>
          </div>

        </div>

      </div>

      {/* Grid or List of Records */}
      <div className="bg-[#202024] rounded-xl border border-[#323238] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#323238] bg-[#323238] text-[11px] text-[#A8A8B3] uppercase font-normal tracking-wider select-none">
                <th className="px-6 py-3 font-normal">Data</th>
                <th className="px-6 py-3 font-normal">Descrição</th>
                <th className="px-6 py-3 font-normal">Conta Bancária</th>
                <th className="px-6 py-3 font-normal">Categoria / Canal</th>
                <th className="px-6 py-3 font-normal">Método</th>
                <th className="px-6 py-3 font-normal">Status</th>
                <th className="px-6 py-3 text-right font-normal">Valor</th>
                <th className="px-6 py-3 text-center font-normal">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#323238] text-xs text-[#E1E1E6]">
              {filteredTransactions.map(t => {
                const w = walletMap[t.wallet_id];
                const c = categoryMap[t.category_id];
                const dateObj = new Date(t.data_transacao);
                const dateFmt = dateObj.toLocaleDateString("pt-BR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit"
                });

                return (
                  <tr key={t.id} className="hover:bg-[#121214]/60 transition-all font-sans">
                    <td className="px-6 py-3.5 font-mono text-xs text-[#A8A8B3]">{dateFmt}</td>
                    <td className="px-6 py-3.5">
                      <div>
                        <div className="font-medium text-[#E1E1E6]">{t.descricao}</div>
                        {t.codigo_pagamento && (
                          <div className="text-[10px] font-mono text-[#A8A8B3] mt-0.5 truncate max-w-xs" title={t.codigo_pagamento}>
                            Cód: {t.codigo_pagamento}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-[#E1E1E6] font-medium">
                        <WalletIcon className="w-3.5 h-3.5 text-[#A8A8B3]" />
                        <span>{w ? w.nome : `ID: ${t.wallet_id}`}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1 text-[11px] bg-[#121214] px-2 py-0.5 rounded border border-[#323238] text-[#A8A8B3]">
                        <Tag className="w-3 h-3 text-[#A8A8B3]/80" />
                        {c ? c.nome : "Outros"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs font-mono text-[#A8A8B3]">
                      {t.metodo_pagamento}
                    </td>
                    <td className="px-6 py-3.5">
                      {t.status === TransactionStatus.PAGO ? (
                        <span className="badge-pago">
                          PAGO
                        </span>
                      ) : (
                        <span className="badge-pendente animate-pulse">
                          PENDENTE
                        </span>
                      )}
                    </td>
                    <td className={`px-6 py-3.5 text-right font-mono font-bold ${t.tipo === TransactionType.ENTRADA ? "text-[#00B37E]" : "text-[#F75A68]"}`}>
                      {t.tipo === TransactionType.ENTRADA ? "+" : "-"} R$ {t.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center justify-center gap-2">
                        {t.status === TransactionStatus.PENDENTE && t.tipo === TransactionType.SAIDA && (
                          <button 
                            onClick={() => onPayClick(t)}
                            className="pay-btn"
                          >
                            Pagar
                          </button>
                        )}
                        <button 
                          onClick={() => onDeleteTransaction(t.id)}
                          title="Excluir Lançamento"
                          className="p-1.5 rounded text-[#A8A8B3] hover:bg-[#323238] hover:text-[#F75A68] transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center p-12 text-[#A8A8B3] space-y-2">
                    <HelpCircle className="w-8 h-8 mx-auto opacity-30 text-[#A8A8B3]" />
                    <p className="font-semibold text-sm">Nenhum lançamento correspondeu aos filtros aplicados.</p>
                    <p className="text-xs">Tente dilatar ou alterar os termos digitados na busca.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

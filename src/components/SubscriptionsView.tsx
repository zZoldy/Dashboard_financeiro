/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Subscription, Wallet, Category, SubscriptionPeriodicity } from "../types";
import { Plus, ToggleLeft, ToggleRight, Calendar, CreditCard, Play, Dumbbell, ShieldAlert, Trash2 } from "lucide-react";

interface SubscriptionsViewProps {
  subscriptions: Subscription[];
  wallets: Wallet[];
  categories: Category[];
  onAddSubscription: (sub: Omit<Subscription, "id">) => void;
  onToggleActive: (id: number) => void;
  onDeleteSubscription: (id: number) => void;
}

export default function SubscriptionsView({
  subscriptions,
  wallets,
  categories,
  onAddSubscription,
  onToggleActive,
  onDeleteSubscription
}: SubscriptionsViewProps) {
  
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState(0);
  const [vencimento, setVencimento] = useState(10);
  const [periodicidade, setPeriodicidade] = useState<SubscriptionPeriodicity>(SubscriptionPeriodicity.MENSAL);
  const [walletId, setWalletId] = useState(wallets.length > 0 ? wallets[0].id : 1);

  // Filter subscription category for standard mock tagging
  const subCategory = categories.find(c => c.nome.toLowerCase().includes("assinatura")) || categories[0];

  const walletMap = wallets.reduce((acc, w) => {
    acc[w.id] = w;
    return acc;
  }, {} as { [key: number]: Wallet });

  // Calculate monthly total of active subscriptions
  const monthlyTotalLoad = subscriptions
    .filter(s => s.ativa)
    .reduce((sum, s) => {
      if (s.periodicidade === SubscriptionPeriodicity.ANUAL) {
        return sum + (s.valor / 12); // Pro-rate annual cost monthly
      }
      return sum + s.valor;
    }, 0);

  const getServiceIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("netflix") || n.includes("prime") || n.includes("spotify") || n.includes("disney") || n.includes("hbo")) {
      return <Play className="w-5 h-5 text-[#F75A68]" />;
    }
    if (n.includes("academia") || n.includes("fit") || n.includes("gym")) {
      return <Dumbbell className="w-5 h-5 text-[#00B37E]" />;
    }
    return <CreditCard className="w-5 h-5 text-[#8D8D99]" />;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || valor <= 0) return;

    onAddSubscription({
      wallet_id: Number(walletId),
      category_id: subCategory ? subCategory.id : 1,
      nome_servico: nome,
      valor,
      dia_vencimento: vencimento,
      periodicidade,
      ativa: true
    });

    setNome("");
    setValor(0);
    setVencimento(10);
    setShowForm(false);
  };

  return (
    <div id="subscriptions-view-panel" className="space-y-6">
      
      {/* Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#E1E1E6]">Assinaturas e Serviços Recorrentes</h1>
          <p className="text-sm text-[#8D8D99] mt-1">Monitore seus contratos mensais, streamings e planos corporativos de débito recorrente.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-[#00B37E] hover:bg-[#029a6d] text-white text-sm font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nova Assinatura
        </button>
      </div>

      {/* Header aggregates info bar */}
      <div className="bg-[#202024] p-5 rounded-xl border border-[#323238] grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <span className="text-xs text-[#8D8D99] font-medium block">Carga Mensal Estimada (Plano Ativo)</span>
          <span className="text-3xl font-bold font-mono text-[#F75A68] tracking-tight mt-1.5 inline-block">
            R$ {monthlyTotalLoad.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-[#8D8D99] block mt-1 font-mono uppercase">
            Proporcionalizado por mês
          </span>
        </div>
        <div className="border-t md:border-t-0 md:border-l border-[#323238] pt-4 md:pt-0 md:pl-5 flex flex-col justify-center">
          <span className="text-xs text-[#8D8D99] font-medium block">Assinaturas Contratadas</span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-bold font-mono text-[#E1E1E6]">
              {subscriptions.length}
            </span>
            <span className="text-xs text-[#8D8D99] font-sans">
              ({subscriptions.filter(s => s.ativa).length} em vigor / {subscriptions.filter(s => !s.ativa).length} pausadas)
            </span>
          </div>
        </div>
        <div className="bg-[#121214] p-3 rounded-lg border border-[#323238] flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-[#00B37E] flex-shrink-0" />
          <p className="text-xs text-[#8D8D99] leading-snug">
            <strong>Dica de Economia:</strong> Desative contratos de plataformas que você não usou nos últimos 30 dias para otimizar sua taxa de poupança patrimonial.
          </p>
        </div>
      </div>

      {/* Form modal simulator */}
      {showForm && (
        <div className="bg-[#202024] p-5 rounded-xl border border-[#00B37E]/30 shadow-lg space-y-4 animate-slide-in">
          <h3 className="font-semibold text-sm uppercase text-[#00B37E] tracking-wider flex items-center gap-2 border-b border-[#323238] pb-2">
            <Plus className="w-5 h-5" />
            Cadastrar Novo Serviço / Assinatura Recorrente
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs text-[#8D8D99] mb-1.5 font-medium">Nome do Serviço / Plataforma</label>
              <input 
                type="text" 
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Ex: Spotify Premium, AWS Cloud"
                className="w-full bg-[#121214] text-[#E1E1E6] text-xs p-3 rounded border border-[#323238] focus:outline-none focus:border-[#00B37E]"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-[#8D8D99] mb-1.5 font-medium">Valor Contratual (R$)</label>
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
              <label className="block text-xs text-[#8D8D99] mb-1.5 font-medium">Dia Fixo de Vencimento</label>
              <input 
                type="number" 
                min="1"
                max="31"
                value={vencimento}
                onChange={e => setVencimento(parseInt(e.target.value) || 1)}
                className="w-full bg-[#121214] text-[#E1E1E6] text-xs p-3 rounded border border-[#323238] focus:outline-none focus:border-[#00B37E]"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-[#8D8D99] mb-1.5 font-medium">Periodicidade de Cobrança</label>
              <select 
                value={periodicidade}
                onChange={e => setPeriodicidade(e.target.value as SubscriptionPeriodicity)}
                className="w-full bg-[#121214] text-[#E1E1E6] text-xs p-3 rounded border border-[#323238] focus:outline-none focus:border-[#00B37E]"
              >
                <option value={SubscriptionPeriodicity.MENSAL}>Mensal</option>
                <option value={SubscriptionPeriodicity.ANUAL}>Anual</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#8D8D99] mb-1.5 font-medium">Debitada da Carteira</label>
              <select 
                value={walletId}
                onChange={e => setWalletId(Number(e.target.value))}
                className="w-full bg-[#121214] text-[#E1E1E6] text-xs p-3 rounded border border-[#323238] focus:outline-none focus:border-[#00B37E]"
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3 flex gap-3 pt-2">
              <button 
                type="submit"
                className="py-3 px-6 bg-[#00B37E] hover:bg-[#029a6d] text-white text-xs font-semibold rounded-lg transition-all border border-[#00B37E] shadow"
              >
                Ativar Contrato Recorrente
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

      {/* Grid of active plans */}
      <div id="subscriptions-cards-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subscriptions.map(s => {
          const w = walletMap[s.wallet_id];
          
          return (
            <div 
              key={s.id} 
              className={`p-5 rounded-xl bg-[#202024] border transition-all flex flex-col justify-between relative overflow-hidden group ${
                s.ativa ? "border-[#323238] hover:border-[#00B37E]/30" : "border-[#323238]/60 opacity-60 hover:opacity-100"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#121214] border border-[#323238] rounded-lg">
                    {getServiceIcon(s.nome_servico)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#E1E1E6] text-sm group-hover:text-[#00B37E] transition-colors">{s.nome_servico}</h3>
                    <span className="text-[10px] uppercase font-mono text-[#8D8D99] mt-0.5 block flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#8D8D99]/85" />
                      vence dia <strong className="text-[#E1E1E6] font-semibold">{s.dia_vencimento}</strong>
                    </span>
                  </div>
                </div>

                {/* Status Toggle Switches */}
                <button 
                  onClick={() => onToggleActive(s.id)}
                  title={s.ativa ? "Pausar Assinatura" : "Reativar Assinatura"}
                  className="focus:outline-none transition-transform"
                >
                  {s.ativa ? (
                    <ToggleRight className="w-8 h-8 text-[#00B37E]" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-[#8D8D99]" />
                  )}
                </button>
              </div>

              {/* Card Body / Details */}
              <div className="mt-5 pt-4 border-t border-[#323238] flex items-end justify-between">
                <div>
                  <span className="text-[10px] text-[#8D8D99] font-medium block">Débito em conta</span>
                  <span className="text-xs text-[#E1E1E6] font-semibold font-mono block mt-1">
                    {w ? w.instituicao_financeira : "Geral"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold uppercase text-[#8D8D99] tracking-wider block">
                    {s.periodicidade}
                  </span>
                  <span className="text-lg font-bold font-mono text-[#E1E1E6] block mt-0.5">
                    R$ {s.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Trash Hover overlay panel */}
              <div className="absolute right-2 bottom-12 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onDeleteSubscription(s.id)}
                  title="Remover Assinatura"
                  className="p-1.5 rounded-lg bg-[#121214] text-[#8D8D99] hover:text-[#F75A68] hover:bg-[#323238] border border-[#323238] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

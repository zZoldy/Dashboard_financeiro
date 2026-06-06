/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Wallet, WalletType } from "../types";
import { Plus, Wallet as WalletIcon, TrendingUp, Landmark, ShieldCheck, RefreshCw } from "lucide-react";

interface WalletsViewProps {
  wallets: Wallet[];
  onAddWallet: (wallet: Omit<Wallet, "id">) => void;
}

export default function WalletsView({ wallets, onAddWallet }: WalletsViewProps) {
  // Local state for the bank portfolio calculator (Investimentos por Banco)
  const [portfolio, setPortfolio] = useState([
    { id: 1, banco: "Nubank", valor: 12000 },
    { id: 2, banco: "Itaú", valor: 4850 },
    { id: 3, banco: "XP Investimentos", valor: 35000 },
    { id: 4, banco: "Inter", valor: 15300 },
    { id: 5, banco: "Bradesco", valor: 0 }
  ]);

  // Form states for creating new wallet
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<WalletType>(WalletType.CORRENTE);
  const [instituicao, setInstituicao] = useState("");
  const [saldo, setSaldo] = useState(0);

  // Portfolio aggregates
  const totalPortfolioValue = portfolio.reduce((sum, item) => sum + (item.valor || 0), 0);

  const handlePortfolioValueChange = (id: number, inputVal: string) => {
    const numValue = parseFloat(inputVal) || 0;
    setPortfolio(prev => 
      prev.map(item => item.id === id ? { ...item, valor: numValue } : item)
    );
  };

  const handleAddWalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !instituicao) return;
    
    onAddWallet({
      user_id: 1,
      nome,
      tipo,
      instituicao_financeira: instituicao,
      saldo_atual: saldo
    });

    // Reset form
    setNome("");
    setTipo(WalletType.CORRENTE);
    setInstituicao("");
    setSaldo(0);
    setShowForm(false);
  };

  return (
    <div id="wallets-view-panel" className="space-y-6">
      
      {/* Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#E1E1E6]">Carteiras e Alocação de Portfólio</h1>
          <p className="text-sm text-[#8D8D99] mt-1">Gerencie suas contas, saldos e acompanhe a diversificação patrimonial.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-[#00B37E] hover:bg-[#029a6d] text-white text-sm font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nova Carteira
        </button>
      </div>

      {/* Grid of Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Form to insert new wallet (Conditional) */}
        {showForm && (
          <div className="lg:col-span-5 bg-[#202024] p-5 rounded-xl border border-[#00B37E]/30 shadow-lg space-y-4 animate-slide-in">
            <h3 className="font-semibold text-sm uppercase text-[#00B37E] tracking-wider flex items-center gap-2">
              <Landmark className="w-5 h-5" />
              Adicionar Nova Carteira de Conta
            </h3>
            
            <form onSubmit={handleAddWalletSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs text-[#8D8D99] mb-1.5 font-medium">Nome Amigável</label>
                <input 
                  type="text" 
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Ex: Conta Principal do Dia-a-Dia"
                  className="w-full bg-[#121214] text-[#E1E1E6] text-xs p-3 rounded border border-[#323238] focus:outline-none focus:border-[#00B37E]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-[#8D8D99] mb-1.5 font-medium">Instituição Financeira</label>
                <input 
                  type="text" 
                  value={instituicao}
                  onChange={e => setInstituicao(e.target.value)}
                  placeholder="Ex: Itaú, Nubank, Santander"
                  className="w-full bg-[#121214] text-[#E1E1E6] text-xs p-3 rounded border border-[#323238] focus:outline-none focus:border-[#00B37E]"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-[#8D8D99] mb-1.5 font-medium">Tipo</label>
                  <select 
                    value={tipo}
                    onChange={e => setTipo(e.target.value as WalletType)}
                    className="w-full bg-[#121214] text-[#E1E1E6] text-xs p-3 rounded border border-[#323238] focus:outline-none focus:border-[#00B37E]"
                  >
                    <option value={WalletType.CORRENTE}>Corrente</option>
                    <option value={WalletType.POUPANCA}>Poupança</option>
                    <option value={WalletType.INVESTIMENTO}>Investimento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#8D8D99] mb-1.5 font-medium">Saldo Inicial (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={saldo}
                    onChange={e => setSaldo(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#121214] text-[#E1E1E6] text-xs p-3 rounded border border-[#323238] focus:outline-none focus:border-[#00B37E]"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  type="submit"
                  className="w-full bg-[#00B37E] hover:bg-[#029a6d] text-white text-xs font-semibold py-3 px-4 rounded border border-[#00B37E] transition-all"
                >
                  Salvar
                </button>
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="w-full bg-[#121214] border border-[#323238] hover:bg-[#202024] text-[#8D8D99] text-xs font-semibold py-3 px-4 rounded transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Left Side: Wallets list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#202024] p-5 rounded-xl border border-[#323238]">
            <h2 className="font-semibold text-sm uppercase text-[#E1E1E6] tracking-wider border-b border-[#323238] pb-3 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <WalletIcon className="w-4 h-4 text-[#8D8D99]" />
                Contas Cadastradas
              </span>
              <span className="text-[10px] font-mono text-[#8D8D99] bg-[#121214] border border-[#323238] px-2 py-0.5 rounded">
                {wallets.length} ativas
              </span>
            </h2>

            <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
              {wallets.map(w => (
                <div key={w.id} className="bg-[#121214] p-4 rounded-lg border border-[#323238] flex justify-between items-center hover:border-[#00B37E]/20 transition-all group">
                  <div>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#202024] border border-[#323238] text-[#8D8D99]">
                      {w.tipo}
                    </span>
                    <h4 className="font-semibold text-sm text-[#E1E1E6] mt-2 block group-hover:text-[#00B37E] transition-colors">
                      {w.nome}
                    </h4>
                    <p className="text-xs text-[#8D8D99] mt-0.5 font-sans">
                      Instituição: <span className="text-[#E1E1E6] font-medium">{w.instituicao_financeira}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-[#E1E1E6] block">
                      R$ {w.saldo_atual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-[#8D8D99] uppercase font-mono mt-1 block">
                      ID CONTA: {w.id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Investment Calculator & Diversification HUD */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-[#202024] p-5 rounded-xl border border-[#323238] space-y-5">
            <div className="border-b border-[#323238] pb-3 flex justify-between items-center">
              <h2 className="font-semibold text-sm uppercase text-[#E1E1E6] tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00B37E]" />
                Simulador Dinâmico de Portfólio (Investimentos)
              </h2>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#00B37E] uppercase leading-none bg-[#00B37E]/10 px-2 py-1 rounded border border-[#00B37E]/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Reativo</span>
              </div>
            </div>

            <p className="text-xs text-[#8D8D99] leading-relaxed">
              Edite os saldos investidos por banco abaixo na coluna <strong>Valor Alocado</strong>. A calculadora financeira recalculará dinamicamente a diversificação do portfólio e atualizará a participação percentual instantaneamente.
            </p>

            {/* Total Indicator */}
            <div className="bg-[#121214] p-4 rounded-lg border border-[#323238] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#8D8D99] font-medium block">Total Geral Investido</span>
                <span className="text-2xl font-bold font-mono text-[#00B37E] tracking-tight mt-1 inline-block">
                  R$ {totalPortfolioValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-3 bg-[#202024] border border-[#323238] text-[#8D8D99] rounded-lg">
                <RefreshCw className="w-5 h-5 text-[#8D8D99]/80 animate-spin-slow" />
              </div>
            </div>

            {/* Bank Sliders & Inputs list */}
            <div className="space-y-4">
              {portfolio.map(item => {
                const percentage = totalPortfolioValue > 0 ? (item.valor / totalPortfolioValue) * 100 : 0;
                
                return (
                  <div key={item.id} className="space-y-1.5 p-3.5 bg-[#121214] rounded-lg border border-[#323238] hover:border-[#323238]/80 transition-all">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-2 text-[#E1E1E6]">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#00B37E] opacity-80 inline-block"></span>
                        {item.banco}
                      </span>
                      <span className="text-[#8D8D99] font-mono font-medium">
                        Diversificação: <span className="text-[#00B37E] text-sm font-bold">{percentage.toFixed(1)}%</span>
                      </span>
                    </div>

                    {/* Input field + range slider wrapper */}
                    <div className="flex items-center gap-4 py-1">
                      {/* Slider representing percentage weight */}
                      <input 
                        type="range"
                        min="0"
                        max={Math.max(100000, totalPortfolioValue)}
                        step="500"
                        value={item.valor}
                        onChange={e => handlePortfolioValueChange(item.id, e.target.value)}
                        className="w-full h-1.5 bg-[#323238] rounded-lg appearance-none cursor-pointer accent-[#00B37E] focus:outline-none"
                      />
                      
                      {/* Precise numeric field input */}
                      <div className="relative w-40 flex-shrink-0">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#8D8D99]">R$</span>
                        <input 
                          type="number"
                          value={item.valor}
                          onChange={e => handlePortfolioValueChange(item.id, e.target.value)}
                          placeholder="0.00"
                          className="w-full text-right pr-3 pl-8 bg-[#202024] text-[#E1E1E6] font-mono text-xs py-2.5 rounded border border-[#323238] focus:outline-none focus:border-[#00B37E]"
                        />
                      </div>
                    </div>

                    {/* Progress Bar Indicators */}
                    <div className="w-full bg-[#202024] h-1.5 rounded-full overflow-hidden border border-[#323238]">
                      <div 
                        className="h-full bg-gradient-to-r from-[#00B37E] to-[#4ea8de] rounded-full transition-all duration-300" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

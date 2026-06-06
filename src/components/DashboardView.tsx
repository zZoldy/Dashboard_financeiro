/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from "react";
import { Transaction, Wallet, Category, TransactionStatus, TransactionType, PaymentMethod } from "../types";
import { DollarSign, ArrowUpRight, ArrowDownRight, Award, Calendar, Wallet as WalletIcon, FileText } from "lucide-react";

interface DashboardViewProps {
  transactions: Transaction[];
  wallets: Wallet[];
  categories: Category[];
  onPayClick: (transaction: Transaction) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function DashboardView({ 
  transactions, 
  wallets, 
  categories, 
  onPayClick,
  onNavigateToTab
}: DashboardViewProps) {
  
  const barChartRef = useRef<HTMLCanvasElement | null>(null);
  const doughnutChartRef = useRef<HTMLCanvasElement | null>(null);
  const barInstance = useRef<any>(null);
  const doughnutInstance = useRef<any>(null);

  // Helper dictionary for easy lookups
  const walletMap = wallets.reduce((acc, w) => {
    acc[w.id] = w;
    return acc;
  }, {} as { [key: number]: Wallet });

  const categoryMap = categories.reduce((acc, c) => {
    acc[c.id] = c;
    return acc;
  }, {} as { [key: number]: Category });

  // 1. Calculations
  const totalBalance = wallets.reduce((sum, w) => sum + w.saldo_atual, 0);

  // June 2026 transactions (simulated as current month in metadata)
  const currentMonthTransactions = transactions.filter(t => {
    const d = new Date(t.data_transacao);
    return d.getFullYear() === 2026 && d.getMonth() === 5; // Month 5 is June in JS Date Object
  });

  const monthlyIncome = currentMonthTransactions
    .filter(t => t.tipo === TransactionType.ENTRADA && t.status === TransactionStatus.PAGO)
    .reduce((sum, t) => sum + t.valor, 0);

  const monthlyExpenses = currentMonthTransactions
    .filter(t => t.tipo === TransactionType.SAIDA && t.status === TransactionStatus.PAGO)
    .reduce((sum, t) => sum + t.valor, 0);

  // Economy Indicator Calculation: Saving Rate = (Income - Expenses) / Income * 100
  const monthlySavings = monthlyIncome - monthlyExpenses;
  const savingRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
  
  // Economy vs Previous Month (Simulate comparison to May which was +58% saving rate)
  const previousMonthSavingRate = 58.0;
  const savingDelta = savingRate - previousMonthSavingRate;

  // Initialize and update Chart.js instances
  useEffect(() => {
    if (typeof window === "undefined") return;
    const Chart = (window as any).Chart;
    if (!Chart) {
      console.warn("Chart.js global não encontrado");
      return;
    }

    // Set global styles for Charts (Dark comfort theme compliant text color)
    Chart.defaults.color = "#8D8D99";
    Chart.defaults.font.family = "'Inter', sans-serif";

    // --- CHART 1: BAR - Fluxo Diário ---
    if (barChartRef.current) {
      if (barInstance.current) barInstance.current.destroy();

      // Aggregate data per day in June
      const dailyAggregates: { [key: string]: { entries: number; exits: number } } = {};
      
      currentMonthTransactions.forEach(t => {
        if (t.status !== TransactionStatus.PAGO) return;
        
        const dateObj = new Date(t.data_transacao);
        const dayLabel = dateObj.toLocaleDateString("pt-BR", { day: "numeric" });
        
        if (!dailyAggregates[dayLabel]) {
          dailyAggregates[dayLabel] = { entries: 0, exits: 0 };
        }
        
        if (t.tipo === TransactionType.ENTRADA) {
          dailyAggregates[dayLabel].entries += t.valor;
        } else {
          dailyAggregates[dayLabel].exits += t.valor;
        }
      });

      // Simple sorted days
      const days = Object.keys(dailyAggregates).sort((a, b) => parseInt(a) - parseInt(b));
      const entryData = days.map(d => dailyAggregates[d].entries);
      const exitData = days.map(d => dailyAggregates[d].exits);

      // Fallback if data is too small to make it beautiful
      const chartLabels = days.length > 0 ? days.map(d => `Dia ${d}`) : ["Sem dados"];
      const chartEntries = days.length > 0 ? entryData : [0];
      const chartExits = days.length > 0 ? exitData : [0];

      barInstance.current = new Chart(barChartRef.current, {
        type: "bar",
        data: {
          labels: chartLabels,
          datasets: [
            {
              label: "Entradas (R$)",
              data: chartEntries,
              backgroundColor: "rgba(0, 179, 126, 0.75)",
              borderColor: "#00B37E",
              borderWidth: 1.5,
              borderRadius: 4,
            },
            {
              label: "Saídas (R$)",
              data: chartExits,
              backgroundColor: "rgba(247, 90, 104, 0.75)",
              borderColor: "#F75A68",
              borderWidth: 1.5,
              borderRadius: 4,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              labels: {
                boxWidth: 12,
                padding: 15,
                color: "#E1E1E6"
              }
            },
            tooltip: {
              backgroundColor: "#202024",
              titleColor: "#E1E1E6",
              bodyColor: "#E1E1E6",
              borderColor: "#323238",
              borderWidth: 1,
              padding: 10,
              displayColors: true,
              callbacks: {
                label: (context: any) => `R$ ${context.parsed.y.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
              }
            }
          },
          scales: {
            x: {
              grid: {
                color: "rgba(50, 50, 56, 0.3)",
              },
              ticks: {
                color: "#8D8D99"
              }
            },
            y: {
              grid: {
                color: "rgba(50, 50, 56, 0.3)",
              },
              ticks: {
                color: "#8D8D99",
                callback: (value: any) => `R$ ${value}`
              }
            }
          }
        }
      });
    }

    // --- CHART 2: DOUGHNUT - Gastos por Categoria ---
    if (doughnutChartRef.current) {
      if (doughnutInstance.current) doughnutInstance.current.destroy();

      // Aggregate exit values by category
      const categoryAggregates: { [key: string]: number } = {};
      
      transactions
        .filter(t => t.tipo === TransactionType.SAIDA && t.status === TransactionStatus.PAGO)
        .forEach(t => {
          const catName = categoryMap[t.category_id]?.nome || "Outros";
          categoryAggregates[catName] = (categoryAggregates[catName] || 0) + t.valor;
        });

      const catLabels = Object.keys(categoryAggregates);
      const catData = Object.values(categoryAggregates);

      // Pastel color palette optimized for Dark Comfort theme
      const comfortPalette = [
        "#F75A68", // Alerta Carmine
        "#00B37E", // Emerald Accent
        "#FF9F43", // Soft Warm Orange
        "#A855F7", // Purple Lavender
        "#4EA8DE", // Sky Cyan
        "#E2E8F0", // Cool Slate
        "#FDBA74", // Light Orange
        "#F472B6"  // Soft Pink
      ];

      const chartLabels = catLabels.length > 0 ? catLabels : ["Sem despesas"];
      const chartValues = catData.length > 0 ? catData : [100];
      const chartBGColors = catLabels.length > 0 ? comfortPalette.slice(0, catLabels.length) : ["#202024"];

      doughnutInstance.current = new Chart(doughnutChartRef.current, {
        type: "doughnut",
        data: {
          labels: chartLabels,
          datasets: [{
            data: chartValues,
            backgroundColor: chartBGColors,
            borderColor: "#202024",
            borderWidth: 2,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "60%",
          plugins: {
            legend: {
              position: "right",
              labels: {
                boxWidth: 10,
                padding: 12,
                color: "#E1E1E6"
              }
            },
            tooltip: {
              backgroundColor: "#202024",
              titleColor: "#E1E1E6",
              bodyColor: "#E1E1E6",
              borderColor: "#323238",
              borderWidth: 1,
              padding: 10,
              callbacks: {
                label: (context: any) => {
                  const label = context.label || '';
                  const value = context.parsed;
                  if (catData.length === 0) return "Tudo OK";
                  const total = catData.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }

    // Cleanup Chart.js instances on unmount to prevent leaks and canvas reutilization issues
    return () => {
      if (barInstance.current) barInstance.current.destroy();
      if (doughnutInstance.current) doughnutInstance.current.destroy();
    };
  }, [transactions, wallets, categories]);

  // Order transactions: latest first
  const latestTransactions = [...transactions]
    .sort((a, b) => new Date(b.data_transacao).getTime() - new Date(a.data_transacao).getTime())
    .slice(0, 5); // Take top 5

  return (
    <div id="dashboard-view-panel" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#E1E1E6]">Dashboard Central</h1>
          <p className="text-sm text-[#8D8D99] mt-1">Visão geral unificada das suas receitas, despesas e investimentos.</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-[#202024] border border-[#323238] px-3.5 py-2 rounded-lg text-[#8D8D99] font-medium leading-none">
          <Calendar className="w-4 h-4 text-[#00B37E]" />
          <span>Competência Atual:</span>
          <span className="text-[#E1E1E6] font-semibold">Junho / 2026</span>
        </div>
      </div>

      {/* LINHA 1: 4 Cards Resumo */}
      <div id="summary-cards-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card A: Saldo Total */}
        <div id="card-saldo-total" className="bg-[#202024] p-5 rounded-xl border border-[#323238] hover:border-[#323238]/80 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#8D8D99]">Saldo Consolidado</span>
            <div className="p-2 bg-[#121214] text-[#00B37E] rounded-lg group-hover:scale-105 transition-transform border border-[#323238]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-mono tracking-tight text-[#E1E1E6]">
              R$ {totalBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-[#8D8D99] mt-2 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-[#00B37E] animate-pulse"></span>
              Soma de todas as carteiras ativas
            </p>
          </div>
        </div>

        {/* Card B: Entradas */}
        <div id="card-entradas-mes" className="bg-[#202024] p-5 rounded-xl border border-[#323238] hover:border-[#323238]/80 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#8D8D99]">Receitas (Mês)</span>
            <div className="p-2 bg-[#121214] text-[#00B37E] rounded-lg group-hover:scale-105 transition-transform border border-[#323238]">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-mono tracking-tight text-[#00B37E]">
              + R$ {monthlyIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-[#8D8D99] mt-2">
              Lançamentos quitados em junho
            </p>
          </div>
        </div>

        {/* Card C: Saídas */}
        <div id="card-saidas-mes" className="bg-[#202024] p-5 rounded-xl border border-[#323238] hover:border-[#323238]/80 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#8D8D99]">Despesas (Mês)</span>
            <div className="p-2 bg-[#121214] text-[#F75A68] rounded-lg group-hover:scale-105 transition-transform border border-[#323238]">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-mono tracking-tight text-[#F75A68]">
              - R$ {monthlyExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-[#8D8D99] mt-2">
              Débitos validados e pagos
            </p>
          </div>
        </div>

        {/* Card D: Economia / Taxa de Poupança */}
        <div id="card-economia-percent" className="bg-[#202024] p-5 rounded-xl border border-[#323238] hover:border-[#323238]/80 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#8D8D99]">Taxa de Economia</span>
            <div className="p-2 bg-[#121214] text-[#00B37E] rounded-lg group-hover:scale-105 transition-transform border border-[#323238]">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className={`text-2xl font-bold font-mono tracking-tight ${savingRate >= 30 ? "text-[#00B37E]" : "text-[#F75A68]"}`}>
              {savingRate.toFixed(1)}%
            </h3>
            <p className="text-xs mt-2 flex items-center gap-1">
              <span className={`font-semibold ${savingDelta >= 0 ? "text-[#00B37E]" : "text-[#F75A68]"}`}>
                {savingDelta >= 0 ? `+${savingDelta.toFixed(1)}%` : `${savingDelta.toFixed(1)}%`}
              </span>
              <span className="text-[#8D8D99]">vs mês anterior</span>
            </p>
          </div>
        </div>

      </div>

      {/* LINHA 2: Gráficos (Chart.js) */}
      <div id="dashboard-charts-row" className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Gráfico de Barras: Fluxo Diário */}
        <div id="bar-chart-container" className="bg-[#202024] p-5 rounded-xl border border-[#323238] lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between border-b border-[#323238] pb-3">
            <h3 className="font-semibold text-sm uppercase text-[#E1E1E6] tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-[#00B37E] rounded-full inline-block"></span>
              Fluxo Financeiro Diário (Entradas vs Saídas)
            </h3>
            <span className="text-[10px] font-mono text-[#8D8D99]">Chart.js Engine</span>
          </div>
          <div className="relative h-64 md:h-72 w-full">
            <canvas ref={barChartRef}></canvas>
          </div>
        </div>

        {/* Gráfico de Rosca: Gastos por Categoria */}
        <div id="doughnut-chart-container" className="bg-[#202024] p-5 rounded-xl border border-[#323238] lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-[#323238] pb-3">
            <h3 className="font-semibold text-sm uppercase text-[#E1E1E6] tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-[#F75A68] rounded-full inline-block"></span>
              Despesas por Categoria
            </h3>
            <span className="text-[10px] font-mono text-[#8D8D99]">Chart.js Engine</span>
          </div>
          <div className="relative h-64 md:h-72 w-full">
            <canvas ref={doughnutChartRef}></canvas>
          </div>
        </div>

      </div>

      {/* LINHA 3: Últimas Transações */}
      <div id="dashboard-recent-transactions" className="bg-[#202024] rounded-xl border border-[#323238] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#323238] flex items-center justify-between">
          <h2 className="text-md font-semibold text-[#E1E1E6] uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#8D8D99]" />
            Últimas Atividades Financeiras
          </h2>
          <button 
            onClick={() => onNavigateToTab("transactions")}
            className="text-xs text-[#00B37E] hover:text-[#029a6d] font-semibold transition-colors bg-[#121214] px-3 py-1.5 rounded-lg border border-[#323238]"
          >
            Ver Todas
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#323238] bg-[#323238] text-[11px] text-[#A8A8B3] uppercase font-normal tracking-wider select-none">
                <th className="px-6 py-3 font-normal">Data</th>
                <th className="px-6 py-3 font-normal">Descrição</th>
                <th className="px-6 py-3 font-normal">Carteira</th>
                <th className="px-6 py-3 font-normal">Categoria</th>
                <th className="px-6 py-3 font-normal">Status</th>
                <th className="px-6 py-3 text-right font-normal">Valor</th>
                <th className="px-6 py-3 text-center font-normal">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#323238] text-xs text-[#E1E1E6]">
              {latestTransactions.map(t => {
                const w = walletMap[t.wallet_id];
                const c = categoryMap[t.category_id];
                const dateFmt = new Date(t.data_transacao).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit"
                });

                return (
                  <tr key={t.id} className="hover:bg-[#121214]/60 transition-all font-sans">
                    <td className="px-6 py-3.5 font-mono text-xs text-[#A8A8B3]">{dateFmt}</td>
                    <td className="px-6 py-3.5 font-medium text-[#E1E1E6] truncate max-w-xs">{t.descricao}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <WalletIcon className="w-3.5 h-3.5 text-[#A8A8B3]" />
                        <span className="text-[#E1E1E6] font-medium text-xs">{w ? w.instituicao_financeira : "Geral"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-[11px] bg-[#121214] px-2 py-0.5 rounded border border-[#323238] text-[#A8A8B3]">
                        {c ? c.nome : "Desconhecido"}
                      </span>
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
                    <td className="px-6 py-3.5 text-center">
                      {t.status === TransactionStatus.PENDENTE && t.tipo === TransactionType.SAIDA ? (
                        <button 
                          onClick={() => onPayClick(t)}
                          className="pay-btn"
                        >
                          Pagar
                        </button>
                      ) : (
                        <span className="text-xs text-[#A8A8B3] font-mono">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {latestTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-[#A8A8B3]">Nenhuma transação cadastrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

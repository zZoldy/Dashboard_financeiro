/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Transaction } from "../types";
import { X, QrCode, Clipboard, CheckCircle, Smartphone } from "lucide-react";

interface PaymentModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (transactionId: number) => void;
}

export default function PaymentModal({ transaction, isOpen, onClose, onConfirm }: PaymentModalProps) {
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"scan" | "success">("scan");

  if (!isOpen || !transaction) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(transaction.codigo_pagamento || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    setIsProcessing(true);
    // Simulate real transaction processing lag for backend feeling (1.2s)
    setTimeout(() => {
      setIsProcessing(false);
      onConfirm(transaction.id);
      setStep("success");
    }, 1200);
  };

  const handleFinish = () => {
    setStep("scan");
    onClose();
  };

  return (
    <div id="payment-modal-container" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        id="payment-modal-card" 
        className="w-full max-w-md bg-[#202024] rounded-xl border border-[#323238] shadow-2xl overflow-hidden transition-all duration-300 transform scale-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#323238]">
          <h2 className="text-lg font-semibold text-[#E1E1E6] flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#00B37E]" />
            Leitor de Pagamentos
          </h2>
          <button 
            onClick={onClose}
            className="text-[#8D8D99] hover:text-[#E1E1E6] transition-colors p-1 hover:bg-[#323238] rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === "scan" ? (
          <div className="p-6 space-y-5">
            {/* Summary details */}
            <div className="bg-[#121214] p-4 rounded-lg border border-[#323238] space-y-2">
              <span className="text-[10px] font-mono uppercase text-[#8D8D99] tracking-wider">
                Resumo do Lançamento
              </span>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-[#E1E1E6] text-sm leading-tight">
                    {transaction.descricao}
                  </h3>
                  <p className="text-xs text-[#8D8D99] mt-1">
                    Método original: <span className="text-[#E1E1E6] font-mono">{transaction.metodo_pagamento}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[#F75A68] font-bold text-base block">
                    - R$ {transaction.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Scanner HUD */}
            <div className="relative aspect-video w-full bg-[#121214] rounded-lg border border-[#323238] flex flex-col items-center justify-center overflow-hidden">
              {/* Scan box simulation */}
              <div className="absolute inset-4 rounded border-2 border-[#00B37E]/40 flex items-center justify-center">
                {/* HUD markings */}
                <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00B37E]"></span>
                <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00B37E]"></span>
                <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00B37E]"></span>
                <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00B37E]"></span>
                
                {/* Horizontal scan line */}
                <div className="w-full h-0.5 bg-[#00B37E] shadow-[0_0_10px_#00B37E] absolute animate-bounce top-1/2"></div>
                
                <QrCode className="w-12 h-12 text-[#8D8D99] opacity-40 animate-pulse" />
              </div>
              <span className="text-[10px] font-mono text-[#00B37E] z-10 bg-[#121214] px-2 py-0.5 rounded-full border border-[#00B37E]/20 animate-pulse mt-12">
                Simulando Leitura de Linha Digitável...
              </span>
            </div>

            {/* Digital Code Line Info */}
            <div className="space-y-1">
              <label className="text-xs text-[#8D8D99] flex justify-between items-center">
                <span>Código para pagamento (PIX / Boleto)</span>
                {copied && <span className="text-[#00B37E] text-[10px] font-medium">Copiado!</span>}
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={transaction.codigo_pagamento || ""} 
                  className="w-full bg-[#121214] text-[#E1E1E6] font-mono text-xs p-2.5 rounded border border-[#323238] focus:outline-none focus:border-[#00B37E]"
                />
                <button 
                  onClick={handleCopy}
                  title="Copiar código"
                  className="px-3 bg-[#323238] hover:bg-[#4d4d57] text-[#E1E1E6] rounded border border-[#323238] transition-colors flex items-center justify-center"
                >
                  <Clipboard className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Warning Message */}
            <p className="text-xs text-[#8D8D99] leading-relaxed">
              O saldo correspondente será debitado da carteira vinculada a esta despesa assim que o pagamento for liquidado pelo processador.
            </p>

            {/* Actions */}
            <div className="pt-2 flex gap-3">
              <button 
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 py-2.5 px-4 bg-transparent hover:bg-[#323238] border border-[#323238] text-[#8D8D99] hover:text-[#E1E1E6] font-medium text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirm}
                disabled={isProcessing}
                className="flex-1 py-2.5 px-4 bg-[#00B37E] hover:bg-[#029a6d] text-white font-medium text-sm rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 border border-[#00B37E] disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>Confirmar Pagamento</>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 flex flex-col items-center text-center space-y-5">
            <div className="w-16 h-16 bg-[#00B37E]/20 text-[#00B37E] rounded-full flex items-center justify-center border border-[#00B37E]/30 animate-pulse">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#E1E1E6]">
                Pagamento Autorizado!
              </h3>
              <p className="text-sm text-[#8D8D99] mt-2 max-w-xs mx-auto">
                A transação <strong>{transaction.descricao}</strong> foi quitada com sucesso e integrada ao saldo da sua carteira.
              </p>
            </div>
            
            <div className="w-full bg-[#121214] p-3.5 rounded border border-[#323238] text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#8D8D99]">Comprovante Autenticado</span>
                <span className="font-mono text-[#00B37E] font-medium uppercase">SUCESSO_API</span>
              </div>
              <div className="mt-2 pt-2 border-t border-[#323238] flex justify-between items-center">
                <span className="text-[11px] text-[#8D8D99] font-mono">ID: {transaction.id * 187}</span>
                <span className="text-sm font-mono text-[#E1E1E6] font-semibold">
                  R$ {transaction.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button 
              onClick={handleFinish}
              className="w-full py-2.5 bg-[#323238] hover:bg-[#4dd4a5]/10 hover:text-[#00B37E] border border-[#323238] text-[#E1E1E6] font-medium text-sm rounded-lg transition-all"
            >
              Fechar Leitor
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { Mail, Lock, Sparkles, User, CheckCircle2, AlertCircle } from "lucide-react";

interface LoginViewProps {
  onLoginSuccess: (token: string, userData: any) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  // Simple view switcher: login or register
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form states
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Configurable dynamic backend URL (Defaults to localhost:8080)
  const API_AUTH_URL = "http://localhost:8080/api/auth";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!email || !senha || (isRegisterMode && !nome)) {
      setErrorMsg("Por favor, preencha todos os campos obrigatórios.");
      setIsLoading(false);
      return;
    }

    try {
      if (isRegisterMode) {
        // REGISTER FLOW
        const response = await fetch(`${API_AUTH_URL}/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nome, email, senha }),
        });

        if (!response.ok) {
          const errMsg = await response.text();
          throw new Error(errMsg || "Falha no cadastro. Verifique os dados inseridos.");
        }

        setSuccessMsg("Conta criada com sucesso! Faça login para continuar.");
        setIsRegisterMode(false);
        setSenha(""); // Clear password field for login
      } else {
        // LOGIN FLOW
        const response = await fetch(`${API_AUTH_URL}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, senha }),
        });

        if (!response.ok) {
          const errMsg = await response.text();
          throw new Error(errMsg || "E-mail ou senha incorretos.");
        }

        const data = await response.json(); // returns { token, id, nome, email }
        
        // Save to LocalStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_id", data.id.toString());
        localStorage.setItem("user_nome", data.nome);
        localStorage.setItem("user_email", data.email);

        // Notify App parent state
        onLoginSuccess(data.token, {
          id: data.id,
          nome: data.nome,
          email: data.email,
        });
      }
    } catch (err: any) {
      console.error("[AUTH ERROR]", err);
      setErrorMsg(err.message || "Não foi possível conectar ao servidor. O back-end Java está rodando?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="login-viewport" className="min-h-screen bg-[#121214] flex items-center justify-center p-4">
      <div 
        id="login-card" 
        className="w-full max-w-md bg-[#202024] border border-[#323238] rounded-2xl p-8 shadow-2xl space-y-6 transition-all"
      >
        {/* Visual Identity Logo Header */}
        <div className="flex flex-col items-center space-y-2 text-center select-none">
          <div className="w-12 h-12 bg-[#00B37E] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,179,126,0.3)]">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#E1E1E6]" id="login-brand-title">
            {isRegisterMode ? "Criar sua Conta" : "Entrar no FinTrack"}
          </h1>
          <p className="text-xs text-[#8D8D99]">
            {isRegisterMode 
              ? "Pronto para mapear e impulsionar sua saúde financeira?" 
              : "Autenticação e segurança de grau sênior via JWT"
            }
          </p>
        </div>

        {/* Action Alerts */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3.5 bg-[#F75A68]/10 border border-[#F75A68]/20 rounded-lg text-xs text-[#F75A68] animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-start gap-2.5 p-3.5 bg-[#00B37E]/10 border border-[#00B37E]/20 rounded-lg text-xs text-[#00B37E] animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Input Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegisterMode && (
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#A8A8B3] font-semibold font-mono">
                Seu Nome
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-[#8D8D99]" />
                <input 
                  type="text"
                  required
                  placeholder="Ex: Filipe Pinheiro"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-[#121214] border border-[#323238] rounded-lg pl-10 pr-4 py-2.5 text-xs text-[#E1E1E6] placeholder-[#8D8D99] focus:outline-none focus:border-[#00B37E] transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider text-[#A8A8B3] font-semibold font-mono">
              Endereço de E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-[#8D8D99]" />
              <input 
                type="email"
                required
                placeholder="Ex: root@fintrack.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#121214] border border-[#323238] rounded-lg pl-10 pr-4 py-2.5 text-xs text-[#E1E1E6] placeholder-[#8D8D99] focus:outline-none focus:border-[#00B37E] transition-all font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] uppercase tracking-wider text-[#A8A8B3] font-semibold font-mono">
              <span>Senha</span>
              {!isRegisterMode && (
                <span className="text-[10px] text-[#8D8D99] lowercase font-normal italic select-none">
                  padrão: admin123
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-[#8D8D99]" />
              <input 
                type="password"
                required
                placeholder="Preencha sua senha segura"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full bg-[#121214] border border-[#323238] rounded-lg pl-10 pr-4 py-2.5 text-xs text-[#E1E1E6] placeholder-[#8D8D99] focus:outline-none focus:border-[#00B37E] transition-all"
              />
            </div>
          </div>

          {/* Action Submit Button */}
          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg bg-[#00B37E] hover:bg-[#009e6f] font-semibold text-xs text-white uppercase tracking-wider transition-all shadow-md select-none ${
              isLoading ? "opacity-50 cursor-not-allowed animate-pulse" : "cursor-pointer"
            }`}
          >
            {isLoading ? "Processando..." : isRegisterMode ? "Cadastrar Conta" : "Iniciar Sessão"}
          </button>
        </form>

        {/* Switch Register/Login Mode Button */}
        <div className="text-center pt-2">
          <button
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className="text-xs text-[#00B37E] hover:underline cursor-pointer select-none"
          >
            {isRegisterMode 
              ? "Já possui cadastro? Faça o Login" 
              : "Deseja criar uma nova conta? Registre-se aqui"
            }
          </button>
        </div>
      </div>
    </div>
  );
}

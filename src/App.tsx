/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  User, 
  Wallet, 
  Category, 
  Transaction, 
  Subscription, 
  TransactionStatus 
} from "./types";
import { 
  apiService, 
  initializeStorage 
} from "./dbMock";
import LoginView from "./components/LoginView";
import DashboardView from "./components/DashboardView";
import WalletsView from "./components/WalletsView";
import TransactionsView from "./components/TransactionsView";
import SubscriptionsView from "./components/SubscriptionsView";
import PaymentModal from "./components/PaymentModal";
import { 
  LayoutDashboard, 
  Wallet as WalletIcon, 
  Receipt, 
  Calendar, 
  Wifi, 
  WifiOff, 
  LogOut, 
  RotateCcw,
  Sparkles,
  User as UserIcon,
  Menu,
  X
} from "lucide-react";

export default function App() {
  // Authentication State
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  // Mobile drawer states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Connection Simulator States
  const [serverConnected, setServerConnected] = useState(true);

  // Active view tab state (dashboard | wallets | transactions | subscriptions)
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Core domain records loaded from persistent local ledger state
  const [user, setUser] = useState<User | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  // Selected bill to pay via PIX/Boleto simulation modal
  const [selectedTransactionToPay, setSelectedTransactionToPay] = useState<Transaction | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Bootstrapping storage state
  useEffect(() => {
    initializeStorage();
    if (token) {
      setServerConnected(apiService.isServerConnected());
      loadAllRecords();
    }
  }, [token]);

  const loadAllRecords = async () => {
    if (!token) return;
    const loadedUser = await apiService.getUser();
    const loadedWallets = await apiService.getWallets();
    const loadedCategories = await apiService.getCategories();
    const loadedTransactions = await apiService.getTransactions();
    const loadedSubscriptions = await apiService.getSubscriptions();

    setUser(loadedUser);
    setWallets(loadedWallets);
    setCategories(loadedCategories);
    setTransactions(loadedTransactions);
    setSubscriptions(loadedSubscriptions);
  };

  // 1. Connection simulation handler
  const handleToggleConnection = () => {
    const nextConnectedState = apiService.toggleServerConnection();
    setServerConnected(nextConnectedState);
  };

  // 2. Add New Wallet Action
  const handleAddWallet = async (newVal: Omit<Wallet, "id">) => {
    await apiService.saveWallet(newVal as Wallet);
    await loadAllRecords();
  };

  // 3. Add New Transaction Action
  const handleAddTransaction = async (newVal: Omit<Transaction, "id">) => {
    await apiService.saveTransaction(newVal as Transaction);
    await loadAllRecords();
  };

  // 4. Delete Transaction Action
  const handleDeleteTransaction = async (id: number) => {
    await apiService.deleteTransaction(id);
    await loadAllRecords();
  };

  // 5. Click "Pagar Conta" trigger handler
  const handlePayClick = (t: Transaction) => {
    setSelectedTransactionToPay(t);
    setIsPaymentModalOpen(true);
  };

  // 6. Confirm payment and transition state from PENDENTE -> PAGO
  const handleConfirmPayment = async (id: number) => {
    await apiService.payTransaction(id);
    await loadAllRecords(); // Triggers atomic dashboard balances recalculations and Chart.js animations updates!
  };

  // 7. Add New Subscription Plan Action
  const handleAddSubscription = async (newVal: Omit<Subscription, "id">) => {
    await apiService.saveSubscription(newVal as Subscription);
    await loadAllRecords();
  };

  // 8. Toggle Subscription active/inactive
  const handleToggleSubscriptionActive = async (id: number) => {
    await apiService.toggleSubscriptionActive(id);
    await loadAllRecords();
  };

  // 9. Delete Subscription Action
  const handleDeleteSubscription = async (id: number) => {
    await apiService.deleteSubscription(id);
    await loadAllRecords();
  };

  // 10. Logoff / Reset storage to simulate clean boot login
  const handleLogoff = () => {
    if (confirm("Deseja simular o Logoff da plataforma? Isso reiniciará o token local de sessão.")) {
      localStorage.clear();
      setToken(null);
      setUser(null);
      setWallets([]);
      setTransactions([]);
      setSubscriptions([]);
      setActiveTab("dashboard");
    }
  };

  // 11. Full Ledger Reset (Auxiliary development button)
  const handleResetData = () => {
    if (confirm("Deseja deslogar para testar com outro usuário?")) {
      localStorage.clear();
      setToken(null);
      setUser(null);
      setWallets([]);
      setTransactions([]);
      setSubscriptions([]);
      setActiveTab("dashboard");
    }
  };

  return (
    <>
      {!token ? (
        <LoginView 
          onLoginSuccess={(newToken, userData) => {
            setToken(newToken);
            setUser(userData);
          }} 
        />
      ) : (
        <div id="app-layout" className="min-h-screen bg-[#121214] text-[#E1E1E6] flex">
          
          {/* SIDEBAR: Menu Lateral Fixo (Desktop) */}
          <aside 
            id="sidebar-desktop" 
            className="hidden md:flex flex-col w-[220px] bg-[#202024] border-r border-[#323238] h-screen sticky top-0 flex-shrink-0"
          >
            {/* Logo/Identity Branding */}
            <div className="p-6 flex items-center gap-2 logo">
              <div className="w-6 h-6 bg-[#00B37E] rounded flex-shrink-0" />
              <h1 className="font-bold text-xl tracking-tight text-[#E1E1E6]">FinTrack</h1>
            </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-all text-left cursor-pointer ${
              activeTab === "dashboard" 
                ? "bg-[#323238] text-[#E1E1E6]" 
                : "text-[#A8A8B3] hover:text-[#E1E1E6] hover:bg-[#323238]/40"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
            Dashboard
          </button>
          
          <button 
            onClick={() => setActiveTab("wallets")}
            className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-all text-left cursor-pointer ${
              activeTab === "wallets" 
                ? "bg-[#323238] text-[#E1E1E6]" 
                : "text-[#A8A8B3] hover:text-[#E1E1E6] hover:bg-[#323238]/40"
            }`}
          >
            <WalletIcon className="w-4 h-4 flex-shrink-0" />
            Carteiras
          </button>

          <button 
            onClick={() => setActiveTab("transactions")}
            className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-all text-left cursor-pointer ${
              activeTab === "transactions" 
                ? "bg-[#323238] text-[#E1E1E6]" 
                : "text-[#A8A8B3] hover:text-[#E1E1E6] hover:bg-[#323238]/40"
            }`}
          >
            <Receipt className="w-4 h-4 flex-shrink-0" />
            Transações
          </button>

          <button 
            onClick={() => setActiveTab("subscriptions")}
            className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-all text-left cursor-pointer ${
              activeTab === "subscriptions" 
                ? "bg-[#323238] text-[#E1E1E6]" 
                : "text-[#A8A8B3] hover:text-[#E1E1E6] hover:bg-[#323238]/40"
            }`}
          >
            <Calendar className="w-4 h-4 flex-shrink-0" />
            Assinaturas
          </button>
        </nav>

        {/* Sidebar developer footer */}
        <div className="p-4 border-t border-[#323238] space-y-2">
          <button 
            onClick={handleResetData}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-[10px] font-semibold text-[#8D8D99] hover:text-[#E1E1E6] bg-[#121214] border border-[#323238] rounded-md transition-colors font-mono"
            title="Resetar todos os mocks para padrões originais"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESTAURAR BANCO MOCK
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER: Sidebar Menu (Mobile only) */}
      {mobileMenuOpen && (
        <div id="mobile-overlay" className="fixed inset-0 z-40 flex md:hidden bg-black/80 backdrop-blur-sm">
          <div className="w-64 bg-[#202024] border-r border-[#323238] h-full flex flex-col p-5 space-y-6 relative">
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 text-[#8D8D99] hover:text-[#E1E1E6]"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-3 pt-6 pb-2 border-b border-[#323238]">
              <Sparkles className="w-5 h-5 text-[#00B37E]" />
              <h2 className="font-bold text-sm text-[#E1E1E6]">Finance Controller</h2>
            </div>

            <nav className="flex-1 space-y-2">
              <button 
                onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-lg text-left ${
                  activeTab === "dashboard" ? "bg-[#00B37E] text-white" : "text-[#8D8D99]"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button 
                onClick={() => { setActiveTab("wallets"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-lg text-left ${
                  activeTab === "wallets" ? "bg-[#00B37E] text-white" : "text-[#8D8D99]"
                }`}
              >
                <WalletIcon className="w-4 h-4" />
                Carteiras
              </button>
              <button 
                onClick={() => { setActiveTab("transactions"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-lg text-left ${
                  activeTab === "transactions" ? "bg-[#00B37E] text-white" : "text-[#8D8D99]"
                }`}
              >
                <Receipt className="w-4 h-4" />
                Transações
              </button>
              <button 
                onClick={() => { setActiveTab("subscriptions"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-lg text-left ${
                  activeTab === "subscriptions" ? "bg-[#00B37E] text-white" : "text-[#8D8D99]"
                }`}
              >
                <Calendar className="w-4 h-4" />
                Assinaturas
              </button>
            </nav>

            <button 
              onClick={() => { handleLogoff(); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#F75A68]/15 border border-[#F75A68]/25 text-[#F75A68] text-xs font-semibold rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              Sair da Conta
            </button>
          </div>
        </div>
      )}

      {/* MAIN VIEWPORT WRAPPER */}
      <div id="content-container" className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* HEADER / CABEÇALHO */}
        <header className="sticky top-0 z-30 bg-[#202024]/90 backdrop-blur-md border-b border-[#323238] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger toggle */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-[#8D8D99] hover:text-[#E1E1E6]"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Connection Status Indicator */}
            <div 
              onClick={handleToggleConnection}
              title="Clique para simular desconexão / teste de redundância com API"
              className="flex items-center gap-2 px-3 py-1.5 cursor-pointer select-none text-xs"
            >
              {serverConnected ? (
                <>
                  <div className="status-dot-green"></div>
                  <span className="text-xs text-[#A8A8B3] ml-1">Servidor Conectado</span>
                </>
              ) : (
                <>
                  <div className="status-dot-red"></div>
                  <span className="text-xs text-[#A8A8B3] ml-1">Comportamento Offline</span>
                </>
              )}
            </div>
          </div>

          {/* User profile actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#323238] border border-[#00B37E]/30 flex items-center justify-center text-[#00B37E]">
                <UserIcon className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-[#E1E1E6] hidden sm:inline">
                {user ? user.nome : "Filipe Pinheiro"}
              </span>
            </div>
            
            <button 
              onClick={handleLogoff}
              title="Simular Sair / Troca de Sessão"
              className="p-2 text-[#8D8D99] hover:text-[#F75A68] hover:bg-[#323238]/40 border border-transparent hover:border-[#323238] rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* CONTAINER DE CONTEÚDO DA SPA ATIVA */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === "dashboard" && (
            <DashboardView 
              transactions={transactions}
              wallets={wallets}
              categories={categories}
              onPayClick={handlePayClick}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === "wallets" && (
            <WalletsView 
              wallets={wallets}
              onAddWallet={handleAddWallet}
            />
          )}

          {activeTab === "transactions" && (
            <TransactionsView 
              transactions={transactions}
              wallets={wallets}
              categories={categories}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onPayClick={handlePayClick}
            />
          )}

          {activeTab === "subscriptions" && (
            <SubscriptionsView 
              subscriptions={subscriptions}
              wallets={wallets}
              categories={categories}
              onAddSubscription={handleAddSubscription}
              onToggleActive={handleToggleSubscriptionActive}
              onDeleteSubscription={handleDeleteSubscription}
            />
          )}
        </main>
      </div>

      {/* RE-USABLE PAYMENT SIMULATOR MODAL */}
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedTransactionToPay(null);
        }}
        transaction={selectedTransactionToPay}
        onConfirm={handleConfirmPayment}
      />

        </div>
      )}
    </>
  );
}

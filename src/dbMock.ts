/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  User, 
  Wallet, 
  Category, 
  Transaction, 
  Subscription 
} from "./types";

// Base API URL for Java Spring Boot server
const API_BASE_URL = "http://localhost:8080/api";

// Helper function to build headers with Authorization JWT bearer
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : ""
  };
}

/**
 * No-op function to maintain import compatibility in App.tsx.
 * The application now relies on a durable Java persistence layer.
 */
export function initializeStorage() {
  console.log("[FinTrack] Conexão ativa com o back-end Java Spring Boot.");
}

export const apiService = {
  // Connection Status (Status de Conexão do Servidor)
  isServerConnected(): boolean {
    const token = localStorage.getItem("token");
    return token !== null; // Active authentication represents healthy state
  },
  
  toggleServerConnection(): boolean {
    // No-op simulator trigger
    return this.isServerConnected();
  },

  // 1. User details sourced from authenticated session profile
  async getUser(): Promise<User> {
    const email = localStorage.getItem("user_email") || "root@fintrack.com";
    const nome = localStorage.getItem("user_nome") || "Usuário Root";
    const idStr = localStorage.getItem("user_id") || "1";

    return {
      id: parseInt(idStr, 10),
      nome,
      email,
      data_criacao: new Date().toISOString()
    };
  },

  // 2. Wallets GET, POST, PUT, DELETE
  async getWallets(): Promise<Wallet[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/wallets`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error("Erro ao buscar carteiras.");
      return await response.json();
    } catch (error) {
      console.error("[getWallets error]", error);
      return [];
    }
  },

  async saveWallet(wallet: Wallet): Promise<Wallet> {
    try {
      const isEdit = wallet.id !== undefined && wallet.id > 0;
      const url = isEdit ? `${API_BASE_URL}/wallets/${wallet.id}` : `${API_BASE_URL}/wallets`;
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(wallet)
      });

      if (!response.ok) throw new Error("Falha ao salvar carteira.");
      return await response.json();
    } catch (error) {
      console.error("[saveWallet error]", error);
      throw error;
    }
  },

  // 3. Categories GET
  async getCategories(): Promise<Category[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error("Erro ao buscar categorias.");
      return await response.json();
    } catch (error) {
      console.error("[getCategories error]", error);
      return [];
    }
  },

  // 4. Transactions GET, POST, PUT, DELETE
  async getTransactions(): Promise<Transaction[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error("Erro ao buscar transações.");
      return await response.json();
    } catch (error) {
      console.error("[getTransactions error]", error);
      return [];
    }
  },

  async saveTransaction(transaction: Transaction): Promise<Transaction> {
    try {
      const isEdit = transaction.id !== undefined && transaction.id > 0;
      const url = isEdit ? `${API_BASE_URL}/transactions/${transaction.id}` : `${API_BASE_URL}/transactions`;
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(transaction)
      });

      if (!response.ok) throw new Error("Falha ao salvar transação.");
      return await response.json();
    } catch (error) {
      console.error("[saveTransaction error]", error);
      throw error;
    }
  },

  async payTransaction(id: number): Promise<Transaction | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${id}/pay`, {
        method: "PUT",
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error("Erro ao consolidar pagamento.");
      return await response.json();
    } catch (error) {
      console.error("[payTransaction error]", error);
      return null;
    }
  },

  async deleteTransaction(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error("Erro ao apagar transação.");
    } catch (error) {
      console.error("[deleteTransaction error]", error);
      throw error;
    }
  },

  // 5. Subscriptions GET, POST, PUT, DELETE
  async getSubscriptions(): Promise<Subscription[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error("Erro ao buscar assinaturas.");
      return await response.json();
    } catch (error) {
      console.error("[getSubscriptions error]", error);
      return [];
    }
  },

  async saveSubscription(subscription: Subscription): Promise<Subscription> {
    try {
      const isEdit = subscription.id !== undefined && subscription.id > 0;
      const url = isEdit ? `${API_BASE_URL}/subscriptions/${subscription.id}` : `${API_BASE_URL}/subscriptions`;
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(subscription)
      });

      if (!response.ok) throw new Error("Falha ao salvar assinatura.");
      return await response.json();
    } catch (error) {
      console.error("[saveSubscription error]", error);
      throw error;
    }
  },

  async toggleSubscriptionActive(id: number): Promise<Subscription | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/${id}/toggle`, {
        method: "PUT",
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error("Erro ao alternar assinatura.");
      return await response.json();
    } catch (error) {
      console.error("[toggleSubscriptionActive error]", error);
      return null;
    }
  },

  async deleteSubscription(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error("Erro ao apagar assinatura.");
    } catch (error) {
      console.error("[deleteSubscription error]", error);
      throw error;
    }
  }
};

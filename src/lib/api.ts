const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  createdAt?: string;
}

export interface Payment {
  _id: string;
  amount: number;
  date: string;
  note?: string;
  recordedAt: string;
}

export interface Transaction {
  _id: string;
  userId: string;
  contactName: string;
  contactPhone?: string;
  type: 'LENT' | 'BORROWED'; // LENT = You'll Get (Ami Pai), BORROWED = You'll Give (Amr Kache Pai)
  totalAmount: number;
  remainingAmount: number;
  status: 'PENDING' | 'PARTIAL' | 'SETTLED';
  category: string;
  dueDate?: string;
  notes?: string;
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  summary: {
    lent: {
      totalOriginal: number;
      totalPending: number;
      totalCollected: number;
      count: number;
      settledCount: number;
    };
    borrowed: {
      totalOriginal: number;
      totalPending: number;
      totalRepaid: number;
      count: number;
      settledCount: number;
    };
    netBalance: number;
    totalTransactions: number;
    totalSettled: number;
    totalActive: number;
  };
  alerts: {
    overdueCount: number;
    overdueList: Transaction[];
    upcomingCount: number;
    upcomingList: Transaction[];
  };
  topDebtors: Array<{ name: string; amount: number; phone?: string; count: number }>;
  topCreditors: Array<{ name: string; amount: number; phone?: string; count: number }>;
  recentTransactions: Transaction[];
}

export interface ContactSummary {
  name: string;
  phone: string;
  totalLent: number;
  pendingLent: number;
  totalBorrowed: number;
  pendingBorrowed: number;
  netBalance: number;
  statusLabel: string;
  transactionCount: number;
  settledCount: number;
  lastActivity: string;
}

class ApiService {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  }

  // Auth
  async register(payload: { name: string; email: string; password: string; currency?: string }) {
    return this.request<{ success: boolean; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async login(payload: { email: string; password: string }) {
    return this.request<{ success: boolean; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getMe() {
    return this.request<{ success: boolean; user: User }>('/auth/me');
  }

  async updateProfile(payload: { name?: string; currency?: string }) {
    return this.request<{ success: boolean; user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // Dashboard
  async getDashboardSummary() {
    return this.request<{ success: boolean; data: DashboardSummary }>('/dashboard/summary');
  }

  // Contacts
  async getContactsSummary() {
    return this.request<{ success: boolean; data: ContactSummary[] }>('/contacts');
  }

  // Transactions
  async getTransactions(params?: {
    type?: string;
    status?: string;
    category?: string;
    contactName?: string;
    search?: string;
    sortBy?: string;
    order?: string;
  }) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val && val !== 'ALL') query.append(key, val);
      });
    }
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ success: boolean; count: number; data: Transaction[] }>(
      `/transactions${qs}`
    );
  }

  async getTransaction(id: string) {
    return this.request<{ success: boolean; data: Transaction }>(`/transactions/${id}`);
  }

  async createTransaction(payload: {
    contactName: string;
    contactPhone?: string;
    type: 'LENT' | 'BORROWED';
    totalAmount: number;
    dueDate?: string;
    category?: string;
    notes?: string;
    initialPayment?: number;
  }) {
    return this.request<{ success: boolean; message: string; data: Transaction }>(
      '/transactions',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  }

  async updateTransaction(id: string, payload: Partial<Transaction>) {
    return this.request<{ success: boolean; message: string; data: Transaction }>(
      `/transactions/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );
  }

  async deleteTransaction(id: string) {
    return this.request<{ success: boolean; message: string }>(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  async addPayment(id: string, payload: { amount: number; date?: string; note?: string }) {
    return this.request<{ success: boolean; message: string; data: Transaction }>(
      `/transactions/${id}/payments`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  }

  async deletePayment(id: string, paymentId: string) {
    return this.request<{ success: boolean; message: string; data: Transaction }>(
      `/transactions/${id}/payments/${paymentId}`,
      {
        method: 'DELETE',
      }
    );
  }

  async settleInFull(id: string, note?: string) {
    return this.request<{ success: boolean; message: string; data: Transaction }>(
      `/transactions/${id}/settle`,
      {
        method: 'POST',
        body: JSON.stringify({ note }),
      }
    );
  }
}

export const api = new ApiService();

const API_BASE = "/api";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export interface ApiCustomer {
  id: number;
  name: string;
  phone: string;
  national_id: string;
  address: string;
  type: "customer" | "guarantor";
  created_at: string;
}

export interface ApiContract {
  id: number;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  product_type: string;
  product_id: number | null;
  total_price: number;
  down_payment: number;
  number_of_receipts: number;
  installment_amount: number;
  start_date: string;
  end_date: string;
  status: "active" | "completed" | "defaulted";
  guarantor_name: string;
  guarantor_phone: string;
  created_at: string;
}

export interface ApiInstallment {
  id: number;
  contract_id: number;
  number: number;
  amount: number;
  due_date: string;
  is_paid: number;
  paid_date: string | null;
  day: number;
  month: number;
  year: number;
}

export interface ApiProduct {
  id: number;
  name: string;
  category: string;
  unit: string;
  cost_price: number;
  selling_price: number;
  current_stock: number;
  min_stock: number;
  created_at: string;
}

export interface ApiInventoryTransaction {
  id: number;
  product_id: number;
  product_name?: string;
  type: string;
  quantity: number;
  unit_price: number;
  total: number;
  date: string;
  reference: string;
  notes: string;
  created_at: string;
}

export interface ApiExpenseCategory {
  id: number;
  name: string;
  color: string;
}

export interface ApiExpense {
  id: number;
  description: string;
  category_id: number;
  category_name?: string;
  category_color?: string;
  amount: number;
  date: string;
  note: string;
  receipt_image: string | null;
  created_at: string;
}

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export const api = {
  customers: {
    list: (search?: string, type?: string) => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (type) params.set("type", type);
      return fetchJson<ApiCustomer[]>(`/customers?${params}`);
    },
    get: (id: number) => fetchJson<ApiCustomer>(`/customers/${id}`),
    create: (data: { name: string; phone: string; nationalId?: string; address?: string; type?: string }) =>
      fetchJson<ApiCustomer>("/customers", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) =>
      fetchJson<ApiCustomer>(`/customers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) =>
      fetchJson<{ success: boolean }>(`/customers/${id}`, { method: "DELETE" }),
  },

  contracts: {
    list: (search?: string, status?: string) => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      return fetchJson<ApiContract[]>(`/contracts?${params}`);
    },
    get: (id: number) => fetchJson<ApiContract>(`/contracts/${id}`),
    create: (data: any) =>
      fetchJson<ApiContract>("/contracts", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) =>
      fetchJson<ApiContract>(`/contracts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) =>
      fetchJson<{ success: boolean }>(`/contracts/${id}`, { method: "DELETE" }),
  },

  installments: {
    list: (contractId?: number, isPaid?: boolean) => {
      const params = new URLSearchParams();
      if (contractId) params.set("contractId", contractId.toString());
      if (isPaid !== undefined) params.set("isPaid", isPaid.toString());
      return fetchJson<ApiInstallment[]>(`/installments?${params}`);
    },
    get: (id: number) => fetchJson<ApiInstallment>(`/installments/${id}`),
    create: (data: any) =>
      fetchJson<ApiInstallment>("/installments", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: { isPaid: boolean; paidDate?: string }) =>
      fetchJson<ApiInstallment>(`/installments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) =>
      fetchJson<{ success: boolean }>(`/installments/${id}`, { method: "DELETE" }),
  },

  products: {
    list: (search?: string) => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      return fetchJson<ApiProduct[]>(`/products?${params}`);
    },
    create: (data: any) =>
      fetchJson<ApiProduct>("/products", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) =>
      fetchJson<ApiProduct>(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) =>
      fetchJson<{ success: boolean }>(`/products/${id}`, { method: "DELETE" }),
  },

  inventory: {
    list: (search?: string, type?: string) => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (type) params.set("type", type);
      return fetchJson<ApiInventoryTransaction[]>(`/inventory?${params}`);
    },
    create: (data: any) =>
      fetchJson<ApiInventoryTransaction>("/inventory", { method: "POST", body: JSON.stringify(data) }),
  },

  expenseCategories: {
    list: () => fetchJson<ApiExpenseCategory[]>("/expense-categories"),
  },

  expenses: {
    list: (search?: string, categoryId?: number) => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryId) params.set("categoryId", categoryId.toString());
      return fetchJson<ApiExpense[]>(`/expenses?${params}`);
    },
    create: (data: any) =>
      fetchJson<ApiExpense>("/expenses", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) =>
      fetchJson<ApiExpense>(`/expenses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) =>
      fetchJson<{ success: boolean }>(`/expenses/${id}`, { method: "DELETE" }),
  },

  users: {
    list: () => fetchJson<ApiUser[]>("/users"),
    login: (email: string, password: string) =>
      fetchJson<ApiUser>("/users/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    create: (data: any) =>
      fetchJson<ApiUser>("/users", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) =>
      fetchJson<ApiUser>(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    changePassword: (id: number, currentPassword: string, newPassword: string) =>
      fetchJson<{ success: boolean }>(`/users/${id}/password`, { method: "PUT", body: JSON.stringify({ currentPassword, newPassword }) }),
    delete: (id: number) =>
      fetchJson<{ success: boolean }>(`/users/${id}`, { method: "DELETE" }),
  },

  settings: {
    get: (key: string) => fetchJson<any>(`/settings/${key}`),
    set: (key: string, value: any) =>
      fetchJson<{ success: boolean }>(`/settings/${key}`, { method: "PUT", body: JSON.stringify(value) }),
  },
};
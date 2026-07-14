const API_BASE = "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ id: number; name: string; email: string; role: string; avatar?: string }>(
      "/users/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    ),

  // Nested API (backward compat for .list(), .create(), .update(), .delete())
  customers: {
    list: (search?: string) => request<any[]>("/customers" + (search ? `?search=${search}` : "")),
    get: (id: number) => request<any>(`/customers/${id}`),
    create: (data: any) => request<any>("/customers", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/customers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<{ success: boolean }>(`/customers/${id}`, { method: "DELETE" }),
  },
  contracts: {
    list: (search?: string) => request<any[]>("/contracts" + (search ? `?search=${search}` : "")),
    get: (id: number) => request<any>(`/contracts/${id}`),
    create: (data: any) => request<any>("/contracts", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/contracts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<{ success: boolean }>(`/contracts/${id}`, { method: "DELETE" }),
  },
  installments: {
    list: () => request<any[]>("/installments"),
    update: (id: number, data: any) => request<any>(`/installments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<{ success: boolean }>(`/installments/${id}`, { method: "DELETE" }),
  },
  products: {
    list: (search?: string) => request<any[]>("/products" + (search ? `?search=${search}` : "")),
    create: (data: any) => request<any>("/products", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<{ success: boolean }>(`/products/${id}`, { method: "DELETE" }),
  },
  inventory: {
    list: () => request<any[]>("/inventory"),
    create: (data: any) => request<any>("/inventory", { method: "POST", body: JSON.stringify(data) }),
  },
  expenses: {
    list: (search?: string, categoryId?: number) => {
      const q = new URLSearchParams();
      if (search) q.set("search", search);
      if (categoryId) q.set("categoryId", String(categoryId));
      return request<any[]>("/expenses" + (q.toString() ? `?${q}` : ""));
    },
    create: (data: any) => request<any>("/expenses", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/expenses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<{ success: boolean }>(`/expenses/${id}`, { method: "DELETE" }),
  },
  expenseCategories: {
    list: () => request<any[]>("/expense-categories"),
  },
  users: {
    list: () => request<any[]>("/users"),
    create: (data: any) => request<any>("/users", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<{ success: boolean }>(`/users/${id}`, { method: "DELETE" }),
    changePassword: (id: number, currentPassword: string, newPassword: string) =>
      request<{ success: boolean }>(`/users/${id}/password`, { method: "PUT", body: JSON.stringify({ currentPassword, newPassword }) }),
  },
  settings: {
    get: (key: string) => request<any>(`/settings/${key}`),
    set: (key: string, data: any) => request<{ success: boolean }>(`/settings/${key}`, { method: "PUT", body: JSON.stringify(data) }),
  },
  // Legacy direct methods (used by some older pages)
  getCustomers: (params?: { search?: string; type?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.type) q.set("type", params.type);
    return request<any[]>(`/customers${q.toString() ? `?${q}` : ""}`);
  },
  getCustomer: (id: number) => request<any>(`/customers/${id}`),
  createCustomer: (data: any) => request<any>("/customers", { method: "POST", body: JSON.stringify(data) }),
  updateCustomer: (id: number, data: any) => request<any>(`/customers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCustomer: (id: number) => request<{ success: boolean }>(`/customers/${id}`, { method: "DELETE" }),

  getContracts: (params?: { search?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.status) q.set("status", params.status);
    return request<any[]>(`/contracts${q.toString() ? `?${q}` : ""}`);
  },
  getContract: (id: number) => request<any>(`/contracts/${id}`),
  createContract: (data: any) => request<any>("/contracts", { method: "POST", body: JSON.stringify(data) }),
  updateContract: (id: number, data: any) => request<any>(`/contracts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteContract: (id: number) => request<{ success: boolean }>(`/contracts/${id}`, { method: "DELETE" }),

  getInstallments: (params?: { contractId?: number; isPaid?: string }) => {
    const q = new URLSearchParams();
    if (params?.contractId) q.set("contractId", String(params.contractId));
    if (params?.isPaid !== undefined) q.set("isPaid", params.isPaid);
    return request<any[]>(`/installments${q.toString() ? `?${q}` : ""}`);
  },
  updateInstallment: (id: number, data: any) => request<any>(`/installments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  createInstallment: (data: any) => request<any>("/installments", { method: "POST", body: JSON.stringify(data) }),
  deleteInstallment: (id: number) => request<{ success: boolean }>(`/installments/${id}`, { method: "DELETE" }),

  getProducts: (params?: { search?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    return request<any[]>(`/products${q.toString() ? `?${q}` : ""}`);
  },
  createProduct: (data: any) => request<any>("/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id: number, data: any) => request<any>(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProduct: (id: number) => request<{ success: boolean }>(`/products/${id}`, { method: "DELETE" }),

  getInventory: (params?: { search?: string; type?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.type) q.set("type", params.type);
    return request<any[]>(`/inventory${q.toString() ? `?${q}` : ""}`);
  },
  createInventoryTransaction: (data: any) => request<any>("/inventory", { method: "POST", body: JSON.stringify(data) }),

  getExpenseCategories: () => request<any[]>("/expense-categories"),
  getExpenses: (params?: { search?: string; categoryId?: number }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.categoryId) q.set("categoryId", String(params.categoryId));
    return request<any[]>(`/expenses${q.toString() ? `?${q}` : ""}`);
  },
  createExpense: (data: any) => request<any>("/expenses", { method: "POST", body: JSON.stringify(data) }),
  updateExpense: (id: number, data: any) => request<any>(`/expenses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteExpense: (id: number) => request<{ success: boolean }>(`/expenses/${id}`, { method: "DELETE" }),

  getUsers: () => request<any[]>("/users"),
  createUser: (data: any) => request<any>("/users", { method: "POST", body: JSON.stringify(data) }),
  updateUser: (id: number, data: any) => request<any>(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  updateUserPassword: (id: number, currentPassword: string, newPassword: string) =>
    request<{ success: boolean }>(`/users/${id}/password`, { method: "PUT", body: JSON.stringify({ currentPassword, newPassword }) }),
  deleteUser: (id: number) => request<{ success: boolean }>(`/users/${id}`, { method: "DELETE" }),

  getSettings: (key: string) => request<any>(`/settings/${key}`),
  updateSettings: (key: string, data: any) =>
    request<{ success: boolean }>(`/settings/${key}`, { method: "PUT", body: JSON.stringify(data) }),
};

// Also export individual types for backward compatibility
export interface ApiCustomer {
  id: number;
  name: string;
  phone: string;
  national_id?: string;
  address?: string;
  type: "customer" | "guarantor";
  created_at?: string;
}

export interface ApiContract {
  id: number;
  customer_id?: number;
  customer_name: string;
  customer_phone: string;
  product_type: string;
  product_id?: number;
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
  paid_date?: string;
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
  created_at?: string;
}

export interface ApiInventoryTransaction {
  id: number;
  product_id: number;
  product_name?: string;
  type: "purchase" | "sale" | "adjustment" | "return";
  quantity: number;
  unit_price: number;
  total: number;
  date: string;
  reference: string;
  notes: string;
  created_at?: string;
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
  note?: string;
  receipt_image?: string;
  created_at?: string;
}

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}
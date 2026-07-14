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

function buildQuery(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return '';
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      q.set(key, String(value));
    }
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const api = {
  // === Authentication ===
  login: (email: string, password: string) =>
    request<{ id: number; name: string; email: string; role: string; avatar?: string }>(
      "/users/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    ),

  // === Backup & Restore ===
  backup: {
    exportUrl: () => `${API_BASE}/backup/export`,
    import: (data: any) => request<{ success: boolean }>("/backup/import", { method: "POST", body: JSON.stringify(data) }),
  },

  // === Nested API methods ===
  customers: {
    list: (search?: string) => request<any[]>("/customers" + buildQuery({ search })),
    get: (id: number) => request<any>(`/customers/${id}`),
    create: (data: any) => request<any>("/customers", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/customers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<{ success: boolean }>(`/customers/${id}`, { method: "DELETE" }),
  },
  contracts: {
    list: (search?: string) => request<any[]>("/contracts" + buildQuery({ search })),
    get: (id: number) => request<any>(`/contracts/${id}`),
    create: (data: any) => request<any>("/contracts", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/contracts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<{ success: boolean }>(`/contracts/${id}`, { method: "DELETE" }),
  },
  installments: {
    list: (params?: { contractId?: number; isPaid?: string }) =>
      request<any[]>("/installments" + buildQuery(params as any)),
    update: (id: number, data: any) => request<any>(`/installments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<{ success: boolean }>(`/installments/${id}`, { method: "DELETE" }),
  },
  products: {
    list: (search?: string) => request<any[]>("/products" + buildQuery({ search })),
    create: (data: any) => request<any>("/products", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<{ success: boolean }>(`/products/${id}`, { method: "DELETE" }),
  },
  inventory: {
    list: (params?: { search?: string; type?: string }) =>
      request<any[]>("/inventory" + buildQuery(params as any)),
    create: (data: any) => request<any>("/inventory", { method: "POST", body: JSON.stringify(data) }),
  },
  expenseCategories: {
    list: () => request<any[]>("/expense-categories"),
  },
  expenses: {
    list: (search?: string, categoryId?: number) =>
      request<any[]>("/expenses" + buildQuery({ search, categoryId })),
    create: (data: any) => request<any>("/expenses", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/expenses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<{ success: boolean }>(`/expenses/${id}`, { method: "DELETE" }),
  },
  users: {
    list: () => request<any[]>("/users"),
    create: (data: any) => request<any>("/users", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    changePassword: (id: number, currentPassword: string, newPassword: string) =>
      request<{ success: boolean }>(`/users/${id}/password`, { method: "PUT", body: JSON.stringify({ currentPassword, newPassword }) }),
    delete: (id: number) => request<{ success: boolean }>(`/users/${id}`, { method: "DELETE" }),
  },
  settings: {
    get: (key: string) => request<any>(`/settings/${key}`),
    set: (key: string, data: any) => request<{ success: boolean }>(`/settings/${key}`, { method: "PUT", body: JSON.stringify(data) }),
  },

  // === Flat legacy methods (calling nested ones) ===
  getCustomers: (params?: { search?: string; type?: string }) => {
    const q = buildQuery(params as any);
    return request<any[]>(`/customers${q}`);
  },
  getCustomer: (id: number) => api.customers.get(id),
  createCustomer: (data: any) => api.customers.create(data),
  updateCustomer: (id: number, data: any) => api.customers.update(id, data),
  deleteCustomer: (id: number) => api.customers.delete(id),

  getContracts: (params?: { search?: string; status?: string }) => {
    const q = buildQuery(params as any);
    return request<any[]>(`/contracts${q}`);
  },
  getContract: (id: number) => api.contracts.get(id),
  createContract: (data: any) => api.contracts.create(data),
  updateContract: (id: number, data: any) => api.contracts.update(id, data),
  deleteContract: (id: number) => api.contracts.delete(id),

  getInstallments: (params?: { contractId?: number; isPaid?: string }) => {
    const q = buildQuery(params as any);
    return request<any[]>(`/installments${q}`);
  },
  updateInstallment: (id: number, data: any) => api.installments.update(id, data),
  deleteInstallment: (id: number) => api.installments.delete(id),

  getProducts: (params?: { search?: string }) => {
    const q = buildQuery(params as any);
    return request<any[]>(`/products${q}`);
  },
  createProduct: (data: any) => api.products.create(data),
  updateProduct: (id: number, data: any) => api.products.update(id, data),
  deleteProduct: (id: number) => api.products.delete(id),

  getInventory: (params?: { search?: string; type?: string }) => {
    const q = buildQuery(params as any);
    return request<any[]>(`/inventory${q}`);
  },
  createInventoryTransaction: (data: any) => api.inventory.create(data),

  getExpenseCategories: () => api.expenseCategories.list(),
  getExpenses: (params?: { search?: string; categoryId?: number }) => {
    const q = buildQuery(params as any);
    return request<any[]>(`/expenses${q}`);
  },
  createExpense: (data: any) => api.expenses.create(data),
  updateExpense: (id: number, data: any) => api.expenses.update(id, data),
  deleteExpense: (id: number) => api.expenses.delete(id),

  getUsers: () => api.users.list(),
  createUser: (data: any) => api.users.create(data),
  updateUser: (id: number, data: any) => api.users.update(id, data),
  updateUserPassword: (id: number, currentPassword: string, newPassword: string) =>
    api.users.changePassword(id, currentPassword, newPassword),
  deleteUser: (id: number) => api.users.delete(id),

  getSettings: (key: string) => api.settings.get(key),
  updateSettings: (key: string, data: any) => api.settings.set(key, data),
};

// === Re-exported types for convenience ===
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
"use client";

// ... (keep existing types) ...

export type UserRole = "admin" | "supervisor" | "collector";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// Permission keys
export type Permission =
  | "view_customers"
  | "manage_customers"
  | "view_contracts"
  | "manage_contracts"
  | "view_installments"
  | "manage_installments"
  | "view_products"
  | "manage_products"
  | "view_inventory"
  | "manage_inventory"
  | "view_expenses"
  | "manage_expenses"
  | "view_expense_reports"
  | "view_settings"
  | "manage_settings"
  | "view_users"
  | "manage_users";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    "view_customers", "manage_customers",
    "view_contracts", "manage_contracts",
    "view_installments", "manage_installments",
    "view_products", "manage_products",
    "view_inventory", "manage_inventory",
    "view_expenses", "manage_expenses",
    "view_expense_reports",
    "view_settings", "manage_settings",
    "view_users", "manage_users",
  ],
  supervisor: [
    "view_customers",
    "view_contracts",
    "view_installments", "manage_installments",
    "view_products",
    "view_inventory",
    "view_expenses", "manage_expenses",
    "view_expense_reports",
    "view_settings",
  ],
  collector: [
    "view_customers",
    "view_contracts",
    "view_installments", "manage_installments",
  ],
};
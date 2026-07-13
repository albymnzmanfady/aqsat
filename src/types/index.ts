"use client";

export interface Customer {
  id: number;
  name: string;
  phone: string;
  nationalId: string;
  address: string;
  type: "customer" | "guarantor";
  createdAt: string;
}

export interface Contract {
  id: number;
  customerId: number;
  customerName: string;
  customerPhone: string;
  productType: string;
  productId?: number;
  totalPrice: number;
  downPayment: number;
  numberOfReceipts: number;
  installmentAmount: number;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "defaulted";
  guarantorName: string;
  guarantorPhone: string;
  createdAt: string;
}

export interface Installment {
  id: number;
  contractId: number;
  number: number;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  paidDate?: string;
  day: number;
  month: number;
  year: number;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  minStock: number;
  createdAt: string;
}

export interface ExpenseCategory {
  id: number;
  name: string;
  icon?: string;
  color: string;
}

export interface Expense {
  id: number;
  description: string;
  categoryId: number;
  amount: number;
  date: string;
  note?: string;
  receiptImage?: string;
  createdAt: string;
}

export type InventoryTransactionType = "purchase" | "sale" | "adjustment" | "return";

export interface InventoryTransaction {
  id: number;
  productId: number;
  type: InventoryTransactionType;
  quantity: number;
  unitPrice: number;
  total: number;
  date: string;
  reference: string;
  notes: string;
  createdAt: string;
}
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

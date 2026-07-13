import { Customer, Contract, Installment } from "@/types";

const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const initialCustomers: Customer[] = [
  {
    id: 1,
    name: "أحمد محمود",
    phone: "01012345678",
    nationalId: "29801011234567",
    address: "القاهرة، مصر",
    type: "customer",
    createdAt: "2025-01-15",
  },
  {
    id: 2,
    name: "محمود علي",
    phone: "01234567890",
    nationalId: "29012345678901",
    address: "الجيزة، مصر",
    type: "customer",
    createdAt: "2025-02-10",
  },
  {
    id: 3,
    name: "كريم حسن",
    phone: "01123456789",
    nationalId: "29123456789012",
    address: "الإسكندرية، مصر",
    type: "customer",
    createdAt: "2025-03-05",
  },
  {
    id: 4,
    name: "محمد إبراهيم",
    phone: "01534567890",
    nationalId: "29234567890123",
    address: "القاهرة، مصر",
    type: "guarantor",
    createdAt: "2025-01-15",
  },
  {
    id: 5,
    name: "خالد عبدالله",
    phone: "01098765432",
    nationalId: "29345678901234",
    address: "الجيزة، مصر",
    type: "guarantor",
    createdAt: "2025-02-10",
  },
];

export const initialContracts: Contract[] = [
  {
    id: 1,
    customerId: 1,
    customerName: "أحمد محمود",
    customerPhone: "01012345678",
    productType: "ثلاجة",
    totalPrice: 25000,
    downPayment: 5000,
    numberOfReceipts: 12,
    installmentAmount: 1667,
    startDate: "2025-01-15",
    endDate: "2026-01-15",
    status: "active",
    guarantorName: "محمد إبراهيم",
    guarantorPhone: "01534567890",
    createdAt: "2025-01-15",
  },
  {
    id: 2,
    customerId: 2,
    customerName: "محمود علي",
    customerPhone: "01234567890",
    productType: "غسالة",
    totalPrice: 18000,
    downPayment: 3000,
    numberOfReceipts: 10,
    installmentAmount: 1500,
    startDate: "2025-02-10",
    endDate: "2025-12-10",
    status: "active",
    guarantorName: "خالد عبدالله",
    guarantorPhone: "01098765432",
    createdAt: "2025-02-10",
  },
  {
    id: 3,
    customerId: 3,
    customerName: "كريم حسن",
    customerPhone: "01123456789",
    productType: "تلفزيون",
    totalPrice: 12000,
    downPayment: 2000,
    numberOfReceipts: 8,
    installmentAmount: 1250,
    startDate: "2025-03-05",
    endDate: "2025-11-05",
    status: "active",
    guarantorName: "محمد إبراهيم",
    guarantorPhone: "01534567890",
    createdAt: "2025-03-05",
  },
];

export const generateInstallments = (contract: Contract): Installment[] => {
  const installments: Installment[] = [];
  const startDate = new Date(contract.startDate);

  for (let i = 1; i <= contract.numberOfReceipts; i++) {
    const dueDate = addMonths(startDate, i);
    const isPast = dueDate < new Date();
    installments.push({
      id: contract.id * 100 + i,
      contractId: contract.id,
      number: i,
      amount: contract.installmentAmount,
      dueDate: dueDate.toISOString().split("T")[0],
      isPaid: isPast && i <= 4,
      paidDate: isPast && i <= 4 ? dueDate.toISOString().split("T")[0] : undefined,
      day: dueDate.getDate(),
      month: dueDate.getMonth() + 1,
      year: dueDate.getFullYear(),
    });
  }
  return installments;
};

export const initialInstallments: Installment[] = initialContracts.flatMap(generateInstallments);

import { Customer, Contract, Installment, Product, InventoryTransaction, ExpenseCategory, Expense } from "@/types";

export const initialCustomers: Customer[] = [
  { id: 1, name: "أحمد محمد", phone: "01012345678", nationalId: "12345678901234", address: "القاهرة", type: "customer", createdAt: "2025-01-01" },
  { id: 2, name: "محمود علي", phone: "01023456789", nationalId: "23456789012345", address: "الجيزة", type: "customer", createdAt: "2025-01-05" },
  { id: 3, name: "محمد إبراهيم", phone: "01034567890", nationalId: "34567890123456", address: "الإسكندرية", type: "customer", createdAt: "2025-01-10" },
  { id: 4, name: "خالد حسن", phone: "01045678901", nationalId: "45678901234567", address: "القاهرة", type: "customer", createdAt: "2025-02-01" },
  { id: 5, name: "سعيد عبد الله", phone: "01056789012", nationalId: "56789012345678", address: "المنصورة", type: "customer", createdAt: "2025-02-10" },
  { id: 6, name: "علي أحمد", phone: "01067890123", nationalId: "67890123456789", address: "طنطا", type: "guarantor", createdAt: "2025-01-01" },
  { id: 7, name: "حسن مصطفى", phone: "01078901234", nationalId: "78901234567890", address: "القاهرة", type: "guarantor", createdAt: "2025-01-05" },
  { id: 8, name: "كريم عبد الرحمن", phone: "01089012345", nationalId: "89012345678901", address: "الجيزة", type: "guarantor", createdAt: "2025-02-01" },
];

export const initialContracts: Contract[] = [
  { id: 1, customerId: 1, customerName: "أحمد محمد", customerPhone: "01012345678", productType: "ثلاجة", productId: 1, totalPrice: 25000, downPayment: 5000, numberOfReceipts: 12, installmentAmount: 1667, startDate: "2025-01-15", endDate: "2026-01-15", status: "active", guarantorName: "علي أحمد", guarantorPhone: "01067890123", createdAt: "2025-01-15" },
  { id: 2, customerId: 2, customerName: "محمود علي", customerPhone: "01023456789", productType: "غسالة", productId: 2, totalPrice: 18000, downPayment: 3000, numberOfReceipts: 10, installmentAmount: 1500, startDate: "2025-02-01", endDate: "2025-12-01", status: "active", guarantorName: "حسن مصطفى", guarantorPhone: "01078901234", createdAt: "2025-02-01" },
  { id: 3, customerId: 3, customerName: "محمد إبراهيم", customerPhone: "01034567890", productType: "تلفاز", productId: 3, totalPrice: 12000, downPayment: 2000, numberOfReceipts: 8, installmentAmount: 1250, startDate: "2025-02-15", endDate: "2025-10-15", status: "active", guarantorName: "كريم عبد الرحمن", guarantorPhone: "01089012345", createdAt: "2025-02-15" },
  { id: 4, customerId: 4, customerName: "خالد حسن", customerPhone: "01045678901", productType: "مكيف", productId: 4, totalPrice: 32000, downPayment: 7000, numberOfReceipts: 15, installmentAmount: 1667, startDate: "2025-03-01", endDate: "2026-06-01", status: "active", guarantorName: "علي أحمد", guarantorPhone: "01067890123", createdAt: "2025-03-01" },
  { id: 5, customerId: 5, customerName: "سعيد عبد الله", customerPhone: "01056789012", productType: "ثلاجة", productId: 1, totalPrice: 25000, downPayment: 5000, numberOfReceipts: 12, installmentAmount: 1667, startDate: "2025-03-01", endDate: "2026-03-01", status: "active", guarantorName: "حسن مصطفى", guarantorPhone: "01078901234", createdAt: "2025-03-01" },
];

export const generateInstallments = (contract: Contract): Installment[] => {
  const installments: Installment[] = [];
  const startDate = new Date(contract.startDate);
  for (let i = 0; i < contract.numberOfReceipts; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i + 1);
    installments.push({
      id: 0,
      contractId: contract.id,
      number: i + 1,
      amount: contract.installmentAmount,
      dueDate: dueDate.toISOString().split("T")[0],
      isPaid: false,
      day: dueDate.getDate(),
      month: dueDate.getMonth() + 1,
      year: dueDate.getFullYear(),
    });
  }
  return installments;
};

export const initialInstallments: Installment[] = [
  { id: 1, contractId: 1, number: 1, amount: 1667, dueDate: "2025-02-15", isPaid: true, paidDate: "2025-02-10", day: 15, month: 2, year: 2025 },
  { id: 2, contractId: 1, number: 2, amount: 1667, dueDate: "2025-03-15", isPaid: true, paidDate: "2025-03-12", day: 15, month: 3, year: 2025 },
  { id: 3, contractId: 1, number: 3, amount: 1667, dueDate: "2025-04-15", isPaid: false, day: 15, month: 4, year: 2025 },
  { id: 4, contractId: 1, number: 4, amount: 1667, dueDate: "2025-05-15", isPaid: false, day: 15, month: 5, year: 2025 },
  { id: 5, contractId: 2, number: 1, amount: 1500, dueDate: "2025-03-01", isPaid: true, paidDate: "2025-02-28", day: 1, month: 3, year: 2025 },
  { id: 6, contractId: 2, number: 2, amount: 1500, dueDate: "2025-04-01", isPaid: false, day: 1, month: 4, year: 2025 },
  { id: 7, contractId: 3, number: 1, amount: 1250, dueDate: "2025-03-15", isPaid: true, paidDate: "2025-03-10", day: 15, month: 3, year: 2025 },
  { id: 8, contractId: 3, number: 2, amount: 1250, dueDate: "2025-04-15", isPaid: false, day: 15, month: 4, year: 2025 },
  { id: 9, contractId: 4, number: 1, amount: 1667, dueDate: "2025-04-01", isPaid: false, day: 1, month: 4, year: 2025 },
];

export const initialProducts: Product[] = [
  { id: 1, name: "ثلاجة سامسونج 14 قدم", category: "أجهزة كهربائية", unit: "قطعة", costPrice: 15000, sellingPrice: 25000, currentStock: 5, minStock: 2, createdAt: "2025-01-01" },
  { id: 2, name: "غسالة LG 7 كيلو", category: "أجهزة كهربائية", unit: "قطعة", costPrice: 10000, sellingPrice: 18000, currentStock: 3, minStock: 2, createdAt: "2025-01-01" },
  { id: 3, name: "تلفاز سامسونج 55 بوصة", category: "إلكترونيات", unit: "قطعة", costPrice: 8000, sellingPrice: 12000, currentStock: 2, minStock: 2, createdAt: "2025-01-01" },
  { id: 4, name: "مكيف سبليت 1.5 حصان", category: "أجهزة كهربائية", unit: "قطعة", costPrice: 20000, sellingPrice: 32000, currentStock: 4, minStock: 2, createdAt: "2025-01-01" },
  { id: 5, name: "بوتاجاز 4 شعلات", category: "أجهزة كهربائية", unit: "قطعة", costPrice: 5000, sellingPrice: 8500, currentStock: 1, minStock: 3, createdAt: "2025-01-01" },
];

export const initialTransactions: InventoryTransaction[] = [
  { id: 1, productId: 1, type: "purchase", quantity: 10, unitPrice: 15000, total: 150000, date: "2025-01-05", reference: "PO-001", notes: "شراء ثلاجات سامسونج", createdAt: "2025-01-05" },
  { id: 2, productId: 2, type: "purchase", quantity: 8, unitPrice: 10000, total: 80000, date: "2025-01-05", reference: "PO-002", notes: "شراء غسالات LG", createdAt: "2025-01-05" },
  { id: 3, productId: 1, type: "sale", quantity: -2, unitPrice: 25000, total: -50000, date: "2025-01-15", reference: "INV-001", notes: "بيع عقد 1", createdAt: "2025-01-15" },
  { id: 4, productId: 2, type: "sale", quantity: -1, unitPrice: 18000, total: -18000, date: "2025-02-01", reference: "INV-002", notes: "بيع عقد 2", createdAt: "2025-02-01" },
  { id: 5, productId: 3, type: "purchase", quantity: 5, unitPrice: 8000, total: 40000, date: "2025-02-05", reference: "PO-003", notes: "شراء تلفزيونات", createdAt: "2025-02-05" },
  { id: 6, productId: 1, type: "adjustment", quantity: -1, unitPrice: 15000, total: -15000, date: "2025-02-20", reference: "ADJ-001", notes: "توالف مخزني", createdAt: "2025-02-20" },
  { id: 7, productId: 4, type: "purchase", quantity: 6, unitPrice: 20000, total: 120000, date: "2025-02-25", reference: "PO-004", notes: "شراء مكيفات", createdAt: "2025-02-25" },
  { id: 8, productId: 3, type: "sale", quantity: -1, unitPrice: 12000, total: -12000, date: "2025-02-15", reference: "INV-003", notes: "بيع عقد 3", createdAt: "2025-02-15" },
];

export const initialExpenseCategories: ExpenseCategory[] = [
  { id: 1, name: "إيجار", color: "bg-cyan-100 text-cyan-700" },
  { id: 2, name: "كهرباء", color: "bg-yellow-100 text-yellow-700" },
  { id: 3, name: "رواتب", color: "bg-green-100 text-green-700" },
  { id: 4, name: "صيانة", color: "bg-orange-100 text-orange-700" },
  { id: 5, name: "تسويق", color: "bg-purple-100 text-purple-700" },
  { id: 6, name: "مصاريف إدارية", color: "bg-slate-100 text-slate-700" },
  { id: 7, name: "أخرى", color: "bg-gray-100 text-gray-700" },
];

export const initialExpenses: Expense[] = [
  { id: 1, description: "إيجار محل الفرع الرئيسي", categoryId: 1, amount: 15000, date: "2025-01-01", note: "إيجار شهر يناير", createdAt: "2025-01-01" },
  { id: 2, description: "فاتورة كهرباء يناير", categoryId: 2, amount: 3200, date: "2025-01-15", note: "قراءة العداد 1500 كيلو", createdAt: "2025-01-15" },
  { id: 3, description: "رواتب الموظفين يناير", categoryId: 3, amount: 45000, date: "2025-01-30", note: "رواتب شهر يناير", createdAt: "2025-01-30" },
  { id: 4, description: "صيانة مكيف الفرع", categoryId: 4, amount: 850, date: "2025-02-05", note: "صيانة مكيف سبليت", createdAt: "2025-02-05" },
  { id: 5, description: "حملة إعلانية فيسبوك", categoryId: 5, amount: 5000, date: "2025-02-10", note: "إعلانات يناير", createdAt: "2025-02-10" },
  { id: 6, description: "إيجار محل الفرع الرئيسي", categoryId: 1, amount: 15000, date: "2025-02-01", note: "إيجار شهر فبراير", createdAt: "2025-02-01" },
  { id: 7, description: "فاتورة كهرباء فبراير", categoryId: 2, amount: 2900, date: "2025-02-15", note: "قراءة العداد", createdAt: "2025-02-15" },
  { id: 8, description: "رواتب الموظفين فبراير", categoryId: 3, amount: 45000, date: "2025-02-28", note: "رواتب شهر فبراير", createdAt: "2025-02-28" },
  { id: 9, description: "إيجار محل الفرع الرئيسي", categoryId: 1, amount: 15000, date: "2025-03-01", note: "إيجار شهر مارس", createdAt: "2025-03-01" },
  { id: 10, description: "مستلزمات مكتبية", categoryId: 6, amount: 1200, date: "2025-03-05", note: "كراسات وأقلام وطباعة", createdAt: "2025-03-05" },
  { id: 11, description: "صيانة سيارات النقل", categoryId: 4, amount: 2400, date: "2025-03-08", note: "تغيير زيت وفلتر", createdAt: "2025-03-08" },
  { id: 12, description: "مصروفات نثرية", categoryId: 7, amount: 500, date: "2025-03-10", note: "", createdAt: "2025-03-10" },
];
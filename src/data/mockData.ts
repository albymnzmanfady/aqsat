import { Customer } from "@/types";

export const generateInstallments = (
  totalPrice: number,
  downPayment: number,
  numberOfReceipts: number,
  deliveryDate: string
): Customer["installments"] => {
  const remaining = totalPrice - downPayment;
  const installmentValue = Math.round(remaining / numberOfReceipts);
  const startDate = new Date(deliveryDate);
  const installments = [];

  for (let i = 0; i < numberOfReceipts; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    installments.push({
      id: i + 1,
      number: i + 1,
      day: dueDate.getDate(),
      month: dueDate.getMonth() + 1,
      year: dueDate.getFullYear(),
      value: i === numberOfReceipts - 1 ? remaining - installmentValue * (numberOfReceipts - 1) : installmentValue,
      paid: false,
      paidDate: null,
    });
  }

  return installments;
};

export const initialCustomers: Customer[] = [
  {
    id: 1,
    name: "أحمد محمد علي",
    nationalId: "28901011234567",
    address: "القاهرة - المعادي",
    phone: "01012345678",
    guarantor: {
      name: "محمد علي أحمد",
      nationalId: "28505051234567",
      address: "القاهرة - مصر الجديدة",
      phone: "01098765432",
    },
    contract: {
      productType: "تليفزيون ذكي",
      totalPrice: 15000,
      downPayment: 3000,
      installmentValue: 1000,
      deliveryDate: "2024-01-15",
      contractEndDate: "2025-01-15",
      numberOfReceipts: 12,
    },
    installments: [
      { id: 1, number: 1, day: 15, month: 1, year: 2024, value: 1000, paid: true, paidDate: "2024-01-15" },
      { id: 2, number: 2, day: 15, month: 2, year: 2024, value: 1000, paid: true, paidDate: "2024-02-14" },
      { id: 3, number: 3, day: 15, month: 3, year: 2024, value: 1000, paid: true, paidDate: "2024-03-16" },
      { id: 4, number: 4, day: 15, month: 4, year: 2024, value: 1000, paid: true, paidDate: "2024-04-15" },
      { id: 5, number: 5, day: 15, month: 5, year: 2024, value: 1000, paid: true, paidDate: "2024-05-13" },
      { id: 6, number: 6, day: 15, month: 6, year: 2024, value: 1000, paid: true, paidDate: "2024-06-15" },
      { id: 7, number: 7, day: 15, month: 7, year: 2024, value: 1000, paid: true, paidDate: "2024-07-14" },
      { id: 8, number: 8, day: 15, month: 8, year: 2024, value: 1000, paid: false, paidDate: null },
      { id: 9, number: 9, day: 15, month: 9, year: 2024, value: 1000, paid: false, paidDate: null },
      { id: 10, number: 10, day: 15, month: 10, year: 2024, value: 1000, paid: false, paidDate: null },
      { id: 11, number: 11, day: 15, month: 11, year: 2024, value: 1000, paid: false, paidDate: null },
      { id: 12, number: 12, day: 15, month: 12, year: 2024, value: 1000, paid: false, paidDate: null },
    ],
  },
  {
    id: 2,
    name: "سارة علي حسن",
    nationalId: "29003031234567",
    address: "الجيزة - الدقي",
    phone: "01098765432",
    guarantor: {
      name: "علي حسن محمود",
      nationalId: "28606061234567",
      address: "الجيزة - Mohandessin",
      phone: "01123456789",
    },
    contract: {
      productType: "موبايل آيفون",
      totalPrice: 42000,
      downPayment: 12000,
      installmentValue: 2500,
      deliveryDate: "2024-02-01",
      contractEndDate: "2025-02-01",
      numberOfReceipts: 12,
    },
    installments: [
      { id: 1, number: 1, day: 1, month: 2, year: 2024, value: 2500, paid: true, paidDate: "2024-02-01" },
      { id: 2, number: 2, day: 1, month: 3, year: 2024, value: 2500, paid: true, paidDate: "2024-03-01" },
      { id: 3, number: 3, day: 1, month: 4, year: 2024, value: 2500, paid: true, paidDate: "2024-04-02" },
      { id: 4, number: 4, day: 1, month: 5, year: 2024, value: 2500, paid: true, paidDate: "2024-05-01" },
      { id: 5, number: 5, day: 1, month: 6, year: 2024, value: 2500, paid: false, paidDate: null },
      { id: 6, number: 6, day: 1, month: 7, year: 2024, value: 2500, paid: false, paidDate: null },
      { id: 7, number: 7, day: 1, month: 8, year: 2024, value: 2500, paid: false, paidDate: null },
      { id: 8, number: 8, day: 1, month: 9, year: 2024, value: 2500, paid: false, paidDate: null },
      { id: 9, number: 9, day: 1, month: 10, year: 2024, value: 2500, paid: false, paidDate: null },
      { id: 10, number: 10, day: 1, month: 11, year: 2024, value: 2500, paid: false, paidDate: null },
      { id: 11, number: 11, day: 1, month: 12, year: 2024, value: 2500, paid: false, paidDate: null },
      { id: 12, number: 12, day: 1, month: 1, year: 2025, value: 2500, paid: false, paidDate: null },
    ],
  },
  {
    id: 3,
    name: "فاطمة أحمد محمود",
    nationalId: "29105051234567",
    address: "المنصورة",
    phone: "01234567890",
    guarantor: {
      name: "أحمد محمود سعيد",
      nationalId: "28307071234567",
      address: "المنصورة",
      phone: "01011122233",
    },
    contract: {
      productType: "ثلاجة لامبرجي",
      totalPrice: 55000,
      downPayment: 10000,
      installmentValue: 2500,
      deliveryDate: "2024-01-10",
      contractEndDate: "2025-07-10",
      numberOfReceipts: 18,
    },
    installments: [
      { id: 1, number: 1, day: 10, month: 1, year: 2024, value: 2500, paid: true, paidDate: "2024-01-10" },
      { id: 2, number: 2, day: 10, month: 2, year: 2024, value: 2500, paid: true, paidDate: "2024-02-09" },
      { id: 3, number: 3, day: 10, month: 3, year: 2024, value: 2500, paid: true, paidDate: "2024-03-11" },
      { id: 4, number: 4, day: 10, month: 4, year: 2024, value: 2500, paid: true, paidDate: "2024-04-10" },
      { id: 5, number: 5, day: 10, month: 5, year: 2024, value: 2500, paid: false, paidDate: null },
      { id: 6, number: 6, day: 10, month: 6, year: 2024, value: 2500, paid: false, paidDate: null },
      { id: 7, number: 7, day: 10, month: 7, year: 2024, value: 2500, paid: false, paidDate: null },
      { id: 8, number: 8, day: 10, month: 8, year: 2024, value: 2500, paid: false, paidDate: null },
      { id: 9, number: 9, day: 10, month: 9, year: 2024, value: 2500, paid: false, paidDate: null },
      { id: 10, number: 10, day: 10, month: 10, year: 2024, value: 2500, paid: false, paidDate: null },
      { id: 11, number: 11, day: 10, month: 11, year: 2024, value: 2500, paid: false, paidDate: null },
      { id: 12, number: 12, day: 10, month: 12, year: 2024, value: 2500, paid: false, paidDate: null },
      { id: 13, number: 13, day: 10, month: 1, year: 2025, value: 2500, paid: false, paidDate: null },
      { id: 14, number: 14, day: 10, month: 2, year: 2025, value: 2500, paid: false, paidDate: null },
      { id: 15, number: 15, day: 10, month: 3, year: 2025, value: 2500, paid: false, paidDate: null },
      { id: 16, number: 16, day: 10, month: 4, year: 2025, value: 2500, paid: false, paidDate: null },
      { id: 17, number: 17, day: 10, month: 5, year: 2025, value: 2500, paid: false, paidDate: null },
      { id: 18, number: 18, day: 10, month: 6, year: 2025, value: 2500, paid: false, paidDate: null },
    ],
  },
];
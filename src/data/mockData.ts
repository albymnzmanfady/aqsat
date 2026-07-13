import { Customer, Guarantor, Contract, Installment } from "@/types";

export const initialCustomers: Customer[] = [
  { id: 1, name: "أحمد محمد علي", nationalId: "29001011234567", address: "القاهرة - مدينة نصر", phone: "01012345678" },
  { id: 2, name: "سارة علي حسن", nationalId: "29503151234567", address: "الجيزة - الدقي", phone: "01098765432" },
  { id: 3, name: "محمد حسن أحمد", nationalId: "28807201234567", address: "الإسكندرية - سيدي جابر", phone: "01123456789" },
  { id: 4, name: "فاطمة أحمد محمود", nationalId: "29204011234567", address: "المنصورة - شارع الجيش", phone: "01234567890" },
  { id: 5, name: "عمر خالد سعيد", nationalId: "29108151234567", address: "أسوان - شارع كورنيش النيل", phone: "01087654321" },
];

export const initialGuarantors: Guarantor[] = [
  { id: 1, name: "علي محمد أحمد", nationalId: "28502011234567", address: "القاهرة - مصر الجديدة", phone: "01111111111" },
  { id: 2, name: "محمد علي حسن", nationalId: "28005151234567", address: "الجيزة - العجوزة", phone: "01222222222" },
  { id: 3, name: "خالد أحمد سعيد", nationalId: "28709101234567", address: "الإسكندرية - العصافرة", phone: "01333333333" },
  { id: 4, name: "حسن محمود عبدالله", nationalId: "28301201234567", address: "المنصورة - نادي الصيد", phone: "01444444444" },
];

export const initialContracts: Contract[] = [
  {
    id: 1, customerId: 1, customerName: "أحمد محمد علي", guarantorId: 1, guarantorName: "علي محمد أحمد",
    productType: "تليفزيون سامسونج 55 بوصة", totalPrice: 25000, installmentAmount: 500,
    downPayment: 5000, deliveryDate: "2024-01-01", endDate: "2025-01-01", numberOfReceipts: 40,
    status: "active", createdAt: "2024-01-01",
  },
  {
    id: 2, customerId: 2, customerName: "سارة علي حسن", guarantorId: 2, guarantorName: "محمد علي حسن",
    productType: "ثلاجة شارب دابل درجة", totalPrice: 35000, installmentAmount: 500,
    downPayment: 10000, deliveryDate: "2024-01-15", endDate: "2025-01-15", numberOfReceipts: 50,
    status: "active", createdAt: "2024-01-15",
  },
  {
    id: 3, customerId: 3, customerName: "محمد حسن أحمد", guarantorId: 3, guarantorName: "خالد أحمد سعيد",
    productType: "غسالة يونيفرسال أوتوماتيك", totalPrice: 18000, installmentAmount: 500,
    downPayment: 3000, deliveryDate: "2023-06-01", endDate: "2024-06-01", numberOfReceipts: 30,
    status: "completed", createdAt: "2023-06-01",
  },
  {
    id: 4, customerId: 4, customerName: "فاطمة أحمد محمود", guarantorId: 4, guarantorName: "حسن محمود عبدالله",
    productType: "مكيف هواء إنفيرتر 1.5 حصان", totalPrice: 22000, installmentAmount: 500,
    downPayment: 4000, deliveryDate: "2024-03-01", endDate: "2025-03-01", numberOfReceipts: 36,
    status: "active", createdAt: "2024-03-01",
  },
  {
    id: 5, customerId: 5, customerName: "عمر خالد سعيد", guarantorId: 1, guarantorName: "علي محمد أحمد",
    productType: "موبايل سامسونج Galaxy S24", totalPrice: 30000, installmentAmount: 500,
    downPayment: 6000, deliveryDate: "2024-02-01", endDate: "2025-02-01", numberOfReceipts: 48,
    status: "active", createdAt: "2024-02-01",
  },
];

const generateInstallments = (contracts: Contract[]): Installment[] => {
  const installments: Installment[] = [];
  let id = 1;
  contracts.forEach((contract) => {
    const startDate = new Date(contract.deliveryDate);
    for (let i = 1; i <= contract.numberOfReceipts; i++) {
      const installmentDate = new Date(startDate);
      installmentDate.setMonth(installmentDate.getMonth() + i - 1);
      installments.push({
        id: id++,
        contractId: contract.id,
        number: i,
        day: installmentDate.getDate(),
        month: installmentDate.getMonth() + 1,
        year: installmentDate.getFullYear(),
        amount: contract.installmentAmount,
        isPaid: contract.status === "completed" ? true : i <= 3,
        paidDate: contract.status === "completed" ? installmentDate.toISOString().split("T")[0] : i <= 3 ? `2024-0${i}-15` : null,
      });
    }
  });
  return installments;
};

export const initialInstallments = generateInstallments(initialContracts);
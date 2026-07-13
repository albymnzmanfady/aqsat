export interface Customer {
  id: number;
  name: string;
  nationalId: string;
  address: string;
  phone: string;
}

export interface Guarantor {
  id: number;
  name: string;
  nationalId: string;
  address: string;
  phone: string;
}

export interface Contract {
  id: number;
  customerId: number;
  customerName: string;
  guarantorId: number;
  guarantorName: string;
  productType: string;
  totalPrice: number;
  installmentAmount: number;
  downPayment: number;
  deliveryDate: string;
  endDate: string;
  numberOfReceipts: number;
  status: "active" | "completed" | "cancelled";
  createdAt: string;
}

export interface Installment {
  id: number;
  contractId: number;
  number: number;
  day: number;
  month: number;
  year: number;
  amount: number;
  isPaid: boolean;
  paidDate: string | null;
}
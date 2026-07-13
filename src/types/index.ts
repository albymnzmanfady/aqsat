export interface Guarantor {
  name: string;
  nationalId: string;
  address: string;
  phone: string;
}

export interface Contract {
  productType: string;
  totalPrice: number;
  downPayment: number;
  installmentValue: number;
  deliveryDate: string;
  contractEndDate: string;
  numberOfReceipts: number;
}

export interface Installment {
  id: number;
  number: number;
  day: number;
  month: number;
  year: number;
  value: number;
  paid: boolean;
  paidDate: string | null;
}

export interface Customer {
  id: number;
  name: string;
  nationalId: string;
  address: string;
  phone: string;
  guarantor: Guarantor;
  contract: Contract;
  installments: Installment[];
}

export type CustomerFormData = Omit<Customer, "id" | "installments">;
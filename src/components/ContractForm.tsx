"use client";

import { useState, useEffect } from "react";
import { Contract, Customer, Guarantor, Installment } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Calculator, Calendar, Save, RotateCcw } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";

interface ContractFormProps {
  customers: Customer[];
  guarantors: Guarantor[];
  onSubmit: (contract: Contract, installments: Installment[]) => void;
  initialContract?: Contract;
  isEditing?: boolean;
}

const ContractForm = ({ customers, guarantors, onSubmit, initialContract, isEditing = false }: ContractFormProps) => {
  const [customerId, setCustomerId] = useState<string>(initialContract?.customerId.toString() || "");
  const [guarantorId, setGuarantorId] = useState<string>(initialContract?.guarantorId.toString() || "");
  const [productType, setProductType] = useState(initialContract?.productType || "");
  const [totalPrice, setTotalPrice] = useState(initialContract?.totalPrice.toString() || "");
  const [downPayment, setDownPayment] = useState(initialContract?.downPayment.toString() || "");
  const [numberOfReceipts, setNumberOfReceipts] = useState(initialContract?.numberOfReceipts.toString() || "");
  const [deliveryDate, setDeliveryDate] = useState(initialContract?.deliveryDate || "");

  const [installmentAmount, setInstallmentAmount] = useState(0);
  const [endDate, setEndDate] = useState("");

  // Calculate installment amount and end date
  useEffect(() => {
    if (totalPrice && downPayment && numberOfReceipts) {
      const remaining = Number(totalPrice) - Number(downPayment);
      const installment = Math.ceil(remaining / Number(numberOfReceipts));
      setInstallmentAmount(installment);

      if (deliveryDate) {
        const end = new Date(deliveryDate);
        end.setMonth(end.getMonth() + Number(numberOfReceipts) - 1);
        setEndDate(end.toISOString().split("T")[0]);
      }
    }
  }, [totalPrice, downPayment, numberOfReceipts, deliveryDate]);

  const handleReset = () => {
    setCustomerId("");
    setGuarantorId("");
    setProductType("");
    setTotalPrice("");
    setDownPayment("");
    setNumberOfReceipts("");
    setDeliveryDate("");
    setInstallmentAmount(0);
    setEndDate("");
  };

  const generateInstallments = (contract: Contract): Installment[] => {
    const installments: Installment[] = [];
    const startDate = new Date(contract.deliveryDate);

    for (let i = 1; i <= contract.numberOfReceipts; i++) {
      const installmentDate = new Date(startDate);
      installmentDate.setMonth(installmentDate.getMonth() + i - 1);

      installments.push({
        id: Date.now() + i,
        contractId: contract.id,
        number: i,
        day: installmentDate.getDate(),
        month: installmentDate.getMonth() + 1,
        year: installmentDate.getFullYear(),
        amount: contract.installmentAmount,
        isPaid: false,
        paidDate: null,
      });
    }

    return installments;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId || !guarantorId || !productType || !totalPrice || !downPayment || !numberOfReceipts || !deliveryDate) {
      showError("يرجى ملء جميع البيانات المطلوبة");
      return;
    }

    const selectedCustomer = customers.find((c) => c.id === Number(customerId));
    const selectedGuarantor = guarantors.find((g) => g.id === Number(guarantorId));

    if (!selectedCustomer || !selectedGuarantor) {
      showError("يرجى اختيار العميل والضامن");
      return;
    }

    if (Number(downPayment) >= Number(totalPrice)) {
      showError("قيمة المقدم يجب أن تكون أقل من الإجمالي");
      return;
    }

    const contract: Contract = {
      id: initialContract?.id || Date.now(),
      customerId: Number(customerId),
      customerName: selectedCustomer.name,
      guarantorId: Number(guarantorId),
      guarantorName: selectedGuarantor.name,
      productType,
      totalPrice: Number(totalPrice),
      installmentAmount,
      downPayment: Number(downPayment),
      deliveryDate,
      endDate,
      numberOfReceipts: Number(numberOfReceipts),
      status: "active",
      createdAt: initialContract?.createdAt || new Date().toISOString().split("T")[0],
    };

    const installments = initialContract ? [] : generateInstallments(contract);
    onSubmit(contract, installments);
    showSuccess(isEditing ? "تم تحديث العقد بنجاح" : "تم إنشاء العقد بنجاح");
    
    if (!isEditing) {
      handleReset();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contract Data */}
      <Card className="border-slate-200 bg-white">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Package className="h-5 w-5 text-emerald-600" />
            </div>
            بيانات العقد
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                العميل <span className="text-red-500">*</span>
              </Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="اختر العميل" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                الضامن <span className="text-red-500">*</span>
              </Label>
              <Select value={guarantorId} onValueChange={setGuarantorId}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="اختر الضامن" />
                </SelectTrigger>
                <SelectContent>
                  {guarantors.map((guarantor) => (
                    <SelectItem key={guarantor.id} value={guarantor.id.toString()}>
                      {guarantor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productType" className="text-sm font-medium text-slate-700">
                نوع السلعة <span className="text-red-500">*</span>
              </Label>
              <Input
                id="productType"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                placeholder="مثال: تليفزيون، ثلاجة، غسالة"
                className="rounded-xl h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalPrice" className="text-sm font-medium text-slate-700">
                إجمالي السعر (ج.م) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="totalPrice"
                type="number"
                value={totalPrice}
                onChange={(e) => setTotalPrice(e.target.value)}
                placeholder="0"
                className="rounded-xl h-11"
                dir="ltr"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="downPayment" className="text-sm font-medium text-slate-700">
                قيمة المقدم (ج.م) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="downPayment"
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
                placeholder="0"
                className="rounded-xl h-11"
                dir="ltr"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfReceipts" className="text-sm font-medium text-slate-700">
                عدد الإيصالات <span className="text-red-500">*</span>
              </Label>
              <Input
                id="numberOfReceipts"
                type="number"
                value={numberOfReceipts}
                onChange={(e) => setNumberOfReceipts(e.target.value)}
                placeholder="12"
                className="rounded-xl h-11"
                dir="ltr"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryDate" className="text-sm font-medium text-slate-700">
                تاريخ الاستلام <span className="text-red-500">*</span>
              </Label>
              <Input
                id="deliveryDate"
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="rounded-xl h-11"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculations */}
      <Card className="border-slate-200 bg-white">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Calculator className="h-5 w-5 text-amber-600" />
            </div>
            الحسابات التلقائية
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">قيمة القسط الشهري</p>
              <p className="text-2xl font-bold text-emerald-600">
                {installmentAmount.toLocaleString()} ج.م
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">المبلغ المتبقي</p>
              <p className="text-2xl font-bold text-blue-600">
                {totalPrice && downPayment ? (Number(totalPrice) - Number(downPayment)).toLocaleString() : "0"} ج.م
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">تاريخ انتهاء العقد</p>
              <p className="text-2xl font-bold text-slate-800">
                {endDate || "---"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="rounded-xl gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          مسح النموذج
        </Button>
        <Button
          type="submit"
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 gap-2"
        >
          <Save className="h-4 w-4" />
          {isEditing ? "تحديث العقد" : "إنشاء العقد"}
        </Button>
      </div>
    </form>
  );
};

export default ContractForm;
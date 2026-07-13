"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { Sparkles, Calculator } from "lucide-react";
import { Customer } from "@/types";

interface ContractFormProps {
  customers: Customer[];
  guarantors: Customer[];
  onSave: (data: any) => void;
  onCancel: () => void;
}

const ContractForm = ({ customers, guarantors, onSave, onCancel }: ContractFormProps) => {
  const [formData, setFormData] = useState({
    customerId: "",
    productType: "",
    totalPrice: "",
    downPayment: "",
    numberOfReceipts: "",
    startDate: "",
    guarantorName: "",
    guarantorPhone: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const total = Number(formData.totalPrice) || 0;
  const down = Number(formData.downPayment) || 0;
  const receipts = Number(formData.numberOfReceipts) || 1;
  const installmentAmount = receipts > 0 ? Math.ceil((total - down) / receipts) : 0;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerId) newErrors.customerId = "اختر العميل";
    if (!formData.productType.trim()) newErrors.productType = "نوع المنتج مطلوب";
    if (!formData.totalPrice || Number(formData.totalPrice) <= 0) newErrors.totalPrice = "يجب أن يكون السعر أكبر من صفر";
    if (!formData.downPayment && Number(formData.downPayment) < 0) newErrors.downPayment = "المقدم غير صحيح";
    if (Number(formData.downPayment) >= Number(formData.totalPrice)) newErrors.downPayment = "المقدم لا يمكن أن يساوي السعر أو يزيد";
    if (!formData.numberOfReceipts || Number(formData.numberOfReceipts) <= 0) newErrors.numberOfReceipts = "عدد الأقساط يجب أن يكون 1 على الأقل";
    if (!formData.startDate) newErrors.startDate = "تاريخ البدء مطلوب";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCustomerChange = (id: string) => {
    const customer = customers.find((c) => c.id === Number(id));
    setFormData({
      ...formData,
      customerId: id,
      guarantorName: customer ? "" : formData.guarantorName,
      guarantorPhone: customer ? "" : formData.guarantorPhone,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const customer = customers.find((c) => c.id === Number(formData.customerId));
      // حساب تاريخ الانتهاء
      const startDate = new Date(formData.startDate);
      startDate.setMonth(startDate.getMonth() + Number(formData.numberOfReceipts));
      const endDate = startDate.toISOString().split("T")[0];

      onSave({
        customerId: Number(formData.customerId),
        customerName: customer?.name || "",
        customerPhone: customer?.phone || "",
        productType: formData.productType,
        totalPrice: Number(formData.totalPrice),
        downPayment: Number(formData.downPayment),
        numberOfReceipts: Number(formData.numberOfReceipts),
        installmentAmount,
        startDate: formData.startDate,
        endDate,
        guarantorName: formData.guarantorName,
        guarantorPhone: formData.guarantorPhone,
        status: "active",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
      <div className="space-y-2">
        <Label className={errors.customerId ? "text-red-500" : ""}>
          العميل {errors.customerId && `* ${errors.customerId}`}
        </Label>
        <select
          value={formData.customerId}
          onChange={(e) => handleCustomerChange(e.target.value)}
          className={`w-full h-12 rounded-xl bg-white/50 backdrop-blur-sm border ${
            errors.customerId ? "border-red-300" : "border-slate-200"
          } px-4 text-right`}
        >
          <option value="">اختر العميل</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label className={errors.productType ? "text-red-500" : ""}>
          نوع المنتج {errors.productType && `* ${errors.productType}`}
        </Label>
        <Input
          value={formData.productType}
          onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
          className={`rounded-xl h-12 bg-white/50 backdrop-blur-sm ${errors.productType ? "border-red-300" : ""}`}
          placeholder="مثال: ثلاجة - غسالة - تلفزيون"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className={errors.totalPrice ? "text-red-500" : ""}>
            السعر الإجمالي {errors.totalPrice && `* ${errors.totalPrice}`}
          </Label>
          <Input
            type="number"
            value={formData.totalPrice}
            onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
            className={`rounded-xl h-12 bg-white/50 backdrop-blur-sm ${errors.totalPrice ? "border-red-300" : ""}`}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label className={errors.downPayment ? "text-red-500" : ""}>
            المدفوع مقدماً {errors.downPayment && `* ${errors.downPayment}`}
          </Label>
          <Input
            type="number"
            value={formData.downPayment}
            onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
            className={`rounded-xl h-12 bg-white/50 backdrop-blur-sm ${errors.downPayment ? "border-red-300" : ""}`}
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className={errors.numberOfReceipts ? "text-red-500" : ""}>
            عدد الأقساط {errors.numberOfReceipts && `* ${errors.numberOfReceipts}`}
          </Label>
          <Input
            type="number"
            value={formData.numberOfReceipts}
            onChange={(e) => setFormData({ ...formData, numberOfReceipts: e.target.value })}
            className={`rounded-xl h-12 bg-white/50 backdrop-blur-sm ${errors.numberOfReceipts ? "border-red-300" : ""}`}
            placeholder="12"
          />
        </div>
        <div className="space-y-2">
          <Label className={errors.startDate ? "text-red-500" : ""}>
            تاريخ البدء {errors.startDate && `* ${errors.startDate}`}
          </Label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className={`rounded-xl h-12 bg-white/50 backdrop-blur-sm ${errors.startDate ? "border-red-300" : ""}`}
          />
        </div>
      </div>

      {/* Installment Summary */}
      {installmentAmount > 0 && (
        <div className="p-4 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl border border-violet-200/50">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="h-4 w-4 text-violet-600" />
            <span className="text-sm font-semibold text-violet-700">ملخص الحساب</span>
          </div>
          <div className="text-sm text-slate-600 space-y-1">
            <p>المبلغ بعد المقدم: <strong className="text-slate-800">{(total - down).toLocaleString()} ج.م</strong></p>
            <p>القسط الشهري: <strong className="text-violet-700">{installmentAmount.toLocaleString()} ج.م</strong></p>
            <p>عدد الأقساط: <strong className="text-slate-800">{receipts}</strong></p>
          </div>
        </div>
      )}

      <div className="border-t border-slate-100 pt-4">
        <p className="text-sm font-semibold text-slate-600 mb-3">بيانات الضامن</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>اسم الضامن</Label>
            <Input
              value={formData.guarantorName}
              onChange={(e) => setFormData({ ...formData, guarantorName: e.target.value })}
              className="rounded-xl h-12 bg-white/50 backdrop-blur-sm"
              placeholder="الاسم"
            />
          </div>
          <div className="space-y-2">
            <Label>رقم الضامن</Label>
            <Input
              value={formData.guarantorPhone}
              onChange={(e) => setFormData({ ...formData, guarantorPhone: e.target.value.replace(/[^0-9]/g, "").slice(0, 11) })}
              className="rounded-xl h-12 bg-white/50 backdrop-blur-sm"
              placeholder="01012345678"
              dir="ltr"
            />
          </div>
        </div>
      </div>

      <DialogFooter className="gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl h-11">
          إلغاء
        </Button>
        <Button type="submit" className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 h-11">
          <Sparkles className="h-4 w-4 ml-2" />
          إنشاء العقد
        </Button>
      </DialogFooter>
    </form>
  );
};

export default ContractForm;

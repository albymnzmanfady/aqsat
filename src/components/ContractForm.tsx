"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Calculator, Package } from "lucide-react";
import { Customer, Product } from "@/types";

interface ContractFormProps {
  customers: Customer[];
  guarantors: Customer[];
  products: Product[];
  onSave: (data: any) => void;
  onCancel: () => void;
}

const ContractForm = ({ customers, guarantors, products, onSave, onCancel }: ContractFormProps) => {
  const [formData, setFormData] = useState({
    customerId: "",
    productId: "",
    downPayment: "",
    numberOfReceipts: "",
    startDate: "",
    guarantorName: "",
    guarantorPhone: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedProduct = products.find((p) => p.id === Number(formData.productId));

  const total = selectedProduct?.sellingPrice || 0;
  const down = Number(formData.downPayment) || 0;
  const receipts = Number(formData.numberOfReceipts) || 1;
  const installmentAmount = receipts > 0 ? Math.ceil((total - down) / receipts) : 0;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerId) newErrors.customerId = "اختر العميل";
    if (!formData.productId) newErrors.productId = "اختر المنتج";
    else if (selectedProduct && selectedProduct.currentStock <= 0)
      newErrors.productId = "هذا المنتج غير متوفر حالياً";
    if (!formData.downPayment && Number(formData.downPayment) < 0) newErrors.downPayment = "المقدم غير صحيح";
    if (Number(formData.downPayment) >= total) newErrors.downPayment = "المقدم لا يمكن أن يساوي السعر أو يزيد";
    if (!formData.numberOfReceipts || Number(formData.numberOfReceipts) <= 0) newErrors.numberOfReceipts = "عدد الأقساط يجب أن يكون 1 على الأقل";
    if (!formData.startDate) newErrors.startDate = "تاريخ البدء مطلوب";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (validate()) {
      const customer = customers.find((c) => c.id === Number(formData.customerId));
      const startDate = new Date(formData.startDate);
      startDate.setMonth(startDate.getMonth() + Number(formData.numberOfReceipts));
      const endDate = startDate.toISOString().split("T")[0];

      onSave({
        customerId: Number(formData.customerId),
        customerName: customer?.name || "",
        customerPhone: customer?.phone || "",
        productType: selectedProduct.name,
        productId: selectedProduct.id,
        totalPrice: selectedProduct.sellingPrice,
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
      {/* العميل */}
      <div className="space-y-2">
        <Label className={errors.customerId ? "text-red-500" : ""}>
          العميل {errors.customerId && `* ${errors.customerId}`}
        </Label>
        <Select
          value={formData.customerId}
          onValueChange={(val) => setFormData({ ...formData, customerId: val })}
        >
          <SelectTrigger className={`rounded-xl h-12 bg-white/50 ${errors.customerId ? "border-red-300" : ""}`}>
            <SelectValue placeholder="اختر العميل" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()}>{c.name} - {c.phone}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* المنتج */}
      <div className="space-y-2">
        <Label className={errors.productId ? "text-red-500" : ""}>
          المنتج {errors.productId && `* ${errors.productId}`}
        </Label>
        <Select
          value={formData.productId}
          onValueChange={(val) => setFormData({ ...formData, productId: val })}
        >
          <SelectTrigger className={`rounded-xl h-12 bg-white/50 ${errors.productId ? "border-red-300" : ""}`}>
            <SelectValue placeholder="اختر المنتج من المخزن" />
          </SelectTrigger>
          <SelectContent>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id.toString()} disabled={p.currentStock <= 0}>
                <div className="flex items-center justify-between w-full">
                  <span>{p.name}</span>
                  <span className={`text-xs mr-2 ${p.currentStock <= p.minStock ? "text-amber-600" : "text-emerald-600"}`}>
                    ({p.currentStock} {p.unit})
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedProduct && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
            <Package className="h-3.5 w-3.5 text-violet-500" />
            <span>سعر البيع: <strong className="text-slate-700">{selectedProduct.sellingPrice.toLocaleString()} ج.م</strong></span>
            <span>•</span>
            <span>المخزون: <strong className={selectedProduct.currentStock <= selectedProduct.minStock ? "text-amber-600" : "text-slate-700"}>{selectedProduct.currentStock} {selectedProduct.unit}</strong></span>
          </div>
        )}
      </div>

      {/* الدفعة المقدمة وعدد الأقساط */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className={errors.downPayment ? "text-red-500" : ""}>
            المدفوع مقدماً {errors.downPayment && `* ${errors.downPayment}`}
          </Label>
          <Input
            type="number"
            value={formData.downPayment}
            onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
            className={`rounded-xl h-12 bg-white/50 ${errors.downPayment ? "border-red-300" : ""}`}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label className={errors.numberOfReceipts ? "text-red-500" : ""}>
            عدد الأقساط {errors.numberOfReceipts && `* ${errors.numberOfReceipts}`}
          </Label>
          <Input
            type="number"
            value={formData.numberOfReceipts}
            onChange={(e) => setFormData({ ...formData, numberOfReceipts: e.target.value })}
            className={`rounded-xl h-12 bg-white/50 ${errors.numberOfReceipts ? "border-red-300" : ""}`}
            placeholder="12"
          />
        </div>
      </div>

      {/* تاريخ البدء */}
      <div className="space-y-2">
        <Label className={errors.startDate ? "text-red-500" : ""}>
          تاريخ البدء {errors.startDate && `* ${errors.startDate}`}
        </Label>
        <Input
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          className={`rounded-xl h-12 bg-white/50 ${errors.startDate ? "border-red-300" : ""}`}
        />
      </div>

      {/* ملخص الحساب */}
      {installmentAmount > 0 && selectedProduct && (
        <div className="p-4 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl border border-violet-200/50">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="h-4 w-4 text-violet-600" />
            <span className="text-sm font-semibold text-violet-700">ملخص الحساب</span>
          </div>
          <div className="text-sm text-slate-600 space-y-1">
            <p>سعر المنتج: <strong className="text-slate-800">{selectedProduct.sellingPrice.toLocaleString()} ج.م</strong></p>
            <p>المبلغ بعد المقدم: <strong className="text-slate-800">{(total - down).toLocaleString()} ج.م</strong></p>
            <p>القسط الشهري: <strong className="text-violet-700">{installmentAmount.toLocaleString()} ج.م</strong></p>
            <p>عدد الأقساط: <strong className="text-slate-800">{receipts}</strong></p>
          </div>
        </div>
      )}

      {/* الضامن */}
      <div className="border-t border-slate-100 pt-4">
        <p className="text-sm font-semibold text-slate-600 mb-3">بيانات الضامن</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>اسم الضامن</Label>
            <Input
              value={formData.guarantorName}
              onChange={(e) => setFormData({ ...formData, guarantorName: e.target.value })}
              className="rounded-xl h-12 bg-white/50"
              placeholder="الاسم"
            />
          </div>
          <div className="space-y-2">
            <Label>رقم الضامن</Label>
            <Input
              value={formData.guarantorPhone}
              onChange={(e) => setFormData({ ...formData, guarantorPhone: e.target.value.replace(/[^0-9]/g, "").slice(0, 11) })}
              className="rounded-xl h-12 bg-white/50"
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
        <Button type="submit" className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 h-11" disabled={selectedProduct?.currentStock === 0}>
          <Sparkles className="h-4 w-4 ml-2" />
          إنشاء العقد
        </Button>
      </DialogFooter>
    </form>
  );
};

export default ContractForm;
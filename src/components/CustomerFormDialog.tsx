"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CustomerFormData } from "@/types";
import {
  User,
  Shield,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { generateInstallments } from "@/data/mockData";

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: CustomerFormData) => void;
}

const emptyFormData: CustomerFormData = {
  name: "",
  nationalId: "",
  address: "",
  phone: "",
  guarantor: { name: "", nationalId: "", address: "", phone: "" },
  contract: {
    productType: "",
    totalPrice: 0,
    downPayment: 0,
    installmentValue: 0,
    deliveryDate: "",
    contractEndDate: "",
    numberOfReceipts: 12,
  },
};

const steps = [
  { label: "بيانات العميل", icon: User },
  { label: "بيانات الضامن", icon: Shield },
  { label: "بيانات العقد", icon: Package },
];

const CustomerFormDialog = ({ open, onOpenChange, onSave }: CustomerFormDialogProps) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<CustomerFormData>(emptyFormData);

  const updateField = <K extends keyof CustomerFormData>(
    key: K,
    value: CustomerFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateGuarantor = <K extends keyof CustomerFormData["guarantor"]>(
    key: K,
    value: CustomerFormData["guarantor"][K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      guarantor: { ...prev.guarantor, [key]: value },
    }));
  };

  const updateContract = <K extends keyof CustomerFormData["contract"]>(
    key: K,
    value: CustomerFormData["contract"][K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      contract: { ...prev.contract, [key]: value },
    }));
  };

  const calculatedInstallment =
    formData.contract.totalPrice > 0 && formData.contract.numberOfReceipts > 0
      ? Math.round(
          (formData.contract.totalPrice - formData.contract.downPayment) /
            formData.contract.numberOfReceipts
        )
      : 0;

  const canProceed = () => {
    if (step === 0) return formData.name && formData.phone;
    if (step === 1) return formData.guarantor.name && formData.guarantor.phone;
    if (step === 2)
      return (
        formData.contract.productType &&
        formData.contract.totalPrice > 0 &&
        formData.contract.deliveryDate
      );
    return false;
  };

  const handleSave = () => {
    const contract = { ...formData.contract, installmentValue: calculatedInstallment };
    onSave({ ...formData, contract });
    setFormData(emptyFormData);
    setStep(0);
    onOpenChange(false);
  };

  const handleClose = () => {
    setFormData(emptyFormData);
    setStep(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[560px] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">إضافة عميل جديد</DialogTitle>
          <DialogDescription>أدخل جميع بيانات العقد والعميل</DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i === step
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : i < step
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-12 h-0.5 rounded ${
                    i < step ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-slate-500 font-medium">
          {steps[step].label}
        </p>

        <Separator className="my-2" />

        {/* Step 0: Customer Data */}
        {step === 0 && (
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="c-name">اسم العميل *</Label>
              <Input
                id="c-name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="الاسم الكامل"
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c-nationalId">الرقم القومي</Label>
              <Input
                id="c-nationalId"
                value={formData.nationalId}
                onChange={(e) => updateField("nationalId", e.target.value)}
                placeholder="14 رقم"
                className="rounded-xl"
                maxLength={14}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="c-phone">رقم الهاتف *</Label>
                <Input
                  id="c-phone"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="c-address">العنوان</Label>
                <Input
                  id="c-address"
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="المدينة - المنطقة"
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Guarantor Data */}
        {step === 1 && (
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="g-name">اسم الضامن *</Label>
              <Input
                id="g-name"
                value={formData.guarantor.name}
                onChange={(e) => updateGuarantor("name", e.target.value)}
                placeholder="الاسم الكامل للضامن"
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="g-nationalId">الرقم القومي للضامن</Label>
              <Input
                id="g-nationalId"
                value={formData.guarantor.nationalId}
                onChange={(e) => updateGuarantor("nationalId", e.target.value)}
                placeholder="14 رقم"
                className="rounded-xl"
                maxLength={14}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="g-phone">هاتف الضامن *</Label>
                <Input
                  id="g-phone"
                  value={formData.guarantor.phone}
                  onChange={(e) => updateGuarantor("phone", e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="g-address">عنوان الضامن</Label>
                <Input
                  id="g-address"
                  value={formData.guarantor.address}
                  onChange={(e) => updateGuarantor("address", e.target.value)}
                  placeholder="المدينة - المنطقة"
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Contract Data */}
        {step === 2 && (
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="ct-product">نوع السلعة *</Label>
              <Input
                id="ct-product"
                value={formData.contract.productType}
                onChange={(e) => updateContract("productType", e.target.value)}
                placeholder="مثال: تليفزيون ذكي، موبايل..."
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ct-price">إجمالي السعر (ج.م) *</Label>
                <Input
                  id="ct-price"
                  type="number"
                  value={formData.contract.totalPrice || ""}
                  onChange={(e) =>
                    updateContract("totalPrice", Number(e.target.value))
                  }
                  placeholder="0"
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ct-down">قيمة المقدم (ج.م)</Label>
                <Input
                  id="ct-down"
                  type="number"
                  value={formData.contract.downPayment || ""}
                  onChange={(e) =>
                    updateContract("downPayment", Number(e.target.value))
                  }
                  placeholder="0"
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ct-count">عدد الإيصالات (أقساط)</Label>
                <Input
                  id="ct-count"
                  type="number"
                  value={formData.contract.numberOfReceipts || ""}
                  onChange={(e) =>
                    updateContract("numberOfReceipts", Number(e.target.value))
                  }
                  placeholder="12"
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label>قيمة القسط (محسوبة)</Label>
                <div className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center text-slate-700 font-bold">
                  {calculatedInstallment.toLocaleString()} ج.م
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ct-delivery">تاريخ الاستلام *</Label>
                <Input
                  id="ct-delivery"
                  type="date"
                  value={formData.contract.deliveryDate}
                  onChange={(e) =>
                    updateContract("deliveryDate", e.target.value)
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ct-end">تاريخ انتهاء العقد</Label>
                <Input
                  id="ct-end"
                  type="date"
                  value={formData.contract.contractEndDate}
                  onChange={(e) =>
                    updateContract("contractEndDate", e.target.value)
                  }
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={handleClose} className="rounded-xl">
            إلغاء
          </Button>
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              className="rounded-xl gap-1"
            >
              <ChevronRight className="h-4 w-4" />
              السابق
            </Button>
          )}
          {step < 2 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="rounded-xl gap-1 bg-blue-600 hover:bg-blue-700"
            >
              التالي
              <ChevronLeft className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={!canProceed()}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
            >
              حفظ وإنشاء جدول الأقساط
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerFormDialog;
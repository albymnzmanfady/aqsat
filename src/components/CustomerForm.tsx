"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { Sparkles, User, Phone, CreditCard, MapPin } from "lucide-react";

interface CustomerFormProps {
  type: "customer" | "guarantor";
  onSave: (data: any) => void;
  onCancel: () => void;
}

const CustomerForm = ({ type, onSave, onCancel }: CustomerFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    nationalId: "",
    address: "",
    type: type,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "الاسم مطلوب";
    if (!formData.phone.trim()) newErrors.phone = "رقم الهاتف مطلوب";
    else if (!/^01[0-9]{9}$/.test(formData.phone.replace(/\s/g, "")))
      newErrors.phone = "رقم غير صحيح";
    if (!formData.nationalId.trim()) newErrors.nationalId = "الرقم القومي مطلوب";
    else if (!/^[0-9]{14}$/.test(formData.nationalId.replace(/\s/g, "")))
      newErrors.nationalId = "يجب أن يتكون من 14 رقماً";
    if (!formData.address.trim()) newErrors.address = "العنوان مطلوب";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        name: formData.name.trim(),
        phone: formData.phone.replace(/\s/g, ""),
        nationalId: formData.nationalId.replace(/\s/g, ""),
        address: formData.address.trim(),
        type: formData.type,
      });
    }
  };

  const fields = [
    { key: "name" as const, label: "الاسم الكامل", icon: User, placeholder: "أدخل الاسم الكامل", maxLength: undefined, ltr: false },
    { key: "phone" as const, label: "رقم الهاتف", icon: Phone, placeholder: "01012345678", maxLength: 11, ltr: true },
    { key: "nationalId" as const, label: "الرقم القومي", icon: CreditCard, placeholder: "14 رقم", maxLength: 14, ltr: true },
    { key: "address" as const, label: "العنوان", icon: MapPin, placeholder: "العنوان بالكامل", maxLength: undefined, ltr: false },
  ];

  return (
    <form onSubmit={handleSubmit} className="px-8 pb-2 space-y-5">
      {fields.map((field) => {
        const Icon = field.icon;
        const error = errors[field.key];
        return (
          <div key={field.key} className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Icon className="h-3.5 w-3.5 text-slate-400" />
              {field.label}
            </Label>
            <Input
              value={formData[field.key]}
              onChange={(e) => {
                const val = field.key === "phone" || field.key === "nationalId"
                  ? e.target.value.replace(/[^0-9]/g, "")
                  : e.target.value;
                if (!field.maxLength || val.length <= field.maxLength) {
                  setFormData({ ...formData, [field.key]: val });
                }
              }}
              className={error ? "border-red-300 focus-visible:ring-red-400/40 focus-visible:border-red-300" : ""}
              placeholder={field.placeholder}
              dir={field.ltr ? "ltr" : "rtl"}
            />
            {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
          </div>
        );
      })}

      <DialogFooter className="gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl h-11 px-6 border-slate-200 text-slate-600 hover:bg-slate-50">
          إلغاء
        </Button>
        <Button type="submit" className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 h-11 px-8 shadow-lg shadow-violet-500/20">
          <Sparkles className="h-4 w-4 ml-2" />
          حفظ
        </Button>
      </DialogFooter>
    </form>
  );
};

export default CustomerForm;
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

  return (
    <form onSubmit={handleSubmit} className="px-8 pb-2 space-y-4">
      {/* الاسم - سطر كامل */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-slate-400" />
          الاسم الكامل
        </Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={errors.name ? "border-red-300 focus-visible:ring-red-400/40 focus-visible:border-red-300 h-11" : "h-11"}
          placeholder="أدخل الاسم الكامل"
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
      </div>

      {/* الهاتف + الرقم القومي في صف واحد */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-slate-400" />
            رقم الهاتف
          </Label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, "") })}
            className={errors.phone ? "border-red-300 h-11" : "h-11"}
            placeholder="01012345678"
            dir="ltr"
            maxLength={11}
          />
          {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <CreditCard className="h-3.5 w-3.5 text-slate-400" />
            الرقم القومي
          </Label>
          <Input
            value={formData.nationalId}
            onChange={(e) => setFormData({ ...formData, nationalId: e.target.value.replace(/[^0-9]/g, "") })}
            className={errors.nationalId ? "border-red-300 h-11" : "h-11"}
            placeholder="14 رقماً"
            dir="ltr"
            maxLength={14}
          />
          {errors.nationalId && <p className="text-xs text-red-500">{errors.nationalId}</p>}
        </div>
      </div>

      {/* العنوان - سطر كامل */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          العنوان
        </Label>
        <Input
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className={errors.address ? "border-red-300 h-11" : "h-11"}
          placeholder="العنوان بالكامل"
        />
        {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
      </div>

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
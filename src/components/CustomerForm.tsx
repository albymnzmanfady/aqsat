"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";

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
      newErrors.phone = "رقم غير صحيح (مثال: 01012345678)";
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
        ...formData,
        phone: formData.phone.replace(/\s/g, ""),
        nationalId: formData.nationalId.replace(/\s/g, ""),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className={errors.name ? "text-red-500" : ""}>
          الاسم {errors.name && `* ${errors.name}`}
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`rounded-xl h-12 ${errors.name ? "border-red-300 focus-visible:ring-red-400" : ""}`}
          placeholder="الاسم كاملاً"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className={errors.phone ? "text-red-500" : ""}>
          رقم الهاتف {errors.phone && `* ${errors.phone}`}
        </Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9]/g, "");
            if (val.length <= 11) setFormData({ ...formData, phone: val });
          }}
          className={`rounded-xl h-12 ${errors.phone ? "border-red-300 focus-visible:ring-red-400" : ""}`}
          placeholder="01012345678"
          dir="ltr"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nationalId" className={errors.nationalId ? "text-red-500" : ""}>
          الرقم القومي {errors.nationalId && `* ${errors.nationalId}`}
        </Label>
        <Input
          id="nationalId"
          value={formData.nationalId}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9]/g, "");
            if (val.length <= 14) setFormData({ ...formData, nationalId: val });
          }}
          className={`rounded-xl h-12 ${errors.nationalId ? "border-red-300 focus-visible:ring-red-400" : ""}`}
          placeholder="14 رقم"
          dir="ltr"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address" className={errors.address ? "text-red-500" : ""}>
          العنوان {errors.address && `* ${errors.address}`}
        </Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className={`rounded-xl h-12 ${errors.address ? "border-red-300 focus-visible:ring-red-400" : ""}`}
          placeholder="العنوان بالكامل"
        />
      </div>

      <DialogFooter className="gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl h-11">
          إلغاء
        </Button>
        <Button type="submit" className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 h-11">
          <Sparkles className="h-4 w-4 ml-2" />
          حفظ
        </Button>
      </DialogFooter>
    </form>
  );
};

export default CustomerForm;
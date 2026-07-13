"use client";

import { useState } from "react";
import { Customer, Guarantor } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Users, CreditCard, Save, RotateCcw } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";

interface CustomerFormProps {
  onSubmit: (customer: Customer, guarantor: Guarantor) => void;
  initialCustomer?: Customer;
  initialGuarantor?: Guarantor;
  isEditing?: boolean;
}

const CustomerForm = ({ onSubmit, initialCustomer, initialGuarantor, isEditing = false }: CustomerFormProps) => {
  const [customer, setCustomer] = useState<Customer>(
    initialCustomer || {
      id: Date.now(),
      name: "",
      nationalId: "",
      address: "",
      phone: "",
    }
  );

  const [guarantor, setGuarantor] = useState<Guarantor>(
    initialGuarantor || {
      id: Date.now() + 1,
      name: "",
      nationalId: "",
      address: "",
      phone: "",
    }
  );

  const [customerErrors, setCustomerErrors] = useState<Record<string, string>>({});
  const [guarantorErrors, setGuarantorErrors] = useState<Record<string, string>>({});

  const handleReset = () => {
    setCustomer({
      id: Date.now(),
      name: "",
      nationalId: "",
      address: "",
      phone: "",
    });
    setGuarantor({
      id: Date.now() + 1,
      name: "",
      nationalId: "",
      address: "",
      phone: "",
    });
    setCustomerErrors({});
    setGuarantorErrors({});
  };

  const validateNationalId = (id: string): boolean => {
    return /^\d{14}$/.test(id);
  };

  const validatePhone = (phone: string): boolean => {
    return /^01[0-2,5]\d{8}$/.test(phone);
  };

  const validateCustomer = (): boolean => {
    const errors: Record<string, string> = {};

    if (!customer.name || customer.name.trim().length < 3) {
      errors.name = "اسم العميل يجب أن يكون 3 أحرف على الأقل";
    }

    if (!customer.nationalId) {
      errors.nationalId = "الرقم القومي مطلوب";
    } else if (!validateNationalId(customer.nationalId)) {
      errors.nationalId = "الرقم القومي يجب أن يكون 14 رقماً";
    }

    if (!customer.phone) {
      errors.phone = "رقم الهاتف مطلوب";
    } else if (!validatePhone(customer.phone)) {
      errors.phone = "رقم الهاتف غير صحيح (يجب أن يبدأ بـ 01)";
    }

    setCustomerErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateGuarantor = (): boolean => {
    const errors: Record<string, string> = {};

    if (!guarantor.name || guarantor.name.trim().length < 3) {
      errors.name = "اسم الضامن يجب أن يكون 3 أحرف على الأقل";
    }

    if (!guarantor.nationalId) {
      errors.nationalId = "الرقم القومي مطلوب";
    } else if (!validateNationalId(guarantor.nationalId)) {
      errors.nationalId = "الرقم القومي يجب أن يكون 14 رقماً";
    }

    if (!guarantor.phone) {
      errors.phone = "رقم الهاتف مطلوب";
    } else if (!validatePhone(guarantor.phone)) {
      errors.phone = "رقم الهاتف غير صحيح (يجب أن يبدأ بـ 01)";
    }

    setGuarantorErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isCustomerValid = validateCustomer();
    const isGuarantorValid = validateGuarantor();

    if (!isCustomerValid || !isGuarantorValid) {
      showError("يرجى تصحيح الأخطاء في النموذج");
      return;
    }

    onSubmit(customer, guarantor);
    showSuccess(isEditing ? "تم تحديث البيانات بنجاح" : "تم حفظ البيانات بنجاح");
    
    if (!isEditing) {
      handleReset();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Data */}
      <Card className="border-slate-200 bg-white">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            بيانات العميل
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-sm font-medium text-slate-700">
                اسم العميل <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customerName"
                value={customer.name}
                onChange={(e) => {
                  setCustomer({ ...customer, name: e.target.value });
                  if (customerErrors.name) {
                    setCustomerErrors({ ...customerErrors, name: "" });
                  }
                }}
                placeholder="أدخل اسم العميل"
                className={`rounded-xl h-11 ${customerErrors.name ? "border-red-500" : ""}`}
                required
              />
              {customerErrors.name && (
                <p className="text-sm text-red-500">{customerErrors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerNationalId" className="text-sm font-medium text-slate-700">
                الرقم القومي <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customerNationalId"
                value={customer.nationalId}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setCustomer({ ...customer, nationalId: value });
                  if (customerErrors.nationalId) {
                    setCustomerErrors({ ...customerErrors, nationalId: "" });
                  }
                }}
                placeholder="14 رقم"
                className={`rounded-xl h-11 ${customerErrors.nationalId ? "border-red-500" : ""}`}
                maxLength={14}
                required
              />
              {customerErrors.nationalId && (
                <p className="text-sm text-red-500">{customerErrors.nationalId}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerAddress" className="text-sm font-medium text-slate-700">
                العنوان
              </Label>
              <Input
                id="customerAddress"
                value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                placeholder="العنوان التفصيلي"
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone" className="text-sm font-medium text-slate-700">
                رقم الهاتف <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customerPhone"
                value={customer.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setCustomer({ ...customer, phone: value });
                  if (customerErrors.phone) {
                    setCustomerErrors({ ...customerErrors, phone: "" });
                  }
                }}
                placeholder="01xxxxxxxxx"
                className={`rounded-xl h-11 ${customerErrors.phone ? "border-red-500" : ""}`}
                dir="ltr"
                maxLength={11}
                required
              />
              {customerErrors.phone && (
                <p className="text-sm text-red-500">{customerErrors.phone}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guarantor Data */}
      <Card className="border-slate-200 bg-white">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            بيانات الضامن
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guarantorName" className="text-sm font-medium text-slate-700">
                اسم الضامن <span className="text-red-500">*</span>
              </Label>
              <Input
                id="guarantorName"
                value={guarantor.name}
                onChange={(e) => {
                  setGuarantor({ ...guarantor, name: e.target.value });
                  if (guarantorErrors.name) {
                    setGuarantorErrors({ ...guarantorErrors, name: "" });
                  }
                }}
                placeholder="أدخل اسم الضامن"
                className={`rounded-xl h-11 ${guarantorErrors.name ? "border-red-500" : ""}`}
                required
              />
              {guarantorErrors.name && (
                <p className="text-sm text-red-500">{guarantorErrors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="guarantorNationalId" className="text-sm font-medium text-slate-700">
                الرقم القومي <span className="text-red-500">*</span>
              </Label>
              <Input
                id="guarantorNationalId"
                value={guarantor.nationalId}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setGuarantor({ ...guarantor, nationalId: value });
                  if (guarantorErrors.nationalId) {
                    setGuarantorErrors({ ...guarantorErrors, nationalId: "" });
                  }
                }}
                placeholder="14 رقم"
                className={`rounded-xl h-11 ${guarantorErrors.nationalId ? "border-red-500" : ""}`}
                maxLength={14}
                required
              />
              {guarantorErrors.nationalId && (
                <p className="text-sm text-red-500">{guarantorErrors.nationalId}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="guarantorAddress" className="text-sm font-medium text-slate-700">
                العنوان
              </Label>
              <Input
                id="guarantorAddress"
                value={guarantor.address}
                onChange={(e) => setGuarantor({ ...guarantor, address: e.target.value })}
                placeholder="العنوان التفصيلي"
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guarantorPhone" className="text-sm font-medium text-slate-700">
                رقم الهاتف <span className="text-red-500">*</span>
              </Label>
              <Input
                id="guarantorPhone"
                value={guarantor.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setGuarantor({ ...guarantor, phone: value });
                  if (guarantorErrors.phone) {
                    setGuarantorErrors({ ...guarantorErrors, phone: "" });
                  }
                }}
                placeholder="01xxxxxxxxx"
                className={`rounded-xl h-11 ${guarantorErrors.phone ? "border-red-500" : ""}`}
                dir="ltr"
                maxLength={11}
                required
              />
              {guarantorErrors.phone && (
                <p className="text-sm text-red-500">{guarantorErrors.phone}</p>
              )}
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
          className="rounded-xl bg-blue-600 hover:bg-blue-700 gap-2"
        >
          <Save className="h-4 w-4" />
          {isEditing ? "تحديث البيانات" : "حفظ البيانات"}
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm;
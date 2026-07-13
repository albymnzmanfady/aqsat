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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customer.name || !customer.nationalId || !customer.phone) {
      showError("يرجى ملء جميع بيانات العميل المطلوبة");
      return;
    }

    if (!guarantor.name || !guarantor.nationalId || !guarantor.phone) {
      showError("يرجى ملء جميع بيانات الضامن المطلوبة");
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
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                placeholder="أدخل اسم العميل"
                className="rounded-xl h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerNationalId" className="text-sm font-medium text-slate-700">
                الرقم القومي <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customerNationalId"
                value={customer.nationalId}
                onChange={(e) => setCustomer({ ...customer, nationalId: e.target.value })}
                placeholder="14 رقم"
                className="rounded-xl h-11"
                maxLength={14}
                required
              />
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
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                placeholder="01xxxxxxxxx"
                className="rounded-xl h-11"
                dir="ltr"
                required
              />
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
                onChange={(e) => setGuarantor({ ...guarantor, name: e.target.value })}
                placeholder="أدخل اسم الضامن"
                className="rounded-xl h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guarantorNationalId" className="text-sm font-medium text-slate-700">
                الرقم القومي <span className="text-red-500">*</span>
              </Label>
              <Input
                id="guarantorNationalId"
                value={guarantor.nationalId}
                onChange={(e) => setGuarantor({ ...guarantor, nationalId: e.target.value })}
                placeholder="14 رقم"
                className="rounded-xl h-11"
                maxLength={14}
                required
              />
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
                onChange={(e) => setGuarantor({ ...guarantor, phone: e.target.value })}
                placeholder="01xxxxxxxxx"
                className="rounded-xl h-11"
                dir="ltr"
                required
              />
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
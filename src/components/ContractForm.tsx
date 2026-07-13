"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Calculator, Package, User, Calendar, CreditCard, Shield, Plus, MapPin } from "lucide-react";
import { Customer, Product } from "@/types";

interface ContractFormProps {
  customers: Customer[];
  guarantors: Customer[];
  products: Product[];
  onSave: (data: any) => void;
  onCancel: () => void;
}

const ContractForm = ({ customers, guarantors, products, onSave, onCancel }: ContractFormProps) => {
  const [localGuarantors, setLocalGuarantors] = useState<Customer[]>(guarantors);
  const [localCustomers, setLocalCustomers] = useState<Customer[]>(customers);
  const [showNewGuarantorDialog, setShowNewGuarantorDialog] = useState(false);
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);

  // New guarantor form
  const [newGuarantorName, setNewGuarantorName] = useState("");
  const [newGuarantorPhone, setNewGuarantorPhone] = useState("");
  const [newGuarantorNationalId, setNewGuarantorNationalId] = useState("");
  const [newGuarantorAddress, setNewGuarantorAddress] = useState("");
  const [guarantorErrors, setGuarantorErrors] = useState<Record<string, string>>({});

  // New customer form
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerNationalId, setNewCustomerNationalId] = useState("");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");
  const [customerErrors, setCustomerErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    customerId: "",
    productId: "",
    downPayment: "",
    numberOfReceipts: "",
    startDate: "",
    guarantorId: "",
    guarantorName: "",
    guarantorPhone: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedProduct = products.find((p) => p.id === Number(formData.productId));

  const total = selectedProduct?.sellingPrice || 0;
  const down = Number(formData.downPayment) || 0;
  const receipts = Number(formData.numberOfReceipts) || 1;
  const installmentAmount = receipts > 0 ? Math.ceil((total - down) / receipts) : 0;

  // === Customer handlers ===
  const handleCustomerSelect = (value: string) => {
    if (value === "new") {
      setShowNewCustomerDialog(true);
      return;
    }
    const customer = localCustomers.find((c) => c.id === Number(value));
    if (customer) {
      setFormData({
        ...formData,
        customerId: value,
      });
    }
  };

  const validateNewCustomer = () => {
    const errs: Record<string, string> = {};
    if (!newCustomerName.trim()) errs.name = "الاسم مطلوب";
    if (!newCustomerPhone.trim()) errs.phone = "رقم الهاتف مطلوب";
    else if (!/^01[0-9]{9}$/.test(newCustomerPhone.replace(/\s/g, "")))
      errs.phone = "رقم غير صحيح";
    if (!newCustomerNationalId.trim()) errs.nationalId = "الرقم القومي مطلوب";
    else if (!/^[0-9]{14}$/.test(newCustomerNationalId.replace(/\s/g, "")))
      errs.nationalId = "يجب أن يتكون من 14 رقماً";
    if (!newCustomerAddress.trim()) errs.address = "العنوان مطلوب";
    setCustomerErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddNewCustomer = () => {
    if (!validateNewCustomer()) return;

    const newCustomer: Customer = {
      id: Math.max(0, ...localCustomers.map((c) => c.id)) + 1,
      name: newCustomerName.trim(),
      phone: newCustomerPhone.trim(),
      nationalId: newCustomerNationalId.trim(),
      address: newCustomerAddress.trim(),
      type: "customer",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setLocalCustomers((prev) => [...prev, newCustomer]);
    setFormData({ ...formData, customerId: newCustomer.id.toString() });

    resetNewCustomerForm();
    setShowNewCustomerDialog(false);
  };

  const resetNewCustomerForm = () => {
    setNewCustomerName("");
    setNewCustomerPhone("");
    setNewCustomerNationalId("");
    setNewCustomerAddress("");
    setCustomerErrors({});
  };

  // === Guarantor handlers ===
  const handleGuarantorSelect = (value: string) => {
    if (value === "new") {
      setShowNewGuarantorDialog(true);
      return;
    }
    const guarantor = localGuarantors.find((g) => g.id === Number(value));
    if (guarantor) {
      setFormData({
        ...formData,
        guarantorId: value,
        guarantorName: guarantor.name,
        guarantorPhone: guarantor.phone,
      });
    }
  };

  const validateNewGuarantor = () => {
    const errs: Record<string, string> = {};
    if (!newGuarantorName.trim()) errs.name = "الاسم مطلوب";
    if (!newGuarantorPhone.trim()) errs.phone = "رقم الهاتف مطلوب";
    else if (!/^01[0-9]{9}$/.test(newGuarantorPhone.replace(/\s/g, "")))
      errs.phone = "رقم غير صحيح";
    if (!newGuarantorNationalId.trim()) errs.nationalId = "رقم البطاقة مطلوب";
    else if (!/^[0-9]{14}$/.test(newGuarantorNationalId.replace(/\s/g, "")))
      errs.nationalId = "يجب أن يتكون من 14 رقماً";
    setGuarantorErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddNewGuarantor = () => {
    if (!validateNewGuarantor()) return;

    const newGuarantor: Customer = {
      id: Math.max(0, ...localGuarantors.map((g) => g.id)) + 1,
      name: newGuarantorName.trim(),
      phone: newGuarantorPhone.trim(),
      nationalId: newGuarantorNationalId.trim(),
      address: newGuarantorAddress.trim() || "",
      type: "guarantor",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setLocalGuarantors((prev) => [...prev, newGuarantor]);
    setFormData({
      ...formData,
      guarantorId: newGuarantor.id.toString(),
      guarantorName: newGuarantor.name,
      guarantorPhone: newGuarantor.phone,
    });

    resetNewGuarantorForm();
    setShowNewGuarantorDialog(false);
  };

  const resetNewGuarantorForm = () => {
    setNewGuarantorName("");
    setNewGuarantorPhone("");
    setNewGuarantorNationalId("");
    setNewGuarantorAddress("");
    setGuarantorErrors({});
  };

  // === Main form ===
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.customerId) newErrors.customerId = "اختر العميل";
    if (!formData.productId) newErrors.productId = "اختر المنتج";
    else if (selectedProduct && selectedProduct.currentStock <= 0)
      newErrors.productId = "هذا المنتج غير متوفر حالياً";
    if (Number(formData.downPayment) >= total && total > 0) newErrors.downPayment = "المقدم لا يمكن أن يساوي السعر أو يزيد";
    if (!formData.numberOfReceipts || Number(formData.numberOfReceipts) <= 0) newErrors.numberOfReceipts = "عدد الأقساط يجب أن يكون 1 على الأقل";
    if (!formData.startDate) newErrors.startDate = "تاريخ البدء مطلوب";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (validate()) {
      const customer = localCustomers.find((c) => c.id === Number(formData.customerId));
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
    <>
      <form onSubmit={handleSubmit} className="px-8 pb-2 space-y-5 max-h-[70vh] overflow-y-auto">
        {/* العميل */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-slate-400" />
            العميل
          </Label>
          <Select
            value={formData.customerId}
            onValueChange={handleCustomerSelect}
          >
            <SelectTrigger className={errors.customerId ? "border-red-300" : ""}>
              <SelectValue placeholder="اختر العميل" />
            </SelectTrigger>
            <SelectContent>
              {localCustomers.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.name} - {c.phone}
                </SelectItem>
              ))}
              <SelectItem value="new">
                <div className="flex items-center gap-2 text-violet-600 font-semibold">
                  <Plus className="h-3.5 w-3.5" />
                  إضافة عميل جديد
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.customerId && <p className="text-xs text-red-500">{errors.customerId}</p>}
          {formData.customerId && formData.customerId !== "new" && (
            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {localCustomers.find(c => c.id === Number(formData.customerId))?.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-700">
                    {localCustomers.find(c => c.id === Number(formData.customerId))?.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {localCustomers.find(c => c.id === Number(formData.customerId))?.phone}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* المنتج */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <Package className="h-3.5 w-3.5 text-slate-400" />
            المنتج
          </Label>
          <Select
            value={formData.productId}
            onValueChange={(val) => setFormData({ ...formData, productId: val })}
          >
            <SelectTrigger className={errors.productId ? "border-red-300" : ""}>
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
          {errors.productId && <p className="text-xs text-red-500">{errors.productId}</p>}
          {selectedProduct && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-100 px-3 py-2.5 rounded-xl mt-1">
              <Package className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" />
              <span>سعر البيع: <strong className="text-slate-700">{selectedProduct.sellingPrice.toLocaleString()} ج.م</strong></span>
              <span className="text-slate-300">•</span>
              <span>المخزون: <strong className={selectedProduct.currentStock <= selectedProduct.minStock ? "text-amber-600" : "text-slate-700"}>{selectedProduct.currentStock} {selectedProduct.unit}</strong></span>
            </div>
          )}
        </div>

        {/* الدفعة المقدمة وعدد الأقساط */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <CreditCard className="h-3.5 w-3.5 text-slate-400" />
              المدفوع مقدماً
            </Label>
            <Input
              type="number"
              value={formData.downPayment}
              onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
              className={errors.downPayment ? "border-red-300" : ""}
              placeholder="0"
            />
            {errors.downPayment && <p className="text-xs text-red-500">{errors.downPayment}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              عدد الأقساط
            </Label>
            <Input
              type="number"
              value={formData.numberOfReceipts}
              onChange={(e) => setFormData({ ...formData, numberOfReceipts: e.target.value })}
              className={errors.numberOfReceipts ? "border-red-300" : ""}
              placeholder="12"
            />
            {errors.numberOfReceipts && <p className="text-xs text-red-500">{errors.numberOfReceipts}</p>}
          </div>
        </div>

        {/* تاريخ البدء */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            تاريخ البدء
          </Label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className={errors.startDate ? "border-red-300" : ""}
          />
          {errors.startDate && <p className="text-xs text-red-500">{errors.startDate}</p>}
        </div>

        {/* ملخص الحساب */}
        {installmentAmount > 0 && selectedProduct && (
          <div className="p-5 bg-gradient-to-br from-violet-50 via-purple-50/80 to-indigo-50 rounded-2xl border border-violet-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Calculator className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold text-violet-700">ملخص الحساب</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/60 rounded-xl p-3 border border-violet-100/50">
                <p className="text-xs text-slate-500 mb-0.5">سعر المنتج</p>
                <p className="font-bold text-slate-800">{selectedProduct.sellingPrice.toLocaleString()} ج.م</p>
              </div>
              <div className="bg-white/60 rounded-xl p-3 border border-violet-100/50">
                <p className="text-xs text-slate-500 mb-0.5">المبلغ المتبقي</p>
                <p className="font-bold text-slate-800">{(total - down).toLocaleString()} ج.م</p>
              </div>
              <div className="bg-violet-100/50 rounded-xl p-3 border border-violet-200/50">
                <p className="text-xs text-violet-600 mb-0.5">القسط الشهري</p>
                <p className="font-bold text-violet-700">{installmentAmount.toLocaleString()} ج.م</p>
              </div>
              <div className="bg-white/60 rounded-xl p-3 border border-violet-100/50">
                <p className="text-xs text-slate-500 mb-0.5">عدد الأقساط</p>
                <p className="font-bold text-slate-800">{receipts} قسط</p>
              </div>
            </div>
          </div>
        )}

        {/* الضامن */}
        <div className="border-t border-slate-100 pt-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-slate-400" />
            <p className="text-sm font-semibold text-slate-600">بيانات الضامن</p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-600">اختر الضامن</Label>
              <Select
                value={formData.guarantorId}
                onValueChange={handleGuarantorSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر ضامن من القائمة" />
                </SelectTrigger>
                <SelectContent>
                  {localGuarantors.map((g) => (
                    <SelectItem key={g.id} value={g.id.toString()}>
                      {g.name} - {g.phone}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">
                    <div className="flex items-center gap-2 text-violet-600 font-semibold">
                      <Plus className="h-3.5 w-3.5" />
                      إضافة ضامن جديد
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* عرض بيانات الضامن المختار */}
            {formData.guarantorId && formData.guarantorId !== "new" && (
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {formData.guarantorName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-700">{formData.guarantorName}</p>
                    <p className="text-xs text-slate-500">{formData.guarantorPhone}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl h-11 px-6 border-slate-200 text-slate-600 hover:bg-slate-50">
            إلغاء
          </Button>
          <Button type="submit" className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 h-11 px-8 shadow-lg shadow-violet-500/20 gap-2" disabled={selectedProduct?.currentStock === 0}>
            <Sparkles className="h-4 w-4" />
            إنشاء العقد
          </Button>
        </DialogFooter>
      </form>

      {/* ===== Dialog إضافة عميل جديد ===== */}
      <Dialog open={showNewCustomerDialog} onOpenChange={(open) => { setShowNewCustomerDialog(open); if (!open) resetNewCustomerForm(); }}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-500" />
              إضافة عميل جديد
            </DialogTitle>
            <DialogDescription>
              أدخل بيانات العميل الجديد
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-slate-400" />
                اسم العميل
              </Label>
              <Input
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                placeholder="الاسم الكامل"
                className={customerErrors.name ? "border-red-300" : ""}
              />
              {customerErrors.name && <p className="text-xs text-red-500">{customerErrors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                رقم الهاتف
              </Label>
              <Input
                value={newCustomerPhone}
                onChange={(e) => setNewCustomerPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 11))}
                placeholder="01012345678"
                dir="ltr"
                className={customerErrors.phone ? "border-red-300" : ""}
              />
              {customerErrors.phone && <p className="text-xs text-red-500">{customerErrors.phone}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                الرقم القومي
              </Label>
              <Input
                value={newCustomerNationalId}
                onChange={(e) => setNewCustomerNationalId(e.target.value.replace(/[^0-9]/g, "").slice(0, 14))}
                placeholder="14 رقماً"
                dir="ltr"
                className={customerErrors.nationalId ? "border-red-300" : ""}
              />
              {customerErrors.nationalId && <p className="text-xs text-red-500">{customerErrors.nationalId}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                العنوان
              </Label>
              <Input
                value={newCustomerAddress}
                onChange={(e) => setNewCustomerAddress(e.target.value)}
                placeholder="العنوان بالكامل"
                className={customerErrors.address ? "border-red-300" : ""}
              />
              {customerErrors.address && <p className="text-xs text-red-500">{customerErrors.address}</p>}
            </div>
          </div>

          <DialogFooter className="px-2">
            <Button
              variant="outline"
              onClick={() => { setShowNewCustomerDialog(false); resetNewCustomerForm(); }}
              className="rounded-xl h-11"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleAddNewCustomer}
              className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 h-11 gap-2"
              disabled={!newCustomerName.trim() || !newCustomerPhone.trim() || !newCustomerNationalId.trim() || !newCustomerAddress.trim()}
            >
              <Plus className="h-4 w-4" />
              إضافة واختيار
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Dialog إضافة ضامن جديد ===== */}
      <Dialog open={showNewGuarantorDialog} onOpenChange={(open) => { setShowNewGuarantorDialog(open); if (!open) resetNewGuarantorForm(); }}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-500" />
              إضافة ضامن جديد
            </DialogTitle>
            <DialogDescription>
              أدخل بيانات الضامن الجديد
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-slate-400" />
                اسم الضامن
              </Label>
              <Input
                value={newGuarantorName}
                onChange={(e) => setNewGuarantorName(e.target.value)}
                placeholder="الاسم الكامل"
                className={guarantorErrors.name ? "border-red-300" : ""}
              />
              {guarantorErrors.name && <p className="text-xs text-red-500">{guarantorErrors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                رقم الهاتف
              </Label>
              <Input
                value={newGuarantorPhone}
                onChange={(e) => setNewGuarantorPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 11))}
                placeholder="01012345678"
                dir="ltr"
                className={guarantorErrors.phone ? "border-red-300" : ""}
              />
              {guarantorErrors.phone && <p className="text-xs text-red-500">{guarantorErrors.phone}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                رقم البطاقة الشخصية <span className="text-red-500">*</span>
              </Label>
              <Input
                value={newGuarantorNationalId}
                onChange={(e) => setNewGuarantorNationalId(e.target.value.replace(/[^0-9]/g, "").slice(0, 14))}
                placeholder="14 رقماً"
                dir="ltr"
                className={guarantorErrors.nationalId ? "border-red-300" : ""}
              />
              {guarantorErrors.nationalId && <p className="text-xs text-red-500">{guarantorErrors.nationalId}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                العنوان (اختياري)
              </Label>
              <Input
                value={newGuarantorAddress}
                onChange={(e) => setNewGuarantorAddress(e.target.value)}
                placeholder="العنوان"
              />
            </div>
          </div>

          <DialogFooter className="px-2">
            <Button
              variant="outline"
              onClick={() => { setShowNewGuarantorDialog(false); resetNewGuarantorForm(); }}
              className="rounded-xl h-11"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleAddNewGuarantor}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 h-11 gap-2"
              disabled={!newGuarantorName.trim() || !newGuarantorPhone.trim() || !newGuarantorNationalId.trim()}
            >
              <Plus className="h-4 w-4" />
              إضافة واختيار
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContractForm;
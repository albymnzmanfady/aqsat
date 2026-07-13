"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Calculator, Package, User, Calendar, CreditCard, Shield, Plus, MapPin } from "lucide-react";
import { ApiCustomer, ApiProduct, api } from "@/lib/api";
import { showSuccess, showError } from "@/utils/toast";

interface ContractFormProps {
  customers: ApiCustomer[];
  guarantors: ApiCustomer[];
  products: ApiProduct[];
  onSave: (data: any) => void;
  onCancel: () => void;
}

const ContractForm = ({ customers, guarantors, products, onSave, onCancel }: ContractFormProps) => {
  const [localGuarantors, setLocalGuarantors] = useState<ApiCustomer[]>(guarantors);
  const [localCustomers, setLocalCustomers] = useState<ApiCustomer[]>(customers);
  const [showNewGuarantorDialog, setShowNewGuarantorDialog] = useState(false);
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);

  const [newGuarantorName, setNewGuarantorName] = useState("");
  const [newGuarantorPhone, setNewGuarantorPhone] = useState("");
  const [newGuarantorNationalId, setNewGuarantorNationalId] = useState("");
  const [newGuarantorAddress, setNewGuarantorAddress] = useState("");
  const [guarantorErrors, setGuarantorErrors] = useState<Record<string, string>>({});

  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerNationalId, setNewCustomerNationalId] = useState("");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");
  const [customerErrors, setCustomerErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    customerId: "", productId: "", downPayment: "", numberOfReceipts: "", startDate: "",
    guarantorId: "", guarantorName: "", guarantorPhone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedProduct = products.find((p) => p.id === Number(formData.productId));
  const total = selectedProduct?.selling_price || 0;
  const down = Number(formData.downPayment) || 0;
  const receipts = Number(formData.numberOfReceipts) || 1;
  const installmentAmount = receipts > 0 ? Math.ceil((total - down) / receipts) : 0;

  const handleCustomerSelect = (value: string) => {
    if (value === "new") { setShowNewCustomerDialog(true); return; }
    setFormData({ ...formData, customerId: value });
  };

  const validateNewCustomer = () => {
    const errs: Record<string, string> = {};
    if (!newCustomerName.trim()) errs.name = "الاسم مطلوب";
    if (!newCustomerPhone.trim() || !/^01[0-9]{9}$/.test(newCustomerPhone.replace(/\s/g, ""))) errs.phone = "رقم غير صحيح";
    if (!newCustomerNationalId.trim() || !/^[0-9]{14}$/.test(newCustomerNationalId.replace(/\s/g, ""))) errs.nationalId = "14 رقماً";
    if (!newCustomerAddress.trim()) errs.address = "العنوان مطلوب";
    setCustomerErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddNewCustomer = async () => {
    if (!validateNewCustomer()) return;
    try {
      const newCustomer = await api.customers.create({
        name: newCustomerName.trim(), phone: newCustomerPhone.trim(),
        nationalId: newCustomerNationalId.trim(), address: newCustomerAddress.trim(), type: "customer",
      });
      setLocalCustomers((prev) => [...prev, newCustomer]);
      setFormData({ ...formData, customerId: newCustomer.id.toString() });
      showSuccess("✅ تم إضافة العميل");
      setNewCustomerName(""); setNewCustomerPhone(""); setNewCustomerNationalId(""); setNewCustomerAddress(""); setCustomerErrors({});
      setShowNewCustomerDialog(false);
    } catch (e: any) { showError("خطأ: " + e.message); }
  };

  const handleGuarantorSelect = (value: string) => {
    if (value === "new") { setShowNewGuarantorDialog(true); return; }
    const guarantor = localGuarantors.find((g) => g.id === Number(value));
    if (guarantor) setFormData({ ...formData, guarantorId: value, guarantorName: guarantor.name, guarantorPhone: guarantor.phone });
  };

  const validateNewGuarantor = () => {
    const errs: Record<string, string> = {};
    if (!newGuarantorName.trim()) errs.name = "الاسم مطلوب";
    if (!newGuarantorPhone.trim() || !/^01[0-9]{9}$/.test(newGuarantorPhone.replace(/\s/g, ""))) errs.phone = "رقم غير صحيح";
    if (!newGuarantorNationalId.trim() || !/^[0-9]{14}$/.test(newGuarantorNationalId.replace(/\s/g, ""))) errs.nationalId = "14 رقماً";
    setGuarantorErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddNewGuarantor = async () => {
    if (!validateNewGuarantor()) return;
    try {
      const newGuarantor = await api.customers.create({
        name: newGuarantorName.trim(), phone: newGuarantorPhone.trim(),
        nationalId: newGuarantorNationalId.trim(), address: newGuarantorAddress.trim(), type: "guarantor",
      });
      setLocalGuarantors((prev) => [...prev, newGuarantor]);
      setFormData({ ...formData, guarantorId: newGuarantor.id.toString(), guarantorName: newGuarantor.name, guarantorPhone: newGuarantor.phone });
      showSuccess("✅ تم إضافة الضامن");
      setNewGuarantorName(""); setNewGuarantorPhone(""); setNewGuarantorNationalId(""); setNewGuarantorAddress(""); setGuarantorErrors({});
      setShowNewGuarantorDialog(false);
    } catch (e: any) { showError("خطأ: " + e.message); }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.customerId) newErrors.customerId = "اختر العميل";
    if (!formData.productId) newErrors.productId = "اختر المنتج";
    else if (selectedProduct && selectedProduct.current_stock <= 0) newErrors.productId = "غير متوفر";
    if (Number(formData.downPayment) >= total && total > 0) newErrors.downPayment = "المقدم لا يساوي السعر";
    if (!formData.numberOfReceipts || Number(formData.numberOfReceipts) <= 0) newErrors.numberOfReceipts = "1 على الأقل";
    if (!formData.startDate) newErrors.startDate = "تاريخ البدء مطلوب";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !validate()) return;
    const customer = localCustomers.find((c) => c.id === Number(formData.customerId));
    const startDate = new Date(formData.startDate);
    startDate.setMonth(startDate.getMonth() + Number(formData.numberOfReceipts));
    onSave({
      customerId: Number(formData.customerId), customerName: customer?.name || "", customerPhone: customer?.phone || "",
      productType: selectedProduct.name, productId: selectedProduct.id, totalPrice: selectedProduct.selling_price,
      downPayment: Number(formData.downPayment), numberOfReceipts: Number(formData.numberOfReceipts), installmentAmount,
      startDate: formData.startDate, endDate: startDate.toISOString().split("T")[0],
      guarantorName: formData.guarantorName, guarantorPhone: formData.guarantorPhone, status: "active",
    });
  };

  const selectedCustomer = localCustomers.find(c => c.id === Number(formData.customerId));

  return (
    <>
      <form onSubmit={handleSubmit} className="px-8 pb-2 space-y-5 max-h-[70vh] overflow-y-auto">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-600 flex items-center gap-2"><User className="h-3.5 w-3.5 text-slate-400" />العميل</Label>
          <Select value={formData.customerId} onValueChange={handleCustomerSelect}>
            <SelectTrigger className={errors.customerId ? "border-red-300" : ""}><SelectValue placeholder="اختر العميل" /></SelectTrigger>
            <SelectContent>
              {localCustomers.filter((c) => c.type === "customer").map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.name} - {c.phone}</SelectItem>)}
              <SelectItem value="new"><div className="flex items-center gap-2 text-violet-600 font-semibold"><Plus className="h-3.5 w-3.5" />عميل جديد</div></SelectItem>
            </SelectContent>
          </Select>
          {errors.customerId && <p className="text-xs text-red-500">{errors.customerId}</p>}
          {selectedCustomer && <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">{selectedCustomer.name.charAt(0)}</div><div><p className="font-semibold text-sm text-slate-700">{selectedCustomer.name}</p><p className="text-xs text-slate-500">{selectedCustomer.phone}</p></div></div></div>}
        </div>

        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2 mb-3"><Shield className="h-4 w-4 text-slate-400" /><p className="text-sm font-semibold text-slate-600">بيانات الضامن</p></div>
          <div className="space-y-3">
            <Select value={formData.guarantorId} onValueChange={handleGuarantorSelect}>
              <SelectTrigger><SelectValue placeholder="اختر ضامن" /></SelectTrigger>
              <SelectContent>
                {localGuarantors.filter((g) => g.type === "guarantor").map((g) => <SelectItem key={g.id} value={g.id.toString()}>{g.name} - {g.phone}</SelectItem>)}
                <SelectItem value="new"><div className="flex items-center gap-2 text-violet-600 font-semibold"><Plus className="h-3.5 w-3.5" />ضامن جديد</div></SelectItem>
              </SelectContent>
            </Select>
            {!formData.guarantorId && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">اسم الضامن</Label><Input value={formData.guarantorName} onChange={(e) => setFormData({ ...formData, guarantorName: e.target.value })} placeholder="اختياري" /></div>
                <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">رقم الضامن</Label><Input value={formData.guarantorPhone} onChange={(e) => setFormData({ ...formData, guarantorPhone: e.target.value.replace(/[^0-9]/g, "").slice(0, 11) })} placeholder="01012345678" dir="ltr" /></div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-600 flex items-center gap-2"><Package className="h-3.5 w-3.5 text-slate-400" />المنتج</Label>
          <Select value={formData.productId} onValueChange={(val) => setFormData({ ...formData, productId: val })}>
            <SelectTrigger className={errors.productId ? "border-red-300" : ""}><SelectValue placeholder="اختر المنتج" /></SelectTrigger>
            <SelectContent>
              {products.map((p) => <SelectItem key={p.id} value={p.id.toString()} disabled={p.current_stock <= 0}>{p.name} ({p.current_stock} {p.unit})</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.productId && <p className="text-xs text-red-500">{errors.productId}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">المقدم</Label><Input type="number" value={formData.downPayment} onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })} placeholder="0" className={errors.downPayment ? "border-red-300" : ""} />{errors.downPayment && <p className="text-xs text-red-500">{errors.downPayment}</p>}</div>
          <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">عدد الأقساط</Label><Input type="number" value={formData.numberOfReceipts} onChange={(e) => setFormData({ ...formData, numberOfReceipts: e.target.value })} placeholder="12" className={errors.numberOfReceipts ? "border-red-300" : ""} />{errors.numberOfReceipts && <p className="text-xs text-red-500">{errors.numberOfReceipts}</p>}</div>
        </div>

        <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">تاريخ البدء</Label><Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className={errors.startDate ? "border-red-300" : ""} />{errors.startDate && <p className="text-xs text-red-500">{errors.startDate}</p>}</div>

        {installmentAmount > 0 && selectedProduct && (
          <div className="p-5 bg-gradient-to-br from-violet-50 via-purple-50/80 to-indigo-50 rounded-2xl border border-violet-100">
            <div className="flex items-center gap-2 mb-3"><div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"><Calculator className="h-4 w-4 text-white" /></div><span className="text-sm font-bold text-violet-700">ملخص</span></div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/60 rounded-xl p-3 border border-violet-100/50"><p className="text-xs text-slate-500">السعر</p><p className="font-bold text-slate-800">{total.toLocaleString()} ج.م</p></div>
              <div className="bg-white/60 rounded-xl p-3 border border-violet-100/50"><p className="text-xs text-slate-500">المتبقي</p><p className="font-bold text-slate-800">{(total - down).toLocaleString()} ج.م</p></div>
              <div className="bg-violet-100/50 rounded-xl p-3 border border-violet-200/50"><p className="text-xs text-violet-600">القسط الشهري</p><p className="font-bold text-violet-700">{installmentAmount.toLocaleString()} ج.م</p></div>
              <div className="bg-white/60 rounded-xl p-3 border border-violet-100/50"><p className="text-xs text-slate-500">العدد</p><p className="font-bold text-slate-800">{receipts} قسط</p></div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl h-11 px-6">إلغاء</Button>
          <Button type="submit" className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 h-11 px-8 gap-2" disabled={selectedProduct?.current_stock === 0}><Sparkles className="h-4 w-4" />إنشاء العقد</Button>
        </DialogFooter>
      </form>

      {/* Dialog: New Customer */}
      <Dialog open={showNewCustomerDialog} onOpenChange={(open) => { setShowNewCustomerDialog(open); if (!open) { setNewCustomerName(""); setNewCustomerPhone(""); setNewCustomerNationalId(""); setNewCustomerAddress(""); setCustomerErrors({}); } }}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl">
          <DialogHeader><DialogTitle className="text-xl flex items-center gap-2"><Plus className="h-5 w-5 text-blue-500" />عميل جديد</DialogTitle></DialogHeader>
          <div className="space-y-4 px-2">
            <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">الاسم</Label><Input value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} placeholder="الاسم" className={customerErrors.name ? "border-red-300" : ""} />{customerErrors.name && <p className="text-xs text-red-500">{customerErrors.name}</p>}</div>
            <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">الهاتف</Label><Input value={newCustomerPhone} onChange={(e) => setNewCustomerPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 11))} placeholder="01012345678" dir="ltr" className={customerErrors.phone ? "border-red-300" : ""} />{customerErrors.phone && <p className="text-xs text-red-500">{customerErrors.phone}</p>}</div>
            <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">الرقم القومي</Label><Input value={newCustomerNationalId} onChange={(e) => setNewCustomerNationalId(e.target.value.replace(/[^0-9]/g, "").slice(0, 14))} placeholder="14 رقماً" dir="ltr" className={customerErrors.nationalId ? "border-red-300" : ""} />{customerErrors.nationalId && <p className="text-xs text-red-500">{customerErrors.nationalId}</p>}</div>
            <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">العنوان</Label><Input value={newCustomerAddress} onChange={(e) => setNewCustomerAddress(e.target.value)} placeholder="العنوان" className={customerErrors.address ? "border-red-300" : ""} />{customerErrors.address && <p className="text-xs text-red-500">{customerErrors.address}</p>}</div>
          </div>
          <DialogFooter className="px-2">
            <Button variant="outline" onClick={() => { setShowNewCustomerDialog(false); setNewCustomerName(""); setNewCustomerPhone(""); setNewCustomerNationalId(""); setNewCustomerAddress(""); setCustomerErrors({}); }} className="rounded-xl h-11">إلغاء</Button>
            <Button onClick={handleAddNewCustomer} className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 h-11 gap-2" disabled={!newCustomerName.trim() || !newCustomerPhone.trim() || !newCustomerNationalId.trim() || !newCustomerAddress.trim()}><Plus className="h-4 w-4" />إضافة واختيار</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: New Guarantor */}
      <Dialog open={showNewGuarantorDialog} onOpenChange={(open) => { setShowNewGuarantorDialog(open); if (!open) { setNewGuarantorName(""); setNewGuarantorPhone(""); setNewGuarantorNationalId(""); setNewGuarantorAddress(""); setGuarantorErrors({}); } }}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl">
          <DialogHeader><DialogTitle className="text-xl flex items-center gap-2"><Plus className="h-5 w-5 text-emerald-500" />ضامن جديد</DialogTitle></DialogHeader>
          <div className="space-y-4 px-2">
            <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">الاسم</Label><Input value={newGuarantorName} onChange={(e) => setNewGuarantorName(e.target.value)} placeholder="الاسم" className={guarantorErrors.name ? "border-red-300" : ""} />{guarantorErrors.name && <p className="text-xs text-red-500">{guarantorErrors.name}</p>}</div>
            <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">الهاتف</Label><Input value={newGuarantorPhone} onChange={(e) => setNewGuarantorPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 11))} placeholder="01012345678" dir="ltr" className={guarantorErrors.phone ? "border-red-300" : ""} />{guarantorErrors.phone && <p className="text-xs text-red-500">{guarantorErrors.phone}</p>}</div>
            <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">رقم البطاقة *</Label><Input value={newGuarantorNationalId} onChange={(e) => setNewGuarantorNationalId(e.target.value.replace(/[^0-9]/g, "").slice(0, 14))} placeholder="14 رقماً" dir="ltr" className={guarantorErrors.nationalId ? "border-red-300" : ""} />{guarantorErrors.nationalId && <p className="text-xs text-red-500">{guarantorErrors.nationalId}</p>}</div>
            <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">العنوان</Label><Input value={newGuarantorAddress} onChange={(e) => setNewGuarantorAddress(e.target.value)} placeholder="اختياري" /></div>
          </div>
          <DialogFooter className="px-2">
            <Button variant="outline" onClick={() => { setShowNewGuarantorDialog(false); setNewGuarantorName(""); setNewGuarantorPhone(""); setNewGuarantorNationalId(""); setNewGuarantorAddress(""); setGuarantorErrors({}); }} className="rounded-xl h-11">إلغاء</Button>
            <Button onClick={handleAddNewGuarantor} className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 h-11 gap-2" disabled={!newGuarantorName.trim() || !newGuarantorPhone.trim() || !newGuarantorNationalId.trim()}><Plus className="h-4 w-4" />إضافة واختيار</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContractForm;
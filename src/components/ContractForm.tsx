"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter, Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Calculator, Package, User, Shield, Plus } from "lucide-react";
import { ApiCustomer, ApiProduct } from "@/lib/api";
import { showSuccess, showError } from "@/utils/toast";
import { api } from "@/lib/api";

interface ContractFormProps {
  customers: ApiCustomer[];
  guarantors: ApiCustomer[];
  products: ApiProduct[];
  onSave: (data: any) => void;
  onCancel: () => void;
  initialValues?: { price?: number; downPayment?: string; numberOfReceipts?: string };
}

const ContractForm = ({ customers, guarantors, products, onSave, onCancel, initialValues }: ContractFormProps) => {
  const [localGuarantors, setLocalGuarantors] = useState<ApiCustomer[]>(guarantors);
  const [localCustomers, setLocalCustomers] = useState<ApiCustomer[]>(customers);
  const [localProducts, setLocalProducts] = useState<ApiProduct[]>(products);

  const [showNewGuarantorDialog, setShowNewGuarantorDialog] = useState(false);
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);
  const [showNewProductDialog, setShowNewProductDialog] = useState(false);

  // نموذج ضامن جديد
  const [newGuarantorName, setNewGuarantorName] = useState("");
  const [newGuarantorPhone, setNewGuarantorPhone] = useState("");
  const [newGuarantorNationalId, setNewGuarantorNationalId] = useState("");
  const [newGuarantorAddress, setNewGuarantorAddress] = useState("");
  const [guarantorErrors, setGuarantorErrors] = useState<Record<string, string>>({});

  // نموذج عميل جديد
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerNationalId, setNewCustomerNationalId] = useState("");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");
  const [customerErrors, setCustomerErrors] = useState<Record<string, string>>({});

  // نموذج منتج جديد
  const [newProductName, setNewProductName] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("");
  const [newProductUnit, setNewProductUnit] = useState("قطعة");
  const [newProductCostPrice, setNewProductCostPrice] = useState("");
  const [newProductSellingPrice, setNewProductSellingPrice] = useState("");
  const [newProductCurrentStock, setNewProductCurrentStock] = useState("1");
  const [newProductMinStock, setNewProductMinStock] = useState("0");
  const [productErrors, setProductErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    customerId: "",
    productId: "",
    downPayment: initialValues?.downPayment || "",
    numberOfReceipts: initialValues?.numberOfReceipts || "",
    startDate: new Date().toISOString().split("T")[0],
    guarantorId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { setLocalProducts(products); }, [products]);
  useEffect(() => { setLocalCustomers(customers); }, [customers]);
  useEffect(() => { setLocalGuarantors(guarantors); }, [guarantors]);

  useEffect(() => {
    if (initialValues?.price && localProducts.length > 0) {
      let closest = localProducts[0];
      let minDiff = Math.abs(localProducts[0].selling_price - initialValues.price);
      for (let i = 1; i < localProducts.length; i++) {
        const diff = Math.abs(localProducts[i].selling_price - initialValues.price);
        if (diff < minDiff && localProducts[i].current_stock > 0) { minDiff = diff; closest = localProducts[i]; }
      }
      if (closest.current_stock > 0) setFormData((prev) => ({ ...prev, productId: closest.id.toString() }));
    }
  }, [initialValues, localProducts]);

  const selectedProduct = localProducts.find((p) => p.id === Number(formData.productId));
  const selectedCustomer = localCustomers.find((c) => c.id === Number(formData.customerId));
  const selectedGuarantor = localGuarantors.find((g) => g.id === Number(formData.guarantorId));
  const total = selectedProduct?.selling_price || 0;
  const down = Number(formData.downPayment) || 0;
  const receipts = Number(formData.numberOfReceipts) || 1;
  const installmentAmount = receipts > 0 ? Math.ceil((total - down) / receipts) : 0;

  // === تعامل مع اختيار العميل ===
  const handleCustomerSelect = (value: string) => {
    if (value === "new") { setShowNewCustomerDialog(true); return; }
    setFormData({ ...formData, customerId: value });
  };

  // === تعامل مع اختيار الضامن (بدون حقول يدوية) ===
  const handleGuarantorSelect = (value: string) => {
    if (value === "new") { setShowNewGuarantorDialog(true); return; }
    setFormData({ ...formData, guarantorId: value });
  };

  // === تعامل مع اختيار المنتج ===
  const handleProductSelect = (value: string) => {
    if (value === "new") { setShowNewProductDialog(true); return; }
    setFormData({ ...formData, productId: value });
  };

  // === إضافة عميل جديد ===
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
      const newCustomer = await api.customers.create({ name: newCustomerName.trim(), phone: newCustomerPhone.trim(), nationalId: newCustomerNationalId.trim(), address: newCustomerAddress.trim(), type: "customer" });
      setLocalCustomers((prev) => [...prev, newCustomer]);
      setFormData({ ...formData, customerId: newCustomer.id.toString() });
      showSuccess("✅ تم إضافة العميل");
      setNewCustomerName(""); setNewCustomerPhone(""); setNewCustomerNationalId(""); setNewCustomerAddress(""); setCustomerErrors({});
      setShowNewCustomerDialog(false);
    } catch (e: any) { showError("خطأ: " + e.message); }
  };

  // === إضافة ضامن جديد ===
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
      const newGuarantor = await api.customers.create({ name: newGuarantorName.trim(), phone: newGuarantorPhone.trim(), nationalId: newGuarantorNationalId.trim(), address: newGuarantorAddress.trim(), type: "guarantor" });
      setLocalGuarantors((prev) => [...prev, newGuarantor]);
      setFormData({ ...formData, guarantorId: newGuarantor.id.toString() });
      showSuccess("✅ تم إضافة الضامن");
      setNewGuarantorName(""); setNewGuarantorPhone(""); setNewGuarantorNationalId(""); setNewGuarantorAddress(""); setGuarantorErrors({});
      setShowNewGuarantorDialog(false);
    } catch (e: any) { showError("خطأ: " + e.message); }
  };

  // === إضافة منتج جديد ===
  const validateNewProduct = () => {
    const errs: Record<string, string> = {};
    if (!newProductName.trim()) errs.name = "اسم المنتج مطلوب";
    if (!newProductCategory.trim()) errs.category = "التصنيف مطلوب";
    if (!newProductCostPrice || Number(newProductCostPrice) <= 0) errs.costPrice = "سعر التكلفة غير صحيح";
    if (!newProductSellingPrice || Number(newProductSellingPrice) <= 0) errs.sellingPrice = "سعر البيع غير صحيح";
    setProductErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddNewProduct = async () => {
    if (!validateNewProduct()) return;
    try {
      const newProd = await api.products.create({ name: newProductName.trim(), category: newProductCategory.trim(), unit: newProductUnit.trim() || "قطعة", costPrice: Number(newProductCostPrice), sellingPrice: Number(newProductSellingPrice), currentStock: Number(newProductCurrentStock), minStock: Number(newProductMinStock) });
      setLocalProducts((prev) => [...prev, newProd]);
      setFormData({ ...formData, productId: newProd.id.toString() });
      showSuccess("✅ تم إضافة المنتج بنجاح");
      setNewProductName(""); setNewProductCategory(""); setNewProductCostPrice(""); setNewProductSellingPrice(""); setNewProductCurrentStock("1"); setNewProductMinStock("0"); setProductErrors({});
      setShowNewProductDialog(false);
    } catch (e: any) { showError("خطأ: " + e.message); }
  };

  // === التحقق من صحة النموذج ===
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

  // === إرسال النموذج ===
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !validate()) return;
    const customer = localCustomers.find((c) => c.id === Number(formData.customerId));
    const endDate = new Date(formData.startDate);
    endDate.setMonth(endDate.getMonth() + Number(formData.numberOfReceipts));
    onSave({
      customerId: Number(formData.customerId),
      customerName: customer?.name || "",
      customerPhone: customer?.phone || "",
      productType: selectedProduct.name,
      productId: selectedProduct.id,
      totalPrice: selectedProduct.selling_price,
      downPayment: Number(formData.downPayment),
      numberOfReceipts: Number(formData.numberOfReceipts),
      installmentAmount,
      startDate: formData.startDate,
      endDate: endDate.toISOString().split("T")[0],
      guarantorId: formData.guarantorId || null,
      status: "active",
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="px-8 pb-2 space-y-5 max-h-[70vh] overflow-y-auto">
        {/* اختيار العميل */}
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
          {selectedCustomer && (
            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">{selectedCustomer.name.charAt(0)}</div>
                <div><p className="font-semibold text-sm text-slate-700">{selectedCustomer.name}</p><p className="text-xs text-slate-500">{selectedCustomer.phone}</p></div>
              </div>
            </div>
          )}
        </div>

        {/* اختيار الضامن */}
        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2 mb-3"><Shield className="h-4 w-4 text-slate-400" /><p className="text-sm font-semibold text-slate-600">بيانات الضامن (اختياري)</p></div>
          <div className="space-y-3">
            <Select value={formData.guarantorId} onValueChange={handleGuarantorSelect}>
              <SelectTrigger><SelectValue placeholder="اختر ضامن من القائمة" /></SelectTrigger>
              <SelectContent>
                {localGuarantors.filter((g) => g.type === "guarantor").map((g) => <SelectItem key={g.id} value={g.id.toString()}>{g.name} - {g.phone}</SelectItem>)}
                <SelectItem value="new"><div className="flex items-center gap-2 text-violet-600 font-semibold"><Plus className="h-3.5 w-3.5" />ضامن جديد</div></SelectItem>
              </SelectContent>
            </Select>
            {selectedGuarantor && (
              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">{selectedGuarantor.name.charAt(0)}</div>
                  <div><p className="font-semibold text-sm text-slate-700">{selectedGuarantor.name}</p><p className="text-xs text-slate-500">{selectedGuarantor.phone}</p></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* اختيار المنتج */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-600 flex items-center gap-2"><Package className="h-3.5 w-3.5 text-slate-400" />المنتج</Label>
          <Select value={formData.productId} onValueChange={handleProductSelect}>
            <SelectTrigger className={errors.productId ? "border-red-300" : ""}><SelectValue placeholder="اختر المنتج" /></SelectTrigger>
            <SelectContent>
              {localProducts.map((p) => <SelectItem key={p.id} value={p.id.toString()} disabled={p.current_stock <= 0}>{p.name} ({p.current_stock} {p.unit})</SelectItem>)}
              <SelectItem value="new"><div className="flex items-center gap-2 text-violet-600 font-semibold"><Plus className="h-3.5 w-3.5" />منتج جديد</div></SelectItem>
            </SelectContent>
          </Select>
          {errors.productId && <p className="text-xs text-red-500">{errors.productId}</p>}
        </div>

        {/* الحقول المالية */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">المقدم</Label><Input type="number" value={formData.downPayment} onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })} placeholder="0" className={errors.downPayment ? "border-red-300" : ""} />{errors.downPayment && <p className="text-xs text-red-500">{errors.downPayment}</p>}</div>
          <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">عدد الأقساط</Label><Input type="number" value={formData.numberOfReceipts} onChange={(e) => setFormData({ ...formData, numberOfReceipts: e.target.value })} placeholder="12" className={errors.numberOfReceipts ? "border-red-300" : ""} />{errors.numberOfReceipts && <p className="text-xs text-red-500">{errors.numberOfReceipts}</p>}</div>
        </div>

        <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">تاريخ البدء</Label><Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className={errors.startDate ? "border-red-300" : ""} />{errors.startDate && <p className="text-xs text-red-500">{errors.startDate}</p>}</div>

        {/* الملخص */}
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

      {/* نافذة عميل جديد */}
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

      {/* نافذة ضامن جديد */}
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

      {/* نافذة منتج جديد */}
      <Dialog open={showNewProductDialog} onOpenChange={(open) => { setShowNewProductDialog(open); if (!open) { setNewProductName(""); setNewProductCategory(""); setNewProductCostPrice(""); setNewProductSellingPrice(""); setNewProductCurrentStock("1"); setNewProductMinStock("0"); setProductErrors({}); } }}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl">
          <DialogHeader><DialogTitle className="text-xl flex items-center gap-2"><Plus className="h-5 w-5 text-violet-500" />منتج جديد</DialogTitle></DialogHeader>
          <div className="space-y-4 px-2">
            <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">اسم المنتج</Label><Input value={newProductName} onChange={(e) => setNewProductName(e.target.value)} placeholder="مثال: تلفزيون LG 55" className={productErrors.name ? "border-red-300" : ""} />{productErrors.name && <p className="text-xs text-red-500">{productErrors.name}</p>}</div>
            <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">التصنيف</Label><Input value={newProductCategory} onChange={(e) => setNewProductCategory(e.target.value)} placeholder="مثال: إلكترونيات" className={productErrors.category ? "border-red-300" : ""} />{productErrors.category && <p className="text-xs text-red-500">{productErrors.category}</p>}</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">سعر التكلفة</Label><Input type="number" value={newProductCostPrice} onChange={(e) => setNewProductCostPrice(e.target.value)} placeholder="0" className={productErrors.costPrice ? "border-red-300" : ""} />{productErrors.costPrice && <p className="text-xs text-red-500">{productErrors.costPrice}</p>}</div>
              <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">سعر البيع</Label><Input type="number" value={newProductSellingPrice} onChange={(e) => setNewProductSellingPrice(e.target.value)} placeholder="0" className={productErrors.sellingPrice ? "border-red-300" : ""} />{productErrors.sellingPrice && <p className="text-xs text-red-500">{productErrors.sellingPrice}</p>}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">الكمية الحالية</Label><Input type="number" value={newProductCurrentStock} onChange={(e) => setNewProductCurrentStock(e.target.value)} placeholder="1" /></div>
              <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">الوحدة</Label><Input value={newProductUnit} onChange={(e) => setNewProductUnit(e.target.value)} placeholder="قطعة" /></div>
            </div>
          </div>
          <DialogFooter className="px-2">
            <Button variant="outline" onClick={() => { setShowNewProductDialog(false); setNewProductName(""); setNewProductCategory(""); setNewProductCostPrice(""); setNewProductSellingPrice(""); setNewProductCurrentStock("1"); setNewProductMinStock("0"); setProductErrors({}); }} className="rounded-xl h-11">إلغاء</Button>
            <Button onClick={handleAddNewProduct} className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 h-11 gap-2" disabled={!newProductName.trim() || !newProductCategory.trim() || !newProductCostPrice || !newProductSellingPrice}><Plus className="h-4 w-4" />إضافة واختيار</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContractForm;
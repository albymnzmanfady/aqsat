"use client";

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ContractForm from "@/components/ContractForm";
import InstallmentSchedule from "@/components/InstallmentSchedule";
import PrintDialog from "@/components/PrintDialog";
import { useAppSettings } from "@/hooks/useAppSettings";
import { getContractHtml } from "@/utils/pdfExport";
import { api, ApiContract, ApiInstallment, ApiCustomer, ApiProduct } from "@/lib/api";
import { showSuccess, showError } from "@/utils/toast";
import { sendWhatsAppMessage, getWhatsAppConfig, MESSAGE_TEMPLATES } from "@/components/WhatsAppService";
import { FileText, Plus, Search, Sparkles, Calendar, Send, Loader2, Eye, CheckCircle2, Clock, AlertTriangle, Package, X, MoreHorizontal, Edit, Trash2, Printer } from "lucide-react";

const Contracts = () => {
  const { settings } = useAppSettings();
  const location = useLocation();
  
  const [contracts, setContracts] = useState<ApiContract[]>([]);
  const [installments, setInstallments] = useState<ApiInstallment[]>([]);
  const [customers, setCustomers] = useState<ApiCustomer[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<ApiContract | null>(null);
  const [selectedContract, setSelectedContract] = useState<ApiContract | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [sendingContract, setSendingContract] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [initialCalculatorValues, setInitialCalculatorValues] = useState<any>(null);

  // Print state
  const [printOpen, setPrintOpen] = useState(false);
  const [printHtml, setPrintHtml] = useState("");
  const [printTitle, setPrintTitle] = useState("");
  const [printFilename, setPrintFilename] = useState("");

  const fetchData = async () => {
    try {
      const [c, i, cu, p] = await Promise.all([
        api.contracts.list(searchQuery || undefined),
        api.installments.list(),
        api.customers.list(),
        api.products.list(),
      ]);
      setContracts(c); 
      setInstallments(i); 
      setCustomers(cu); 
      setProducts(p);
    } catch (e: any) { 
      showError("خطأ: " + e.message); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, [searchQuery]);

  // التحقق من نقل بيانات الحاسبة وفتح النافذة مسبقة التعبئة
  useEffect(() => {
    if (location.state?.fromCalculator) {
      setInitialCalculatorValues({
        price: location.state.price,
        downPayment: String(location.state.downPayment),
        numberOfReceipts: String(location.state.months),
      });
      setEditingContract(null);
      setIsDialogOpen(true);
      
      // مسح الحالة لتجنب فتحها مجدداً عند التحديث
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const guarantors = customers.filter((c) => c.type === "guarantor");
  const contractCustomers = customers.filter((c) => c.type === "customer");
  const availableProducts = products.filter((p) => p.current_stock > 0);

  const handlePrintContract = (contract: ApiContract) => {
    const contractInstallments = installments.filter((i) => i.contract_id === contract.id);
    const html = getContractHtml({
      id: contract.id, customerName: contract.customer_name, customerPhone: contract.customer_phone,
      productType: contract.product_type, totalPrice: contract.total_price, downPayment: contract.down_payment,
      numberOfReceipts: contract.number_of_receipts, installmentAmount: contract.installment_amount,
      startDate: contract.start_date, endDate: contract.end_date, guarantorName: contract.guarantor_name,
      guarantorPhone: contract.guarantor_phone, createdAt: contract.created_at,
    }, contractInstallments.map(i => ({
      id: i.id, contractId: i.contract_id, number: i.number, amount: i.amount, dueDate: i.due_date,
      isPaid: !!i.is_paid, paidDate: i.paid_date || undefined, day: i.day, month: i.month, year: i.year,
    })), settings);
    setPrintHtml(html);
    setPrintTitle(`عقد الأقساط - ${contract.customer_name}`);
    setPrintFilename(`contract-${contract.id}.pdf`);
    setPrintOpen(true);
  };

  const handleCreateContract = async (data: any) => {
    try {
      if (editingContract) {
        await api.contracts.update(editingContract.id, data);
        showSuccess("✅ تم تعديل العقد بنجاح");
      } else {
        await api.contracts.create(data);
        showSuccess("✅ تم إنشاء العقد بنجاح");
        const config = getWhatsAppConfig();
        if (config.endpoint) {
          sendWhatsAppMessage(data.customerPhone, MESSAGE_TEMPLATES.newContract(data.customerName, data.productType, data.totalPrice, data.installmentAmount), config);
        }
      }
      fetchData();
    } catch (e: any) { 
      showError("خطأ: " + e.message); 
    }
    setIsDialogOpen(false);
    setEditingContract(null);
    setInitialCalculatorValues(null);
  };

  const handleDelete = async (id: number) => {
    try { 
      await api.contracts.delete(id); 
      showSuccess("✅ تم حذف العقد"); 
      fetchData(); 
    } catch (e: any) { 
      showError("خطأ: " + e.message); 
    }
    setDeleteConfirmId(null);
  };

  const handleMarkInstallmentPaid = async (installmentId: number) => {
    try {
      await api.installments.update(installmentId, { isPaid: true, paidDate: new Date().toISOString().split("T")[0] });
      fetchData();
      showSuccess("✅ تم تسديد القسط بنجاح");
    } catch (e: any) { 
      showError("خطأ: " + e.message); 
    }
  };

  const contractInstallments = (contractId: number) => installments.filter((i) => i.contract_id === contractId);

  if (loading) return <Layout><div className="flex items-center justify-center py-32"><Loader2 className="h-8 w-8 text-violet-500 animate-spin" /></div></Layout>;

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="relative">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full opacity-20 blur-xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30"><FileText className="h-7 w-7 text-white" /></div>
            <div><h1 className="text-2xl lg:text-3xl font-bold text-slate-800">العقود</h1><p className="text-slate-500 mt-1">إدارة عقود الأقساط</p></div>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) { setEditingContract(null); setInitialCalculatorValues(null); } }}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/30 h-12 px-6 active:scale-[0.97]"><Plus className="h-5 w-5" />عقد جديد</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] rounded-3xl">
            <DialogHeader><DialogTitle className="text-xl flex items-center gap-2"><Sparkles className="h-5 w-5 text-emerald-500" />{editingContract ? "تعديل العقد" : "إنشاء عقد جديد"}</DialogTitle><DialogDescription>{editingContract ? "تعديل بيانات العقد" : "اختر العميل والمنتج من المخزن"}</DialogDescription></DialogHeader>
            <ContractForm 
              key={editingContract?.id || "new"} 
              customers={contractCustomers} 
              guarantors={guarantors} 
              products={editingContract ? products : availableProducts} 
              onSave={handleCreateContract} 
              onCancel={() => { setIsDialogOpen(false); setEditingContract(null); setInitialCalculatorValues(null); }} 
              initialValues={initialCalculatorValues}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-6">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input type="text" placeholder="بحث باسم العميل أو نوع المنتج..." className="pr-12 rounded-2xl h-12" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute left-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-500"><X className="h-4 w-4" /></button>}
      </div>

      <div className="grid gap-4">
        {contracts.map((contract, index) => {
          const insts = contractInstallments(contract.id);
          const paidCount = insts.filter((i) => i.is_paid).length;
          const progress = insts.length > 0 ? Math.round((paidCount / insts.length) * 100) : 0;
          const statusStyles = { active: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white", completed: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white", defaulted: "bg-gradient-to-r from-rose-500 to-pink-500 text-white" };
          const statusIcons = { active: CheckCircle2, completed: Clock, defaulted: AlertTriangle };
          const StatusIcon = statusIcons[contract.status] || CheckCircle2;

          return (
            <Card key={contract.id} className="stagger-item border-0 bg-white/70 backdrop-blur-sm overflow-hidden hover-lift" style={{ animationDelay: `${index * 0.05}s` }}>
              <div className={cn("h-1.5 w-full", contract.status === "active" ? "bg-gradient-to-l from-emerald-400 to-teal-500" : contract.status === "completed" ? "bg-gradient-to-l from-blue-400 to-cyan-500" : "bg-gradient-to-l from-rose-400 to-pink-500")} />
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">{contract.customer_name.charAt(0)}</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap"><h3 className="font-bold text-slate-800">{contract.customer_name}</h3><Badge className={cn("rounded-lg border-0", statusStyles[contract.status])}><StatusIcon className="h-3 w-3 ml-1" />{contract.status === "active" ? "نشط" : contract.status === "completed" ? "مكتمل" : "متأخر"}</Badge></div>
                      <div className="flex flex-wrap gap-2 text-sm text-slate-500">
                        <span className="bg-slate-100 px-2.5 py-0.5 rounded-lg flex items-center gap-1"><Package className="h-3.5 w-3.5" />{contract.product_type}</span>
                        <span className="bg-slate-100 px-2.5 py-0.5 rounded-lg">{contract.total_price.toLocaleString()} ج.م</span>
                        <span className="bg-slate-100 px-2.5 py-0.5 rounded-lg flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{contract.start_date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="w-full sm:w-32">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1"><span>{paidCount}/{insts.length}</span><span>{progress}%</span></div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden"><div className={cn("h-full rounded-full transition-all duration-500", contract.status === "active" ? "bg-gradient-to-l from-emerald-400 to-teal-500" : "bg-gradient-to-l from-rose-400 to-pink-500")} style={{ width: `${progress}%` }} /></div>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      <Button variant="ghost" size="sm" className="h-9 rounded-xl gap-1.5 text-violet-600 hover:bg-violet-50 active:scale-90" onClick={() => { setSelectedContract(contract); setIsScheduleOpen(true); }}><Eye className="h-4 w-4" /><span className="hidden sm:inline">الأقساط</span></Button>
                      <Button variant="ghost" size="sm" className="h-9 rounded-xl gap-1.5 text-blue-600 hover:bg-blue-50 active:scale-90" onClick={() => handlePrintContract(contract)}><Printer className="h-4 w-4" /><span className="hidden sm:inline">طباعة</span></Button>
                      <Button variant="ghost" size="sm" className="h-9 rounded-xl gap-1.5 text-emerald-600 hover:bg-emerald-50 active:scale-90" onClick={async () => { const config = getWhatsAppConfig(); if (!config.endpoint) { showError("إعداد واتساب مطلوب"); return; } setSendingContract(contract.id); const r = await sendWhatsAppMessage(contract.customer_phone, MESSAGE_TEMPLATES.newContract(contract.customer_name, contract.product_type, contract.total_price, contract.installment_amount), config); if (r.success) showSuccess("✅ تم إرسال الإشعار"); setSendingContract(null); }} disabled={sendingContract === contract.id}>
                        {sendingContract === contract.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}<span className="hidden sm:inline">واتساب</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-10 w-10 p-0 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-all border border-slate-100 hover:border-slate-200 active:scale-90"
                          >
                            <MoreHorizontal className="h-5 w-5 text-slate-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="end" 
                          sideOffset={6}
                          className="w-56 rounded-2xl p-1.5 shadow-2xl border border-slate-200 bg-white z-50 animate-in fade-in slide-in-from-top-2"
                        >
                          <DropdownMenuItem onClick={() => { setEditingContract(contract); setIsDialogOpen(true); }} className="cursor-pointer rounded-xl gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                            <Edit className="h-4 w-4 ml-2 text-violet-500" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteConfirmId(contract.id)} className="cursor-pointer rounded-xl gap-2 px-3 py-2.5 text-sm text-red-600 focus:text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 className="h-4 w-4 ml-2 text-red-500" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {contracts.length === 0 && <div className="text-center py-16"><div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4"><FileText className="h-10 w-10 text-slate-300" /></div><h3 className="text-lg font-bold text-slate-600 mb-2">لا توجد عقود</h3></div>}
      </div>

      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <DialogHeader><DialogTitle className="text-xl flex items-center gap-2"><Calendar className="h-5 w-5 text-emerald-500" />جدول الأقساط - {selectedContract?.customer_name}</DialogTitle><DialogDescription>{selectedContract?.product_type} - {selectedContract?.installment_amount.toLocaleString()} ج.م شهرياً</DialogDescription></DialogHeader>
          {selectedContract && <div className="max-h-[50vh] overflow-y-auto px-8"><InstallmentSchedule installments={contractInstallments(selectedContract.id).map(i => ({ id: i.id, contractId: i.contract_id, number: i.number, amount: i.amount, dueDate: i.due_date, isPaid: !!i.is_paid, paidDate: i.paid_date || undefined, day: i.day, month: i.month, year: i.year }))} customerName={selectedContract.customer_name} customerPhone={selectedContract.customer_phone} onMarkPaid={handleMarkInstallmentPaid} /></div>}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <DialogContent className="sm:max-w-[350px] rounded-3xl">
          <DialogHeader><DialogTitle className="text-xl flex items-center gap-2 text-red-600"><Trash2 className="h-5 w-5" />تأكيد الحذف</DialogTitle><DialogDescription>هل أنت متأكد من حذف هذا العقد؟</DialogDescription></DialogHeader>
          <DialogFooter className="px-8">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="rounded-xl h-11">إلغاء</Button>
            <Button variant="destructive" onClick={() => deleteConfirmId !== null && handleDelete(deleteConfirmId)} className="rounded-xl h-11 bg-gradient-to-r from-rose-500 to-pink-600">حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PrintDialog open={printOpen} onOpenChange={setPrintOpen} htmlContent={printHtml} title={printTitle} filename={printFilename} />
    </Layout>
  );
};

export default Contracts;
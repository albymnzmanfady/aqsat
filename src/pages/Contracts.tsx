import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContractForm from "@/components/ContractForm";
import PrintDialog from "@/components/PrintDialog";
import InstallmentSchedule from "@/components/InstallmentSchedule";
import { useAppSettings } from "@/hooks/useAppSettings";
import { api, ApiCustomer, ApiContract, ApiInstallment, ApiProduct } from "@/lib/api";
import { getContractHtml, getReceiptHtml } from "@/utils/pdfExport";
import { showSuccess, showError } from "@/utils/toast";
import {
  FileText, Search, Plus, Sparkles, MoreHorizontal, Edit, Trash2,
  Printer, Loader2, Tag, User, Calendar, ArrowDown, CheckCircle,
  XCircle, FileDown,
} from "lucide-react";

const Contracts = () => {
  const { settings } = useAppSettings();
  const [contracts, setContracts] = useState<ApiContract[]>([]);
  const [installments, setInstallments] = useState<ApiInstallment[]>([]);
  const [customers, setCustomers] = useState<ApiCustomer[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<ApiContract | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("active");

  // Print state
  const [printOpen, setPrintOpen] = useState(false);
  const [printHtml, setPrintHtml] = useState("");
  const [printTitle, setPrintTitle] = useState("");
  const [printFilename, setPrintFilename] = useState("contract.pdf");

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
      showError("خطأ في تحميل البيانات: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery]);

  const filteredContracts = contracts.filter((c) => {
    if (activeTab === "active") return c.status === "active";
    if (activeTab === "completed") return c.status === "completed";
    if (activeTab === "defaulted") return c.status === "defaulted";
    return true;
  });

  const handlePrintContract = (contract: ApiContract) => {
    const contractInstallments = installments.filter((i) => i.contract_id === contract.id);
    const html = getContractHtml(
      {
        id: contract.id,
        customer_name: contract.customer_name,
        customer_phone: contract.customer_phone,
        product_type: contract.product_type,
        total_price: contract.total_price,
        down_payment: contract.down_payment,
        number_of_receipts: contract.number_of_receipts,
        installment_amount: contract.installment_amount,
        start_date: contract.start_date,
        end_date: contract.end_date,
        guarantor_name: contract.guarantor_name,
        guarantor_phone: contract.guarantor_phone,
        created_at: contract.created_at,
      },
      contractInstallments.map((i) => ({
        number: i.number,
        amount: i.amount,
        day: i.day,
        month: i.month,
        year: i.year,
        is_paid: !!i.is_paid,
      })),
      {
        appName: settings.appName,
        companyName: settings.companyName,
        companyPhone: settings.companyPhone,
        companyAddress: settings.companyAddress,
        logoUrl: settings.logoUrl,
      }
    );
    setPrintHtml(html);
    setPrintTitle(`عقد الأقساط - ${contract.customer_name}`);
    setPrintFilename(`contract-${contract.id}.pdf`);
    setPrintOpen(true);
  };

  const handleSaveContract = async (data: any) => {
    try {
      if (editingContract) {
        await api.contracts.update(editingContract.id, data);
        showSuccess("✅ تم تعديل العقد بنجاح");
      } else {
        await api.contracts.create(data);
        showSuccess("✅ تم إنشاء العقد بنجاح");
      }
      fetchData();
    } catch (e: any) {
      showError("خطأ: " + e.message);
    }
    setIsDialogOpen(false);
    setEditingContract(null);
  };

  const handleDeleteContract = async (id: number) => {
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
      showSuccess("✅ تم تسديد القسط");
      fetchData();
    } catch (e: any) {
      showError("خطأ: " + e.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      active: { label: "نشط", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
      completed: { label: "مكتمل", color: "bg-blue-100 text-blue-700 border-blue-200" },
      defaulted: { label: "متأخر", color: "bg-rose-100 text-rose-700 border-rose-200" },
    };
    const config = configs[status] || configs.active;
    return <Badge className={cn("rounded-lg border", config.color)}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="relative">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full opacity-20 blur-xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">العقود</h1>
              <p className="text-slate-500 mt-1">إدارة عقود البيع بالأقساط</p>
            </div>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingContract(null); }}>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/30 h-12 px-6"
          >
            <Plus className="h-5 w-5" />
            عقد جديد
          </Button>
          <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2 justify-start">
                <Sparkles className="h-5 w-5 text-emerald-500" />
                {editingContract ? "تعديل العقد" : "عقد جديد"}
              </DialogTitle>
              <DialogDescription>
                {editingContract ? "تعديل بيانات العقد" : "أدخل بيانات العميل والمنتج والضامن لإنشاء العقد"}
              </DialogDescription>
            </DialogHeader>
            <ContractForm
              customers={customers}
              guarantors={customers.filter(c => c.type === "guarantor")}
              products={products}
              onSave={handleSaveContract}
              onCancel={() => { setIsDialogOpen(false); setEditingContract(null); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-6">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input
          type="text"
          placeholder="بحث باسم العميل أو المنتج..."
          className="pr-12 rounded-2xl bg-white/70 backdrop-blur-sm border-slate-200/50 h-12 shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="mb-6" dir="rtl">
        <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-100 p-1 rounded-2xl">
          <TabsTrigger value="active" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white gap-2">
            النشطة
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white gap-2">
            المكتملة
          </TabsTrigger>
          <TabsTrigger value="defaulted" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white gap-2">
            المتأخرة
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {filteredContracts.map((contract) => {
          const contractInstallments = installments.filter((i) => i.contract_id === contract.id);
          const paidInstallments = contractInstallments.filter((i) => i.is_paid).length;
          const progress = contract.number_of_receipts > 0 ? Math.round((paidInstallments / contract.number_of_receipts) * 100) : 0;
          const isOverdue = contractInstallments.some((i) => !i.is_paid && new Date(i.year, i.month - 1, i.day) < new Date());

          return (
            <Card key={contract.id} className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden hover-lift">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
                      <FileText className="h-7 w-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-800">{contract.customer_name}</h3>
                        {getStatusBadge(contract.status)}
                        {isOverdue && (
                          <Badge className="rounded-lg bg-rose-100 text-rose-700 border-rose-200 border">
                            متأخر 🚨
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1 text-sm text-slate-500">
                        <span>{contract.product_type}</span>
                        <span>•</span>
                        <span>{contract.total_price.toLocaleString()} ج.م</span>
                        <span>•</span>
                        <span>{paidInstallments}/{contract.number_of_receipts} أقساط</span>
                      </div>
                      <div className="mt-3 w-full max-w-xs">
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                          <span>{progress}%</span>
                          <span>{paidInstallments}/{contract.number_of_receipts}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", progress >= 100 ? "bg-gradient-to-l from-emerald-500 to-teal-500" : "bg-gradient-to-l from-violet-500 to-purple-600")}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 rounded-xl gap-2 text-violet-600 hover:bg-violet-50"
                      onClick={() => handlePrintContract(contract)}
                    >
                      <Printer className="h-4 w-4" />
                      طباعة
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl">
                          <MoreHorizontal className="h-5 w-5 text-slate-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => { setEditingContract(contract); setIsDialogOpen(true); }} className="cursor-pointer rounded-lg">
                          <Edit className="h-4 w-4 ml-2" /> تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteConfirmId(contract.id)} className="cursor-pointer rounded-lg text-red-600 focus:text-red-600">
                          <Trash2 className="h-4 w-4 ml-2" /> حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {contractInstallments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <InstallmentSchedule
                      installments={contractInstallments.map((i) => ({
                        id: i.id,
                        contractId: i.contract_id,
                        number: i.number,
                        amount: i.amount,
                        dueDate: i.due_date,
                        isPaid: !!i.is_paid,
                        paidDate: i.paid_date || undefined,
                        day: i.day,
                        month: i.month,
                        year: i.year,
                      }))}
                      customerName={contract.customer_name}
                      customerPhone={contract.customer_phone}
                      onMarkPaid={handleMarkInstallmentPaid}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {filteredContracts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <FileText className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-600 mb-2">لا توجد عقود</h3>
            <p className="text-slate-500">لم يتم العثور على عقود مطابقة</p>
          </div>
        )}
      </div>

      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <DialogContent className="sm:max-w-[350px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              تأكيد الحذف
            </DialogTitle>
            <DialogDescription>هل أنت متأكد من حذف هذا العقد؟ لا يمكن التراجع.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end px-8 pb-6">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="rounded-xl h-11">إلغاء</Button>
            <Button variant="destructive" onClick={() => deleteConfirmId !== null && handleDeleteContract(deleteConfirmId)} className="rounded-xl h-11">حذف</Button>
          </div>
        </DialogContent>
      </Dialog>

      <PrintDialog open={printOpen} onOpenChange={setPrintOpen} htmlContent={printHtml} title={printTitle} filename={printFilename} />
    </Layout>
  );
};

export default Contracts;
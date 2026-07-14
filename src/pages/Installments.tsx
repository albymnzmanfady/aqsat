"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AnimatedCounter from "@/components/AnimatedCounter";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PrintDialog from "@/components/PrintDialog";
import { useAppSettings } from "@/hooks/useAppSettings";
import { getReceiptHtml } from "@/utils/pdfExport";
import { api, ApiInstallment, ApiContract } from "@/lib/api";
import { showSuccess, showError } from "@/utils/toast";
import { sendWhatsAppMessage, getWhatsAppConfig, MESSAGE_TEMPLATES } from "@/components/WhatsAppService";
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Calendar,
  Sparkles,
  Wallet,
  TrendingUp,
  Send,
  Loader2,
  MoreHorizontal,
  Edit,
  Trash2,
  XCircle,
  Printer,
} from "lucide-react";

const InstallmentsPage = () => {
  const { settings } = useAppSettings();
  const [installments, setInstallments] = useState<ApiInstallment[]>([]);
  const [contracts, setContracts] = useState<ApiContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "pending" | "overdue">("all");
  const [selectedContractId, setSelectedContractId] = useState<string>("");
  const [selectedInstallmentNumber, setSelectedInstallmentNumber] = useState<string>("");
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Print state
  const [printOpen, setPrintOpen] = useState(false);
  const [printHtml, setPrintHtml] = useState("");
  const [printTitle, setPrintTitle] = useState("");
  const [printFilename, setPrintFilename] = useState("");

  const fetchData = async () => {
    try {
      const [inst, cont] = await Promise.all([
        api.installments.list(),
        api.contracts.list(),
      ]);
      setInstallments(inst);
      setContracts(cont);
    } catch (e: any) {
      showError("خطأ في تحميل البيانات: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredInstallments = installments.filter((installment) => {
    const contract = contracts.find((c) => c.id === installment.contract_id);
    const customerName = contract?.customer_name || "";

    if (searchQuery && !customerName.includes(searchQuery) && !contract?.product_type.includes(searchQuery)) {
      return false;
    }

    const dueDate = new Date(installment.year, installment.month - 1, installment.day);
    const isOverdue = !installment.is_paid && dueDate < today;

    if (filterStatus === "paid" && !installment.is_paid) return false;
    if (filterStatus === "pending" && (installment.is_paid || isOverdue)) return false;
    if (filterStatus === "overdue" && !isOverdue) return false;

    return true;
  });

  const paidCount = installments.filter((i) => i.is_paid).length;
  const pendingCount = installments.filter((i) => !i.is_paid).length;
  const totalAmount = installments.reduce((sum, i) => sum + i.amount, 0);
  const paidAmount = installments.filter((i) => i.is_paid).reduce((sum, i) => sum + i.amount, 0);
  const collectionRate = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  const activeContracts = contracts.filter((c) => c.status === "active");

  const handlePrintReceipt = (installment: ApiInstallment) => {
    const contract = contracts.find((c) => c.id === installment.contract_id);
    if (!contract) return;

    const html = getReceiptHtml({
      id: installment.id, contractId: installment.contract_id, number: installment.number,
      amount: installment.amount, dueDate: installment.due_date, isPaid: !!installment.is_paid,
      paidDate: installment.paid_date || undefined, day: installment.day, month: installment.month, year: installment.year,
    }, {
      id: contract.id, customerName: contract.customer_name, customerPhone: contract.customer_phone,
      productType: contract.product_type, totalPrice: contract.total_price, downPayment: contract.down_payment,
      numberOfReceipts: contract.number_of_receipts, installmentAmount: contract.installment_amount,
      startDate: contract.start_date, endDate: contract.end_date, guarantorName: contract.guarantor_name,
      guarantorPhone: contract.guarantor_phone, createdAt: contract.created_at,
    }, settings);
    setPrintHtml(html);
    setPrintTitle(`إيصال سداد - ${contract.customer_name} - القسط ${installment.number}`);
    setPrintFilename(`receipt-${contract.id}-${installment.number}.pdf`);
    setPrintOpen(true);
  };

  const handlePayment = async () => {
    if (!selectedContractId || !selectedInstallmentNumber) return;

    const installmentToPay = installments.find(
      (i) => i.contract_id === Number(selectedContractId) && i.number === Number(selectedInstallmentNumber)
    );

    if (installmentToPay) {
      try {
        await api.installments.update(installmentToPay.id, {
          isPaid: true,
          paidDate: new Date().toISOString().split("T")[0],
        });

        const contract = contracts.find((c) => c.id === installmentToPay.contract_id);
        if (contract) {
          const config = getWhatsAppConfig();
          if (config.endpoint) {
            const dueDate = `${installmentToPay.day}/${installmentToPay.month}/${installmentToPay.year}`;
            sendWhatsAppMessage(
              contract.customer_phone,
              MESSAGE_TEMPLATES.installmentPaid(contract.customer_name, installmentToPay.amount, dueDate, installmentToPay.number),
              config
            );
          }
        }

        showSuccess("✅ تم تسجيل القسط بنجاح");
        fetchData();
      } catch (e: any) {
        showError("خطأ: " + e.message);
      }
    }

    setIsDialogOpen(false);
    setSelectedContractId("");
    setSelectedInstallmentNumber("");
  };

  const handleTogglePaid = async (installment: ApiInstallment) => {
    try {
      await api.installments.update(installment.id, {
        isPaid: !installment.is_paid,
        paidDate: installment.is_paid ? undefined : new Date().toISOString().split("T")[0],
      });
      fetchData();
      showSuccess(installment.is_paid ? "✅ تم إلغاء تسديد القسط" : "✅ تم تسديد القسط بنجاح");
    } catch (e: any) {
      showError("خطأ: " + e.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.installments.delete(id);
      showSuccess("✅ تم حذف القسط");
      fetchData();
    } catch (e: any) {
      showError("خطأ: " + e.message);
    }
    setDeleteConfirmId(null);
  };

  const handleSendWhatsApp = async (installment: ApiInstallment) => {
    const config = getWhatsAppConfig();
    if (!config.endpoint) {
      showError("يرجى إعداد واتساب أولاً من صفحة الإعدادات");
      return;
    }

    const contract = contracts.find((c) => c.id === installment.contract_id);
    if (!contract) return;

    setSendingId(installment.id);
    const dueDate = `${installment.day}/${installment.month}/${installment.year}`;

    const dueDt = new Date(installment.year, installment.month - 1, installment.day);
    const daysOverdue = Math.floor((today.getTime() - dueDt.getTime()) / (1000 * 60 * 60 * 24));

    let message: string;
    if (installment.is_paid) {
      message = MESSAGE_TEMPLATES.installmentPaid(contract.customer_name, installment.amount, dueDate, installment.number);
    } else if (daysOverdue > 0) {
      message = MESSAGE_TEMPLATES.installmentOverdue(contract.customer_name, installment.amount, daysOverdue, installment.number);
    } else {
      message = MESSAGE_TEMPLATES.installmentDue(contract.customer_name, installment.amount, dueDate, installment.number);
    }

    const result = await sendWhatsAppMessage(contract.customer_phone, message, config);
    if (result.success) showSuccess(`✅ تم إرسال الإشعار للعميل ${contract.customer_name}`);
    else showError(result.message);
    setSendingId(null);
  };

  const getContractInstallments = (contractId: number) => {
    return installments.filter((i) => i.contract_id === contractId && !i.is_paid);
  };

  const stats = [
    { title: "إجمالي الأقساط", value: installments.length, icon: CreditCard, color: "from-slate-500 to-gray-600" },
    { title: "مدفوعة", value: paidCount, icon: CheckCircle, color: "from-emerald-500 to-teal-500" },
    { title: "قيد الانتظار", value: pendingCount, icon: Clock, color: "from-amber-500 to-orange-500" },
    { title: "نسبة التحصيل", value: `${collectionRate}%`, icon: TrendingUp, color: "from-violet-500 to-purple-500" },
  ];

  if (loading) return <Layout><div className="flex items-center justify-center py-32"><Loader2 className="h-8 w-8 text-violet-500 animate-spin" /></div></Layout>;

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="relative">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full opacity-20 blur-xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <CreditCard className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">الأقساط</h1>
              <p className="text-slate-500 mt-1">تسجيل ومتابعة سداد الأقساط</p>
            </div>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30 h-12 px-6 active:scale-[0.97]">
              <Plus className="h-5 w-5" />
              تسجيل قسط
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                تسجيل قسط
              </DialogTitle>
              <DialogDescription>سجّل دفعة قسط جديدة لعميل</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 px-8">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-600">العقد</Label>
                <Select
                  value={selectedContractId}
                  onValueChange={(value) => {
                    setSelectedContractId(value);
                    setSelectedInstallmentNumber("");
                  }}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="اختر العقد" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeContracts.map((contract) => (
                      <SelectItem key={contract.id} value={contract.id.toString()}>
                        {contract.customer_name} - {contract.product_type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedContractId && (
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-600">رقم القسط</Label>
                  <Select value={selectedInstallmentNumber} onValueChange={setSelectedInstallmentNumber}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="اختر القسط" />
                    </SelectTrigger>
                    <SelectContent>
                      {getContractInstallments(Number(selectedContractId)).map((inst) => (
                        <SelectItem key={inst.number} value={inst.number.toString()}>
                          القسط {inst.number} - {inst.day}/{inst.month}/{inst.year} - {inst.amount} ج.م
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <DialogFooter className="px-8">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-11">
                إلغاء
              </Button>
              <Button
                onClick={handlePayment}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 h-11 active:scale-[0.97]"
                disabled={!selectedContractId || !selectedInstallmentNumber}
              >
                تسجيل القسط
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-md", stat.color)}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{stat.title}</p>
                  <p className="font-bold text-xl text-slate-800">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Financial Summary */}
      <Card className="mb-8 border-0 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 text-white overflow-hidden relative hover-lift">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Wallet className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg">الملخص المالي</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-sm text-white/80 mb-1">المبلغ المحصّل</p>
              <p className="text-2xl font-bold"><AnimatedCounter value={paidAmount} duration={800} formatter={(v) => v.toLocaleString()} /> ج.م</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-sm text-white/80 mb-1">إجمالي المبالغ</p>
              <p className="text-2xl font-bold"><AnimatedCounter value={totalAmount} duration={800} formatter={(v) => v.toLocaleString()} /> ج.م</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-sm text-white/80 mb-1">المتبقي</p>
              <p className="text-2xl font-bold"><AnimatedCounter value={totalAmount - paidAmount} duration={800} formatter={(v) => v.toLocaleString()} /> ج.م</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="text"
            placeholder="بحث باسم العميل أو المنتج..."
            className="pr-12 rounded-2xl bg-white/70 backdrop-blur-sm border-slate-200/50 h-12 shadow-sm focus:shadow-md transition-shadow"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "paid", "pending", "overdue"] as const).map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className={cn(
                "rounded-xl h-10 px-4 active:scale-[0.97]",
                filterStatus === status && {
                  all: "bg-gradient-to-r from-slate-700 to-slate-800 text-white",
                  paid: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
                  pending: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
                  overdue: "bg-gradient-to-r from-rose-500 to-pink-500 text-white",
                }[status]
              )}
            >
              {status === "all" ? "الكل" : status === "paid" ? "مدفوع" : status === "pending" ? "قيد الانتظار" : "متأخر"}
            </Button>
          ))}
        </div>
      </div>

      {/* Installments List */}
      <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
        <div className="divide-y divide-slate-100/80">
          {filteredInstallments.map((installment, index) => {
            const contract = contracts.find((c) => c.id === installment.contract_id);
            const dueDate = `${installment.day}/${installment.month}/${installment.year}`;
            const dueDt = new Date(installment.year, installment.month - 1, installment.day);
            const isOverdue = !installment.is_paid && dueDt < today;

            return (
              <div
                key={installment.id}
                className="stagger-item p-4 hover:bg-slate-50/50 transition-all hover-lift"
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shadow-md",
                      installment.is_paid
                        ? "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/25"
                        : isOverdue
                        ? "bg-gradient-to-br from-rose-500 to-pink-500 shadow-rose-500/25"
                        : "bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/25"
                    )}>
                      {installment.is_paid ? (
                        <CheckCircle className="h-6 w-6 text-white" />
                      ) : (
                        <Clock className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{contract?.customer_name || "عميل"}</h3>
                      <p className="text-sm text-slate-500">
                        القسط {installment.number} من {contract?.number_of_receipts || "?"}
                        {contract && ` - ${contract.product_type}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-left">
                      <p className="font-bold text-slate-800">{installment.amount.toLocaleString()} ج.م</p>
                      <div className="flex items-center gap-2 justify-end mt-1">
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {dueDate}
                        </span>
                        <Badge className={cn(
                          "rounded-lg text-white border-0",
                          installment.is_paid
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                            : isOverdue
                            ? "bg-gradient-to-r from-rose-500 to-pink-500"
                            : "bg-gradient-to-r from-amber-500 to-orange-500"
                        )}>
                          {installment.is_paid ? "مدفوع" : isOverdue ? "متأخر" : "باقي"}
                        </Badge>
                      </div>
                    </div>

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
                        <DropdownMenuItem
                          onClick={() => handleTogglePaid(installment)}
                          className="cursor-pointer rounded-xl gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        >
                          {installment.is_paid ? (
                            <>
                              <XCircle className="h-4 w-4 ml-2 text-rose-500" />
                              إلغاء التسديد
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 ml-2 text-emerald-500" />
                              تسديد القسط
                            </>
                          )}
                        </DropdownMenuItem>
                        {installment.is_paid && (
                          <DropdownMenuItem
                            onClick={() => handlePrintReceipt(installment)}
                            className="cursor-pointer rounded-xl gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                          >
                            <Printer className="h-4 w-4 ml-2 text-blue-500" />
                            طباعة إيصال
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleSendWhatsApp(installment)}
                          className="cursor-pointer rounded-xl gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                          disabled={sendingId === installment.id}
                        >
                          {sendingId === installment.id ? (
                            <Loader2 className="h-4 w-4 ml-2 animate-spin text-slate-400" />
                          ) : (
                            <Send className="h-4 w-4 ml-2 text-violet-500" />
                          )}
                          إرسال إشعار واتساب
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteConfirmId(installment.id)}
                          className="cursor-pointer rounded-xl gap-2 px-3 py-2.5 text-sm text-red-600 focus:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 ml-2 text-red-500" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredInstallments.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-600 mb-2">لا توجد أقساط</h3>
            <p className="text-slate-500">لم يتم العثور على أقساط مطابقة</p>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <DialogContent className="sm:max-w-[350px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              تأكيد الحذف
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف هذا القسط؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="px-8">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="rounded-xl h-11">
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId !== null && handleDelete(deleteConfirmId)}
              className="rounded-xl h-11 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
            >
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Dialog */}
      <PrintDialog
        open={printOpen}
        onOpenChange={setPrintOpen}
        htmlContent={printHtml}
        title={printTitle}
        filename={printFilename}
      />
    </Layout>
  );
};

export default InstallmentsPage;
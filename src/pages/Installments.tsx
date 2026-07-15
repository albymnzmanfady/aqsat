"use client";

import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import CustomerLink from "@/components/CustomerLink";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PrintDialog from "@/components/PrintDialog";
import { useAppSettings } from "@/hooks/useAppSettings";
import { api, ApiContract, ApiInstallment } from "@/lib/api";
import { getReceiptHtml } from "@/utils/pdfExport";
import { showSuccess, showError } from "@/utils/toast";
import {
  CreditCard, CheckCircle, Send, Loader2, Printer, Calendar,
  Clock, AlertTriangle, ChevronDown, Search, X, Wallet, Package,
} from "lucide-react";
import { sendWhatsAppMessage, getWhatsAppConfig, MESSAGE_TEMPLATES } from "@/components/WhatsAppService";

const Installments = () => {
  const { settings } = useAppSettings();
  const [installments, setInstallments] = useState<ApiInstallment[]>([]);
  const [contracts, setContracts] = useState<ApiContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "paid" | "overdue">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [expandedContracts, setExpandedContracts] = useState<Set<number>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState<{
    installment: ApiInstallment;
    type: "pay" | "unpay";
  } | null>(null);

  const [printOpen, setPrintOpen] = useState(false);
  const [printHtml, setPrintHtml] = useState("");
  const [printTitle, setPrintTitle] = useState("");
  const [printFilename, setPrintFilename] = useState("receipt.pdf");

  const fetchData = async () => {
    try {
      const [inst, cont] = await Promise.all([
        api.installments.list(),
        api.contracts.list(),
      ]);
      setInstallments(inst);
      setContracts(cont);
    } catch (e: any) {
      showError("خطأ في تحميل بيانات الأقساط: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const filteredInstallments = useMemo(() => {
    return installments.filter((i) => {
      if (activeFilter === "pending") return !i.is_paid;
      if (activeFilter === "paid") return i.is_paid;
      if (activeFilter === "overdue") {
        return !i.is_paid && new Date(i.year, i.month - 1, i.day) < today;
      }
      return true;
    });
  }, [installments, activeFilter, today]);

  const groupedByContract = useMemo(() => {
    const groups: Record<number, { contract: ApiContract; installments: ApiInstallment[] }> = {};

    filteredInstallments.forEach((inst) => {
      if (!groups[inst.contract_id]) {
        const contract = contracts.find((c) => c.id === inst.contract_id);
        if (contract) {
          groups[inst.contract_id] = { contract, installments: [] };
        }
      }
      if (groups[inst.contract_id]) {
        groups[inst.contract_id].installments.push(inst);
      }
    });

    return Object.values(groups).sort((a, b) => {
      const aUnpaid = a.installments.filter((i) => !i.is_paid).length;
      const bUnpaid = b.installments.filter((i) => !i.is_paid).length;
      return bUnpaid - aUnpaid;
    });
  }, [filteredInstallments, contracts]);

  const searchedGroups = useMemo(() => {
    if (!searchQuery.trim()) return groupedByContract;
    const q = searchQuery.toLowerCase();
    return groupedByContract.filter(
      (g) =>
        g.contract.customer_name.toLowerCase().includes(q) ||
        g.contract.customer_phone.includes(q) ||
        g.contract.product_type.toLowerCase().includes(q)
    );
  }, [groupedByContract, searchQuery]);

  const stats = useMemo(() => {
    const total = filteredInstallments.length;
    const paid = filteredInstallments.filter((i) => i.is_paid).length;
    const unpaid = total - paid;
    const totalAmount = filteredInstallments.reduce((s, i) => s + i.amount, 0);
    const paidAmount = filteredInstallments.filter((i) => i.is_paid).reduce((s, i) => s + i.amount, 0);
    const overdueCount = installments.filter(
      (i) => !i.is_paid && new Date(i.year, i.month - 1, i.day) < today
    ).length;
    return { total, paid, unpaid, totalAmount, paidAmount, overdueCount };
  }, [filteredInstallments, installments, today]);

  const toggleContract = (contractId: number) => {
    setExpandedContracts((prev) => {
      const next = new Set(prev);
      if (next.has(contractId)) next.delete(contractId);
      else next.add(contractId);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedContracts(new Set(searchedGroups.map((g) => g.contract.id)));
  };

  const collapseAll = () => {
    setExpandedContracts(new Set());
  };

  const handlePrintReceipt = (installment: ApiInstallment, contract: ApiContract) => {
    const html = getReceiptHtml(
      {
        number: installment.number,
        amount: installment.amount,
        paid_date: installment.paid_date || undefined,
        day: installment.day,
        month: installment.month,
        year: installment.year,
        is_paid: !!installment.is_paid,
      },
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
      {
        appName: settings.appName,
        companyName: settings.companyName,
        companyPhone: settings.companyPhone,
        companyAddress: settings.companyAddress,
        logoUrl: settings.logoUrl,
      }
    );
    setPrintHtml(html);
    setPrintTitle(`إيصال سداد - ${contract.customer_name} - القسط ${installment.number}`);
    setPrintFilename(`receipt-${contract.id}-${installment.number}.pdf`);
    setPrintOpen(true);
  };

  const confirmTogglePaid = async () => {
    if (!confirmDialog) return;
    const { installment, type } = confirmDialog;
    try {
      await api.installments.update(installment.id, {
        isPaid: type === "pay",
        paidDate: type === "pay" ? new Date().toISOString().split("T")[0] : null,
      });
      showSuccess(type === "pay" ? "✅ تم تسجيل السداد بنجاح" : "✅ تم إلغاء السداد");
      fetchData();
    } catch (e: any) {
      showError("خطأ في تسجيل السداد: " + e.message);
    }
    setConfirmDialog(null);
  };

  const handleSendReminder = async (installment: ApiInstallment) => {
    const contract = contracts.find((c) => c.id === installment.contract_id);
    if (!contract) return;
    const config = getWhatsAppConfig();
    if (!config.endpoint) {
      showError("يرجى إعداد واتساب من صفحة الإعدادات أولاً");
      return;
    }
    setSendingId(installment.id);
    try {
      const dueDate = `${installment.day}/${installment.month}/${installment.year}`;
      const message = installment.is_paid
        ? MESSAGE_TEMPLATES.installmentPaid(contract.customer_name, installment.amount, dueDate, installment.number)
        : MESSAGE_TEMPLATES.installmentDue(contract.customer_name, installment.amount, dueDate, installment.number);
      const result = await sendWhatsAppMessage(contract.customer_phone, message, config);
      if (result.success) showSuccess("✅ تم إرسال الإشعار بنجاح");
      else showError(result.message);
    } catch (e: any) {
      showError("خطأ في إرسال الإشعار: " + e.message);
    }
    setSendingId(null);
  };

  const getInstallmentStatus = (inst: ApiInstallment) => {
    if (inst.is_paid) return { label: "مدفوع", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300", icon: CheckCircle, gradient: "from-emerald-500 to-teal-500" };
    const dueDate = new Date(inst.year, inst.month - 1, inst.day);
    if (dueDate < today) return { label: "متأخر", color: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300", icon: AlertTriangle, gradient: "from-rose-500 to-pink-500" };
    return { label: "باقي", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300", icon: Clock, gradient: "from-amber-500 to-orange-500" };
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">جاري تحميل بيانات الأقساط...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="relative">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full opacity-20 blur-xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <CreditCard className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100">الأقساط</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">إدارة وتتبع الأقساط والتحصيلات</p>
            </div>
          </div>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">الإجمالي</p>
                <p className="font-bold text-lg text-slate-800 dark:text-slate-100">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">المسددة</p>
                <p className="font-bold text-lg text-emerald-600">{stats.paid}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">المتأخرة</p>
                <p className="font-bold text-lg text-amber-600">{stats.overdueCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">المتبقي</p>
                <p className="font-bold text-lg text-rose-600">{(stats.totalAmount - stats.paidAmount).toLocaleString()} ج.م</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* فلترة + بحث */}
      <div className="space-y-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {([
            { value: "pending" as const, label: "غير المسددة", color: "from-amber-500 to-orange-500" },
            { value: "paid" as const, label: "المسددة", color: "from-emerald-500 to-teal-500" },
            { value: "overdue" as const, label: "المتأخرة", color: "from-rose-500 to-pink-500" },
            { value: "all" as const, label: "الكل", color: "from-violet-500 to-purple-600" },
          ]).map((filter) => (
            <Button
              key={filter.value}
              variant={activeFilter === filter.value ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter.value)}
              className={cn(
                "rounded-xl h-10 px-4",
                activeFilter === filter.value && `bg-gradient-to-r ${filter.color} text-white`
              )}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="بحث باسم العميل أو المنتج..."
              className="pr-12 rounded-2xl h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors text-slate-500"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={expandAll} className="rounded-xl h-12 px-4 text-xs">
            فتح الكل
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll} className="rounded-xl h-12 px-4 text-xs">
            إغلاق الكل
          </Button>
        </div>
      </div>

      {/* قائمة العقود المجمعة */}
      <div className="space-y-3">
        {searchedGroups.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-10 w-10 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300 mb-2">لا توجد أقساط</h3>
            <p className="text-slate-500 dark:text-slate-400">لا توجد أقساط في هذا التصنيف</p>
          </div>
        )}

        {searchedGroups.map((group) => {
          const { contract, installments: contractInstallments } = group;
          const isExpanded = expandedContracts.has(contract.id);

          const paidInGroup = contractInstallments.filter((i) => i.is_paid).length;
          const totalInGroup = contractInstallments.length;
          const unpaidInGroup = totalInGroup - paidInGroup;
          const groupProgress = totalInGroup > 0 ? Math.round((paidInGroup / totalInGroup) * 100) : 0;
          const groupTotalAmount = contractInstallments.reduce((s, i) => s + i.amount, 0);
          const groupPaidAmount = contractInstallments.filter((i) => i.is_paid).reduce((s, i) => s + i.amount, 0);
          const groupRemaining = groupTotalAmount - groupPaidAmount;

          const hasOverdue = contractInstallments.some(
            (i) => !i.is_paid && new Date(i.year, i.month - 1, i.day) < today
          );

          return (
            <Card
              key={contract.id}
              className={cn(
                "border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm overflow-hidden transition-all duration-200",
                hasOverdue && unpaidInGroup > 0 && "ring-1 ring-rose-200 dark:ring-rose-900/50"
              )}
            >
              <button
                onClick={() => toggleContract(contract.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-200 cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0",
                    hasOverdue && unpaidInGroup > 0
                      ? "bg-gradient-to-br from-rose-500 to-pink-500"
                      : groupProgress >= 100
                        ? "bg-gradient-to-br from-emerald-500 to-teal-500"
                        : "bg-gradient-to-br from-violet-500 to-purple-600"
                  )}>
                    <Package className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CustomerLink
                        customerId={contract.customer_id}
                        customerName={contract.customer_name}
                        className="font-bold text-sm text-slate-800 dark:text-slate-100"
                      />
                      <Badge className={cn(
                        "rounded-lg border-0 text-[10px]",
                        contract.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" :
                        contract.status === "completed" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" :
                        "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300"
                      )}>
                        {contract.status === "active" ? "نشط" : contract.status === "completed" ? "مكتمل" : "متأخر"}
                      </Badge>
                      {hasOverdue && unpaidInGroup > 0 && (
                        <Badge className="rounded-lg border-0 bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 text-[10px]">
                          متأخر 🚨
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400">{contract.product_type}</span>
                      <span className="text-[10px] text-slate-400">•</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{contract.total_price.toLocaleString()} ج.م</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Progress value={groupProgress} className="h-1.5 w-20 rounded-full bg-slate-100 dark:bg-slate-800 [&>div]:bg-gradient-to-r [&>div]:from-emerald-400 [&>div]:to-teal-500" />
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{paidInGroup}/{totalInGroup}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-left hidden sm:block">
                    <p className="text-xs text-slate-400 dark:text-slate-500">المتبقي</p>
                    <p className={cn(
                      "text-sm font-extrabold",
                      groupRemaining > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                    )}>
                      {groupRemaining > 0 ? `${groupRemaining.toLocaleString()} ج.م` : "✓ مسدد"}
                    </p>
                  </div>
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                    isExpanded
                      ? "bg-violet-500 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  )}>
                    <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isExpanded && "rotate-180")} />
                  </div>
                </div>
              </button>

              <div className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                isExpanded ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0"
              )}>
                <div className="border-t border-slate-100 dark:border-slate-800">
                  {contractInstallments
                    .sort((a, b) => a.number - b.number)
                    .map((inst) => {
                      const status = getInstallmentStatus(inst);
                      const StatusIcon = status.icon;
                      const dueDate = `${inst.day}/${inst.month}/${inst.year}`;
                      const dueDateObj = new Date(inst.year, inst.month - 1, inst.day);
                      const isOverdue = !inst.is_paid && dueDateObj < today;
                      const daysOverdue = isOverdue
                        ? Math.floor((today.getTime() - dueDateObj.getTime()) / 86400000)
                        : 0;

                      return (
                        <div
                          key={inst.id}
                          className={cn(
                            "flex items-center justify-between p-3.5 px-4 border-b border-slate-50 dark:border-slate-800/50 last:border-b-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors",
                            isOverdue && "bg-rose-50/30 dark:bg-rose-950/10 border-r-[3px] border-r-rose-400"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs",
                              `bg-gradient-to-br ${status.gradient}`
                            )}>
                              {inst.number}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">
                                  {inst.amount.toLocaleString()} ج.م
                                </p>
                                <Badge className={cn("rounded-lg border-0 text-[10px]", status.color)}>
                                  <StatusIcon className="h-2.5 w-2.5 ml-0.5" />
                                  {status.label}
                                </Badge>
                                {isOverdue && (
                                  <span className="text-[10px] text-rose-500 dark:text-rose-400 font-semibold">
                                    {daysOverdue} يوم تأخير
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                <Calendar className="h-3 w-3" />
                                <span dir="ltr">{dueDate}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {inst.is_paid && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-lg text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-700 active:scale-90"
                                onClick={() => handlePrintReceipt(inst, contract)}
                                title="طباعة الإيصال"
                              >
                                <Printer className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-lg text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-700 active:scale-90"
                              onClick={() => handleSendReminder(inst)}
                              disabled={sendingId === inst.id}
                              title="إرسال تذكير واتساب"
                            >
                              {sendingId === inst.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Send className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "h-8 px-2.5 rounded-lg gap-1 text-xs font-bold active:scale-90",
                                inst.is_paid
                                  ? "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                  : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                              )}
                              onClick={() =>
                                setConfirmDialog({
                                  installment: inst,
                                  type: inst.is_paid ? "unpay" : "pay",
                                })
                              }
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              {inst.is_paid ? "إلغاء" : "سداد"}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* نافذة تأكيد */}
      <Dialog open={confirmDialog !== null} onOpenChange={(open) => { if (!open) setConfirmDialog(null); }}>
        <DialogContent className="sm:max-w-[350px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              تأكيد {confirmDialog?.type === "pay" ? "السداد" : "إلغاء السداد"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 dark:text-slate-300 px-2">
            {confirmDialog?.type === "pay"
              ? "هل أنت متأكد من تسجيل هذا القسط كمدفوع؟"
              : "هل أنت متأكد من إلغاء تسجيل هذا القسط؟"}
          </p>
          <div className="flex gap-3 justify-end px-2 pb-2">
            <Button variant="outline" onClick={() => setConfirmDialog(null)} className="rounded-xl h-11">إلغاء</Button>
            <Button
              onClick={confirmTogglePaid}
              className={cn("rounded-xl h-11", confirmDialog?.type === "pay" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-amber-500 hover:bg-amber-600")}
            >
              تأكيد
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PrintDialog open={printOpen} onOpenChange={setPrintOpen} htmlContent={printHtml} title={printTitle} filename={printFilename} />
    </Layout>
  );
};

export default Installments;
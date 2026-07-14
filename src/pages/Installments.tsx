"use client";

import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  ChevronDown,
  ChevronUp,
  Phone,
  AlertTriangle,
} from "lucide-react";

interface GroupedContract {
  contract: ApiContract;
  installments: ApiInstallment[];
  paidCount: number;
  totalCount: number;
  progressPercent: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  hasOverdue: boolean;
}

const InstallmentsPage = () => {
  const { settings } = useAppSettings();
  const [installments, setInstallments] = useState<ApiInstallment[]>([]);
  const [contracts, setContracts] = useState<ApiContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "overdue" | "completed">("all");
  const [selectedContractId, setSelectedContractId] = useState<string>("");
  const [selectedInstallmentNumber, setSelectedInstallmentNumber] = useState<string>("");
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [expandedContracts, setExpandedContracts] = useState<Record<number, boolean>>({});

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

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // تجميع الأقساط تحت كل عقد
  const groupedContracts = useMemo((): GroupedContract[] => {
    return contracts.map(contract => {
      const contractInsts = installments
        .filter(i => i.contract_id === contract.id)
        .sort((a, b) => a.number - b.number);

      const paidCount = contractInsts.filter(i => i.is_paid).length;
      const totalCount = contractInsts.length;
      const progressPercent = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

      const totalAmount = contractInsts.reduce((s, i) => s + i.amount, 0);
      const paidAmount = contractInsts.filter(i => i.is_paid).reduce((s, i) => s + i.amount, 0);
      const remainingAmount = Math.max(0, totalAmount - paidAmount);

      const hasOverdue = contractInsts.some(i => {
        const dueDt = new Date(i.year, i.month - 1, i.day);
        return !i.is_paid && dueDt < today;
      });

      return {
        contract,
        installments: contractInsts,
        paidCount,
        totalCount,
        progressPercent,
        totalAmount,
        paidAmount,
        remainingAmount,
        hasOverdue
      };
    });
  }, [contracts, installments, today]);

  // تصفية العقود المجمعة بالبحث والتبويبات
  const filteredGroupedContracts = useMemo(() => {
    return groupedContracts.filter(item => {
      // 1. تصفية بالبحث
      const matchesSearch = item.contract.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.contract.product_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.contract.customer_phone.includes(searchQuery);

      if (!matchesSearch) return false;

      // 2. تصفية بالتبويبات
      if (filterStatus === "completed" && item.progressPercent < 100) return false;
      if (filterStatus === "pending" && (item.progressPercent === 100 || item.hasOverdue)) return false;
      if (filterStatus === "overdue" && !item.hasOverdue) return false;

      return true;
    });
  }, [groupedContracts, searchQuery, filterStatus]);

  // إحصائيات عامة
  const totalAmountAll = installments.reduce((sum, i) => sum + i.amount, 0);
  const paidAmountAll = installments.filter((i) => i.is_paid).reduce((sum, i) => sum + i.amount, 0);
  const remainingAmountAll = Math.max(0, totalAmountAll - paidAmountAll);
  const collectionRate = totalAmountAll > 0 ? Math.round((paidAmountAll / totalAmountAll) * 100) : 0;

  const toggleExpand = (contractId: number) => {
    setExpandedContracts(prev => ({
      ...prev,
      [contractId]: !prev[contractId]
    }));
  };

  const handlePrintReceipt = (installment: ApiInstallment, contract: ApiContract) => {
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

  const handleSendWhatsApp = async (installment: ApiInstallment, contract: ApiContract) => {
    const config = getWhatsAppConfig();
    if (!config.endpoint) {
      showError("يرجى إعداد واتساب أولاً من صفحة الإعدادات");
      return;
    }

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

  const activeContracts = contracts.filter((c) => c.status === "active");

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
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">الأقساط المجمعة</h1>
              <p className="text-slate-500 mt-1">تتبع الحسابات وسداد المديونيات بشكل مجمع لكل عميل</p>
            </div>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30 h-12 px-6 active:scale-[0.97]">
              <Plus className="h-5 w-5" />
              تسجيل قسط فوري
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                تحصيل دفعة قسط
              </DialogTitle>
              <DialogDescription>سجّل دفعة قسط جديدة لعميل</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 px-8">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-600">العقد والعميل</Label>
                <Select
                  value={selectedContractId}
                  onValueChange={(value) => {
                    setSelectedContractId(value);
                    setSelectedInstallmentNumber("");
                  }}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="اختر العقد والعميل" />
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
                      {installments
                        .filter((i) => i.contract_id === Number(selectedContractId) && !i.is_paid)
                        .map((inst) => (
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

      {/* Financial Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden hover-lift">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500">مستحقات كلية</p>
              <p className="font-bold text-lg text-slate-800">{totalAmountAll.toLocaleString()} ج.م</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden hover-lift">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500">المحصل الفعلي</p>
              <p className="font-bold text-lg text-emerald-600">{paidAmountAll.toLocaleString()} ج.م</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden hover-lift">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-500 shadow-md">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500">المتبقي المطلوب</p>
              <p className="font-bold text-lg text-amber-600">{remainingAmountAll.toLocaleString()} ج.م</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden hover-lift">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500">نسبة التحصيل</p>
              <p className="font-bold text-lg text-blue-600">{collectionRate}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="text"
            placeholder="ابحث باسم العميل أو السلعة أو رقم الهاتف للفرز الفوري..."
            className="pr-12 rounded-2xl bg-white/70 backdrop-blur-sm border-slate-200/50 h-12 shadow-sm focus:shadow-md transition-shadow"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "overdue", "completed"] as const).map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className={cn(
                "rounded-xl h-10 px-4 active:scale-[0.97]",
                filterStatus === status && {
                  all: "bg-gradient-to-r from-slate-700 to-slate-800 text-white",
                  completed: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
                  pending: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
                  overdue: "bg-gradient-to-r from-rose-500 to-pink-500 text-white",
                }[status]
              )}
            >
              {status === "all" ? "كافة العملاء" : status === "completed" ? "مكتمل السداد" : status === "pending" ? "مستحق وجاري" : "متأخرات عاجلة"}
            </Button>
          ))}
        </div>
      </div>

      {/* Grouped Clients & Accordion List */}
      <div className="space-y-4">
        {filteredGroupedContracts.map((item, index) => {
          const isExpanded = !!expandedContracts[item.contract.id];
          return (
            <Card 
              key={item.contract.id} 
              className={cn(
                "border-0 bg-white/80 backdrop-blur-sm overflow-hidden shadow-sm transition-all duration-300",
                item.hasOverdue && "border-r-4 border-r-rose-500",
                item.progressPercent === 100 && "border-r-4 border-r-emerald-500"
              )}
            >
              <CardContent className="p-0">
                
                {/* Header of Accordion - Click to toggle */}
                <div 
                  onClick={() => toggleExpand(item.contract.id)}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-start gap-4 text-right">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md bg-gradient-to-br",
                      item.progressPercent === 100 ? "from-emerald-500 to-teal-500" : item.hasOverdue ? "from-rose-500 to-pink-500" : "from-amber-500 to-orange-500"
                    )}>
                      {item.contract.customer_name.charAt(0)}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-800">{item.contract.customer_name}</h3>
                        {item.hasOverdue && (
                          <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-0 rounded-lg text-xs gap-1">
                            <AlertTriangle className="h-3 w-3" /> متأخرات
                          </Badge>
                        )}
                        {item.progressPercent === 100 && (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 rounded-lg text-xs">
                            ✓ مكتمل السداد
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 text-xs text-slate-500 mt-1">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1" dir="ltr">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {item.contract.customer_phone}
                        </span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-violet-600">
                          {item.contract.product_type}
                        </span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md">
                          تم سداد {item.paidCount} قسط من {item.totalCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Mini Stats */}
                  <div className="flex items-center gap-6 justify-between w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">القسط الشهري</p>
                      <p className="text-sm font-bold text-slate-800">{item.contract.installment_amount.toLocaleString()} ج.م</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">المتبقي المطلوب</p>
                      <p className="text-sm font-extrabold text-amber-600">{item.remainingAmount.toLocaleString()} ج.م</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-24">
                        <Progress value={item.progressPercent} className="h-2 rounded-full bg-slate-100" />
                      </div>
                      <span className="text-xs font-bold text-slate-500">{item.progressPercent}%</span>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details - Sub List of Monthly Installments */}
                {isExpanded && (
                  <div className="bg-slate-50/50 border-t border-slate-100/80 p-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-xs font-bold text-slate-400 px-2 tracking-wide mb-2 text-right">جدول الأقساط الشهري للعقد</p>
                    
                    <div className="grid gap-2">
                      {item.installments.map((inst) => {
                        const isInstOverdue = !inst.is_paid && new Date(inst.year, inst.month - 1, inst.day) < today;
                        return (
                          <div 
                            key={inst.id}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-xl border bg-white shadow-sm transition-all",
                              inst.is_paid 
                                ? "bg-emerald-50/20 border-emerald-100/50" 
                                : isInstOverdue 
                                ? "bg-rose-50/20 border-rose-100/50" 
                                : "border-slate-100"
                            )}
                          >
                            <div className="flex items-center gap-3 text-right">
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white",
                                inst.is_paid ? "bg-emerald-500" : isInstOverdue ? "bg-rose-500" : "bg-amber-500"
                              )}>
                                #{inst.number}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-700">{inst.amount.toLocaleString()} ج.م</p>
                                <p className="text-xs text-slate-400 flex items-center gap-1" dir="ltr">
                                  <Calendar className="h-3 w-3" /> {inst.day}/{inst.month}/{inst.year}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge className={cn(
                                "rounded-lg border-0 text-white",
                                inst.is_paid ? "bg-emerald-500" : isInstOverdue ? "bg-rose-500" : "bg-amber-500"
                              )}>
                                {inst.is_paid ? "مدفوع ✓" : isInstOverdue ? "متأخر" : "باقي"}
                              </Badge>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100">
                                    <MoreHorizontal className="h-4 w-4 text-slate-500" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-xl border border-slate-100 bg-white z-50">
                                  <DropdownMenuItem 
                                    onClick={() => handleTogglePaid(inst)}
                                    className="cursor-pointer rounded-lg text-sm gap-2"
                                  >
                                    {inst.is_paid ? <XCircle className="h-4 w-4 text-rose-500" /> : <CheckCircle className="h-4 w-4 text-emerald-500" />}
                                    {inst.is_paid ? "إلغاء السداد" : "تسجيل تحصيل"}
                                  </DropdownMenuItem>
                                  {inst.is_paid && (
                                    <DropdownMenuItem 
                                      onClick={() => handlePrintReceipt(inst, item.contract)}
                                      className="cursor-pointer rounded-lg text-sm gap-2"
                                    >
                                      <Printer className="h-4 w-4 text-blue-500" />
                                      طباعة إيصال
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem 
                                    onClick={() => handleSendWhatsApp(inst, item.contract)}
                                    className="cursor-pointer rounded-lg text-sm gap-2"
                                    disabled={sendingId === inst.id}
                                  >
                                    {sendingId === inst.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 text-violet-500" />}
                                    إرسال إشعار واتساب
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          );
        })}

        {filteredGroupedContracts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-600 mb-2">لا توجد مديونيات مطابقة</h3>
            <p className="text-slate-500">لم يتم العثور على أي أقساط للعملاء المطابقين لبحثك</p>
          </div>
        )}
      </div>

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
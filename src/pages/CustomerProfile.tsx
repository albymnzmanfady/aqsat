"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import AnimatedCounter from "@/components/AnimatedCounter";
import PrintDialog from "@/components/PrintDialog";
import { useAppSettings } from "@/hooks/useAppSettings";
import { api, ApiCustomer, ApiContract, ApiInstallment } from "@/lib/api";
import { getReceiptHtml } from "@/utils/pdfExport";
import { showError, showSuccess } from "@/utils/toast";
import { sendWhatsAppMessage, getWhatsAppConfig, MESSAGE_TEMPLATES } from "@/components/WhatsAppService";
import {
  ArrowRight, Phone, MapPin, CreditCard, FileText, CheckCircle,
  Clock, AlertTriangle, TrendingUp, Wallet, Shield, Calendar, Send,
  Loader2, ShieldCheck, ShieldAlert, ShieldX, BarChart3, PhoneCall,
  Hash, Printer, CheckCircle2,
} from "lucide-react";

const CustomerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useAppSettings();
  const [customer, setCustomer] = useState<ApiCustomer | null>(null);
  const [contracts, setContracts] = useState<ApiContract[]>([]);
  const [allInstallments, setAllInstallments] = useState<ApiInstallment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  const [confirmPayDialog, setConfirmPayDialog] = useState<{
    installment: ApiInstallment;
    contract: ApiContract;
  } | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);

  const [printOpen, setPrintOpen] = useState(false);
  const [printHtml, setPrintHtml] = useState("");
  const [printTitle, setPrintTitle] = useState("");
  const [printFilename, setPrintFilename] = useState("receipt.pdf");

  const fetchData = async () => {
    try {
      const [cust, allContracts, allInst] = await Promise.all([
        api.customers.get(Number(id)),
        api.contracts.list(),
        api.installments.list(),
      ]);
      setCustomer(cust);
      setContracts(allContracts.filter((c) => c.customer_id === Number(id) || c.customer_name === cust.name));
      setAllInstallments(allInst);
    } catch (e: any) {
      showError("خطأ في تحميل بيانات العميل: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) { showError("معرف العميل غير صحيح"); navigate("/customers"); return; }
    fetchData();
  }, [id, navigate]);

  const customerContracts = useMemo(() => {
    if (!customer) return [];
    return contracts.filter((c) => c.customer_id === customer.id || c.customer_name === customer.name);
  }, [contracts, customer]);

  const customerInstallments = useMemo(() => {
    const contractIds = new Set(customerContracts.map((c) => c.id));
    return allInstallments.filter((i) => contractIds.has(i.contract_id));
  }, [allInstallments, customerContracts]);

  const stats = useMemo(() => {
    const totalContracts = customerContracts.length;
    const activeContracts = customerContracts.filter((c) => c.status === "active").length;
    const completedContracts = customerContracts.filter((c) => c.status === "completed").length;
    const totalInstallments = customerInstallments.length;
    const paidInstallments = customerInstallments.filter((i) => i.is_paid).length;
    const unpaidInstallments = totalInstallments - paidInstallments;
    const totalValue = customerContracts.reduce((sum, c) => sum + c.total_price, 0);
    const totalPaid = customerInstallments.filter((i) => i.is_paid).reduce((sum, i) => sum + i.amount, 0);
    const totalRemaining = customerInstallments.filter((i) => !i.is_paid).reduce((sum, i) => sum + i.amount, 0);
    const paymentRate = totalInstallments > 0 ? Math.round((paidInstallments / totalInstallments) * 100) : 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const overdueInstallments = customerInstallments.filter((i) => !i.is_paid && new Date(i.year, i.month - 1, i.day) < today);
    const totalOverdue = overdueInstallments.length;
    let avgDelayDays = 0;
    if (overdueInstallments.length > 0) {
      const totalDays = overdueInstallments.reduce((sum, i) => sum + Math.floor((today.getTime() - new Date(i.year, i.month - 1, i.day).getTime()) / 86400000), 0);
      avgDelayDays = Math.round(totalDays / overdueInstallments.length);
    }
    let riskScore = 0; let riskLevel: "excellent" | "good" | "fair" | "poor" = "excellent";
    if (paymentRate >= 90 && totalOverdue === 0) { riskScore = 95; riskLevel = "excellent"; }
    else if (paymentRate >= 75 && totalOverdue <= 1) { riskScore = 75; riskLevel = "good"; }
    else if (paymentRate >= 50 && totalOverdue <= 3) { riskScore = 50; riskLevel = "fair"; }
    else { riskScore = Math.max(10, paymentRate); riskLevel = "poor"; }
    const onTimePaid = customerInstallments.filter((i) => i.is_paid && i.paid_date && new Date(i.paid_date) <= new Date(i.year, i.month - 1, i.day)).length;
    const onTimeRate = paidInstallments > 0 ? Math.round((onTimePaid / paidInstallments) * 100) : 0;
    return { totalContracts, activeContracts, completedContracts, totalInstallments, paidInstallments, unpaidInstallments, totalValue, totalPaid, totalRemaining, paymentRate, totalOverdue, avgDelayDays, riskScore, riskLevel, onTimePaid, onTimeRate };
  }, [customerContracts, customerInstallments]);

  const handlePayInstallment = async () => {
    if (!confirmPayDialog) return;
    setPayingId(confirmPayDialog.installment.id);
    try {
      await api.installments.update(confirmPayDialog.installment.id, { isPaid: true, paidDate: new Date().toISOString().split("T")[0] });
      showSuccess("✅ تم تسجيل سداد القسط بنجاح");
      setConfirmPayDialog(null);
      const [allContracts, allInst] = await Promise.all([api.contracts.list(), api.installments.list()]);
      setContracts(allContracts);
      setAllInstallments(allInst);
    } catch (e: any) { showError("خطأ في تسجيل السداد: " + e.message); }
    setPayingId(null);
  };

  const handlePrintReceipt = (installment: ApiInstallment, contract: ApiContract) => {
    const html = getReceiptHtml(
      { number: installment.number, amount: installment.amount, paid_date: installment.paid_date || undefined, day: installment.day, month: installment.month, year: installment.year, is_paid: !!installment.is_paid },
      { id: contract.id, customer_name: contract.customer_name, customer_phone: contract.customer_phone, product_type: contract.product_type, total_price: contract.total_price, down_payment: contract.down_payment, number_of_receipts: contract.number_of_receipts, installment_amount: contract.installment_amount, start_date: contract.start_date, end_date: contract.end_date, guarantor_name: contract.guarantor_name, guarantor_phone: contract.guarantor_phone, created_at: contract.created_at },
      { appName: settings.appName, companyName: settings.companyName, companyPhone: settings.companyPhone, companyAddress: settings.companyAddress, logoUrl: settings.logoUrl }
    );
    setPrintHtml(html); setPrintTitle(`إيصال سداد - ${contract.customer_name} - القسط ${installment.number}`); setPrintFilename(`receipt-${contract.id}-${installment.number}.pdf`); setPrintOpen(true);
  };

  const handleSendWhatsApp = async () => {
    if (!customer) return;
    const config = getWhatsAppConfig();
    if (!config.endpoint) { showError("يرجى إعداد واتساب من الإعدادات"); return; }
    setSendingWhatsApp(true);
    const result = await sendWhatsAppMessage(customer.phone, MESSAGE_TEMPLATES.welcome(customer.name), config);
    if (result.success) showSuccess("✅ تم إرسال رسالة الترحيب"); else showError(result.message);
    setSendingWhatsApp(false);
  };

  if (loading) return <Layout><div className="flex items-center justify-center py-32"><Loader2 className="h-8 w-8 text-violet-500 animate-spin" /></div></Layout>;
  if (!customer) return <Layout><div className="text-center py-32"><p className="text-slate-500">العميل غير موجود</p><Button onClick={() => navigate("/customers")} className="mt-4">العودة للعملاء</Button></div></Layout>;

  const riskConfig = {
    excellent: { label: "ممتاز", color: "from-emerald-500 to-teal-500", borderColor: "border-emerald-200", icon: ShieldCheck, description: "عميل موثوق جداً - سجل سداد ممتاز" },
    good: { label: "جيد", color: "from-blue-500 to-cyan-500", borderColor: "border-blue-200", icon: Shield, description: "عميل جيد - التزام مقبول مع تأخيرات طفيفة" },
    fair: { label: "مقبول", color: "from-amber-500 to-orange-500", borderColor: "border-amber-200", icon: ShieldAlert, description: "يحتاج متابعة - تأخرات متكررة" },
    poor: { label: "ضعيف", color: "from-rose-500 to-red-500", borderColor: "border-rose-200", icon: ShieldX, description: "خطر مرتفع - تأخرات كثيرة وقيم مستحقة كبيرة" },
  };
  const risk = riskConfig[stats.riskLevel];

  return (
    <Layout>
      <div className="space-y-6 pb-8 page-enter-animation">
        <Button variant="ghost" onClick={() => navigate("/customers")} className="gap-2 text-slate-600 hover:text-violet-600 w-fit rounded-xl">
          <ArrowRight className="h-4 w-4" />العودة للعملاء
        </Button>

        {/* بطاقة العميل */}
        <Card className="border-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-xl" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-indigo-500/20 rounded-full blur-xl" />
          </div>
          <CardContent className="p-6 lg:p-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-3xl border border-white/30">{customer.name.charAt(0)}</div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">{customer.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <Badge className="bg-white/20 text-white border-white/30 rounded-lg backdrop-blur-sm"><Phone className="h-3 w-3 ml-1" />{customer.phone}</Badge>
                    <Badge className="bg-white/20 text-white border-white/30 rounded-lg backdrop-blur-sm">{customer.type === "customer" ? "عميل" : "ضامن"}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 md:mr-auto">
                <Button onClick={handleSendWhatsApp} disabled={sendingWhatsApp} className="rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 gap-2 backdrop-blur-sm">
                  {sendingWhatsApp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}إرسال رسالة
                </Button>
                <Button onClick={() => navigate("/contracts")} className="rounded-xl bg-white text-violet-700 hover:bg-white/90 gap-2 font-bold"><FileText className="h-4 w-4" />عقد جديد</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10"><div className="flex items-center gap-2 text-white/70 text-xs mb-1"><PhoneCall className="h-3 w-3" />الهاتف</div><p className="font-bold" dir="ltr">{customer.phone}</p></div>
              {customer.national_id && <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10"><div className="flex items-center gap-2 text-white/70 text-xs mb-1"><Hash className="h-3 w-3" />الرقم القومي</div><p className="font-bold" dir="ltr">{customer.national_id}</p></div>}
              {customer.address && <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10"><div className="flex items-center gap-2 text-white/70 text-xs mb-1"><MapPin className="h-3 w-3" />العنوان</div><p className="font-bold">{customer.address}</p></div>}
            </div>
          </CardContent>
        </Card>

        {/* المؤشرات المالية */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "إجمالي العقود", value: stats.totalContracts, formatter: undefined, suffix: "", color: "violet", icon: FileText, sub: `${stats.activeContracts} نشط • ${stats.completedContracts} مكتمل` },
            { label: "إجمالي المدفوعات", value: stats.totalPaid, formatter: (v: number) => v.toLocaleString(), suffix: " ج.م", color: "emerald", icon: Wallet, sub: `${stats.paidInstallments} قسط مدفوع` },
            { label: "المتبقي للتحصيل", value: stats.totalRemaining, formatter: (v: number) => v.toLocaleString(), suffix: " ج.م", color: "amber", icon: Clock, sub: `${stats.unpaidInstallments} قسط باقي` },
            { label: "نسبة السداد", value: stats.paymentRate, formatter: undefined, suffix: " %", color: "indigo", icon: TrendingUp, sub: `${stats.onTimeRate}% في الموعد` },
          ].map((item, idx) => (
            <Card key={idx} className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">{item.label}</p>
                    <p className={cn("text-2xl font-extrabold", `text-${item.color}-600`)}>
                      <AnimatedCounter value={item.value} formatter={item.formatter} />
                      <span className="text-xs font-medium text-slate-400 mr-1">{item.suffix}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.sub}</p>
                  </div>
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", `bg-gradient-to-br from-${item.color}-500 to-${item.color === "indigo" ? "violet" : item.color === "amber" ? "orange" : item.color === "emerald" ? "teal" : "purple"}-600`)}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* تقييم المخاطر والأداء والعقود */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className={cn("border-2 overflow-hidden", risk.borderColor)}>
            <CardContent className="p-6">
              <div className="text-center">
                <div className={cn("w-24 h-24 rounded-3xl bg-gradient-to-br flex items-center justify-center mx-auto mb-4", risk.color)}><risk.icon className="h-12 w-12 text-white" /></div>
                <Badge className={cn("rounded-xl text-sm px-4 py-1 mb-3 bg-gradient-to-r text-white border-0", risk.color)}>{risk.label}</Badge>
                <p className="text-4xl font-extrabold text-slate-800 mb-1">{stats.riskScore}<span className="text-sm font-normal text-slate-400"> / 100</span></p>
                <p className="text-xs text-slate-500 mb-4">{risk.description}</p>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden"><div className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-1000", risk.color)} style={{ width: `${stats.riskScore}%` }} /></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-violet-500" />تفاصيل الأداء المالي</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5"><span className="text-slate-600 font-medium">نسبة السداد الكلية</span><span className="font-bold text-violet-600">{stats.paymentRate}%</span></div>
                <Progress value={stats.paymentRate} className="h-2.5 rounded-full bg-slate-100 [&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-purple-600" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5"><span className="text-slate-600 font-medium">سداد في الموعد</span><span className="font-bold text-emerald-600">{stats.onTimeRate}%</span></div>
                <Progress value={stats.onTimeRate} className="h-2.5 rounded-full bg-slate-100 [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-teal-500" />
              </div>
              <div className="h-px bg-slate-100 dark:bg-slate-800" />

              {/* البطاقات الصغيرة - بدون ظل وأوضح */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl text-center border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/50">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{stats.paidInstallments}</p>
                  </div>
                  <p className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300">قسط مدفوع</p>
                </div>
                <div className="p-3 rounded-xl text-center border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/50">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    <p className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{stats.unpaidInstallments}</p>
                  </div>
                  <p className="text-[10px] font-medium text-amber-700 dark:text-amber-300">قسط باقي</p>
                </div>
                <div className="p-3 rounded-xl text-center border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                    <p className="text-lg font-extrabold text-rose-600 dark:text-rose-400">{stats.totalOverdue}</p>
                  </div>
                  <p className="text-[10px] font-medium text-rose-700 dark:text-rose-300">قسط متأخر</p>
                </div>
                <div className="p-3 rounded-xl text-center border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/50">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Calendar className="h-3.5 w-3.5 text-blue-500" />
                    <p className="text-lg font-extrabold text-blue-600 dark:text-blue-400">{stats.avgDelayDays}</p>
                  </div>
                  <p className="text-[10px] font-medium text-blue-700 dark:text-blue-300">متوسط أيام التأخير</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2"><FileText className="h-4 w-4 text-emerald-500" />ملخص العقود</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-2xl border border-violet-100 dark:border-violet-900">
                <p className="text-xs text-slate-500 mb-1">إجمالي قيمة العقود</p>
                <p className="text-2xl font-extrabold text-violet-700">{stats.totalValue.toLocaleString()} <span className="text-sm font-medium">ج.م</span></p>
              </div>
              <div className="space-y-3">
                {customerContracts.map((contract) => {
                  const contractInsts = allInstallments.filter((i) => i.contract_id === contract.id);
                  const paid = contractInsts.filter((i) => i.is_paid).length;
                  const total = contractInsts.length;
                  const progress = total > 0 ? Math.round((paid / total) * 100) : 0;
                  return (
                    <div key={contract.id} className="p-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700" onClick={() => navigate("/contracts")}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold", contract.status === "active" ? "bg-gradient-to-br from-emerald-500 to-teal-500" : contract.status === "completed" ? "bg-gradient-to-br from-blue-500 to-cyan-500" : "bg-gradient-to-br from-rose-500 to-pink-500")}>#{contract.id}</div>
                          <div><p className="text-sm font-bold text-slate-700 dark:text-slate-200">{contract.product_type}</p><p className="text-[10px] text-slate-400">{contract.total_price.toLocaleString()} ج.م</p></div>
                        </div>
                        <Badge className={cn("rounded-lg text-[10px] border-0", contract.status === "active" ? "bg-emerald-100 text-emerald-700" : contract.status === "completed" ? "bg-blue-100 text-blue-700" : "bg-rose-100 text-rose-700")}>
                          {contract.status === "active" ? "نشط" : contract.status === "completed" ? "مكتمل" : "متأخر"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
                        <span className="text-[10px] font-bold text-slate-500">{paid}/{total}</span>
                      </div>
                    </div>
                  );
                })}
                {customerContracts.length === 0 && <div className="text-center py-6"><FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" /><p className="text-sm text-slate-500">لا توجد عقود</p></div>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* سجل الدفع الكامل */}
        <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100/80 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2"><Calendar className="h-5 w-5 text-violet-500" />سجل الدفع الكامل</CardTitle>
              <div className="flex items-center gap-2">
                {stats.unpaidInstallments > 0 && <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 rounded-lg text-[11px] px-2.5 py-1 font-bold">{stats.unpaidInstallments} قسط باقي</Badge>}
                <Badge variant="outline" className="rounded-lg">{customerInstallments.length} قسط</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {customerInstallments.length === 0 ? (
              <div className="text-center py-12"><CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-3" /><p className="text-lg font-bold text-slate-600">لا توجد أقساط</p><p className="text-sm text-slate-400">لم يتم تسجيل أي أقساط لهذا العميل بعد</p></div>
            ) : (
              <div className="divide-y divide-slate-100/80 dark:divide-slate-800">
                {customerInstallments.sort((a, b) => new Date(b.year, b.month - 1, b.day).getTime() - new Date(a.year, a.month - 1, a.day).getTime()).map((inst) => {
                  const contract = customerContracts.find((c) => c.id === inst.contract_id);
                  const dueDate = `${inst.day}/${inst.month}/${inst.year}`;
                  const today = new Date(); today.setHours(0, 0, 0, 0);
                  const due = new Date(inst.year, inst.month - 1, inst.day);
                  const isOverdue = !inst.is_paid && due < today;
                  const daysOverdue = isOverdue ? Math.floor((today.getTime() - due.getTime()) / 86400000) : 0;
                  return (
                    <div key={inst.id} className={cn("flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors", isOverdue && "bg-rose-50/30 dark:bg-rose-950/20 border-r-4 border-r-rose-400")}>
                      <div className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0", inst.is_paid ? "bg-gradient-to-br from-emerald-500 to-teal-500" : isOverdue ? "bg-gradient-to-br from-rose-500 to-pink-500" : "bg-gradient-to-br from-amber-500 to-orange-500")}>
                          {inst.is_paid ? <CheckCircle className="h-6 w-6 text-white" /> : isOverdue ? <AlertTriangle className="h-6 w-6 text-white" /> : <Clock className="h-6 w-6 text-white" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm text-slate-800">القسط #{inst.number}</p>
                            <Badge className={cn("rounded-lg text-[10px] border-0", inst.is_paid ? "bg-emerald-100 text-emerald-700" : isOverdue ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700")}>
                              {inst.is_paid ? "مدفوع" : isOverdue ? `متأخر ${daysOverdue} يوم` : "باقي"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />الاستحقاق: {dueDate}</span>
                            {contract && <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{contract.product_type}</span>}
                            {inst.paid_date && <span className="text-emerald-600">سُدد: {inst.paid_date}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className={cn("font-extrabold text-lg", inst.is_paid ? "text-emerald-600" : isOverdue ? "text-rose-600" : "text-slate-800")}>{inst.amount.toLocaleString()} <span className="text-xs font-medium text-slate-400">ج.م</span></p>
                        <div className="flex items-center gap-1.5">
                          {inst.is_paid ? (
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl text-violet-500 hover:bg-violet-50 hover:text-violet-700 active:scale-90" onClick={() => contract && handlePrintReceipt(inst, contract)} title="طباعة الإيصال"><Printer className="h-4 w-4" /></Button>
                          ) : (
                            <>
                              <Button variant="ghost" size="sm" className={cn("h-9 px-3 rounded-xl gap-1.5 font-bold text-xs active:scale-90", isOverdue ? "text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600" : "text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600")} disabled={payingId === inst.id} onClick={() => contract && setConfirmPayDialog({ installment: inst, contract })}>
                                {payingId === inst.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}سداد
                              </Button>
                              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl text-violet-500 hover:bg-violet-50 hover:text-violet-700 active:scale-90" onClick={async () => {
                                if (!contract) return;
                                const config = getWhatsAppConfig();
                                if (!config.endpoint) { showError("يرجى إعداد واتساب من الإعدادات"); return; }
                                const msg = isOverdue ? MESSAGE_TEMPLATES.installmentOverdue(contract.customer_name, inst.amount, daysOverdue, inst.number) : MESSAGE_TEMPLATES.installmentDue(contract.customer_name, inst.amount, dueDate, inst.number);
                                const result = await sendWhatsAppMessage(contract.customer_phone, msg, config);
                                if (result.success) showSuccess(`✅ تم إرسال تذكير للقسط #${inst.number}`); else showError(result.message);
                              }} title="إرسال تذكير واتساب"><Send className="h-4 w-4" /></Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* نافذة تأكيد السداد */}
      <Dialog open={confirmPayDialog !== null} onOpenChange={(open) => { if (!open) setConfirmPayDialog(null); }}>
        <DialogContent className="sm:max-w-[420px] rounded-3xl p-0 overflow-hidden">
          <div className="p-6 pb-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-3"><CheckCircle className="h-8 w-8 text-white" /></div>
              <DialogTitle className="text-lg font-extrabold text-slate-800">تأكيد سداد القسط</DialogTitle>
              <p className="text-xs text-slate-500 mt-1">يرجى التأكد من استلام المبلغ قبل التأكيد</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {confirmPayDialog && (
              <>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3 text-sm">
                  <div className="flex justify-between items-center"><span className="text-slate-500">العميل</span><span className="font-bold text-slate-800">{confirmPayDialog.contract.customer_name}</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-500">المنتج</span><span className="font-bold text-slate-800">{confirmPayDialog.contract.product_type}</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-500">رقم القسط</span><span className="font-bold text-slate-800">#{confirmPayDialog.installment.number} من {confirmPayDialog.contract.number_of_receipts}</span></div>
                  <div className="flex justify-between items-center border-t border-slate-200/60 pt-3"><span className="text-slate-600 font-semibold">المبلغ المطلوب سداده</span><span className="font-extrabold text-xl text-emerald-600">{confirmPayDialog.installment.amount.toLocaleString()} ج.م</span></div>
                </div>
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-3 text-center font-medium">⚠️ سيتم تسجيل هذا القسط كمدفوع بتاريخ اليوم</p>
              </>
            )}
          </div>
          <DialogFooter className="px-6 pb-6 grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => setConfirmPayDialog(null)} className="rounded-xl h-11">إلغاء</Button>
            <Button onClick={handlePayInstallment} disabled={payingId !== null} className="rounded-xl h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold gap-2">
              {payingId ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}نعم، تم الاستلام
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PrintDialog open={printOpen} onOpenChange={setPrintOpen} htmlContent={printHtml} title={printTitle} filename={printFilename} />
    </Layout>
  );
};

export default CustomerProfile;
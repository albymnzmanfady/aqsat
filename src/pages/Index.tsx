"use client";

import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import AnimatedCounter from "@/components/AnimatedCounter";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiContract, ApiInstallment, ApiCustomer } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { showSuccess, showError } from "@/utils/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Plus, CreditCard, Users, FileText, AlertTriangle, 
  CheckCircle2, Clock, Loader2,
  TrendingUp, Wallet, Sparkles, Calendar,
  ChevronLeft, Send, CheckCircle, Coins, Search, X
} from "lucide-react";
import { sendWhatsAppMessage, getWhatsAppConfig, MESSAGE_TEMPLATES } from "@/components/WhatsAppService";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<ApiContract[]>([]);
  const [installments, setInstallments] = useState<ApiInstallment[]>([]);
  const [customers, setCustomers] = useState<ApiCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overdue" | "today" | "recent">("overdue");
  const [sendingId, setSendingId] = useState<number | null>(null);

  // البحث السريع للتحصيل
  const [quickSearch, setQuickSearch] = useState("");

  // حالة تأكيد التحصيل المالي
  const [confirmPayInstallment, setConfirmPayInstallment] = useState<any | null>(null);

  // حالة التحكم في النوافذ المنبثقة لجميع المؤشرات المالية
  const [activeModal, setActiveModal] = useState<"total" | "collected" | "remaining" | "overdue" | "today" | "activeContracts" | null>(null);

  useEffect(() => {
    Promise.all([
      api.contracts.list(),
      api.installments.list(),
      api.customers.list()
    ])
      .then(([c, i, cu]) => { 
        setContracts(c); 
        setInstallments(i); 
        setCustomers(cu);
      })
      .catch((err) => {
        showError("حدث خطأ أثناء تحميل البيانات: " + err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // حساب التوقيت والتحية الذكية
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "صباح الخير والبركة";
    if (hour < 18) return "مساء الخير والنشاط";
    return "مساء الخير والنجاح";
  }, []);

  // فرز الأقساط المتأخرة
  const overdueInstallments = useMemo(() => {
    return installments.filter(i => !i.is_paid && new Date(i.year, i.month - 1, i.day) < today);
  }, [installments, today]);

  // مستحقات اليوم الفردية
  const todayInstallments = useMemo(() => {
    return installments.filter(i => {
      const due = new Date(i.year, i.month - 1, i.day);
      return !i.is_paid && due.getTime() === today.getTime();
    });
  }, [installments, today]);

  const recentContracts = useMemo(() => {
    return [...contracts]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [contracts]);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // إحصائيات الشهر الحالي بالتفصيل
  const currentMonthStats = useMemo(() => {
    const monthInsts = installments.filter(i => i.month === currentMonth && i.year === currentYear);
    const totalToCollect = monthInsts.reduce((sum, i) => sum + i.amount, 0);
    const collected = monthInsts.filter(i => i.is_paid).reduce((sum, i) => sum + i.amount, 0);
    const remaining = Math.max(0, totalToCollect - collected);
    const progressPercent = totalToCollect > 0 ? Math.round((collected / totalToCollect) * 100) : 0;

    return {
      totalToCollect,
      collected,
      remaining,
      progressPercent,
      monthName: now.toLocaleDateString("ar-EG", { month: "long" })
    };
  }, [installments, currentMonth, currentYear]);

  // أقساط الشهر الحالي بالتفاصيل
  const currentMonthInstallmentsWithDetails = useMemo(() => {
    return installments
      .filter(i => i.month === currentMonth && i.year === currentYear)
      .map(i => {
        const contract = contracts.find(c => c.id === i.contract_id);
        return {
          ...i,
          customerName: contract?.customer_name || "عميل غير معروف",
          productType: contract?.product_type || "منتج غير معروف",
          customerPhone: contract?.customer_phone || ""
        };
      });
  }, [installments, contracts, currentMonth, currentYear]);

  // تصفية ذكية للأقساط غير المسددة للتحصيل السريع
  const quickSearchResults = useMemo(() => {
    if (!quickSearch.trim()) return [];
    const query = quickSearch.trim().toLowerCase();
    
    // إيجاد كافة الأقساط غير المسددة
    return installments
      .filter(i => !i.is_paid)
      .map(i => {
        const contract = contracts.find(c => c.id === i.contract_id);
        return {
          ...i,
          customerName: contract?.customer_name || "",
          customerPhone: contract?.customer_phone || "",
          productType: contract?.product_type || ""
        };
      })
      .filter(i => 
        i.customerName.toLowerCase().includes(query) || 
        i.customerPhone.includes(query)
      )
      .slice(0, 5); // أقصى حد 5 نتائج للحفاظ على بساطة الواجهة
  }, [quickSearch, installments, contracts]);

  // أقساط المتأخرات بالتفاصيل الكاملة
  const overdueInstallmentsWithDetails = useMemo(() => {
    return overdueInstallments.map(i => {
      const contract = contracts.find(c => c.id === i.contract_id);
      return {
        ...i,
        customerName: contract?.customer_name || "عميل غير معروف",
        productType: contract?.product_type || "منتج غير معروف",
        customerPhone: contract?.customer_phone || ""
      };
    });
  }, [overdueInstallments, contracts]);

  // أقساط اليوم بالتفاصيل الكاملة
  const todayInstallmentsWithDetails = useMemo(() => {
    return todayInstallments.map(i => {
      const contract = contracts.find(c => c.id === i.contract_id);
      return {
        ...i,
        customerName: contract?.customer_name || "عميل غير معروف",
        productType: contract?.product_type || "منتج غير معروف",
        customerPhone: contract?.customer_phone || ""
      };
    });
  }, [todayInstallments, contracts]);

  // العقود النشطة بالبرنامج
  const activeContractsList = useMemo(() => {
    return contracts.filter(c => c.status === "active");
  }, [contracts]);

  // إعداد مصفوفة البيانات المعروضة في النافذة المنبثقة بناءً على البطاقة النشطة
  const modalInstallmentsList = useMemo(() => {
    if (activeModal === "total") return currentMonthInstallmentsWithDetails;
    if (activeModal === "collected") return currentMonthInstallmentsWithDetails.filter(i => i.is_paid);
    if (activeModal === "remaining") return currentMonthInstallmentsWithDetails.filter(i => !i.is_paid);
    if (activeModal === "overdue") return overdueInstallmentsWithDetails;
    if (activeModal === "today") return todayInstallmentsWithDetails;
    return [];
  }, [activeModal, currentMonthInstallmentsWithDetails, overdueInstallmentsWithDetails, todayInstallmentsWithDetails]);

  // توجيه الطلب إلى نافذة التأكيد قبل التنفيذ
  const askPayConfirmation = (inst: any) => {
    setConfirmPayInstallment(inst);
  };

  // تأكيد و تنفيذ عملية السداد المالي الفعلية في قاعدة البيانات
  const executePayment = async () => {
    if (!confirmPayInstallment) return;
    const installmentId = confirmPayInstallment.id;

    try {
      await api.installments.update(installmentId, {
        isPaid: true,
        paidDate: new Date().toISOString().split("T")[0]
      });
      showSuccess("✅ تم تحصيل القسط بنجاح وتسجيل المعاملة المالية");
      setQuickSearch(""); // إعادة تصفير البحث الفوري
      setConfirmPayInstallment(null); // إغلاق تأكيد السداد
      
      // تحديث البيانات فوراً
      const [c, i] = await Promise.all([api.contracts.list(), api.installments.list()]);
      setContracts(c);
      setInstallments(i);
    } catch (e: any) {
      showError("خطأ في التحصيل: " + e.message);
    }
  };

  // إرسال تذكير سريع بالواتساب
  const handleQuickWhatsApp = async (inst: any) => {
    const config = getWhatsAppConfig();
    if (!config.endpoint) {
      showError("يرجى إعداد واتساب أولاً من صفحة الإعدادات");
      return;
    }

    setSendingId(inst.id);
    const dueDate = `${inst.day}/${inst.month}/${inst.year}`;
    const message = MESSAGE_TEMPLATES.installmentDue(inst.customerName, inst.amount, dueDate, inst.number);

    const result = await sendWhatsAppMessage(inst.customerPhone, message, config);
    if (result.success) {
      showSuccess(`✅ تم إرسال تذكير واتساب لـ ${inst.customerName}`);
    } else {
      showError(result.message);
    }
    setSendingId(null);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="h-10 w-10 text-violet-600 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">جاري تحضير لوحة التحكم الذكية...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 pb-24 page-enter-animation">
        
        {/* ترحيب و واجهة رئيسية راقية */}
        <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white shadow-xl shadow-purple-500/10">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-xl animate-pulse" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-indigo-500/20 rounded-full blur-xl" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2 text-right">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-300 fill-amber-300" />
                <span className="text-xs lg:text-sm font-semibold text-purple-100 tracking-wider">لوحة القيادة والتحصيل</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
                {greeting}، {user?.name || "مستخدم"} 👋
              </h1>
              <p className="text-sm text-purple-100 font-medium leading-relaxed max-w-xl">
                لديك اليوم مهام تحصيل هامة. إليك ملخص حي لكافة المؤشرات المالية والحركات النشطة بالنظام.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-3 self-start md:self-auto shadow-inner">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-amber-300" />
              </div>
              <div className="text-right">
                <p className="text-xs text-purple-200">تاريخ اليوم</p>
                <p className="text-sm font-bold">{new Date().toLocaleDateString("ar-EG", { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* قسم التحصيل السريع والمباشر - Quick Collector Widget */}
        <Card className="border-0 bg-white/90 backdrop-blur-sm overflow-hidden p-5 shadow-lg border-r-4 border-r-violet-500">
          <div className="space-y-3">
            <div className="text-right">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-500" />
                البحث السريع والتحصيل الفوري للأقساط ⚡
              </h3>
              <p className="text-xs text-slate-500 mt-1">اكتب اسم العميل أو جزء من هاتفه لتحصيل أي قسط بضغطة واحدة</p>
            </div>

            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="ابحث باسم العميل أو رقم الهاتف للتحصيل..."
                className="pr-12 rounded-2xl h-12 bg-white border-slate-200"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
              />
              {quickSearch && (
                <button
                  onClick={() => setQuickSearch("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-500"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* عرض نتائج البحث الفوري */}
            {quickSearch && (
              <div className="mt-3 p-2 bg-slate-50/50 rounded-2xl border border-slate-100 divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
                {quickSearchResults.map((inst) => (
                  <div key={inst.id} className="flex items-center justify-between p-3 first:pt-2 last:pb-2">
                    <div className="text-right space-y-1">
                      <p className="text-sm font-bold text-slate-800">{inst.customerName}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{inst.productType}</span>
                        <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold border border-amber-100">
                          القسط #{inst.number}
                        </span>
                        <span className="text-[10px] text-slate-400" dir="ltr">
                          استحقاق: {inst.day}/{inst.month}/{inst.year}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-left ml-2">
                        <p className="text-xs text-slate-400">القيمة</p>
                        <p className="text-sm font-extrabold text-slate-800">{inst.amount.toLocaleString()} ج.م</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => askPayConfirmation(inst)}
                        className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold gap-1 active:scale-95"
                      >
                        <CheckCircle className="h-4 w-4" />
                        سدد الآن
                      </Button>
                    </div>
                  </div>
                ))}
                {quickSearchResults.length === 0 && (
                  <p className="text-center text-xs text-slate-400 py-6">لا توجد أقساط مستحقة مطابقة لهذا البحث</p>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* المؤشرات المالية المخصصة لشهر التحصيل الحالي */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-md font-bold text-slate-700 flex items-center gap-2 px-1">
              <Coins className="h-5 w-5 text-violet-600" />
              مؤشرات شهر {currentMonthStats.monthName} المالي <span className="text-xs font-normal text-slate-400 mr-1">(اضغط لعرض التفاصيل)</span>
            </h2>
            <Badge variant="outline" className="border-violet-200 text-violet-700 bg-violet-50 font-bold rounded-lg px-3 py-1">
              تفاعلي ذكي ⚡
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* المستحقات الكلية */}
            <div
              onClick={() => setActiveModal("total")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveModal("total"); }}
              className="cursor-pointer active:scale-[0.99] transition-all"
            >
              <Card className="border-0 bg-white/70 backdrop-blur-sm hover-lift relative overflow-hidden group">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="space-y-1 text-right">
                    <p className="text-xs font-semibold text-slate-500 group-hover:text-violet-600 transition-colors">إجمالي مستحقات الشهر</p>
                    <p className="text-2xl font-extrabold text-slate-800">
                      <AnimatedCounter value={currentMonthStats.totalToCollect} duration={800} formatter={(v) => v.toLocaleString()} />
                      <span className="text-xs font-medium text-slate-400 mr-1">ج.م</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform">
                    <Wallet className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ما تم تحصيله */}
            <div
              onClick={() => setActiveModal("collected")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveModal("collected"); }}
              className="cursor-pointer active:scale-[0.99] transition-all"
            >
              <Card className="border-0 bg-white/70 backdrop-blur-sm hover-lift relative overflow-hidden border-r-4 border-r-emerald-500 group">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="space-y-1 text-right">
                    <p className="text-xs font-semibold text-slate-500 group-hover:text-emerald-600 transition-colors">تم تحصيله بنجاح</p>
                    <p className="text-2xl font-extrabold text-emerald-600">
                      <AnimatedCounter value={currentMonthStats.collected} duration={800} formatter={(v) => v.toLocaleString()} />
                      <span className="text-xs font-medium text-emerald-400 mr-1">ج.م</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* المتبقي للتحصيل */}
            <div
              onClick={() => setActiveModal("remaining")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveModal("remaining"); }}
              className="cursor-pointer active:scale-[0.99] transition-all"
            >
              <Card className="border-0 bg-white/70 backdrop-blur-sm hover-lift relative overflow-hidden border-r-4 border-r-amber-500 group">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="space-y-1 text-right">
                    <p className="text-xs font-semibold text-slate-500 group-hover:text-amber-600 transition-colors">المتبقي المطلوب تحصيله</p>
                    <p className="text-2xl font-extrabold text-amber-600">
                      <AnimatedCounter value={currentMonthStats.remaining} duration={800} formatter={(v) => v.toLocaleString()} />
                      <span className="text-xs font-medium text-amber-400 mr-1">ج.م</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                    <Clock className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>

        {/* شريط تقدم تحصيل مستهدفات الشهر الكلية */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm overflow-hidden p-6 hover-lift">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="text-right">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5 text-emerald-500" />
                مستهدف إنجاز التحصيل لشهر {currentMonthStats.monthName}
              </h3>
              <p className="text-xs text-slate-500 mt-1">نسبة التحصيل الفعلي المحقق مقابل مستحقات الشهر الكاملة</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100">
                محصل: {currentMonthStats.collected.toLocaleString()} ج.م
              </span>
              <span className="text-xs font-semibold bg-violet-50 text-violet-700 px-3 py-1 rounded-full border border-violet-100">
                مستهدف: {currentMonthStats.totalToCollect.toLocaleString()} ج.م
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>نسبة الإنجاز الفعلي</span>
              <span className="text-emerald-600">{currentMonthStats.progressPercent}%</span>
            </div>
            <Progress value={currentMonthStats.progressPercent} className="h-3 rounded-full bg-slate-100 [&>div]:bg-gradient-to-r [&>div]:from-emerald-400 [&>div]:to-teal-500" />
          </div>
        </Card>

        {/* المؤشرات العامة للنظام */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* المتأخرات الكلية */}
          <div
            onClick={() => setActiveModal("overdue")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveModal("overdue"); }}
            className="cursor-pointer active:scale-[0.99] transition-all"
          >
            <Card className="border-0 bg-white/70 backdrop-blur-sm hover-lift relative overflow-hidden group">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1 text-right">
                  <p className="text-xs font-semibold text-slate-500">متأخرات عاجلة (خارج الشهر الحالي)</p>
                  <p className="text-lg font-bold text-rose-600">
                    <AnimatedCounter value={overdueInstallments.length} duration={800} /> قسط
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600">
                  <AlertTriangle className="h-5 w-5 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* يستحق اليوم */}
          <div
            onClick={() => setActiveModal("today")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveModal("today"); }}
            className="cursor-pointer active:scale-[0.99] transition-all"
          >
            <Card className="border-0 bg-white/70 backdrop-blur-sm hover-lift relative overflow-hidden group">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1 text-right">
                  <p className="text-xs font-semibold text-slate-500">مستحقات اليوم الفردية</p>
                  <p className="text-lg font-bold text-slate-800">
                    <AnimatedCounter value={todayInstallments.length} duration={800} /> قسط
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Clock className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* العقود النشطة */}
          <div
            onClick={() => setActiveModal("activeContracts")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveModal("activeContracts"); }}
            className="cursor-pointer active:scale-[0.99] transition-all col-span-2 lg:col-span-1"
          >
            <Card className="border-0 bg-white/70 backdrop-blur-sm hover-lift relative overflow-hidden group">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1 text-right">
                  <p className="text-xs font-semibold text-slate-500">العقود النشطة بالبرنامج</p>
                  <p className="text-lg font-bold text-violet-600">
                    <AnimatedCounter value={contracts.filter(c => c.status === "active").length} duration={800} /> عقد
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-600">
                  <FileText className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* التبويبات التفاعلية للمهام اليومية والعقود */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-3">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 px-1">
              <CheckCircle2 className="h-5 w-5 text-violet-600" />
              المهام والحركات النشطة
            </h2>
            
            {/* التبويبات */}
            <div className="flex gap-2 self-start sm:self-auto bg-slate-100 p-1 rounded-xl">
              {[
                { id: "overdue", label: "متأخرات حرجة", count: overdueInstallments.length },
                { id: "today", label: "مستحقات اليوم", count: todayInstallments.length },
                { id: "recent", label: "أحدث العقود", count: null }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200",
                    activeTab === tab.id
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{tab.label}</span>
                    {tab.count !== null && (
                      <span className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border",
                        activeTab === tab.id ? "bg-slate-800 text-white" : "bg-slate-200 text-slate-600"
                      )}>
                        {tab.count}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* محتوى التبويبات */}
          <div className="grid gap-3">
            
            {/* الأقساط المتأخرة */}
            {activeTab === "overdue" && (
              <>
                {overdueInstallments.slice(0, 5).map(inst => {
                  const contract = contracts.find(c => c.id === inst.contract_id);
                  const dueDate = `${inst.day}/${inst.month}/${inst.year}`;
                  return (
                    <div 
                      key={inst.id} 
                      className="stagger-item bg-white/90 border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4 text-right">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500/10 flex items-center justify-center text-rose-500 shadow-sm flex-shrink-0">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-800">{contract?.customer_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              {contract?.product_type}
                            </span>
                            <span className="text-xs text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md font-semibold">
                              متأخر منذ {dueDate}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                        <div className="text-right">
                          <p className="text-xs text-slate-400 leading-tight">القيمة</p>
                          <p className="text-sm font-extrabold text-rose-600">{inst.amount.toLocaleString()} ج.م</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                            onClick={() => askPayConfirmation({
                              id: inst.id,
                              customerName: contract?.customer_name,
                              productType: contract?.product_type,
                              amount: inst.amount,
                              number: inst.number
                            })}
                          >
                            تسجيل تحصيل
                          </Button>
                          {contract && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600 gap-1.5"
                              disabled={sendingId === inst.id}
                              onClick={() => handleQuickWhatsApp({
                                id: inst.id,
                                customerName: contract.customer_name,
                                amount: inst.amount,
                                day: inst.day,
                                month: inst.month,
                                year: inst.year,
                                number: inst.number,
                                customerPhone: contract.customer_phone
                              })}
                            >
                              {sendingId === inst.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 text-violet-500" />}
                              تذكير
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {overdueInstallments.length > 5 && (
                  <Button 
                    variant="ghost" 
                    className="w-full text-xs text-violet-600 hover:text-violet-700 font-semibold gap-1 py-3"
                    onClick={() => navigate("/installments")}
                  >
                    <span>عرض كافة المتأخرات ({overdueInstallments.length})</span>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}
                {overdueInstallments.length === 0 && (
                  <div className="text-center py-10 bg-white/40 border border-dashed rounded-2xl">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700">ممتاز! لا توجد أقساط متأخرة</p>
                    <p className="text-xs text-slate-400 mt-1">كافة العملاء منتظمين تماماً بالسداد</p>
                  </div>
                )}
              </>
            )}

            {/* مستحقات اليوم */}
            {activeTab === "today" && (
              <>
                {todayInstallments.slice(0, 5).map(inst => {
                  const contract = contracts.find(c => c.id === inst.contract_id);
                  return (
                    <div 
                      key={inst.id} 
                      className="stagger-item bg-white/90 border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4 text-right">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500/10 flex items-center justify-center text-amber-500 shadow-sm flex-shrink-0">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-800">{contract?.customer_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              {contract?.product_type}
                            </span>
                            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-semibold">
                              تستحق اليوم
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                        <div className="text-right">
                          <p className="text-xs text-slate-400 leading-tight">القيمة المطلوب سدادها</p>
                          <p className="text-sm font-extrabold text-slate-800">{inst.amount.toLocaleString()} ج.م</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                            onClick={() => askPayConfirmation({
                              id: inst.id,
                              customerName: contract?.customer_name,
                              productType: contract?.product_type,
                              amount: inst.amount,
                              number: inst.number
                            })}
                          >
                            تسجيل سداد
                          </Button>
                          {contract && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600 gap-1.5"
                              disabled={sendingId === inst.id}
                              onClick={() => handleQuickWhatsApp({
                                id: inst.id,
                                customerName: contract.customer_name,
                                amount: inst.amount,
                                day: inst.day,
                                month: inst.month,
                                year: inst.year,
                                number: inst.number,
                                customerPhone: contract.customer_phone
                              })}
                            >
                              {sendingId === inst.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 text-violet-500" />}
                              تذكير
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {todayInstallments.length > 5 && (
                  <Button 
                    variant="ghost" 
                    className="w-full text-xs text-violet-600 hover:text-violet-700 font-semibold gap-1 py-3"
                    onClick={() => navigate("/installments")}
                  >
                    <span>عرض كافة مستحقات اليوم ({todayInstallments.length})</span>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}
                {todayInstallments.length === 0 && (
                  <div className="text-center py-10 bg-white/40 border border-dashed rounded-2xl">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700">لا توجد أقساط مستحقة اليوم</p>
                    <p className="text-xs text-slate-400 mt-1">لا توجد تحصيلات مطلوبة لهذا التاريخ</p>
                  </div>
                )}
              </>
            )}

            {/* أحدث العقود المضافة */}
            {activeTab === "recent" && (
              <>
                {recentContracts.map(contract => (
                  <div 
                    key={contract.id} 
                    className="stagger-item bg-white/90 border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4 text-right">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500/10 flex items-center justify-center text-violet-600 shadow-sm flex-shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-800">{contract.customer_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {contract.product_type}
                          </span>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {contract.number_of_receipts} شهر
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                      <div className="text-right">
                        <p className="text-xs text-slate-400 leading-tight">إجمالي العقد</p>
                        <p className="text-sm font-extrabold text-slate-800">{contract.total_price.toLocaleString()} ج.م</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="rounded-xl border-violet-200 hover:bg-violet-50 text-violet-600"
                        onClick={() => navigate("/contracts")}
                      >
                        عرض العقد
                      </Button>
                    </div>
                  </div>
                ))}
                {recentContracts.length === 0 && (
                  <div className="text-center py-10 bg-white/40 border border-dashed rounded-2xl">
                    <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700">لا توجد عقود حتى الآن</p>
                    <p className="text-xs text-slate-400 mt-1">سجل أول عقد للبدء في تنظيم الأقساط</p>
                  </div>
                )}
              </>
            )}

          </div>
        </div>

      </div>

      {/* أزرار الوصول السريع والعمليات الحيوية العائمة */}
      <div className="fixed bottom-20 left-6 z-40 flex flex-col gap-3">
        <Link to="/installments" title="تسجيل قسط">
          <Button className="h-14 w-14 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-xl hover:shadow-amber-500/25 active:scale-90 transition-all text-white border-0">
            <CreditCard className="h-6 w-6" />
          </Button>
        </Link>
        <Link to="/contracts" title="إنشاء عقد جديد">
          <Button className="h-14 w-14 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-xl hover:shadow-emerald-500/25 active:scale-90 transition-all text-white border-0">
            <Plus className="h-7 w-7" />
          </Button>
        </Link>
      </div>

      {/* نافذة التفاصيل المالية المنبثقة التفاعلية */}
      <Dialog open={activeModal !== null} onOpenChange={(open) => { if (!open) setActiveModal(null); }}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl p-0 overflow-hidden bg-white">
          <DialogHeader className="p-6 pb-4 border-b border-slate-100 text-right bg-gradient-to-r from-violet-50 to-slate-50">
            <DialogTitle className="text-lg font-extrabold text-slate-800 flex items-center gap-2 justify-start">
              {activeModal === "total" && (
                <>
                  <Wallet className="h-5 w-5 text-violet-600" />
                  <span>تفاصيل مستحقات شهر {currentMonthStats.monthName}</span>
                </>
              )}
              {activeModal === "collected" && (
                <>
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span>الأقساط المحصلة بنجاح</span>
                </>
              )}
              {activeModal === "remaining" && (
                <>
                  <Clock className="h-5 w-5 text-amber-600" />
                  <span>الأقساط المتبقية للتحصيل</span>
                </>
              )}
              {activeModal === "overdue" && (
                <>
                  <AlertTriangle className="h-5 w-5 text-rose-600 animate-pulse" />
                  <span>جميع المتأخرات الحرجة بالنظام</span>
                </>
              )}
              {activeModal === "today" && (
                <>
                  <Clock className="h-5 w-5 text-amber-500" />
                  <span>مستحقات اليوم الفردية</span>
                </>
              )}
              {activeModal === "activeContracts" && (
                <>
                  <FileText className="h-5 w-5 text-violet-600" />
                  <span>جميع العقود النشطة بالبرنامج</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 text-right mt-1">
              {activeModal === "total" && `إجمالي المطلوب تحصيله: ${currentMonthStats.totalToCollect.toLocaleString()} ج.م`}
              {activeModal === "collected" && `إجمالي المبالغ المحصلة: ${currentMonthStats.collected.toLocaleString()} ج.م`}
              {activeModal === "remaining" && `المتبقي المطلوب تحصيله: ${currentMonthStats.remaining.toLocaleString()} ج.م`}
              {activeModal === "overdue" && `إجمالي المتأخرات العاجلة: ${overdueInstallments.length} قسط`}
              {activeModal === "today" && `مستحقات اليوم غير المسددة: ${todayInstallments.length} قسط`}
              {activeModal === "activeContracts" && `إجمالي العقود النشطة المفتوحة: ${activeContractsList.length} عقد`}
            </DialogDescription>
          </DialogHeader>

          {/* قائمة الأقساط / العقود للتفاصيل المحددة */}
          <div className="max-h-[350px] overflow-y-auto divide-y divide-slate-100 p-4">
            
            {/* العرض في حال كان الخيار المختار هو عرض العقود النشطة */}
            {activeModal === "activeContracts" ? (
              activeContractsList.map((contract) => (
                <div key={contract.id} className="flex items-center justify-between py-3.5 px-2 hover:bg-slate-50 rounded-xl transition-all">
                  <div className="flex items-center gap-3 text-right">
                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xs">
                      #{contract.id}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{contract.customer_name}</p>
                      <p className="text-[10px] text-slate-400">{contract.product_type} - {contract.number_of_receipts} قسط</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-extrabold text-slate-800">{contract.total_price.toLocaleString()} ج.م</p>
                    <p className="text-[10px] text-slate-400">مقدم: {contract.down_payment.toLocaleString()} ج.م</p>
                  </div>
                </div>
              ))
            ) : (
              // العرض في حال كان الخيار المختار هو أحد تصنيفات الأقساط
              modalInstallmentsList.map((inst) => (
                <div key={inst.id} className="flex items-center justify-between py-3 px-2 hover:bg-slate-50 rounded-xl transition-all">
                  <div className="flex items-center gap-3 text-right">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white",
                      inst.is_paid ? "bg-emerald-500" : "bg-amber-500"
                    )}>
                      #{inst.number}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{inst.customerName}</p>
                      <p className="text-[10px] text-slate-400">{inst.productType}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-left">
                    <div>
                      <p className="text-sm font-extrabold text-slate-800">{inst.amount.toLocaleString()} ج.م</p>
                      <p className="text-[10px] text-slate-400" dir="ltr">{inst.day}/{inst.month}/{inst.year}</p>
                    </div>

                    {!inst.is_paid && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                        onClick={() => {
                          askPayConfirmation({
                            id: inst.id,
                            customerName: inst.customerName,
                            productType: inst.productType,
                            amount: inst.amount,
                            number: inst.number
                          });
                          setActiveModal(null);
                        }}
                        title="تسجيل تحصيل سريع"
                      >
                        <CheckCircle className="h-4.5 w-4.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}

            {((activeModal === "activeContracts" ? activeContractsList.length : modalInstallmentsList.length) === 0) && (
              <div className="text-center py-12 text-slate-400">
                <Clock className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium">لا توجد بيانات متاحة لهذا القسم</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => setActiveModal(null)}
            >
              إغلاق النافذة
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* نافذة تأكيد عملية تحصيل الأموال الحذرة */}
      <Dialog open={confirmPayInstallment !== null} onOpenChange={(open) => { if (!open) setConfirmPayInstallment(null); }}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-500 animate-bounce">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-800">تأكيد عملية تحصيل مالي 🪙</h3>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-right text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">العميل المستلم منه:</span>
                <span className="font-bold text-slate-800">{confirmPayInstallment?.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">رقم الدفعة / السلعة:</span>
                <span className="font-bold text-slate-800">القسط #{confirmPayInstallment?.number} - {confirmPayInstallment?.productType}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200/60 pt-2 mt-2">
                <span className="text-slate-600 font-semibold">المبلغ النقدي الفعلي:</span>
                <span className="font-extrabold text-base text-emerald-600">{confirmPayInstallment?.amount?.toLocaleString()} ج.م</span>
              </div>
            </div>
            <p className="text-xs text-rose-500 font-semibold leading-relaxed text-center">
              ⚠️ يرجى التأكد من استلام النقدية أو التحويل البنكي الفعلي قبل الضغط على تأكيد.
            </p>
          </div>
          <DialogFooter className="grid grid-cols-2 gap-3 mt-4">
            <Button
              variant="outline"
              className="rounded-xl h-11"
              onClick={() => setConfirmPayInstallment(null)}
            >
              تراجع وإلغاء
            </Button>
            <Button
              className="rounded-xl h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold"
              onClick={executePayment}
            >
              نعم، تم الاستلام
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Index;
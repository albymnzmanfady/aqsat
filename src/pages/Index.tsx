"use client";

import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import AnimatedCounter from "@/components/AnimatedCounter";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiContract, ApiInstallment, ApiCustomer } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { showSuccess, showError } from "@/utils/toast";
import { 
  Plus, CreditCard, Users, FileText, AlertTriangle, 
  CheckCircle2, Clock, MessageSquareText, Loader2,
  TrendingUp, Wallet, Sparkles, Calendar, ArrowUpRight,
  UserCheck, ChevronLeft, Send
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

  // فرز الأقساط
  const overdueInstallments = useMemo(() => {
    return installments.filter(i => !i.is_paid && new Date(i.year, i.month - 1, i.day) < today);
  }, [installments, today]);

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

  // إحصائيات الشهر الحالي
  const currentMonthStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const monthInsts = installments.filter(i => i.month === currentMonth && i.year === currentYear);
    const totalToCollect = monthInsts.reduce((sum, i) => sum + i.amount, 0);
    const collected = monthInsts.filter(i => i.is_paid).reduce((sum, i) => sum + i.amount, 0);
    const progressPercent = totalToCollect > 0 ? Math.round((collected / totalToCollect) * 100) : 0;

    return {
      totalToCollect,
      collected,
      progressPercent
    };
  }, [installments]);

  // تسجيل سداد قسط مباشر من الصفحة الرئيسية
  const handleQuickPay = async (installmentId: number) => {
    try {
      await api.installments.update(installmentId, {
        isPaid: true,
        paidDate: new Date().toISOString().split("T")[0]
      });
      showSuccess("✅ تم تحصيل القسط بنجاح");
      
      // تحديث البيانات فوراً
      const [c, i] = await Promise.all([api.contracts.list(), api.installments.list()]);
      setContracts(c);
      setInstallments(i);
    } catch (e: any) {
      showError("خطأ في التحصيل: " + e.message);
    }
  };

  // إرسال تذكير سريع بالواتساب
  const handleQuickWhatsApp = async (inst: ApiInstallment, contract: ApiContract) => {
    const config = getWhatsAppConfig();
    if (!config.endpoint) {
      showError("يرجى إعداد واتساب أولاً من صفحة الإعدادات");
      return;
    }

    setSendingId(inst.id);
    const dueDate = `${inst.day}/${inst.month}/${inst.year}`;
    const message = MESSAGE_TEMPLATES.installmentDue(contract.customer_name, inst.amount, dueDate, inst.number);

    const result = await sendWhatsAppMessage(contract.customer_phone, message, config);
    if (result.success) {
      showSuccess(`✅ تم إرسال تذكير واتساب لـ ${contract.customer_name}`);
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

        {/* شبكة المؤشرات المالية المتطورة */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* محصل هذا الشهر */}
          <Card className="border-0 bg-white/70 backdrop-blur-sm hover-lift relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1 text-right">
                  <p className="text-xs font-semibold text-slate-500">مجموع التحصيل (الشهر)</p>
                  <p className="text-xl font-extrabold text-emerald-600">
                    <AnimatedCounter value={currentMonthStats.collected} duration={800} formatter={(v) => v.toLocaleString()} />
                    <span className="text-xs font-medium text-slate-400 mr-1">ج.م</span>
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-500 text-right flex items-center gap-1">
                <span>المستهدف الكلي:</span>
                <span className="font-bold text-slate-700">{currentMonthStats.totalToCollect.toLocaleString()} ج.م</span>
              </div>
            </CardContent>
          </Card>

          {/* المتأخرات الكلية */}
          <Card className="border-0 bg-white/70 backdrop-blur-sm hover-lift relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1 text-right">
                  <p className="text-xs font-semibold text-slate-500">متأخرات عاجلة</p>
                  <p className="text-xl font-extrabold text-rose-600">
                    <AnimatedCounter value={overdueInstallments.length} duration={800} />
                    <span className="text-xs font-medium text-slate-400 mr-1">قسط</span>
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600">
                  <AlertTriangle className="h-5 w-5 animate-pulse" />
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-500 text-right flex items-center gap-1">
                <span>القيمة الكلية المتأخرة:</span>
                <span className="font-extrabold text-rose-700">
                  {overdueInstallments.reduce((sum, i) => sum + i.amount, 0).toLocaleString()} ج.م
                </span>
              </div>
            </CardContent>
          </Card>

          {/* يستحق اليوم */}
          <Card className="border-0 bg-white/70 backdrop-blur-sm hover-lift relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1 text-right">
                  <p className="text-xs font-semibold text-slate-500">يستحق اليوم</p>
                  <p className="text-xl font-extrabold text-amber-600">
                    <AnimatedCounter value={todayInstallments.length} duration={800} />
                    <span className="text-xs font-medium text-slate-400 mr-1">قسط</span>
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-500 text-right flex items-center gap-1">
                <span>مطلوب تحصيله اليوم:</span>
                <span className="font-bold text-slate-700">
                  {todayInstallments.reduce((sum, i) => sum + i.amount, 0).toLocaleString()} ج.م
                </span>
              </div>
            </CardContent>
          </Card>

          {/* العقود النشطة */}
          <Card className="border-0 bg-white/70 backdrop-blur-sm hover-lift relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1 text-right">
                  <p className="text-xs font-semibold text-slate-500">العقود النشطة</p>
                  <p className="text-xl font-extrabold text-violet-600">
                    <AnimatedCounter value={contracts.filter(c => c.status === "active").length} duration={800} />
                    <span className="text-xs font-medium text-slate-400 mr-1">عقد</span>
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-600">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-500 text-right flex items-center gap-1">
                <span>مجموع العملاء الكلي:</span>
                <span className="font-bold text-slate-700">
                  {customers.filter(c => c.type === "customer").length} عملاء
                </span>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* شريط تقدم تحصيل مستهدفات الشهر الكلية */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm overflow-hidden p-6 hover-lift">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="text-right">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Wallet className="h-4.5 w-4.5 text-violet-500" />
                مستهدف تحصيل الشهر الحالي
              </h3>
              <p className="text-xs text-slate-500 mt-1">يتم قياس الأقساط المحصلة مقابل المطلوبة لهذا الشهر</p>
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
              <span>نسبة الإنجاز</span>
              <span className="text-violet-600">{currentMonthStats.progressPercent}%</span>
            </div>
            <Progress value={currentMonthStats.progressPercent} className="h-3 rounded-full bg-slate-100 [&>div]:bg-gradient-to-r [&>div]:from-emerald-400 [&>div]:to-teal-500" />
          </div>
        </Card>

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
                { id: "overdue", label: "متأخرات حرجة", count: overdueInstallments.length, color: "text-rose-600 bg-rose-50 border-rose-100" },
                { id: "today", label: "مستحقات اليوم", count: todayInstallments.length, color: "text-amber-600 bg-amber-50 border-amber-100" },
                { id: "recent", label: "أحدث العقود", count: null, color: "" }
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
                            onClick={() => handleQuickPay(inst.id)}
                          >
                            تسجيل تحصيل
                          </Button>
                          {contract && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600 gap-1.5"
                              disabled={sendingId === inst.id}
                              onClick={() => handleQuickWhatsApp(inst, contract)}
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
                            onClick={() => handleQuickPay(inst.id)}
                          >
                            تسجيل سداد
                          </Button>
                          {contract && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600 gap-1.5"
                              disabled={sendingId === inst.id}
                              onClick={() => handleQuickWhatsApp(inst, contract)}
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
    </Layout>
  );
};

export default Index;
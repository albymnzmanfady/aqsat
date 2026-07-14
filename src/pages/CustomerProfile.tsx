"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import AnimatedCounter from "@/components/AnimatedCounter";
import {
  api,
  ApiCustomer,
  ApiContract,
  ApiInstallment,
} from "@/lib/api";
import { showError } from "@/utils/toast";
import { sendWhatsAppMessage, getWhatsAppConfig, MESSAGE_TEMPLATES } from "@/components/WhatsAppService";
import {
  ArrowRight,
  User,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Wallet,
  Shield,
  Calendar,
  Send,
  Loader2,
  Star,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  BarChart3,
  PhoneCall,
  Hash,
} from "lucide-react";

const CustomerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<ApiCustomer | null>(null);
  const [contracts, setContracts] = useState<ApiContract[]>([]);
  const [allInstallments, setAllInstallments] = useState<ApiInstallment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  useEffect(() => {
    if (!id) {
      showError("معرف العميل غير صحيح");
      navigate("/customers");
      return;
    }

    const fetchData = async () => {
      try {
        const [cust, allContracts, allInst] = await Promise.all([
          api.customers.get(Number(id)),
          api.contracts.list(),
          api.installments.list(),
        ]);
        setCustomer(cust);
        setContracts(
          allContracts.filter(
            (c) =>
              c.customer_id === Number(id) ||
              c.customer_name === cust.name
          )
        );
        setAllInstallments(allInst);
      } catch (e: any) {
        showError("خطأ في تحميل بيانات العميل: " + e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // ===== حسابات شاملة =====

  const customerContracts = useMemo(() => {
    if (!customer) return [];
    return contracts.filter(
      (c) =>
        c.customer_id === customer.id ||
        c.customer_name === customer.name
    );
  }, [contracts, customer]);

  const customerInstallments = useMemo(() => {
    const contractIds = new Set(customerContracts.map((c) => c.id));
    return allInstallments.filter((i) => contractIds.has(i.contract_id));
  }, [allInstallments, customerContracts]);

  const stats = useMemo(() => {
    const totalContracts = customerContracts.length;
    const activeContracts = customerContracts.filter(
      (c) => c.status === "active"
    ).length;
    const completedContracts = customerContracts.filter(
      (c) => c.status === "completed"
    ).length;

    const totalInstallments = customerInstallments.length;
    const paidInstallments = customerInstallments.filter(
      (i) => i.is_paid
    ).length;
    const unpaidInstallments = totalInstallments - paidInstallments;

    const totalValue = customerContracts.reduce(
      (sum, c) => sum + c.total_price,
      0
    );
    const totalPaid = customerInstallments
      .filter((i) => i.is_paid)
      .reduce((sum, i) => sum + i.amount, 0);
    const totalRemaining = customerInstallments
      .filter((i) => !i.is_paid)
      .reduce((sum, i) => sum + i.amount, 0);

    const paymentRate =
      totalInstallments > 0
        ? Math.round((paidInstallments / totalInstallments) * 100)
        : 0;

    // حساب التأخرات
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdueInstallments = customerInstallments.filter(
      (i) =>
        !i.is_paid &&
        new Date(i.year, i.month - 1, i.day) < today
    );
    const totalOverdue = overdueInstallments.length;

    // متوسط أيام التأخير
    let avgDelayDays = 0;
    if (overdueInstallments.length > 0) {
      const totalDays = overdueInstallments.reduce((sum, i) => {
        const due = new Date(i.year, i.month - 1, i.day);
        const diff = Math.floor(
          (today.getTime() - due.getTime()) / 86400000
        );
        return sum + diff;
      }, 0);
      avgDelayDays = Math.round(totalDays / overdueInstallments.length);
    }

    // تقييم المخاطر
    let riskScore = 0;
    let riskLevel: "excellent" | "good" | "fair" | "poor" = "excellent";

    if (paymentRate >= 90 && totalOverdue === 0) {
      riskScore = 95;
      riskLevel = "excellent";
    } else if (paymentRate >= 75 && totalOverdue <= 1) {
      riskScore = 75;
      riskLevel = "good";
    } else if (paymentRate >= 50 && totalOverdue <= 3) {
      riskScore = 50;
      riskLevel = "fair";
    } else {
      riskScore = Math.max(10, paymentRate);
      riskLevel = "poor";
    }

    // عدد الأقساط المدفوعة في الوقت المحدد (بدون تأخير)
    const onTimePaid = customerInstallments.filter((i) => {
      if (!i.is_paid || !i.paid_date) return false;
      const due = new Date(i.year, i.month - 1, i.day);
      const paid = new Date(i.paid_date);
      return paid <= due;
    }).length;

    const onTimeRate =
      paidInstallments > 0
        ? Math.round((onTimePaid / paidInstallments) * 100)
        : 0;

    return {
      totalContracts,
      activeContracts,
      completedContracts,
      totalInstallments,
      paidInstallments,
      unpaidInstallments,
      totalValue,
      totalPaid,
      totalRemaining,
      paymentRate,
      totalOverdue,
      avgDelayDays,
      riskScore,
      riskLevel,
      onTimePaid,
      onTimeRate,
    };
  }, [customerContracts, customerInstallments]);

  // إرسال واتساب
  const handleSendWhatsApp = async () => {
    if (!customer) return;
    const config = getWhatsAppConfig();
    if (!config.endpoint) {
      showError("يرجى إعداد واتساب من الإعدادات");
      return;
    }
    setSendingWhatsApp(true);
    const msg = MESSAGE_TEMPLATES.welcome(customer.name);
    const result = await sendWhatsAppMessage(customer.phone, msg, config);
    if (result.success) {
      showError("✅ تم إرسال رسالة الترحيب");
    } else {
      showError(result.message);
    }
    setSendingWhatsApp(false);
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

  if (!customer) {
    return (
      <Layout>
        <div className="text-center py-32">
          <p className="text-slate-500">العميل غير موجود</p>
          <Button onClick={() => navigate("/customers")} className="mt-4">
            العودة للعملاء
          </Button>
        </div>
      </Layout>
    );
  }

  const riskConfig = {
    excellent: {
      label: "ممتاز",
      color: "from-emerald-500 to-teal-500",
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      icon: ShieldCheck,
      description: "عميل موثوق جداً - سجل سداد ممتاز",
    },
    good: {
      label: "جيد",
      color: "from-blue-500 to-cyan-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      icon: Shield,
      description: "عميل جيد - التزام مقبول مع تأخيرات طفيفة",
    },
    fair: {
      label: "مقبول",
      color: "from-amber-500 to-orange-500",
      textColor: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      icon: ShieldAlert,
      description: "يحتاج متابعة - تأخرات متكررة",
    },
    poor: {
      label: "ضعيف",
      color: "from-rose-500 to-red-500",
      textColor: "text-rose-600",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200",
      icon: ShieldX,
      description: "خطر مرتفع - تأخرات كثيرة وقيم مستحقة كبيرة",
    },
  };

  const risk = riskConfig[stats.riskLevel];

  return (
    <Layout>
      <div className="space-y-6 pb-8 page-enter-animation">
        {/* زر الرجوع */}
        <Button
          variant="ghost"
          onClick={() => navigate("/customers")}
          className="gap-2 text-slate-600 hover:text-violet-600 w-fit rounded-xl"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للعملاء
        </Button>

        {/* بطاقة العميل الرئيسية */}
        <Card className="border-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-xl" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-indigo-500/20 rounded-full blur-xl" />
          </div>
          <CardContent className="p-6 lg:p-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* صورة واسم العميل */}
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-3xl border border-white/30 shadow-lg">
                  {customer.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
                    {customer.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <Badge className="bg-white/20 text-white border-white/30 rounded-lg backdrop-blur-sm">
                      <Phone className="h-3 w-3 ml-1" />
                      {customer.phone}
                    </Badge>
                    <Badge className="bg-white/20 text-white border-white/30 rounded-lg backdrop-blur-sm">
                      {customer.type === "customer" ? "عميل" : "ضامن"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex gap-3 md:mr-auto">
                <Button
                  onClick={handleSendWhatsApp}
                  disabled={sendingWhatsApp}
                  className="rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 gap-2 backdrop-blur-sm"
                >
                  {sendingWhatsApp ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  إرسال رسالة
                </Button>
                <Button
                  onClick={() => navigate("/contracts")}
                  className="rounded-xl bg-white text-violet-700 hover:bg-white/90 gap-2 font-bold shadow-lg"
                >
                  <FileText className="h-4 w-4" />
                  عقد جديد
                </Button>
              </div>
            </div>

            {/* معلومات التواصل */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                  <PhoneCall className="h-3 w-3" />
                  الهاتف
                </div>
                <p className="font-bold" dir="ltr">{customer.phone}</p>
              </div>
              {customer.national_id && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                    <Hash className="h-3 w-3" />
                    الرقم القومي
                  </div>
                  <p className="font-bold" dir="ltr">{customer.national_id}</p>
                </div>
              )}
              {customer.address && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                    <MapPin className="h-3 w-3" />
                    العنوان
                  </div>
                  <p className="font-bold">{customer.address}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* المؤشرات المالية الأساسية */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 bg-white/70 backdrop-blur-sm hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">إجمالي العقود</p>
                  <p className="text-2xl font-extrabold text-slate-800">
                    <AnimatedCounter value={stats.totalContracts} />
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {stats.activeContracts} نشط • {stats.completedContracts} مكتمل
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 backdrop-blur-sm hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">إجمالي المدفوعات</p>
                  <p className="text-2xl font-extrabold text-emerald-600">
                    <AnimatedCounter
                      value={stats.totalPaid}
                      formatter={(v) => v.toLocaleString()}
                    />
                    <span className="text-xs font-medium text-slate-400 mr-1">
                      ج.م
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {stats.paidInstallments} قسط مدفوع
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 backdrop-blur-sm hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">المتبقي للتحصيل</p>
                  <p className="text-2xl font-extrabold text-amber-600">
                    <AnimatedCounter
                      value={stats.totalRemaining}
                      formatter={(v) => v.toLocaleString()}
                    />
                    <span className="text-xs font-medium text-slate-400 mr-1">
                      ج.م
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {stats.unpaidInstallments} قسط باقي
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-md flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 backdrop-blur-sm hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">نسبة السداد</p>
                  <p className="text-2xl font-extrabold text-violet-600">
                    <AnimatedCounter value={stats.paymentRate} />
                    <span className="text-xs font-medium text-slate-400 mr-1">%</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {stats.onTimeRate}% في الموعد
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* تقييم المخاطر وشريط التقدم */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* تقييم المخاطر */}
          <Card className={cn("border-2 overflow-hidden", risk.borderColor)}>
            <CardContent className="p-6">
              <div className="text-center">
                <div
                  className={cn(
                    "w-24 h-24 rounded-3xl bg-gradient-to-br shadow-lg flex items-center justify-center mx-auto mb-4",
                    risk.color
                  )}
                >
                  <risk.icon className="h-12 w-12 text-white" />
                </div>
                <Badge
                  className={cn(
                    "rounded-xl text-sm px-4 py-1 mb-3 bg-gradient-to-r text-white border-0",
                    risk.color
                  )}
                >
                  {risk.label}
                </Badge>
                <p className="text-4xl font-extrabold text-slate-800 mb-1">
                  {stats.riskScore}
                  <span className="text-sm font-normal text-slate-400">
                    {" "}
                    / 100
                  </span>
                </p>
                <p className="text-xs text-slate-500 mb-4">{risk.description}</p>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full bg-gradient-to-r transition-all duration-1000",
                      risk.color
                    )}
                    style={{ width: `${stats.riskScore}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* تفاصيل الأداء المالي */}
          <Card className="border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-violet-500" />
                تفاصيل الأداء المالي
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* نسبة السداد */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-600 font-medium">نسبة السداد الكلية</span>
                  <span className="font-bold text-violet-600">
                    {stats.paymentRate}%
                  </span>
                </div>
                <Progress
                  value={stats.paymentRate}
                  className="h-2.5 rounded-full bg-slate-100 [&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-purple-600"
                />
              </div>

              {/* نسبة السداد في الموعد */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-600 font-medium">سداد في الموعد</span>
                  <span className="font-bold text-emerald-600">
                    {stats.onTimeRate}%
                  </span>
                </div>
                <Progress
                  value={stats.onTimeRate}
                  className="h-2.5 rounded-full bg-slate-100 [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-teal-500"
                />
              </div>

              <div className="h-px bg-slate-100" />

              {/* إحصائيات سريعة */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50/50 rounded-xl text-center">
                  <p className="text-lg font-extrabold text-emerald-600">
                    {stats.paidInstallments}
                  </p>
                  <p className="text-[10px] text-slate-500">قسط مدفوع</p>
                </div>
                <div className="p-3 bg-amber-50/50 rounded-xl text-center">
                  <p className="text-lg font-extrabold text-amber-600">
                    {stats.unpaidInstallments}
                  </p>
                  <p className="text-[10px] text-slate-500">قسط باقي</p>
                </div>
                <div className="p-3 bg-rose-50/50 rounded-xl text-center">
                  <p className="text-lg font-extrabold text-rose-600">
                    {stats.totalOverdue}
                  </p>
                  <p className="text-[10px] text-slate-500">قسط متأخر</p>
                </div>
                <div className="p-3 bg-blue-50/50 rounded-xl text-center">
                  <p className="text-lg font-extrabold text-blue-600">
                    {stats.avgDelayDays}
                  </p>
                  <p className="text-[10px] text-slate-500">متوسط أيام التأخير</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ملخص العقود */}
          <Card className="border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-500" />
                ملخص العقود
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-100">
                <p className="text-xs text-slate-500 mb-1">إجمالي قيمة العقود</p>
                <p className="text-2xl font-extrabold text-violet-700">
                  {stats.totalValue.toLocaleString()}{" "}
                  <span className="text-sm font-medium">ج.م</span>
                </p>
              </div>

              <div className="space-y-3">
                {customerContracts.map((contract) => {
                  const contractInsts = allInstallments.filter(
                    (i) => i.contract_id === contract.id
                  );
                  const paid = contractInsts.filter((i) => i.is_paid).length;
                  const total = contractInsts.length;
                  const progress =
                    total > 0 ? Math.round((paid / total) * 100) : 0;

                  return (
                    <div
                      key={contract.id}
                      className="p-3 bg-slate-50/50 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => navigate("/contracts")}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold",
                              contract.status === "active"
                                ? "bg-gradient-to-br from-emerald-500 to-teal-500"
                                : contract.status === "completed"
                                ? "bg-gradient-to-br from-blue-500 to-cyan-500"
                                : "bg-gradient-to-br from-rose-500 to-pink-500"
                            )}
                          >
                            #{contract.id}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700">
                              {contract.product_type}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {contract.total_price.toLocaleString()} ج.م
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={cn(
                            "rounded-lg text-[10px] border-0",
                            contract.status === "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : contract.status === "completed"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-rose-100 text-rose-700"
                          )}
                        >
                          {contract.status === "active"
                            ? "نشط"
                            : contract.status === "completed"
                            ? "مكتمل"
                            : "متأخر"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">
                          {paid}/{total}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {customerContracts.length === 0 && (
                  <div className="text-center py-6">
                    <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">لا توجد عقود</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* سجل الدفع الكامل */}
        <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100/80">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-violet-500" />
                سجل الدفع الكامل
              </CardTitle>
              <Badge variant="outline" className="rounded-lg">
                {customerInstallments.length} قسط
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {customerInstallments.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-lg font-bold text-slate-600">لا توجد أقساط</p>
                <p className="text-sm text-slate-400">
                  لم يتم تسجيل أي أقساط لهذا العميل بعد
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100/80">
                {customerInstallments
                  .sort((a, b) => {
                    // ترتيب حسب التاريخ
                    const dateA = new Date(a.year, a.month - 1, a.day);
                    const dateB = new Date(b.year, b.month - 1, b.day);
                    return dateB.getTime() - dateA.getTime();
                  })
                  .map((inst) => {
                    const contract = customerContracts.find(
                      (c) => c.id === inst.contract_id
                    );
                    const dueDate = `${inst.day}/${inst.month}/${inst.year}`;
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const due = new Date(
                      inst.year,
                      inst.month - 1,
                      inst.day
                    );
                    const isOverdue =
                      !inst.is_paid && due < today;
                    const daysOverdue = isOverdue
                      ? Math.floor(
                          (today.getTime() - due.getTime()) / 86400000
                        )
                      : 0;

                    return (
                      <div
                        key={inst.id}
                        className={cn(
                          "flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors",
                          isOverdue && "bg-rose-50/30 border-r-4 border-r-rose-400"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                              inst.is_paid
                                ? "bg-gradient-to-br from-emerald-500 to-teal-500"
                                : isOverdue
                                ? "bg-gradient-to-br from-rose-500 to-pink-500"
                                : "bg-gradient-to-br from-amber-500 to-orange-500"
                            )}
                          >
                            {inst.is_paid ? (
                              <CheckCircle className="h-6 w-6 text-white" />
                            ) : isOverdue ? (
                              <AlertTriangle className="h-6 w-6 text-white" />
                            ) : (
                              <Clock className="h-6 w-6 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm text-slate-800">
                                القسط #{inst.number}
                              </p>
                              <Badge
                                className={cn(
                                  "rounded-lg text-[10px] border-0",
                                  inst.is_paid
                                    ? "bg-emerald-100 text-emerald-700"
                                    : isOverdue
                                    ? "bg-rose-100 text-rose-700"
                                    : "bg-amber-100 text-amber-700"
                                )}
                              >
                                {inst.is_paid
                                  ? "مدفوع"
                                  : isOverdue
                                  ? `متأخر ${daysOverdue} يوم`
                                  : "باقي"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                الاستحقاق: {dueDate}
                              </span>
                              {contract && (
                                <span className="bg-slate-100 px-2 py-0.5 rounded-md">
                                  {contract.product_type}
                                </span>
                              )}
                              {inst.paid_date && (
                                <span className="text-emerald-600">
                                  سُدد: {inst.paid_date}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <p
                          className={cn(
                            "font-extrabold text-lg",
                            inst.is_paid ? "text-emerald-600" : isOverdue ? "text-rose-600" : "text-slate-800"
                          )}
                        >
                          {inst.amount.toLocaleString()}{" "}
                          <span className="text-xs font-medium text-slate-400">
                            ج.م
                          </span>
                        </p>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CustomerProfile;
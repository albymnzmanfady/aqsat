"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { initialContracts, initialInstallments } from "@/data/mockData";
import { Installment, Contract } from "@/types";
import {
  TrendingUp,
  Users,
  FileText,
  CreditCard,
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Bell,
  MessageSquareText,
  Wallet,
  Sparkles,
  Send,
  Loader2,
} from "lucide-react";
import { sendWhatsAppMessage, getWhatsAppConfig, MESSAGE_TEMPLATES } from "@/components/WhatsAppService";
import { showSuccess, showError } from "@/utils/toast";

const Index = () => {
  const [contracts] = useState<Contract[]>(initialContracts);
  const [installments] = useState<Installment[]>(initialInstallments);
  const [sendingNotifications, setSendingNotifications] = useState(false);

  const totalContracts = contracts.length;
  const activeContracts = contracts.filter((c) => c.status === "active").length;
  const totalCustomers = [...new Set(contracts.map((c) => c.customerId))].length;

  const paidInstallments = installments.filter((i) => i.isPaid);
  const pendingInstallments = installments.filter((i) => !i.isPaid);
  const paidAmount = paidInstallments.reduce((sum, i) => sum + i.amount, 0);
  const totalAmount = installments.reduce((sum, i) => sum + i.amount, 0);

  // الأقساط القادمة (أقرب 5 أقساط غير مدفوعة)
  const upcomingInstallments = [...pendingInstallments]
    .sort((a, b) => {
      const dateA = new Date(a.year, a.month - 1, a.day);
      const dateB = new Date(b.year, b.month - 1, b.day);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5);

  // الأقساط المتأخرة
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueInstallments = pendingInstallments.filter((i) => {
    const dueDate = new Date(i.year, i.month - 1, i.day);
    return dueDate < today;
  });

  const handleSendAllReminders = async () => {
    const config = getWhatsAppConfig();
    if (!config.endpoint) {
      showError("يرجى إعداد واتساب أولاً من صفحة الإعدادات");
      return;
    }

    setSendingNotifications(true);
    let sent = 0;

    for (const installment of upcomingInstallments) {
      const contract = contracts.find((c) => c.id === installment.contractId);
      if (!contract) continue;

      const dueDate = `${installment.day}/${installment.month}/${installment.year}`;
      const dueDt = new Date(installment.year, installment.month - 1, installment.day);
      const daysOverdue = Math.floor((today.getTime() - dueDt.getTime()) / (1000 * 60 * 60 * 24));

      let message: string;
      if (daysOverdue > 0) {
        message = MESSAGE_TEMPLATES.installmentOverdue(
          contract.customerName, installment.amount, daysOverdue, installment.number
        );
      } else {
        message = MESSAGE_TEMPLATES.installmentDue(
          contract.customerName, installment.amount, dueDate, installment.number
        );
      }

      const result = await sendWhatsAppMessage(contract.customerPhone, message, config);
      if (result.success) sent++;

      // تأخير بسيط بين الرسائل
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    showSuccess(`✅ تم إرسال ${sent} تذكير من ${upcomingInstallments.length}`);
    setSendingNotifications(false);
  };

  const statCards = [
    {
      title: "العملاء",
      value: totalCustomers,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      link: "/customers",
    },
    {
      title: "العقود النشطة",
      value: activeContracts,
      icon: FileText,
      color: "from-emerald-500 to-teal-500",
      link: "/contracts",
    },
    {
      title: "الأقساط المدفوعة",
      value: paidInstallments.length,
      icon: CheckCircle2,
      color: "from-violet-500 to-purple-500",
      link: "/installments",
    },
    {
      title: "الأقساط المتأخرة",
      value: overdueInstallments.length,
      icon: AlertTriangle,
      color: "from-rose-500 to-pink-500",
      link: "/installments",
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome + Quick Actions */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Welcome Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 text-white p-6 lg:p-8 flex-1">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold">مرحباً بك 👋</h1>
                  <p className="text-white/80 text-sm">نظام إدارة الأقساط</p>
                </div>
              </div>
              <p className="text-white/90 text-sm lg:text-base leading-relaxed mb-6">
                لديك <strong>{pendingInstallments.length}</strong> قسط قيد الانتظار بقيمة{" "}
                <strong>{(totalAmount - paidAmount).toLocaleString()} ج.م</strong>
              </p>

              <div className="flex flex-wrap gap-3">
                <Link to="/installments">
                  <Button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl h-11 gap-2 border border-white/20">
                    <CreditCard className="h-4 w-4" />
                    تسجيل قسط
                  </Button>
                </Link>
                <Link to="/contracts">
                  <Button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl h-11 gap-2 border border-white/20">
                    <FileText className="h-4 w-4" />
                    عقد جديد
                  </Button>
                </Link>
                <Button
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl h-11 gap-2 border border-white/20"
                  onClick={handleSendAllReminders}
                  disabled={sendingNotifications || upcomingInstallments.length === 0}
                >
                  {sendingNotifications ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  تذكير بالرسائل
                </Button>
              </div>
            </div>
          </div>

          {/* Collection Rate Ring */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 lg:p-8 flex flex-col items-center justify-center min-w-[200px] border border-white/20">
            <div className="relative w-28 h-28 mb-3">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="52"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - (totalAmount > 0 ? paidAmount / totalAmount : 0))}`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-800">
                    {totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0}%
                  </p>
                  <p className="text-xs text-slate-500">تحصيل</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                <span>{paidInstallments.length} مدفوع</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span>{pendingInstallments.length} باقي</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <Link key={index} to={stat.link}>
              <Card className="border-0 bg-white/70 backdrop-blur-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                    </div>
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-md group-hover:scale-110 transition-transform duration-300",
                      stat.color
                    )}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* الأقساط القادمة */}
          <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800">الأقساط القادمة</h3>
                </div>
                <Link to="/installments">
                  <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700 rounded-xl gap-1">
                    عرض الكل
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {upcomingInstallments.map((inst) => {
                  const contract = contracts.find((c) => c.id === inst.contractId);
                  const dueDate = new Date(inst.year, inst.month - 1, inst.day);
                  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  const isOverdue = daysUntilDue < 0;

                  return (
                    <div
                      key={inst.id}
                      className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl hover:bg-slate-100/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm",
                          isOverdue ? "bg-gradient-to-br from-rose-500 to-pink-500" : "bg-gradient-to-br from-amber-500 to-orange-500"
                        )}>
                          {inst.number}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{contract?.customerName}</p>
                          <p className="text-xs text-slate-500">{inst.amount.toLocaleString()} ج.م • {inst.day}/{inst.month}</p>
                        </div>
                      </div>
                      <Badge className={cn(
                        "rounded-lg border-0 text-xs",
                        isOverdue
                          ? "bg-rose-100 text-rose-700"
                          : daysUntilDue <= 3
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      )}>
                        {isOverdue ? `متأخر ${Math.abs(daysUntilDue)} ي` : `باقي ${daysUntilDue} ي`}
                      </Badge>
                    </div>
                  );
                })}

                {upcomingInstallments.length === 0 && (
                  <p className="text-center text-slate-500 py-8 text-sm">لا توجد أقساط قادمة</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* المدفوعات الأخيرة */}
          <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800">آخر المدفوعات</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Wallet className="h-4 w-4" />
                  <span>{paidAmount.toLocaleString()} ج.م</span>
                </div>
              </div>

              <div className="space-y-3">
                {[...paidInstallments]
                  .sort((a, b) => new Date(b.paidDate || "").getTime() - new Date(a.paidDate || "").getTime())
                  .slice(0, 5)
                  .map((inst) => {
                    const contract = contracts.find((c) => c.id === inst.contractId);
                    return (
                      <div
                        key={inst.id}
                        className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl hover:bg-slate-100/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-700">{contract?.customerName}</p>
                            <p className="text-xs text-slate-500">القسط {inst.number}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-emerald-600">{inst.amount.toLocaleString()} ج.م</p>
                          <p className="text-xs text-slate-400">{inst.paidDate}</p>
                        </div>
                      </div>
                    );
                  })}

                {paidInstallments.length === 0 && (
                  <p className="text-center text-slate-500 py-8 text-sm">لا توجد مدفوعات بعد</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* إشعارات واتساب السريعة */}
        <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <MessageSquareText className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-bold text-slate-800">إشعارات واتساب</h3>
              </div>
              <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 rounded-lg">
                {overdueInstallments.length} متأخر • {upcomingInstallments.length} قادم
              </Badge>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Link to="/settings">
                <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-100 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquareText className="h-5 w-5 text-violet-600" />
                    <span className="font-semibold text-sm text-violet-700">إعدادات واتساب</span>
                  </div>
                  <p className="text-xs text-slate-500">توصيل واتساب وإرسال الإشعارات</p>
                </div>
              </Link>

              <Button
                variant="ghost"
                className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 hover:shadow-md transition-shadow h-auto flex flex-col items-start gap-2"
                onClick={() => {
                  const config = getWhatsAppConfig();
                  if (!config.endpoint) {
                    showError("يرجى إعداد واتساب أولاً");
                    return;
                  }
                  // إرسال تذكير للأقساط المتأخرة
                  overdueInstallments.slice(0, 1).forEach(async (inst) => {
                    const contract = contracts.find((c) => c.id === inst.contractId);
                    if (contract) {
                      const dueDate = `${inst.day}/${inst.month}/${inst.year}`;
                      const daysOverdue = Math.floor((today.getTime() - new Date(inst.year, inst.month - 1, inst.day).getTime()) / (1000 * 60 * 60 * 24));
                      const result = await sendWhatsAppMessage(
                        contract.customerPhone,
                        MESSAGE_TEMPLATES.installmentOverdue(contract.customerName, inst.amount, daysOverdue, inst.number),
                        config
                      );
                      if (result.success) showSuccess(`✅ تم إرسال تنبيه لـ ${contract.customerName}`);
                      else showError(result.message);
                    }
                  });
                }}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <span className="font-semibold text-sm text-amber-700">تنبيه المتأخرات</span>
                </div>
                <p className="text-xs text-slate-500">إرسال تنبيه للعملاء المتأخرين</p>
              </Button>

              <Link to="/contracts">
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-emerald-600" />
                    <span className="font-semibold text-sm text-emerald-700">إشعار عقد جديد</span>
                  </div>
                  <p className="text-xs text-slate-500">إرسال تفاصيل العقد للعميل</p>
                </div>
              </Link>

              <Link to="/installments">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-sm text-blue-700">تأكيد السداد</span>
                  </div>
                  <p className="text-xs text-slate-500">إرسال إيصال السداد للعميل</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;

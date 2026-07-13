"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import AnimatedCounter from "@/components/AnimatedCounter";
import { api, ApiContract, ApiInstallment } from "@/lib/api";
import { showSuccess, showError } from "@/utils/toast";
import {
  Users, FileText, CreditCard, ArrowLeft, Calendar, CheckCircle2, AlertTriangle,
  Wallet, Sparkles, Send, Loader2, MessageSquareText,
} from "lucide-react";
import { sendWhatsAppMessage, getWhatsAppConfig, MESSAGE_TEMPLATES } from "@/components/WhatsAppService";

const Index = () => {
  const [contracts, setContracts] = useState<ApiContract[]>([]);
  const [installments, setInstallments] = useState<ApiInstallment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingNotifications, setSendingNotifications] = useState(false);

  useEffect(() => {
    Promise.all([api.contracts.list(), api.installments.list()])
      .then(([c, i]) => { setContracts(c); setInstallments(i); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalContracts = contracts.length;
  const activeContracts = contracts.filter((c) => c.status === "active").length;
  const totalCustomers = [...new Set(contracts.map((c) => c.customer_id))].length;

  const paidInstallments = installments.filter((i) => i.is_paid);
  const pendingInstallments = installments.filter((i) => !i.is_paid);
  const paidAmount = paidInstallments.reduce((sum, i) => sum + i.amount, 0);
  const totalAmount = installments.reduce((sum, i) => sum + i.amount, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingInstallments = [...pendingInstallments]
    .sort((a, b) => new Date(a.year, a.month - 1, a.day).getTime() - new Date(b.year, b.month - 1, b.day).getTime())
    .slice(0, 5);

  const overdueInstallments = pendingInstallments.filter((i) => {
    const dueDate = new Date(i.year, i.month - 1, i.day);
    return dueDate < today;
  });

  const handleSendAllReminders = async () => {
    const config = getWhatsAppConfig();
    if (!config.endpoint) { showError("يرجى إعداد واتساب أولاً"); return; }
    setSendingNotifications(true);
    let sent = 0;
    for (const installment of upcomingInstallments) {
      const contract = contracts.find((c) => c.id === installment.contract_id);
      if (!contract) continue;
      const dueDate = `${installment.day}/${installment.month}/${installment.year}`;
      const dueDt = new Date(installment.year, installment.month - 1, installment.day);
      const daysOverdue = Math.floor((today.getTime() - dueDt.getTime()) / (1000 * 60 * 60 * 24));
      const message = daysOverdue > 0
        ? MESSAGE_TEMPLATES.installmentOverdue(contract.customer_name, installment.amount, daysOverdue, installment.number)
        : MESSAGE_TEMPLATES.installmentDue(contract.customer_name, installment.amount, dueDate, installment.number);
      const result = await sendWhatsAppMessage(contract.customer_phone, message, config);
      if (result.success) sent++;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    showSuccess(`✅ تم إرسال ${sent} تذكير من ${upcomingInstallments.length}`);
    setSendingNotifications(false);
  };

  const statCards = [
    { title: "العملاء", value: totalCustomers, icon: Users, color: "from-blue-500 to-cyan-500", link: "/customers" },
    { title: "العقود النشطة", value: activeContracts, icon: FileText, color: "from-emerald-500 to-teal-500", link: "/contracts" },
    { title: "الأقساط المدفوعة", value: paidInstallments.length, icon: CheckCircle2, color: "from-violet-500 to-purple-500", link: "/installments" },
    { title: "الأقساط المتأخرة", value: overdueInstallments.length, icon: AlertTriangle, color: "from-rose-500 to-pink-500", link: "/installments" },
  ];

  if (loading) return <Layout><div className="flex items-center justify-center py-32"><Loader2 className="h-8 w-8 text-violet-500 animate-spin" /></div></Layout>;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Card */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 text-white p-6 lg:p-8 flex-1 hover-lift">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"><Sparkles className="h-6 w-6" /></div>
                <div><h1 className="text-2xl lg:text-3xl font-bold">مرحباً بك 👋</h1><p className="text-white/80 text-sm">نظام إدارة الأقساط</p></div>
              </div>
              <p className="text-white/90 text-sm lg:text-base leading-relaxed mb-6">لديك <strong>{pendingInstallments.length}</strong> قسط قيد الانتظار بقيمة <strong>{(totalAmount - paidAmount).toLocaleString()} ج.م</strong></p>
              <div className="flex flex-wrap gap-3">
                <Link to="/installments"><Button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl h-11 gap-2 border border-white/20 active:scale-[0.97]"><CreditCard className="h-4 w-4" />تسجيل قسط</Button></Link>
                <Link to="/contracts"><Button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl h-11 gap-2 border border-white/20 active:scale-[0.97]"><FileText className="h-4 w-4" />عقد جديد</Button></Link>
                <Button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl h-11 gap-2 border border-white/20 active:scale-[0.97]" onClick={handleSendAllReminders} disabled={sendingNotifications || upcomingInstallments.length === 0}>
                  {sendingNotifications ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}تذكير بالرسائل
                </Button>
              </div>
            </div>
          </div>

          {/* Collection Rate Ring */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 lg:p-8 flex flex-col items-center justify-center min-w-[200px] border border-white/20 hover-lift">
            <div className="relative w-28 h-28 mb-3">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <circle cx="60" cy="60" r="52" fill="none" stroke="url(#gradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 52}`} strokeDashoffset={`${2 * Math.PI * 52 * (1 - (totalAmount > 0 ? paidAmount / totalAmount : 0))}`} className="transition-all duration-1000" />
                <defs><linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#6366F1" /></linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center"><div className="text-center"><p className="text-2xl font-bold text-slate-800">{totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0}%</p><p className="text-xs text-slate-500">تحصيل</p></div></div>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-violet-500" /><span><AnimatedCounter value={paidInstallments.length} duration={800} /> مدفوع</span></div>
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-slate-300" /><span><AnimatedCounter value={pendingInstallments.length} duration={800} /> باقي</span></div>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <Link key={index} to={stat.link}>
              <Card className="border-0 bg-white/70 backdrop-blur-sm hover-lift transition-all duration-300 overflow-hidden group" style={{ animationDelay: `${index * 0.08}s` }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm text-slate-500 mb-1">{stat.title}</p><p className="text-2xl font-bold text-slate-800"><AnimatedCounter value={stat.value} duration={800} /></p></div>
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300", stat.color)}><stat.icon className="h-6 w-6 text-white" /></div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
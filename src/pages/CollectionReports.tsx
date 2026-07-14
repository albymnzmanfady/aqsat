"use client";

import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import AnimatedCounter from "@/components/AnimatedCounter";
import PrintDialog from "@/components/PrintDialog";
import { useAppSettings } from "@/hooks/useAppSettings";
import { cn } from "@/lib/utils";
import { api, ApiInstallment, ApiContract } from "@/lib/api";
import { showError } from "@/utils/toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  BarChart3, PieChart as PieChartIcon, TrendingUp, Wallet, Clock,
  AlertTriangle, Calendar, CheckCircle, DollarSign, Loader2, FileText, Printer,
} from "lucide-react";

const MONTHS = ["يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const AGING_COLORS = ["#F59E0B", "#F97316", "#EF4444", "#B91C1C"];

const CollectionReports = () => {
  const { settings } = useAppSettings();
  const [installments, setInstallments] = useState<ApiInstallment[]>([]);
  const [contracts, setContracts] = useState<ApiContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [printOpen, setPrintOpen] = useState(false);
  const [printHtml, setPrintHtml] = useState("");
  const [printTitle, setPrintTitle] = useState("");

  useEffect(() => {
    Promise.all([api.installments.list(), api.contracts.list()])
      .then(([inst, cont]) => { setInstallments(inst); setContracts(cont); })
      .catch((e) => showError("خطأ: " + e.message))
      .finally(() => setLoading(false));
  }, []);

  const currentYear = new Date().getFullYear();
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

  // KPI
  const totalDue = useMemo(() => installments.reduce((s, i) => s + i.amount, 0), [installments]);
  const totalCollected = useMemo(() => installments.filter(i => i.is_paid).reduce((s, i) => s + i.amount, 0), [installments]);
  const remaining = totalDue - totalCollected;
  const collectionRate = totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0;

  // Monthly data
  const monthlyData = useMemo(() => {
    return MONTHS.map((name, idx) => {
      const monthDue = installments
        .filter(i => i.month === idx + 1 && i.year === currentYear)
        .reduce((s, i) => s + i.amount, 0);
      const monthCollected = installments
        .filter(i => i.is_paid && i.paid_date && new Date(i.paid_date).getMonth() === idx && new Date(i.paid_date).getFullYear() === currentYear)
        .reduce((s, i) => s + i.amount, 0);
      return { name, المطلوب: monthDue, المحصل: monthCollected };
    });
  }, [installments, currentYear]);

  // Aging analysis
  const agingData = useMemo(() => {
    const overdue = installments.filter(i => !i.is_paid && new Date(i.year, i.month - 1, i.day) < today);
    const aging = [
      { label: "1-7 أيام", amount: 0, count: 0 },
      { label: "8-15 يوم", amount: 0, count: 0 },
      { label: "16-30 يوم", amount: 0, count: 0 },
      { label: "أكثر من 30 يوم", amount: 0, count: 0 },
    ];
    overdue.forEach(i => {
      const dueDt = new Date(i.year, i.month - 1, i.day);
      const days = Math.floor((today.getTime() - dueDt.getTime()) / 86400000);
      if (days <= 7) { aging[0].amount += i.amount; aging[0].count++; }
      else if (days <= 15) { aging[1].amount += i.amount; aging[1].count++; }
      else if (days <= 30) { aging[2].amount += i.amount; aging[2].count++; }
      else { aging[3].amount += i.amount; aging[3].count++; }
    });
    return aging;
  }, [installments, today]);

  // Contracts detail
  const contractsData = useMemo(() => {
    return contracts.map(c => {
      const cInsts = installments.filter(i => i.contract_id === c.id);
      const paid = cInsts.filter(i => i.is_paid).length;
      const total = cInsts.length;
      const totalAmount = cInsts.reduce((s, i) => s + i.amount, 0);
      const paidAmount = cInsts.filter(i => i.is_paid).reduce((s, i) => s + i.amount, 0);
      const remainingAmount = totalAmount - paidAmount;
      return {
        id: c.id,
        customerName: c.customer_name,
        productType: c.product_type,
        totalCount: total,
        paidCount: paid,
        progress: total > 0 ? Math.round((paid / total) * 100) : 0,
        totalAmount,
        paidAmount,
        remainingAmount,
        status: c.status,
      };
    });
  }, [contracts, installments]);

  // Generate print HTML
  const generateReportHtml = () => {
    const rows = contractsData.map(c => `
      <tr>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;text-align:center;">${c.customerName}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;text-align:center;">${c.productType}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;text-align:center;">${c.paidCount}/${c.totalCount}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;text-align:center;">${c.progress}%</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;text-align:center;">${c.totalAmount.toLocaleString()} ج.م</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;text-align:center;">${c.paidAmount.toLocaleString()} ج.م</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;text-align:center;">${c.remainingAmount.toLocaleString()} ج.م</td>
      </tr>
    `).join("");

    return `
      <div style="font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;text-align:right;color:#1e293b;max-width:1000px;margin:0 auto;">
        <div style="text-align:center;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #6366f1;">
          <h1 style="font-size:24px;font-weight:700;color:#1e293b;margin:0;">${settings.companyName || settings.appName}</h1>
          <h2 style="font-size:18px;font-weight:600;color:#4f46e5;margin:6px 0;">تقرير تحصيل الأقساط الشامل</h2>
          <p style="font-size:12px;color:#94a3b8;">تاريخ التقرير: ${new Date().toLocaleDateString("ar-EG")}</p>
        </div>
        <div style="margin-bottom:24px;">
          <h3 style="font-size:14px;font-weight:600;color:#4f46e5;margin-bottom:10px;">ملخص التحصيل الكلي</h3>
          <table style="width:100%;border-collapse:collapse;font-size:12px;border:1px solid #e2e8f0;">
            <tr style="background:#f8fafc;"><td style="padding:8px 12px;">إجمالي المستحقات</td><td style="padding:8px 12px;font-weight:bold;">${totalDue.toLocaleString()} ج.م</td></tr>
            <tr><td style="padding:8px 12px;">المحصل فعلياً</td><td style="padding:8px 12px;font-weight:bold;color:#10b981;">${totalCollected.toLocaleString()} ج.م</td></tr>
            <tr style="background:#f8fafc;"><td style="padding:8px 12px;">المتبقي للتحصيل</td><td style="padding:8px 12px;font-weight:bold;color:#f59e0b;">${remaining.toLocaleString()} ج.م</td></tr>
            <tr><td style="padding:8px 12px;">نسبة التحصيل</td><td style="padding:8px 12px;font-weight:bold;color:#6366f1;">${collectionRate}%</td></tr>
          </table>
        </div>
        <div style="margin-bottom:24px;">
          <h3 style="font-size:14px;font-weight:600;color:#4f46e5;margin-bottom:10px;">جدول تفصيلي للعقود</h3>
          <table style="width:100%;border-collapse:collapse;font-size:11px;border:1px solid #e2e8f0;">
            <thead><tr style="background:#4f46e5;color:white;">
              <th style="padding:8px 10px;">العميل</th><th style="padding:8px 10px;">المنتج</th><th style="padding:8px 10px;">الأقساط</th><th style="padding:8px 10px;">%</th><th style="padding:8px 10px;">الإجمالي</th><th style="padding:8px 10px;">المسدد</th><th style="padding:8px 10px;">المتبقي</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div style="text-align:center;margin-top:32px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:10px;color:#94a3b8;">
          ${settings.companyName ? settings.companyName + " | " : ""}نظام ${settings.appName} - تقرير آلي
        </div>
      </div>
    `;
  };

  const handlePrint = () => {
    setPrintHtml(generateReportHtml());
    setPrintTitle(`تقرير تحصيل الأقساط - ${new Date().toLocaleDateString("ar-EG")}`);
    setPrintOpen(true);
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
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
          <BarChart3 className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">تقارير التحصيل والأقساط</h1>
          <p className="text-slate-500 mt-1">تحليل أداء التحصيل ومتابعة المتأخرات</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 bg-white/70 backdrop-blur-sm"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md flex items-center justify-center"><Wallet className="h-6 w-6 text-white" /></div><div><p className="text-sm text-slate-500">إجمالي المستحقات</p><p className="font-bold text-xl text-slate-800"><AnimatedCounter value={totalDue} duration={800} formatter={(v) => v.toLocaleString()} /> ج.م</p></div></div></CardContent></Card>
        <Card className="border-0 bg-white/70 backdrop-blur-sm"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md flex items-center justify-center"><CheckCircle className="h-6 w-6 text-white" /></div><div><p className="text-sm text-slate-500">المحصل فعلياً</p><p className="font-bold text-xl text-emerald-600"><AnimatedCounter value={totalCollected} duration={800} formatter={(v) => v.toLocaleString()} /> ج.م</p></div></div></CardContent></Card>
        <Card className="border-0 bg-white/70 backdrop-blur-sm"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-md flex items-center justify-center"><Clock className="h-6 w-6 text-white" /></div><div><p className="text-sm text-slate-500">المتبقي للتحصيل</p><p className="font-bold text-xl text-amber-600"><AnimatedCounter value={remaining} duration={800} formatter={(v) => v.toLocaleString()} /> ج.م</p></div></div></CardContent></Card>
        <Card className="border-0 bg-white/70 backdrop-blur-sm"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md flex items-center justify-center"><TrendingUp className="h-6 w-6 text-white" /></div><div><p className="text-sm text-slate-500">نسبة التحصيل</p><p className="font-bold text-xl text-blue-600">{collectionRate}%</p></div></div></CardContent></Card>
      </div>

      {/* Progress Bar */}
      <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden mb-8 p-5">
        <div className="flex items-center justify-between text-sm font-semibold mb-2">
          <span className="text-slate-600">المحصل</span>
          <span className="text-emerald-600">{totalCollected.toLocaleString()} ج.م</span>
        </div>
        <Progress value={collectionRate} className="h-3 rounded-full bg-slate-100 [&>div]:bg-gradient-to-r [&>div]:from-emerald-400 [&>div]:to-teal-500" />
        <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
          <span>0%</span>
          <span className="font-bold text-violet-600">{collectionRate}%</span>
          <span>100%</span>
        </div>
      </Card>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart */}
        <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"><BarChart3 className="h-4 w-4 text-white" /></div>
              <h3 className="font-bold text-slate-800">المقارنة الشهرية {currentYear}</h3>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barCategoryGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                  <YAxis fontSize={11} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="المطلوب" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="المستحق" />
                  <Bar dataKey="المحصل" fill="#10B981" radius={[4, 4, 0, 0]} name="المحصل" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Aging Pie Chart */}
        <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center"><PieChartIcon className="h-4 w-4 text-white" /></div>
              <h3 className="font-bold text-slate-800">تحليل المتأخرات (Aging)</h3>
            </div>
            <div className="h-72 flex items-center justify-center">
              {agingData.some(a => a.amount > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={agingData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="amount" nameKey="label">
                      {agingData.map((_, idx) => <Cell key={idx} fill={AGING_COLORS[idx]} />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value.toLocaleString()} ج.م`} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                    <Legend layout="vertical" align="left" verticalAlign="middle" iconType="circle" iconSize={10} formatter={(value: string) => <span className="text-sm text-slate-600">{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-500">لا توجد متأخرات - مبروك! 🎉</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aging Table */}
      <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden mb-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center"><AlertTriangle className="h-4 w-4 text-white" /></div>
            <h3 className="font-bold text-slate-800">تفصيل المتأخرات حسب فترة التأخير</h3>
          </div>
          <div className="space-y-3">
            {agingData.map((item, idx) => {
              const percent = totalDue > 0 ? Math.round((item.amount / totalDue) * 100) : 0;
              return (
                <div key={idx} className="p-3 bg-slate-50/50 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: AGING_COLORS[idx] }} /><span className="font-semibold text-slate-700 text-sm">{item.label}</span></div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">{item.count} قسط</span>
                      <span className="text-sm font-bold text-slate-800">{item.amount.toLocaleString()} ج.م</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: AGING_COLORS[idx] }} />
                  </div>
                </div>
              );
            })}
            {agingData.every(a => a.amount === 0) && (
              <p className="text-center text-slate-500 py-4 text-sm">لا توجد متأخرات</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Contracts Table */}
      <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center"><FileText className="h-4 w-4 text-white" /></div>
              <h3 className="font-bold text-slate-800">تفاصيل العقود والأقساط</h3>
            </div>
            <Button onClick={handlePrint} className="rounded-xl h-10 gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-md">
              <Printer className="h-4 w-4" />
              طباعة التقرير
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-right py-3 px-3 text-slate-600 font-semibold">العميل</th>
                  <th className="text-right py-3 px-3 text-slate-600 font-semibold">المنتج</th>
                  <th className="text-center py-3 px-3 text-slate-600 font-semibold">الأقساط</th>
                  <th className="text-center py-3 px-3 text-slate-600 font-semibold">%</th>
                  <th className="text-center py-3 px-3 text-slate-600 font-semibold">الإجمالي</th>
                  <th className="text-center py-3 px-3 text-slate-600 font-semibold">المسدد</th>
                  <th className="text-center py-3 px-3 text-slate-600 font-semibold">المتبقي</th>
                </tr>
              </thead>
              <tbody>
                {contractsData.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100/80 hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-medium text-slate-700">{c.customerName}</td>
                    <td className="py-3 px-3 text-slate-500">{c.productType}</td>
                    <td className="py-3 px-3 text-center">{c.paidCount}/{c.totalCount}</td>
                    <td className="py-3 px-3 text-center">
                      <Badge className={cn("rounded-lg border-0", c.progress >= 100 ? "bg-emerald-100 text-emerald-700" : c.progress >= 50 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700")}>{c.progress}%</Badge>
                    </td>
                    <td className="py-3 px-3 text-center font-semibold">{c.totalAmount.toLocaleString()} ج.م</td>
                    <td className="py-3 px-3 text-center text-emerald-600 font-semibold">{c.paidAmount.toLocaleString()} ج.م</td>
                    <td className="py-3 px-3 text-center text-amber-600 font-semibold">{c.remainingAmount.toLocaleString()} ج.م</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {contractsData.length === 0 && (
            <div className="text-center py-12 text-slate-500">لا توجد عقود</div>
          )}
        </CardContent>
      </Card>

      <PrintDialog open={printOpen} onOpenChange={setPrintOpen} htmlContent={printHtml} title={printTitle} filename={`collection-report-${new Date().toISOString().split("T")[0]}.pdf`} />
    </Layout>
  );
};

export default CollectionReports;
"use client";

import { useState, useMemo, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { api, ApiExpense, ApiExpenseCategory, ApiInstallment } from "@/lib/api";
import { showError } from "@/utils/toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { BarChart3, PieChart as PieChartIcon, TrendingDown, TrendingUp, Wallet, Calendar, Coins, Receipt } from "lucide-react";

const MONTHS = ["يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const COLORS = ["#F43F5E", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#06B6D4", "#64748B"];

const ExpenseReports = () => {
  const [expenses, setExpenses] = useState<ApiExpense[]>([]);
  const [categories, setCategories] = useState<ApiExpenseCategory[]>([]);
  const [installments, setInstallments] = useState<ApiInstallment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.expenses.list(), api.expenseCategories.list(), api.installments.list()])
      .then(([e, c, i]) => { setExpenses(e); setCategories(c); setInstallments(i); })
      .catch((e) => showError("خطأ: " + e.message))
      .finally(() => setLoading(false));
  }, []);

  const currentYear = new Date().getFullYear();

  const monthlyData = useMemo(() => {
    const data: { name: string; مصروفات: number; إيرادات: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const monthExpenses = expenses.filter((e) => { const d = new Date(e.date); return d.getMonth() === i && d.getFullYear() === currentYear; }).reduce((s, e) => s + e.amount, 0);
      const monthRevenue = installments.filter((inst) => { if (!inst.is_paid || !inst.paid_date) return false; const d = new Date(inst.paid_date); return d.getMonth() === i && d.getFullYear() === currentYear; }).reduce((s, inst) => s + inst.amount, 0);
      data.push({ name: MONTHS[i], مصروفات: monthExpenses, إيرادات: monthRevenue });
    }
    return data;
  }, [expenses, installments, currentYear]);

  const categoryData = useMemo(() => {
    return categories.map((cat) => {
      const total = expenses.filter((e) => e.category_id === cat.id).reduce((s, e) => s + e.amount, 0);
      return { name: cat.name, value: total, color: cat.color };
    }).filter((item) => item.value > 0);
  }, [expenses, categories]);

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalRevenue = installments.filter((i) => i.is_paid).reduce((s, i) => s + i.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
  const yearExpenses = expenses.filter((e) => new Date(e.date).getFullYear() === currentYear);
  const yearRevenue = installments.filter((i) => i.is_paid && i.paid_date && new Date(i.paid_date).getFullYear() === currentYear);
  const yearTotalExpense = yearExpenses.reduce((s, e) => s + e.amount, 0);
  const yearTotalRevenue = yearRevenue.reduce((s, i) => s + i.amount, 0);
  const yearNet = yearTotalRevenue - yearTotalExpense;

  if (loading) return <Layout><div className="flex items-center justify-center py-16"><div className="h-8 w-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" /></div></Layout>;

  return (
    <Layout>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30"><BarChart3 className="h-7 w-7 text-white" /></div>
        <div><h1 className="text-2xl lg:text-3xl font-bold text-slate-800">تقارير المصروفات</h1><p className="text-slate-500 mt-1">تحليل المصروفات ومقارنتها بالإيرادات</p></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 bg-white/70 backdrop-blur-sm"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-md flex items-center justify-center"><TrendingDown className="h-6 w-6 text-white" /></div><div><p className="text-sm text-slate-500">إجمالي المصروفات</p><p className="font-bold text-xl text-rose-600">{totalExpenses.toLocaleString()} ج.م</p></div></div></CardContent></Card>
        <Card className="border-0 bg-white/70 backdrop-blur-sm"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md flex items-center justify-center"><TrendingUp className="h-6 w-6 text-white" /></div><div><p className="text-sm text-slate-500">إجمالي الإيرادات</p><p className="font-bold text-xl text-emerald-600">{totalRevenue.toLocaleString()} ج.م</p></div></div></CardContent></Card>
        <Card className="border-0 bg-white/70 backdrop-blur-sm"><CardContent className="p-4"><div className="flex items-center gap-3"><div className={cn("w-12 h-12 rounded-2xl shadow-md flex items-center justify-center", netProfit >= 0 ? "bg-gradient-to-br from-blue-500 to-cyan-500" : "bg-gradient-to-br from-amber-500 to-orange-500")}><Wallet className="h-6 w-6 text-white" /></div><div><p className="text-sm text-slate-500">صافي الربح</p><p className={cn("font-bold text-xl", netProfit >= 0 ? "text-blue-600" : "text-amber-600")}>{netProfit.toLocaleString()} ج.م</p></div></div></CardContent></Card>
        <Card className="border-0 bg-white/70 backdrop-blur-sm"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md flex items-center justify-center"><Coins className="h-6 w-6 text-white" /></div><div><p className="text-sm text-slate-500">هامش الربح</p><p className={cn("font-bold text-xl", profitMargin >= 0 ? "text-violet-600" : "text-rose-600")}>{profitMargin}%</p></div></div></CardContent></Card>
      </div>

      <Card className="mb-8 border-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Calendar className="h-5 w-5" /></div><h3 className="font-bold text-lg">ملخص العام {currentYear}</h3></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4"><p className="text-sm text-white/80 mb-1">الإيرادات</p><p className="text-2xl font-bold">{yearTotalRevenue.toLocaleString()} ج.م</p></div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4"><p className="text-sm text-white/80 mb-1">المصروفات</p><p className="text-2xl font-bold">{yearTotalExpense.toLocaleString()} ج.م</p></div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4"><p className="text-sm text-white/80 mb-1">صافي الربح</p><p className="text-2xl font-bold">{yearNet.toLocaleString()} ج.م</p></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center"><BarChart3 className="h-4 w-4 text-white" /></div><h3 className="font-bold text-slate-800">مقارنة شهرية</h3></div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barCategoryGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                  <YAxis fontSize={11} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} />
                  <Bar dataKey="مصروفات" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="إيرادات" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"><PieChartIcon className="h-4 w-4 text-white" /></div><h3 className="font-bold text-slate-800">توزيع المصروفات حسب الفئة</h3></div>
            <div className="h-72 flex items-center justify-center">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                      {categoryData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value.toLocaleString()} ج.م`} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                    <Legend layout="vertical" align="left" verticalAlign="middle" iconType="circle" iconSize={10} formatter={(value: string) => <span className="text-sm text-slate-600">{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-slate-500">لا توجد بيانات</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center"><Receipt className="h-4 w-4 text-white" /></div><h3 className="font-bold text-slate-800">تفصيل المصروفات حسب الفئة</h3></div>
          <div className="space-y-3">
            {categoryData.map((item, index) => {
              const percent = totalExpenses > 0 ? Math.round((item.value / totalExpenses) * 100) : 0;
              return (
                <div key={index} className="p-3 bg-slate-50/50 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} /><span className="font-semibold text-slate-700 text-sm">{item.name}</span></div>
                    <span className="text-sm font-bold text-slate-800">{item.value.toLocaleString()} ج.م</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: COLORS[index % COLORS.length] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default ExpenseReports;
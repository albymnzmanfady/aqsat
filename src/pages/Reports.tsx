"use client";

import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import AnimatedCounter from "@/components/AnimatedCounter";
import { api, ApiContract, ApiInstallment, ApiCustomer, ApiProduct, ApiExpense } from "@/lib/api";
import { showError } from "@/utils/toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";
import {
  BarChart3, TrendingUp, TrendingDown, Wallet, Clock, AlertTriangle,
  CheckCircle, Calendar, DollarSign, Package, Users, FileText,
  Search, Loader2, Coins, Receipt, PieChart as PieChartIcon, Activity, Target,
  RefreshCw, Layers, ArrowLeft, Building2, CreditCard, Warehouse,
} from "lucide-react";

const COLORS = ["#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#EC4899", "#06B6D4"];
const MONTHS = ["يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

const Reports = () => {
  const [contracts, setContracts] = useState<ApiContract[]>([]);
  const [installments, setInstallments] = useState<ApiInstallment[]>([]);
  const [customers, setCustomers] = useState<ApiCustomer[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [expenses, setExpenses] = useState<ApiExpense[]>([]);
  const [loading, setLoading] = useState(true);

  // فلترة
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("treasury");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [c, i, cu, p, e] = await Promise.all([
        api.contracts.list(),
        api.installments.list(),
        api.customers.list(),
        api.products.list(),
        api.expenses.list(),
      ]);
      setContracts(c);
      setInstallments(i);
      setCustomers(cu);
      setProducts(p);
      setExpenses(e);
    } catch (e: any) {
      showError("خطأ في تحميل البيانات: " + e.message);
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

  // ===== تصفية البيانات حسب التاريخ إن وجد =====
  const filteredInstallments = useMemo(() => {
    if (!dateFrom && !dateTo) return installments;
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;

    return installments.filter((i) => {
      const d = new Date(i.year, i.month - 1, i.day);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }, [installments, dateFrom, dateTo]);

  const filteredExpenses = useMemo(() => {
    if (!dateFrom && !dateTo) return expenses;
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;

    return expenses.filter((e) => {
      const d = new Date(e.date);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }, [expenses, dateFrom, dateTo]);

  // ===== حسابات الخزنة =====
  const treasury = useMemo(() => {
    const totalInstallmentsDue = filteredInstallments.reduce((s, i) => s + i.amount, 0);
    const totalCollected = filteredInstallments.filter((i) => i.is_paid).reduce((s, i) => s + i.amount, 0);
    const totalRemaining = totalInstallmentsDue - totalCollected;
    const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);
    const downPayments = contracts.reduce((s, c) => s + c.down_payment, 0);
    const netProfit = totalCollected + downPayments - totalExpenses;
    const cashFlow = totalCollected - totalExpenses;

    return {
      totalInstallmentsDue,
      totalCollected,
      totalRemaining,
      totalExpenses,
      downPayments,
      netProfit,
      cashFlow,
      collectionRate: totalInstallmentsDue > 0 ? Math.round((totalCollected / totalInstallmentsDue) * 100) : 0,
    };
  }, [filteredInstallments, filteredExpenses, contracts]);

  // ===== حسابات الأقساط =====
  const installmentStats = useMemo(() => {
    const overdue = filteredInstallments.filter(
      (i) => !i.is_paid && new Date(i.year, i.month - 1, i.day) < today
    );
    const paid = filteredInstallments.filter((i) => i.is_paid);
    const pending = filteredInstallments.filter((i) => !i.is_paid && new Date(i.year, i.month - 1, i.day) >= today);

    const overdueAmount = overdue.reduce((s, i) => s + i.amount, 0);
    const paidAmount = paid.reduce((s, i) => s + i.amount, 0);
    const pendingAmount = pending.reduce((s, i) => s + i.amount, 0);

    return {
      total: filteredInstallments.length,
      paidCount: paid.length,
      overdueCount: overdue.length,
      pendingCount: pending.length,
      paidAmount,
      overdueAmount,
      pendingAmount,
    };
  }, [filteredInstallments, today]);

  // ===== حسابات العقود =====
  const contractStats = useMemo(() => {
    const active = contracts.filter((c) => c.status === "active");
    const completed = contracts.filter((c) => c.status === "completed");
    const defaulted = contracts.filter((c) => c.status === "defaulted");
    const totalValue = contracts.reduce((s, c) => s + c.total_price, 0);
    const activeValue = active.reduce((s, c) => s + c.total_price, 0);

    return {
      total: contracts.length,
      activeCount: active.length,
      completedCount: completed.length,
      defaultedCount: defaulted.length,
      totalValue,
      activeValue,
    };
  }, [contracts]);

  // ===== حسابات العملاء =====
  const customerStats = useMemo(() => {
    const realCustomers = customers.filter((c) => c.type === "customer");
    const guarantors = customers.filter((c) => c.type === "guarantor");

    return {
      total: customers.length,
      customerCount: realCustomers.length,
      guarantorCount: guarantors.length,
    };
  }, [customers]);

  // ===== حسابات المخزون =====
  const inventoryStats = useMemo(() => {
    const totalStockValue = products.reduce((s, p) => s + p.current_stock * p.cost_price, 0);
    const totalSellingValue = products.reduce((s, p) => s + p.current_stock * p.selling_price, 0);
    const lowStock = products.filter((p) => p.current_stock <= p.min_stock && p.current_stock > 0);
    const outOfStock = products.filter((p) => p.current_stock <= 0);

    return {
      totalProducts: products.length,
      totalStockValue,
      totalSellingValue,
      potentialProfit: totalSellingValue - totalStockValue,
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
      lowStock,
      outOfStock,
    };
  }, [products]);

  // ===== بيانات الرسوم البيانية الشهرية =====
  const monthlyData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return MONTHS.map((name, idx) => {
      const monthInstallments = filteredInstallments.filter(
        (i) => i.month === idx + 1 && i.year === currentYear
      );
      const collected = monthInstallments
        .filter((i) => i.is_paid)
        .reduce((s, i) => s + i.amount, 0);
      const due = monthInstallments.reduce((s, i) => s + i.amount, 0);
      const monthExpenses = filteredExpenses.filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === idx && d.getFullYear() === currentYear;
      }).reduce((s, e) => s + e.amount, 0);

      return { name, الإيرادات: collected, المستحقات: due, المصروفات: monthExpenses };
    });
  }, [filteredInstallments, filteredExpenses]);

  // ===== بيانات توزيع الحالات =====
  const statusDistribution = useMemo(() => [
    { name: "مدفوع", value: installmentStats.paidCount, color: "#10B981" },
    { name: "باقي", value: installmentStats.pendingCount, color: "#F59E0B" },
    { name: "متأخر", value: installmentStats.overdueCount, color: "#EF4444" },
  ], [installmentStats]);

  // ===== بيانات المصروفات حسب الفئات =====
  const expenseByCategory = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    filteredExpenses.forEach((e) => {
      const catName = (e as any).category_name || "أخرى";
      categoryMap[catName] = (categoryMap[catName] || 0) + e.amount;
    });
    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  // ===== بحث شامل =====
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();

    const matchedContracts = contracts.filter(
      (c) =>
        c.customer_name.toLowerCase().includes(q) ||
        c.customer_phone.includes(q) ||
        c.product_type.toLowerCase().includes(q)
    );

    const matchedCustomers = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q)
    );

    const matchedProducts = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );

    return {
      contracts: matchedContracts,
      customers: matchedCustomers,
      products: matchedProducts,
      totalResults: matchedContracts.length + matchedCustomers.length + matchedProducts.length,
    };
  }, [searchQuery, contracts, customers, products]);

  const handleResetFilters = () => {
    setDateFrom("");
    setDateTo("");
    setSearchQuery("");
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="h-10 w-10 text-violet-600 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">جاري تحليل الأرقام والبيانات...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="relative">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-full opacity-20 blur-xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <BarChart3 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-800 dark:text-slate-100">التقارير الشاملة</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">تحليل ذكي وحي لكافة الأرقام والمؤشرات التشغيلية</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {(dateFrom || dateTo || searchQuery) && (
            <Button onClick={handleResetFilters} variant="ghost" className="rounded-xl h-11 text-xs gap-1.5 text-slate-500 hover:text-slate-800">
              <RefreshCw className="h-3.5 w-3.5" /> إعادة تعيين الفلاتر
            </Button>
          )}
          <Button onClick={fetchData} variant="outline" className="rounded-xl h-11 gap-1.5 border-slate-200">
            <RefreshCw className="h-4 w-4 text-violet-500" /> تحديث البيانات
          </Button>
        </div>
      </div>

      {/* لوحة الفلترة والبحث الذكي */}
      <Card className="border-0 bg-white/80 dark:bg-[#0f131a] backdrop-blur-sm overflow-hidden mb-8 shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            <div className="w-full lg:flex-1 space-y-1.5 text-right">
              <Label className="text-xs font-bold text-slate-500">البحث الشامل في السجلات</Label>
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="بحث سريع باسم العميل، الهاتف، نوع السلعة..."
                  className="pr-12 rounded-2xl h-12 bg-white dark:bg-[#0a0d14]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
              <div className="space-y-1.5 text-right">
                <Label className="text-xs font-bold text-slate-500">من تاريخ</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="rounded-2xl h-12 bg-white dark:bg-[#0a0d14]"
                />
              </div>
              <div className="space-y-1.5 text-right">
                <Label className="text-xs font-bold text-slate-500">إلى تاريخ</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="rounded-2xl h-12 bg-white dark:bg-[#0a0d14]"
                />
              </div>
            </div>
          </div>

          {/* لوحة نتائج البحث */}
          {searchResults && (
            <div className="mt-5 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-extrabold text-sm text-slate-700 dark:text-slate-200">
                  تم العثور على {searchResults.totalResults} سجل مطابق
                </h4>
                <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")} className="text-xs text-rose-500 hover:bg-rose-50">
                  إلغاء البحث
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-white dark:bg-[#0f131a] rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 font-semibold mb-0.5">العقود المطابقة</p>
                  <p className="font-extrabold text-sm text-violet-600">{searchResults.contracts.length} عقد</p>
                </div>
                <div className="p-3 bg-white dark:bg-[#0f131a] rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 font-semibold mb-0.5">العملاء المطابقين</p>
                  <p className="font-extrabold text-sm text-blue-600">{searchResults.customers.length} عميل</p>
                </div>
                <div className="p-3 bg-white dark:bg-[#0f131a] rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 font-semibold mb-0.5">المنتجات المطابقة</p>
                  <p className="font-extrabold text-sm text-emerald-600">{searchResults.products.length} منتج</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* شريط التبويبات التفاعلي الأنيق */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
        <TabsList className="bg-white/80 dark:bg-[#0f131a] backdrop-blur-sm border border-slate-100 dark:border-slate-800 p-1 rounded-2xl mb-8 flex-nowrap overflow-x-auto">
          <TabsTrigger value="treasury" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white gap-2 font-bold px-5">
            <Wallet className="h-4 w-4" /> الخزنة والأرباح
          </TabsTrigger>
          <TabsTrigger value="installments" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white gap-2 font-bold px-5">
            <CreditCard className="h-4 w-4" /> الأقساط والتحصيل
          </TabsTrigger>
          <TabsTrigger value="contracts" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-violet-600 data-[state=active]:text-white gap-2 font-bold px-5">
            <FileText className="h-4 w-4" /> العقود والمبيعات
          </TabsTrigger>
          <TabsTrigger value="inventory" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white gap-2 font-bold px-5">
            <Package className="h-4 w-4" /> المخزون والسلع
          </TabsTrigger>
          <TabsTrigger value="expenses" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white gap-2 font-bold px-5">
            <Receipt className="h-4 w-4" /> المصروفات والنثريات
          </TabsTrigger>
        </TabsList>

        {/* ==================== 1. الخزنة والأرباح ==================== */}
        <TabsContent value="treasury" className="mt-0 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm hover-lift relative overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <Badge className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-0 rounded-lg text-[10px] font-bold">
                    إيجابي ✓
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mb-0.5">إجمالي الأقساط المحصلة</p>
                <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                  <AnimatedCounter value={treasury.totalCollected} formatter={(v) => v.toLocaleString()} />
                  <span className="text-xs font-bold text-slate-400 mr-1">ج.م</span>
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm hover-lift relative overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md">
                    <TrendingDown className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mb-0.5">إجمالي المصروفات المسجلة</p>
                <p className="text-2xl font-extrabold text-rose-600">
                  <AnimatedCounter value={treasury.totalExpenses} formatter={(v) => v.toLocaleString()} />
                  <span className="text-xs font-bold text-slate-400 mr-1">ج.م</span>
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm hover-lift relative overflow-hidden border-r-4 border-r-indigo-500">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md">
                    <Wallet className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mb-0.5">صافي الربح الفعلي</p>
                <p className={cn("text-2xl font-extrabold", treasury.netProfit >= 0 ? "text-indigo-600 dark:text-indigo-400" : "text-rose-600")}>
                  <AnimatedCounter value={treasury.netProfit} formatter={(v) => v.toLocaleString()} />
                  <span className="text-xs font-bold text-slate-400 mr-1">ج.م</span>
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm hover-lift relative overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                    <Coins className="h-6 w-6" />
                  </div>
                  <Badge className="bg-violet-100 dark:bg-violet-950/40 text-violet-600 border-0 rounded-lg text-[10px] font-bold">
                    مقدمات
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mb-0.5">إجمالي المقدمات المحصلة</p>
                <p className="text-2xl font-extrabold text-violet-600">
                  <AnimatedCounter value={treasury.downPayments} formatter={(v) => v.toLocaleString()} />
                  <span className="text-xs font-bold text-slate-400 mr-1">ج.م</span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* البانر المالي الشامل */}
          <Card className="border-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white overflow-hidden relative shadow-md">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-xl animate-pulse" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-indigo-500/20 rounded-full blur-xl" />
            </div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-extrabold text-lg text-white">ملخص الملاءة والتدفق المالي</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <p className="text-xs text-white/80 mb-1">المدخلات الكلية للبرنامج</p>
                  <p className="text-xl font-extrabold">{(treasury.totalCollected + treasury.downPayments).toLocaleString()} ج.م</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <p className="text-xs text-white/80 mb-1">إجمالي المصروفات</p>
                  <p className="text-xl font-extrabold text-rose-100">{treasury.totalExpenses.toLocaleString()} ج.م</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <p className="text-xs text-white/80 mb-1">المتبقي المطلوب تحصيله</p>
                  <p className="text-xl font-extrabold text-amber-100">{treasury.totalRemaining.toLocaleString()} ج.م</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="flex justify-between text-xs text-white/80 mb-1">
                    <span>نسبة تحصيل الأقساط</span>
                    <span className="font-bold">{treasury.collectionRate}%</span>
                  </div>
                  <Progress value={treasury.collectionRate} className="h-2 mt-1.5 bg-white/20 [&>div]:bg-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* الرسوم البيانية للخزنة */}
          <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <BarChart3 className="h-4.5 w-4.5 text-violet-500" /> المقارنة السنوية للحركة المالية (الإيرادات vs المصروفات)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                    <YAxis fontSize={11} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                    <Area type="monotone" dataKey="الإيرادات" stroke="#10B981" fill="url(#colorIncome)" strokeWidth={2.5} />
                    <Area type="monotone" dataKey="المصروفات" stroke="#EF4444" fill="url(#colorExpense)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== 2. الأقساط والتحصيل ==================== */}
        <TabsContent value="installments" className="mt-0 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">الأقساط المسددة</p>
                    <p className="font-extrabold text-xl text-emerald-600">{installmentStats.paidCount} قسط</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{installmentStats.paidAmount.toLocaleString()} ج.م</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">المستحقة القادمة</p>
                    <p className="font-extrabold text-xl text-amber-600">{installmentStats.pendingCount} قسط</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{installmentStats.pendingAmount.toLocaleString()} ج.م</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">المتأخرات والحرجة</p>
                    <p className="font-extrabold text-xl text-rose-600">{installmentStats.overdueCount} قسط</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{installmentStats.overdueAmount.toLocaleString()} ج.م</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                    <Target className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">معدل الإنجاز</p>
                    <p className="font-extrabold text-xl text-violet-600">{treasury.collectionRate}%</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{installmentStats.total} إجمالي الأقساط</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* حالة التحصيل تفصيلية */}
            <Card className="border-0 bg-white/80 dark:bg-[#0f131a] backdrop-blur-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
                    <PieChartIcon className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-800">التوزيع النسبي لحالة الأقساط</h3>
                </div>
                <div className="h-64 flex items-center justify-center">
                  {installmentStats.total > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value">
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                        <Legend layout="vertical" align="left" verticalAlign="middle" iconType="circle" iconSize={10} formatter={(value: string) => <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{value}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-slate-500 font-medium">لا توجد بيانات متاحة حالياً</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* تقدم التحصيل بالبرنامج */}
            <Card className="border-0 bg-white/80 dark:bg-[#0f131a] backdrop-blur-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-sm">
                    <Activity className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-800">تتبع تقدم خطط السداد الكلية</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-bold">
                      <span className="text-slate-600 dark:text-slate-400">المحصل الفعلي الكلي</span>
                      <span className="text-emerald-600">{treasury.collectionRate}%</span>
                    </div>
                    <Progress value={treasury.collectionRate} className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 [&>div]:bg-gradient-to-r [&>div]:from-emerald-400 [&>div]:to-teal-500" />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>0%</span>
                      <span>{treasury.totalCollected.toLocaleString()} ج.م محقق</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 dark:bg-slate-800" />

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100/50">
                      <p className="text-[10px] text-emerald-600 font-bold mb-0.5">✓ المسددة</p>
                      <p className="font-extrabold text-sm text-emerald-700">{installmentStats.paidCount} قسط</p>
                      <p className="text-[9px] text-emerald-500 font-medium mt-0.5">{installmentStats.paidAmount.toLocaleString()} ج.م</p>
                    </div>
                    <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-100/50">
                      <p className="text-[10px] text-amber-600 font-bold mb-0.5">◷ المستحقة</p>
                      <p className="font-extrabold text-sm text-amber-700">{installmentStats.pendingCount} قسط</p>
                      <p className="text-[9px] text-amber-500 font-medium mt-0.5">{installmentStats.pendingAmount.toLocaleString()} ج.م</p>
                    </div>
                    <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-100/50">
                      <p className="text-[10px] text-rose-600 font-bold mb-0.5">🚨 المتأخرات</p>
                      <p className="font-extrabold text-sm text-rose-700">{installmentStats.overdueCount} قسط</p>
                      <p className="text-[9px] text-rose-500 font-medium mt-0.5">{installmentStats.overdueAmount.toLocaleString()} ج.م</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ==================== 3. العقود والمبيعات ==================== */}
        <TabsContent value="contracts" className="mt-0 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">إجمالي العقود</p>
                    <p className="font-extrabold text-xl text-slate-800 dark:text-slate-100">{contractStats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">العقود النشطة</p>
                    <p className="font-extrabold text-xl text-emerald-600">{contractStats.activeCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">العقود المكتملة</p>
                    <p className="font-extrabold text-xl text-blue-600">{contractStats.completedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">متعثرة ومتأخرة</p>
                    <p className="font-extrabold text-xl text-rose-600">{contractStats.defaultedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 bg-white/80 dark:bg-[#0f131a] backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-sm">
                  <BarChart3 className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-bold text-sm text-slate-800">حجم مبيعات وقيم العقود حسب حالتها التشغيلية</h3>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: "العقود النشطة", value: contractStats.activeValue, color: "#10B981" },
                    { name: "العقود المكتملة", value: contracts.filter(c => c.status === "completed").reduce((s, c) => s + c.total_price, 0), color: "#3B82F6" },
                    { name: "العقود المتعثرة", value: contracts.filter(c => c.status === "defaulted").reduce((s, c) => s + c.total_price, 0), color: "#EF4444" },
                  ]} barCategoryGap={30}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" fontSize={12} stroke="#94a3b8" />
                    <YAxis fontSize={11} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} formatter={(value: number) => [`${value.toLocaleString()} ج.م`, "القيمة الإجمالية"]} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {[0, 1, 2].map((index) => (
                        <Cell key={`cell-${index}`} fill={["#10B981", "#3B82F6", "#EF4444"][index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== 4. المخزون والسلع ==================== */}
        <TabsContent value="inventory" className="mt-0 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shadow-md">
                    <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">السلع والمنتجات</p>
                    <p className="font-extrabold text-xl text-slate-800 dark:text-slate-100">{inventoryStats.totalProducts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
                    <Warehouse className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">قيمة السلع (تكلفة)</p>
                    <p className="font-extrabold text-xl text-blue-600">{inventoryStats.totalStockValue.toLocaleString()} ج.م</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">قيمة السلع (بيع)</p>
                    <p className="font-extrabold text-xl text-emerald-600">{inventoryStats.totalSellingValue.toLocaleString()} ج.م</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">نفاد مخزون وشيك</p>
                    <p className="font-extrabold text-xl text-amber-600">{inventoryStats.lowStockCount + inventoryStats.outOfStockCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* التنبيهات الذكية للمخازن */}
          {(inventoryStats.lowStock.length > 0 || inventoryStats.outOfStock.length > 0) && (
            <Card className="border-0 bg-white/80 dark:bg-[#0f131a] backdrop-blur-sm overflow-hidden">
              <CardContent className="p-5">
                <h3 className="font-bold text-sm text-amber-800 dark:text-amber-200 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-600" /> تنبيهات هامة على رصيد المخزن
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {inventoryStats.outOfStock.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900/50">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{p.name}</span>
                      <Badge className="bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-0 rounded-lg font-bold">نفذ بالكامل 🚫</Badge>
                    </div>
                  ))}
                  {inventoryStats.lowStock.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/50">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{p.name} ({p.current_stock} {p.unit})</span>
                      <Badge className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-0 rounded-lg font-bold">رصيد منخفض ⏰</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ==================== 5. المصروفات والنثريات ==================== */}
        <TabsContent value="expenses" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md">
                    <Receipt className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">إجمالي المصروفات والنثريات</p>
                    <p className="font-extrabold text-xl text-rose-600">{treasury.totalExpenses.toLocaleString()} ج.م</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                    <PieChartIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">عدد الحركات المسجلة</p>
                    <p className="font-extrabold text-xl text-violet-600">{filteredExpenses.length} حركة</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 bg-white/80 dark:bg-[#0f131a] backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-sm">
                  <PieChartIcon className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-bold text-sm text-slate-800">توزيع المصروفات حسب فئاتها المسجلة بالبرنامج</h3>
              </div>
              <div className="h-72">
                {expenseByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expenseByCategory} layout="vertical" barCategoryGap={10}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" fontSize={11} stroke="#94a3b8" />
                      <YAxis type="category" dataKey="name" fontSize={11} stroke="#94a3b8" width={110} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} formatter={(value: number) => [`${value.toLocaleString()} ج.م`, "مبلغ المصروف"]} />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                        {expenseByCategory.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-16 text-slate-400">
                    <Receipt className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-semibold">لم يتم تسجيل أي مصروفات خلال هذه الفترة</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Reports;
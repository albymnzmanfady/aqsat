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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import AnimatedCounter from "@/components/AnimatedCounter";
import { api, ApiContract, ApiInstallment, ApiCustomer, ApiProduct, ApiExpense } from "@/lib/api";
import { showError } from "@/utils/toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
} from "recharts";
import {
  BarChart3, TrendingUp, TrendingDown, Wallet, Clock, AlertTriangle,
  CheckCircle, Calendar, DollarSign, Package, Users, FileText,
  Search, Filter, Download, Loader2, ArrowUpRight, ArrowDownRight,
  Receipt, PieChart as PieChartIcon, Activity, Target, Coins,
  CreditCard, ShoppingCart, Warehouse, RefreshCw, ChevronDown,
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

  useEffect(() => {
    Promise.all([
      api.contracts.list(),
      api.installments.list(),
      api.customers.list(),
      api.products.list(),
      api.expenses.list(),
    ])
      .then(([c, i, cu, p, e]) => {
        setContracts(c);
        setInstallments(i);
        setCustomers(cu);
        setProducts(p);
        setExpenses(e);
      })
      .catch((e) => showError("خطأ في تحميل البيانات: " + e.message))
      .finally(() => setLoading(false));
  }, []);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // ===== حسابات الخزنة =====
  const treasury = useMemo(() => {
    const totalInstallmentsDue = installments.reduce((s, i) => s + i.amount, 0);
    const totalCollected = installments.filter((i) => i.is_paid).reduce((s, i) => s + i.amount, 0);
    const totalRemaining = totalInstallmentsDue - totalCollected;
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
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
  }, [installments, expenses, contracts]);

  // ===== حسابات الأقساط =====
  const installmentStats = useMemo(() => {
    const overdue = installments.filter(
      (i) => !i.is_paid && new Date(i.year, i.month - 1, i.day) < today
    );
    const paid = installments.filter((i) => i.is_paid);
    const pending = installments.filter((i) => !i.is_paid && new Date(i.year, i.month - 1, i.day) >= today);

    const overdueAmount = overdue.reduce((s, i) => s + i.amount, 0);
    const paidAmount = paid.reduce((s, i) => s + i.amount, 0);
    const pendingAmount = pending.reduce((s, i) => s + i.amount, 0);

    return {
      total: installments.length,
      paidCount: paid.length,
      overdueCount: overdue.length,
      pendingCount: pending.length,
      paidAmount,
      overdueAmount,
      pendingAmount,
    };
  }, [installments, today]);

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
      const monthInstallments = installments.filter(
        (i) => i.month === idx + 1 && i.year === currentYear
      );
      const collected = monthInstallments
        .filter((i) => i.is_paid)
        .reduce((s, i) => s + i.amount, 0);
      const due = monthInstallments.reduce((s, i) => s + i.amount, 0);
      const monthExpenses = expenses.filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === idx && d.getFullYear() === currentYear;
      }).reduce((s, e) => s + e.amount, 0);

      return { name, الإيرادات: collected, المستحقات: due, المصروفات: monthExpenses };
    });
  }, [installments, expenses]);

  // ===== بيانات توزيع الحالات =====
  const statusDistribution = useMemo(() => [
    { name: "مدفوع", value: installmentStats.paidCount, color: "#10B981" },
    { name: "باقي", value: installmentStats.pendingCount, color: "#F59E0B" },
    { name: "متأخر", value: installmentStats.overdueCount, color: "#EF4444" },
  ], [installmentStats]);

  // ===== بيانات المصروفات حسب الفئات =====
  const expenseByCategory = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    expenses.forEach((e) => {
      const catName = (e as any).category_name || "أخرى";
      categoryMap[catName] = (categoryMap[catName] || 0) + e.amount;
    });
    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="relative">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-full opacity-20 blur-xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <BarChart3 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100">التقارير الشاملة</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">نظرة شاملة على حالة النظام المالية والتشغيلية</p>
            </div>
          </div>
        </div>
      </div>

      {/* بحث شامل */}
      <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm overflow-hidden mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="بحث شامل في العقود، العملاء، المنتجات..."
                className="pr-12 rounded-2xl h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-2xl h-12 w-40"
                placeholder="من تاريخ"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-2xl h-12 w-40"
                placeholder="إلى تاريخ"
              />
            </div>
          </div>

          {/* نتائج البحث */}
          {searchResults && (
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200">
                  نتائج البحث: {searchResults.totalResults} نتيجة
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="text-xs"
                >
                  مسح البحث
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {searchResults.contracts.length > 0 && (
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 mb-1">العقود</p>
                    <p className="font-bold text-violet-600">{searchResults.contracts.length} عقد</p>
                  </div>
                )}
                {searchResults.customers.length > 0 && (
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 mb-1">العملاء</p>
                    <p className="font-bold text-blue-600">{searchResults.customers.length} عميل</p>
                  </div>
                )}
                {searchResults.products.length > 0 && (
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 mb-1">المنتجات</p>
                    <p className="font-bold text-emerald-600">{searchResults.products.length} منتج</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* التبويبات الرئيسية */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
        <TabsList className="bg-white/80 dark:bg-[#0f131a] backdrop-blur-sm border border-slate-100 dark:border-slate-800 p-1 rounded-2xl mb-6 overflow-x-auto flex-nowrap">
          <TabsTrigger value="treasury" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">الخزنة</span>
          </TabsTrigger>
          <TabsTrigger value="installments" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">الأقساط</span>
          </TabsTrigger>
          <TabsTrigger value="contracts" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">العقود</span>
          </TabsTrigger>
          <TabsTrigger value="customers" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">العملاء</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">المخزون</span>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white gap-2">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">المصروفات</span>
          </TabsTrigger>
        </TabsList>

        {/* ==================== تبويب الخزنة ==================== */}
        <TabsContent value="treasury" className="mt-0 space-y-6">
          {/* البطاقات الرئيسية */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardContent className="p-5 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-0 rounded-lg text-[10px]">
                    +{treasury.collectionRate}%
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">إجمالي المحصل</p>
                <p className="text-2xl font-extrabold text-emerald-600">
                  <AnimatedCounter value={treasury.totalCollected} duration={800} formatter={(v) => v.toLocaleString()} />
                  <span className="text-xs font-medium text-slate-400 mr-1">ج.م</span>
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-rose-400/20 to-pink-400/20 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardContent className="p-5 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">إجمالي المصروفات</p>
                <p className="text-2xl font-extrabold text-rose-600">
                  <AnimatedCounter value={treasury.totalExpenses} duration={800} formatter={(v) => v.toLocaleString()} />
                  <span className="text-xs font-medium text-slate-400 mr-1">ج.م</span>
                </p>
              </CardContent>
            </Card>

            <Card className={cn("border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm overflow-hidden relative", treasury.netProfit >= 0 ? "border-r-4 border-r-emerald-500" : "border-r-4 border-r-rose-500")}>
              <CardContent className="p-5 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", treasury.netProfit >= 0 ? "bg-gradient-to-br from-blue-500 to-cyan-500" : "bg-gradient-to-br from-amber-500 to-orange-500")}>
                    <Wallet className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">صافي الربح</p>
                <p className={cn("text-2xl font-extrabold", treasury.netProfit >= 0 ? "text-blue-600" : "text-amber-600")}>
                  <AnimatedCounter value={treasury.netProfit} duration={800} formatter={(v) => v.toLocaleString()} />
                  <span className="text-xs font-medium text-slate-400 mr-1">ج.م</span>
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardContent className="p-5 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Coins className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">المقدمات المحصلة</p>
                <p className="text-2xl font-extrabold text-violet-600">
                  <AnimatedCounter value={treasury.downPayments} duration={800} formatter={(v) => v.toLocaleString()} />
                  <span className="text-xs font-medium text-slate-400 mr-1">ج.م</span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ملخص التدفق النقدي */}
          <Card className="border-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white overflow-hidden relative">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-xl" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-indigo-500/20 rounded-full blur-xl" />
            </div>
            <CardContent className="p-6 relative z-10">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                ملخص التدفق النقدي
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <p className="text-xs text-white/70 mb-1">المدخول (الأقساط + المقدمات)</p>
                  <p className="text-xl font-extrabold">{(treasury.totalCollected + treasury.downPayments).toLocaleString()} ج.م</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <p className="text-xs text-white/70 mb-1">المصروفات</p>
                  <p className="text-xl font-extrabold text-rose-200">{treasury.totalExpenses.toLocaleString()} ج.م</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <p className="text-xs text-white/70 mb-1">المتبقي للتحصيل</p>
                  <p className="text-xl font-extrabold text-amber-200">{treasury.totalRemaining.toLocaleString()} ج.م</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <p className="text-xs text-white/70 mb-1">نسبة التحصيل</p>
                  <p className="text-xl font-extrabold">{treasury.collectionRate}%</p>
                  <Progress value={treasury.collectionRate} className="h-2 mt-2 bg-white/20 [&>div]:bg-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* الرسم البياني الشهري */}
          <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100/80 dark:border-slate-800 pb-4">
              <CardTitle className="text-md font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-violet-500" />
                المقارنة الشهرية للإيرادات والمصروفات
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                    <YAxis fontSize={11} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                    <Area type="monotone" dataKey="الإيرادات" stroke="#10B981" fill="url(#colorCollected)" strokeWidth={2} />
                    <Area type="monotone" dataKey="المصروفات" stroke="#EF4444" fill="url(#colorExpenses)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== تبويب الأقساط ==================== */}
        <TabsContent value="installments" className="mt-0 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">المسددة</p>
                    <p className="font-bold text-xl text-emerald-600">{installmentStats.paidCount}</p>
                    <p className="text-[10px] text-slate-400">{installmentStats.paidAmount.toLocaleString()} ج.م</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">المستحقة</p>
                    <p className="font-bold text-xl text-amber-600">{installmentStats.pendingCount}</p>
                    <p className="text-[10px] text-slate-400">{installmentStats.pendingAmount.toLocaleString()} ج.م</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">المتأخرة</p>
                    <p className="font-bold text-xl text-rose-600">{installmentStats.overdueCount}</p>
                    <p className="text-[10px] text-slate-400">{installmentStats.overdueAmount.toLocaleString()} ج.م</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">نسبة التحصيل</p>
                    <p className="font-bold text-xl text-violet-600">{treasury.collectionRate}%</p>
                    <p className="text-[10px] text-slate-400">{installmentStats.total} قسط</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* رسم بياني دائري لحالة الأقساط */}
            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <PieChartIcon className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">توزيع حالات الأقساط</h3>
                </div>
                <div className="h-64 flex items-center justify-center">
                  {installmentStats.total > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                        <Legend layout="vertical" align="left" verticalAlign="middle" iconType="circle" iconSize={10} formatter={(value: string) => <span className="text-sm text-slate-600 dark:text-slate-300">{value}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-slate-500">لا توجد بيانات</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* شريط التقدم */}
            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">تقدم التحصيل</h3>
                </div>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">المحصل من المستحقات</span>
                      <span className="font-bold text-emerald-600">{treasury.collectionRate}%</span>
                    </div>
                    <Progress value={treasury.collectionRate} className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 [&>div]:bg-gradient-to-r [&>div]:from-emerald-400 [&>div]:to-teal-500" />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>0%</span>
                      <span>{treasury.totalCollected.toLocaleString()} ج.م محصل</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 dark:bg-slate-800" />

                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-emerald-600 font-medium">✓ الأقساط المسددة</span>
                        <span className="font-bold text-emerald-700">{installmentStats.paidCount} قسط</span>
                      </div>
                      <p className="text-[10px] text-emerald-500 mt-1">{installmentStats.paidAmount.toLocaleString()} ج.م</p>
                    </div>
                    <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-amber-600 font-medium">◷ الأقساط المستحقة</span>
                        <span className="font-bold text-amber-700">{installmentStats.pendingCount} قسط</span>
                      </div>
                      <p className="text-[10px] text-amber-500 mt-1">{installmentStats.pendingAmount.toLocaleString()} ج.م</p>
                    </div>
                    <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-rose-600 font-medium">🚨 الأقساط المتأخرة</span>
                        <span className="font-bold text-rose-700">{installmentStats.overdueCount} قسط</span>
                      </div>
                      <p className="text-[10px] text-rose-500 mt-1">{installmentStats.overdueAmount.toLocaleString()} ج.م</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ==================== تبويب العقود ==================== */}
        <TabsContent value="contracts" className="mt-0 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">إجمالي العقود</p>
                    <p className="font-bold text-xl text-slate-800 dark:text-slate-100">{contractStats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">العقود النشطة</p>
                    <p className="font-bold text-xl text-emerald-600">{contractStats.activeCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">المكتملة</p>
                    <p className="font-bold text-xl text-blue-600">{contractStats.completedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">المتأخرة</p>
                    <p className="font-bold text-xl text-rose-600">{contractStats.defaultedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100">قيمة العقود حسب الحالة</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: "النشطة", value: contractStats.activeValue, color: "#10B981" },
                    { name: "المكتملة", value: contracts.filter(c => c.status === "completed").reduce((s, c) => s + c.total_price, 0), color: "#3B82F6" },
                    { name: "المتأخرة", value: contracts.filter(c => c.status === "defaulted").reduce((s, c) => s + c.total_price, 0), color: "#EF4444" },
                  ]} barCategoryGap={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" fontSize={12} stroke="#94a3b8" />
                    <YAxis fontSize={11} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} formatter={(value: number) => [`${value.toLocaleString()} ج.م`, "القيمة"]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
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

        {/* ==================== تبويب العملاء ==================== */}
        <TabsContent value="customers" className="mt-0 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">إجمالي العملاء</p>
                    <p className="font-bold text-xl text-blue-600">{customerStats.customerCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">الضامنون</p>
                    <p className="font-bold text-xl text-emerald-600">{customerStats.guarantorCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">متوسط العقود لكل عميل</p>
                    <p className="font-bold text-xl text-violet-600">
                      {customerStats.customerCount > 0 ? (contracts.length / customerStats.customerCount).toFixed(1) : "0"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ==================== تبويب المخزون ==================== */}
        <TabsContent value="inventory" className="mt-0 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">المنتجات</p>
                    <p className="font-bold text-xl text-slate-800 dark:text-slate-100">{inventoryStats.totalProducts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Warehouse className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">قيمة المخزون</p>
                    <p className="font-bold text-xl text-blue-600">{inventoryStats.totalStockValue.toLocaleString()} ج.م</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">قيمة البيع</p>
                    <p className="font-bold text-xl text-emerald-600">{inventoryStats.totalSellingValue.toLocaleString()} ج.م</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">منخفضة/منتهية</p>
                    <p className="font-bold text-xl text-amber-600">{inventoryStats.lowStockCount + inventoryStats.outOfStockCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* تنبيه المخزون */}
          {(inventoryStats.lowStock.length > 0 || inventoryStats.outOfStock.length > 0) && (
            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <h3 className="font-bold text-sm text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  تنبيهات المخزون
                </h3>
                <div className="space-y-2">
                  {inventoryStats.outOfStock.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-2 bg-rose-50/50 dark:bg-rose-950/20 rounded-lg border border-rose-100 dark:border-rose-900/50">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{p.name}</span>
                      <Badge className="bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-0 rounded-lg">نفذ</Badge>
                    </div>
                  ))}
                  {inventoryStats.lowStock.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-2 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-100 dark:border-amber-900/50">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{p.name} ({p.current_stock} {p.unit})</span>
                      <Badge className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-0 rounded-lg">منخفض</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ==================== تبويب المصروفات ==================== */}
        <TabsContent value="expenses" className="mt-0 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                    <Receipt className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">إجمالي المصروفات</p>
                    <p className="font-bold text-xl text-rose-600">{treasury.totalExpenses.toLocaleString()} ج.م</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <PieChartIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">عدد المصروفات</p>
                    <p className="font-bold text-xl text-violet-600">{expenses.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                  <PieChartIcon className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100">توزيع المصروفات حسب الفئة</h3>
              </div>
              <div className="h-64">
                {expenseByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expenseByCategory} layout="vertical" barCategoryGap={8}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" fontSize={11} stroke="#94a3b8" />
                      <YAxis type="category" dataKey="name" fontSize={11} stroke="#94a3b8" width={100} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} formatter={(value: number) => [`${value.toLocaleString()} ج.م`, "المبلغ"]} />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                        {expenseByCategory.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-slate-500 py-8">لا توجد بيانات مصروفات</p>
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
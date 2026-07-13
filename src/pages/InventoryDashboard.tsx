"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { api, ApiProduct, ApiInventoryTransaction } from "@/lib/api";
import { showError } from "@/utils/toast";
import {
  Package,
  ArrowDownUp,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Warehouse,
  DollarSign,
  BarChart3,
  PieChart,
  Layers,
  Box,
  ClipboardList,
  ArrowLeft,
  Loader2,
} from "lucide-react";

interface CategoryData {
  name: string;
  count: number;
  stock: number;
  value: number;
}

const InventoryDashboard = () => {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [transactions, setTransactions] = useState<ApiInventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.products.list(), api.inventory.list()])
      .then(([p, t]) => {
        setProducts(p);
        setTransactions(t);
      })
      .catch((e) => showError("خطأ: " + e.message))
      .finally(() => setLoading(false));
  }, []);

  const totalStockValueCost = products.reduce((sum, p) => sum + p.current_stock * p.cost_price, 0);
  const totalStockValueSell = products.reduce((sum, p) => sum + p.current_stock * p.selling_price, 0);
  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => p.current_stock <= p.min_stock);
  const outOfStockProducts = products.filter((p) => p.current_stock <= 0);

  const totalPurchaseCost = transactions
    .filter((t) => t.type === "purchase")
    .reduce((s, t) => s + t.total, 0);
  const totalSalesRevenue = transactions
    .filter((t) => t.type === "sale")
    .reduce((s, t) => s + Math.abs(t.total), 0);
  const potentialProfit = totalStockValueSell - totalStockValueCost;

  const totalSalesUnits = Math.abs(
    transactions.filter((t) => t.type === "sale").reduce((s, t) => s + t.quantity, 0)
  );

  const categories = [...new Set(products.map((p) => p.category))];
  const categoryData: CategoryData[] = categories.map((cat) => ({
    name: cat,
    count: products.filter((p) => p.category === cat).length,
    stock: products.filter((p) => p.category === cat).reduce((s, p) => s + p.current_stock, 0),
    value: products.filter((p) => p.category === cat).reduce((s, p) => s + p.current_stock * p.selling_price, 0),
  }));

  if (loading) return <Layout><div className="flex items-center justify-center py-32"><Loader2 className="h-8 w-8 text-violet-500 animate-spin" /></div></Layout>;

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30">
          <BarChart3 className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">تقارير المخزون</h1>
          <p className="text-slate-500 mt-1">تحليل المخزون والمبيعات والمشتريات</p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 bg-white/70 backdrop-blur-sm hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">إجمالي المنتجات</p>
                <p className="text-2xl font-bold text-slate-800">{totalProducts}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-md flex items-center justify-center">
                <Box className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white/70 backdrop-blur-sm hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">قيمة المخزون (تكلفة)</p>
                <p className="text-2xl font-bold text-slate-800">{totalStockValueCost.toLocaleString()} ج.م</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md flex items-center justify-center">
                <Warehouse className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white/70 backdrop-blur-sm hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">قيمة المخزون (بيع)</p>
                <p className="text-2xl font-bold text-emerald-600">{totalStockValueSell.toLocaleString()} ج.م</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white/70 backdrop-blur-sm hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">المنتجات المنخفضة</p>
                <p className="text-2xl font-bold text-amber-600">{lowStockProducts.length}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-md flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="mb-8 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl hover-lift">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h3 className="font-bold text-amber-800">منتجات تحتاج إعادة طلب</h3>
          </div>
          <div className="grid gap-2">
            {lowStockProducts.map((p, index) => (
              <div key={p.id} className="stagger-item flex items-center justify-between bg-white/60 rounded-xl p-3 hover-lift" style={{ animationDelay: `${index * 0.04}s` }}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">{p.name}</span>
                  <Badge className={cn("rounded-lg", p.current_stock <= 0 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700")}>
                    {p.current_stock <= 0 ? "نفذ بالكامل" : `متبقي ${p.current_stock}`}
                  </Badge>
                </div>
                <span className="text-sm text-slate-500">الحد الأدنى: {p.min_stock}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Financial Summary */}
        <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <PieChart className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-bold text-slate-800">الملخص المالي للمخزون</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl hover-lift">
                <span className="text-sm text-slate-600">إجمالي المشتريات</span>
                <span className="font-bold text-blue-600">{totalPurchaseCost.toLocaleString()} ج.م</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl hover-lift">
                <span className="text-sm text-slate-600">إجمالي المبيعات</span>
                <span className="font-bold text-emerald-600">{totalSalesRevenue.toLocaleString()} ج.م</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50/50 rounded-xl hover-lift">
                <span className="text-sm text-slate-600">الربح المحتمل (المخزون الحالي)</span>
                <span className="font-bold text-amber-600">{potentialProfit.toLocaleString()} ج.م</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-violet-50/50 rounded-xl hover-lift">
                <span className="text-sm text-slate-600">عدد المنتجات المباعة</span>
                <span className="font-bold text-violet-600">{totalSalesUnits} وحدة</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories Breakdown */}
        <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Layers className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-bold text-slate-800">توزيع المخزون حسب التصنيف</h3>
            </div>
            <div className="space-y-3">
              {categoryData.map((cat, index) => (
                <div key={cat.name} className="stagger-item p-3 bg-slate-50/50 rounded-xl hover-lift" style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-700 text-sm">{cat.name}</span>
                    <span className="text-xs text-slate-500">{cat.count} منتجات</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">المخزون: <strong>{cat.stock}</strong></span>
                    <span className="text-slate-500">القيمة: <strong className="text-emerald-600">{cat.value.toLocaleString()} ج.م</strong></span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-cyan-500 to-blue-600 rounded-full"
                      style={{ width: `${totalStockValueSell > 0 ? (cat.value / totalStockValueSell) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
              {categoryData.length === 0 && (
                <p className="text-center text-slate-500 py-4 text-sm">لا توجد تصنيفات</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden hover-lift mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Package className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-bold text-slate-800">تفاصيل المنتجات</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-right py-3 px-3 text-slate-600 font-semibold">المنتج</th>
                  <th className="text-center py-3 px-3 text-slate-600 font-semibold">التصنيف</th>
                  <th className="text-center py-3 px-3 text-slate-600 font-semibold">التكلفة</th>
                  <th className="text-center py-3 px-3 text-slate-600 font-semibold">البيع</th>
                  <th className="text-center py-3 px-3 text-slate-600 font-semibold">الرصيد</th>
                  <th className="text-center py-3 px-3 text-slate-600 font-semibold">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const profit = p.selling_price - p.cost_price;
                  const profitPercent = p.cost_price > 0 ? Math.round((profit / p.cost_price) * 100) : 0;
                  const stockStatus = p.current_stock <= 0
                    ? { label: "نفذ", color: "bg-rose-100 text-rose-700" }
                    : p.current_stock <= p.min_stock
                    ? { label: "منخفض", color: "bg-amber-100 text-amber-700" }
                    : { label: "متوفر", color: "bg-emerald-100 text-emerald-700" };

                  return (
                    <tr key={p.id} className="border-b border-slate-100/80 hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-medium text-slate-700">{p.name}</td>
                      <td className="py-3 px-3 text-center text-slate-500">{p.category}</td>
                      <td className="py-3 px-3 text-center">{p.cost_price.toLocaleString()} ج.م</td>
                      <td className="py-3 px-3 text-center text-emerald-600 font-semibold">{p.selling_price.toLocaleString()} ج.م</td>
                      <td className="py-3 px-3 text-center font-bold">{p.current_stock} {p.unit}</td>
                      <td className="py-3 px-3 text-center"><Badge className={cn("rounded-lg border-0 text-xs", stockStatus.color)}>{stockStatus.label}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link to="/products">
          <Card className="border-0 bg-gradient-to-br from-orange-500 to-red-500 text-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">إدارة</p>
                  <p className="font-bold text-lg">المنتجات</p>
                </div>
                <Package className="h-8 w-8 opacity-80" />
              </div>
              <div className="flex items-center gap-1 mt-3 text-sm text-white/80">
                <span>عرض المنتجات</span>
                <ArrowLeft className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/inventory">
          <Card className="border-0 bg-gradient-to-br from-teal-500 to-emerald-600 text-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">سجل</p>
                  <p className="font-bold text-lg">حركات المخزون</p>
                </div>
                <ArrowDownUp className="h-8 w-8 opacity-80" />
              </div>
              <div className="flex items-center gap-1 mt-3 text-sm text-white/80">
                <span>عرض الحركات</span>
                <ArrowLeft className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/contracts">
          <Card className="border-0 bg-gradient-to-br from-violet-500 to-purple-600 text-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">ربط مع</p>
                  <p className="font-bold text-lg">العقود</p>
                </div>
                <ClipboardList className="h-8 w-8 opacity-80" />
              </div>
              <div className="flex items-center gap-1 mt-3 text-sm text-white/80">
                <span>عرض العقود</span>
                <ArrowLeft className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </Layout>
  );
};

export default InventoryDashboard;
"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { initialProducts, initialTransactions } from "@/data/mockData";
import { Product, InventoryTransaction, InventoryTransactionType } from "@/types";
import { showSuccess } from "@/utils/toast";
import {
  ArrowDownUp,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  RotateCcw,
  Calendar,
  FileText,
  ClipboardList,
} from "lucide-react";

const typeConfig: Record<InventoryTransactionType, { label: string; icon: any; color: string }> = {
  purchase: { label: "مشتريات", icon: TrendingDown, color: "bg-blue-100 text-blue-700" },
  sale: { label: "مبيعات", icon: TrendingUp, color: "bg-emerald-100 text-emerald-700" },
  adjustment: { label: "تسوية", icon: RefreshCw, color: "bg-amber-100 text-amber-700" },
  return: { label: "مرتجع", icon: RotateCcw, color: "bg-purple-100 text-purple-700" },
};

const Inventory = () => {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>(initialTransactions);
  const [products] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<"all" | InventoryTransactionType>("all");

  const [formData, setFormData] = useState({
    productId: "",
    type: "purchase" as InventoryTransactionType,
    quantity: "",
    unitPrice: "",
    reference: "",
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      productId: "",
      type: "purchase",
      quantity: "",
      unitPrice: "",
      reference: "",
      notes: "",
    });
  };

  const getProductName = (id: number) => products.find((p) => p.id === id)?.name || "غير معروف";

  const filteredTransactions = transactions.filter((t) => {
    const product = products.find((p) => p.id === t.productId);
    const productName = product?.name || "";
    const matchesSearch = productName.includes(searchQuery) || t.reference.includes(searchQuery);
    const matchesType = filterType === "all" || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleAddTransaction = () => {
    const product = products.find((p) => p.id === Number(formData.productId));
    if (!product) return;

    const quantity = Number(formData.quantity);
    const unitPrice = Number(formData.unitPrice) || product.costPrice;

    const newTransaction: InventoryTransaction = {
      id: Math.max(0, ...transactions.map((t) => t.id)) + 1,
      productId: Number(formData.productId),
      type: formData.type,
      quantity: formData.type === "purchase" ? quantity : -quantity,
      unitPrice,
      total: formData.type === "purchase" ? quantity * unitPrice : -(quantity * unitPrice),
      date: new Date().toISOString().split("T")[0],
      reference: formData.reference || `TXN-${Date.now()}`,
      notes: formData.notes,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setTransactions((prev) => [newTransaction, ...prev]);

    const stockChange = formData.type === "purchase" ? quantity : -quantity;
    const productIndex = products.findIndex((p) => p.id === Number(formData.productId));
    if (productIndex !== -1) {
      products[productIndex].currentStock += stockChange;
    }

    showSuccess("✅ تم تسجيل الحركة بنجاح");
    setIsDialogOpen(false);
    resetForm();
  };

  const stats = {
    totalPurchases: transactions.filter((t) => t.type === "purchase").reduce((s, t) => s + t.total, 0),
    totalSales: transactions.filter((t) => t.type === "sale").reduce((s, t) => s + Math.abs(t.total), 0),
    totalTransactions: transactions.length,
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="relative">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full opacity-20 blur-xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30">
              <ArrowDownUp className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">حركات المخزون</h1>
              <p className="text-slate-500 mt-1">سجل المشتريات والمبيعات والتسويات</p>
            </div>
          </div>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-lg shadow-teal-500/30 h-12 px-6">
              <Plus className="h-5 w-5" />
              حركة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-teal-500" />
                تسجيل حركة مخزون
              </DialogTitle>
              <DialogDescription>إضافة مشتريات أو مبيعات أو تسوية للمخزون</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 px-8">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-600">نوع الحركة</Label>
                <Select
                  value={formData.type}
                  onValueChange={(val: InventoryTransactionType) =>
                    setFormData({ ...formData, type: val, unitPrice: "" })
                  }
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="purchase">مشتريات (إضافة للمخزون)</SelectItem>
                    <SelectItem value="sale">مبيعات (خصم من المخزون)</SelectItem>
                    <SelectItem value="adjustment">تسوية (تعديل الرصيد)</SelectItem>
                    <SelectItem value="return">مرتجع (إعادة للمخزون)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-600">المنتج</Label>
                <Select
                  value={formData.productId}
                  onValueChange={(val) => setFormData({ ...formData, productId: val })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="اختر المنتج" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name} (الرصيد: {p.currentStock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-600">الكمية</Label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-600">سعر الوحدة</Label>
                  <Input
                    type="number"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    placeholder="سعر التكلفة الافتراضي"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-600">رقم المرجع</Label>
                  <Input
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="رقم الفاتورة أو أمر الشراء"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-600">ملاحظات</Label>
                  <Input
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="ملاحظة (اختياري)"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="px-8">
              <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }} className="rounded-xl h-11">
                إلغاء
              </Button>
              <Button
                onClick={handleAddTransaction}
                className="rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 h-11 gap-2"
                disabled={!formData.productId || !formData.quantity}
              >
                <Sparkles className="h-4 w-4" />
                تسجيل الحركة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">إجمالي الحركات</p>
                <p className="font-bold text-xl text-slate-800">{stats.totalTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">إجمالي المشتريات</p>
                <p className="font-bold text-xl text-slate-800">{stats.totalPurchases.toLocaleString()} ج.م</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">إجمالي المبيعات</p>
                <p className="font-bold text-xl text-slate-800">{stats.totalSales.toLocaleString()} ج.م</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="text"
            placeholder="بحث باسم المنتج أو المرجع..."
            className="pr-12 rounded-2xl bg-white/70 backdrop-blur-sm border-slate-200/50 h-12 shadow-sm focus:shadow-md transition-shadow"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "purchase", "sale", "adjustment", "return"] as const).map((type) => (
            <Button
              key={type}
              variant={filterType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(type)}
              className={cn(
                "rounded-xl h-10 px-4",
                filterType === type && {
                  all: "bg-gradient-to-r from-slate-700 to-slate-800 text-white",
                  purchase: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
                  sale: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
                  adjustment: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
                  return: "bg-gradient-to-r from-purple-500 to-violet-500 text-white",
                }[type]
              )}
            >
              {type === "all" ? "الكل" : typeConfig[type]?.label || type}
            </Button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
        <div className="divide-y divide-slate-100/80">
          {filteredTransactions.map((transaction) => {
            const config = typeConfig[transaction.type];
            const Icon = config.icon;
            const productName = getProductName(transaction.productId);

            return (
              <div key={transaction.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shadow-md",
                      transaction.type === "purchase" ? "bg-gradient-to-br from-blue-500 to-cyan-500" :
                      transaction.type === "sale" ? "bg-gradient-to-br from-emerald-500 to-teal-500" :
                      transaction.type === "adjustment" ? "bg-gradient-to-br from-amber-500 to-orange-500" :
                      "bg-gradient-to-br from-purple-500 to-violet-500"
                    )}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-800">{productName}</h3>
                        <Badge className={cn("rounded-lg border-0", config.color)}>
                          {config.label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          الكمية: {Math.abs(transaction.quantity)} {products.find(p => p.id === transaction.productId)?.unit || "وحدة"}
                        </span>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {transaction.reference}
                        </span>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {transaction.date}
                        </span>
                      </div>
                      {transaction.notes && (
                        <p className="text-xs text-slate-400 mt-1">{transaction.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-left">
                    <p className={cn(
                      "font-bold",
                      transaction.type === "purchase" ? "text-blue-600" :
                      transaction.type === "sale" ? "text-emerald-600" :
                      "text-slate-800"
                    )}>
                      {transaction.type === "purchase" ? "+" : ""}
                      {transaction.total.toLocaleString()} ج.م
                    </p>
                    <p className="text-xs text-slate-400">
                      {transaction.unitPrice.toLocaleString()} ج.م / للوحدة
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <ArrowDownUp className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-600 mb-2">لا توجد حركات</h3>
            <p className="text-slate-500">لم يتم العثور على حركات مطابقة</p>
          </div>
        )}
      </Card>
    </Layout>
  );
};

export default Inventory;
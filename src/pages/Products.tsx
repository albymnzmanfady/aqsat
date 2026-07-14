"use client";

import { useState, useEffect } from "react";
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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api, ApiProduct } from "@/lib/api";
import { showSuccess, showError } from "@/utils/toast";
import {
  AlertTriangle,
  Package,
  Plus,
  Search,
  Sparkles,
  MoreHorizontal,
  Edit,
  Trash2,
  Box,
  TrendingUp,
  AlertCircle,
  Warehouse,
  X,
  Loader2,
} from "lucide-react";

const Products = () => {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ApiProduct | null>(null);
  const [formData, setFormData] = useState({
    name: "", category: "", unit: "قطعة", costPrice: "", sellingPrice: "", currentStock: "", minStock: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchProducts = async () => {
    try {
      const data = await api.products.list(searchQuery || undefined);
      setProducts(data);
    } catch (e: any) {
      showError("خطأ: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [searchQuery]);

  const lowStockProducts = products.filter((p) => p.current_stock <= p.min_stock);
  const totalStockValue = products.reduce((sum, p) => sum + p.current_stock * p.cost_price, 0);
  const totalSellingValue = products.reduce((sum, p) => sum + p.current_stock * p.selling_price, 0);

  const resetForm = () => {
    setFormData({ name: "", category: "", unit: "قطعة", costPrice: "", sellingPrice: "", currentStock: "", minStock: "" });
    setEditingProduct(null);
    setErrors({});
  };

  const openEdit = (product: ApiProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name, category: product.category, unit: product.unit,
      costPrice: product.cost_price.toString(), sellingPrice: product.selling_price.toString(),
      currentStock: product.current_stock.toString(), minStock: product.min_stock.toString(),
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "اسم المنتج مطلوب";
    if (!formData.category.trim()) newErrors.category = "التصنيف مطلوب";
    if (!formData.costPrice || Number(formData.costPrice) <= 0) newErrors.costPrice = "سعر التكلفة غير صحيح";
    if (!formData.sellingPrice || Number(formData.sellingPrice) <= 0) newErrors.sellingPrice = "سعر البيع غير صحيح";
    if (!formData.currentStock || Number(formData.currentStock) < 0) newErrors.currentStock = "الرصيد مطلوب";
    if (!formData.minStock || Number(formData.minStock) < 0) newErrors.minStock = "الحد الأدنى مطلوب";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const data = {
      name: formData.name.trim(), category: formData.category.trim(), unit: formData.unit.trim() || "قطعة",
      costPrice: Number(formData.costPrice), sellingPrice: Number(formData.sellingPrice),
      currentStock: Number(formData.currentStock), minStock: Number(formData.minStock),
    };
    try {
      if (editingProduct) {
        await api.products.update(editingProduct.id, data);
        showSuccess("✅ تم تعديل المنتج بنجاح");
      } else {
        await api.products.create(data);
        showSuccess("✅ تم إضافة المنتج بنجاح");
      }
      fetchProducts();
    } catch (e: any) {
      showError("خطأ: " + e.message);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: number) => {
    try {
      await api.products.delete(id);
      showSuccess("✅ تم حذف المنتج");
      fetchProducts();
    } catch (e: any) {
      showError("خطأ: " + e.message);
    }
  };

  const stockLevel = (product: ApiProduct) => {
    if (product.current_stock <= 0) return { label: "نفذ", color: "bg-rose-100 text-rose-700" };
    if (product.current_stock <= product.min_stock) return { label: "منخفض", color: "bg-amber-100 text-amber-700" };
    return { label: "متوفر", color: "bg-emerald-100 text-emerald-700" };
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="relative">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full opacity-20 blur-xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Package className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">المنتجات</h1>
              <p className="text-slate-500 mt-1">إدارة المخازن والمنتجات</p>
            </div>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/30 h-12 px-6 active:scale-[0.97]">
              <Plus className="h-5 w-5" />
              منتج جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-500" />
                {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
              </DialogTitle>
              <DialogDescription>{editingProduct ? "تعديل بيانات المنتج" : "أدخل بيانات المنتج لإضافته إلى المخزن"}</DialogDescription>
            </DialogHeader>
            <div className="space-y-5 px-8 pb-2">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-600">اسم المنتج</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="مثال: ثلاجة سامسونج 14 قدم" className={cn(errors.name && "border-red-300")} />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-600">التصنيف</Label>
                <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="مثال: أجهزة كهربائية" className={cn(errors.category && "border-red-300")} />
                {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <p className="text-xs font-semibold text-slate-400 tracking-wider">الأسعار</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-slate-600">سعر التكلفة</Label>
                    <Input type="number" value={formData.costPrice} onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })} placeholder="0" className={cn(errors.costPrice && "border-red-300")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-slate-600">سعر البيع</Label>
                    <Input type="number" value={formData.sellingPrice} onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })} placeholder="0" className={cn(errors.sellingPrice && "border-red-300")} />
                  </div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <p className="text-xs font-semibold text-slate-400 tracking-wider">المخزون</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-slate-600">الرصيد الحالي</Label>
                    <Input type="number" value={formData.currentStock} onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })} placeholder="0" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-slate-600">الحد الأدنى</Label>
                    <Input type="number" value={formData.minStock} onChange={(e) => setFormData({ ...formData, minStock: e.target.value })} placeholder="0" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-600">الوحدة</Label>
                  <Input value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} placeholder="قطعة" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2 px-8 pb-8 justify-end">
              <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }} className="rounded-xl h-11 px-6 border-slate-200 text-slate-600 hover:bg-slate-50">إلغاء</Button>
              <Button onClick={handleSave} className="rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 h-11 px-8 shadow-lg shadow-orange-500/20 gap-2">
                <Sparkles className="h-4 w-4" />
                {editingProduct ? "تحديث" : "حفظ المنتج"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 bg-white/70 backdrop-blur-sm"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-md flex items-center justify-center"><Box className="h-6 w-6 text-white" /></div><div><p className="text-sm text-slate-500">إجمالي المنتجات</p><p className="font-bold text-xl text-slate-800">{products.length}</p></div></div></CardContent></Card>
        <Card className="border-0 bg-white/70 backdrop-blur-sm"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md flex items-center justify-center"><Warehouse className="h-6 w-6 text-white" /></div><div><p className="text-sm text-slate-500">رصيد المخزن</p><p className="font-bold text-xl text-slate-800">{totalStockValue.toLocaleString()} ج.م</p></div></div></CardContent></Card>
        <Card className="border-0 bg-white/70 backdrop-blur-sm"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md flex items-center justify-center"><TrendingUp className="h-6 w-6 text-white" /></div><div><p className="text-sm text-slate-500">قيمة المبيعات</p><p className="font-bold text-xl text-slate-800">{totalSellingValue.toLocaleString()} ج.م</p></div></div></CardContent></Card>
        <Card className="border-0 bg-white/70 backdrop-blur-sm"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-md flex items-center justify-center"><AlertTriangle className="h-6 w-6 text-white" /></div><div><p className="text-sm text-slate-500">منتجات منخفضة</p><p className="font-bold text-xl text-amber-600">{lowStockProducts.length}</p></div></div></CardContent></Card>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800"><strong>تنبيه:</strong> هناك {lowStockProducts.length} منتجات وصلت للحد الأدنى أو أقل.</p>
        </div>
      )}

      <div className="relative mb-6">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input type="text" placeholder="بحث باسم المنتج أو التصنيف..." className="pr-12 rounded-2xl h-12" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute left-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors text-slate-500"><X className="h-4 w-4" /></button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 text-violet-500 animate-spin" /></div>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => {
            const level = stockLevel(product);
            const profit = product.selling_price - product.cost_price;
            const profitPercent = product.cost_price > 0 ? Math.round((profit / product.cost_price) * 100) : 0;
            return (
              <Card key={product.id} className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden hover-lift">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shadow-md flex-shrink-0"><Package className="h-7 w-7" /></div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-800">{product.name}</h3>
                          <Badge className={cn("rounded-lg border-0", level.color)}>{level.label}</Badge>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{product.category}</p>
                        <div className="flex flex-wrap gap-3 mt-2">
                          <span className="text-xs">التكلفة: {product.cost_price.toLocaleString()} ج.م</span>
                          <span className="text-xs text-emerald-700">البيع: {product.selling_price.toLocaleString()} ج.م</span>
                          <span className="text-xs text-blue-700">الربح: {profit.toLocaleString()} ج.م ({profitPercent}%)</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <p className="text-sm text-slate-500">الرصيد</p>
                        <p className={cn("text-xl font-bold", product.current_stock <= product.min_stock ? "text-amber-600" : "text-slate-800")}>{product.current_stock} <span className="text-sm font-normal text-slate-500">{product.unit}</span></p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl"><MoreHorizontal className="h-5 w-5 text-slate-500" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem onClick={() => openEdit(product)} className="cursor-pointer rounded-lg"><Edit className="h-4 w-4 ml-2" />تعديل</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(product.id)} className="cursor-pointer rounded-lg text-red-600 focus:text-red-600"><Trash2 className="h-4 w-4 ml-2" />حذف</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100/80">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1"><span>الحد الأدنى: {product.min_stock}</span><span>الرصيد الحالي: {product.current_stock}</span></div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-500", product.current_stock <= 0 ? "bg-rose-500" : product.current_stock <= product.min_stock ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${Math.min(100, (product.current_stock / (product.min_stock * 2 || 1)) * 100)}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {products.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4"><Package className="h-10 w-10 text-slate-300" /></div>
              <h3 className="text-lg font-bold text-slate-600 mb-2">لا توجد منتجات</h3>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default Products;
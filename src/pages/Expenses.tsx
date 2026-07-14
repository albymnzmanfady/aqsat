import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ExpenseForm from "@/components/ExpenseForm";
import { api, ApiExpense, ApiExpenseCategory } from "@/lib/api";
import { showSuccess, showError } from "@/utils/toast";
import {
  Receipt, Search, Plus, Sparkles, MoreHorizontal, Edit, Trash2, Loader2, Calendar, Tag, DollarSign, Image,
} from "lucide-react";

const Expenses = () => {
  const [expenses, setExpenses] = useState<ApiExpense[]>([]);
  const [categories, setCategories] = useState<ApiExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<number | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ApiExpense | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [expData, catData] = await Promise.all([
        api.expenses.list(searchQuery || undefined, filterCategory || undefined),
        api.expenseCategories.list(),
      ]);
      setExpenses(expData);
      setCategories(catData);
    } catch (e: any) {
      showError("خطأ: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, filterCategory]);

  const handleSaveExpense = async (data: any) => {
    try {
      if (editingExpense) {
        await api.expenses.update(editingExpense.id, data);
        showSuccess("✅ تم تعديل المصروف بنجاح");
      } else {
        await api.expenses.create(data);
        showSuccess("✅ تم إضافة المصروف بنجاح");
      }
      fetchData();
    } catch (e: any) {
      showError("خطأ: " + e.message);
    }
    setIsDialogOpen(false);
    setEditingExpense(null);
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      await api.expenses.delete(id);
      showSuccess("✅ تم حذف المصروف");
      fetchData();
    } catch (e: any) {
      showError("خطأ: " + e.message);
    }
    setDeleteConfirmId(null);
  };

  const getCategoryName = (categoryId: number) => categories.find((c) => c.id === categoryId)?.name || "أخرى";
  const getCategoryColor = (categoryId: number) => categories.find((c) => c.id === categoryId)?.color || "bg-slate-100 text-slate-700";

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="relative">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full opacity-20 blur-xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/30">
              <Receipt className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">المصروفات</h1>
              <p className="text-slate-500 mt-1">تسجيل وتتبع المصروفات اليومية</p>
            </div>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingExpense(null); }}>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-lg shadow-rose-500/30 h-12 px-6"
          >
            <Plus className="h-5 w-5" />
            مصروف جديد
          </Button>
          <DialogContent className="sm:max-w-[500px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2 justify-start">
                <Sparkles className="h-5 w-5 text-rose-500" />
                {editingExpense ? "تعديل المصروف" : "مصروف جديد"}
              </DialogTitle>
              <DialogDescription>أدخل بيانات المصروف</DialogDescription>
            </DialogHeader>
            <ExpenseForm
              categories={categories}
              onSave={handleSaveExpense}
              onCancel={() => { setIsDialogOpen(false); setEditingExpense(null); }}
              initialData={editingExpense}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="text"
            placeholder="بحث..."
            className="pr-12 rounded-2xl h-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="rounded-2xl h-12 border border-slate-200 bg-white px-4 text-sm"
          value={filterCategory || ""}
          onChange={(e) => setFilterCategory(e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">جميع الفئات</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {expenses.length === 0 && (
          <div className="text-center py-16">
            <Receipt className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-600">لا توجد مصروفات</h3>
          </div>
        )}

        {expenses.map((exp) => (
          <Card key={exp.id} className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden hover-lift">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
                    <Receipt className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{exp.description}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge className={cn("rounded-lg border-0", getCategoryColor(exp.category_id))}>
                        {getCategoryName(exp.category_id)}
                      </Badge>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {exp.date}
                      </span>
                      {exp.receipt_image && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Image className="h-3 w-3" />
                          إيصال
                        </span>
                      )}
                      {exp.note && (
                        <span className="text-xs text-slate-400">{exp.note}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <p className="font-bold text-lg text-rose-600">{exp.amount.toLocaleString()} ج.م</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl">
                        <MoreHorizontal className="h-5 w-5 text-slate-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem onClick={() => { setEditingExpense(exp); setIsDialogOpen(true); }} className="cursor-pointer rounded-lg">
                        <Edit className="h-4 w-4 ml-2" /> تعديل
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteConfirmId(exp.id)} className="cursor-pointer rounded-lg text-red-600">
                        <Trash2 className="h-4 w-4 ml-2" /> حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <DialogContent className="sm:max-w-[350px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2 text-red-600"><Trash2 className="h-5 w-5" />تأكيد الحذف</DialogTitle>
            <DialogDescription>هل أنت متأكد؟ لا يمكن التراجع.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end px-8 pb-6">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="rounded-xl h-11">إلغاء</Button>
            <Button variant="destructive" onClick={() => deleteConfirmId !== null && handleDeleteExpense(deleteConfirmId)} className="rounded-xl h-11">حذف</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Expenses;
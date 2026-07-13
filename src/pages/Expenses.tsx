"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AnimatedCounter from "@/components/AnimatedCounter";
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
import ExpenseForm from "@/components/ExpenseForm";
import { initialExpenses, initialExpenseCategories } from "@/data/mockData";
import { Expense, ExpenseCategory } from "@/types";
import { showSuccess } from "@/utils/toast";
import {
  Receipt,
  Plus,
  Search,
  Sparkles,
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  FileText,
  Image as ImageIcon,
  Wallet,
  TrendingDown,
  Filter,
  PieChart,
  Coins,
} from "lucide-react";
import { Link } from "react-router-dom";

const categoryIcons: Record<string, any> = {
  "bg-cyan-100 text-cyan-700": "🏢",
  "bg-yellow-100 text-yellow-700": "💡",
  "bg-green-100 text-green-700": "👥",
  "bg-orange-100 text-orange-700": "🔧",
  "bg-purple-100 text-purple-700": "📢",
  "bg-slate-100 text-slate-700": "📋",
  "bg-gray-100 text-gray-700": "📌",
};

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [categories] = useState<ExpenseCategory[]>(initialExpenseCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filterCategory, setFilterCategory] = useState<number | null>(null);

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch = e.description.includes(searchQuery) || e.note?.includes(searchQuery);
    const matchesCategory = filterCategory === null || e.categoryId === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);

  const handleSave = (data: any) => {
    const now = new Date().toISOString().split("T")[0];
    if (editingExpense) {
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === editingExpense.id
            ? { ...e, ...data, createdAt: e.createdAt }
            : e
        )
      );
      showSuccess("✅ تم تعديل المصروف بنجاح");
    } else {
      const newExpense: Expense = {
        id: Math.max(0, ...expenses.map((e) => e.id)) + 1,
        ...data,
        createdAt: now,
      };
      setExpenses((prev) => [newExpense, ...prev]);
      showSuccess("✅ تم إضافة المصروف بنجاح");
    }
    setIsDialogOpen(false);
    setEditingExpense(null);
  };

  const handleDelete = (id: number) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showSuccess("✅ تم حذف المصروف");
  };

  const openEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsDialogOpen(true);
  };

  const getCategory = (id: number) => categories.find((c) => c.id === id);

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="relative">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full opacity-20 blur-xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/30">
              <Receipt className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">المصروفات</h1>
              <p className="text-slate-500 mt-1">تسجيل ومتابعة المصروفات اليومية</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link to="/expense-reports">
            <Button variant="outline" className="rounded-2xl h-12 px-6 gap-2 border-rose-200 hover:bg-rose-50 active:scale-[0.97]">
              <PieChart className="h-5 w-5 text-rose-500" />
              التقارير
            </Button>
          </Link>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) setEditingExpense(null);
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-lg shadow-rose-500/30 h-12 px-6 active:scale-[0.97]">
                <Plus className="h-5 w-5" />
                مصروف جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-rose-500" />
                  {editingExpense ? "تعديل مصروف" : "إضافة مصروف جديد"}
                </DialogTitle>
                <DialogDescription>
                  {editingExpense ? "تعديل بيانات المصروف" : "أدخل بيانات المصروف اليومي"}
                </DialogDescription>
              </DialogHeader>
              <ExpenseForm
                categories={categories}
                onSave={handleSave}
                onCancel={() => { setIsDialogOpen(false); setEditingExpense(null); }}
                initialData={editingExpense}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 bg-white/70 backdrop-blur-sm hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-md flex items-center justify-center">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">إجمالي المصروفات</p>
                <p className="font-bold text-xl text-slate-800">
                  <AnimatedCounter value={totalExpenses} duration={800} formatter={(v) => v.toLocaleString()} /> ج.م
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white/70 backdrop-blur-sm hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-md flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">هذا الشهر</p>
                <p className="font-bold text-xl text-slate-800">
                  <AnimatedCounter value={monthTotal} duration={800} formatter={(v) => v.toLocaleString()} /> ج.م
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white/70 backdrop-blur-sm hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">عدد العمليات</p>
                <p className="font-bold text-xl text-slate-800">
                  <AnimatedCounter value={expenses.length} duration={800} />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white/70 backdrop-blur-sm hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">متوسط المصروف</p>
                <p className="font-bold text-xl text-slate-800">
                  {expenses.length > 0 ? (
                    <AnimatedCounter value={Math.round(totalExpenses / expenses.length)} duration={800} formatter={(v) => v.toLocaleString()} />
                  ) : 0} ج.م
                </p>
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
            placeholder="بحث في المصروفات..."
            className="pr-12 rounded-2xl bg-white/70 backdrop-blur-sm border-slate-200/50 h-12 shadow-sm focus:shadow-md transition-shadow"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterCategory(null)}
            className={cn(
              "rounded-xl h-10 px-4 active:scale-[0.97]",
              filterCategory === null && "bg-gradient-to-r from-slate-700 to-slate-800 text-white"
            )}
          >
            الكل
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={filterCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterCategory(cat.id === filterCategory ? null : cat.id)}
              className={cn(
                "rounded-xl h-10 px-4 active:scale-[0.97]",
                filterCategory === cat.id && "bg-gradient-to-r from-slate-700 to-slate-800 text-white"
              )}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Expenses List */}
      <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
        <div className="divide-y divide-slate-100/80">
          {filteredExpenses.map((expense, index) => {
            const category = getCategory(expense.categoryId);
            const catColor = category?.color || "bg-slate-100 text-slate-700";

            return (
              <div
                key={expense.id}
                className="stagger-item p-4 hover:bg-slate-50/50 transition-all hover-lift"
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center text-lg shadow-md",
                      catColor.split(" ")[0]
                    )}>
                      {categoryIcons[catColor] || "📄"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-800">{expense.description}</h3>
                        {expense.receiptImage && (
                          <ImageIcon className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {category && (
                          <Badge className={cn("rounded-lg border-0 text-xs", catColor)}>
                            {category.name}
                          </Badge>
                        )}
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {expense.date}
                        </span>
                        {expense.note && (
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {expense.note}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="font-bold text-rose-600">-{expense.amount.toLocaleString()} ج.م</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl active:scale-90">
                          <MoreHorizontal className="h-5 w-5 text-slate-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => openEdit(expense)} className="cursor-pointer rounded-lg">
                          <Edit className="h-4 w-4 ml-2" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(expense.id)}
                          className="cursor-pointer rounded-lg text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 ml-2" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredExpenses.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Receipt className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-600 mb-2">لا توجد مصروفات</h3>
            <p className="text-slate-500">لم يتم العثور على مصروفات مطابقة</p>
          </div>
        )}
      </Card>
    </Layout>
  );
};

export default Expenses;
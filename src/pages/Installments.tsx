"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  CreditCard, 
  Plus, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Calendar
} from "lucide-react";

interface Installment {
  id: number;
  customerId: number;
  customerName: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: "paid" | "pending" | "overdue";
  installmentNumber: number;
  totalInstallments: number;
}

const initialInstallments: Installment[] = [
  { id: 1, customerId: 1, customerName: "أحمد محمد", amount: 500, dueDate: "2024-01-15", paidDate: "2024-01-15", status: "paid", installmentNumber: 8, totalInstallments: 12 },
  { id: 2, customerId: 1, customerName: "أحمد محمد", amount: 500, dueDate: "2024-02-15", paidDate: null, status: "pending", installmentNumber: 9, totalInstallments: 12 },
  { id: 3, customerId: 2, customerName: "سارة علي", amount: 500, dueDate: "2024-01-20", paidDate: "2024-01-20", status: "paid", installmentNumber: 12, totalInstallments: 24 },
  { id: 4, customerId: 2, customerName: "سارة علي", amount: 500, dueDate: "2024-02-20", paidDate: null, status: "pending", installmentNumber: 13, totalInstallments: 24 },
  { id: 5, customerId: 4, customerName: "فاطمة أحمد", amount: 500, dueDate: "2024-01-10", paidDate: null, status: "overdue", installmentNumber: 5, totalInstallments: 18 },
  { id: 6, customerId: 5, customerName: "عمر خالد", amount: 500, dueDate: "2024-01-25", paidDate: "2024-01-24", status: "paid", installmentNumber: 10, totalInstallments: 12 },
  { id: 7, customerId: 6, customerName: "نورا سعيد", amount: 500, dueDate: "2024-01-18", paidDate: null, status: "pending", installmentNumber: 24, totalInstallments: 36 },
  { id: 8, customerId: 6, customerName: "نورا سعيد", amount: 500, dueDate: "2023-12-18", paidDate: null, status: "overdue", installmentNumber: 23, totalInstallments: 36 },
];

const Installments = () => {
  const [installments] = useState<Installment[]>(initialInstallments);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "pending" | "overdue">("all");

  const filteredInstallments = installments.filter(installment => {
    const matchesSearch = installment.customerName.includes(searchQuery);
    const matchesFilter = filterStatus === "all" || installment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case "pending": return <Clock className="h-5 w-5 text-amber-500" />;
      case "overdue": return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-emerald-100 text-emerald-700";
      case "pending": return "bg-amber-100 text-amber-700";
      case "overdue": return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid": return "مدفوع";
      case "pending": return "قيد الانتظار";
      case "overdue": return "متأخر";
      default: return status;
    }
  };

  const paidCount = installments.filter(i => i.status === "paid").length;
  const pendingCount = installments.filter(i => i.status === "pending").length;
  const overdueCount = installments.filter(i => i.status === "overdue").length;
  const totalAmount = installments.reduce((sum, i) => sum + i.amount, 0);
  const paidAmount = installments.filter(i => i.status === "paid").reduce((sum, i) => sum + i.amount, 0);

  return (
    <Layout>
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              إدارة الأقساط
            </h1>
            <p className="text-slate-600 mt-2">تتبع وإدارة جميع أقساط العملاء</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                تسجيل قسط جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl">تسجيل قسط جديد</DialogTitle>
                <DialogDescription>
                  سجّل دفعة قسط جديدة لعميل
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="customer">العميل</Label>
                  <Input id="customer" placeholder="اختر العميل" className="rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">المبلغ</Label>
                    <Input id="amount" type="number" placeholder="0" className="rounded-xl" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">تاريخ الدفع</Label>
                    <Input id="date" type="date" className="rounded-xl" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Input id="notes" placeholder="ملاحظات إضافية (اختياري)" className="rounded-xl" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">
                  إلغاء
                </Button>
                <Button onClick={() => setIsDialogOpen(false)} className="rounded-xl">
                  تسجيل القسط
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="rounded-2xl border-slate-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">إجمالي الأقساط</p>
                  <p className="font-bold text-lg">{installments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl border-emerald-100 bg-emerald-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-emerald-600">مدفوعة</p>
                  <p className="font-bold text-lg text-emerald-700">{paidCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl border-amber-100 bg-amber-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-amber-600">قيد الانتظار</p>
                  <p className="font-bold text-lg text-amber-700">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl border-red-100 bg-red-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-red-600">متأخرة</p>
                  <p className="font-bold text-lg text-red-700">{overdueCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary */}
        <Card className="mb-8 rounded-2xl border-slate-100">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">المبلغ المحصّل</p>
                <p className="text-2xl font-bold text-emerald-600">{paidAmount.toLocaleString()} ج.م</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-slate-200" />
              <div>
                <p className="text-sm text-slate-600 mb-1">إجمالي المبالغ</p>
                <p className="text-2xl font-bold text-slate-800">{totalAmount.toLocaleString()} ج.م</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-slate-200" />
              <div>
                <p className="text-sm text-slate-600 mb-1">نسبة التحصيل</p>
                <p className="text-2xl font-bold text-primary">{Math.round((paidAmount / totalAmount) * 100)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="بحث باسم العميل..."
              className="pr-10 rounded-xl bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant={filterStatus === "all" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilterStatus("all")}
              className="rounded-xl"
            >
              الكل
            </Button>
            <Button 
              variant={filterStatus === "paid" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilterStatus("paid")}
              className="rounded-xl"
            >
              مدفوع
            </Button>
            <Button 
              variant={filterStatus === "pending" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilterStatus("pending")}
              className="rounded-xl"
            >
              قيد الانتظار
            </Button>
            <Button 
              variant={filterStatus === "overdue" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilterStatus("overdue")}
              className="rounded-xl"
            >
              متأخر
            </Button>
          </div>
        </div>

        {/* Installments List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredInstallments.map((installment) => (
              <div key={installment.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(installment.status)}
                    <div>
                      <h3 className="font-semibold text-slate-800">{installment.customerName}</h3>
                      <p className="text-sm text-slate-500">
                        القسط {installment.installmentNumber} من {installment.totalInstallments}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg text-slate-800">{installment.amount.toLocaleString()} ج.م</p>
                    <div className="flex items-center gap-2 justify-end">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      <span className="text-xs text-slate-500">
                        {installment.paidDate || installment.dueDate}
                      </span>
                      <Badge className={`${getStatusColor(installment.status)} text-xs`}>
                        {getStatusText(installment.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredInstallments.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600">لا توجد أقساط</h3>
              <p className="text-slate-500">لم يتم العثور على أقساط مطابقة</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Installments;
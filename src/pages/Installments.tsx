"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Plus, Search, CheckCircle, Clock, Calendar, Sparkles, Wallet, TrendingUp, BarChart3 } from "lucide-react";
import { initialInstallments, initialContracts } from "@/data/mockData";
import { Installment, Contract } from "@/types";
import { showSuccess } from "@/utils/toast";

const monthNames = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

const Installments = () => {
  const [installments, setInstallments] = useState<Installment[]>(initialInstallments);
  const [contracts] = useState<Contract[]>(initialContracts);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "pending">("all");
  const [selectedContractId, setSelectedContractId] = useState<string>("");
  const [selectedInstallmentNumber, setSelectedInstallmentNumber] = useState<string>("");

  const filteredInstallments = installments.filter((installment) => {
    const contract = contracts.find((c) => c.id === installment.contractId);
    const customerName = contract?.customerName || "";
    const matchesSearch = customerName.includes(searchQuery);
    const matchesFilter = filterStatus === "all" ||
      (filterStatus === "paid" && installment.isPaid) ||
      (filterStatus === "pending" && !installment.isPaid);
    return matchesSearch && matchesFilter;
  });

  const paidCount = installments.filter((i) => i.isPaid).length;
  const pendingCount = installments.filter((i) => !i.isPaid).length;
  const totalAmount = installments.reduce((sum, i) => sum + i.amount, 0);
  const paidAmount = installments.filter((i) => i.isPaid).reduce((sum, i) => sum + i.amount, 0);
  const collectionRate = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  const activeContracts = contracts.filter((c) => c.status === "active");

  const handlePayment = () => {
    if (!selectedContractId || !selectedInstallmentNumber) {
      return;
    }

    setInstallments((prev) =>
      prev.map((inst) => {
        if (inst.contractId === Number(selectedContractId) && inst.number === Number(selectedInstallmentNumber)) {
          return {
            ...inst,
            isPaid: true,
            paidDate: new Date().toISOString().split("T")[0],
          };
        }
        return inst;
      })
    );

    showSuccess("تم تسجيل القسط بنجاح");
    setIsDialogOpen(false);
    setSelectedContractId("");
    setSelectedInstallmentNumber("");
  };

  const getContractInstallments = (contractId: number) => {
    return installments.filter((i) => i.contractId === contractId && !i.isPaid);
  };

  const stats = [
    {
      title: "إجمالي الأقساط",
      value: installments.length,
      icon: CreditCard,
      color: "from-slate-500 to-gray-600",
    },
    {
      title: "مدفوعة",
      value: paidCount,
      icon: CheckCircle,
      color: "from-emerald-500 to-teal-500",
    },
    {
      title: "قيد الانتظار",
      value: pendingCount,
      icon: Clock,
      color: "from-amber-500 to-orange-500",
    },
    {
      title: "نسبة التحصيل",
      value: `${collectionRate}%`,
      icon: TrendingUp,
      color: "from-violet-500 to-purple-500",
    },
  ];

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="relative">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full opacity-20 blur-xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <CreditCard className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">تسجيل الأقساط</h1>
              <p className="text-slate-500 mt-1">تسجيل ومتابعة سداد أقساط العملاء</p>
            </div>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30 h-12 px-6">
              <Plus className="h-5 w-5" />
              تسجيل قسط
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                تسجيل قسط جديد
              </DialogTitle>
              <DialogDescription>سجّل دفعة قسط جديدة لعميل</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="font-medium">العقد</Label>
                <Select value={selectedContractId} onValueChange={(value) => {
                  setSelectedContractId(value);
                  setSelectedInstallmentNumber("");
                }}>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue placeholder="اختر العقد" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeContracts.map((contract) => (
                      <SelectItem key={contract.id} value={contract.id.toString()}>
                        {contract.customerName} - {contract.productType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedContractId && (
                <div className="grid gap-2">
                  <Label className="font-medium">رقم القسط</Label>
                  <Select value={selectedInstallmentNumber} onValueChange={setSelectedInstallmentNumber}>
                    <SelectTrigger className="rounded-xl h-12">
                      <SelectValue placeholder="اختر القسط" />
                    </SelectTrigger>
                    <SelectContent>
                      {getContractInstallments(Number(selectedContractId)).map((inst) => (
                        <SelectItem key={inst.number} value={inst.number.toString()}>
                          القسط {inst.number} - {inst.day}/{inst.month}/{inst.year} - {inst.amount} ج.م
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-11">
                إلغاء
              </Button>
              <Button
                onClick={handlePayment}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 h-11"
                disabled={!selectedContractId || !selectedInstallmentNumber}
              >
                تسجيل القسط
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 bg-white/70 backdrop-blur-sm hover-lift overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-md",
                  stat.color
                )}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{stat.title}</p>
                  <p className="font-bold text-xl text-slate-800">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Financial Summary */}
      <Card className="mb-8 border-0 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Wallet className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg">الملخص المالي</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-sm text-white/80 mb-1">المبلغ المحصّل</p>
              <p className="text-2xl font-bold">{paidAmount.toLocaleString()} ج.م</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-sm text-white/80 mb-1">إجمالي المبالغ</p>
              <p className="text-2xl font-bold">{totalAmount.toLocaleString()} ج.م</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-sm text-white/80 mb-1">المتبقي</p>
              <p className="text-2xl font-bold">{(totalAmount - paidAmount).toLocaleString()} ج.م</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="text"
            placeholder="بحث باسم العميل..."
            className="pr-12 rounded-2xl bg-white/70 backdrop-blur-sm border-slate-200/50 h-12 shadow-sm focus:shadow-md transition-shadow"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("all")}
            className={cn(
              "rounded-xl h-10 px-4",
              filterStatus === "all"
                ? "bg-gradient-to-r from-slate-700 to-slate-800 text-white"
                : "border-slate-200"
            )}
          >
            الكل
          </Button>
          <Button
            variant={filterStatus === "paid" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("paid")}
            className={cn(
              "rounded-xl h-10 px-4",
              filterStatus === "paid"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                : "border-slate-200"
            )}
          >
            مدفوع
          </Button>
          <Button
            variant={filterStatus === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("pending")}
            className={cn(
              "rounded-xl h-10 px-4",
              filterStatus === "pending"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                : "border-slate-200"
            )}
          >
            قيد الانتظار
          </Button>
        </div>
      </div>

      {/* Installments List */}
      <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
        <div className="divide-y divide-slate-100/80">
          {filteredInstallments.map((installment) => {
            const contract = contracts.find((c) => c.id === installment.contractId);
            return (
              <div key={installment.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center",
                      installment.isPaid
                        ? "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/25"
                        : "bg-gradient-to-br from-amber-500 to-orange-500 shadow-md shadow-amber-500/25"
                    )}>
                      {installment.isPaid ? (
                        <CheckCircle className="h-6 w-6 text-white" />
                      ) : (
                        <Clock className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{contract?.customerName || "عميل"}</h3>
                      <p className="text-sm text-slate-500">
                        القسط {installment.number} من {contract?.numberOfReceipts || "?"}
                        {contract && ` - ${contract.productType}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-800">{installment.amount.toLocaleString()} ج.م</p>
                    <div className="flex items-center gap-2 justify-end mt-1">
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {installment.day}/{installment.month}/{installment.year}
                      </span>
                      <Badge className={cn(
                        "rounded-lg text-white border-0",
                        installment.isPaid
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                          : "bg-gradient-to-r from-amber-500 to-orange-500"
                      )}>
                        {installment.isPaid ? "مدفوع" : "قيد الانتظار"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredInstallments.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-600 mb-2">لا توجد أقساط</h3>
            <p className="text-slate-500">لم يتم العثور على أقساط مطابقة</p>
          </div>
        )}
      </Card>
    </Layout>
  );
};

export default Installments;
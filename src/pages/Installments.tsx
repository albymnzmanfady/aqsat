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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Plus, Search, CheckCircle, Clock, AlertCircle, Calendar } from "lucide-react";
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
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "pending" | "overdue">("all");
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

  const getStatusIcon = (isPaid: boolean) => {
    if (isPaid) {
      return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    }
    return <Clock className="h-5 w-5 text-amber-500" />;
  };

  const getStatusColor = (isPaid: boolean) => {
    return isPaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700";
  };

  const getStatusText = (isPaid: boolean) => {
    return isPaid ? "مدفوع" : "قيد الانتظار";
  };

  const paidCount = installments.filter((i) => i.isPaid).length;
  const pendingCount = installments.filter((i) => !i.isPaid).length;
  const totalAmount = installments.reduce((sum, i) => sum + i.amount, 0);
  const paidAmount = installments.filter((i) => i.isPaid).reduce((sum, i) => sum + i.amount, 0);

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

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            تسجيل الأقساط
          </h1>
          <p className="text-slate-500 mt-2 mr-13">تسجيل ومتابعة سداد أقساط العملاء</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/25">
              <Plus className="h-4 w-4" />
              تسجيل قسط
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">تسجيل قسط جديد</DialogTitle>
              <DialogDescription>سجّل دفعة قسط جديدة لعميل</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>العقد</Label>
                <Select value={selectedContractId} onValueChange={(value) => {
                  setSelectedContractId(value);
                  setSelectedInstallmentNumber("");
                }}>
                  <SelectTrigger className="rounded-xl">
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
                  <Label>رقم القسط</Label>
                  <Select value={selectedInstallmentNumber} onValueChange={setSelectedInstallmentNumber}>
                    <SelectTrigger className="rounded-xl">
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
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">
                إلغاء
              </Button>
              <Button 
                onClick={handlePayment} 
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                disabled={!selectedContractId || !selectedInstallmentNumber}
              >
                تسجيل القسط
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-slate-200 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">إجمالي الأقساط</p>
                <p className="font-bold text-xl text-slate-800">{installments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-emerald-600">مدفوعة</p>
                <p className="font-bold text-xl text-emerald-700">{paidCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-amber-600">قيد الانتظار</p>
                <p className="font-bold text-xl text-amber-700">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600">نسبة التحصيل</p>
                <p className="font-bold text-xl text-blue-700">
                  {totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card className="mb-6 border-slate-200 bg-white">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-right">
              <p className="text-sm text-slate-500 mb-1">المبلغ المحصّل</p>
              <p className="text-2xl font-bold text-emerald-600">{paidAmount.toLocaleString()} ج.م</p>
            </div>
            <div className="hidden sm:block w-px h-12 bg-slate-200" />
            <div className="text-center sm:text-right">
              <p className="text-sm text-slate-500 mb-1">إجمالي المبالغ</p>
              <p className="text-2xl font-bold text-slate-800">{totalAmount.toLocaleString()} ج.م</p>
            </div>
            <div className="hidden sm:block w-px h-12 bg-slate-200" />
            <div className="text-center sm:text-right">
              <p className="text-sm text-slate-500 mb-1">المتبقي</p>
              <p className="text-2xl font-bold text-amber-600">{(totalAmount - paidAmount).toLocaleString()} ج.م</p>
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
            className="pr-10 rounded-xl bg-white border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("all")}
            className={`rounded-xl ${filterStatus === "all" ? "bg-slate-800 hover:bg-slate-900" : "border-slate-200"}`}
          >
            الكل
          </Button>
          <Button
            variant={filterStatus === "paid" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("paid")}
            className={`rounded-xl ${filterStatus === "paid" ? "bg-emerald-600 hover:bg-emerald-700" : "border-slate-200"}`}
          >
            مدفوع
          </Button>
          <Button
            variant={filterStatus === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("pending")}
            className={`rounded-xl ${filterStatus === "pending" ? "bg-amber-600 hover:bg-amber-700" : "border-slate-200"}`}
          >
            قيد الانتظار
          </Button>
        </div>
      </div>

      {/* Installments List */}
      <Card className="border-slate-200 bg-white">
        <div className="divide-y divide-slate-100">
          {filteredInstallments.map((installment) => {
            const contract = contracts.find((c) => c.id === installment.contractId);
            return (
              <div key={installment.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        installment.isPaid ? "bg-emerald-100" : "bg-amber-100"
                      }`}
                    >
                      {getStatusIcon(installment.isPaid)}
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-800">{contract?.customerName || "عميل"}</h3>
                      <p className="text-sm text-slate-500">
                        القسط {installment.number} من {contract?.numberOfReceipts || "?"}
                        {contract && ` - ${contract.productType}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-800">{installment.amount.toLocaleString()} ج.م</p>
                    <div className="flex items-center gap-2 justify-end">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      <span className="text-xs text-slate-500">
                        {installment.day}/{installment.month}/{installment.year}
                      </span>
                      <Badge className={`${getStatusColor(installment.isPaid)} text-xs`}>
                        {getStatusText(installment.isPaid)}
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
            <CreditCard className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-1">لا توجد أقساط</h3>
            <p className="text-slate-500">لم يتم العثور على أقساط مطابقة</p>
          </div>
        )}
      </Card>
    </Layout>
  );
};

export default Installments;
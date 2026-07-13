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
  DialogFooter,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { initialInstallments, initialContracts } from "@/data/mockData";
import { Installment, Contract } from "@/types";
import { showSuccess, showError } from "@/utils/toast";
import { sendWhatsAppMessage, getWhatsAppConfig, MESSAGE_TEMPLATES } from "@/components/WhatsAppService";
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Calendar,
  Sparkles,
  Wallet,
  TrendingUp,
  Send,
  Loader2,
  MoreHorizontal,
  Edit,
  Trash2,
  XCircle,
} from "lucide-react";

const InstallmentsPage = () => {
  const [installments, setInstallments] = useState<Installment[]>(initialInstallments);
  const [contracts] = useState<Contract[]>(initialContracts);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "pending" | "overdue">("all");
  const [selectedContractId, setSelectedContractId] = useState<string>("");
  const [selectedInstallmentNumber, setSelectedInstallmentNumber] = useState<string>("");
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredInstallments = installments.filter((installment) => {
    const contract = contracts.find((c) => c.id === installment.contractId);
    const customerName = contract?.customerName || "";

    if (searchQuery && !customerName.includes(searchQuery) && !contract?.productType.includes(searchQuery)) {
      return false;
    }

    const dueDate = new Date(installment.year, installment.month - 1, installment.day);
    const isOverdue = !installment.isPaid && dueDate < today;

    if (filterStatus === "paid" && !installment.isPaid) return false;
    if (filterStatus === "pending" && (installment.isPaid || isOverdue)) return false;
    if (filterStatus === "overdue" && !isOverdue) return false;

    return true;
  });

  const paidCount = installments.filter((i) => i.isPaid).length;
  const pendingCount = installments.filter((i) => !i.isPaid).length;
  const totalAmount = installments.reduce((sum, i) => sum + i.amount, 0);
  const paidAmount = installments.filter((i) => i.isPaid).reduce((sum, i) => sum + i.amount, 0);
  const collectionRate = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  const activeContracts = contracts.filter((c) => c.status === "active");

  const handlePayment = () => {
    if (!selectedContractId || !selectedInstallmentNumber) return;

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

    const installmentToPay = installments.find(
      (i) => i.contractId === Number(selectedContractId) && i.number === Number(selectedInstallmentNumber)
    );

    if (installmentToPay) {
      const contract = contracts.find((c) => c.id === installmentToPay.contractId);
      if (contract) {
        const config = getWhatsAppConfig();
        if (config.endpoint) {
          const dueDate = `${installmentToPay.day}/${installmentToPay.month}/${installmentToPay.year}`;
          sendWhatsAppMessage(
            contract.customerPhone,
            MESSAGE_TEMPLATES.installmentPaid(contract.customerName, installmentToPay.amount, dueDate, installmentToPay.number),
            config
          ).then((result) => {
            if (result.success) showSuccess(`✅ تم تسجيل القسط وإرسال إشعار للعميل ${contract.customerName}`);
          });
        } else {
          showSuccess("✅ تم تسجيل القسط بنجاح");
        }
      }
    } else {
      showSuccess("✅ تم تسجيل القسط بنجاح");
    }

    setIsDialogOpen(false);
    setSelectedContractId("");
    setSelectedInstallmentNumber("");
  };

  const handleTogglePaid = (installment: Installment) => {
    setInstallments((prev) =>
      prev.map((inst) =>
        inst.id === installment.id
          ? { ...inst, isPaid: !inst.isPaid, paidDate: inst.isPaid ? undefined : new Date().toISOString().split("T")[0] }
          : inst
      )
    );
    if (installment.isPaid) {
      showSuccess("✅ تم إلغاء تسديد القسط");
    } else {
      showSuccess("✅ تم تسديد القسط بنجاح");
    }
  };

  const handleDelete = (id: number) => {
    setInstallments((prev) => prev.filter((i) => i.id !== id));
    showSuccess("✅ تم حذف القسط");
    setDeleteConfirmId(null);
  };

  const handleSendWhatsApp = async (installment: Installment) => {
    const config = getWhatsAppConfig();
    if (!config.endpoint) {
      showError("يرجى إعداد واتساب أولاً من صفحة الإعدادات");
      return;
    }

    const contract = contracts.find((c) => c.id === installment.contractId);
    if (!contract) return;

    setSendingId(installment.id);
    const dueDate = `${installment.day}/${installment.month}/${installment.year}`;

    const dueDt = new Date(installment.year, installment.month - 1, installment.day);
    const daysOverdue = Math.floor((today.getTime() - dueDt.getTime()) / (1000 * 60 * 60 * 24));

    let message: string;
    if (installment.isPaid) {
      message = MESSAGE_TEMPLATES.installmentPaid(contract.customerName, installment.amount, dueDate, installment.number);
    } else if (daysOverdue > 0) {
      message = MESSAGE_TEMPLATES.installmentOverdue(contract.customerName, installment.amount, daysOverdue, installment.number);
    } else {
      message = MESSAGE_TEMPLATES.installmentDue(contract.customerName, installment.amount, dueDate, installment.number);
    }

    const result = await sendWhatsAppMessage(contract.customerPhone, message, config);
    if (result.success) showSuccess(`✅ تم إرسال الإشعار للعميل ${contract.customerName}`);
    else showError(result.message);
    setSendingId(null);
  };

  const getContractInstallments = (contractId: number) => {
    return installments.filter((i) => i.contractId === contractId && !i.isPaid);
  };

  const stats = [
    { title: "إجمالي الأقساط", value: installments.length, icon: CreditCard, color: "from-slate-500 to-gray-600" },
    { title: "مدفوعة", value: paidCount, icon: CheckCircle, color: "from-emerald-500 to-teal-500" },
    { title: "قيد الانتظار", value: pendingCount, icon: Clock, color: "from-amber-500 to-orange-500" },
    { title: "نسبة التحصيل", value: `${collectionRate}%`, icon: TrendingUp, color: "from-violet-500 to-purple-500" },
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
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">الأقساط</h1>
              <p className="text-slate-500 mt-1">تسجيل ومتابعة سداد الأقساط</p>
            </div>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30 h-12 px-6 active:scale-[0.97]">
              <Plus className="h-5 w-5" />
              تسجيل قسط
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                تسجيل قسط
              </DialogTitle>
              <DialogDescription>سجّل دفعة قسط جديدة لعميل</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 px-8">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-600">العقد</Label>
                <Select
                  value={selectedContractId}
                  onValueChange={(value) => {
                    setSelectedContractId(value);
                    setSelectedInstallmentNumber("");
                  }}
                >
                  <SelectTrigger className="h-12">
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
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-600">رقم القسط</Label>
                  <Select value={selectedInstallmentNumber} onValueChange={setSelectedInstallmentNumber}>
                    <SelectTrigger className="h-12">
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

            <DialogFooter className="px-8">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-11">
                إلغاء
              </Button>
              <Button
                onClick={handlePayment}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 h-11 active:scale-[0.97]"
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
          <Card key={index} className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-md", stat.color)}>
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
      <Card className="mb-8 border-0 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 text-white overflow-hidden relative hover-lift">
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
              <p className="text-2xl font-bold"><AnimatedCounter value={paidAmount} duration={800} formatter={(v) => v.toLocaleString()} /> ج.م</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-sm text-white/80 mb-1">إجمالي المبالغ</p>
              <p className="text-2xl font-bold"><AnimatedCounter value={totalAmount} duration={800} formatter={(v) => v.toLocaleString()} /> ج.م</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-sm text-white/80 mb-1">المتبقي</p>
              <p className="text-2xl font-bold"><AnimatedCounter value={totalAmount - paidAmount} duration={800} formatter={(v) => v.toLocaleString()} /> ج.م</p>
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
            placeholder="بحث باسم العميل أو المنتج..."
            className="pr-12 rounded-2xl bg-white/70 backdrop-blur-sm border-slate-200/50 h-12 shadow-sm focus:shadow-md transition-shadow"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "paid", "pending", "overdue"] as const).map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className={cn(
                "rounded-xl h-10 px-4 active:scale-[0.97]",
                filterStatus === status && {
                  all: "bg-gradient-to-r from-slate-700 to-slate-800 text-white",
                  paid: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
                  pending: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
                  overdue: "bg-gradient-to-r from-rose-500 to-pink-500 text-white",
                }[status]
              )}
            >
              {status === "all" ? "الكل" : status === "paid" ? "مدفوع" : status === "pending" ? "قيد الانتظار" : "متأخر"}
            </Button>
          ))}
        </div>
      </div>

      {/* Installments List */}
      <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
        <div className="divide-y divide-slate-100/80">
          {filteredInstallments.map((installment, index) => {
            const contract = contracts.find((c) => c.id === installment.contractId);
            const dueDate = `${installment.day}/${installment.month}/${installment.year}`;
            const dueDt = new Date(installment.year, installment.month - 1, installment.day);
            const isOverdue = !installment.isPaid && dueDt < today;

            return (
              <div
                key={installment.id}
                className="stagger-item p-4 hover:bg-slate-50/50 transition-all hover-lift"
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shadow-md",
                      installment.isPaid
                        ? "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/25"
                        : isOverdue
                        ? "bg-gradient-to-br from-rose-500 to-pink-500 shadow-rose-500/25"
                        : "bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/25"
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

                  <div className="flex items-center gap-2">
                    <div className="text-left">
                      <p className="font-bold text-slate-800">{installment.amount.toLocaleString()} ج.م</p>
                      <div className="flex items-center gap-2 justify-end mt-1">
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {dueDate}
                        </span>
                        <Badge className={cn(
                          "rounded-lg text-white border-0",
                          installment.isPaid
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                            : isOverdue
                            ? "bg-gradient-to-r from-rose-500 to-pink-500"
                            : "bg-gradient-to-r from-amber-500 to-orange-500"
                        )}>
                          {installment.isPaid ? "مدفوع" : isOverdue ? "متأخر" : "باقي"}
                        </Badge>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl active:scale-90">
                          <MoreHorizontal className="h-5 w-5 text-slate-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem
                          onClick={() => handleTogglePaid(installment)}
                          className="cursor-pointer rounded-lg"
                        >
                          {installment.isPaid ? (
                            <>
                              <XCircle className="h-4 w-4 ml-2" />
                              إلغاء التسديد
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 ml-2" />
                              تسديد القسط
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleSendWhatsApp(installment)}
                          className="cursor-pointer rounded-lg"
                          disabled={sendingId === installment.id}
                        >
                          {sendingId === installment.id ? (
                            <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4 ml-2" />
                          )}
                          إرسال إشعار واتساب
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteConfirmId(installment.id)}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <DialogContent className="sm:max-w-[350px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              تأكيد الحذف
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف هذا القسط؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="px-8">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="rounded-xl h-11">
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId !== null && handleDelete(deleteConfirmId)}
              className="rounded-xl h-11 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
            >
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default InstallmentsPage;
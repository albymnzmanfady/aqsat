"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import ContractForm from "@/components/ContractForm";
import InstallmentSchedule from "@/components/InstallmentSchedule";
import { initialCustomers, initialContracts, generateInstallments, initialInstallments, initialProducts } from "@/data/mockData";
import { Customer, Contract, Installment, Product } from "@/types";
import { showSuccess, showError } from "@/utils/toast";
import { sendWhatsAppMessage, getWhatsAppConfig, MESSAGE_TEMPLATES } from "@/components/WhatsAppService";
import {
  FileText,
  Plus,
  Search,
  Sparkles,
  Calendar,
  Send,
  Loader2,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Package,
  X,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";

const Contracts = () => {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [installments, setInstallments] = useState<Installment[]>(initialInstallments);
  const [customers] = useState<Customer[]>(initialCustomers);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [sendingContract, setSendingContract] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const guarantors = customers.filter((c) => c.type === "guarantor");
  const availableProducts = products.filter((p) => p.currentStock > 0);

  const contractCustomers = customers.filter((c) => c.type === "customer");

  const filteredContracts = contracts.filter((c) =>
    c.customerName.includes(searchQuery) || c.productType.includes(searchQuery)
  );

  const handleCreateContract = (data: any) => {
    const now = new Date().toISOString().split("T")[0];

    if (editingContract) {
      setContracts((prev) =>
        prev.map((c) =>
          c.id === editingContract.id
            ? { ...c, ...data, id: editingContract.id, createdAt: editingContract.createdAt }
            : c
        )
      );
      showSuccess("✅ تم تعديل العقد بنجاح");
    } else {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === data.productId ? { ...p, currentStock: p.currentStock - 1 } : p
        )
      );

      const newContract: Contract = {
        id: contracts.length + 1,
        ...data,
        createdAt: now,
      };

      const newInstallments = generateInstallments(newContract);

      setContracts((prev) => [...prev, newContract]);
      setInstallments((prev) => [...prev, ...newInstallments]);

      const config = getWhatsAppConfig();
      if (config.endpoint) {
        sendWhatsAppMessage(
          data.customerPhone,
          MESSAGE_TEMPLATES.newContract(data.customerName, data.productType, data.totalPrice, data.installmentAmount),
          config
        ).then((result) => {
          if (result.success) showSuccess("✅ تم إنشاء العقد وإرسال الإشعار للعميل");
          else showSuccess("✅ تم إنشاء العقد بنجاح");
        });
      } else {
        showSuccess("✅ تم إنشاء العقد بنجاح");
      }
    }

    setIsDialogOpen(false);
    setEditingContract(null);
  };

  const handleEdit = (contract: Contract) => {
    setEditingContract(contract);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    const contract = contracts.find((c) => c.id === id);
    if (contract && contract.productId) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === contract.productId ? { ...p, currentStock: p.currentStock + 1 } : p
        )
      );
    }
    setContracts((prev) => prev.filter((c) => c.id !== id));
    setInstallments((prev) => prev.filter((i) => i.contractId !== id));
    showSuccess("✅ تم حذف العقد");
    setDeleteConfirmId(null);
  };

  const handleMarkInstallmentPaid = (installmentId: number) => {
    setInstallments((prev) =>
      prev.map((inst) =>
        inst.id === installmentId
          ? { ...inst, isPaid: true, paidDate: new Date().toISOString().split("T")[0] }
          : inst
      )
    );

    const paidInstallment = installments.find((i) => i.id === installmentId);
    if (paidInstallment) {
      const contract = contracts.find((c) => c.id === paidInstallment.contractId);
      if (contract) {
        const config = getWhatsAppConfig();
        if (config.endpoint) {
          const dueDate = `${paidInstallment.day}/${paidInstallment.month}/${paidInstallment.year}`;
          sendWhatsAppMessage(
            contract.customerPhone,
            MESSAGE_TEMPLATES.installmentPaid(contract.customerName, paidInstallment.amount, dueDate, paidInstallment.number),
            config
          );
        }
        showSuccess("✅ تم تسديد القسط بنجاح");
      }
    }
  };

  const handleSendContractNotification = async (contract: Contract) => {
    const config = getWhatsAppConfig();
    if (!config.endpoint) {
      showError("يرجى إعداد واتساب أولاً من صفحة الإعدادات");
      return;
    }

    setSendingContract(contract.id);
    const result = await sendWhatsAppMessage(
      contract.customerPhone,
      MESSAGE_TEMPLATES.newContract(contract.customerName, contract.productType, contract.totalPrice, contract.installmentAmount),
      config
    );
    if (result.success) showSuccess(`✅ تم إرسال إشعار العقد`);
    else showError(result.message);
    setSendingContract(null);
  };

  const contractInstallments = (contractId: number) =>
    installments.filter((i) => i.contractId === contractId);

  const statusStyles = {
    active: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
    completed: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
    defaulted: "bg-gradient-to-r from-rose-500 to-pink-500 text-white",
  };

  const statusIcons = {
    active: CheckCircle2,
    completed: Clock,
    defaulted: AlertTriangle,
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="relative">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full opacity-20 blur-xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">العقود</h1>
              <p className="text-slate-500 mt-1">إدارة عقود الأقساط</p>
            </div>
          </div>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingContract(null);
          }}
        >
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button className="gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/30 h-12 px-6 active:scale-[0.97]">
                <Plus className="h-5 w-5" />
                {editingContract ? "تعديل العقد" : "عقد جديد"}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="rounded-lg text-xs">
              إنشاء عقد أقساط جديد
            </TooltipContent>
          </Tooltip>
          <DialogContent className="sm:max-w-[550px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-500" />
                {editingContract ? "تعديل العقد" : "إنشاء عقد جديد"}
              </DialogTitle>
              <DialogDescription>
                {editingContract ? "تعديل بيانات العقد" : "اختر العميل والمنتج من المخزن"}
              </DialogDescription>
            </DialogHeader>
            <ContractForm
              key={editingContract?.id || "new"}
              customers={contractCustomers}
              guarantors={guarantors}
              products={editingContract ? products : availableProducts}
              onSave={handleCreateContract}
              onCancel={() => { setIsDialogOpen(false); setEditingContract(null); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input
          type="text"
          placeholder="بحث باسم العميل أو نوع المنتج..."
          className="pr-12 rounded-2xl bg-white/70 backdrop-blur-sm border-slate-200/50 h-12 shadow-sm focus:shadow-md transition-shadow"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute left-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors text-slate-500"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Contracts Grid */}
      <div className="grid gap-4">
        {filteredContracts.map((contract, index) => {
          const insts = contractInstallments(contract.id);
          const paidCount = insts.filter((i) => i.isPaid).length;
          const progress = insts.length > 0 ? Math.round((paidCount / insts.length) * 100) : 0;
          const StatusIcon = statusIcons[contract.status];

          return (
            <Card
              key={contract.id}
              className="stagger-item border-0 bg-white/70 backdrop-blur-sm overflow-hidden hover-lift"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div
                className={cn(
                  "h-1.5 w-full",
                  contract.status === "active"
                    ? "bg-gradient-to-l from-emerald-400 to-teal-500"
                    : contract.status === "completed"
                    ? "bg-gradient-to-l from-blue-400 to-cyan-500"
                    : "bg-gradient-to-l from-rose-400 to-pink-500"
                )}
              />

              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
                      {contract.customerName.charAt(0)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-800">{contract.customerName}</h3>
                        <Badge className={cn("rounded-lg border-0", statusStyles[contract.status])}>
                          <StatusIcon className="h-3 w-3 ml-1" />
                          {contract.status === "active" ? "نشط" : contract.status === "completed" ? "مكتمل" : "متأخر"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-slate-500">
                        <span className="bg-slate-100 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                          <Package className="h-3.5 w-3.5" />
                          {contract.productType}
                        </span>
                        <span className="bg-slate-100 px-2.5 py-0.5 rounded-lg">{contract.totalPrice.toLocaleString()} ج.م</span>
                        <span className="bg-slate-100 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {contract.startDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="w-full sm:w-32">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>{paidCount}/{insts.length}</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            contract.status === "active"
                              ? "bg-gradient-to-l from-emerald-400 to-teal-500"
                              : contract.status === "completed"
                              ? "bg-gradient-to-l from-blue-400 to-cyan-500"
                              : "bg-gradient-to-l from-rose-400 to-pink-500"
                          )}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 rounded-xl gap-1.5 text-violet-600 hover:text-violet-700 hover:bg-violet-50 active:scale-90"
                            onClick={() => { setSelectedContract(contract); setIsScheduleOpen(true); }}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="hidden sm:inline">الأقساط</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="rounded-lg text-xs">
                          عرض جدول الأقساط
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 rounded-xl gap-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 active:scale-90"
                            onClick={() => handleSendContractNotification(contract)}
                            disabled={sendingContract === contract.id}
                          >
                            {sendingContract === contract.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                            <span className="hidden sm:inline">واتساب</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="rounded-lg text-xs">
                          إرسال تفاصيل العقد عبر واتساب
                        </TooltipContent>
                      </Tooltip>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl active:scale-90">
                            <MoreHorizontal className="h-5 w-5 text-slate-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem onClick={() => handleEdit(contract)} className="cursor-pointer rounded-lg">
                            <Edit className="h-4 w-4 ml-2" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteConfirmId(contract.id)}
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

                <div className="mt-4 pt-4 border-t border-slate-100/80">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">المبلغ</p>
                      <p className="font-semibold text-slate-700">{contract.totalPrice.toLocaleString()} ج.م</p>
                    </div>
                    <div>
                      <p className="text-slate-500">المقدّم</p>
                      <p className="font-semibold text-slate-700">{contract.downPayment.toLocaleString()} ج.م</p>
                    </div>
                    <div>
                      <p className="text-slate-500">القسط</p>
                      <p className="font-semibold text-slate-700">{contract.installmentAmount.toLocaleString()} ج.م</p>
                    </div>
                    <div>
                      <p className="text-slate-500">الاستحقاق</p>
                      <p className="font-semibold text-slate-700">{contract.endDate}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredContracts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <FileText className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-600 mb-2">لا توجد عقود</h3>
            <p className="text-slate-500">لم يتم العثور على عقود مطابقة</p>
          </div>
        )}
      </div>

      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-500" />
              جدول الأقساط - {selectedContract?.customerName}
            </DialogTitle>
            <DialogDescription>
              {selectedContract?.productType} - {selectedContract?.installmentAmount.toLocaleString()} ج.م شهرياً
            </DialogDescription>
          </DialogHeader>
          {selectedContract && (
            <div className="max-h-[50vh] overflow-y-auto px-1">
              <InstallmentSchedule
                installments={contractInstallments(selectedContract.id)}
                customerName={selectedContract.customerName}
                customerPhone={selectedContract.customerPhone}
                onMarkPaid={handleMarkInstallmentPaid}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <DialogContent className="sm:max-w-[350px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              تأكيد الحذف
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف هذا العقد؟ سيتم أيضاً حذف جميع الأقساط المرتبطة به. لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end pt-2">
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
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Contracts;
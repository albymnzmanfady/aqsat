"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import ContractForm from "@/components/ContractForm";
import InstallmentSchedule from "@/components/InstallmentSchedule";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileText,
  Plus,
  Search,
  Package,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Sparkles,
} from "lucide-react";
import {
  initialCustomers,
  initialGuarantors,
  initialContracts,
  initialInstallments,
} from "@/data/mockData";
import { Contract, Installment, Customer, Guarantor } from "@/types";
import { showSuccess } from "@/utils/toast";

const Contracts = () => {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [installments, setInstallments] = useState<Installment[]>(initialInstallments);
  const [customers] = useState<Customer[]>(initialCustomers);
  const [guarantors] = useState<Guarantor[]>(initialGuarantors);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);

  const filteredContracts = contracts.filter(
    (contract) =>
      contract.customerName.includes(searchQuery) ||
      contract.productType.includes(searchQuery) ||
      contract.guarantorName.includes(searchQuery)
  );

  const handleAddContract = (contract: Contract, newInstallments: Installment[]) => {
    setContracts([...contracts, contract]);
    if (newInstallments.length > 0) {
      setInstallments([...installments, ...newInstallments]);
    }
    setIsDialogOpen(false);
  };

  const handleViewSchedule = (contract: Contract) => {
    setSelectedContract(contract);
    setShowSchedule(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-gradient-to-r from-blue-500 to-cyan-500";
      case "completed":
        return "bg-gradient-to-r from-emerald-500 to-teal-500";
      case "cancelled":
        return "bg-gradient-to-r from-rose-500 to-pink-500";
      default:
        return "bg-gradient-to-r from-slate-500 to-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "نشط";
      case "completed":
        return "مكتمل";
      case "cancelled":
        return "ملغي";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getContractInstallments = (contractId: number) => {
    return installments.filter((i) => i.contractId === contractId);
  };

  const activeCount = contracts.filter((c) => c.status === "active").length;
  const completedCount = contracts.filter((c) => c.status === "completed").length;

  const stats = [
    {
      title: "إجمالي العقود",
      value: contracts.length,
      icon: FileText,
      color: "from-slate-500 to-gray-600",
      bgColor: "bg-slate-50",
    },
    {
      title: "نشطة",
      value: activeCount,
      icon: Clock,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "مكتملة",
      value: completedCount,
      icon: CheckCircle,
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50",
    },
    {
      title: "أقساط معلقة",
      value: installments.filter((i) => !i.isPaid).length,
      icon: AlertCircle,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50",
    },
  ];

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
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">إدارة العقود</h1>
              <p className="text-slate-500 mt-1">إنشاء ومتابعة عقود الأقساط</p>
            </div>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/30 h-12 px-6">
              <Plus className="h-5 w-5" />
              عقد جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-500" />
                إنشاء عقد جديد
              </DialogTitle>
            </DialogHeader>
            <ContractForm
              customers={customers}
              guarantors={guarantors}
              onSubmit={handleAddContract}
            />
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

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="text"
            placeholder="بحث باسم العميل أو نوع السلعة..."
            className="pr-12 rounded-2xl bg-white/70 backdrop-blur-sm border-slate-200/50 h-12 shadow-sm focus:shadow-md transition-shadow"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {filteredContracts.map((contract, index) => {
          const contractInstallments = getContractInstallments(contract.id);
          const paidCount = contractInstallments.filter((i) => i.isPaid).length;

          return (
            <Card key={contract.id} className="border-0 bg-white/70 backdrop-blur-sm hover-lift overflow-hidden group">
              <div className={cn("h-1.5", getStatusColor(contract.status))} />
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform",
                      contract.status === "active" ? "from-blue-500 to-cyan-500" :
                      contract.status === "completed" ? "from-emerald-500 to-teal-500" :
                      "from-rose-500 to-pink-500"
                    )}>
                      <Package className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-800 text-lg">{contract.productType}</h3>
                        <Badge className={cn("gap-1 rounded-lg text-white border-0", getStatusColor(contract.status))}>
                          {getStatusIcon(contract.status)}
                          {getStatusText(contract.status)}
                        </Badge>
                      </div>
                      <p className="text-slate-500 mb-2">
                        العميل: <span className="font-semibold text-slate-700">{contract.customerName}</span>
                        {" | "}
                        الضامن: <span className="font-semibold text-slate-700">{contract.guarantorName}</span>
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <span className="flex items-center gap-1.5 text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                          <Calendar className="h-3.5 w-3.5" />
                          {contract.deliveryDate}
                        </span>
                        <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                          الإجمالي: <span className="font-semibold text-slate-700">{contract.totalPrice.toLocaleString()} ج.م</span>
                        </span>
                        <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                          المقدم: <span className="font-semibold text-slate-700">{contract.downPayment.toLocaleString()} ج.م</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-center p-3 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-500 mb-1">الأقساط</p>
                      <p className="font-bold text-lg text-slate-800">
                        {paidCount}/{contract.numberOfReceipts}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-emerald-50 rounded-xl">
                      <p className="text-xs text-emerald-600 mb-1">القسط</p>
                      <p className="font-bold text-lg text-emerald-600">
                        {contract.installmentAmount.toLocaleString()} ج.م
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewSchedule(contract)}
                      className="rounded-xl gap-2 h-10 px-4 border-slate-200 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600 transition-all"
                    >
                      <Eye className="h-4 w-4" />
                      جدول الأقساط
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredContracts.length === 0 && (
        <div className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-3xl border border-slate-200/50">
          <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <FileText className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-600 mb-2">لا توجد عقود</h3>
          <p className="text-slate-500">لم يتم العثور على عقود مطابقة لبحثك</p>
        </div>
      )}

      {/* Installment Schedule Dialog */}
      <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-500" />
              {selectedContract?.productType} - جدول الأقساط
            </DialogTitle>
          </DialogHeader>
          {selectedContract && (
            <InstallmentSchedule
              installments={getContractInstallments(selectedContract.id)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Contracts;
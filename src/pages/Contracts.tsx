"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import ContractForm from "@/components/ContractForm";
import InstallmentSchedule from "@/components/InstallmentSchedule";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  ChevronLeft,
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
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-emerald-100 text-emerald-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
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

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <FileText className="h-5 w-5 text-white" />
            </div>
            إدارة العقود
          </h1>
          <p className="text-slate-500 mt-2 mr-13">إنشاء ومتابعة عقود الأقساط</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/25">
              <Plus className="h-4 w-4" />
              عقد جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">إنشاء عقد جديد</DialogTitle>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-slate-200 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center">
                <FileText className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">إجمالي العقود</p>
                <p className="font-bold text-xl text-slate-800">{contracts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600">نشطة</p>
                <p className="font-bold text-xl text-blue-700">{activeCount}</p>
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
                <p className="text-sm text-emerald-600">مكتملة</p>
                <p className="font-bold text-xl text-emerald-700">{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center">
                <Package className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-amber-600">الأقساط المعلقة</p>
                <p className="font-bold text-xl text-amber-700">
                  {installments.filter((i) => !i.isPaid).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="بحث باسم العميل أو نوع السلعة..."
            className="pr-10 rounded-xl bg-white border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {filteredContracts.map((contract) => {
          const contractInstallments = getContractInstallments(contract.id);
          const paidCount = contractInstallments.filter((i) => i.isPaid).length;

          return (
            <Card key={contract.id} className="border-slate-200 bg-white hover:shadow-md transition-all duration-200">
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
                      <Package className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-800 text-lg">{contract.productType}</h3>
                        <Badge className={`${getStatusColor(contract.status)} gap-1`}>
                          {getStatusIcon(contract.status)}
                          {getStatusText(contract.status)}
                        </Badge>
                      </div>
                      <p className="text-slate-500 mb-2">
                        العميل: <span className="font-medium text-slate-700">{contract.customerName}</span>
                        {" | "}
                        الضامن: <span className="font-medium text-slate-700">{contract.guarantorName}</span>
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="h-4 w-4" />
                          {contract.deliveryDate}
                        </span>
                        <span className="text-slate-500">
                          الإجمالي: <span className="font-medium text-slate-700">{contract.totalPrice.toLocaleString()} ج.م</span>
                        </span>
                        <span className="text-slate-500">
                          المقدم: <span className="font-medium text-slate-700">{contract.downPayment.toLocaleString()} ج.م</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-slate-500">الأقساط</p>
                      <p className="font-bold text-lg text-slate-800">
                        {paidCount}/{contract.numberOfReceipts}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">القسط</p>
                      <p className="font-bold text-lg text-emerald-600">
                        {contract.installmentAmount.toLocaleString()} ج.م
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewSchedule(contract)}
                      className="rounded-xl gap-2"
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
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-1">لا توجد عقود</h3>
          <p className="text-slate-500">لم يتم العثور على عقود مطابقة لبحثك</p>
        </div>
      )}

      {/* Installment Schedule Dialog */}
      <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
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
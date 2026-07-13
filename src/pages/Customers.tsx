"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Search,
  Phone,
  Shield,
  Package,
  Eye,
  Printer,
  Trash2,
} from "lucide-react";
import { Customer, CustomerFormData } from "@/types";
import { initialCustomers, generateInstallments } from "@/data/mockData";
import CustomerFormDialog from "@/components/CustomerFormDialog";
import ContractPrintView from "@/components/ContractPrintView";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { showSuccess } from "@/utils/toast";

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.includes(searchQuery) ||
      c.phone.includes(searchQuery) ||
      c.nationalId.includes(searchQuery)
  );

  const getCustomerStatus = (customer: Customer) => {
    const paidCount = customer.installments.filter((i) => i.paid).length;
    const total = customer.installments.length;
    if (paidCount === total) return "completed";
    const overdue = customer.installments.some(
      (i) => !i.paid && new Date(i.year, i.month - 1, i.day) < new Date()
    );
    if (overdue) return "overdue";
    return "active";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-emerald-100 text-emerald-700";
      case "overdue":
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
      case "overdue":
        return "متأخر";
      default:
        return status;
    }
  };

  const handleAddCustomer = (data: CustomerFormData) => {
    const installments = generateInstallments(
      data.contract.totalPrice,
      data.contract.downPayment,
      data.contract.numberOfReceipts,
      data.contract.deliveryDate
    );
    const installmentValue =
      data.contract.numberOfReceipts > 0
        ? Math.round(
            (data.contract.totalPrice - data.contract.downPayment) /
              data.contract.numberOfReceipts
          )
        : 0;
    const newCustomer: Customer = {
      ...data,
      id: Math.max(...customers.map((c) => c.id), 0) + 1,
      contract: { ...data.contract, installmentValue },
      installments,
    };
    setCustomers((prev) => [...prev, newCustomer]);
    showSuccess("تم إضافة العميل وإنشاء جدول الأقساط بنجاح");
  };

  const handleDeleteCustomer = (id: number) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    showSuccess("تم حذف العميل بنجاح");
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsViewOpen(true);
  };

  const handlePrintCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsPrintOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Users className="h-5 w-5 text-white" />
            </div>
            إدارة العملاء
          </h1>
          <p className="text-slate-500 mt-1 mr-13">
            تسجيل بيانات العملاء والضمانين والأContracts
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25"
        >
          <Plus className="h-4 w-4" />
          إضافة عميل جديد
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="بحث بالاسم أو الهاتف أو الرقم القومي..."
            className="pr-10 rounded-xl bg-white border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredCustomers.map((customer) => {
          const status = getCustomerStatus(customer);
          const paidCount = customer.installments.filter((i) => i.paid).length;
          const totalInstallments = customer.installments.length;

          return (
            <Card
              key={customer.id}
              className="border-slate-200 bg-white hover:shadow-md transition-all duration-200"
            >
              <CardContent className="p-5">
                {/* Customer Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/25">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {customer.name}
                      </h3>
                      <Badge className={`mt-1 ${getStatusColor(status)}`}>
                        {getStatusText(status)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Shield className="h-4 w-4 text-amber-400" />
                    <span>ضامن: {customer.guarantor.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Package className="h-4 w-4 text-purple-400" />
                    <span>{customer.contract.productType}</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">تقدم الأقساط</span>
                    <span className="text-sm font-medium text-slate-700">
                      {paidCount}/{totalInstallments}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                      style={{
                        width: `${(paidCount / totalInstallments) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-slate-500">
                      إجمالي السعر
                    </span>
                    <span className="font-bold text-lg text-slate-800">
                      {customer.contract.totalPrice.toLocaleString()} ج.م
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-xl border-slate-200"
                    onClick={() => handleViewCustomer(customer)}
                  >
                    <Eye className="h-4 w-4 ml-1" />
                    تفاصيل
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-xl border-slate-200"
                    onClick={() => handlePrintCustomer(customer)}
                  >
                    <Printer className="h-4 w-4 ml-1" />
                    طباعة
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                    onClick={() => handleDeleteCustomer(customer.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-1">
            لا يوجد عملاء
          </h3>
          <p className="text-slate-500">
            لم يتم العثور على عملاء مطابقين لبحثك
          </p>
        </div>
      )}

      {/* Add Customer Dialog */}
      <CustomerFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleAddCustomer}
      />

      {/* View Customer Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-2xl max-h-[90vh] overflow-y-auto">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">
                  تفاصيل العميل - {selectedCustomer.name}
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    بيانات العميل
                  </h4>
                  <div className="space-y-1.5 text-sm">
                    <p><span className="text-slate-500">الاسم:</span> <span className="font-medium">{selectedCustomer.name}</span></p>
                    <p><span className="text-slate-500">الرقم القومي:</span> <span className="font-medium">{selectedCustomer.nationalId || "-"}</span></p>
                    <p><span className="text-slate-500">الهاتف:</span> <span className="font-medium">{selectedCustomer.phone}</span></p>
                    <p><span className="text-slate-500">العنوان:</span> <span className="font-medium">{selectedCustomer.address || "-"}</span></p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-amber-500" />
                    بيانات الضامن
                  </h4>
                  <div className="space-y-1.5 text-sm">
                    <p><span className="text-slate-500">الاسم:</span> <span className="font-medium">{selectedCustomer.guarantor.name}</span></p>
                    <p><span className="text-slate-500">الرقم القومي:</span> <span className="font-medium">{selectedCustomer.guarantor.nationalId || "-"}</span></p>
                    <p><span className="text-slate-500">الهاتف:</span> <span className="font-medium">{selectedCustomer.guarantor.phone}</span></p>
                    <p><span className="text-slate-500">العنوان:</span> <span className="font-medium">{selectedCustomer.guarantor.address || "-"}</span></p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-500" />
                  بيانات العقد
                </h4>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <p><span className="text-slate-500">السلعة:</span> <span className="font-medium">{selectedCustomer.contract.productType}</span></p>
                  <p><span className="text-slate-500">السعر:</span> <span className="font-bold">{selectedCustomer.contract.totalPrice.toLocaleString()} ج.م</span></p>
                  <p><span className="text-slate-500">المقدم:</span> <span className="font-medium">{selectedCustomer.contract.downPayment.toLocaleString()} ج.م</span></p>
                  <p><span className="text-slate-500">القسط:</span> <span className="font-bold text-blue-600">{selectedCustomer.contract.installmentValue.toLocaleString()} ج.م</span></p>
                  <p><span className="text-slate-500">العدد:</span> <span className="font-medium">{selectedCustomer.contract.numberOfReceipts} قسط</span></p>
                  <p><span className="text-slate-500">تاريخ الاستلام:</span> <span className="font-medium">{selectedCustomer.contract.deliveryDate}</span></p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">جدول الأقساط</h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-3 py-2 text-right font-semibold text-slate-600">رقم</th>
                        <th className="px-3 py-2 text-right font-semibold text-slate-600">التاريخ</th>
                        <th className="px-3 py-2 text-right font-semibold text-slate-600">القيمة</th>
                        <th className="px-3 py-2 text-center font-semibold text-slate-600">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedCustomer.installments.map((inst) => (
                        <tr key={inst.id} className={inst.paid ? "bg-emerald-50/30" : ""}>
                          <td className="px-3 py-2">{inst.number}</td>
                          <td className="px-3 py-2">{inst.day}/{inst.month}/{inst.year}</td>
                          <td className="px-3 py-2 font-medium">{inst.value.toLocaleString()} ج.م</td>
                          <td className="px-3 py-2 text-center">
                            <Badge className={inst.paid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                              {inst.paid ? "مدفوع" : "معلق"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Print Dialog */}
      <Dialog open={isPrintOpen} onOpenChange={setIsPrintOpen}>
        <DialogContent className="sm:max-w-[900px] rounded-2xl max-h-[90vh] overflow-y-auto print:shadow-none print:border-none">
          {selectedCustomer && (
            <>
              <div className="flex justify-between items-center mb-4 print:hidden">
                <DialogHeader>
                  <DialogTitle className="text-xl">طباعة ملف العميل</DialogTitle>
                </DialogHeader>
                <Button onClick={handlePrint} className="rounded-xl bg-blue-600 hover:bg-blue-700">
                  <Printer className="h-4 w-4 ml-2" />
                  طباعة
                </Button>
              </div>
              <ContractPrintView customer={selectedCustomer} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Customers;
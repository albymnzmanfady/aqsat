"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Customer } from "@/types";
import { initialCustomers } from "@/data/mockData";
import InstallmentScheduleTable from "@/components/InstallmentScheduleTable";
import { showSuccess } from "@/utils/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Installments = () => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "pending">("all");

  const selectedCustomer =
    selectedCustomerId !== "all"
      ? customers.find((c) => c.id === Number(selectedCustomerId))
      : null;

  const allInstallments = customers.flatMap((c) =>
    c.installments.map((inst) => ({ ...inst, customerName: c.name, customerId: c.id }))
  );

  const filteredAllInstallments = allInstallments.filter((inst) => {
    const matchesSearch = inst.customerName.includes(searchQuery);
    const matchesCustomer =
      selectedCustomerId === "all" || inst.customerId === Number(selectedCustomerId);
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "paid" && inst.paid) ||
      (filterStatus === "pending" && !inst.paid);
    return matchesSearch && matchesCustomer && matchesFilter;
  });

  const handleTogglePaid = (customerId: number, installmentId: number) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== customerId) return c;
        return {
          ...c,
          installments: c.installments.map((inst) => {
            if (inst.id !== installmentId) return inst;
            const newPaid = !inst.paid;
            return {
              ...inst,
              paid: newPaid,
              paidDate: newPaid ? new Date().toISOString().split("T")[0] : null,
            };
          }),
        };
      })
    );
    showSuccess("تم تحديث حالة القسط بنجاح");
  };

  const totalPaid = allInstallments.filter((i) => i.paid).length;
  const totalPending = allInstallments.filter((i) => !i.paid).length;
  const totalAmount = allInstallments.reduce((s, i) => s + i.value, 0);
  const paidAmount = allInstallments.filter((i) => i.paid).reduce((s, i) => s + i.value, 0);

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <CreditCard className="h-5 w-5 text-white" />
          </div>
          إدارة الأقساط
        </h1>
        <p className="text-slate-500 mt-1 mr-13">تتبع جداول الأقساط وتسجيل السداد</p>
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
                <p className="font-bold text-xl text-slate-800">{allInstallments.length}</p>
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
                <p className="font-bold text-xl text-emerald-700">{totalPaid}</p>
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
                <p className="font-bold text-xl text-amber-700">{totalPending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
                <Wallet className="h-5 w-5 text-blue-600" />
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
              <p className="text-2xl font-bold text-amber-600">
                {(totalAmount - paidAmount).toLocaleString()} ج.م
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
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
        <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
          <SelectTrigger className="w-full sm:w-[220px] rounded-xl bg-white border-slate-200">
            <SelectValue placeholder="اختر العميل" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع العملاء</SelectItem>
            {customers.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      {/* View: Single Customer Schedule */}
      {selectedCustomer && (
        <Card className="mb-6 border-blue-200 bg-blue-50/30">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{selectedCustomer.name}</h3>
                <p className="text-sm text-slate-500">
                  {selectedCustomer.contract.productType} -{" "}
                  {selectedCustomer.contract.totalPrice.toLocaleString()} ج.م
                </p>
              </div>
              <div className="text-left">
                <p className="text-sm text-slate-500">القسط الشهري</p>
                <p className="font-bold text-lg text-blue-600">
                  {selectedCustomer.contract.installmentValue.toLocaleString()} ج.م
                </p>
              </div>
            </div>
            <InstallmentScheduleTable
              installments={selectedCustomer.installments}
              onTogglePaid={(instId) => handleTogglePaid(selectedCustomer.id, instId)}
            />
          </CardContent>
        </Card>
      )}

      {/* View: All Installments */}
      {!selectedCustomer && (
        <Card className="border-slate-200 bg-white">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">جميع الأقساط ({filteredAllInstallments.length})</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {filteredAllInstallments.map((inst) => (
              <div
                key={`${inst.customerId}-${inst.id}`}
                className={`p-4 hover:bg-slate-50 transition-colors ${
                  inst.paid ? "bg-emerald-50/20" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        inst.paid ? "bg-emerald-100" : "bg-amber-100"
                      }`}
                    >
                      {inst.paid ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800">
                        {inst.customerName}
                      </h4>
                      <p className="text-sm text-slate-500">
                        القسط {inst.number} - {inst.day}/{inst.month}/{inst.year}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <p className="font-bold text-slate-800">
                        {inst.value.toLocaleString()} ج.م
                      </p>
                      <Badge
                        className={
                          inst.paid
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                            : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                        }
                      >
                        {inst.paid ? "مدفوع" : "معلق"}
                      </Badge>
                    </div>
                    {!inst.paid && (
                      <Button
                        size="sm"
                        className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white"
                        onClick={() =>
                          handleTogglePaid(inst.customerId, inst.id)
                        }
                      >
                        تسجيل السداد
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredAllInstallments.length === 0 && (
            <div className="text-center py-16">
              <CreditCard className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-1">
                لا توجد أقساط
              </h3>
              <p className="text-slate-500">
                لم يتم العثور على أقساط مطابقة
              </p>
            </div>
          )}
        </Card>
      )}
    </Layout>
  );
};

export default Installments;
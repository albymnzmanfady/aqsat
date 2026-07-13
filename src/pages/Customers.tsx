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
import { Users, Plus, Search, Phone, Mail, Edit, Trash2, Eye } from "lucide-react";
import { showSuccess } from "@/utils/toast";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  totalInstallments: number;
  paidInstallments: number;
  amount: number;
  status: "active" | "completed" | "overdue";
}

const initialCustomers: Customer[] = [
  { id: 1, name: "أحمد محمد علي", phone: "01012345678", email: "ahmed@email.com", address: "القاهرة", totalInstallments: 12, paidInstallments: 8, amount: 5000, status: "active" },
  { id: 2, name: "سارة علي حسن", phone: "01098765432", email: "sara@email.com", address: "الجيزة", totalInstallments: 24, paidInstallments: 12, amount: 12000, status: "active" },
  { id: 3, name: "محمد حسن أحمد", phone: "01123456789", email: "mohamed@email.com", address: "الإسكندرية", totalInstallments: 6, paidInstallments: 6, amount: 3000, status: "completed" },
  { id: 4, name: "فاطمة أحمد محمود", phone: "01234567890", email: "fatma@email.com", address: "المنصورة", totalInstallments: 18, paidInstallments: 5, amount: 9000, status: "overdue" },
  { id: 5, name: "عمر خالد سعيد", phone: "01087654321", email: "omar@email.com", address: "أسوان", totalInstallments: 12, paidInstallments: 10, amount: 6000, status: "active" },
  { id: 6, name: "نورا سعيد عبد الله", phone: "01155566677", email: "nora@email.com", address: "طنطا", totalInstallments: 36, paidInstallments: 24, amount: 18000, status: "active" },
];

const Customers = () => {
  const [customers] = useState<Customer[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    amount: "",
    installments: "",
  });

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.includes(searchQuery) ||
      customer.phone.includes(searchQuery) ||
      customer.email.includes(searchQuery)
  );

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

  const handleAddCustomer = () => {
    showSuccess("تم إضافة العميل بنجاح");
    setIsDialogOpen(false);
    setNewCustomer({ name: "", phone: "", email: "", address: "", amount: "", installments: "" });
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
          <p className="text-slate-500 mt-2 mr-13">إضافة وتعديل وحذف بيانات العملاء</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25">
              <Plus className="h-4 w-4" />
              إضافة عميل
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">إضافة عميل جديد</DialogTitle>
              <DialogDescription>أدخل بيانات العميل الجديدة هنا</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">اسم العميل</Label>
                <Input
                  id="name"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="أدخل اسم العميل"
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    placeholder="01xxxxxxxxx"
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    placeholder="email@example.com"
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">العنوان</Label>
                <Input
                  id="address"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  placeholder="المدينة"
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">المبلغ الإجمالي</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newCustomer.amount}
                    onChange={(e) => setNewCustomer({ ...newCustomer, amount: e.target.value })}
                    placeholder="0"
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installments">عدد الأقساط</Label>
                  <Input
                    id="installments"
                    type="number"
                    value={newCustomer.installments}
                    onChange={(e) => setNewCustomer({ ...newCustomer, installments: e.target.value })}
                    placeholder="12"
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">
                إلغاء
              </Button>
              <Button onClick={handleAddCustomer} className="rounded-xl bg-blue-600 hover:bg-blue-700">
                إضافة العميل
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="بحث بالاسم أو الهاتف أو البريد..."
            className="pr-10 rounded-xl bg-white border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="border-slate-200 bg-white hover:shadow-md transition-all duration-200">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/25">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{customer.name}</h3>
                    <Badge className={`mt-1 ${getStatusColor(customer.status)}`}>
                      {getStatusText(customer.status)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="truncate">{customer.email}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">تقدم الأقساط</span>
                  <span className="text-sm font-medium text-slate-700">
                    {customer.paidInstallments}/{customer.totalInstallments}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${(customer.paidInstallments / customer.totalInstallments) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-slate-500">المبلغ الإجمالي</span>
                  <span className="font-bold text-lg text-slate-800">{customer.amount.toLocaleString()} ج.م</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" size="sm" className="flex-1 rounded-xl border-slate-200">
                  <Eye className="h-4 w-4 ml-1" />
                  عرض
                </Button>
                <Button variant="outline" size="sm" className="flex-1 rounded-xl border-slate-200">
                  <Edit className="h-4 w-4 ml-1" />
                  تعديل
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-1">لا يوجد عملاء</h3>
          <p className="text-slate-500">لم يتم العثور على عملاء مطابقين لبحثك</p>
        </div>
      )}
    </Layout>
  );
};

export default Customers;
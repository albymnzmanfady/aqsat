"use client";

import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle,
  ChevronLeft,
} from "lucide-react";
import { initialCustomers } from "@/data/mockData";

const Index = () => {
  const customers = initialCustomers;
  const totalCustomers = customers.length;
  const allInstallments = customers.flatMap((c) => c.installments);
  const totalCollected = allInstallments
    .filter((i) => i.paid)
    .reduce((s, i) => s + i.value, 0);
  const totalExpected = allInstallments.reduce((s, i) => s + i.value, 0);
  const pendingPayments = allInstallments.filter((i) => !i.paid).length;

  const recentPayments = allInstallments
    .filter((i) => i.paid)
    .sort((a, b) => (b.paidDate || "").localeCompare(a.paidDate || ""))
    .slice(0, 5)
    .map((inst) => {
      const customer = customers.find((c) =>
        c.installments.some((i) => i.id === inst.id && i.number === inst.number)
      );
      return {
        ...inst,
        customerName: customer?.name || "غير معروف",
      };
    });

  return (
    <Layout>
      {/* Welcome Section */}
      <div className="mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
          مرحباً بك 👋
        </h2>
        <p className="text-slate-500">
          لوحة تحكم إدارة الأقساط - تابع أقساط عملائك بسهولة
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg shadow-blue-500/25 overflow-hidden relative">
          <CardContent className="p-4 lg:p-5">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-blue-100 text-xs lg:text-sm mb-1">
                  إجمالي العملاء
                </p>
                <p className="text-2xl lg:text-3xl font-bold">
                  {totalCustomers}
                </p>
              </div>
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Users className="h-5 w-5 lg:h-6 lg:w-6" />
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/25 overflow-hidden relative">
          <CardContent className="p-4 lg:p-5">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-emerald-100 text-xs lg:text-sm mb-1">
                  المتحصّل
                </p>
                <p className="text-2xl lg:text-3xl font-bold">
                  {totalCollected.toLocaleString()}
                </p>
              </div>
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6" />
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-lg shadow-amber-500/25 overflow-hidden relative">
          <CardContent className="p-4 lg:p-5">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-amber-100 text-xs lg:text-sm mb-1">
                  المتوقع
                </p>
                <p className="text-2xl lg:text-3xl font-bold">
                  {totalExpected.toLocaleString()}
                </p>
              </div>
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6" />
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500 to-rose-600 text-white border-0 shadow-lg shadow-rose-500/25 overflow-hidden relative">
          <CardContent className="p-4 lg:p-5">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-rose-100 text-xs lg:text-sm mb-1">
                  قيد الانتظار
                </p>
                <p className="text-2xl lg:text-3xl font-bold">{pendingPayments}</p>
              </div>
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Clock className="h-5 w-5 lg:h-6 lg:w-6" />
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full" />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Link to="/customers">
          <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border-slate-200 bg-white group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                    <Users className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      إدارة العملاء
                    </h3>
                    <p className="text-sm text-slate-500">
                      تسجيل بيانات العميل والضامن والعقد
                    </p>
                  </div>
                </div>
                <ChevronLeft className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/installments">
          <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border-slate-200 bg-white group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                    <Wallet className="h-6 w-6 text-emerald-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      تتبع الأقساط
                    </h3>
                    <p className="text-sm text-slate-500">
                      جداول الأقساط وتسجيل السداد
                    </p>
                  </div>
                </div>
                <ChevronLeft className="h-5 w-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Payments */}
      <Card className="border-slate-200 bg-white">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 text-lg">
              آخر المدفوعات
            </h3>
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-600"
            >
              {recentPayments.length} مدفوعات
            </Badge>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {recentPayments.map((payment, index) => (
            <div
              key={`${payment.id}-${index}`}
              className="p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-100">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">
                      {payment.customerName}
                    </h4>
                    <p className="text-sm text-slate-500">
                      القسط {payment.number} -{" "}
                      {payment.paidDate || "غير محدد"}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-800">
                    {payment.value.toLocaleString()} ج.م
                  </p>
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    مدفوع
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </Layout>
  );
};

export default Index;
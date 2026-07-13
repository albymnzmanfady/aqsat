"use client";

import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Wallet, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  ArrowLeft
} from "lucide-react";

// Mock data
const stats = {
  totalCustomers: 45,
  totalCollected: 285000,
  totalExpected: 520000,
  pendingPayments: 12
};

const recentPayments = [
  { id: 1, customer: "أحمد محمد", amount: 500, date: "2024-01-15", status: "paid" },
  { id: 2, customer: "سارة علي", amount: 500, date: "2024-01-14", status: "paid" },
  { id: 3, customer: "فاطمة أحمد", amount: 500, date: "2024-01-13", status: "pending" },
  { id: 4, customer: "عمر خالد", amount: 500, date: "2024-01-12", status: "paid" },
];

const Index = () => {
  return (
    <Layout>
      <div className="p-4 lg:p-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">مرحباً بك</h2>
          <p className="text-slate-600">لوحة تحكم إدارة الأقساط - تابع أقساط عملائك بسهولة</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg shadow-blue-500/25">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">إجمالي العملاء</p>
                  <p className="text-2xl lg:text-3xl font-bold">{stats.totalCustomers}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/25">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">المتحصّل</p>
                  <p className="text-2xl lg:text-3xl font-bold">{stats.totalCollected.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-lg shadow-amber-500/25">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">المتوقع</p>
                  <p className="text-2xl lg:text-3xl font-bold">{stats.totalExpected.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-rose-500 to-rose-600 text-white border-0 shadow-lg shadow-rose-500/25">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-rose-100 text-sm">قيد الانتظار</p>
                  <p className="text-2xl lg:text-3xl font-bold">{stats.pendingPayments}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Link to="/customers">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-slate-100 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">إدارة العملاء</h3>
                      <p className="text-sm text-slate-500">إضافة وتعديل البيانات</p>
                    </div>
                  </div>
                  <ArrowLeft className="h-5 w-5 text-slate-400" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/installments">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-slate-100 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Wallet className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">تتبع الأقساط</h3>
                      <p className="text-sm text-slate-500">تسجيل المدفوعات</p>
                    </div>
                  </div>
                  <ArrowLeft className="h-5 w-5 text-slate-400" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-slate-100 rounded-2xl sm:col-span-2 lg:col-span-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">التقارير</h3>
                    <p className="text-sm text-slate-500">تحليل البيانات</p>
                  </div>
                </div>
                <ArrowLeft className="h-5 w-5 text-slate-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Payments */}
        <Card className="rounded-2xl border-slate-100">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">آخر المدفوعات</CardTitle>
              <Badge variant="secondary">{recentPayments.length} مدفوعات</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        payment.status === 'paid' 
                          ? 'bg-emerald-100 text-emerald-600' 
                          : 'bg-amber-100 text-amber-600'
                      }`}>
                        {payment.status === 'paid' ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Clock className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{payment.customer}</h3>
                        <p className="text-sm text-slate-500">{payment.date}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-800">{payment.amount.toLocaleString()} ج.م</p>
                      <Badge 
                        variant={payment.status === 'paid' ? 'default' : 'secondary'}
                        className={payment.status === 'paid' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : ''}
                      >
                        {payment.status === 'paid' ? 'مدفوع' : 'قيد الانتظار'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;
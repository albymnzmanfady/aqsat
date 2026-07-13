"use client";

import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Users,
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle,
  FileText,
  Package,
  ChevronLeft,
  Plus,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  Target,
  BarChart3,
} from "lucide-react";
import { initialCustomers, initialContracts, initialInstallments } from "@/data/mockData";

const Index = () => {
  const activeContracts = initialContracts.filter((c) => c.status === "active").length;
  const totalCollected = initialInstallments.filter((i) => i.isPaid).reduce((sum, i) => sum + i.amount, 0);
  const totalExpected = initialInstallments.reduce((sum, i) => sum + i.amount, 0);
  const pendingPayments = initialInstallments.filter((i) => !i.isPaid).length;
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  const recentContracts = initialContracts.slice(0, 4);

  const stats = [
    {
      title: "إجمالي العملاء",
      value: initialCustomers.length,
      icon: Users,
      color: "from-violet-500 to-purple-600",
      bgLight: "bg-violet-50",
      textColor: "text-violet-600",
      change: "+12%",
      changeType: "up",
    },
    {
      title: "المتحصّل",
      value: `${totalCollected.toLocaleString()} ج.م`,
      icon: CheckCircle,
      color: "from-emerald-500 to-teal-500",
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-600",
      change: "+8%",
      changeType: "up",
    },
    {
      title: "العقود النشطة",
      value: activeContracts,
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
      change: "+3",
      changeType: "up",
    },
    {
      title: "نسبة التحصيل",
      value: `${collectionRate}%`,
      icon: Target,
      color: "from-amber-500 to-orange-500",
      bgLight: "bg-amber-50",
      textColor: "text-amber-600",
      change: "+5%",
      changeType: "up",
    },
  ];

  const quickActions = [
    {
      title: "عميل جديد",
      description: "تسجيل بيانات العميل",
      icon: UserPlus,
      path: "/customers",
      color: "from-violet-500 to-purple-600",
    },
    {
      title: "عقد جديد",
      description: "إنشاء عقد أقساط",
      icon: FileText,
      path: "/contracts",
      color: "from-emerald-500 to-teal-500",
    },
    {
      title: "تسجيل قسط",
      description: "تسجيل دفعة جديدة",
      icon: Wallet,
      path: "/installments",
      color: "from-amber-500 to-orange-500",
    },
    {
      title: "تقرير شامل",
      description: "عرض التقارير",
      icon: BarChart3,
      path: "#",
      color: "from-blue-500 to-cyan-500",
    },
  ];

  return (
    <Layout>
      {/* Welcome Section */}
      <div className="mb-8 relative">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full opacity-20 blur-xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 animate-float">
              <span className="text-2xl">👋</span>
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-800">مرحباً بك!</h2>
              <p className="text-slate-500 text-sm">لوحة تحكم إدارة الأقساط</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="border-0 bg-white/70 backdrop-blur-sm hover-lift overflow-hidden group"
          >
            <CardContent className="p-5 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r opacity-50" 
                   style={{ background: `linear-gradient(to right, var(--tw-gradient-stops))` }} />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                  <div className={cn(
                    "flex items-center gap-1 mt-2 text-xs font-medium",
                    stat.changeType === "up" ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {stat.changeType === "up" ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {stat.change} من الشهر الماضي
                  </div>
                </div>
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg transition-all duration-300 group-hover:scale-110",
                  stat.color
                )}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className={cn(
                "absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br",
                stat.color
              )} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            الإجراءات السريعة
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.path}>
              <Card className="border-0 bg-white/70 backdrop-blur-sm hover-lift cursor-pointer group overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                      action.color
                    )}>
                      <action.icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800 group-hover:text-violet-600 transition-colors">{action.title}</h4>
                      <p className="text-sm text-slate-500">{action.description}</p>
                    </div>
                    <ChevronLeft className="h-5 w-5 text-slate-300 group-hover:text-violet-500 group-hover:-translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Contracts & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Contracts */}
        <div className="lg:col-span-2">
          <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100/80">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-violet-500" />
                  آخر العقود
                </h3>
                <Link to="/contracts">
                  <Button variant="ghost" size="sm" className="gap-2 text-violet-600 hover:bg-violet-50 rounded-xl">
                    عرض الكل
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="divide-y divide-slate-100/80">
              {recentContracts.map((contract, index) => (
                <div
                  key={contract.id}
                  className="p-4 hover:bg-slate-50/50 transition-colors"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-md",
                        index % 4 === 0 ? "from-violet-500 to-purple-600" :
                        index % 4 === 1 ? "from-emerald-500 to-teal-500" :
                        index % 4 === 2 ? "from-blue-500 to-cyan-500" :
                        "from-amber-500 to-orange-500"
                      )}>
                        <Package className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">{contract.productType}</h4>
                        <p className="text-sm text-slate-500">{contract.customerName}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-800">{contract.totalPrice.toLocaleString()} ج.م</p>
                      <Badge
                        className={cn(
                          "mt-1 rounded-lg",
                          contract.status === "active"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-emerald-100 text-emerald-700"
                        )}
                      >
                        {contract.status === "active" ? "نشط" : "مكتمل"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Collection Progress */}
        <div className="lg:col-span-1">
          <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden h-full">
            <div className="p-5 border-b border-slate-100/80">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-500" />
                تقدم التحصيل
              </h3>
            </div>
            <CardContent className="p-5">
              <div className="space-y-6">
                {/* Progress Ring */}
                <div className="flex justify-center">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#e2e8f0"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - collectionRate / 100)}`}
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#10B981" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-slate-800">{collectionRate}%</span>
                      <span className="text-xs text-slate-500">نسبة التحصيل</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                      <span className="text-sm text-slate-600">المتحصّل</span>
                    </div>
                    <span className="font-bold text-emerald-600">{totalCollected.toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-amber-500 rounded-full" />
                      <span className="text-sm text-slate-600">المتبقي</span>
                    </div>
                    <span className="font-bold text-amber-600">{(totalExpected - totalCollected).toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-100 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-slate-500 rounded-full" />
                      <span className="text-sm text-slate-600">الإجمالي</span>
                    </div>
                    <span className="font-bold text-slate-800">{totalExpected.toLocaleString()} ج.م</span>
                  </div>
                </div>

                {/* Pending payments badge */}
                <div className="p-4 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl text-white relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />
                  <div className="relative z-10">
                    <p className="text-sm text-white/80 mb-1">أقساط قيد الانتظار</p>
                    <p className="text-3xl font-bold">{pendingPayments}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
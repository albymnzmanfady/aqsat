"use client";

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileNav from "@/components/MobileNav";
import {
  Home,
  Users,
  CreditCard,
  FileText,
  Settings,
  Bell,
  Menu,
  X,
  Sparkles,
  User,
  MessageSquareText,
  Package,
  ArrowDownUp,
  BarChart3,
  Receipt,
  PieChart,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  const navItems = [
    { path: "/", label: "الرئيسية", icon: Home, color: "from-violet-500 to-purple-600" },
    { path: "/customers", label: "العملاء", icon: Users, color: "from-blue-500 to-cyan-500" },
    { path: "/contracts", label: "العقود", icon: FileText, color: "from-emerald-500 to-teal-500" },
    { path: "/installments", label: "الأقساط", icon: CreditCard, color: "from-amber-500 to-orange-500" },
    {
      label: "المخازن",
      icon: Package,
      color: "from-orange-500 to-red-500",
      subItems: [
        { path: "/products", label: "المنتجات", icon: Package },
        { path: "/inventory", label: "حركات المخزون", icon: ArrowDownUp },
        { path: "/inventory-dashboard", label: "التقارير", icon: BarChart3 },
      ],
    },
    {
      label: "المصروفات",
      icon: Receipt,
      color: "from-rose-500 to-pink-600",
      subItems: [
        { path: "/expenses", label: "المصروفات", icon: Receipt },
        { path: "/expense-reports", label: "التقارير", icon: PieChart },
      ],
    },
    { path: "/settings", label: "الإعدادات", icon: Settings, color: "from-slate-500 to-gray-500" },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Close sidebar on navigation for mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 flex">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-100/20 to-blue-100/20 rounded-full blur-3xl" />
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl z-40 border-b border-white/20">
        <div className="flex items-center justify-between px-4 h-full">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="h-10 w-10 rounded-xl"
            >
              <Menu className="h-5 w-5 text-slate-600" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-slate-800">أقساط</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute top-2 left-2 h-2 w-2 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full animate-pulse" />
            </Button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/30">
              <User className="h-5 w-5" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-all duration-300",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar (Desktop only) */}
      <aside
        className={cn(
          "hidden lg:flex fixed top-0 right-0 h-full w-72 z-50 transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:border-l border-white/20 flex-col",
          "bg-white/80 backdrop-blur-xl",
          sidebarOpen ? "translate-x-0 shadow-2xl" : "translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-100/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 relative overflow-hidden">
                <Sparkles className="h-6 w-6 text-white relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <div>
                <h1 className="font-bold text-slate-800 text-lg tracking-tight">أقساط</h1>
                <p className="text-xs text-slate-500">نظام إدارة الأقساط</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="p-4">
          <div className="p-4 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
              <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-white/10 rounded-full" />
            </div>
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg border border-white/30">
                م
              </div>
              <div className="text-white">
                <p className="font-semibold text-sm">محمد أحمد</p>
                <p className="text-xs text-white/80">مدير النظام</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">القائمة الرئيسية</p>

          {navItems.map((item) => {
            if (item.subItems) {
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <div className={`w-1 h-4 rounded-full bg-gradient-to-b ${item.color}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.subItems.map((sub) => {
                    const subActive = sub.path ? isActive(sub.path) : false;
                    return (
                      <Link key={sub.path} to={sub.path}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start gap-3 h-11 rounded-xl transition-all duration-200 relative pr-8",
                            subActive
                              ? "bg-gradient-to-l from-rose-500/10 to-pink-500/10 text-rose-600 font-semibold shadow-sm"
                              : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-800"
                          )}
                        >
                          {subActive && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-rose-500 to-pink-600 rounded-l-full" />
                          )}
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                            subActive
                              ? "bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md"
                              : "bg-slate-100 text-slate-500"
                          )}>
                            <sub.icon className="h-4 w-4" />
                          </div>
                          <span className="flex-1 text-right">{sub.label}</span>
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              );
            }

            const isItemActive = isActive(item.path!);
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-12 rounded-xl transition-all duration-200 relative",
                    isItemActive
                      ? "bg-gradient-to-l from-violet-500/10 to-purple-500/10 text-violet-600 font-semibold shadow-sm"
                      : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-800"
                  )}
                >
                  {isItemActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-violet-500 to-purple-600 rounded-l-full" />
                  )}
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200",
                    isItemActive
                      ? `bg-gradient-to-br ${item.color} text-white shadow-md`
                      : "bg-slate-100 text-slate-500"
                  )}>
                    <item.icon className="h-4.5 w-4.5" />
                  </div>
                  <span className="flex-1 text-right">{item.label}</span>
                  {isItemActive && (
                    <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-100/80">
          <div className="p-3 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <MessageSquareText className="h-4 w-4 text-white" />
              </div>
              <div className="text-xs text-slate-600">
                <p className="font-semibold text-slate-700">واتساب متصل</p>
                <p className="text-slate-500">جاهز للإشعارات</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen pt-16 lg:pt-0 relative z-10 pb-20 lg:pb-0">
        <div className="p-4 lg:p-6 xl:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
};

export default Layout;
"use client";

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  FileText,
  CreditCard,
  Grid3X3,
  Settings,
  Package,
  ArrowDownUp,
  BarChart3,
  Receipt,
  PieChart,
  LogOut,
  LayoutDashboard,
  User,
  Calculator,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const mainNavItems = [
  { path: "/", label: "الرئيسية", icon: LayoutDashboard, permission: null as string | null },
  { path: "/installments", label: "الأقساط", icon: CreditCard, permission: "view_installments" as const },
  { path: "/contracts", label: "العقود", icon: FileText, permission: "view_contracts" as const },
  { path: "/customers", label: "العملاء", icon: Users, permission: "view_customers" as const },
];

const moreItems = [
  { path: "/collection-reports", label: "تقارير التحصيل", icon: BarChart3, color: "from-violet-500 to-purple-600", permission: "view_installments" as const },
  { path: "/calculator", label: "حاسبة الأقساط", icon: Calculator, color: "from-indigo-500 to-violet-600", permission: null as string | null },
  { path: "/profile", label: "حسابي الشخصي", icon: User, color: "from-amber-500 to-orange-500", permission: null as string | null },
  { path: "/expenses", label: "المصروفات", icon: Receipt, color: "from-rose-500 to-pink-600", permission: "view_expenses" as const },
  { path: "/products", label: "المنتجات", icon: Package, color: "from-orange-500 to-red-500", permission: "view_products" as const },
  { path: "/inventory", label: "حركات المخزون", icon: ArrowDownUp, color: "from-teal-500 to-emerald-600", permission: "view_inventory" as const },
  { path: "/inventory-dashboard", label: "تقارير المخزون", icon: BarChart3, color: "from-cyan-500 to-blue-600", permission: "view_inventory" as const },
  { path: "/expense-reports", label: "تقارير المصروفات", icon: PieChart, color: "from-emerald-500 to-teal-500", permission: "view_expense_reports" as const },
  { path: "/users", label: "المستخدمين", icon: Users, color: "from-indigo-500 to-violet-600", permission: "view_users" as const },
  { path: "/settings", label: "الإعدادات العامة", icon: Settings, color: "from-slate-500 to-gray-500", permission: "view_settings" as const },
];

const MobileNav = () => {
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { hasPermission, logout } = useAuth();

  const visibleMainItems = mainNavItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  const visibleMoreItems = moreItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 safe-area-bottom shadow-xl shadow-slate-200/50 dark:shadow-black/30">
        <div className="flex items-center justify-around h-16 px-1">
          {visibleMainItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition-all duration-200 w-16 active:scale-95",
                  isActive
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  isActive
                    ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/25"
                    : "text-slate-400 dark:text-slate-500"
                )}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className={cn(
                  "text-[10px] font-semibold leading-tight tracking-tight",
                  isActive ? "text-violet-600 dark:text-violet-400" : "text-slate-400 dark:text-slate-500"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {visibleMoreItems.length > 0 && (
            <button
              onClick={() => setSheetOpen(true)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition-all duration-200 w-16 active:scale-95",
                sheetOpen ? "text-violet-600 dark:text-violet-400" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                sheetOpen
                  ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/25"
                  : "text-slate-400 dark:text-slate-500"
              )}>
                <Grid3X3 className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-semibold leading-tight text-slate-400 dark:text-slate-500">المزيد</span>
            </button>
          )}
        </div>
      </nav>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl pb-8 max-h-[80vh] overflow-y-auto bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-md">
                <Grid3X3 className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">الأدوات والإعدادات</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">الوصول السريع لبقية ميزات برنامج الأقساط</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {visibleMoreItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSheetOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3.5 rounded-2xl transition-all duration-200 active:scale-95 border",
                      isActive
                        ? "bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 shadow-sm"
                        : "bg-white dark:bg-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600"
                    )}
                  >
                    <div className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-br text-white",
                      item.color || "from-slate-500 to-gray-500"
                    )}>
                      <item.icon className="h-5.5 w-5.5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 text-center leading-tight">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200/60 dark:border-slate-800">
              <Button
                variant="ghost"
                onClick={() => { logout(); setSheetOpen(false); }}
                className="w-full justify-center gap-2 h-12 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-700 dark:hover:text-rose-300 active:scale-95 font-bold"
              >
                <LogOut className="h-5 w-5" />
                <span>تسجيل الخروج من النظام</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileNav;
"use client";

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
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
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const mainNavItems = [
  { path: "/", label: "الرئيسية", icon: Home },
  { path: "/customers", label: "العملاء", icon: Users },
  { path: "/contracts", label: "العقود", icon: FileText },
  { path: "/installments", label: "الأقساط", icon: CreditCard },
];

const moreItems = [
  { path: "/products", label: "المنتجات", icon: Package, color: "from-orange-500 to-red-500" },
  { path: "/inventory", label: "حركات المخزون", icon: ArrowDownUp, color: "from-teal-500 to-emerald-600" },
  { path: "/inventory-dashboard", label: "تقارير المخزون", icon: BarChart3, color: "from-cyan-500 to-blue-600" },
  { path: "/expenses", label: "المصروفات", icon: Receipt, color: "from-rose-500 to-pink-600" },
  { path: "/expense-reports", label: "تقارير المصروفات", icon: PieChart, color: "from-emerald-500 to-teal-500" },
  { path: "/settings", label: "الإعدادات", icon: Settings, color: "from-slate-500 to-gray-500" },
];

const MobileNav = () => {
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/90 backdrop-blur-xl border-t border-slate-200/80 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {mainNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200 w-16",
                  isActive
                    ? "text-violet-600"
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  isActive
                    ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/25"
                    : "text-slate-400"
                )}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className={cn(
                  "text-[10px] font-medium leading-tight",
                  isActive ? "text-violet-600 font-semibold" : "text-slate-400"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* المزيد */}
          <button
            onClick={() => setSheetOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200 w-16",
              sheetOpen ? "text-violet-600" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
              sheetOpen
                ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/25"
                : "text-slate-400"
            )}>
              <Grid3X3 className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium leading-tight text-slate-400">المزيد</span>
          </button>
        </div>
      </nav>

      {/* Bottom Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl pb-8 max-h-[70vh] overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <Grid3X3 className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">القائمة الكاملة</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {moreItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSheetOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-200/50"
                        : "bg-slate-50/50 hover:bg-slate-100/50 border border-transparent"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm bg-gradient-to-br text-white",
                      item.color
                    )}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-medium text-slate-700 text-center leading-tight">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileNav;
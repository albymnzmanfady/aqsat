"use client";

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useTheme } from "next-themes";
import MobileNav from "@/components/MobileNav";
import ScrollToTop from "@/components/ScrollToTop";
import TopBar from "@/components/TopBar";
import NotificationsDropdown from "@/components/NotificationsDropdown";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Users,
  CreditCard,
  FileText,
  Settings,
  Menu,
  Sparkles,
  Package,
  ArrowDownUp,
  BarChart3,
  Receipt,
  PieChart,
  LogOut,
  Shield,
  UserCog,
  LayoutDashboard,
  ChevronLeft,
  PanelLeftOpen,
  PanelLeftClose,
  Calculator,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const getStoredAvatar = (): string => {
  try {
    const stored = localStorage.getItem("app_user_profile");
    if (stored) return JSON.parse(stored).avatar || "";
  } catch {}
  return "";
};

const getCollapsedState = (): boolean => {
  try {
    const saved = localStorage.getItem("sidebar_collapsed");
    if (saved === "true") return true;
  } catch {}
  return false;
};

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(getCollapsedState);
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user, logout, hasPermission } = useAuth();
  const { settings } = useAppSettings();
  const { theme, setTheme } = useTheme();
  const [avatar, setAvatar] = useState(getStoredAvatar);

  useEffect(() => {
    setAvatar(getStoredAvatar());
  }, [location.pathname]);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  const toggleCollapse = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem("sidebar_collapsed", next.toString());
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navItems = [
    { path: "/", label: "الرئيسية", icon: LayoutDashboard, color: "from-violet-500 to-purple-600", permission: null as string | null },
    { path: "/customers", label: "العملاء", icon: Users, color: "from-blue-500 to-cyan-500", permission: "view_customers" as const },
    { path: "/contracts", label: "العقود", icon: FileText, color: "from-emerald-500 to-teal-500", permission: "view_contracts" as const },
    { path: "/installments", label: "الأقساط", icon: CreditCard, color: "from-amber-500 to-orange-500", permission: "view_installments" as const },
    { path: "/reports", label: "التقارير الشاملة", icon: BarChart3, color: "from-indigo-500 to-violet-600", permission: null as string | null },
    { path: "/collection-reports", label: "تقارير التحصيل", icon: PieChart, color: "from-violet-500 to-purple-600", permission: "view_installments" as const },
    { path: "/calculator", label: "حاسبة الأقساط", icon: Calculator, color: "from-indigo-500 to-violet-600", permission: null as string | null },
    {
      label: "المخازن",
      icon: Package,
      color: "from-orange-500 to-red-500",
      permission: "view_products" as const,
      subItems: [
        { path: "/products", label: "المنتجات", icon: Package, permission: "view_products" as const },
        { path: "/inventory", label: "حركات المخزون", icon: ArrowDownUp, permission: "view_inventory" as const },
        { path: "/inventory-dashboard", label: "التقارير", icon: BarChart3, permission: "view_inventory" as const },
      ],
    },
    {
      label: "المصروفات",
      icon: Receipt,
      color: "from-rose-500 to-pink-600",
      permission: "view_expenses" as const,
      subItems: [
        { path: "/expenses", label: "المصروفات", icon: Receipt, permission: "view_expenses" as const },
        { path: "/expense-reports", label: "التقارير", icon: PieChart, permission: "view_expense_reports" as const },
      ],
    },
    { path: "/users", label: "المستخدمين", icon: UserCog, color: "from-indigo-500 to-violet-600", permission: "view_users" as const },
    { path: "/settings", label: "الإعدادات", icon: Settings, color: "from-slate-500 to-gray-500", permission: "view_settings" as const },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (item.permission === null) return true;
    return hasPermission(item.permission);
  });

  const isActive = (path: string) => location.pathname === path;

  const renderNavItem = (item: typeof navItems[number]) => {
    if (item.subItems) {
      const visibleSubs = item.subItems.filter((sub) => {
        if (!sub.permission) return true;
        return hasPermission(sub.permission);
      });
      if (visibleSubs.length === 0) return null;

      if (sidebarCollapsed) {
        const firstSub = visibleSubs[0];
        const isParentActive = visibleSubs.some(s => isActive(s.path!));
        return (
          <Tooltip key={item.label} delayDuration={300}>
            <TooltipTrigger asChild>
              <Link to={firstSub.path!}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-center h-14 rounded-xl transition-all duration-200 relative",
                    isParentActive
                      ? "bg-gradient-to-l from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200"
                  )}
                >
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center",
                    isParentActive
                      ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
                      : "bg-slate-200/70 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300"
                  )}>
                    <item.icon className="h-5 w-5" />
                  </div>
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="left" className="rounded-xl text-sm">
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        );
      }

      return (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
            <div className={`w-1 h-4 rounded-full bg-gradient-to-b ${item.color}`} />
            <span>{item.label}</span>
          </div>
          {visibleSubs.map((sub) => {
            const subActive = sub.path ? isActive(sub.path) : false;
            return (
              <Link key={sub.path} to={sub.path}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-12 rounded-xl transition-all duration-200 relative pr-8",
                    subActive
                      ? "bg-gradient-to-l from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200"
                  )}
                >
                  {subActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-violet-500 to-purple-600 rounded-l-full" />
                  )}
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0",
                    subActive
                      ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
                      : "bg-slate-200/70 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300"
                  )}>
                    <sub.icon className="h-5 w-5" />
                  </div>
                  <span className="flex-1 text-right truncate">{sub.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      );
    }

    const isItemActive = isActive(item.path!);

    if (sidebarCollapsed) {
      return (
        <Tooltip key={item.path} delayDuration={300}>
          <TooltipTrigger asChild>
            <Link to={item.path} title={item.label}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-center h-14 rounded-xl transition-all duration-200 relative",
                  isItemActive
                    ? "bg-gradient-to-l from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200"
                )}
              >
                <div className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center",
                  isItemActive
                    ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
                    : "bg-slate-200/70 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300"
                )}>
                  <item.icon className="h-5 w-5" />
                </div>
                {isItemActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-violet-500 to-purple-600 rounded-l-full" />
                )}
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="left" className="rounded-xl text-sm">
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Link key={item.path} to={item.path}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 h-12 rounded-xl transition-all duration-200 relative active:scale-[0.98]",
            isItemActive
              ? "bg-gradient-to-l from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400 font-semibold"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200"
          )}
        >
          {isItemActive && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-violet-500 to-purple-600 rounded-l-full" />
          )}
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0",
            isItemActive
              ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
              : "bg-slate-200/70 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300"
          )}>
            <item.icon className="h-5 w-5" />
          </div>
          <span className="flex-1 text-right truncate">{item.label}</span>
          {isItemActive && (
            <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse flex-shrink-0" />
          )}
        </Button>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 dark:from-[#05070c] dark:via-[#0a0d14] dark:to-[#05070c] flex dot-grid-bg dark:bg-[#05070c]">
      {/* Decorative backgrounds - hidden in dark mode */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none dark:hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-blue-200/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-200/5 rounded-full blur-3xl" />
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-[#0a0d14]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 z-40">
        <div className="flex items-center justify-between px-4 h-full">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="h-10 w-10 rounded-xl active:scale-90 text-slate-600 dark:text-slate-400"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt={settings.appName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-100">{settings.appName}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-10 w-10 rounded-xl active:scale-90 text-slate-600 dark:text-slate-400"
            >
              {theme === "dark" ? (
                <span className="text-amber-400">☀</span>
              ) : (
                <span>☾</span>
              )}
            </Button>
            <NotificationsDropdown />
            <Link to="/profile">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm overflow-hidden",
                "bg-gradient-to-br from-amber-500 to-orange-500"
              )}>
                {avatar ? (
                  <img src={avatar} alt="الصورة" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || "م"
                )}
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-all duration-300",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex fixed top-0 right-0 h-full z-50 border-l border-slate-200 dark:border-slate-800 flex-col",
          "bg-white dark:bg-[#0a0d14] transition-all duration-300 ease-out",
          sidebarCollapsed ? "w-20" : "w-72"
        )}
      >
        {/* Sidebar Header */}
        <div className={cn(
          "p-5 border-b border-slate-100 dark:border-slate-800 flex items-center",
          sidebarCollapsed ? "justify-center" : "justify-between"
        )}>
          {sidebarCollapsed ? (
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt={settings.appName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
                  {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt={settings.appName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="font-bold text-slate-800 dark:text-slate-100 text-lg tracking-tight">{settings.appName}</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">نظام إدارة الأقساط</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCollapse}
                className="h-8 w-8 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* User Card */}
        {!sidebarCollapsed && (
          <div className="p-4">
            <Link to="/profile">
              <div className="rounded-2xl relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-500 p-4 hover:opacity-90 transition-opacity cursor-pointer active:scale-[0.98]">
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
                  <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-white/10 rounded-full" />
                </div>
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg border border-white/30 flex-shrink-0 overflow-hidden">
                    {avatar ? (
                      <img src={avatar} alt="الصورة" className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0) || "م"
                    )}
                  </div>
                  <div className="text-white min-w-0">
                    <p className="font-semibold text-sm truncate">{user?.name || "مستخدم"}</p>
                    <p className="text-xs text-white/80 flex items-center gap-1">
                      <Shield className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">
                        {user ? (user.role === "admin" ? "مدير النظام" : user.role === "supervisor" ? "مشرف مالي" : "محصل") : ""}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {sidebarCollapsed && (
          <div className="p-3 flex justify-center">
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Link to="/profile">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                    {avatar ? (
                      <img src={avatar} alt="الصورة" className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0) || "م"
                    )}
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="left" className="rounded-xl text-sm">
                <p>{user?.name}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto overflow-x-hidden scroll-smooth">
          {!sidebarCollapsed && (
            <p className="px-4 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider">القائمة الرئيسية</p>
          )}

          {filteredNavItems.map(renderNavItem)}

          {!sidebarCollapsed && (
            <div className="pt-4">
              <Button
                variant="ghost"
                onClick={toggleCollapse}
                className="w-full justify-start gap-3 h-11 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 active:scale-[0.98]"
              >
                <PanelLeftClose className="h-4 w-4" />
                <span>تصغير القائمة</span>
              </Button>
            </div>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className={cn("p-3 border-t border-slate-100 dark:border-slate-800", sidebarCollapsed ? "flex justify-center" : "")}>
          {sidebarCollapsed ? (
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="h-11 w-11 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 active:scale-90"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="rounded-xl text-sm">
                <p>تسجيل الخروج</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full justify-start gap-3 h-11 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 active:scale-[0.98]"
            >
              <LogOut className="h-4 w-4" />
              <span>تسجيل الخروج</span>
            </Button>
          )}
        </div>
      </aside>

      {/* Sidebar expand button */}
      {sidebarCollapsed && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className="hidden lg:flex fixed top-4 right-[88px] z-50 h-8 w-8 rounded-lg bg-white dark:bg-[#0a0d14] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 active:scale-90"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </Button>
      )}

      {/* Desktop TopBar */}
      <TopBar />

      {/* Main Content */}
      <main className={cn(
        "flex-1 min-h-screen pt-16 lg:pt-16 relative z-10 pb-20 lg:pb-0 transition-all duration-300",
        sidebarCollapsed ? "lg:mr-20" : "lg:mr-72"
      )}>
        <div
          key={location.pathname}
          className="max-w-7xl mx-auto p-4 lg:p-6 xl:p-8 page-enter-animation page-wrapper"
        >
          {children}
        </div>
      </main>

      <ScrollToTop />
      <MobileNav />
    </div>
  );
};

export default Layout;
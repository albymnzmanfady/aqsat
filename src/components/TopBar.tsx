"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { useAppSettings } from "@/hooks/useAppSettings";
import NotificationsDropdown from "@/components/NotificationsDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sun,
  Moon,
  Monitor,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Shield,
} from "lucide-react";

const roleLabels: Record<string, string> = {
  admin: "مدير النظام",
  supervisor: "مشرف مالي",
  collector: "محصل",
};

const roleColors: Record<string, string> = {
  admin: "from-amber-500 to-orange-500",
  supervisor: "from-blue-500 to-cyan-500",
  collector: "from-emerald-500 to-teal-500",
};

const TopBar = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { settings } = useAppSettings();
  const navigate = useNavigate();
  const [themeOpen, setThemeOpen] = useState(false);

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <header className="hidden lg:flex fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 z-30">
      {/* Spacer for sidebar */}
      <div className="flex-1" />

      {/* Right side actions */}
      <div className="flex items-center gap-3 px-6">
        {/* Notifications */}
        <NotificationsDropdown />

        {/* Theme Toggle */}
        <DropdownMenu open={themeOpen} onOpenChange={setThemeOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-800 active:scale-90 transition-all"
            >
              <ThemeIcon className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 rounded-2xl p-1.5 shadow-xl border border-slate-200 bg-white"
            sideOffset={8}
          >
            {[
              { value: "light", label: "فاتح", icon: Sun, desc: "واجهة فاتحة" },
              { value: "dark", label: "داكن", icon: Moon, desc: "واجهة داكنة" },
              { value: "system", label: "تلقائي", icon: Monitor, desc: "حسب الجهاز" },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = theme === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-right",
                    isActive
                      ? "bg-gradient-to-l from-violet-500/10 to-purple-500/10 text-violet-600"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    isActive
                      ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-500"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-right">
                    <p className={cn("text-sm font-medium", isActive ? "text-violet-600" : "text-slate-700")}>
                      {t.label}
                    </p>
                    <p className="text-[10px] text-slate-400">{t.desc}</p>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-violet-500 mr-auto flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Separator */}
        <div className="w-px h-8 bg-slate-200" />

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 pl-3 pr-1 py-1 rounded-2xl hover:bg-slate-100 transition-all duration-200 active:scale-[0.98]">
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-800 leading-tight">
                  {user?.name || "مستخدم"}
                </p>
                <p className="text-[11px] text-slate-500 leading-tight flex items-center gap-1">
                  <Shield className="h-3 w-3 flex-shrink-0" />
                  {user ? roleLabels[user.role] || user.role : ""}
                </p>
              </div>
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg bg-gradient-to-br flex-shrink-0",
                roleColors[user?.role || "admin"]
              )}>
                {user?.name?.charAt(0) || "م"}
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-64 rounded-2xl p-1.5 shadow-xl border border-slate-200 bg-white"
            sideOffset={8}
          >
            {/* User Info Header */}
            <div className="px-3 py-3 mb-1">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg bg-gradient-to-br flex-shrink-0",
                  roleColors[user?.role || "admin"]
                )}>
                  {user?.name?.charAt(0) || "م"}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                  <Badge className="mt-1 rounded-lg border-0 text-[10px] bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                    {user ? roleLabels[user.role] || user.role : ""}
                  </Badge>
                </div>
              </div>
            </div>

            <DropdownMenuSeparator className="bg-slate-100" />

            <DropdownMenuItem
              onClick={() => navigate("/settings")}
              className="cursor-pointer rounded-xl gap-3 px-3 py-2.5 text-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <Settings className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="font-medium">الإعدادات</p>
                <p className="text-[10px] text-slate-400">تخصيص البرنامج</p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate("/users")}
              className="cursor-pointer rounded-xl gap-3 px-3 py-2.5 text-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <User className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="font-medium">حسابي</p>
                <p className="text-[10px] text-slate-400">إدارة الحساب</p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-slate-100" />

            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer rounded-xl gap-3 px-3 py-2.5 text-sm text-red-600 focus:text-red-600"
            >
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <LogOut className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="font-medium">تسجيل الخروج</p>
                <p className="text-[10px] text-red-400">إنهاء الجلسة</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopBar;
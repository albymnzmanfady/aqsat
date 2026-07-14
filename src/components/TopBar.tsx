"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import NotificationsDropdown from "@/components/NotificationsDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Settings,
  LogOut,
  User,
  ChevronDown,
  Shield,
  Sun,
  Moon,
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

const getStoredAvatar = (): string => {
  try {
    const stored = localStorage.getItem("app_user_profile");
    if (stored) return JSON.parse(stored).avatar || "";
  } catch {}
  return "";
};

const TopBar = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(getStoredAvatar);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="hidden lg:flex fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-[#0a0d14]/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800 z-30">
      <div className="flex-1" />

      <div className="flex items-center gap-3 px-6">
        <NotificationsDropdown />

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-10 w-10 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 active:scale-90 transition-all"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 text-amber-400" />
          ) : (
            <Moon className="h-5 w-5 text-slate-600" />
          )}
        </Button>

        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 pl-3 pr-1 py-1 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 active:scale-[0.98]">
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                  {user?.name || "مستخدم"}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight flex items-center gap-1">
                  <Shield className="h-3 w-3 flex-shrink-0" />
                  {user ? roleLabels[user.role] || user.role : ""}
                </p>
              </div>
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden",
                "bg-gradient-to-br",
                roleColors[user?.role || "admin"]
              )}>
                {avatar ? (
                  <img src={avatar} alt="الصورة" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || "م"
                )}
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-64 rounded-2xl p-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0d14]"
            sideOffset={8}
          >
            <div className="px-3 py-3 mb-1">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden",
                  "bg-gradient-to-br",
                  roleColors[user?.role || "admin"]
                )}>
                  {avatar ? (
                    <img src={avatar} alt="الصورة" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0) || "م"
                  )}
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                  <Badge className="mt-1 rounded-lg border-0 text-[10px] bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                    {user ? roleLabels[user.role] || user.role : ""}
                  </Badge>
                </div>
              </div>
            </div>

            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />

            <DropdownMenuItem
              onClick={() => navigate("/profile")}
              className="cursor-pointer rounded-xl gap-3 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300"
            >
              <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center">
                <User className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="font-medium">حسابي</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">تعديل الملف الشخصي</p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate("/settings")}
              className="cursor-pointer rounded-xl gap-3 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Settings className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <p className="font-medium">الإعدادات</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">تخصيص البرنامج</p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />

            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer rounded-xl gap-3 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/50 flex items-center justify-center">
                <LogOut className="h-4 w-4 text-red-500 dark:text-red-400" />
              </div>
              <div>
                <p className="font-medium">تسجيل الخروج</p>
                <p className="text-[10px] text-red-400 dark:text-red-500">إنهاء الجلسة</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopBar;
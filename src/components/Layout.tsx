"use client";

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  CreditCard,
  FileText,
  Settings,
  Wallet,
  Bell,
  Menu,
  X,
  LogOut,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: "/", label: "الرئيسية", icon: Home },
    { path: "/customers", label: "العملاء والضامنين", icon: Users },
    { path: "/contracts", label: "العقود", icon: FileText },
    { path: "/installments", label: "الأقساط", icon: CreditCard },
    { path: "/settings", label: "الإعدادات", icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white z-40 border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-4 h-full">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="h-10 w-10"
            >
              <Menu className="h-5 w-5 text-slate-600" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Wallet className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-base font-bold text-slate-800">إدارة الأقساط</h1>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="relative h-10 w-10">
            <Bell className="h-5 w-5 text-slate-600" />
            <span className="absolute top-1.5 left-1.5 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-medium">
              3
            </span>
          </Button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar - Fixed on Right */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-md lg:border-l lg:border-slate-200 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-800 text-lg">إدارة الأقساط</h1>
                <p className="text-xs text-slate-500">نظام إدارة الأقساط</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5 text-slate-500" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive(item.path) ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 h-12 rounded-xl transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className={`h-5 w-5 ${isActive(item.path) ? "text-blue-600" : "text-slate-400"}`} />
                <span className="flex-1 text-right">{item.label}</span>
                {isActive(item.path) && (
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                )}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-5 w-5" />
            <span>تسجيل الخروج</span>
          </Button>
        </div>
      </aside>

      {/* Main Content - Left Side */}
      <main className="flex-1 min-h-screen pt-16 lg:pt-0">
        <div className="p-4 lg:p-6 xl:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
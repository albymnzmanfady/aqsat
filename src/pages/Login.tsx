"use client";

import { useState } from "react";
import { useAppSettings } from "@/hooks/useAppSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { Sparkles, Lock, Mail, Eye, EyeOff, LogIn, Code, Heart } from "lucide-react";
import { showError } from "@/utils/toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { settings } = useAppSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { showError("أدخل البريد وكلمة المرور"); return; }
    setLoading(true);
    try {
      const user = await api.users.login(email, password);
      localStorage.setItem("auth_user", JSON.stringify(user));
      window.location.href = "/";
    } catch { showError("البريد أو كلمة المرور غير صحيحة"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 flex flex-col items-center justify-center p-4 relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
      </div>
      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30 mx-auto mb-4 overflow-hidden">
            {settings.logoUrl ? <img src={settings.logoUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center"><Sparkles className="h-10 w-10 text-white" /></div>}
          </div>
          <h1 className="text-3xl font-bold text-slate-800">{settings.appName || "أقساط"}</h1>
          <p className="text-slate-500 mt-1">نظام إدارة الأقساط والتحصيل</p>
          {settings.companyName && <p className="text-sm text-slate-400 mt-2">{settings.companyName}</p>}
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-white/20 p-8 w-full">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pr-12 rounded-2xl h-12" placeholder="admin@system.com" dir="ltr" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="pr-12 rounded-2xl h-12" placeholder="••••••••" dir="ltr" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/30 gap-2">
              {loading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <LogIn className="h-5 w-5" />}تسجيل الدخول
            </Button>
          </form>
          <div className="mt-6 p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-2 text-center">حسابات تجريبية</p>
            <div className="space-y-1.5">
              {[
                { label: "المدير", email: "admin@system.com", password: "admin123" },
                { label: "المشرف", email: "supervisor@system.com", password: "super123" },
                { label: "المحصل", email: "collector@system.com", password: "collect123" },
              ].map((acc) => (
                <button key={acc.label} type="button" onClick={() => { setEmail(acc.email); setPassword(acc.password); }} className="w-full text-right text-xs text-slate-600 hover:text-violet-600 bg-white/50 hover:bg-white rounded-lg px-3 py-2 transition-colors border border-transparent hover:border-violet-200">
                  <span className="font-medium">{acc.label}:</span> {acc.email} / {acc.password}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"><Code className="h-4 w-4 text-white" /></div>
            <div className="text-right"><p className="text-sm font-semibold text-slate-600">Alaa Ali</p><p className="text-xs text-slate-400" dir="ltr">01016087027</p></div>
          </div>
          <div className="flex items-center justify-center gap-1 text-xs text-slate-400"><span>صُنع بـ</span><Heart className="h-3 w-3 text-rose-400 fill-rose-400" /><span>© {new Date().getFullYear()} {settings.appName || "أقساط"}</span></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
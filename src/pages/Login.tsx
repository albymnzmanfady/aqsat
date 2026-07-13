"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Lock, Mail, Eye, EyeOff, LogIn } from "lucide-react";
import { showError } from "@/utils/toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate("/");
    } else {
      showError(result.error || "حدث خطأ");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 flex items-center justify-center p-4 relative">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30 mx-auto mb-4">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">أقساط</h1>
          <p className="text-slate-500 mt-1">نظام إدارة الأقساط والتحصيل</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                البريد الإلكتروني
              </Label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pr-12 rounded-2xl h-12 bg-white/50 border-slate-200/50 focus:border-violet-300 focus:ring-violet-200"
                  placeholder="admin@system.com"
                  dir="ltr"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                كلمة المرور
              </Label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-12 rounded-2xl h-12 bg-white/50 border-slate-200/50 focus:border-violet-300 focus:ring-violet-200"
                  placeholder="••••••••"
                  dir="ltr"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/30 text-base gap-2"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn className="h-5 w-5" />
              )}
              تسجيل الدخول
            </Button>
          </form>

          {/* Quick login hints */}
          <div className="mt-6 p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-2 text-center">حسابات تجريبية</p>
            <div className="space-y-1.5">
              {[
                { label: "المدير", email: "admin@system.com", password: "admin123" },
                { label: "المشرف المالي", email: "supervisor@system.com", password: "super123" },
                { label: "المحصل", email: "collector@system.com", password: "collect123" },
              ].map((acc) => (
                <button
                  key={acc.label}
                  type="button"
                  onClick={() => { setEmail(acc.email); setPassword(acc.password); }}
                  className="w-full text-right text-xs text-slate-600 hover:text-violet-600 bg-white/50 hover:bg-white rounded-lg px-3 py-2 transition-colors border border-transparent hover:border-violet-200"
                >
                  <span className="font-medium">{acc.label}:</span> {acc.email} / {acc.password}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
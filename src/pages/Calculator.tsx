"use client";

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useAppSettings } from "@/hooks/useAppSettings";
import { showSuccess } from "@/utils/toast";
import {
  Calculator as CalcIcon,
  Sparkles,
  Wallet,
  CreditCard,
  Printer,
  ArrowRight,
  TrendingDown,
  Clock,
  FileText,
  Info,
  Zap,
  Minus,
} from "lucide-react";

const SCENARIOS = [12, 18, 24];

const Calculator = () => {
  const navigate = useNavigate();
  const { settings } = useAppSettings();
  const [price, setPrice] = useState(30000);
  const [downPayment, setDownPayment] = useState(5000);
  const [interestRate, setInterestRate] = useState(15);
  const [months, setMonths] = useState(12);

  const clampedDown = Math.min(downPayment, price);
  const financing = price - clampedDown;
  const interestAmount = Math.round(financing * (interestRate / 100));
  const total = financing + interestAmount;
  const monthlyPayment = months > 0 ? Math.round(total / months) : 0;
  const downPercent = price > 0 ? Math.round((clampedDown / price) * 100) : 0;

  const scenarioData = useMemo(() => {
    return SCENARIOS.map((m) => {
      const intAmt = Math.round(financing * (interestRate / 100));
      const tot = financing + intAmt;
      const monthly = m > 0 ? Math.round(tot / m) : 0;
      return { months: m, monthly, interest: intAmt, total: tot };
    });
  }, [financing, interestRate]);

  const minInterest = Math.min(...scenarioData.map((s) => s.interest));
  const maxInterest = Math.max(...scenarioData.map((s) => s.interest));

  const schedule = useMemo(() => {
    const start = new Date();
    start.setMonth(start.getMonth() + 1);
    start.setDate(15);
    return Array.from({ length: months }, (_, i) => {
      const d = new Date(start);
      d.setMonth(d.getMonth() + i);
      const monthNames = ["يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
      return { num: i + 1, date: `${d.getDate()} ${monthNames[d.getMonth()]}`, amount: monthlyPayment };
    });
  }, [months, monthlyPayment]);

  const handlePrint = () => {
    const rows = schedule.map((s) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:600;">${s.num}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${s.date}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:700;">${s.amount.toLocaleString()} ج.م</td>
      </tr>
    `).join("");

    const scenarioRows = scenarioData.map((s) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:600;">${s.months} شهر</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:700;">${s.monthly.toLocaleString()} ج.م</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;color:#ef4444;">${s.interest.toLocaleString()} ج.م</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:700;">${s.total.toLocaleString()} ج.م</td>
      </tr>
    `).join("");

    const html = `
      <div style="font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;text-align:right;color:#1e293b;max-width:800px;margin:0 auto;">
        <div style="text-align:center;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #8b5cf6;">
          ${settings.logoUrl ? `<img src="${settings.logoUrl}" alt="" style="width:60px;height:60px;border-radius:16px;object-fit:cover;margin-bottom:8px;">` : ""}
          <h1 style="font-size:22px;font-weight:700;color:#1e293b;margin:0;">${settings.companyName || settings.appName}</h1>
          <h2 style="font-size:17px;font-weight:600;color:#6366f1;margin:6px 0;">حاسبة الأقساط</h2>
          <p style="font-size:11px;color:#94a3b8;">تاريخ الحساب: ${new Date().toLocaleDateString("ar-EG")}</p>
        </div>
        <div style="margin-bottom:20px;">
          <h3 style="font-size:14px;font-weight:600;color:#6366f1;margin-bottom:10px;">البيانات الأساسية</h3>
          <table style="width:100%;border-collapse:collapse;font-size:13px;border:1px solid #e2e8f0;">
            <tr style="background:#f8fafc;"><td style="padding:10px 16px;">سعر المنتج</td><td style="padding:10px 16px;font-weight:700;">${price.toLocaleString()} ج.م</td></tr>
            <tr><td style="padding:10px 16px;">الدفعة المقدمة</td><td style="padding:10px 16px;font-weight:700;">${clampedDown.toLocaleString()} ج.م (${downPercent}%)</td></tr>
            <tr style="background:#f8fafc;"><td style="padding:10px 16px;">التمويل</td><td style="padding:10px 16px;font-weight:700;">${financing.toLocaleString()} ج.م</td></tr>
            <tr><td style="padding:10px 16px;">نسبة الفائدة</td><td style="padding:10px 16px;font-weight:700;color:#f59e0b;">${interestRate}% سنوياً</td></tr>
            <tr style="background:#f8fafc;"><td style="padding:10px 16px;">الإجمالي الكلي</td><td style="padding:10px 16px;font-weight:700;color:#8b5cf6;">${total.toLocaleString()} ج.م</td></tr>
            <tr><td style="padding:10px 16px;">القسط الشهري</td><td style="padding:10px 16px;font-weight:700;color:#10b981;font-size:16px;">${monthlyPayment.toLocaleString()} ج.م × ${months} شهر</td></tr>
          </table>
        </div>
        <div style="margin-bottom:20px;">
          <h3 style="font-size:14px;font-weight:600;color:#6366f1;margin-bottom:10px;">مقارنة السيناريوهات</h3>
          <table style="width:100%;border-collapse:collapse;font-size:12px;border:1px solid #e2e8f0;">
            <thead><tr style="background:#4f46e5;color:white;">
              <th style="padding:10px 12px;text-align:center;">المدة</th>
              <th style="padding:10px 12px;text-align:center;">القسط الشهري</th>
              <th style="padding:10px 12px;text-align:center;">الفوائد</th>
              <th style="padding:10px 12px;text-align:center;">الإجمالي</th>
            </tr></thead>
            <tbody>${scenarioRows}</tbody>
          </table>
        </div>
        <div style="margin-bottom:20px;">
          <h3 style="font-size:14px;font-weight:600;color:#6366f1;margin-bottom:10px;">جدول الأقساط (${months} شهر)</h3>
          <table style="width:100%;border-collapse:collapse;font-size:12px;border:1px solid #e2e8f0;">
            <thead><tr style="background:#8b5cf6;color:white;">
              <th style="padding:10px 12px;text-align:center;">رقم القسط</th>
              <th style="padding:10px 12px;text-align:center;">التاريخ</th>
              <th style="padding:10px 12px;text-align:center;">المبلغ</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div style="text-align:center;margin-top:24px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:10px;color:#94a3b8;">
          ${settings.companyName ? settings.companyName + " | " : ""}نظام ${settings.appName} - حاسبة الأقساط
        </div>
      </div>
    `;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>حاسبة الأقساط</title><style>@page{margin:15mm;size:A4}*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;text-align:right;color:#1e293b;line-height:1.6;background:white;padding:20px}</style></head><body>${html}<script>window.onload=function(){window.print()}<\/script></body></html>`);
    win.document.close();
  };

  const handleConvertToContract = () => {
    navigate("/contracts");
    showSuccess("تم التحويل لصفحة العقود - يمكنك إنشاء عقد جديد بالبيانات المحسوبة");
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="relative">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full opacity-20 blur-xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
              <CalcIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100">حاسبة الأقساط الذكية</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">محاكاة ومقارنة خطط التمويل للعملاء</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} className="rounded-xl h-11 gap-2">
            <Printer className="h-4 w-4" />
            طباعة العرض
          </Button>
          <Button onClick={handleConvertToContract} className="rounded-xl h-11 gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-md">
            <ArrowRight className="h-4 w-4 rotate-180" />
            تحويل لعقد
          </Button>
        </div>
      </div>

      {/* Banner الرئيسي */}
      <Card className="mb-8 border-0 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 text-white overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-indigo-500/20 rounded-full blur-xl" />
        </div>
        <CardContent className="p-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-5">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 flex-shrink-0">
                <Wallet className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm text-purple-100 font-medium mb-1">القسط الشهري المقدر</p>
                <div className="flex items-baseline gap-3">
                  <p className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-none">{monthlyPayment.toLocaleString()}</p>
                  <p className="text-sm text-purple-200 font-medium">ج.م × {months} شهر</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 md:mr-auto">
              <Button onClick={handlePrint} className="rounded-xl h-10 bg-white/95 hover:bg-white text-slate-800 shadow-md gap-2 font-bold text-sm">
                <Printer className="h-4 w-4" />
                طباعة
              </Button>
              <Button onClick={handleConvertToContract} className="rounded-xl h-10 bg-emerald-500 hover:bg-emerald-600 text-white shadow-md gap-2 font-bold text-sm">
                <ArrowRight className="h-4 w-4 rotate-180" />
                عقد
              </Button>
            </div>
          </div>
          <div className="h-px bg-white/15" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <p className="text-[11px] text-purple-200 mb-1">سعر المنتج</p>
              <p className="font-extrabold text-sm">{price.toLocaleString()} <span className="text-[10px] font-normal text-purple-200">ج.م</span></p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <p className="text-[11px] text-purple-200 mb-1">المقدم ({downPercent}%)</p>
              <p className="font-extrabold text-sm">{clampedDown.toLocaleString()} <span className="text-[10px] font-normal text-purple-200">ج.م</span></p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <p className="text-[11px] text-purple-200 mb-1">التمويل</p>
              <p className="font-extrabold text-sm">{financing.toLocaleString()} <span className="text-[10px] font-normal text-purple-200">ج.م</span></p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <p className="text-[11px] text-purple-200 mb-1">الإجمالي الكلي</p>
              <p className="font-extrabold text-sm text-amber-300">{total.toLocaleString()} <span className="text-[10px] font-normal text-amber-200">ج.م</span></p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* المحتوى الرئيسي */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* العمود الأيسر */}
        <div className="space-y-6">
          {/* محددات التمويل */}
          <Card className="border-0 bg-white/80 dark:bg-[#0f131a] backdrop-blur-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">محددات التمويل</h3>
              </div>

              <div className="space-y-6">
                {/* سعر المنتج */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">سعر المنتج</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setPrice(v);
                          setDownPayment(Math.min(downPayment, v));
                        }}
                        className="w-28 h-8 text-center text-sm font-bold rounded-lg border border-violet-200 focus:ring-violet-500 focus:border-violet-300 bg-slate-50/50 dark:bg-[#0a0d14] dark:border-slate-700 dark:text-slate-100 outline-none transition-all"
                      />
                      <span className="text-[10px] text-slate-400 min-w-[40px]">ج.م</span>
                    </div>
                  </div>
                  <Slider
                    value={[price]}
                    onValueChange={(val) => {
                      const v = val[0];
                      setPrice(v);
                      setDownPayment(Math.min(downPayment, v));
                    }}
                    min={1000}
                    max={200000}
                    step={1000}
                    className="w-full"
                  />
                </div>

                {/* الدفعة المقدمة */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">الدفعة المقدمة</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={clampedDown}
                        onChange={(e) => setDownPayment(Math.min(Number(e.target.value), price))}
                        className="w-28 h-8 text-center text-sm font-bold rounded-lg border border-emerald-200 focus:ring-emerald-500 focus:border-emerald-300 bg-slate-50/50 dark:bg-[#0a0d14] dark:border-slate-700 dark:text-slate-100 outline-none transition-all"
                      />
                      <span className="text-[10px] text-slate-400 min-w-[40px]">{downPercent}%</span>
                    </div>
                  </div>
                  <Slider
                    value={[clampedDown]}
                    onValueChange={(val) => setDownPayment(val[0])}
                    min={0}
                    max={price}
                    step={500}
                    className="w-full"
                  />
                </div>

                {/* نسبة الفائدة */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">نسبة الفائدة السنوية</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={interestRate}
                        onChange={(e) => setInterestRate(Math.min(50, Math.max(0, Number(e.target.value))))}
                        min={0}
                        max={50}
                        className="w-20 h-8 text-center text-sm font-bold rounded-lg border border-amber-200 focus:ring-amber-500 focus:border-amber-300 bg-slate-50/50 dark:bg-[#0a0d14] dark:border-slate-700 dark:text-slate-100 outline-none transition-all"
                      />
                      <span className="text-[10px] text-slate-400 min-w-[40px]">% سنوياً</span>
                    </div>
                  </div>
                  <Slider
                    value={[interestRate]}
                    onValueChange={(val) => setInterestRate(val[0])}
                    min={0}
                    max={50}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                {/* فترة السداد */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">فترة السداد</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={months}
                        onChange={(e) => setMonths(Math.max(3, Math.min(48, Number(e.target.value))))}
                        min={3}
                        max={48}
                        className="w-20 h-8 text-center text-sm font-bold rounded-lg border border-blue-200 focus:ring-blue-500 focus:border-blue-300 bg-slate-50/50 dark:bg-[#0a0d14] dark:border-slate-700 dark:text-slate-100 outline-none transition-all"
                      />
                      <span className="text-[10px] text-slate-400 min-w-[40px]">شهر</span>
                    </div>
                  </div>
                  <Slider
                    value={[months]}
                    onValueChange={(val) => setMonths(val[0])}
                    min={3}
                    max={48}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* مقارنة السيناريوهات */}
          <Card className="border-0 bg-white/80 dark:bg-[#0f131a] backdrop-blur-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="5" cy="6" r="3"/><path d="M12 6h5a2 2 0 0 1 2 2v7"/><path d="m15 9-3-3 3-3"/><circle cx="19" cy="18" r="3"/><path d="M12 18H7a2 2 0 0 1-2-2V9"/><path d="m9 15 3 3-3 3"/></svg>
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">مقارنة السيناريوهات</h3>
                </div>
                <Badge className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-0 rounded-lg text-[10px] gap-1">
                  <Zap className="h-3 w-3" />
                  اضغط للتطبيق
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {scenarioData.map((s) => {
                  const isMin = s.interest === minInterest;
                  const isMax = s.interest === maxInterest;
                  const isActive = s.months === months;
                  return (
                    <button
                      key={s.months}
                      onClick={() => setMonths(s.months)}
                      className={cn(
                        "relative p-4 rounded-2xl transition-all duration-200 border-2 active:scale-[0.97] text-center",
                        isActive
                          ? "bg-violet-50 dark:bg-violet-950/30 border-violet-300 dark:border-violet-700"
                          : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50/30 dark:hover:bg-violet-950/20"
                      )}
                    >
                      <div className="flex justify-center gap-1 mb-2 min-h-[18px]">
                        {isMin && <span className="text-[8px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">أقل فوائد</span>}
                        {isMax && !isMin && <span className="text-[8px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full">أخف قسط</span>}
                      </div>
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 transition-all", isActive ? "bg-violet-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400")}>
                        <Clock className="h-5 w-5" />
                      </div>
                      <p className="font-extrabold text-base mb-0.5 text-slate-800 dark:text-slate-100">{s.months} شهر</p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 mb-3">
                        {isMin ? "أسرع سداد" : isMax ? "أشهر راحة" : "خيار وسط"}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400">القسط</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-100">{s.monthly.toLocaleString()}</span>
                        </div>
                        <div className="h-px bg-slate-100 dark:bg-slate-700" />
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400">الفوائد</span>
                          <span className="font-bold text-rose-500">{s.interest.toLocaleString()}</span>
                        </div>
                        <div className="h-px bg-slate-100 dark:bg-slate-700" />
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400">الإجمالي</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-100">{s.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-blue-500" />
                  الفرق بين الأقل والأعلى فوائد: <strong className="text-rose-600">{(maxInterest - minInterest).toLocaleString()} ج.م</strong>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* العمود الأيمن */}
        <div className="space-y-6">
          {/* جدول الأقساط */}
          <Card className="border-0 bg-white/80 dark:bg-[#0f131a] backdrop-blur-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">جدول الأقساط</h3>
              </div>
              <Badge className="bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border-0 rounded-lg text-[10px]">
                {months} قسط × {monthlyPayment.toLocaleString()} ج.م
              </Badge>
            </div>
            <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
              {schedule.map((s) => (
                <div key={s.num} className="flex items-center justify-between px-6 py-2.5 hover:bg-violet-50/40 dark:hover:bg-violet-950/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 font-extrabold flex items-center justify-center text-[10px]">{s.num}</div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{s.date}</span>
                  </div>
                  <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100">{s.amount.toLocaleString()} ج.م</span>
                </div>
              ))}
            </div>
          </Card>

          {/* مقارنة سريعة */}
          <Card className="border-0 bg-white/80 dark:bg-[#0f131a] backdrop-blur-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="5" cy="6" r="3"/><path d="M12 6h5a2 2 0 0 1 2 2v7"/><path d="m15 9-3-3 3-3"/><circle cx="19" cy="18" r="3"/><path d="M12 18H7a2 2 0 0 1-2-2V9"/><path d="m9 15 3 3-3 3"/></svg>
                </div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">مقارنة سريعة</h3>
              </div>
              <Badge className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-0 rounded-lg text-[10px]">3 خيارات</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
                    <th className="text-center py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">المدة</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">القسط الشهري</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">الفوائد</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">الإجمالي</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">التقييم</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarioData.map((s) => {
                    const isMin = s.interest === minInterest;
                    const isMax = s.interest === maxInterest;
                    const isActive = s.months === months;
                    return (
                      <tr
                        key={s.months}
                        onClick={() => setMonths(s.months)}
                        className={cn(
                          "border-b border-slate-50 dark:border-slate-800/50 cursor-pointer transition-all duration-200 active:scale-[0.99] hover:bg-slate-50/80 dark:hover:bg-slate-800/30",
                          isActive && "bg-violet-50/50 dark:bg-violet-950/20"
                        )}
                      >
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-extrabold transition-all", isActive ? "bg-violet-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300")}>{s.months}</div>
                            <div className="text-right">
                              <p className="font-bold text-slate-800 dark:text-slate-100">{s.months} شهر</p>
                              <p className="text-[9px] text-slate-400 dark:text-slate-500">{isMin ? "أسرع سداد" : isMax ? "أشهر راحة" : "خيار وسط"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <p className="font-extrabold text-slate-800 dark:text-slate-100 text-xs">{s.monthly.toLocaleString()}</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500">ج.م شهرياً</p>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <p className="font-bold text-rose-500 text-xs">{s.interest.toLocaleString()}</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500">ج.م فوائد</p>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <p className="font-extrabold text-slate-800 dark:text-slate-100 text-xs">{s.total.toLocaleString()}</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500">ج.م</p>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {isMin && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                                <TrendingDown className="h-2.5 w-2.5" />
                                أقل فوائد
                              </span>
                            )}
                            {isMax && !isMin && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                                <Minus className="h-2.5 w-2.5" />
                                أخف قسط
                              </span>
                            )}
                            {!isMin && !isMax && <span className="text-[9px] text-slate-400">—</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-blue-500" />
                الفرق بين الأقل والأعلى فوائد: <strong className="text-rose-600">{(maxInterest - minInterest).toLocaleString()} ج.م</strong>
              </div>
            </div>
          </Card>

          {/* نصائح ذكية */}
          <Card className="border-0 bg-white/80 dark:bg-[#0f131a] backdrop-blur-sm overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Info className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">نصائح ذكية</h3>
              </div>
              <div className="space-y-3">
                {downPercent >= 20 && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 leading-relaxed">
                    ✓ <strong>مقدم ممتاز ({downPercent}%):</strong> يقلل التكلفة الإجمالية بشكل ملحوظ.
                  </div>
                )}
                {downPercent > 0 && downPercent < 20 && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                    ⚠ <strong>مقدم مقبول ({downPercent}%):</strong> يمكن تحسينه لتقليل الفوائد.
                  </div>
                )}
                {downPercent === 0 && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-800 dark:text-rose-200 leading-relaxed">
                    ✗ <strong>بدون مقدم:</strong> الفوائد الإجمالية ستكون مرتفعة. يُنصح بإضافة دفعة مقدمة.
                  </div>
                )}
                {interestRate === 0 && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                    ♡ <strong>بيع بدون فائدة:</strong> هذا العرض ممتاز للعميل!
                  </div>
                )}
                {interestRate > 0 && (
                  <div className="p-3 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900 rounded-xl text-xs text-violet-800 dark:text-violet-200 leading-relaxed">
                    💡 <strong>الفائدة الإجمالية:</strong> {interestAmount.toLocaleString()} ج.م على {months} شهر. أقل مدة = أقل فوائد.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* شريط أزرار الموبايل الثابت */}
      <div className="sm:hidden fixed bottom-20 left-0 right-0 p-4 bg-white/95 dark:bg-[#0a0d14]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 z-40 flex gap-3">
        <Button variant="outline" onClick={handlePrint} className="rounded-xl h-12 flex-1 gap-2">
          <Printer className="h-4 w-4" />
          طباعة
        </Button>
        <Button onClick={handleConvertToContract} className="rounded-xl h-12 flex-1 gap-2 bg-gradient-to-r from-emerald-500 to-teal-500">
          <ArrowRight className="h-4 w-4 rotate-180" />
          تحويل لعقد
        </Button>
      </div>
    </Layout>
  );
};

export default Calculator;
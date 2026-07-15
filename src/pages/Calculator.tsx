"use client";

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import PrintDialog from "@/components/PrintDialog";
import { useAppSettings } from "@/hooks/useAppSettings";
import { showSuccess } from "@/utils/toast";
import {
  Calculator, Sparkles, DollarSign, Calendar, Percent, Printer, FileText,
  ArrowRight, Info, GitCompareArrows, CheckCircle2, Zap,
  Wallet, Clock, TrendingDown, TrendingUp, Minus,
} from "lucide-react";

interface Scenario {
  months: number;
  label: string;
  monthly: number;
  totalInterest: number;
  totalPayback: number;
  principal: number;
  tag?: string;
}

const CalculatorPage = () => {
  const navigate = useNavigate();
  const { settings } = useAppSettings();

  const [productPrice, setProductPrice] = useState<number>(30000);
  const [downPayment, setDownPayment] = useState<number>(5000);
  const [interestRate, setInterestRate] = useState<number>(15);
  const [months, setMonths] = useState<number>(12);
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);
  const [printOpen, setPrintOpen] = useState(false);
  const [printHtml, setPrintHtml] = useState("");

  const calculations = useMemo(() => {
    const principal = Math.max(0, productPrice - downPayment);
    const totalInterest = Math.round(principal * (interestRate / 100) * (months / 12));
    const totalPayback = principal + totalInterest;
    const monthlyInstallment = months > 0 ? Math.ceil(totalPayback / months) : 0;
    const downPaymentPercent = productPrice > 0 ? Math.round((downPayment / productPrice) * 100) : 0;
    const schedule = [];
    const today = new Date();
    for (let i = 1; i <= months; i++) {
      const dueDate = new Date(today);
      dueDate.setMonth(dueDate.getMonth() + i);
      schedule.push({ number: i, amount: monthlyInstallment, date: dueDate.toLocaleDateString("ar-EG", { day: 'numeric', month: 'short' }) });
    }
    return { principal, totalInterest, totalPayback, monthlyInstallment, downPaymentPercent, schedule };
  }, [productPrice, downPayment, interestRate, months]);

  const scenarios = useMemo<Scenario[]>(() => {
    const principal = Math.max(0, productPrice - downPayment);
    return [
      { months: 12, label: "12 شهر", tag: "أسرع سداد", ...calcScenario(12) },
      { months: 18, label: "18 شهر", tag: "خيار وسط", ...calcScenario(18) },
      { months: 24, label: "24 شهر", tag: "أشهر راحة", ...calcScenario(24) },
    ];
    function calcScenario(m: number) {
      const ti = Math.round(principal * (interestRate / 100) * (m / 12));
      const tp = principal + ti;
      return { monthly: m > 0 ? Math.ceil(tp / m) : 0, totalInterest: ti, totalPayback: tp, principal };
    }
  }, [productPrice, downPayment, interestRate]);

  const bestScenario = useMemo(() => scenarios.reduce((b, s) => s.totalInterest < b.totalInterest ? s : b, scenarios[0]), [scenarios]);
  const cheapestScenario = useMemo(() => scenarios.reduce((c, s) => s.monthly < c.monthly ? s : c, scenarios[0]), [scenarios]);

  const applyScenario = (scenario: Scenario) => { setMonths(scenario.months); setSelectedScenario(scenario.months); };

  const handlePrintQuote = () => {
    const rows = calculations.schedule.map((inst) => `<tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:600;">${inst.number}</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;">${inst.date}</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;color:#4f46e5;font-weight:700;">${inst.amount.toLocaleString()} ج.م</td></tr>`).join("");
    const scenarioRows = scenarios.map((s) => `<tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:600;">${s.label}</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;">${s.monthly.toLocaleString()} ج.م</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;color:#ef4444;">${s.totalInterest.toLocaleString()} ج.م</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:700;">${s.totalPayback.toLocaleString()} ج.م</td></tr>`).join("");
    const html = `<div style="font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;text-align:right;color:#1e293b;max-width:750px;margin:0 auto;padding:20px;"><div style="text-align:center;margin-bottom:25px;padding-bottom:15px;border-bottom:3px solid #6366f1;"><h1 style="font-size:22px;font-weight:bold;margin:0 0 4px;">${settings.companyName || settings.appName}</h1><h2 style="font-size:16px;font-weight:600;color:#4f46e5;margin:0;">عرض سعر ومحاكاة تقسيط</h2><p style="font-size:11px;color:#64748b;margin-top:4px;">صالح لمدة 15 يوماً من تاريخ الطباعة</p></div><div style="margin-bottom:20px;"><h3 style="font-size:13px;font-weight:bold;color:#4f46e5;margin-bottom:10px;">مقارنة السيناريوهات</h3><table style="width:100%;border-collapse:collapse;font-size:11px;border:1px solid #e2e8f0;"><thead><tr style="background:#4f46e5;color:white;"><th style="padding:8px;text-align:center;">المدة</th><th style="padding:8px;text-align:center;">القسط</th><th style="padding:8px;text-align:center;">الفوائد</th><th style="padding:8px;text-align:center;">الإجمالي</th></tr></thead><tbody>${scenarioRows}</tbody></table></div><div style="margin-bottom:20px;"><h3 style="font-size:13px;font-weight:bold;color:#4f46e5;margin-bottom:10px;">العرض المالي (${months} شهر)</h3><table style="width:100%;border-collapse:collapse;font-size:12px;border:1px solid #e2e8f0;"><tr><td style="padding:8px;background:#f8fafc;border:1px solid #e2e8f0;color:#64748b;width:40%;">سعر السلعة</td><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">${productPrice.toLocaleString()} ج.م</td></tr><tr><td style="padding:8px;background:#f8fafc;border:1px solid #e2e8f0;color:#64748b;">المقدم</td><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;color:#10b981;">${downPayment.toLocaleString()} ج.م (${calculations.downPaymentPercent}%)</td></tr><tr><td style="padding:8px;background:#f8fafc;border:1px solid #e2e8f0;color:#64748b;">مبلغ التمويل</td><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">${calculations.principal.toLocaleString()} ج.م</td></tr><tr><td style="padding:8px;background:#f8fafc;border:1px solid #e2e8f0;color:#64748b;">الفائدة (${interestRate}%)</td><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;color:#ef4444;">${calculations.totalInterest.toLocaleString()} ج.م</td></tr><tr style="background:#f5f3ff;"><td style="padding:10px;border:1px solid #ddd6fe;font-weight:bold;">القسط الشهري</td><td style="padding:10px;border:1px solid #ddd6fe;font-weight:extrabold;color:#6366f1;font-size:15px;">${calculations.monthlyInstallment.toLocaleString()} ج.م</td></tr><tr style="background:#f0fdf4;"><td style="padding:10px;border:1px solid #bbf7d0;font-weight:bold;color:#16a34a;">الإجمالي</td><td style="padding:10px;border:1px solid #bbf7d0;font-weight:bold;color:#15803d;font-size:15px;">${calculations.totalPayback.toLocaleString()} ج.م</td></tr></table></div><div style="margin-bottom:20px;"><h3 style="font-size:13px;font-weight:bold;color:#4f46e5;margin-bottom:10px;">جدول الأقساط</h3><table style="width:100%;border-collapse:collapse;font-size:11px;border:1px solid #e2e8f0;"><thead><tr style="background:#4f46e5;color:white;"><th style="padding:8px;text-align:center;">#</th><th style="padding:8px;text-align:center;">التاريخ</th><th style="padding:8px;text-align:center;">المبلغ</th></tr></thead><tbody>${rows}</tbody></table></div><div style="font-size:9px;color:#94a3b8;text-align:center;margin-top:30px;border-top:1px solid #e2e8f0;padding-top:10px;">نظام ${settings.appName} ${settings.companyPhone ? `| ${settings.companyPhone}` : ""}</div></div>`;
    setPrintHtml(html);
    setPrintOpen(true);
  };

  const handleConvertToContract = () => { showSuccess("🎯 تم تجهيز المحاكاة!"); navigate("/contracts", { state: { fromCalculator: true, price: productPrice, downPayment, months } }); };

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="relative">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full opacity-20 blur-xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Calculator className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">حاسبة الأقساط الذكية</h1>
              <p className="text-slate-500 mt-1">محاكاة ومقارنة خطط التمويل للعملاء</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrintQuote} variant="outline" className="rounded-xl h-11 gap-2">
            <Printer className="h-4 w-4" />طباعة العرض
          </Button>
          <Button onClick={handleConvertToContract} className="rounded-xl h-11 gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-md">
            <ArrowRight className="h-4 w-4 rotate-180" />تحويل لعقد
          </Button>
        </div>
      </div>

      {/* ===== الكارت البنفسجي الرئيسي ===== */}
      <Card className="border-0 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 text-white overflow-hidden relative mb-8">
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
                  <p className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-none">{calculations.monthlyInstallment.toLocaleString()}</p>
                  <p className="text-sm text-purple-200 font-medium">ج.م × {months} شهر</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 md:mr-auto">
              <Button onClick={handlePrintQuote} variant="secondary" className="rounded-xl h-10 bg-white/95 hover:bg-white text-slate-800 shadow-md gap-2 font-bold text-sm">
                <Printer className="h-4 w-4" />طباعة
              </Button>
              <Button onClick={handleConvertToContract} className="rounded-xl h-10 bg-emerald-500 hover:bg-emerald-600 text-white shadow-md gap-2 font-bold text-sm">
                <ArrowRight className="h-4 w-4 rotate-180" />عقد
              </Button>
            </div>
          </div>
          <div className="h-px bg-white/15" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10"><p className="text-[11px] text-purple-200 mb-1">سعر المنتج</p><p className="font-extrabold text-sm">{productPrice.toLocaleString()} <span className="text-[10px] font-normal text-purple-200">ج.م</span></p></div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10"><p className="text-[11px] text-purple-200 mb-1">المقدم ({calculations.downPaymentPercent}%)</p><p className="font-extrabold text-sm">{downPayment.toLocaleString()} <span className="text-[10px] font-normal text-purple-200">ج.م</span></p></div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10"><p className="text-[11px] text-purple-200 mb-1">التمويل</p><p className="font-extrabold text-sm">{calculations.principal.toLocaleString()} <span className="text-[10px] font-normal text-purple-200">ج.م</span></p></div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10"><p className="text-[11px] text-purple-200 mb-1">الإجمالي الكلي</p><p className="font-extrabold text-sm text-amber-300">{calculations.totalPayback.toLocaleString()} <span className="text-[10px] font-normal text-amber-200">ج.م</span></p></div>
          </div>
        </CardContent>
      </Card>

      {/* ===== التخطيط الرئيسي: عمودان ===== */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* === العمود الأيسر === */}
        <div className="space-y-6">
          {/* محددات التمويل */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-bold text-sm text-slate-800">محددات التمويل</h3>
              </div>
              <div className="space-y-5">
                {[
                  { label: "سعر المنتج", value: productPrice, onChange: (v: number) => { setProductPrice(v); if (downPayment > v) setDownPayment(v); }, min: 1000, max: 200000, step: 500, suffix: "ج.م", color: "violet", inputWidth: "w-28" },
                  { label: "الدفعة المقدمة", value: downPayment, onChange: setDownPayment, min: 0, max: productPrice, step: 100, suffix: `${calculations.downPaymentPercent}%`, color: "emerald", inputWidth: "w-28" },
                  { label: "نسبة الفائدة السنوية", value: interestRate, onChange: setInterestRate, min: 0, max: 50, step: 0.5, suffix: "% سنوياً", color: "amber", inputWidth: "w-20" },
                  { label: "فترة السداد", value: months, onChange: (v: number) => { setMonths(v); setSelectedScenario(null); }, min: 3, max: 48, step: 1, suffix: "شهر", color: "blue", inputWidth: "w-20" },
                ].map((ctrl) => (
                  <div key={ctrl.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-slate-600">{ctrl.label}</Label>
                      <div className="flex items-center gap-1.5">
                        <Input type="number" value={ctrl.value} onChange={(e) => { const v = Number(e.target.value); if (v >= 0) ctrl.onChange(v); }} className={`${ctrl.inputWidth} h-8 text-center text-sm font-bold rounded-lg border-${ctrl.color}-200 focus-visible:ring-${ctrl.color}-500`} />
                        <span className="text-[10px] text-slate-400 min-w-[40px]">{ctrl.suffix}</span>
                      </div>
                    </div>
                    <Slider min={ctrl.min} max={ctrl.max} step={ctrl.step} value={[ctrl.value]} onValueChange={(val) => ctrl.onChange(val[0])} className={`[&>span:first-child]:bg-${ctrl.color}-100 [&>span_span]:bg-${ctrl.color}-${ctrl.color === "amber" ? "500" : "600"}`} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* مقارنة السيناريوهات الكبيرة */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                    <GitCompareArrows className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-800">مقارنة السيناريوهات</h3>
                </div>
                <Badge className="bg-indigo-50 text-indigo-600 border-0 rounded-lg text-[10px]"><Zap className="h-3 w-3 ml-0.5" />اضغط للتطبيق</Badge>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {scenarios.map((scenario) => {
                  const isCurrent = selectedScenario === scenario.months;
                  const isBestInterest = bestScenario?.months === scenario.months;
                  const isCheapest = cheapestScenario?.months === scenario.months;
                  return (
                    <button key={scenario.months} onClick={() => applyScenario(scenario)}
                      className={cn("relative p-4 rounded-2xl transition-all duration-200 border-2 active:scale-[0.97] text-center",
                        isCurrent ? "bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-300 shadow-md" : "bg-white border-slate-100 hover:border-violet-200 hover:bg-violet-50/30")}>
                      {isCurrent && <div className="absolute top-2 left-2"><div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center"><CheckCircle2 className="h-3 w-3 text-white" /></div></div>}
                      <div className="flex justify-center gap-1 mb-2 min-h-[18px]">
                        {isBestInterest && <span className="text-[8px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">أقل فوائد</span>}
                        {isCheapest && !isBestInterest && <span className="text-[8px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full">أخف قسط</span>}
                      </div>
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 transition-all",
                        isCurrent ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white" : "bg-slate-100 text-slate-500")}><Clock className="h-5 w-5" /></div>
                      <p className={cn("font-extrabold text-base mb-0.5", isCurrent ? "text-violet-700" : "text-slate-800")}>{scenario.label}</p>
                      <p className="text-[9px] text-slate-400 mb-3">{scenario.tag}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px]"><span className="text-slate-500">القسط</span><span className={cn("font-extrabold", isCurrent ? "text-violet-700" : "text-slate-800")}>{scenario.monthly.toLocaleString()}</span></div>
                        <div className="h-px bg-slate-100" />
                        <div className="flex items-center justify-between text-[11px]"><span className="text-slate-500">الفوائد</span><span className="font-bold text-rose-500">{scenario.totalInterest.toLocaleString()}</span></div>
                        <div className="h-px bg-slate-100" />
                        <div className="flex items-center justify-between text-[11px]"><span className="text-slate-500">الإجمالي</span><span className="font-extrabold text-slate-800">{scenario.totalPayback.toLocaleString()}</span></div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 p-3 bg-slate-50 rounded-xl flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-blue-500" />
                  الفرق بين الأقل والأعلى فوائد: <strong className="text-rose-600">{(Math.max(...scenarios.map(s => s.totalInterest)) - Math.min(...scenarios.map(s => s.totalInterest))).toLocaleString()} ج.م</strong>
                </div>
                {selectedScenario && <Button size="sm" variant="ghost" onClick={() => setSelectedScenario(null)} className="text-[10px] text-violet-600 h-6 rounded-lg">إعادة تعيين</Button>}
              </div>
            </CardContent>
          </Card>

          {/* نصيحة */}
          {selectedScenario && bestScenario && selectedScenario !== bestScenario.months && (
            <div className="p-4 bg-violet-50 border border-violet-200 rounded-2xl flex items-start gap-3 text-sm text-violet-800">
              <Sparkles className="h-5 w-5 text-violet-500 mt-0.5 flex-shrink-0" />
              <p><strong>نصيحة ذكية:</strong> لو اختارت <strong>{bestScenario.label}</strong> بدل <strong>{selectedScenario} شهر</strong>، هتوفر <strong>{(calculations.totalInterest - bestScenario.totalInterest).toLocaleString()} ج.م</strong> فوائد إضافية!</p>
            </div>
          )}
        </div>

        {/* === العمود الأيمن === */}
        <div className="space-y-6">
          {/* جدول الأقساط */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-800">جدول الأقساط</h3>
                </div>
                <Badge className="bg-violet-50 text-violet-600 border-0 rounded-lg text-[10px]">{months} قسط × {calculations.monthlyInstallment.toLocaleString()} ج.م</Badge>
              </div>
              <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-50">
                {calculations.schedule.map((inst) => (
                  <div key={inst.number} className="flex items-center justify-between px-6 py-2.5 hover:bg-violet-50/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 font-extrabold flex items-center justify-center text-[10px]">{inst.number}</div>
                      <span className="text-[11px] text-slate-500 font-medium">{inst.date}</span>
                    </div>
                    <span className="font-extrabold text-xs text-slate-800">{inst.amount.toLocaleString()} ج.م</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ===== المقارنة السريعة - التصميم الجديد ===== */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
              {/* العنوان */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                    <GitCompareArrows className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-800">مقارنة سريعة</h3>
                </div>
                <Badge className="bg-indigo-50 text-indigo-600 border-0 rounded-lg text-[10px]">3 خيارات</Badge>
              </div>

              {/* جدول المقارنة */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                      <th className="text-center py-3 px-4 font-semibold text-slate-500">المدة</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-500">القسط الشهري</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-500">الفوائد</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-500">الإجمالي</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-500">التقييم</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarios.map((s) => {
                      const isActive = selectedScenario === s.months;
                      const isBest = bestScenario?.months === s.months;
                      const isCheapest = cheapestScenario?.months === s.months;
                      return (
                        <tr
                          key={s.months}
                          onClick={() => applyScenario(s)}
                          className={cn(
                            "border-b border-slate-50 cursor-pointer transition-all duration-200 active:scale-[0.99]",
                            isActive
                              ? "bg-gradient-to-l from-violet-50 to-indigo-50 border-l-2 border-l-violet-500"
                              : "hover:bg-slate-50/80"
                          )}
                        >
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-extrabold transition-all",
                                isActive
                                  ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-sm"
                                  : "bg-slate-100 text-slate-600"
                              )}>
                                {s.months}
                              </div>
                              <div className="text-right">
                                <p className={cn("font-bold text-slate-800", isActive && "text-violet-700")}>{s.label}</p>
                                <p className="text-[9px] text-slate-400">{s.tag}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <p className={cn("font-extrabold", isActive ? "text-violet-700 text-sm" : "text-slate-800 text-xs")}>
                              {s.monthly.toLocaleString()}
                            </p>
                            <p className="text-[9px] text-slate-400">ج.م شهرياً</p>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <p className="font-bold text-rose-500 text-xs">
                              {s.totalInterest.toLocaleString()}
                            </p>
                            <p className="text-[9px] text-slate-400">ج.م فوائد</p>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <p className="font-extrabold text-slate-800 text-xs">
                              {s.totalPayback.toLocaleString()}
                            </p>
                            <p className="text-[9px] text-slate-400">ج.م</p>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              {isBest && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                  <TrendingDown className="h-2.5 w-2.5" />أقل فوائد
                                </span>
                              )}
                              {isCheapest && !isBest && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                  <Minus className="h-2.5 w-2.5" />أخف قسط
                                </span>
                              )}
                              {isActive && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="h-2.5 w-2.5" />محدد
                                </span>
                              )}
                              {!isBest && !isCheapest && !isActive && (
                                <span className="text-[9px] text-slate-400">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* الفرق */}
              <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Info className="h-3.5 w-3.5 text-blue-500" />
                  الفرق بين الأقل والأعلى فوائد:
                  <strong className="text-rose-600">
                    {(Math.max(...scenarios.map(s => s.totalInterest)) - Math.min(...scenarios.map(s => s.totalInterest))).toLocaleString()} ج.م
                  </strong>
                </div>
                {selectedScenario && (
                  <Button size="sm" variant="ghost" onClick={() => setSelectedScenario(null)} className="text-[10px] text-violet-600 h-6 rounded-lg">
                    إعادة تعيين
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* نصائح التمويل */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Info className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-bold text-sm text-slate-800">نصائح ذكية</h3>
              </div>
              <div className="space-y-3">
                {calculations.downPaymentPercent < 15 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed">⚠️ <strong>مقدم منخفض ({calculations.downPaymentPercent}%):</strong> يُنصح برفع المقدم لتقليل الفوائد.</div>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 leading-relaxed">✓ <strong>مقدم ممتاز ({calculations.downPaymentPercent}%):</strong> يقلل التكلفة الإجمالية.</div>
                )}
                {months > 24 && <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 leading-relaxed">💡 المدة الطويلة ({months} شهر) تزيد الفوائد.</div>}
                {selectedScenario && bestScenario && selectedScenario === bestScenario.months && <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 leading-relaxed">🎯 <strong>اختيار مثالي!</strong> أقل فترة = أقل فوائد.</div>}
                {selectedScenario && bestScenario && selectedScenario !== bestScenario.months && (
                  <div className="p-3 bg-violet-50 border border-violet-200 rounded-xl text-xs text-violet-800 leading-relaxed">💎 لو اختارت <strong>{bestScenario.label}</strong> بدلاً من <strong>{selectedScenario} شهر</strong>، هتوفر <strong>{(calculations.totalInterest - bestScenario.totalInterest).toLocaleString()} ج.م</strong></div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* أزرار الجوال */}
      <div className="sm:hidden fixed bottom-20 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-slate-200 z-40 flex gap-3">
        <Button onClick={handlePrintQuote} variant="outline" className="rounded-xl h-12 flex-1 gap-2"><Printer className="h-4 w-4" />طباعة</Button>
        <Button onClick={handleConvertToContract} className="rounded-xl h-12 flex-1 gap-2 bg-gradient-to-r from-emerald-500 to-teal-500"><ArrowRight className="h-4 w-4 rotate-180" />تحويل لعقد</Button>
      </div>

      <PrintDialog open={printOpen} onOpenChange={setPrintOpen} htmlContent={printHtml} title={`عرض تقسيط - ${settings.companyName || settings.appName}`} filename="installment-simulation.pdf" />
    </Layout>
  );
};

export default CalculatorPage;
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
  TrendingDown, Wallet, Clock,
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
      schedule.push({
        number: i,
        amount: monthlyInstallment,
        date: dueDate.toLocaleDateString("ar-EG", { day: 'numeric', month: 'short' })
      });
    }
    return { principal, totalInterest, totalPayback, monthlyInstallment, downPaymentPercent, schedule };
  }, [productPrice, downPayment, interestRate, months]);

  const scenarios = useMemo<Scenario[]>(() => {
    const principal = Math.max(0, productPrice - downPayment);
    const options = [
      { months: 12, label: "12 شهر", tag: "أسرع سداد" },
      { months: 18, label: "18 شهر", tag: "خيار وسط" },
      { months: 24, label: "24 شهر", tag: "أشهر راحة" },
    ];
    return options.map((opt) => {
      const totalInterest = Math.round(principal * (interestRate / 100) * (opt.months / 12));
      const totalPayback = principal + totalInterest;
      const monthly = opt.months > 0 ? Math.ceil(totalPayback / opt.months) : 0;
      return { months: opt.months, label: opt.label, monthly, totalInterest, totalPayback, principal, tag: opt.tag };
    });
  }, [productPrice, downPayment, interestRate]);

  const bestScenario = useMemo(() => {
    if (!scenarios.length) return null;
    return scenarios.reduce((best, s) => s.totalInterest < best.totalInterest ? s : best, scenarios[0]);
  }, [scenarios]);

  const cheapestScenario = useMemo(() => {
    if (!scenarios.length) return null;
    return scenarios.reduce((cheapest, s) => s.monthly < cheapest.monthly ? s : cheapest, scenarios[0]);
  }, [scenarios]);

  const applyScenario = (scenario: Scenario) => {
    setMonths(scenario.months);
    setSelectedScenario(scenario.months);
  };

  const handlePrintQuote = () => {
    const rows = calculations.schedule
      .map((inst) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:600;">${inst.number}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;">${inst.date}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;color:#4f46e5;font-weight:700;">${inst.amount.toLocaleString()} ج.م</td>
      </tr>`).join("");

    const scenarioRows = scenarios.map((s) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:600;">${s.label}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;">${s.monthly.toLocaleString()} ج.م</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;color:#ef4444;">${s.totalInterest.toLocaleString()} ج.م</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:700;">${s.totalPayback.toLocaleString()} ج.م</td>
      </tr>`).join("");

    const html = `
      <div style="font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;text-align:right;color:#1e293b;max-width:750px;margin:0 auto;padding:20px;">
        <div style="text-align:center;margin-bottom:25px;padding-bottom:15px;border-bottom:3px solid #6366f1;">
          <h1 style="font-size:22px;font-weight:bold;margin:0 0 4px;">${settings.companyName || settings.appName}</h1>
          <h2 style="font-size:16px;font-weight:600;color:#4f46e5;margin:0;">عرض سعر ومحاكاة تقسيط</h2>
          <p style="font-size:11px;color:#64748b;margin-top:4px;">صالح لمدة 15 يوماً من تاريخ الطباعة</p>
        </div>
        <div style="margin-bottom:20px;">
          <h3 style="font-size:13px;font-weight:bold;color:#4f46e5;margin-bottom:10px;">مقارنة السيناريوهات</h3>
          <table style="width:100%;border-collapse:collapse;font-size:11px;border:1px solid #e2e8f0;">
            <thead><tr style="background:#4f46e5;color:white;"><th style="padding:8px;text-align:center;">المدة</th><th style="padding:8px;text-align:center;">القسط</th><th style="padding:8px;text-align:center;">الفوائد</th><th style="padding:8px;text-align:center;">الإجمالي</th></tr></thead>
            <tbody>${scenarioRows}</tbody>
          </table>
        </div>
        <div style="margin-bottom:20px;">
          <h3 style="font-size:13px;font-weight:bold;color:#4f46e5;margin-bottom:10px;">العرض المالي (${months} شهر)</h3>
          <table style="width:100%;border-collapse:collapse;font-size:12px;border:1px solid #e2e8f0;">
            <tr><td style="padding:8px;background:#f8fafc;border:1px solid #e2e8f0;color:#64748b;width:40%;">سعر السلعة</td><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">${productPrice.toLocaleString()} ج.م</td></tr>
            <tr><td style="padding:8px;background:#f8fafc;border:1px solid #e2e8f0;color:#64748b;">المقدم</td><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;color:#10b981;">${downPayment.toLocaleString()} ج.م (${calculations.downPaymentPercent}%)</td></tr>
            <tr><td style="padding:8px;background:#f8fafc;border:1px solid #e2e8f0;color:#64748b;">مبلغ التمويل</td><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">${calculations.principal.toLocaleString()} ج.م</td></tr>
            <tr><td style="padding:8px;background:#f8fafc;border:1px solid #e2e8f0;color:#64748b;">الفائدة (${interestRate}%)</td><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;color:#ef4444;">${calculations.totalInterest.toLocaleString()} ج.م</td></tr>
            <tr style="background:#f5f3ff;"><td style="padding:10px;border:1px solid #ddd6fe;font-weight:bold;">القسط الشهري</td><td style="padding:10px;border:1px solid #ddd6fe;font-weight:extrabold;color:#6366f1;font-size:15px;">${calculations.monthlyInstallment.toLocaleString()} ج.م</td></tr>
            <tr style="background:#f0fdf4;"><td style="padding:10px;border:1px solid #bbf7d0;font-weight:bold;color:#16a34a;">الإجمالي</td><td style="padding:10px;border:1px solid #bbf7d0;font-weight:bold;color:#15803d;font-size:15px;">${calculations.totalPayback.toLocaleString()} ج.م</td></tr>
          </table>
        </div>
        <div style="margin-bottom:20px;">
          <h3 style="font-size:13px;font-weight:bold;color:#4f46e5;margin-bottom:10px;">جدول الأقساط</h3>
          <table style="width:100%;border-collapse:collapse;font-size:11px;border:1px solid #e2e8f0;">
            <thead><tr style="background:#4f46e5;color:white;"><th style="padding:8px;text-align:center;">#</th><th style="padding:8px;text-align:center;">التاريخ</th><th style="padding:8px;text-align:center;">المبلغ</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div style="font-size:9px;color:#94a3b8;text-align:center;margin-top:30px;border-top:1px solid #e2e8f0;padding-top:10px;">
          نظام ${settings.appName} ${settings.companyPhone ? `| ${settings.companyPhone}` : ""}
        </div>
      </div>`;
    setPrintHtml(html);
    setPrintOpen(true);
  };

  const handleConvertToContract = () => {
    showSuccess("🎯 تم تجهيز المحاكاة!");
    navigate("/contracts", { state: { fromCalculator: true, price: productPrice, downPayment, months } });
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 page-enter-animation">
        <div className="w-14 h-14 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
          <Calculator className="h-7 w-7 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">حاسبة الأقساط الذكية</h1>
          <p className="text-slate-500 text-sm">محاكاة ومقارنة خطط التمويل للعملاء</p>
        </div>
        <div className="hidden sm:flex gap-2">
          <Button onClick={handlePrintQuote} variant="outline" className="rounded-xl h-10 gap-2 text-sm">
            <Printer className="h-4 w-4" />طباعة العرض
          </Button>
          <Button onClick={handleConvertToContract} className="rounded-xl h-10 gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-sm">
            <ArrowRight className="h-4 w-4 rotate-180" />تحويل لعقد
          </Button>
        </div>
      </div>

      {/* ===== الكارت البنفسجي Compact ===== */}
      <Card className="border-0 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 text-white overflow-hidden relative shadow-lg shadow-violet-500/20 mb-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-indigo-400/15 rounded-full blur-2xl" />
        </div>
        <CardContent className="p-4 sm:p-5 relative z-10">
          {/* صف علوي: القسط + الأزرار */}
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 flex-shrink-0">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[11px] text-purple-200 font-medium">القسط الشهري</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-none">
                    {calculations.monthlyInstallment.toLocaleString()}
                  </p>
                  <p className="text-xs text-purple-200">ج.م × {months} شهر</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button onClick={handlePrintQuote} variant="secondary" className="rounded-xl h-9 bg-white/95 hover:bg-white text-slate-800 shadow-sm gap-1.5 font-bold text-xs active:scale-[0.97]">
                <Printer className="h-3.5 w-3.5" />طباعة
              </Button>
              <Button onClick={handleConvertToContract} className="rounded-xl h-9 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm border-0 gap-1.5 font-bold text-xs active:scale-[0.97]">
                <ArrowRight className="h-3.5 w-3.5 rotate-180" />عقد
              </Button>
            </div>
          </div>

          {/* صف سفلي: 4 بيانات مالية */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10 text-center">
              <p className="text-[9px] text-purple-200 mb-0.5">المنتج</p>
              <p className="font-extrabold text-xs">{productPrice.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10 text-center">
              <p className="text-[9px] text-purple-200 mb-0.5">المقدم ({calculations.downPaymentPercent}%)</p>
              <p className="font-extrabold text-xs">{downPayment.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10 text-center">
              <p className="text-[9px] text-purple-200 mb-0.5">التمويل</p>
              <p className="font-extrabold text-xs">{calculations.principal.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10 text-center">
              <p className="text-[9px] text-purple-200 mb-0.5">الإجمالي</p>
              <p className="font-extrabold text-xs text-amber-300">{calculations.totalPayback.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== المحتوى الرئيسي: عمودين ===== */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* العمود الأيسر */}
        <div className="lg:col-span-7 space-y-5">
          {/* محددات التمويل */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-5">
                <Sparkles className="h-4 w-4 text-violet-500" />
                <h3 className="font-bold text-sm text-slate-800">محددات التمويل</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5 text-violet-500" />سعر المنتج</Label>
                    <div className="flex items-center gap-1">
                      <Input type="number" value={productPrice} onChange={(e) => { const v = Number(e.target.value); if (v >= 0) { setProductPrice(v); if (downPayment > v) setDownPayment(v); } }} className="w-28 h-8 text-center text-sm font-bold rounded-lg border-violet-200 focus-visible:ring-violet-500" />
                      <span className="text-xs text-slate-400">ج.م</span>
                    </div>
                  </div>
                  <Slider min={1000} max={200000} step={500} value={[productPrice]} onValueChange={(val) => { setProductPrice(val[0]); if (downPayment > val[0]) setDownPayment(val[0]); }} className="[&>span:first-child]:bg-violet-100 [&>span_span]:bg-violet-600" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5 text-emerald-500" />الدفعة المقدمة</Label>
                    <div className="flex items-center gap-1">
                      <Input type="number" value={downPayment} onChange={(e) => { const v = Number(e.target.value); if (v >= 0 && v <= productPrice) setDownPayment(v); }} className="w-28 h-8 text-center text-sm font-bold rounded-lg border-emerald-200 focus-visible:ring-emerald-500" />
                      <span className="text-[10px] text-slate-400 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">{calculations.downPaymentPercent}%</span>
                    </div>
                  </div>
                  <Slider min={0} max={productPrice} step={100} value={[downPayment]} onValueChange={(val) => setDownPayment(val[0])} className="[&>span:first-child]:bg-emerald-100 [&>span_span]:bg-emerald-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5"><Percent className="h-3.5 w-3.5 text-amber-500" />نسبة الفائدة السنوية</Label>
                    <div className="flex items-center gap-1">
                      <Input type="number" value={interestRate} onChange={(e) => { const v = Number(e.target.value); if (v >= 0 && v <= 100) setInterestRate(v); }} className="w-20 h-8 text-center text-sm font-bold rounded-lg border-amber-200 focus-visible:ring-amber-500" step="0.5" />
                      <span className="text-xs text-slate-400">% سنوياً</span>
                    </div>
                  </div>
                  <Slider min={0} max={50} step={0.5} value={[interestRate]} onValueChange={(val) => setInterestRate(val[0])} className="[&>span:first-child]:bg-amber-100 [&>span_span]:bg-amber-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-blue-500" />فترة السداد</Label>
                    <div className="flex items-center gap-1">
                      <Input type="number" value={months} onChange={(e) => { const v = Number(e.target.value); if (v >= 1 && v <= 60) { setMonths(v); setSelectedScenario(null); } }} className="w-20 h-8 text-center text-sm font-bold rounded-lg border-blue-200 focus-visible:ring-blue-500" />
                      <span className="text-xs text-slate-400">شهر</span>
                    </div>
                  </div>
                  <Slider min={3} max={48} step={1} value={[months]} onValueChange={(val) => { setMonths(val[0]); setSelectedScenario(null); }} className="[&>span:first-child]:bg-blue-100 [&>span_span]:bg-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* مقارنة السيناريوهات */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GitCompareArrows className="h-4 w-4 text-indigo-500" />
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
                      {!isBestInterest && bestScenario && <p className="mt-2 text-[9px] text-rose-400">+{(scenario.totalInterest - bestScenario.totalInterest).toLocaleString()} فوائد إضافية</p>}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-blue-500" />
                  الفرق بين الأقل والأعلى فوائد: <strong className="text-rose-600">{scenarios.length >= 2 ? `${(Math.max(...scenarios.map(s => s.totalInterest)) - Math.min(...scenarios.map(s => s.totalInterest))).toLocaleString()} ج.م` : "—"}</strong>
                </div>
                {selectedScenario && <Button size="sm" variant="ghost" onClick={() => setSelectedScenario(null)} className="text-[10px] text-violet-600 h-6 rounded-lg">إعادة تعيين</Button>}
              </div>
            </CardContent>
          </Card>

          {/* نصيحة الاستشاري */}
          {selectedScenario && bestScenario && selectedScenario !== bestScenario.months && (
            <div className="p-3 bg-violet-50 border border-violet-200 rounded-2xl flex items-start gap-2 text-xs text-violet-800">
              <Sparkles className="h-4 w-4 text-violet-500 mt-0.5 flex-shrink-0" />
              <p><strong>نصيحة ذكية:</strong> لو اختارت <strong>{bestScenario.label}</strong> بدل <strong>{selectedScenario} شهر</strong>، هتوفر <strong>{(calculations.totalInterest - bestScenario.totalInterest).toLocaleString()} ج.م</strong> فوائد إضافية!</p>
            </div>
          )}

          {/* جدول الأقساط */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-violet-500" /><h3 className="font-bold text-sm text-slate-800">جدول الأقساط التفصيلي</h3></div>
                <Badge className="bg-violet-50 text-violet-600 border-0 rounded-lg text-[10px]">{months} قسط × {calculations.monthlyInstallment.toLocaleString()} ج.م</Badge>
              </div>
              <div className="max-h-[280px] overflow-y-auto divide-y divide-slate-50">
                {calculations.schedule.map((inst) => (
                  <div key={inst.number} className="flex items-center justify-between px-5 py-2.5 hover:bg-violet-50/40 transition-colors">
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
        </div>

        {/* العمود الأيمن */}
        <div className="lg:col-span-5 space-y-5">
          {/* نصائح التمويل */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1"><Info className="h-4 w-4 text-blue-500" /><h3 className="font-bold text-xs text-slate-700">نصائح التمويل الذكية</h3></div>
              {calculations.downPaymentPercent < 15 ? (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 leading-relaxed">⚠️ <strong>مقدم منخفض ({calculations.downPaymentPercent}%):</strong> يُنصح برفع المقدم لتقليل الفوائد والمخاطر.</div>
              ) : (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 leading-relaxed">✓ <strong>مقدم ممتاز ({calculations.downPaymentPercent}%):</strong> يقلل التكلفة الإجمالية للتمويل.</div>
              )}
              {months > 24 && <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-800 leading-relaxed">💡 المدة الطويلة ({months} شهر) تزيد الفوائد. تأكد من عمر المنتج.</div>}
              {selectedScenario && bestScenario && selectedScenario === bestScenario.months && <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 leading-relaxed">🎯 <strong>اختيار مثالي!</strong> أقل فترة سداد = أقل فوائد.</div>}
              {selectedScenario && bestScenario && selectedScenario !== bestScenario.months && (
                <div className="p-3 bg-violet-50 border border-violet-200 rounded-xl text-[11px] text-violet-800 leading-relaxed">💎 <strong>نصيحة ذكية:</strong> لو اختارت <strong>{bestScenario.label}</strong> بدلاً من <strong>{selectedScenario} شهر</strong>، هتوفر <strong>{(calculations.totalInterest - bestScenario.totalInterest).toLocaleString()} ج.م</strong> فوائد إضافية!</div>
              )}
            </CardContent>
          </Card>

          {/* مقارنة سريعة */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3"><GitCompareArrows className="h-4 w-4 text-indigo-500" /><h3 className="font-bold text-xs text-slate-700">مقارنة سريعة</h3></div>
              <div className="space-y-2">
                {scenarios.map((s) => {
                  const isActive = selectedScenario === s.months;
                  const isBest = bestScenario?.months === s.months;
                  return (
                    <div key={s.months} className={cn("flex items-center justify-between p-2.5 rounded-xl transition-all text-[11px]",
                      isActive ? "bg-violet-50 border border-violet-200" : "bg-slate-50 border border-transparent hover:border-slate-200")}>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold",
                          isActive ? "bg-violet-500 text-white" : "bg-slate-200 text-slate-500")}>{s.months}</div>
                        <span className="font-semibold text-slate-700">{s.label}</span>
                        {isBest && <span className="text-[8px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">الأفضل</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-800">{s.monthly.toLocaleString()} ج.م</span>
                        <span className="text-[9px] text-rose-400">فوائد: {s.totalInterest.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
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
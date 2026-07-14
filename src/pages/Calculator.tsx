"use client";

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import PrintDialog from "@/components/PrintDialog";
import { useAppSettings } from "@/hooks/useAppSettings";
import { showSuccess } from "@/utils/toast";
import {
  Calculator, Sparkles, DollarSign, Calendar, Percent, Printer, FileText, ArrowRight, TrendingUp, Info, HelpCircle
} from "lucide-react";

const CalculatorPage = () => {
  const navigate = useNavigate();
  const { settings } = useAppSettings();

  // Simulation inputs
  const [productPrice, setProductPrice] = useState<number>(30000);
  const [downPayment, setDownPayment] = useState<number>(5000);
  const [interestRate, setInterestRate] = useState<number>(15); // Annual interest rate in %
  const [months, setMonths] = useState<number>(12);

  // Print quote state
  const [printOpen, setPrintOpen] = useState(false);
  const [printHtml, setPrintHtml] = useState("");

  // Calculations
  const calculations = useMemo(() => {
    const principal = Math.max(0, productPrice - downPayment);
    const totalInterest = Math.round(principal * (interestRate / 100) * (months / 12));
    const totalPayback = principal + totalInterest;
    const monthlyInstallment = months > 0 ? Math.ceil(totalPayback / months) : 0;
    const downPaymentPercent = productPrice > 0 ? Math.round((downPayment / productPrice) * 100) : 0;

    // Generate schedule preview
    const schedule = [];
    const today = new Date();
    for (let i = 1; i <= months; i++) {
      const dueDate = new Date(today);
      dueDate.setMonth(dueDate.getMonth() + i);
      schedule.push({
        number: i,
        amount: monthlyInstallment,
        date: dueDate.toLocaleDateString("ar-EG", { day: 'numeric', month: 'numeric', year: 'numeric' })
      });
    }

    return {
      principal,
      totalInterest,
      totalPayback,
      monthlyInstallment,
      downPaymentPercent,
      schedule
    };
  }, [productPrice, downPayment, interestRate, months]);

  // Handle printing quote
  const handlePrintQuote = () => {
    const rows = calculations.schedule
      .map(
        (inst) => `
      <tr>
        <td style="padding:10px; border-bottom:1px solid #e2e8f0; text-align:center; font-weight:600;">القسط ${inst.number}</td>
        <td style="padding:10px; border-bottom:1px solid #e2e8f0; text-align:center;">${inst.date}</td>
        <td style="padding:10px; border-bottom:1px solid #e2e8f0; text-align:center; font-weight:700; color:#4f46e5;">${inst.amount.toLocaleString()} ج.م</td>
      </tr>`
      )
      .join("");

    const html = `
      <div style="font-family:'Segoe UI', Tahoma, Arial, sans-serif; direction:rtl; text-align:right; color:#1e293b; max-width:700px; margin:0 auto; padding:20px;">
        <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:3px solid #6366f1;">
          <h1 style="font-size:24px; font-weight:bold; color:#1e293b; margin:0 0 5px;">${settings.companyName || settings.appName}</h1>
          <h2 style="font-size:18px; font-weight:600; color:#4f46e5; margin:0;">عرض سعر ومحاكاة تقسيط ذكية</h2>
          <p style="font-size:12px; color:#64748b; margin-top:5px;">هذا المستند هو محاكاة تقريبية صالحة لمدة 15 يوماً من تاريخ الطباعة</p>
        </div>

        <div style="margin-bottom:25px;">
          <h3 style="font-size:14px; font-weight:bold; color:#4f46e5; margin-bottom:12px; padding-bottom:5px; border-bottom:1px solid #e2e8f0;">ملخص العرض المالي</h3>
          <table style="width:100%; border-collapse:collapse; font-size:13px; border:1px solid #e2e8f0;">
            <tr>
              <td style="padding:10px; background:#f8fafc; border:1px solid #e2e8f0; color:#64748b; width:40%;">سعر السلعة الأصلي</td>
              <td style="padding:10px; border:1px solid #e2e8f0; font-weight:bold;">${productPrice.toLocaleString()} ج.م</td>
            </tr>
            <tr>
              <td style="padding:10px; background:#f8fafc; border:1px solid #e2e8f0; color:#64748b;">الدفعة المقدمة (المقدم)</td>
              <td style="padding:10px; border:1px solid #e2e8f0; font-weight:bold; color:#10b981;">${downPayment.toLocaleString()} ج.م (${calculations.downPaymentPercent}%)</td>
            </tr>
            <tr>
              <td style="padding:10px; background:#f8fafc; border:1px solid #e2e8f0; color:#64748b;">مبلغ التمويل الخاضع للفائدة</td>
              <td style="padding:10px; border:1px solid #e2e8f0; font-weight:bold;">${calculations.principal.toLocaleString()} ج.م</td>
            </tr>
            <tr>
              <td style="padding:10px; background:#f8fafc; border:1px solid #e2e8f0; color:#64748b;">نسبة الفائدة السنوية المحتسبة</td>
              <td style="padding:10px; border:1px solid #e2e8f0; font-weight:bold; color:#f59e0b;">${interestRate}%</td>
            </tr>
            <tr>
              <td style="padding:10px; background:#f8fafc; border:1px solid #e2e8f0; color:#64748b;">إجمالي مبلغ الفوائد الكلي</td>
              <td style="padding:10px; border:1px solid #e2e8f0; font-weight:bold; color:#ef4444;">${calculations.totalInterest.toLocaleString()} ج.م</td>
            </tr>
            <tr style="background:#f5f3ff;">
              <td style="padding:12px; border:1px solid #ddd6fe; color:#4f46e5; font-weight:bold;">القسط الشهري المقدر</td>
              <td style="padding:12px; border:1px solid #ddd6fe; font-weight:extrabold; color:#6366f1; font-size:16px;">${calculations.monthlyInstallment.toLocaleString()} ج.م</td>
            </tr>
            <tr>
              <td style="padding:10px; background:#f8fafc; border:1px solid #e2e8f0; color:#64748b;">عدد الأقساط الشهرية</td>
              <td style="padding:10px; border:1px solid #e2e8f0; font-weight:bold;">${months} شهراً</td>
            </tr>
            <tr style="background:#f0fdf4;">
              <td style="padding:12px; border:1px solid #bbf7d0; color:#16a34a; font-weight:bold;">إجمالي المبلغ المراد سداده</td>
              <td style="padding:12px; border:1px solid #bbf7d0; font-weight:bold; color:#15803d; font-size:16px;">${calculations.totalPayback.toLocaleString()} ج.م</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom:25px;">
          <h3 style="font-size:14px; font-weight:bold; color:#4f46e5; margin-bottom:12px; padding-bottom:5px; border-bottom:1px solid #e2e8f0;">جدول الأقساط المتوقعة</h3>
          <table style="width:100%; border-collapse:collapse; font-size:12px; border:1px solid #e2e8f0;">
            <thead>
              <tr style="background:#4f46e5; color:white;">
                <th style="padding:10px; text-align:center;">رقم الدفعة</th>
                <th style="padding:10px; text-align:center;">تاريخ الاستحقاق المتوقع</th>
                <th style="padding:10px; text-align:center;">قيمة الدفعة</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>

        <div style="font-size:10px; color:#94a3b8; text-align:center; margin-top:40px; border-top:1px solid #e2e8f0; padding-top:15px;">
          المحاكاة ذكية وتم إنشاؤها عبر نظام ${settings.appName}. تواصل معنا في حال الاستفسار: ${settings.companyPhone || "—"}
        </div>
      </div>
    `;

    setPrintHtml(html);
    setPrintOpen(true);
  };

  const handleConvertToContract = () => {
    // Navigate to Contracts screen and suggest values (or keep pre-filled state)
    showSuccess("🎯 تم تجهيز محاكاة التمويل للعميل!");
    navigate("/contracts");
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 page-enter-animation">
        <div className="relative">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full opacity-20 blur-xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Calculator className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">حاسبة الأقساط الذكية</h1>
              <p className="text-slate-500 mt-1">محاكاة الخطط التمويلية للعملاء وتقديم عروض أسعار دقيقة</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 page-enter-animation">
        {/* Sliders and Controls */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-sm">
            <CardHeader className="border-b border-slate-100/80">
              <CardTitle className="text-md font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-500" />
                محددات التمويل والجدولة
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {/* Product Price */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-violet-500" />
                    سعر المنتج الإجمالي
                  </Label>
                  <span className="font-extrabold text-lg text-violet-600">{productPrice.toLocaleString()} ج.م</span>
                </div>
                <Slider
                  min={1000}
                  max={200000}
                  step={500}
                  value={[productPrice]}
                  onValueChange={(val) => {
                    setProductPrice(val[0]);
                    if (downPayment > val[0]) setDownPayment(val[0]);
                  }}
                  className="[&>span:first-child]:bg-violet-100 [&>span_span]:bg-violet-600"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>1,000 ج.م</span>
                  <span>200,000 ج.م</span>
                </div>
              </div>

              {/* Down Payment */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    الدفعة المقدمة (المقدم)
                  </Label>
                  <span className="font-extrabold text-lg text-emerald-600">
                    {downPayment.toLocaleString()} ج.م ({calculations.downPaymentPercent}%)
                  </span>
                </div>
                <Slider
                  min={0}
                  max={productPrice}
                  step={100}
                  value={[downPayment]}
                  onValueChange={(val) => setDownPayment(val[0])}
                  className="[&>span:first-child]:bg-emerald-100 [&>span_span]:bg-emerald-500"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>بدون مقدم</span>
                  <span>سعر المنتج بالكامل</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Percent className="h-4 w-4 text-amber-500" />
                    نسبة الفائدة السنوية المحتسبة
                  </Label>
                  <span className="font-extrabold text-lg text-amber-600">{interestRate}% سنوياً</span>
                </div>
                <Slider
                  min={0}
                  max={50}
                  step={0.5}
                  value={[interestRate]}
                  onValueChange={(val) => setInterestRate(val[0])}
                  className="[&>span:first-child]:bg-amber-100 [&>span_span]:bg-amber-500"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>0% (بدون فوائد)</span>
                  <span>50%</span>
                </div>
              </div>

              {/* Number of Months */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    فترة السداد والتقسيط
                  </Label>
                  <span className="font-extrabold text-lg text-blue-600">{months} شهراً</span>
                </div>
                <Slider
                  min={3}
                  max={48}
                  step={1}
                  value={[months]}
                  onValueChange={(val) => setMonths(val[0])}
                  className="[&>span:first-child]:bg-blue-100 [&>span_span]:bg-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>3 أشهر</span>
                  <span>48 شهراً (4 سنوات)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Schedule Preview */}
          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100/80 flex flex-row items-center justify-between py-4">
              <CardTitle className="text-md font-bold text-slate-800 flex items-center gap-2">
                <FileText className="h-5 w-5 text-violet-500" />
                جدول الأقساط والمواعيد المقترحة
              </CardTitle>
              <Badge className="bg-violet-100 text-violet-700 border-0 rounded-lg">{months} قسط مقترح</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100/60">
                {calculations.schedule.map((inst) => (
                  <div key={inst.number} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 font-extrabold flex items-center justify-center text-xs">
                        #{inst.number}
                      </div>
                      <span className="text-xs text-slate-500 font-medium">{inst.date}</span>
                    </div>
                    <span className="font-extrabold text-sm text-slate-800">{inst.amount.toLocaleString()} ج.م</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Summary & Financial Analysis */}
        <div className="space-y-6">
          <Card className="border-0 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 text-white overflow-hidden relative shadow-lg">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
              <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-white/10 rounded-full" />
            </div>
            <CardContent className="p-6 relative z-10 space-y-6 text-right">
              <div>
                <p className="text-xs text-purple-100 font-semibold mb-1">القسط الشهري المقدر</p>
                <p className="text-3xl font-extrabold tracking-tight">
                  {calculations.monthlyInstallment.toLocaleString()} <span className="text-sm font-bold text-purple-100">ج.م / شهر</span>
                </p>
              </div>

              <div className="h-px bg-white/20" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-purple-100">المبلغ الأصلي الممول</p>
                  <p className="font-extrabold text-md mt-1">{calculations.principal.toLocaleString()} ج.م</p>
                </div>
                <div>
                  <p className="text-[11px] text-purple-100">إجمالي الفوائد الكلية</p>
                  <p className="font-extrabold text-md mt-1 text-amber-300">+{calculations.totalInterest.toLocaleString()} ج.م</p>
                </div>
              </div>

              <div className="h-px bg-white/20" />

              <div>
                <p className="text-xs text-purple-100 font-semibold mb-1">إجمالي المبلغ المراد سداده</p>
                <p className="text-xl font-bold">{calculations.totalPayback.toLocaleString()} ج.م</p>
                <p className="text-[10px] text-purple-200 mt-1">تشمل مبلغ التمويل مضافاً إليه الفوائد المحتسبة</p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <Button
                  onClick={handlePrintQuote}
                  variant="secondary"
                  className="rounded-xl h-11 bg-white hover:bg-slate-50 text-slate-800 shadow-md flex-1 gap-2 font-semibold active:scale-95"
                >
                  <Printer className="h-4 w-4" />
                  طباعة العرض
                </Button>
                <Button
                  onClick={handleConvertToContract}
                  className="rounded-xl h-11 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md border-0 flex-1 gap-1.5 font-bold active:scale-95"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  تحويل لعقد
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Advisory Widget */}
          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Info className="h-4.5 w-4.5 text-blue-500" />
                استشاري التمويل الذكي
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {calculations.downPaymentPercent < 15 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs text-right leading-relaxed">
                  ⚠️ <strong>مقدم التمويل منخفض:</strong> دفع مقدم أقل من 15% يزيد من مبلغ الفوائد المحتسبة على العميل وقيمة القسط الشهري. يُنصح برفع المقدم لتقليل المخاطر.
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs text-right leading-relaxed">
                  ✓ <strong>مقدم تمويل ممتاز:</strong> المقدم المحتسب ({calculations.downPaymentPercent}%) يقلل التكلفة الإجمالية للتمويل ويحمي العميل من الالتزامات الكبيرة.
                </div>
              )}

              {months > 24 ? (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs text-right leading-relaxed">
                  💡 <strong>مدة سداد طويلة:</strong> توزيع القسط على {months} شهراً يمنح العميل راحة شهرية، لكنه يرفع الفوائد الإجمالية. تأكد من أن السلعة لها عمر افتراضي يغطي مدة القسط.
                </div>
              ) : (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-800 text-xs text-right leading-relaxed">
                  ✓ <strong>فترة سداد متوازنة:</strong> الجدولة على {months} شهراً مناسبة وتضمن تحصيل سريع للشركة مع تقليل التكلفة الإجمالية للعميل.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <PrintDialog
        open={printOpen}
        onOpenChange={setPrintOpen}
        htmlContent={printHtml}
        title={`عرض محاكاة تقسيط - ${settings.companyName || settings.appName}`}
        filename="installment-simulation.pdf"
      />
    </Layout>
  );
};

export default CalculatorPage;
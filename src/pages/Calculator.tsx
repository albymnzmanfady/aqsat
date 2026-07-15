"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Calculator as CalcIcon,
  DollarSign,
  Percent,
  Calendar,
  CreditCard,
  TrendingUp,
  Wallet,
  Sparkles,
} from "lucide-react";

const Calculator = () => {
  const [totalPrice, setTotalPrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [months, setMonths] = useState("12");
  const [interestRate, setInterestRate] = useState("0");

  const price = Number(totalPrice) || 0;
  const down = Number(downPayment) || 0;
  const installmentCount = Math.max(1, Number(months) || 1);
  const rate = Math.min(100, Math.max(0, Number(interestRate) || 0));

  const totalWithInterest = Math.round(price * (1 + rate / 100));
  const afterDown = totalWithInterest - down;
  const perInstallment =
    installmentCount > 0 ? Math.round(afterDown / installmentCount) : 0;
  const totalCollected = down + perInstallment * installmentCount;
  const profit = totalCollected - price;

  return (
    <Layout>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <CalcIcon className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100">
            حاسبة الأقساط
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            احسب قيمة القسط الشهري والفوائد بدقة
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input side */}
        <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <CardTitle className="text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-500" />
              إدخال البيانات
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                  <DollarSign className="h-4 w-4 text-violet-500" />
                  السعر الإجمالي
                </Label>
                <Input
                  type="number"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(e.target.value)}
                  placeholder="مثال: 20000"
                  className="rounded-xl h-12"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                  <Wallet className="h-4 w-4 text-amber-500" />
                  الدفعة المقدمة
                </Label>
                <Input
                  type="number"
                  value={downPayment}
                  onChange={(e) => setDownPayment(e.target.value)}
                  placeholder="مثال: 5000"
                  className="rounded-xl h-12"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  عدد الأقساط (شهر)
                </Label>
                <Input
                  type="number"
                  value={months}
                  onChange={(e) => setMonths(e.target.value)}
                  min="1"
                  className="rounded-xl h-12"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                  <Percent className="h-4 w-4 text-rose-500" />
                  نسبة الفائدة (%)
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    min="0"
                    max="100"
                    step="0.5"
                    className="rounded-xl h-12 pl-8"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    %
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Result side */}
        <Card className="border-0 bg-white/70 dark:bg-[#0f131a] backdrop-blur-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <CardTitle className="text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-500" />
              نتيجة الحساب
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {price > 0 ? (
              <>
                <div className="text-center p-6 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-2xl text-white shadow-md">
                  <CreditCard className="h-10 w-10 mx-auto mb-3 text-white/80" />
                  <p className="text-xs text-white/80 mb-1 font-bold">القسط الشهري</p>
                  <p className="text-3xl lg:text-4xl font-extrabold">
                    {perInstallment.toLocaleString()}
                    <span className="text-base font-medium mr-1 text-white/80">ج.م</span>
                  </p>
                  <p className="text-xs text-white/70 mt-2">لمدة {installmentCount} شهراً</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">الإجمالي المسدد</p>
                    <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                      {totalCollected.toLocaleString()} ج.م
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                      {profit >= 0 ? "الربح المتوقع" : "الخسارة"}
                    </p>
                    <p
                      className={cn(
                        "text-lg font-extrabold",
                        profit >= 0 ? "text-emerald-600" : "text-rose-600"
                      )}
                    >
                      {profit.toLocaleString()} ج.م
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <CalcIcon className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300 mb-2">
                  أدخل البيانات لبدء الحساب
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  قم بإدخال السعر الإجمالي والمقدم وعدد الأقساط
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Calculator;
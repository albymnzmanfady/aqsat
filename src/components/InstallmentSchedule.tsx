"use client";

import { Installment } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Calendar, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface InstallmentScheduleProps {
  installments: Installment[];
  showContractId?: boolean;
}

const monthNames = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

const InstallmentSchedule = ({ installments }: InstallmentScheduleProps) => {
  const paidCount = installments.filter((i) => i.isPaid).length;
  const totalCount = installments.length;
  const paidAmount = installments.filter((i) => i.isPaid).reduce((sum, i) => sum + i.amount, 0);
  const totalAmount = installments.reduce((sum, i) => sum + i.amount, 0);

  return (
    <Card className="border-0 bg-white overflow-hidden">
      <CardHeader className="border-b border-slate-100 pb-4 bg-gradient-to-r from-violet-50 to-purple-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-500" />
            جدول الأقساط
          </CardTitle>
          <div className="flex gap-4">
            <div className="text-center bg-white/80 rounded-xl px-4 py-2">
              <p className="text-xs text-slate-500">المدفوع</p>
              <p className="font-bold text-emerald-600">{paidCount}/{totalCount}</p>
            </div>
            <div className="text-center bg-white/80 rounded-xl px-4 py-2">
              <p className="text-xs text-slate-500">المبلغ المحصّل</p>
              <p className="font-bold text-emerald-600">{paidAmount.toLocaleString()} ج.م</p>
            </div>
            <div className="text-center bg-white/80 rounded-xl px-4 py-2">
              <p className="text-xs text-slate-500">الإجمالي</p>
              <p className="font-bold text-slate-800">{totalAmount.toLocaleString()} ج.م</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">رقم القسط</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">اليوم</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">الشهر</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">السنة</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">القيمة</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {installments.map((installment) => (
                <tr
                  key={installment.id}
                  className={cn(
                    "hover:bg-slate-50/50 transition-colors",
                    !installment.isPaid && new Date(installment.year, installment.month - 1, installment.day) < new Date() && "bg-rose-50/30"
                  )}
                >
                  <td className="px-4 py-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold",
                      installment.isPaid
                        ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25"
                        : "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25"
                    )}>
                      {installment.number}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 font-medium">{installment.day}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 font-medium">{monthNames[installment.month - 1]}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 font-medium">{installment.year}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-800">{installment.amount.toLocaleString()} ج.م</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      {installment.isPaid ? (
                        <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-500 hover:to-teal-500 gap-1 rounded-lg border-0">
                          <CheckCircle className="h-3 w-3" />
                          مدفوع
                        </Badge>
                      ) : (
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-500 hover:to-orange-500 gap-1 rounded-lg border-0">
                          <Clock className="h-3 w-3" />
                          قيد الانتظار
                        </Badge>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstallmentSchedule;
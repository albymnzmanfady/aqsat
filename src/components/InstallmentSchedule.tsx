"use client";

import { Installment } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Calendar } from "lucide-react";
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
    <Card className="border-slate-200 bg-white">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg font-bold text-slate-800">جدول الأقساط</CardTitle>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-xs text-slate-500">المدفوع</p>
              <p className="font-bold text-emerald-600">{paidCount}/{totalCount}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500">المبلغ المحصّل</p>
              <p className="font-bold text-emerald-600">{paidAmount.toLocaleString()} ج.م</p>
            </div>
            <div className="text-center">
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
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">رقم القسط</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">اليوم</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">الشهر</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">السنة</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">القيمة</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {installments.map((installment) => (
                <tr
                  key={installment.id}
                  className={cn(
                    "hover:bg-slate-50 transition-colors",
                    !installment.isPaid && new Date(installment.year, installment.month - 1, installment.day) < new Date() && "bg-red-50/50"
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold",
                          installment.isPaid
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        )}
                      >
                        {installment.number}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{installment.day}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{monthNames[installment.month - 1]}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{installment.year}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-800">{installment.amount.toLocaleString()} ج.م</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      {installment.isPaid ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 gap-1">
                          <CheckCircle className="h-3 w-3" />
                          مدفوع
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 gap-1">
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
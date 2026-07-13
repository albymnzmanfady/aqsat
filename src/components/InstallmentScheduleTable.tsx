"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";
import { Installment } from "@/types";

interface InstallmentScheduleTableProps {
  installments: Installment[];
  onTogglePaid: (installmentId: number) => void;
}

const monthNames = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

const InstallmentScheduleTable = ({
  installments,
  onTogglePaid,
}: InstallmentScheduleTableProps) => {
  const totalAmount = installments.reduce((sum, i) => sum + i.value, 0);
  const paidAmount = installments.filter((i) => i.paid).reduce((sum, i) => sum + i.value, 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-4 py-3 text-right font-semibold text-slate-600">رقم القسط</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-600">اليوم</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-600">الشهر</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-600">السنة</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-600">قيمة القسط</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-600">الحالة</th>
            <th className="px-4 py-3 text-center font-semibold text-slate-600">إجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {installments.map((inst) => (
            <tr
              key={inst.id}
              className={`hover:bg-slate-50 transition-colors ${
                inst.paid ? "bg-emerald-50/30" : ""
              }`}
            >
              <td className="px-4 py-3 font-medium text-slate-800">
                {inst.number}
              </td>
              <td className="px-4 py-3 text-slate-600">{inst.day}</td>
              <td className="px-4 py-3 text-slate-600">
                {monthNames[inst.month - 1]}
              </td>
              <td className="px-4 py-3 text-slate-600">{inst.year}</td>
              <td className="px-4 py-3 font-bold text-slate-800">
                {inst.value.toLocaleString()} ج.م
              </td>
              <td className="px-4 py-3">
                <Badge
                  className={
                    inst.paid
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                      : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                  }
                >
                  {inst.paid ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      مدفوع
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      قيد الانتظار
                    </span>
                  )}
                </Badge>
              </td>
              <td className="px-4 py-3 text-center">
                {!inst.paid ? (
                  <button
                    onClick={() => onTogglePaid(inst.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-medium"
                  >
                    تسجيل السداد
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600 font-medium">
                    ✓ {inst.paidDate}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-slate-50 border-t border-slate-200 font-bold">
            <td colSpan={4} className="px-4 py-3 text-slate-700">
              الإجمالي
            </td>
            <td className="px-4 py-3 text-slate-800">
              {totalAmount.toLocaleString()} ج.م
            </td>
            <td className="px-4 py-3">
              <span className="text-emerald-600">
                {paidAmount.toLocaleString()} ج.م
              </span>{" "}
              / {totalAmount.toLocaleString()} ج.م
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default InstallmentScheduleTable;
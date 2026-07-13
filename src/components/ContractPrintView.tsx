"use client";

import { Customer } from "@/types";
import { Wallet } from "lucide-react";

const monthNames = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

interface ContractPrintViewProps {
  customer: Customer;
}

const ContractPrintView = ({ customer }: ContractPrintViewProps) => {
  const { contract, guarantor, installments } = customer;
  const paidCount = installments.filter((i) => i.paid).length;
  const paidAmount = installments.filter((i) => i.paid).reduce((s, i) => s + i.value, 0);
  const totalAmount = installments.reduce((s, i) => s + i.value, 0);

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">إدارة الأقساط</h1>
            <p className="text-sm text-slate-500">ملف العميل</p>
          </div>
        </div>
        <div className="text-left">
          <p className="text-sm text-slate-500">رقم العقد: #{customer.id}</p>
          <p className="text-sm text-slate-500">تاريخ الطباعة: {new Date().toLocaleDateString("ar-EG")}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-slate-50 rounded-xl p-4">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            بيانات العميل
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">الاسم:</span>
              <span className="font-medium text-slate-800">{customer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">الرقم القومي:</span>
              <span className="font-medium text-slate-800">{customer.nationalId || "غير محدد"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">الهاتف:</span>
              <span className="font-medium text-slate-800">{customer.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">العنوان:</span>
              <span className="font-medium text-slate-800">{customer.address || "غير محدد"}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full" />
            بيانات الضامن
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">الاسم:</span>
              <span className="font-medium text-slate-800">{guarantor.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">الرقم القومي:</span>
              <span className="font-medium text-slate-800">{guarantor.nationalId || "غير محدد"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">الهاتف:</span>
              <span className="font-medium text-slate-800">{guarantor.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">العنوان:</span>
              <span className="font-medium text-slate-800">{guarantor.address || "غير محدد"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Info */}
      <div className="bg-blue-50 rounded-xl p-4 mb-6">
        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          بيانات العقد
        </h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">نوع السلعة:</span>
            <span className="font-medium text-slate-800">{contract.productType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">إجمالي السعر:</span>
            <span className="font-bold text-slate-800">{contract.totalPrice.toLocaleString()} ج.م</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">المقدم:</span>
            <span className="font-medium text-slate-800">{contract.downPayment.toLocaleString()} ج.م</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">قيمة القسط:</span>
            <span className="font-bold text-blue-600">{contract.installmentValue.toLocaleString()} ج.م</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">عدد الأقساط:</span>
            <span className="font-medium text-slate-800">{contract.numberOfReceipts} قسط</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">تاريخ الاستلام:</span>
            <span className="font-medium text-slate-800">{contract.deliveryDate}</span>
          </div>
        </div>
      </div>

      {/* Installments Summary */}
      <div className="mb-6">
        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
          ملخص الأقساط
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-sm text-slate-500">إجمالي الأقساط</p>
            <p className="text-lg font-bold text-slate-800">{installments.length}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 text-center">
            <p className="text-sm text-emerald-600">مدفوعة</p>
            <p className="text-lg font-bold text-emerald-700">{paidCount}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <p className="text-sm text-amber-600">متبقي</p>
            <p className="text-lg font-bold text-amber-700">{installments.length - paidCount}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-sm text-blue-600">المدفوع</p>
            <p className="text-lg font-bold text-blue-700">{paidAmount.toLocaleString()} ج.م</p>
          </div>
        </div>
      </div>

      {/* Installment Table */}
      <div className="mb-6">
        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full" />
          جدول الأقساط
        </h3>
        <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-slate-100">
              <th className="px-3 py-2 text-right font-semibold text-slate-600 border-b">رقم</th>
              <th className="px-3 py-2 text-right font-semibold text-slate-600 border-b">اليوم</th>
              <th className="px-3 py-2 text-right font-semibold text-slate-600 border-b">الشهر</th>
              <th className="px-3 py-2 text-right font-semibold text-slate-600 border-b">السنة</th>
              <th className="px-3 py-2 text-right font-semibold text-slate-600 border-b">القيمة</th>
              <th className="px-3 py-2 text-center font-semibold text-slate-600 border-b">السداد</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {installments.map((inst) => (
              <tr key={inst.id}>
                <td className="px-3 py-2 text-slate-700">{inst.number}</td>
                <td className="px-3 py-2 text-slate-700">{inst.day}</td>
                <td className="px-3 py-2 text-slate-700">{monthNames[inst.month - 1]}</td>
                <td className="px-3 py-2 text-slate-700">{inst.year}</td>
                <td className="px-3 py-2 font-medium text-slate-800">{inst.value.toLocaleString()} ج.م</td>
                <td className="px-3 py-2 text-center">
                  {inst.paid ? (
                    <span className="text-emerald-600 font-medium">✓ مدفوع</span>
                  ) : (
                    <span className="text-amber-600">✗ لم يُدفع</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200">
        <div className="text-center">
          <div className="h-16 border-b border-slate-300 mb-2" />
          <p className="text-sm text-slate-600 font-medium">توقيع العميل</p>
        </div>
        <div className="text-center">
          <div className="h-16 border-b border-slate-300 mb-2" />
          <p className="text-sm text-slate-600 font-medium">توقيع الضامن</p>
        </div>
      </div>
    </div>
  );
};

export default ContractPrintView;
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Installment } from "@/types";
import { CheckCircle, Clock, Calendar, Send, Loader2 } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { sendWhatsAppMessage, getWhatsAppConfig, MESSAGE_TEMPLATES } from "@/components/WhatsAppService";

interface InstallmentScheduleProps {
  installments: Installment[];
  customerName: string;
  customerPhone: string;
  onMarkPaid?: (installmentId: number) => void;
  readOnly?: boolean;
}

const InstallmentSchedule = ({
  installments,
  customerName,
  customerPhone,
  onMarkPaid,
  readOnly = false,
}: InstallmentScheduleProps) => {
  const [sendingTo, setSendingTo] = useState<number | null>(null);

  const handleSendReminder = async (installment: Installment) => {
    const config = getWhatsAppConfig();
    if (!config.endpoint) {
      showError("يرجى إعداد واتساب أولاً من صفحة الإعدادات");
      return;
    }

    setSendingTo(installment.id);
    const dueDate = `${installment.day}/${installment.month}/${installment.year}`;

    const message = installment.isPaid
      ? MESSAGE_TEMPLATES.installmentPaid(customerName, installment.amount, dueDate, installment.number)
      : MESSAGE_TEMPLATES.installmentDue(customerName, installment.amount, dueDate, installment.number);

    const result = await sendWhatsAppMessage(customerPhone, message, config);

    if (result.success) {
      showSuccess(`تم إرسال إشعار القسط #${installment.number} 📱`);
    } else {
      showError(result.message);
    }
    setSendingTo(null);
  };

  return (
    <div className="space-y-2">
      {installments.map((installment) => {
        const dueDate = `${installment.day}/${installment.month}/${installment.year}`;
        return (
          <div
            key={installment.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-xl transition-all",
              installment.isPaid
                ? "bg-emerald-50/50 border border-emerald-100/50"
                : "bg-white/80 border border-slate-100"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm",
                  installment.isPaid
                    ? "bg-gradient-to-br from-emerald-500 to-teal-500"
                    : "bg-gradient-to-br from-amber-500 to-orange-500"
                )}
              >
                {installment.number}
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-700">
                  {installment.amount.toLocaleString()} ج.م
                </p>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Calendar className="h-3 w-3" />
                  {dueDate}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {installment.isPaid ? (
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 rounded-lg">
                  <CheckCircle className="h-3 w-3 ml-1" />
                  مدفوع
                </Badge>
              ) : (
                <Badge variant="outline" className="border-amber-200 text-amber-600 bg-amber-50 rounded-lg">
                  <Clock className="h-3 w-3 ml-1" />
                  باقي
                </Badge>
              )}

              <div className="flex gap-1">
                {!readOnly && !installment.isPaid && onMarkPaid && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"
                    onClick={() => onMarkPaid(installment.id)}
                    title="تسديد"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg text-violet-500 hover:text-violet-700 hover:bg-violet-50"
                  onClick={() => handleSendReminder(installment)}
                  disabled={sendingTo === installment.id}
                  title="إرسال إشعار واتساب"
                >
                  {sendingTo === installment.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        );
      })}

      {installments.length === 0 && (
        <p className="text-center text-slate-500 py-8 text-sm">لا توجد أقساط</p>
      )}
    </div>
  );
};

export default InstallmentSchedule;

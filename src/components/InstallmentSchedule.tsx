"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Installment } from "@/types";
import { CheckCircle, Clock, Calendar, Send, Loader2, ChevronDown, CreditCard } from "lucide-react";
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
  const [expanded, setExpanded] = useState(false);
  const [sendingTo, setSendingTo] = useState<number | null>(null);

  const paidCount = installments.filter((i) => i.isPaid).length;
  const totalCount = installments.length;
  const unpaidCount = totalCount - paidCount;
  const progressPercent = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

  const nextUnpaid = installments.find((i) => !i.isPaid);
  const totalAmount = installments.reduce((s, i) => s + i.amount, 0);
  const paidAmount = installments.filter((i) => i.isPaid).reduce((s, i) => s + i.amount, 0);
  const remainingAmount = totalAmount - paidAmount;

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

  if (installments.length === 0) {
    return (
      <p className="text-center text-slate-500 dark:text-slate-400 py-6 text-sm">
        لا توجد أقساط
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {/* ملخص مضغوط */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-l from-violet-50/80 to-purple-50/80 dark:from-violet-950/30 dark:to-purple-950/30 border border-violet-100 dark:border-violet-900/50 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-200 active:scale-[0.99] cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <CreditCard className="h-5 w-5 text-white" />
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                جدول الأقساط
              </span>
              <Badge className="rounded-lg border-0 bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 text-[10px]">
                {totalCount} قسط
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ {paidCount} مدفوع
              </span>
              {unpaidCount > 0 && (
                <>
                  <span className="text-[11px] text-slate-400">•</span>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                    ◷ {unpaidCount} باقي
                  </span>
                </>
              )}
              <span className="text-[11px] text-slate-400">•</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {progressPercent}%
              </span>
            </div>
            {/* المتبقي المالي */}
            {unpaidCount > 0 && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">المتبقي:</span>
                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                  {remainingAmount.toLocaleString()} ج.م
                </span>
                {nextUnpaid && (
                  <>
                    <span className="text-[11px] text-slate-400">•</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      القسط #{nextUnpaid.number}
                    </span>
                    <span className="text-[11px] text-slate-400">•</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400" dir="ltr">
                      {nextUnpaid.day}/{nextUnpaid.month}/{nextUnpaid.year}
                    </span>
                  </>
                )}
              </div>
            )}
            {unpaidCount === 0 && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  ✓ تم السداد بالكامل - لا يوجد متبقي
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
            expanded
              ? "bg-violet-500 text-white"
              : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/50 group-hover:text-violet-600"
          )}>
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", expanded && "rotate-180")} />
          </div>
        </div>
      </button>

      {/* قائمة الأقساط المنسدلة */}
      <div className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        expanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="space-y-2 pt-1">
          {installments.map((installment) => {
            const dueDate = `${installment.day}/${installment.month}/${installment.year}`;
            return (
              <div
                key={installment.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl transition-all active:scale-[0.99]",
                  installment.isPaid
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30"
                    : "bg-white/80 dark:bg-[#0f131a] border border-slate-100 dark:border-slate-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm",
                      installment.isPaid
                        ? "bg-gradient-to-br from-emerald-500 to-teal-500"
                        : "bg-gradient-to-br from-amber-500 to-orange-500"
                    )}
                  >
                    {installment.number}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">
                      {installment.amount.toLocaleString()} ج.م
                    </p>
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
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
                    <Badge variant="outline" className="border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                      <Clock className="h-3 w-3 ml-1" />
                      باقي
                    </Badge>
                  )}

                  <div className="flex gap-1">
                    {!readOnly && !installment.isPaid && onMarkPaid && (
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-lg text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 active:scale-90"
                            onClick={() => onMarkPaid(installment.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="rounded-lg text-xs">
                          <p>تسديد القسط</p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg text-violet-500 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/30 active:scale-90"
                          onClick={() => handleSendReminder(installment)}
                          disabled={sendingTo === installment.id}
                        >
                          {sendingTo === installment.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="rounded-lg text-xs">
                        <p>إرسال إشعار واتساب</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InstallmentSchedule;
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import CustomerLink from "@/components/CustomerLink";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import PrintDialog from "@/components/PrintDialog";
import { useAppSettings } from "@/hooks/useAppSettings";
import { api, ApiContract, ApiInstallment } from "@/lib/api";
import { getReceiptHtml } from "@/utils/pdfExport";
import { showSuccess, showError } from "@/utils/toast";
import {
  CreditCard, CheckCircle, Send, Loader2, Printer, Calendar, FileText, Clock, AlertTriangle, User,
} from "lucide-react";
import { sendWhatsAppMessage, getWhatsAppConfig, MESSAGE_TEMPLATES } from "@/components/WhatsAppService";

const Installments = () => {
  const { settings } = useAppSettings();
  const [installments, setInstallments] = useState<ApiInstallment[]>([]);
  const [contracts, setContracts] = useState<ApiContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "paid" | "overdue">("pending");
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ installment: ApiInstallment; type: "pay" | "unpay" } | null>(null);

  const [printOpen, setPrintOpen] = useState(false);
  const [printHtml, setPrintHtml] = useState("");
  const [printTitle, setPrintTitle] = useState("");
  const [printFilename, setPrintFilename] = useState("receipt.pdf");

  const fetchData = async () => {
    try {
      const [inst, cont] = await Promise.all([
        api.installments.list(),
        api.contracts.list(),
      ]);
      setInstallments(inst);
      setContracts(cont);
    } catch (e: any) {
      showError("خطأ: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredInstallments = installments.filter((i) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "pending") return !i.is_paid;
    if (activeFilter === "paid") return i.is_paid;
    if (activeFilter === "overdue") return !i.is_paid && new Date(i.year, i.month - 1, i.day) < today;
    return true;
  });

  const getContract = (contractId: number) => contracts.find((c) => c.id === contractId);

  const handlePrintReceipt = (installment: ApiInstallment, contract: ApiContract) => {
    const html = getReceiptHtml(
      {
        number: installment.number,
        amount: installment.amount,
        paid_date: installment.paid_date || undefined,
        day: installment.day,
        month: installment.month,
        year: installment.year,
        is_paid: !!installment.is_paid,
      },
      {
        id: contract.id,
        customer_name: contract.customer_name,
        customer_phone: contract.customer_phone,
        product_type: contract.product_type,
        total_price: contract.total_price,
        down_payment: contract.down_payment,
        number_of_receipts: contract.number_of_receipts,
        installment_amount: contract.installment_amount,
        start_date: contract.start_date,
        end_date: contract.end_date,
        guarantor_name: contract.guarantor_name,
        guarantor_phone: contract.guarantor_phone,
        created_at: contract.created_at,
      },
      {
        appName: settings.appName,
        companyName: settings.companyName,
        companyPhone: settings.companyPhone,
        companyAddress: settings.companyAddress,
        logoUrl: settings.logoUrl,
      }
    );
    setPrintHtml(html);
    setPrintTitle(`إيصال سداد - ${contract.customer_name} - القسط ${installment.number}`);
    setPrintFilename(`receipt-${contract.id}-${installment.number}.pdf`);
    setPrintOpen(true);
  };

  const handleTogglePaid = async (installment: ApiInstallment, type: "pay" | "unpay") => {
    setConfirmDialog({ installment, type });
  };

  const confirmTogglePaid = async () => {
    if (!confirmDialog) return;
    const { installment, type } = confirmDialog;
    try {
      await api.installments.update(installment.id, {
        isPaid: type === "pay",
        paidDate: type === "pay" ? new Date().toISOString().split("T")[0] : null,
      });
      showSuccess(type === "pay" ? "✅ تم تسجيل السداد" : "✅ تم إلغاء السداد");
      fetchData();
    } catch (e: any) {
      showError("خطأ: " + e.message);
    }
    setConfirmDialog(null);
  };

  const handleSendReminder = async (installment: ApiInstallment) => {
    const contract = getContract(installment.contract_id);
    if (!contract) return;
    const config = getWhatsAppConfig();
    if (!config.endpoint) {
      showError("يرجى إعداد واتساب من الإعدادات");
      return;
    }
    setSendingId(installment.id);
    const dueDate = `${installment.day}/${installment.month}/${installment.year}`;
    const message = installment.is_paid
      ? MESSAGE_TEMPLATES.installmentPaid(contract.customer_name, installment.amount, dueDate, installment.number)
      : MESSAGE_TEMPLATES.installmentDue(contract.customer_name, installment.amount, dueDate, installment.number);
    const result = await sendWhatsAppMessage(contract.customer_phone, message, config);
    if (result.success) showSuccess("✅ تم إرسال الإشعار"); else showError(result.message);
    setSendingId(null);
  };

  const getStatusInfo = (inst: ApiInstallment) => {
    if (inst.is_paid) return { label: "مدفوع", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle };
    const dueDate = new Date(inst.year, inst.month - 1, inst.day);
    if (dueDate < today) return { label: "متأخر", color: "bg-rose-100 text-rose-700", icon: AlertTriangle };
    return { label: "باقي", color: "bg-amber-100 text-amber-700", icon: Clock };
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
          <CreditCard className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">الأقساط</h1>
          <p className="text-slate-500 mt-1">إدارة وتتبع الأقساط والتحصيلات</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {([
          { value: "pending", label: "غير المسددة" },
          { value: "paid", label: "المسددة" },
          { value: "overdue", label: "المتأخرة" },
          { value: "all", label: "الكل" },
        ] as const).map((filter) => (
          <Button
            key={filter.value}
            variant={activeFilter === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(filter.value)}
            className={cn(
              "rounded-xl h-10 px-4",
              activeFilter === filter.value && {
                pending: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
                paid: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
                overdue: "bg-gradient-to-r from-rose-500 to-pink-500 text-white",
                all: "bg-gradient-to-r from-violet-500 to-purple-600 text-white",
              }[filter.value]
            )}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredInstallments.length === 0 && (
          <div className="text-center py-16">
            <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-600">لا توجد أقساط</h3>
            <p className="text-slate-500">لا توجد أقساط في هذا التصنيف</p>
          </div>
        )}

        {filteredInstallments.map((inst) => {
          const contract = getContract(inst.contract_id);
          const status = getStatusInfo(inst);
          const Icon = status.icon;
          const dueDate = `${inst.day}/${inst.month}/${inst.year}`;

          return (
            <Card key={inst.id} className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden hover-lift">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shadow-md",
                      inst.is_paid ? "bg-gradient-to-br from-emerald-500 to-teal-500" : "bg-gradient-to-br from-amber-500 to-orange-500"
                    )}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CustomerLink
                          customerId={contract?.customer_id}
                          customerName={contract?.customer_name || "عميل غير معروف"}
                          className="font-bold text-slate-800"
                        />
                        <Badge className={cn("rounded-lg border-0", status.color)}>
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-slate-500">
                        <span>{contract?.product_type}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">{inst.amount.toLocaleString()} ج.م</span>
                        <span>•</span>
                        <span>القسط #{inst.number}</span>
                        <span>•</span>
                        <span>{dueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {inst.is_paid && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 rounded-xl gap-1 text-violet-600 hover:bg-violet-50"
                        onClick={() => contract && handlePrintReceipt(inst, contract)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 rounded-xl text-violet-500 hover:bg-violet-50"
                      onClick={() => handleSendReminder(inst)}
                      disabled={sendingId === inst.id}
                    >
                      {sendingId === inst.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-9 rounded-xl gap-1",
                        inst.is_paid
                          ? "text-amber-600 hover:bg-amber-50"
                          : "text-emerald-600 hover:bg-emerald-50"
                      )}
                      onClick={() => handleTogglePaid(inst, inst.is_paid ? "unpay" : "pay")}
                    >
                      <CheckCircle className="h-4 w-4" />
                      {inst.is_paid ? "الغاء" : "سداد"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={confirmDialog !== null} onOpenChange={(open) => { if (!open) setConfirmDialog(null); }}>
        <DialogContent className="sm:max-w-[350px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              تأكيد {confirmDialog?.type === "pay" ? "السداد" : "إلغاء السداد"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            {confirmDialog?.type === "pay"
              ? "هل أنت متأكد من تسجيل هذا القسط كمدفوع؟"
              : "هل أنت متأكد من إلغاء تسجيل هذا القسط؟"}
          </p>
          <div className="flex gap-3 justify-end mt-4">
            <Button variant="outline" onClick={() => setConfirmDialog(null)} className="rounded-xl h-11">إلغاء</Button>
            <Button onClick={confirmTogglePaid} className={cn("rounded-xl h-11", confirmDialog?.type === "pay" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-amber-500 hover:bg-amber-600")}>
              تأكيد
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PrintDialog open={printOpen} onOpenChange={setPrintOpen} htmlContent={printHtml} title={printTitle} filename={printFilename} />
    </Layout>
  );
};

export default Installments;
const PRINT_STYLES = `
  @page { margin: 15mm; size: A4; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
    direction: rtl;
    text-align: right;
    color: #1e293b;
    line-height: 1.6;
    background: white;
    padding: 20px;
  }
  table { width: 100%; border-collapse: collapse; }
  @media print {
    body { padding: 0; }
    @page { margin: 10mm; }
  }
`;

/**
 * واجهات البيانات المتوقعة من قبل دوال الطباعة
 * (تمت مراعاة snake_case القادمة من API)
 */
interface ContractPrintData {
  id: number;
  customer_name: string;
  customer_phone: string;
  product_type: string;
  total_price: number;
  down_payment: number;
  number_of_receipts: number;
  installment_amount: number;
  start_date: string;
  end_date: string;
  guarantor_name: string;
  guarantor_phone: string;
  created_at: string;
}

interface InstallmentPrintData {
  number: number;
  amount: number;
  day: number;
  month: number;
  year: number;
  is_paid: boolean;
}

interface SettingsPrintData {
  appName: string;
  companyName: string;
  companyPhone: string;
  companyAddress: string;
  logoUrl: string;
}

const getLogoHtml = (settings: SettingsPrintData, color = "#8b5cf6", size = 60) => {
  if (settings.logoUrl) {
    return `<img src="${settings.logoUrl}" alt="الشعار" style="width:${size}px;height:${size}px;border-radius:${size / 4}px;object-fit:cover;margin-bottom:8px;">`;
  }
  return `<div style="width:${size}px;height:${size}px;background:linear-gradient(135deg,${color},${color}dd);border-radius:${size / 4}px;display:flex;align-items:center;justify-content:center;margin:0 auto 8px;color:white;font-size:${size / 2.5}px;font-weight:bold;">&#10022;</div>`;
};

export const getContractHtml = (
  contract: ContractPrintData,
  installments: InstallmentPrintData[],
  settings: SettingsPrintData
): string => {
  const installmentRows = installments
    .map(
      (inst) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:600;">${inst.number}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${inst.day}/${inst.month}/${inst.year}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${inst.amount.toLocaleString()} ج.م</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;color:${inst.is_paid ? "#10b981" : "#f59e0b"};font-weight:600;">
        ${inst.is_paid ? "مدفوع ✓" : "غير مدفوع"}
      </td>
    </tr>`
    )
    .join("");

  return `
    <div style="font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;text-align:right;color:#1e293b;max-width:800px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:28px;padding-bottom:20px;border-bottom:3px solid #8b5cf6;">
        ${getLogoHtml(settings)}
        <h1 style="font-size:24px;font-weight:700;color:#1e293b;margin:0 0 4px;">${settings.companyName || settings.appName}</h1>
        <h2 style="font-size:18px;font-weight:600;color:#6366f1;margin:0 0 6px;">عقد بيع بالأقساط</h2>
        <p style="font-size:12px;color:#64748b;margin:0;">رقم العقد: ${contract.id} &nbsp;|&nbsp; تاريخ الإنشاء: ${contract.created_at}</p>
      </div>

      <div style="margin-bottom:20px;">
        <h3 style="font-size:14px;font-weight:600;color:#6366f1;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #e2e8f0;">بيانات العميل</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div style="padding:10px 14px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
            <span style="font-size:11px;color:#94a3b8;display:block;">الاسم الكامل</span>
            <span style="font-size:14px;font-weight:600;color:#1e293b;">${contract.customer_name}</span>
          </div>
          <div style="padding:10px 14px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
            <span style="font-size:11px;color:#94a3b8;display:block;">رقم الهاتف</span>
            <span style="font-size:14px;font-weight:600;color:#1e293b;" dir="ltr">${contract.customer_phone}</span>
          </div>
        </div>
      </div>

      ${
        contract.guarantor_name
          ? `
      <div style="margin-bottom:20px;">
        <h3 style="font-size:14px;font-weight:600;color:#6366f1;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #e2e8f0;">بيانات الضامن</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div style="padding:10px 14px;background:#f0fdf4;border-radius:8px;border:1px solid #dcfce7;">
            <span style="font-size:11px;color:#94a3b8;display:block;">الاسم</span>
            <span style="font-size:14px;font-weight:600;color:#1e293b;">${contract.guarantor_name}</span>
          </div>
          <div style="padding:10px 14px;background:#f0fdf4;border-radius:8px;border:1px solid #dcfce7;">
            <span style="font-size:11px;color:#94a3b8;display:block;">رقم الهاتف</span>
            <span style="font-size:14px;font-weight:600;color:#1e293b;" dir="ltr">${contract.guarantor_phone}</span>
          </div>
        </div>
      </div>`
          : ""
      }

      <div style="margin-bottom:24px;">
        <h3 style="font-size:14px;font-weight:600;color:#6366f1;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #e2e8f0;">التفاصيل المالية</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;">
          <div style="padding:14px 10px;background:#f8fafc;border-radius:10px;text-align:center;border:1px solid #e2e8f0;">
            <p style="font-size:10px;color:#94a3b8;margin:0 0 4px;">المنتج</p>
            <p style="font-size:14px;font-weight:700;color:#1e293b;margin:0;">${contract.product_type}</p>
          </div>
          <div style="padding:14px 10px;background:#f8fafc;border-radius:10px;text-align:center;border:1px solid #e2e8f0;">
            <p style="font-size:10px;color:#94a3b8;margin:0 0 4px;">السعر الإجمالي</p>
            <p style="font-size:14px;font-weight:700;color:#1e293b;margin:0;">${contract.total_price.toLocaleString()} ج.م</p>
          </div>
          <div style="padding:14px 10px;background:#f8fafc;border-radius:10px;text-align:center;border:1px solid #e2e8f0;">
            <p style="font-size:10px;color:#94a3b8;margin:0 0 4px;">الدفعة المقدمة</p>
            <p style="font-size:14px;font-weight:700;color:#1e293b;margin:0;">${contract.down_payment.toLocaleString()} ج.م</p>
          </div>
          <div style="padding:14px 10px;background:linear-gradient(135deg,#f5f3ff,#ede9fe);border-radius:10px;text-align:center;border:1px solid #ddd6fe;">
            <p style="font-size:10px;color:#7c3aed;margin:0 0 4px;">القسط الشهري</p>
            <p style="font-size:16px;font-weight:700;color:#6d28d9;margin:0;">${contract.installment_amount.toLocaleString()} ج.م</p>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">
          <div style="padding:10px 14px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
            <span style="font-size:11px;color:#94a3b8;">عدد الأقساط:</span>
            <span style="font-size:14px;font-weight:600;margin-right:8px;">${contract.number_of_receipts} قسط</span>
          </div>
          <div style="padding:10px 14px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
            <span style="font-size:11px;color:#94a3b8;">فترة السداد:</span>
            <span style="font-size:14px;font-weight:600;margin-right:8px;">من ${contract.start_date} إلى ${contract.end_date}</span>
          </div>
        </div>
      </div>

      <div style="margin-bottom:24px;">
        <h3 style="font-size:14px;font-weight:600;color:#6366f1;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #e2e8f0;">جدول الأقساط</h3>
        <table style="width:100%;border-collapse:collapse;font-size:12px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
          <thead>
            <tr>
              <th style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:10px 12px;text-align:center;font-weight:600;">رقم القسط</th>
              <th style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:10px 12px;text-align:center;font-weight:600;">تاريخ الاستحقاق</th>
              <th style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:10px 12px;text-align:center;font-weight:600;">المبلغ</th>
              <th style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:10px 12px;text-align:center;font-weight:600;">الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${installmentRows}
          </tbody>
        </table>
      </div>

      <div style="margin-bottom:28px;padding:16px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">
        <h3 style="font-size:13px;font-weight:600;color:#1e293b;margin-bottom:10px;">الشروط والأحكام</h3>
        <div style="font-size:11px;color:#64748b;line-height:2;">
          <p>1. يلتزم العميل بسداد الأقساط في مواعيدها المحددة شهرياً.</p>
          <p>2. في حالة التأخر عن السداد بأكثر من 7 أيام يحق للشركة اتخاذ الإجراءات القانونية اللازمة.</p>
          <p>3. لا يجوز تعديل هذا العقد إلا بموجب اتفاق كتابي مُوقع من الطرفين.</p>
          <p>4. يتحمل الضامن المسؤولية الكاملة في حالة إخلال العميل بالتزاماته المالية.</p>
          <p>5. يحق للشركة استرداد المنتج في حالة توقف السداد لأكثر من 3 أشهر متتالية.</p>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:50px;margin-top:40px;padding-top:20px;border-top:2px solid #e2e8f0;">
        <div style="text-align:center;">
          <div style="border-top:2px solid #1e293b;margin-top:60px;margin-bottom:10px;"></div>
          <p style="font-size:13px;font-weight:600;color:#1e293b;margin-bottom:2px;">توقيع العميل</p>
          <p style="font-size:11px;color:#94a3b8;">(${contract.customer_name})</p>
        </div>
        <div style="text-align:center;">
          <div style="border-top:2px solid #1e293b;margin-top:60px;margin-bottom:10px;"></div>
          <p style="font-size:13px;font-weight:600;color:#1e293b;margin-bottom:2px;">توقيع الضامن</p>
          <p style="font-size:11px;color:#94a3b8;">(${contract.guarantor_name || "—"})</p>
        </div>
      </div>

      <div style="text-align:center;margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:10px;color:#94a3b8;">
        ${settings.companyName ? settings.companyName + " | " : ""}${settings.companyPhone ? settings.companyPhone + " | " : ""}نظام ${settings.appName}
      </div>
    </div>
  `;
};

export const getReceiptHtml = (
  installment: { number: number; amount: number; paid_date?: string; day: number; month: number; year: number; is_paid: boolean },
  contract: { id: number; customer_name: string; product_type: string; number_of_receipts: number; total_price: number; down_payment: number; installment_amount: number; start_date: string; end_date: string; guarantor_name: string; guarantor_phone: string; created_at: string; customer_phone: string },
  settings: SettingsPrintData
): string => {
  const paidDate = installment.paid_date || new Date().toISOString().split("T")[0];

  return `
    <div style="font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;text-align:right;color:#1e293b;max-width:500px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:24px;padding-bottom:18px;border-bottom:3px solid #10b981;">
        ${getLogoHtml(settings, "#10b981", 50)}
        <h1 style="font-size:22px;font-weight:700;color:#1e293b;margin:0 0 4px;">${settings.companyName || settings.appName}</h1>
        <h2 style="font-size:17px;font-weight:600;color:#10b981;margin:0;">إيصال سداد قسط</h2>
        <p style="font-size:11px;color:#94a3b8;margin:6px 0 0;">إيصال رقم: R-${contract.id}-${installment.number}</p>
      </div>

      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;padding:10px 32px;background:linear-gradient(135deg,#10b981,#059669);color:white;border-radius:24px;font-size:15px;font-weight:700;box-shadow:0 4px 12px rgba(16,185,129,0.3);">
          ✓ تم السداد بنجاح
        </div>
      </div>

      <div style="margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#94a3b8;width:42%;background:#f8fafc;">اسم العميل</td>
            <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:600;">${contract.customer_name}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#94a3b8;background:#f8fafc;">رقم العقد</td>
            <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:600;">${contract.id}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#94a3b8;background:#f8fafc;">المنتج</td>
            <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:600;">${contract.product_type}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#94a3b8;background:#f8fafc;">رقم القسط</td>
            <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:600;">القسط ${installment.number} من ${contract.number_of_receipts}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#94a3b8;background:#f8fafc;">المبلغ المدفوع</td>
            <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:700;color:#10b981;font-size:18px;">${installment.amount.toLocaleString()} ج.م</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#94a3b8;background:#f8fafc;">تاريخ السداد الفعلي</td>
            <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:600;">${paidDate}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;color:#94a3b8;background:#f8fafc;">تاريخ الاستحقاق الأصلي</td>
            <td style="padding:12px 16px;font-weight:600;">${installment.day}/${installment.month}/${installment.year}</td>
          </tr>
        </table>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:40px;padding-top:16px;border-top:2px solid #e2e8f0;">
        <div style="text-align:center;">
          <div style="border-top:2px solid #1e293b;margin-top:50px;margin-bottom:10px;"></div>
          <p style="font-size:12px;font-weight:600;color:#1e293b;">توقيع المستلم</p>
        </div>
        <div style="text-align:center;">
          <div style="border-top:2px solid #1e293b;margin-top:50px;margin-bottom:10px;"></div>
          <p style="font-size:12px;font-weight:600;color:#1e293b;">توقيع العميل</p>
        </div>
      </div>

      <div style="text-align:center;margin-top:24px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:10px;color:#94a3b8;">
        ${settings.companyName ? settings.companyName + " | " : ""}${settings.companyPhone ? settings.companyPhone + " | " : ""}نظام ${settings.appName}
      </div>
    </div>
  `;
};

export const printHtml = (html: string): void => {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>طباعة</title>
      <style>${PRINT_STYLES}</style>
    </head>
    <body>${html}
      <script>window.onload = function() { window.print(); }<\/script>
    </body>
    </html>`);
  win.document.close();
};

export const generatePdf = async (element: HTMLElement, filename: string): Promise<void> => {
  const html2canvas = (await import("html2canvas")).default;
  const jsPDF = (await import("jspdf")).default;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(filename);
};
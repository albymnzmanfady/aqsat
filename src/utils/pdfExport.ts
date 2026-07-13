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

interface ContractData {
  id: number;
  customerName: string;
  customerPhone: string;
  productType: string;
  totalPrice: number;
  downPayment: number;
  numberOfReceipts: number;
  installmentAmount: number;
  startDate: string;
  endDate: string;
  guarantorName: string;
  guarantorPhone: string;
  createdAt: string;
}

interface InstallmentData {
  id: number;
  contractId: number;
  number: number;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  paidDate?: string;
  day: number;
  month: number;
  year: number;
}

interface Settings {
  appName: string;
  companyName: string;
  companyPhone: string;
  companyAddress: string;
  logoUrl: string;
}

const getLogoHtml = (settings: Settings, color = "#8b5cf6", size = 60) => {
  if (settings.logoUrl) {
    return `<img src="${settings.logoUrl}" alt="Logo" style="width:${size}px;height:${size}px;border-radius:${size / 4}px;object-fit:cover;margin-bottom:8px;">`;
  }
  return `<div style="width:${size}px;height:${size}px;background:linear-gradient(135deg,${color},${color}dd);border-radius:${size / 4}px;display:flex;align-items:center;justify-content:center;margin:0 auto 8px;color:white;font-size:${size / 2.5}px;font-weight:bold;">&#10022;</div>`;
};

export const getContractHtml = (
  contract: ContractData,
  installments: InstallmentData[],
  settings: Settings
): string => {
  const installmentRows = installments
    .map(
      (inst) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:600;">${inst.number}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${inst.day}/${inst.month}/${inst.year}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${inst.amount.toLocaleString()} EGP</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;color:${inst.isPaid ? "#10b981" : "#f59e0b"};font-weight:600;">
        ${inst.isPaid ? "PAID" : "UNPAID"}
      </td>
    </tr>`
    )
    .join("");

  return `
    <div style="font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;text-align:right;color:#1e293b;max-width:800px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:28px;padding-bottom:20px;border-bottom:3px solid #8b5cf6;">
        ${getLogoHtml(settings)}
        <h1 style="font-size:24px;font-weight:700;color:#1e293b;margin:0 0 4px;">${settings.companyName || settings.appName}</h1>
        <h2 style="font-size:18px;font-weight:600;color:#6366f1;margin:0 0 6px;">Installment Contract</h2>
        <p style="font-size:12px;color:#64748b;margin:0;">Contract No: ${contract.id} | Created: ${contract.createdAt}</p>
      </div>

      <div style="margin-bottom:20px;">
        <h3 style="font-size:14px;font-weight:600;color:#6366f1;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #e2e8f0;">Customer Information</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div style="padding:10px 14px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
            <span style="font-size:11px;color:#94a3b8;display:block;">Full Name</span>
            <span style="font-size:14px;font-weight:600;color:#1e293b;">${contract.customerName}</span>
          </div>
          <div style="padding:10px 14px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
            <span style="font-size:11px;color:#94a3b8;display:block;">Phone</span>
            <span style="font-size:14px;font-weight:600;color:#1e293b;" dir="ltr">${contract.customerPhone}</span>
          </div>
        </div>
      </div>

      ${
        contract.guarantorName
          ? `
      <div style="margin-bottom:20px;">
        <h3 style="font-size:14px;font-weight:600;color:#6366f1;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #e2e8f0;">Guarantor Information</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div style="padding:10px 14px;background:#f0fdf4;border-radius:8px;border:1px solid #dcfce7;">
            <span style="font-size:11px;color:#94a3b8;display:block;">Name</span>
            <span style="font-size:14px;font-weight:600;color:#1e293b;">${contract.guarantorName}</span>
          </div>
          <div style="padding:10px 14px;background:#f0fdf4;border-radius:8px;border:1px solid #dcfce7;">
            <span style="font-size:11px;color:#94a3b8;display:block;">Phone</span>
            <span style="font-size:14px;font-weight:600;color:#1e293b;" dir="ltr">${contract.guarantorPhone}</span>
          </div>
        </div>
      </div>`
          : ""
      }

      <div style="margin-bottom:24px;">
        <h3 style="font-size:14px;font-weight:600;color:#6366f1;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #e2e8f0;">Financial Details</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;">
          <div style="padding:14px 10px;background:#f8fafc;border-radius:10px;text-align:center;border:1px solid #e2e8f0;">
            <p style="font-size:10px;color:#94a3b8;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.5px;">Product</p>
            <p style="font-size:14px;font-weight:700;color:#1e293b;margin:0;">${contract.productType}</p>
          </div>
          <div style="padding:14px 10px;background:#f8fafc;border-radius:10px;text-align:center;border:1px solid #e2e8f0;">
            <p style="font-size:10px;color:#94a3b8;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.5px;">Total Price</p>
            <p style="font-size:14px;font-weight:700;color:#1e293b;margin:0;">${contract.totalPrice.toLocaleString()} EGP</p>
          </div>
          <div style="padding:14px 10px;background:#f8fafc;border-radius:10px;text-align:center;border:1px solid #e2e8f0;">
            <p style="font-size:10px;color:#94a3b8;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.5px;">Down Payment</p>
            <p style="font-size:14px;font-weight:700;color:#1e293b;margin:0;">${contract.downPayment.toLocaleString()} EGP</p>
          </div>
          <div style="padding:14px 10px;background:linear-gradient(135deg,#f5f3ff,#ede9fe);border-radius:10px;text-align:center;border:1px solid #ddd6fe;">
            <p style="font-size:10px;color:#7c3aed;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.5px;">Monthly Installment</p>
            <p style="font-size:16px;font-weight:700;color:#6d28d9;margin:0;">${contract.installmentAmount.toLocaleString()} EGP</p>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">
          <div style="padding:10px 14px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
            <span style="font-size:11px;color:#94a3b8;">Number of Installments:</span>
            <span style="font-size:14px;font-weight:600;margin-right:8px;">${contract.numberOfReceipts}</span>
          </div>
          <div style="padding:10px 14px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
            <span style="font-size:11px;color:#94a3b8;">Period:</span>
            <span style="font-size:14px;font-weight:600;margin-right:8px;">From ${contract.startDate} to ${contract.endDate}</span>
          </div>
        </div>
      </div>

      <div style="margin-bottom:24px;">
        <h3 style="font-size:14px;font-weight:600;color:#6366f1;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #e2e8f0;">Installment Schedule</h3>
        <table style="width:100%;border-collapse:collapse;font-size:12px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
          <thead>
            <tr>
              <th style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:10px 12px;text-align:center;font-weight:600;">No.</th>
              <th style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:10px 12px;text-align:center;font-weight:600;">Due Date</th>
              <th style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:10px 12px;text-align:center;font-weight:600;">Amount</th>
              <th style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:10px 12px;text-align:center;font-weight:600;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${installmentRows}
          </tbody>
        </table>
      </div>

      <div style="margin-bottom:28px;padding:16px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">
        <h3 style="font-size:13px;font-weight:600;color:#1e293b;margin-bottom:10px;">Terms and Conditions</h3>
        <div style="font-size:11px;color:#64748b;line-height:2;">
          <p>1. The customer is committed to paying installments on their scheduled monthly dates.</p>
          <p>2. In case of delay in payment for more than 7 days, the company reserves the right to take legal action.</p>
          <p>3. This contract may not be modified except by written agreement signed by both parties.</p>
          <p>4. The guarantor bears full responsibility in case of breach of financial obligations by the customer.</p>
          <p>5. The company reserves the right to reclaim the product if payment stops for more than 3 consecutive months.</p>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:50px;margin-top:40px;padding-top:20px;border-top:2px solid #e2e8f0;">
        <div style="text-align:center;">
          <div style="border-top:2px solid #1e293b;margin-top:60px;margin-bottom:10px;"></div>
          <p style="font-size:13px;font-weight:600;color:#1e293b;margin-bottom:2px;">Customer Signature</p>
          <p style="font-size:11px;color:#94a3b8;">(${contract.customerName})</p>
        </div>
        <div style="text-align:center;">
          <div style="border-top:2px solid #1e293b;margin-top:60px;margin-bottom:10px;"></div>
          <p style="font-size:13px;font-weight:600;color:#1e293b;margin-bottom:2px;">Guarantor Signature</p>
          <p style="font-size:11px;color:#94a3b8;">(${contract.guarantorName || "N/A"})</p>
        </div>
      </div>

      <div style="text-align:center;margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:10px;color:#94a3b8;">
        ${settings.companyName ? settings.companyName + " | " : ""}${settings.companyPhone ? settings.companyPhone + " | " : ""}Powered by ${settings.appName}
      </div>
    </div>
  `;
};

export const getReceiptHtml = (
  installment: InstallmentData,
  contract: ContractData,
  settings: Settings
): string => {
  const paidDate = installment.paidDate || new Date().toISOString().split("T")[0];

  return `
    <div style="font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;text-align:right;color:#1e293b;max-width:500px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:24px;padding-bottom:18px;border-bottom:3px solid #10b981;">
        ${getLogoHtml(settings, "#10b981", 50)}
        <h1 style="font-size:22px;font-weight:700;color:#1e293b;margin:0 0 4px;">${settings.companyName || settings.appName}</h1>
        <h2 style="font-size:17px;font-weight:600;color:#10b981;margin:0;">Payment Receipt</h2>
        <p style="font-size:11px;color:#94a3b8;margin:6px 0 0;">Receipt No: R-${contract.id}-${installment.number}</p>
      </div>

      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;padding:10px 32px;background:linear-gradient(135deg,#10b981,#059669);color:white;border-radius:24px;font-size:15px;font-weight:700;box-shadow:0 4px 12px rgba(16,185,129,0.3);">
          Payment Confirmed
        </div>
      </div>

      <div style="margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#94a3b8;width:42%;background:#f8fafc;">Customer Name</td>
            <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:600;">${contract.customerName}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#94a3b8;background:#f8fafc;">Contract No</td>
            <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:600;">${contract.id}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#94a3b8;background:#f8fafc;">Product</td>
            <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:600;">${contract.productType}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#94a3b8;background:#f8fafc;">Installment No</td>
            <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:600;">${installment.number} of ${contract.numberOfReceipts}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#94a3b8;background:#f8fafc;">Amount Paid</td>
            <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:700;color:#10b981;font-size:18px;">${installment.amount.toLocaleString()} EGP</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#94a3b8;background:#f8fafc;">Payment Date</td>
            <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:600;">${paidDate}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;color:#94a3b8;background:#f8fafc;">Original Due Date</td>
            <td style="padding:12px 16px;font-weight:600;">${installment.day}/${installment.month}/${installment.year}</td>
          </tr>
        </table>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:40px;padding-top:16px;border-top:2px solid #e2e8f0;">
        <div style="text-align:center;">
          <div style="border-top:2px solid #1e293b;margin-top:50px;margin-bottom:10px;"></div>
          <p style="font-size:12px;font-weight:600;color:#1e293b;">Receiver Signature</p>
        </div>
        <div style="text-align:center;">
          <div style="border-top:2px solid #1e293b;margin-top:50px;margin-bottom:10px;"></div>
          <p style="font-size:12px;font-weight:600;color:#1e293b;">Customer Signature</p>
        </div>
      </div>

      <div style="text-align:center;margin-top:24px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:10px;color:#94a3b8;">
        ${settings.companyName ? settings.companyName + " | " : ""}${settings.companyPhone ? settings.companyPhone + " | " : ""}Powered by ${settings.appName}
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
      <title>Print</title>
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
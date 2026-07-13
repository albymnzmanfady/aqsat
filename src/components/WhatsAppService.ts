"use client";

interface WhatsAppConfig {
  provider: "waha" | "evolution" | "ultramsg";
  endpoint: string;
  apiKey: string;
  instanceName: string;
}

interface MessageResult {
  success: boolean;
  message: string;
}

const DEFAULT_CONFIG: WhatsAppConfig = {
  provider: "waha",
  endpoint: "",
  apiKey: "",
  instanceName: "default",
};

export const getWhatsAppConfig = (): WhatsAppConfig => {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const saved = localStorage.getItem("whatsapp_config");
    if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
  } catch (e) {
    console.error("Error loading WhatsApp config:", e);
  }
  return DEFAULT_CONFIG;
};

export const saveWhatsAppConfig = (config: WhatsAppConfig): void => {
  localStorage.setItem("whatsapp_config", JSON.stringify(config));
};

export const testConnection = async (config: WhatsAppConfig): Promise<MessageResult> => {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    if (config.provider === "waha") {
      if (config.apiKey) headers["Authorization"] = `Bearer ${config.apiKey}`;
      const response = await fetch(`${config.endpoint.replace(/\/$/, "")}/api/health`, {
        method: "GET", headers, signal: AbortSignal.timeout(10000),
      });
      return response.ok
        ? { success: true, message: "✅ تم الاتصال بنجاح بـ Waha" }
        : { success: false, message: "❌ فشل الاتصال: " + response.statusText };
    } else if (config.provider === "evolution") {
      const response = await fetch(
        `${config.endpoint.replace(/\/$/, "")}/instance/connectionState/${config.instanceName}`,
        { method: "GET", headers: { ...headers, apikey: config.apiKey }, signal: AbortSignal.timeout(10000) }
      );
      return response.ok
        ? { success: true, message: "✅ تم الاتصال بنجاح بـ Evolution API" }
        : { success: false, message: "❌ فشل الاتصال: " + response.statusText };
    }
    return { success: false, message: "مزود الخدمة غير مدعوم" };
  } catch (error: any) {
    return { success: false, message: "❌ فشل الاتصال: " + (error.message || "خطأ غير معروف") };
  }
};

export const sendWhatsAppMessage = async (
  phone: string,
  message: string,
  config?: WhatsAppConfig
): Promise<MessageResult> => {
  const cfg = config || getWhatsAppConfig();
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const phoneWithCode = cleanPhone.startsWith("2") ? cleanPhone : `2${cleanPhone}`;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    if (cfg.provider === "waha") {
      if (cfg.apiKey) headers["Authorization"] = `Bearer ${cfg.apiKey}`;
      const response = await fetch(`${cfg.endpoint.replace(/\/$/, "")}/api/send/text`, {
        method: "POST", headers,
        body: JSON.stringify({ chatId: `${phoneWithCode}@c.us`, text: message }),
      });
      if (response.ok) return { success: true, message: "✅ تم إرسال الرسالة" };
      const error = await response.text();
      return { success: false, message: `❌ ${error}` };
    } else if (cfg.provider === "evolution") {
      const response = await fetch(
        `${cfg.endpoint.replace(/\/$/, "")}/message/sendText/${cfg.instanceName}`,
        { method: "POST", headers: { ...headers, apikey: cfg.apiKey },
          body: JSON.stringify({ number: phoneWithCode, text: message }) }
      );
      if (response.ok) return { success: true, message: "✅ تم إرسال الرسالة" };
      const error = await response.text();
      return { success: false, message: `❌ ${error}` };
    } else if (cfg.provider === "ultramsg") {
      const response = await fetch(
        `https://api.ultramsg.com/${cfg.instanceName}/messages/chat`,
        { method: "POST", headers,
          body: JSON.stringify({ token: cfg.apiKey, to: `+${phoneWithCode}`, body: message }) }
      );
      if (response.ok) return { success: true, message: "✅ تم إرسال الرسالة" };
      const error = await response.text();
      return { success: false, message: `❌ ${error}` };
    }
    return { success: false, message: "مزود الخدمة غير مدعوم" };
  } catch (error: any) {
    return { success: false, message: `❌ ${error.message || "خطأ غير معروف"}` };
  }
};

// === قوالب الرسائل الجاهزة ===

export const MESSAGE_TEMPLATES = {
  /** عند تسديد قسط */
  installmentPaid: (customerName: string, amount: number, date: string, installNum: number) =>
    `عزيزي ${customerName} 👋

تم تسديد القسط رقم #${installNum} بنجاح ✅

📋 القيمة: ${amount.toLocaleString()} ج.م
📅 تاريخ السداد: ${date}

نشكركم على التزامكم ❤️`,

  /** تذكير باقتراب القسط */
  installmentDue: (customerName: string, amount: number, dueDate: string, installNum: number) =>
    `عزيزي ${customerName} 👋

تذكير باقتراب موعد استحقاق القسط 💡

📋 رقم القسط: #${installNum}
💰 القيمة: ${amount.toLocaleString()} ج.م
📅 الاستحقاق: ${dueDate}

نأمل الالتزام بالسداد في الموعد المحدد 🙏`,

  /** تأخر عن السداد */
  installmentOverdue: (customerName: string, amount: number, daysOverdue: number, installNum: number) =>
    `عزيزي ${customerName} 👋

تنبيه هام ⚠️

تم تجاوز موعد استحقاق القسط رقم #${installNum}
بمبلغ ${amount.toLocaleString()} ج.م
منذ ${daysOverdue} يوماً

نأمل منكم سرعة سداد القسط لتجنب أي إجراءات 🙏`,

  /** عقد جديد */
  newContract: (customerName: string, productType: string, totalPrice: number, installmentAmount: number) =>
    `عزيزي ${customerName} 🎉

تم إنشاء عقد الأقساط الخاص بك بنجاح ✅

📦 السلعة: ${productType}
💰 الإجمالي: ${totalPrice.toLocaleString()} ج.م
📆 القسط الشهري: ${installmentAmount.toLocaleString()} ج.م

نشكركم على ثقتكم ❤️`,

  /** ترحيب */
  welcome: (customerName: string) =>
    `مرحباً ${customerName} 🙋‍♂️

شكراً لتعاملكم معنا.
نحن سعداء بخدمتكم.

للاستفسار: 01000000000`,
};

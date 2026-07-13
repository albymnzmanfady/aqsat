"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";
import {
  getWhatsAppConfig,
  saveWhatsAppConfig,
  testConnection,
  sendWhatsAppMessage,
  MESSAGE_TEMPLATES,
} from "@/components/WhatsAppService";
import {
  MessageSquareText,
  Settings2,
  Wifi,
  Send,
  Phone,
  Key,
  Server,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Info,
  Smartphone,
  Bell,
} from "lucide-react";

const Settings = () => {
  const [config, setConfig] = useState(getWhatsAppConfig());
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");
  const [testPhone, setTestPhone] = useState("");

  useEffect(() => {
    setConfig(getWhatsAppConfig());
  }, []);

  const handleSave = () => {
    saveWhatsAppConfig(config);
    showSuccess("✅ تم حفظ إعدادات واتساب بنجاح");
  };

  const handleTest = async () => {
    setTestStatus("testing");
    const result = await testConnection(config);
    if (result.success) {
      setTestStatus("success");
      setTestMessage(result.message);
    } else {
      setTestStatus("error");
      setTestMessage(result.message);
    }
  };

  const handleSendTest = async () => {
    if (!testPhone) {
      showError("يرجى إدخال رقم الهاتف");
      return;
    }
    const result = await sendWhatsAppMessage(
      testPhone,
      MESSAGE_TEMPLATES.welcome("عميلنا العزيز"),
      config
    );
    if (result.success) {
      showSuccess(result.message);
    } else {
      showError(result.message);
    }
  };

  const providers = [
    { value: "waha", label: "Waha", desc: "مفتوح المصدر - سيرفر محلي" },
    { value: "evolution", label: "Evolution API", desc: "يدعم Webhook وقابل للتوسع" },
    { value: "ultramsg", label: "UltraMsg", desc: "خدمة سحابية - مدفوعة" },
  ];

  const statusColor = {
    idle: "bg-slate-100 text-slate-500",
    testing: "bg-amber-100 text-amber-600",
    success: "bg-emerald-100 text-emerald-600",
    error: "bg-rose-100 text-rose-600",
  };

  const statusIcon = {
    idle: Wifi,
    testing: Loader2,
    success: CheckCircle2,
    error: XCircle,
  };

  const StatusIcon = statusIcon[testStatus];

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="relative">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-slate-400 to-gray-500 rounded-full opacity-20 blur-xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-slate-500 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-500/30">
              <Settings2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">الإعدادات</h1>
              <p className="text-slate-500 mt-1">إعدادات واتساب وإشعارات العملاء</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* إعدادات واتساب + إرسال رسالة اختبارية */}
        <div className="space-y-6">
          <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden hover-lift">
            <CardHeader className="pb-4 border-b border-slate-100/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                  <MessageSquareText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-800">إعدادات واتساب</CardTitle>
                  <p className="text-xs text-slate-500">قم بتوصيل حساب واتساب لإرسال الإشعارات</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {/* مزود الخدمة */}
              <div className="space-y-2">
                <Label className="font-medium flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-violet-500" />
                  مزود الخدمة
                </Label>
                <Select
                  value={config.provider}
                  onValueChange={(val: "waha" | "evolution" | "ultramsg") =>
                    setConfig({ ...config, provider: val })
                  }
                >
                  <SelectTrigger className="rounded-xl h-12 bg-white/50 backdrop-blur-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        <div>
                          <span>{p.label}</span>
                          <span className="text-xs text-slate-400 mr-2">{p.desc}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Endpoint */}
              <div className="space-y-2">
                <Label className="font-medium flex items-center gap-2">
                  <Server className="h-4 w-4 text-violet-500" />
                  رابط الخادم (API Endpoint)
                </Label>
                <Input
                  value={config.endpoint}
                  onChange={(e) => setConfig({ ...config, endpoint: e.target.value })}
                  className="rounded-xl h-12 bg-white/50 backdrop-blur-sm"
                  placeholder={
                    config.provider === "waha"
                      ? "http://localhost:3000"
                      : "http://localhost:8080"
                  }
                  dir="ltr"
                />
                <p className="text-xs text-slate-400">
                  {config.provider === "waha"
                    ? "رابط سيرفر Waha (افتراضي: http://localhost:3000)"
                    : config.provider === "evolution"
                    ? "رابط سيرفر Evolution API (افتراضي: http://localhost:8080)"
                    : "لن تحتاج رابط خادم لـ UltraMsg"}
                </p>
              </div>

              {/* API Key */}
              <div className="space-y-2">
                <Label className="font-medium flex items-center gap-2">
                  <Key className="h-4 w-4 text-violet-500" />
                  مفتاح API (API Key)
                </Label>
                <Input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  className="rounded-xl h-12 bg-white/50 backdrop-blur-sm"
                  placeholder="اختياري - اتركه فارغاً إن لم يكن مطلوباً"
                  dir="ltr"
                />
              </div>

              {/* Instance Name */}
              <div className="space-y-2">
                <Label className="font-medium">اسم المثيل (Instance Name)</Label>
                <Input
                  value={config.instanceName}
                  onChange={(e) => setConfig({ ...config, instanceName: e.target.value })}
                  className="rounded-xl h-12 bg-white/50 backdrop-blur-sm"
                  placeholder={config.provider === "waha" ? "default" : "my-instance"}
                  dir="ltr"
                />
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  onClick={handleTest}
                  className="rounded-xl h-11 gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 active:scale-[0.97]"
                  disabled={testStatus === "testing"}
                >
                  {testStatus === "testing" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  اختبار الاتصال
                </Button>
                <Button
                  onClick={handleSave}
                  className="rounded-xl h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 gap-2 active:scale-[0.97]"
                >
                  <Sparkles className="h-4 w-4" />
                  حفظ الإعدادات
                </Button>
              </div>

              {/* حالة الاتصال */}
              {testStatus !== "idle" && (
                <div className={cn(
                  "p-4 rounded-2xl flex items-center gap-3",
                  testStatus === "success" ? "bg-emerald-50 border border-emerald-200" : "bg-rose-50 border border-rose-200"
                )}>
                  <StatusIcon className={cn(
                    "h-5 w-5",
                    testStatus === "testing" && "animate-spin text-amber-500",
                    testStatus === "success" && "text-emerald-500",
                    testStatus === "error" && "text-rose-500"
                  )} />
                  <span className={cn(
                    "text-sm font-medium",
                    testStatus === "success" ? "text-emerald-700" : "text-rose-700"
                  )}>
                    {testMessage}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden hover-lift">
            <CardHeader className="pb-4 border-b border-slate-100/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                  <Send className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-800">إرسال رسالة اختبارية</CardTitle>
                  <p className="text-xs text-slate-500">تأكد من وصول الرسائل بشكل صحيح</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-violet-500" />
                    رقم الهاتف (بدون مفتاح الدولة)
                  </Label>
                  <Input
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value.replace(/[^0-9]/g, ""))}
                    className="rounded-xl h-12 bg-white/50 backdrop-blur-sm"
                    placeholder="01012345678"
                    dir="ltr"
                  />
                </div>
                <Button
                  onClick={handleSendTest}
                  className="rounded-xl h-11 w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 gap-2 active:scale-[0.97]"
                  disabled={!testPhone}
                >
                  <Send className="h-4 w-4" />
                  إرسال رسالة اختبار
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* تعليمات الإعداد */}
        <div className="space-y-6">
          <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden hover-lift">
            <CardHeader className="pb-4 border-b border-slate-100/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                  <Info className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-800">كيفية الإعداد</CardTitle>
                  <p className="text-xs text-slate-500">خطوات توصيل واتساب مع التطبيق</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Waha */}
              <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-100 hover-lift">
                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0">Waha</Badge>
                  <span className="text-sm">مفتوح المصدر - مجاني</span>
                </h3>
                <ol className="text-sm text-slate-600 space-y-2 pr-5 list-decimal">
                  <li>قم بتشغيل Waha عبر Docker: <code className="bg-slate-100 px-2 py-0.5 rounded text-xs">docker run -p 3000:3000 devlikeapro/waha</code></li>
                  <li>افتح الرابط: <code className="bg-slate-100 px-2 py-0.5 rounded text-xs">http://localhost:3000</code></li>
                  <li>امسح QR code من واتساب على هاتفك</li>
                  <li>انسخ الرابط إلى حقل "رابط الخادم" أعلاه</li>
                </ol>
              </div>

              {/* Evolution API */}
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 hover-lift">
                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">Evolution API</Badge>
                  <span className="text-sm">عبر Docker</span>
                </h3>
                <ol className="text-sm text-slate-600 space-y-2 pr-5 list-decimal">
                  <li>شغل Evolution API عبر Docker</li>
                  <li>أنشئ مثيل (instance) واربط بالرقم</li>
                  <li>استخدم API Key من لوحة التحكم</li>
                  <li>أدخل الرابط والمفتاح أعلاه</li>
                </ol>
              </div>

              {/* UltraMsg */}
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 hover-lift">
                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">UltraMsg</Badge>
                  <span className="text-sm">سحابي - مدفوع</span>
                </h3>
                <ol className="text-sm text-slate-600 space-y-2 pr-5 list-decimal">
                  <li>سجل في <a href="https://ultramsg.com" target="_blank" className="text-blue-600 underline">ultramsg.com</a></li>
                  <li>امسح QR لربط واتساب</li>
                  <li>انسخ instance ID و token</li>
                  <li>أدخلهم في الحقول أعلاه</li>
                </ol>
              </div>

              {/* أنواع الإشعارات */}
              <div className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-violet-500" />
                  الإشعارات المتاحة
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 hover-lift p-2 rounded-xl transition-all">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-700">عند تسديد قسط</p>
                      <p className="text-xs text-slate-500">يُرسل للعميل تأكيد السداد فور تسجيل القسط</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 hover-lift p-2 rounded-xl transition-all">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bell className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-700">تذكير باقتراب القسط</p>
                      <p className="text-xs text-slate-500">يُذكّر العميل قبل موعد القسط</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 hover-lift p-2 rounded-xl transition-all">
                    <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <XCircle className="h-4 w-4 text-rose-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-700">تنبيه تأخر السداد</p>
                      <p className="text-xs text-slate-500">يُرسل للعميل عند تجاوز موعد الاستحقاق</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 hover-lift p-2 rounded-xl transition-all">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-700">عقد جديد</p>
                      <p className="text-xs text-slate-500">يُرسل للعميل ترحيب عند إنشاء عقد جديد</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
"use client";

import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useAppSettings } from "@/hooks/useAppSettings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Sun,
  Moon,
  Monitor,
  Palette,
  Building2,
  Upload,
  Trash2,
  Save,
  Globe,
  Image as ImageIcon,
} from "lucide-react";

const Settings = () => {
  const { settings, updateSettings } = useAppSettings();
  const { theme, setTheme } = useTheme();

  // WhatsApp config
  const [config, setConfig] = useState(getWhatsAppConfig());
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");
  const [testPhone, setTestPhone] = useState("");

  // Logo upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local form state for general settings
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    setConfig(getWhatsAppConfig());
  }, []);

  const handleSaveGeneral = () => {
    updateSettings(localSettings);
    showSuccess("✅ تم حفظ الإعدادات العامة بنجاح");
  };

  const handleSaveWhatsApp = () => {
    saveWhatsAppConfig(config);
    showSuccess("✅ تم حفظ إعدادات واتساب بنجاح");
  };

  const handleTestWhatsApp = async () => {
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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setLocalSettings({ ...localSettings, logoUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLocalSettings({ ...localSettings, logoUrl: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const providers = [
    { value: "waha", label: "Waha", desc: "مفتوح المصدر - سيرفر محلي" },
    { value: "evolution", label: "Evolution API", desc: "يدعم Webhook وقابل للتوسع" },
    { value: "ultramsg", label: "UltraMsg", desc: "خدمة سحابية - مدفوعة" },
  ];

  const themes = [
    { value: "system", label: "تلقائي", icon: Monitor },
    { value: "light", label: "فاتح", icon: Sun },
    { value: "dark", label: "داكن", icon: Moon },
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
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-slate-500 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-500/30">
          <Settings2 className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">الإعدادات</h1>
          <p className="text-slate-500 mt-1">تخصيص البرنامج وإعدادات الاتصال</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-100 p-1 rounded-2xl mb-6 overflow-x-auto flex-nowrap">
          <TabsTrigger value="general" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-700 data-[state=active]:to-slate-800 data-[state=active]:text-white gap-2">
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">عام</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">المظهر</span>
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white gap-2">
            <MessageSquareText className="h-4 w-4" />
            <span className="hidden sm:inline">واتساب</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">الإشعارات</span>
          </TabsTrigger>
        </TabsList>

        {/* ========== GENERAL TAB ========== */}
        <TabsContent value="general" className="mt-0 space-y-6">
          <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-100/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-gray-600 rounded-xl flex items-center justify-center shadow-md">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-800">معلومات البرنامج</CardTitle>
                  <p className="text-xs text-slate-500">اسم البرنامج والشعار</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="font-medium">اسم البرنامج</Label>
                <Input
                  value={localSettings.appName}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, appName: e.target.value })
                  }
                  className="rounded-xl h-12 bg-white/50 backdrop-blur-sm"
                  placeholder="أقساط"
                />
                <p className="text-xs text-slate-400">سيظهر في الشريط الجانبي ورأس الصفحة</p>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">الشعار</Label>
                <div className="flex items-center gap-4 flex-wrap">
                  {localSettings.logoUrl ? (
                    <div className="relative">
                      <img
                        src={localSettings.logoUrl}
                        alt="الشعار"
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-red-500 text-white hover:bg-red-600"
                        onClick={removeLogo}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        className="rounded-xl h-11 gap-2"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4" />
                        رفع صورة
                      </Button>
                      <span className="text-sm text-slate-400 self-center">أو</span>
                      <Input
                        value={
                          localSettings.logoUrl.startsWith("data:") ? "" : localSettings.logoUrl
                        }
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            logoUrl: e.target.value,
                          })
                        }
                        className="rounded-xl h-11 bg-white/50 backdrop-blur-sm flex-1"
                        placeholder="رابط الصورة (URL)"
                        dir="ltr"
                      />
                    </div>
                    <p className="text-xs text-slate-400">
                      ارفع صورة أو أدخل رابط مباشر. يُفضل مربعة 64x64 بكسل.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100/80">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-700 text-sm">معلومات الشركة (اختياري)</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-medium">اسم الشركة</Label>
                    <Input
                      value={localSettings.companyName}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, companyName: e.target.value })
                      }
                      className="rounded-xl h-12 bg-white/50"
                      placeholder="مؤسسة ..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-medium">رقم الهاتف</Label>
                    <Input
                      value={localSettings.companyPhone}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, companyPhone: e.target.value })
                      }
                      className="rounded-xl h-12 bg-white/50"
                      placeholder="01000000000"
                      dir="ltr"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label className="font-medium">العنوان</Label>
                    <Input
                      value={localSettings.companyAddress}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, companyAddress: e.target.value })
                      }
                      className="rounded-xl h-12 bg-white/50"
                      placeholder="العنوان"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSaveGeneral}
                  className="rounded-xl h-11 gap-2 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900"
                >
                  <Save className="h-4 w-4" />
                  حفظ الإعدادات العامة
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== APPEARANCE TAB ========== */}
        <TabsContent value="appearance" className="mt-0 space-y-6">
          <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-100/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-800">المظهر</CardTitle>
                  <p className="text-xs text-slate-500">اختر الثيم المناسب للواجهة</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid sm:grid-cols-3 gap-4">
                {themes.map((t) => {
                  const Icon = t.icon;
                  const isActive = theme === t.value;
                  return (
                    <button
                      key={t.value}
                      onClick={() => setTheme(t.value)}
                      className={cn(
                        "p-6 rounded-2xl text-center transition-all duration-200 border-2",
                        isActive
                          ? "bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-300 shadow-sm"
                          : "bg-white/50 border-transparent hover:border-slate-200 hover:shadow-sm"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-10 w-10 mx-auto mb-3",
                          t.value === "system"
                            ? "text-blue-500"
                            : t.value === "light"
                            ? "text-amber-500"
                            : "text-indigo-400"
                        )}
                      />
                      <p className="font-semibold text-slate-700">{t.label}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {t.value === "system"
                          ? "حسب إعدادات الجهاز"
                          : t.value === "light"
                          ? "واجهة فاتحة"
                          : "واجهة داكنة"}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 flex items-start gap-3">
                <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">ميزة قادمة</p>
                  <p className="text-xs text-amber-700">
                    قريباً يمكنك تخصيص الألوان بالكامل (الأساسي والخلفيات والخطوط)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== WHATSAPP TAB ========== */}
        <TabsContent value="whatsapp" className="mt-0 space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-4 border-b border-slate-100/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                    <MessageSquareText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-800">إعدادات واتساب</CardTitle>
                    <p className="text-xs text-slate-500">توصيل حساب واتساب لإرسال الإشعارات</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
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

                <div className="space-y-2">
                  <Label className="font-medium flex items-center gap-2">
                    <Server className="h-4 w-4 text-violet-500" />
                    رابط الخادم
                  </Label>
                  <Input
                    value={config.endpoint}
                    onChange={(e) => setConfig({ ...config, endpoint: e.target.value })}
                    className="rounded-xl h-12 bg-white/50 backdrop-blur-sm"
                    placeholder={config.provider === "waha" ? "http://localhost:3000" : "http://localhost:8080"}
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-medium flex items-center gap-2">
                    <Key className="h-4 w-4 text-violet-500" />
                    مفتاح API
                  </Label>
                  <Input
                    type="password"
                    value={config.apiKey}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    className="rounded-xl h-12 bg-white/50 backdrop-blur-sm"
                    placeholder="اختياري"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-medium">اسم المثيل</Label>
                  <Input
                    value={config.instanceName}
                    onChange={(e) => setConfig({ ...config, instanceName: e.target.value })}
                    className="rounded-xl h-12 bg-white/50 backdrop-blur-sm"
                    placeholder={config.provider === "waha" ? "default" : "my-instance"}
                    dir="ltr"
                  />
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    onClick={handleTestWhatsApp}
                    className="rounded-xl h-11 gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
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
                    onClick={handleSaveWhatsApp}
                    className="rounded-xl h-11 gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                  >
                    <Save className="h-4 w-4" />
                    حفظ الإعدادات
                  </Button>
                </div>

                {testStatus !== "idle" && (
                  <div
                    className={cn(
                      "p-4 rounded-2xl flex items-center gap-3",
                      testStatus === "success"
                        ? "bg-emerald-50 border border-emerald-200"
                        : "bg-rose-50 border border-rose-200"
                    )}
                  >
                    <StatusIcon
                      className={cn(
                        "h-5 w-5",
                        testStatus === "testing" && "animate-spin text-amber-500",
                        testStatus === "success" && "text-emerald-500",
                        testStatus === "error" && "text-rose-500"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        testStatus === "success" ? "text-emerald-700" : "text-rose-700"
                      )}
                    >
                      {testMessage}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Send test message */}
            <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
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
              <CardContent className="p-6 space-y-4">
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
                  className="rounded-xl h-11 w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 gap-2"
                  disabled={!testPhone}
                >
                  <Send className="h-4 w-4" />
                  إرسال رسالة اختبار
                </Button>
              </CardContent>
            </Card>

            {/* Setup instructions */}
            <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden lg:col-span-2">
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
              <CardContent className="p-6">
                <div className="grid sm:grid-cols-3 gap-4">
                  {/* Waha */}
                  <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-100">
                    <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                      <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0">Waha</Badge>
                    </h3>
                    <ol className="text-sm text-slate-600 space-y-2 pr-5 list-decimal">
                      <li>شغل Waha عبر Docker:<br /><code className="bg-slate-100 px-2 py-0.5 rounded text-xs">docker run -p 3000:3000 devlikeapro/waha</code></li>
                      <li>افتح <code className="bg-slate-100 px-2 py-0.5 rounded text-xs">http://localhost:3000</code></li>
                      <li>امسح QR code من واتساب</li>
                      <li>انسخ الرابط إلى حقل "رابط الخادم"</li>
                    </ol>
                  </div>

                  {/* Evolution API */}
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
                    <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                      <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">Evolution API</Badge>
                    </h3>
                    <ol className="text-sm text-slate-600 space-y-2 pr-5 list-decimal">
                      <li>شغل Evolution API عبر Docker</li>
                      <li>أنشئ مثيل (instance) واربط بالرقم</li>
                      <li>استخدم API Key من لوحة التحكم</li>
                      <li>أدخل الرابط والمفتاح أعلاه</li>
                    </ol>
                  </div>

                  {/* UltraMsg */}
                  <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
                    <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">UltraMsg</Badge>
                    </h3>
                    <ol className="text-sm text-slate-600 space-y-2 pr-5 list-decimal">
                      <li>سجل في <a href="https://ultramsg.com" target="_blank" className="text-blue-600 underline">ultramsg.com</a></li>
                      <li>امسح QR لربط واتساب</li>
                      <li>انسخ instance ID و token</li>
                      <li>أدخلهم في الحقول أعلاه</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ========== NOTIFICATIONS TAB ========== */}
        <TabsContent value="notifications" className="mt-0 space-y-6">
          <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-100/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-800">الإشعارات</CardTitle>
                  <p className="text-xs text-slate-500">تخصيص قوالب الرسائل</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="p-8 text-center text-slate-500">
                <Bell className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <h3 className="font-bold text-lg text-slate-600 mb-2">قريباً</h3>
                <p className="text-sm">
                  يمكنك قريباً تخصيص نصوص رسائل واتساب (تذكير القسط، تأكيد السداد، إلخ)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Settings;
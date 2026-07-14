"use client";

import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { api } from "@/lib/api";
import { showSuccess, showError } from "@/utils/toast";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getWhatsAppConfig, saveWhatsAppConfig, testConnection, sendWhatsAppMessage, MESSAGE_TEMPLATES,
} from "@/components/WhatsAppService";
import {
  MessageSquareText, Settings2, Wifi, Send, Phone, Key, Server, RefreshCw, Loader2,
  CheckCircle2, XCircle, Sparkles, Info, Smartphone, Bell, Sun, Moon, Monitor,
  Palette, Building2, Upload, Trash2, Save, Globe, Database, Download,
} from "lucide-react";

interface GeneralSettings {
  appName: string;
  logoUrl: string;
  companyName: string;
  companyPhone: string;
  companyAddress: string;
}

const DEFAULT_SETTINGS: GeneralSettings = { appName: "أقساط", logoUrl: "", companyName: "", companyPhone: "", companyAddress: "" };

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<GeneralSettings>(DEFAULT_SETTINGS);
  const [settingsLoading, setSettingsLoading] = useState(true);

  // WhatsApp config
  const [config, setConfig] = useState(getWhatsAppConfig());
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load settings from database
  useEffect(() => {
    api.settings.get("general").then((data) => {
      if (data) setSettings({ ...DEFAULT_SETTINGS, ...data });
    }).catch(() => {}).finally(() => setSettingsLoading(false));
  }, []);

  // Sync settings to localStorage for hooks that read it
  useEffect(() => {
    localStorage.setItem("app_general_settings", JSON.stringify(settings));
  }, [settings]);

  const handleSaveGeneral = async () => {
    try {
      await api.settings.set("general", settings);
      showSuccess("✅ تم حفظ الإعدادات");
    } catch (e: any) { showError("خطأ: " + e.message); }
  };

  const handleSaveWhatsApp = () => {
    saveWhatsAppConfig(config);
    showSuccess("✅ تم حفظ إعدادات واتساب");
  };

  const handleTestWhatsApp = async () => {
    setTestStatus("testing");
    const result = await testConnection(config);
    setTestStatus(result.success ? "success" : "error");
    setTestMessage(result.message);
  };

  const handleSendTest = async () => {
    if (!testPhone) { showError("أدخل رقم الهاتف"); return; }
    const result = await sendWhatsAppMessage(testPhone, MESSAGE_TEMPLATES.welcome("عميلنا"), config);
    if (result.success) showSuccess(result.message); else showError(result.message);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setSettings({ ...settings, logoUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  const removeLogo = () => { setSettings({ ...settings, logoUrl: "" }); if (fileInputRef.current) fileInputRef.current.value = ""; };

  // التعامل مع استيراد النسخة الاحتياطية
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const confirmImport = window.confirm("⚠️ تحذير مالي هام جداً:\n\nسيتم حذف كافة البيانات الحالية بالكامل واستبدالها ببيانات ملف النسخة الاحتياطية المختار!\n\nهل أنت متأكد تماماً وتريد الاستمرار؟");
    if (!confirmImport) {
      if (e.target) e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        await api.backup.import(json);
        showSuccess("✅ تم استيراد واسترجاع بيانات النسخة الاحتياطية بنجاح! جاري إعادة تهيئة النظام...");
        setTimeout(() => window.location.reload(), 1500);
      } catch (error: any) {
        showError("❌ خطأ: ملف غير صحيح أو معطوب. " + error.message);
      }
    };
    reader.readAsText(file);
  };

  const providers = [
    { value: "waha", label: "Waha", desc: "مفتوح المصدر" },
    { value: "evolution", label: "Evolution API", desc: "قابل للتوسع" },
    { value: "ultramsg", label: "UltraMsg", desc: "سحابي - مدفوع" },
  ];

  const themes = [
    { value: "system", label: "تلقائي", icon: Monitor },
    { value: "light", label: "فاتح", icon: Sun },
    { value: "dark", label: "داكن", icon: Moon },
  ];

  if (settingsLoading) return <Layout><div className="flex items-center justify-center py-32"><Loader2 className="h-8 w-8 text-violet-500 animate-spin" /></div></Layout>;

  return (
    <Layout>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-slate-500 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-500/30"><Settings2 className="h-7 w-7 text-white" /></div>
        <div><h1 className="text-2xl lg:text-3xl font-bold text-slate-800">الإعدادات</h1><p className="text-slate-500 mt-1">تخصيص البرنامج</p></div>
      </div>

      <Tabs defaultValue="general" className="w-full" dir="rtl">
        <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-100 p-1 rounded-2xl mb-6 overflow-x-auto flex-nowrap">
          <TabsTrigger value="general" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-700 data-[state=active]:to-slate-800 data-[state=active]:text-white gap-2"><Settings2 className="h-4 w-4" /><span className="hidden sm:inline">عام</span></TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white gap-2"><Palette className="h-4 w-4" /><span className="hidden sm:inline">المظهر</span></TabsTrigger>
          <TabsTrigger value="whatsapp" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white gap-2"><MessageSquareText className="h-4 w-4" /><span className="hidden sm:inline">واتساب</span></TabsTrigger>
          <TabsTrigger value="backup" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-violet-600 data-[state=active]:text-white gap-2"><Database className="h-4 w-4" /><span className="hidden sm:inline">النسخ الاحتياطي</span></TabsTrigger>
        </TabsList>

        {/* GENERAL TAB */}
        <TabsContent value="general" className="mt-0 space-y-6">
          <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-100/80">
              <div className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-gray-600 rounded-xl flex items-center justify-center"><Globe className="h-5 w-5 text-white" /></div><div><CardTitle className="text-lg text-slate-800">معلومات البرنامج</CardTitle></div></div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="font-medium">اسم البرنامج</Label>
                <Input value={settings.appName} onChange={(e) => setSettings({ ...settings, appName: e.target.value })} className="rounded-xl h-12" placeholder="أقساط" />
              </div>
              <div className="space-y-2">
                <Label className="font-medium">الشعار</Label>
                <div className="flex items-center gap-4 flex-wrap">
                  {settings.logoUrl ? (
                    <div className="relative"><img src={settings.logoUrl} alt="الشعار" className="w-16 h-16 rounded-2xl object-cover border border-slate-200" /><Button type="button" variant="ghost" size="sm" className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-red-500 text-white hover:bg-red-600" onClick={removeLogo}><Trash2 className="h-3 w-3" /></Button></div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"><Sparkles className="h-8 w-8 text-white" /></div>
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2 flex-wrap">
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      <Button variant="outline" className="rounded-xl h-11 gap-2" onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4" />رفع صورة</Button>
                      <span className="text-sm text-slate-400 self-center">أو</span>
                      <Input value={settings.logoUrl.startsWith("data:") ? "" : settings.logoUrl} onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })} className="rounded-xl h-11 min-w-[200px]" placeholder="رابط الصورة" dir="ltr" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100/80">
                <div className="flex items-center gap-3 mb-4"><div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center"><Building2 className="h-4 w-4 text-white" /></div><h3 className="font-semibold text-slate-700 text-sm">معلومات الشركة</h3></div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="font-medium">اسم الشركة</Label><Input value={settings.companyName} onChange={(e) => setSettings({ ...settings, companyName: e.target.value })} className="rounded-xl h-12" /></div>
                  <div className="space-y-2"><Label className="font-medium">هاتف الشركة</Label><Input value={settings.companyPhone} onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })} className="rounded-xl h-12" dir="ltr" /></div>
                  <div className="sm:col-span-2 space-y-2"><Label className="font-medium">العنوان</Label><Input value={settings.companyAddress} onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })} className="rounded-xl h-12" /></div>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveGeneral} className="rounded-xl h-11 gap-2 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900"><Save className="h-4 w-4" />حفظ</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* APPEARANCE TAB */}
        <TabsContent value="appearance" className="mt-0 space-y-6">
          <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-100/80">
              <div className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center"><Palette className="h-5 w-5 text-white" /></div><div><CardTitle className="text-lg text-slate-800">المظهر</CardTitle></div></div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid sm:grid-cols-3 gap-4">
                {themes.map((t) => { const Icon = t.icon; const isActive = theme === t.value; return (
                  <button key={t.value} onClick={() => setTheme(t.value)} className={cn("p-6 rounded-2xl text-center transition-all border-2", isActive ? "bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-300 shadow-sm" : "bg-white/50 border-transparent hover:border-slate-200 hover:shadow-sm")}>
                    <Icon className={cn("h-10 w-10 mx-auto mb-3", t.value === "system" ? "text-blue-500" : t.value === "light" ? "text-amber-500" : "text-indigo-400")} />
                    <p className="font-semibold text-slate-700">{t.label}</p>
                  </button>
                ); })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WHATSAPP TAB */}
        <TabsContent value="whatsapp" className="mt-0 space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-4 border-b border-slate-100/80">
                <div className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center"><MessageSquareText className="h-5 w-5 text-white" /></div><div><CardTitle className="text-lg text-slate-800">إعدادات واتساب</CardTitle></div></div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2"><Label className="font-medium">مزود الخدمة</Label>
                  <Select value={config.provider} onValueChange={(val: "waha" | "evolution" | "ultramsg") => setConfig({ ...config, provider: val })}>
                    <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                    <SelectContent>{providers.map((p) => <SelectItem key={p.value} value={p.value}>{p.label} - {p.desc}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label className="font-medium">رابط الخادم</Label><Input value={config.endpoint} onChange={(e) => setConfig({ ...config, endpoint: e.target.value })} className="rounded-xl h-12" placeholder="http://localhost:3000" dir="ltr" /></div>
                <div className="space-y-2"><Label className="font-medium">مفتاح API</Label><Input type="password" value={config.apiKey} onChange={(e) => setConfig({ ...config, apiKey: e.target.value })} className="rounded-xl h-12" placeholder="اختياري" dir="ltr" /></div>
                <div className="space-y-2"><Label className="font-medium">اسم المثيل</Label><Input value={config.instanceName} onChange={(e) => setConfig({ ...config, instanceName: e.target.value })} className="rounded-xl h-12" placeholder="default" dir="ltr" /></div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button onClick={handleTestWhatsApp} className="rounded-xl h-11 gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700" disabled={testStatus === "testing"}>
                    {testStatus === "testing" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}اختبار
                  </Button>
                  <Button onClick={handleSaveWhatsApp} className="rounded-xl h-11 gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"><Save className="h-4 w-4" />حفظ</Button>
                </div>
                {testStatus !== "idle" && (
                  <div className={cn("p-4 rounded-2xl flex items-center gap-3", testStatus === "success" ? "bg-emerald-50 border border-emerald-200" : "bg-rose-50 border border-rose-200")}>
                    {testStatus === "success" ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-rose-500" />}
                    <span className={cn("text-sm font-medium", testStatus === "success" ? "text-emerald-700" : "text-rose-700")}>{testMessage}</span>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-4 border-b border-slate-100/80">
                <div className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center"><Send className="h-5 w-5 text-white" /></div><div><CardTitle className="text-lg text-slate-800">إرسال اختبار</CardTitle></div></div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2"><Label className="font-medium">رقم الهاتف</Label><Input value={testPhone} onChange={(e) => setTestPhone(e.target.value.replace(/[^0-9]/g, ""))} className="rounded-xl h-12" placeholder="01012345678" dir="ltr" /></div>
                <Button onClick={handleSendTest} className="rounded-xl h-11 w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 gap-2" disabled={!testPhone}><Send className="h-4 w-4" />إرسال اختبار</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* BACKUP TAB */}
        <TabsContent value="backup" className="mt-0 space-y-6">
          <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-100/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-800">النسخ الاحتياطي واستيراد البيانات</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                <h4 className="font-bold text-sm text-indigo-800 mb-1 flex items-center gap-2">
                  <Info className="h-4 w-4 text-indigo-600" />
                  تنبيه أمان مالي هام ⚠️
                </h4>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  يرجى الاحتفاظ بنسخة احتياطية من بياناتك بشكل دوري. تصدير البيانات سينتج ملفاً بصيغة JSON يحتوي على كافة الحسابات والعملاء والعقود والمصروفات والمستخدمين، ويمكنك استيراده في أي وقت لاستعادة بياناتك بالكامل في حال حدوث أي طارئ.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Export */}
                <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm text-center space-y-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                    <Download className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-slate-800">تصدير النسخة الاحتياطية</h5>
                    <p className="text-xs text-slate-400">تحميل نسخة كاملة من كافة جداول النظام وحفظها بجهازك</p>
                  </div>
                  <a href={api.backup.exportUrl()} download="aqsat-backup.json" className="block">
                    <Button className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 gap-2 active:scale-95 transition-transform">
                      <Download className="h-4 w-4" />
                      تصدير وحفظ البيانات (.json)
                    </Button>
                  </a>
                </div>

                {/* Import */}
                <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm text-center space-y-4">
                  <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-slate-800">استيراد النسخة الاحتياطية</h5>
                    <p className="text-xs text-slate-400">استعادة البيانات من ملف نسخة احتياطية تم تصديره سابقاً</p>
                  </div>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={handleImportBackup} 
                      className="hidden" 
                      id="import-backup-file" 
                    />
                    <label htmlFor="import-backup-file">
                      <Button asChild className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 gap-2 cursor-pointer active:scale-95 transition-transform">
                        <span>
                          <Upload className="h-4 w-4" />
                          رفع واستيراد نسخة احتياطية
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Settings;
"use client";

import { useState, useRef, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { showSuccess, showError } from "@/utils/toast";
import {
  User, Camera, Lock, Eye, EyeOff, Shield, ShieldCheck, ShieldAlert, Upload, Trash2, CheckCircle2,
} from "lucide-react";

const STORAGE_KEY = "app_user_profile";

interface ProfileData { avatar: string; }

const getStoredProfile = (): ProfileData => {
  try { const stored = localStorage.getItem(STORAGE_KEY); if (stored) return JSON.parse(stored); } catch {}
  return { avatar: "" };
};

const saveProfile = (data: ProfileData) => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); };

const roleConfig: Record<string, { label: string; color: string; Icon: React.ElementType; description: string }> = {
  admin: { label: "مدير النظام", color: "from-amber-500 to-orange-500", Icon: ShieldAlert, description: "جميع الصلاحيات" },
  supervisor: { label: "مشرف مالي", color: "from-blue-500 to-cyan-500", Icon: ShieldCheck, description: "إدارة الأقساط والمصروفات" },
  collector: { label: "محصل", color: "from-emerald-500 to-teal-500", Icon: Shield, description: "العملاء والعقود والأقساط" },
};

const Profile = () => {
  const { user, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<ProfileData>(getStoredProfile);
  const [profileName, setProfileName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => { if (user?.name) setProfileName(user.name); }, [user]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showError("حجم الصورة أقل من 2 ميجا"); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      const newProfile = { ...profile, avatar: reader.result as string };
      setProfile(newProfile);
      saveProfile(newProfile);
      showSuccess("✅ تم رفع الصورة");
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    const newProfile = { ...profile, avatar: "" };
    setProfile(newProfile);
    saveProfile(newProfile);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveName = async () => {
    if (!profileName.trim()) { showError("الاسم مطلوب"); return; }
    if (!user?.id) return;
    try {
      await api.users.update(user.id, { name: profileName.trim(), email: user.email, role: user.role });
      // Update local auth state
      const updatedUser = { ...user, name: profileName.trim() };
      localStorage.setItem("auth_user", JSON.stringify(updatedUser));
      showSuccess("✅ تم تعديل الاسم");
      setTimeout(() => window.location.reload(), 500);
    } catch (e: any) { showError("خطأ: " + e.message); }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) { showError("أدخل كلمة المرور الحالية"); return; }
    if (!newPassword) { showError("أدخل كلمة المرور الجديدة"); return; }
    if (newPassword.length < 6) { showError("6 أحرف على الأقل"); return; }
    if (newPassword !== confirmPassword) { showError("غير متطابقتين"); return; }
    if (!user?.id) return;
    setChangingPassword(true);
    try {
      await api.users.changePassword(user.id, currentPassword, newPassword);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      showSuccess("✅ تم تغيير كلمة المرور");
    } catch (e: any) { showError(e.message); }
    setChangingPassword(false);
  };

  const config = user ? roleConfig[user.role] || roleConfig.admin : roleConfig.admin;
  const RoleIcon = config.Icon;

  return (
    <Layout>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30"><User className="h-7 w-7 text-white" /></div>
        <div><h1 className="text-2xl lg:text-3xl font-bold text-slate-800">ملفي الشخصي</h1><p className="text-slate-500 mt-1">تعديل بياناتك</p></div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card className="border-0 overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 relative">
              <div className="absolute inset-0 pointer-events-none"><div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" /><div className="absolute -bottom-5 -left-5 w-32 h-32 bg-white/10 rounded-full" /></div>
            </div>
            <CardContent className="px-6 pb-6">
              <div className="relative -mt-16 mb-4 flex justify-center">
                <div className="relative group">
                  <div className={cn("w-32 h-32 rounded-3xl flex items-center justify-center text-white font-bold text-4xl shadow-xl border-4 border-white overflow-hidden bg-gradient-to-br", config.color)}>
                    {profile.avatar ? <img src={profile.avatar} alt="الصورة" className="w-full h-full object-cover" /> : user?.name?.charAt(0) || "م"}
                  </div>
                  <div className="absolute inset-0 rounded-3xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </div>
              </div>
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">{user?.name || "مستخدم"}</h2>
                <p className="text-sm text-slate-500 mt-1">{user?.email}</p>
                <Badge className="mt-3 rounded-xl border-0 bg-gradient-to-r from-violet-500 to-purple-600 text-white gap-1.5"><RoleIcon className="h-3.5 w-3.5" />{config.label}</Badge>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2"><Shield className="h-4 w-4 text-violet-500" /><span className="text-sm font-semibold text-slate-700">الصلاحية</span></div>
                <p className="text-xs text-slate-500">{config.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Name */}
          <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-100/80">
              <div className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center"><User className="h-5 w-5 text-white" /></div><div><CardTitle className="text-lg text-slate-800">تعديل الاسم</CardTitle></div></div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex gap-3">
                <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} className="rounded-xl h-12 bg-white/50 flex-1" placeholder="الاسم" />
                <Button onClick={handleSaveName} className="rounded-xl h-12 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">حفظ</Button>
              </div>
            </CardContent>
          </Card>

          {/* Profile Photo */}
          <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-100/80">
              <div className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center"><Camera className="h-5 w-5 text-white" /></div><div><CardTitle className="text-lg text-slate-800">صورة البروفايل</CardTitle></div></div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-6 flex-wrap">
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg overflow-hidden bg-gradient-to-br" style={{ background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))` }}>
                  {profile.avatar ? <img src={profile.avatar} alt="الصورة" className="w-full h-full object-cover" /> : user?.name?.charAt(0) || "م"}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex gap-3 flex-wrap">
                    <Button variant="outline" className="rounded-xl h-11 gap-2" onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4" />رفع صورة</Button>
                    {profile.avatar && <Button variant="outline" className="rounded-xl h-11 gap-2 text-red-600 border-red-200 hover:bg-red-50" onClick={removeAvatar}><Trash2 className="h-4 w-4" />حذف</Button>}
                  </div>
                  <p className="text-xs text-slate-400">صورة مربعة 256x256. الحد الأقصى 2 ميجا.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-100/80">
              <div className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center"><Lock className="h-5 w-5 text-white" /></div><div><CardTitle className="text-lg text-slate-800">تغيير كلمة المرور</CardTitle></div></div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="font-medium">كلمة المرور الحالية</Label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="rounded-xl h-12 bg-white/50 pr-11 pl-11" placeholder="••••••••" dir="ltr" />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-medium">كلمة المرور الجديدة</Label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="rounded-xl h-12 bg-white/50 pr-11 pl-11" placeholder="6 أحرف على الأقل" dir="ltr" />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-medium">تأكيد كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="rounded-xl h-12 bg-white/50 pr-11 pl-11" placeholder="أعد الكتابة" dir="ltr" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </div>
                {newPassword && confirmPassword && newPassword === confirmPassword && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" />متطابقتان</div>
                )}
              </div>
              <Button onClick={handleChangePassword} disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword} className="rounded-xl h-12 px-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 gap-2">
                <Lock className="h-4 w-4" />
                {changingPassword ? "جاري التغيير..." : "تغيير كلمة المرور"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
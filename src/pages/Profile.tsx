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
import { showSuccess, showError } from "@/utils/toast";
import {
  User,
  Camera,
  Save,
  Lock,
  Eye,
  EyeOff,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Upload,
  Trash2,
  CheckCircle2,
} from "lucide-react";

const STORAGE_KEY = "app_user_profile";

interface ProfileData {
  avatar: string;
}

const getStoredProfile = (): ProfileData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { avatar: "" };
};

const saveProfile = (data: ProfileData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const roleConfig = {
  admin: { label: "مدير النظام", color: "from-amber-500 to-orange-500", Icon: ShieldAlert, description: "جميع الصلاحيات - إدارة كاملة" },
  supervisor: { label: "مشرف مالي", color: "from-blue-500 to-cyan-500", Icon: ShieldCheck, description: "إدارة الأقساط والمصروفات والتقارير" },
  collector: { label: "محصل", color: "from-emerald-500 to-teal-500", Icon: Shield, description: "إدارة العملاء والعقود والأقساط فقط" },
};

const Profile = () => {
  const { user, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile state
  const [profile, setProfile] = useState<ProfileData>(getStoredProfile);
  const [profileName, setProfileName] = useState(user?.name || "");
  const [hasNameChange, setHasNameChange] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user?.name && !hasNameChange) {
      setProfileName(user.name);
    }
  }, [user]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showError("حجم الصورة يجب أن يكون أقل من 2 ميجابايت");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const newProfile = { ...profile, avatar: reader.result as string };
      setProfile(newProfile);
      saveProfile(newProfile);
      showSuccess("✅ تم رفع الصورة بنجاح");
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    const newProfile = { ...profile, avatar: "" };
    setProfile(newProfile);
    saveProfile(newProfile);
    if (fileInputRef.current) fileInputRef.current.value = "";
    showSuccess("✅ تم حذف الصورة");
  };

  const handleSaveName = () => {
    if (!profileName.trim()) {
      showError("الاسم مطلوب");
      return;
    }
    // Update stored user
    const stored = localStorage.getItem("auth_user");
    if (stored) {
      const userData = JSON.parse(stored);
      userData.name = profileName.trim();
      localStorage.setItem("auth_user", JSON.stringify(userData));
      // Also update in app_users list
      const users = localStorage.getItem("app_users");
      if (users) {
        const parsed = JSON.parse(users);
        const updated = parsed.map((u: any) =>
          u.id === user?.id ? { ...u, name: profileName.trim() } : u
        );
        localStorage.setItem("app_users", JSON.stringify(updated));
      }
    }
    setHasNameChange(true);
    showSuccess("✅ تم تعديل الاسم بنجاح");
    // Force page reload to reflect changes
    setTimeout(() => window.location.reload(), 500);
  };

  const handleChangePassword = () => {
    if (!currentPassword) {
      showError("أدخل كلمة المرور الحالية");
      return;
    }
    if (!newPassword) {
      showError("أدخل كلمة المرور الجديدة");
      return;
    }
    if (newPassword.length < 6) {
      showError("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (newPassword !== confirmPassword) {
      showError("كلمتا المرور غير متطابقتين");
      return;
    }

    // Verify current password
    const passwords = localStorage.getItem("app_user_passwords");
    const storedPasswords = passwords ? JSON.parse(passwords) : {};
    const defaultPasswords: Record<string, string> = {
      "admin@system.com": "admin123",
      "supervisor@system.com": "super123",
      "collector@system.com": "collect123",
    };
    const allPasswords = { ...defaultPasswords, ...storedPasswords };

    if (user?.email && allPasswords[user.email] !== currentPassword) {
      showError("كلمة المرور الحالية غير صحيحة");
      return;
    }

    // Save new password
    if (user?.email) {
      storedPasswords[user.email] = newPassword;
      localStorage.setItem("app_user_passwords", JSON.stringify(storedPasswords));
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showSuccess("✅ تم تغيير كلمة المرور بنجاح");
  };

  const config = user ? roleConfig[user.role] || roleConfig.admin : roleConfig.admin;
  const RoleIcon = config.Icon;

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
          <User className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">ملفي الشخصي</h1>
          <p className="text-slate-500 mt-1">تعديل بياناتك الشخصية وإعدادات الحساب</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card className="border-0 overflow-hidden">
            {/* Cover */}
            <div className="h-32 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 relative">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
                <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-white/10 rounded-full" />
              </div>
            </div>

            <CardContent className="px-6 pb-6">
              {/* Avatar */}
              <div className="relative -mt-16 mb-4 flex justify-center">
                <div className="relative group">
                  <div
                    className={cn(
                      "w-32 h-32 rounded-3xl flex items-center justify-center text-white font-bold text-4xl shadow-xl border-4 border-white overflow-hidden bg-gradient-to-br",
                      config.color
                    )}
                  >
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="الصورة" className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0) || "م"
                    )}
                  </div>

                  {/* Upload overlay */}
                  <div
                    className="absolute inset-0 rounded-3xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-8 w-8 text-white" />
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* User Info */}
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">{user?.name || "مستخدم"}</h2>
                <p className="text-sm text-slate-500 mt-1">{user?.email}</p>
                <Badge className="mt-3 rounded-xl border-0 bg-gradient-to-r from-violet-500 to-purple-600 text-white gap-1.5">
                  <RoleIcon className="h-3.5 w-3.5" />
                  {config.label}
                </Badge>
              </div>

              {/* Role Info */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-violet-500" />
                  <span className="text-sm font-semibold text-slate-700">معلومات الصلاحية</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{config.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Name */}
          <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-100/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-800">تعديل الاسم</CardTitle>
                  <p className="text-xs text-slate-500">غيّر اسمك الذي يظهر في النظام</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="font-medium">الاسم الحالي</Label>
                <div className="flex gap-3">
                  <Input
                    value={profileName}
                    onChange={(e) => {
                      setProfileName(e.target.value);
                      setHasNameChange(false);
                    }}
                    className="rounded-xl h-12 bg-white/50 backdrop-blur-sm flex-1"
                    placeholder="أدخل اسمك"
                  />
                  <Button
                    onClick={handleSaveName}
                    className="rounded-xl h-12 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 gap-2"
                  >
                    <Save className="h-4 w-4" />
                    حفظ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Photo */}
          <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-100/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                  <Camera className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-800">صورة البروفايل</CardTitle>
                  <p className="text-xs text-slate-500">أضف أو غيّر صورتك الشخصية</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-6 flex-wrap">
                <div className="relative group">
                  <div
                    className={cn(
                      "w-24 h-24 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg overflow-hidden bg-gradient-to-br",
                      config.color
                    )}
                  >
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="الصورة" className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0) || "م"
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex gap-3 flex-wrap">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <Button
                      variant="outline"
                      className="rounded-xl h-11 gap-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      رفع صورة جديدة
                    </Button>
                    {profile.avatar && (
                      <Button
                        variant="outline"
                        className="rounded-xl h-11 gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        onClick={removeAvatar}
                      >
                        <Trash2 className="h-4 w-4" />
                        حذف الصورة
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    يُفضل استخدام صورة مربعة بحجم 256x256 بكسل. الحد الأقصى: 2 ميجابايت.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-100/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-800">تغيير كلمة المرور</CardTitle>
                  <p className="text-xs text-slate-500">حدّث كلمة المرور الخاصة بك</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="font-medium">كلمة المرور الحالية</Label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="rounded-xl h-12 bg-white/50 pr-11 pl-11"
                    placeholder="أدخل كلمة المرور الحالية"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">كلمة المرور الجديدة</Label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="rounded-xl h-12 bg-white/50 pr-11 pl-11"
                    placeholder="6 أحرف على الأقل"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">تأكيد كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="rounded-xl h-12 bg-white/50 pr-11 pl-11"
                    placeholder="أعد كتابة كلمة المرور الجديدة"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {newPassword && confirmPassword && newPassword === confirmPassword && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    كلمتا المرور متطابقتان
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleChangePassword}
                  className="rounded-xl h-12 px-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 gap-2"
                  disabled={!currentPassword || !newPassword || !confirmPassword}
                >
                  <Lock className="h-4 w-4" />
                  تغيير كلمة المرور
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
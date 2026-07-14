import { useState, useEffect } from "react";
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
  User, Shield, Mail, Lock, Eye, EyeOff, Save, Loader2, Upload, Trash2, Sparkles, KeyRound,
} from "lucide-react";

const roleLabels: Record<string, string> = {
  admin: "مدير النظام",
  supervisor: "مشرف مالي",
  collector: "محصل",
};

const roleColors: Record<string, string> = {
  admin: "from-amber-500 to-orange-500 text-white",
  supervisor: "from-blue-500 to-cyan-500 text-white",
  collector: "from-emerald-500 to-teal-500 text-white",
};

const Profile = () => {
  const { user } = useAuth();
  const [profileName, setProfileName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const handleUpdateProfile = async () => {
    if (!profileName.trim()) { showError("الاسم مطلوب"); return; }
    setSaving(true);
    try {
      await api.users.update(user!.id, { name: profileName.trim(), email: user!.email, role: user!.role });
      localStorage.setItem("auth_user", JSON.stringify({ ...user, name: profileName.trim() }));
      showSuccess("✅ تم تحديث الملف الشخصي");
    } catch (e: any) { showError(e.message); }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || newPassword.length < 6) { showError("كلمة المرور 6 أحرف على الأقل"); return; }
    if (newPassword !== confirmPassword) { showError("كلمتا المرور غير متطابقتين"); return; }
    setChangingPassword(true);
    try {
      await api.users.changePassword(user!.id, currentPassword, newPassword);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      showSuccess("✅ تم تغيير كلمة المرور");
    } catch (e: any) { showError(e.message); }
    setChangingPassword(false);
  };

  if (!user) {
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
          <User className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">الملف الشخصي</h1>
          <p className="text-slate-500 mt-1">إدارة بيانات حسابك وكلمة المرور</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* User Info Card */}
        <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-4 border-b border-slate-100/80">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br", roleColors[user.role] || "from-slate-500 to-gray-500")}>
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg text-slate-800">بيانات الحساب</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-md bg-gradient-to-br", roleColors[user.role] || "from-slate-500 to-gray-500")}>
                {user.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
                <p className="text-sm text-slate-500">{user.email}</p>
                <Badge className="mt-1 rounded-lg border-0 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                  {roleLabels[user.role] || user.role}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-medium">الاسم</Label>
              <Input
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="rounded-xl h-12"
                placeholder="اسم المستخدم"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-medium">البريد الإلكتروني</Label>
              <Input
                value={user.email}
                disabled
                className="rounded-xl h-12 bg-slate-50 text-slate-500"
                dir="ltr"
              />
            </div>

            <Button
              onClick={handleUpdateProfile}
              disabled={saving}
              className="rounded-xl h-11 gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-md w-full"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              حفظ التعديلات
            </Button>
          </CardContent>
        </Card>

        {/* Password Card */}
        <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-4 border-b border-slate-100/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg text-slate-800">تغيير كلمة المرور</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <Label className="font-medium">كلمة المرور الحالية</Label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="rounded-xl h-12 pl-10"
                  placeholder="••••••••"
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
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="rounded-xl h-12 pl-10"
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
              <Label className="font-medium">تأكيد كلمة المرور الجديدة</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-xl h-12"
                placeholder="أعد الكتابة"
                dir="ltr"
              />
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={changingPassword}
              className="rounded-xl h-11 gap-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-md w-full"
            >
              {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              تغيير كلمة المرور
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;
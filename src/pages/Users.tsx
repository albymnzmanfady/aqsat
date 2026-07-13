"use client";

import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiUser } from "@/lib/api";
import { User as UserType, UserRole, ROLE_PERMISSIONS } from "@/types";
import { showSuccess, showError } from "@/utils/toast";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserCog, Shield, ShieldCheck, ShieldAlert, CheckCircle2, XCircle,
  Plus, Edit, Trash2, MoreHorizontal, Mail, Eye, EyeOff, Loader2,
} from "lucide-react";

const roleConfig: Record<string, { label: string; color: string; Icon: React.ElementType; description: string }> = {
  admin: { label: "مدير النظام", color: "from-amber-500 to-orange-500", Icon: ShieldAlert, description: "جميع الصلاحيات" },
  supervisor: { label: "مشرف مالي", color: "from-blue-500 to-cyan-500", Icon: ShieldCheck, description: "إدارة الأقساط والمصروفات" },
  collector: { label: "محصل", color: "from-emerald-500 to-teal-500", Icon: Shield, description: "العملاء والعقود والأقساط" },
};

const Users = () => {
  const { user: currentUser, hasPermission } = useAuth();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "collector" as UserRole });
  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const canManageUsers = hasPermission("manage_users");

  const fetchUsers = async () => {
    try { const data = await api.users.list(); setUsers(data); }
    catch (e: any) { showError("خطأ: " + e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const resetForm = () => { setFormData({ name: "", email: "", password: "", confirmPassword: "", role: "collector" }); setEditingUser(null); setShowPassword(false); };

  const openEdit = (u: ApiUser) => {
    setEditingUser(u);
    setFormData({ name: u.name, email: u.email, password: "", confirmPassword: "", role: u.role as UserRole });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) { showError("الاسم والبريد مطلوبان"); return; }
    if (!editingUser && (!formData.password || formData.password.length < 6)) { showError("كلمة المرور 6 أحرف على الأقل"); return; }
    if (formData.password && formData.password !== formData.confirmPassword) { showError("كلمتا المرور غير متطابقتين"); return; }
    try {
      if (editingUser) {
        await api.users.update(editingUser.id, { name: formData.name.trim(), email: formData.email.trim(), password: formData.password || undefined, role: formData.role });
        showSuccess("✅ تم التعديل");
      } else {
        await api.users.create({ name: formData.name.trim(), email: formData.email.trim(), password: formData.password, role: formData.role });
        showSuccess("✅ تم الإضافة");
      }
      fetchUsers();
    } catch (e: any) { showError("خطأ: " + e.message); }
    setIsDialogOpen(false); resetForm();
  };

  const handleDelete = async (userId: number) => {
    if (userId === currentUser?.id) { showError("لا يمكن حذف حسابك"); return; }
    try { await api.users.delete(userId); showSuccess("✅ تم الحذف"); fetchUsers(); }
    catch (e: any) { showError("خطأ: " + e.message); }
    setDeleteConfirm(null);
  };

  if (loading) return <Layout><div className="flex items-center justify-center py-32"><Loader2 className="h-8 w-8 text-violet-500 animate-spin" /></div></Layout>;

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="relative">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-full opacity-20 blur-xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30"><UserCog className="h-7 w-7 text-white" /></div>
            <div><h1 className="text-2xl lg:text-3xl font-bold text-slate-800">المستخدمين</h1><p className="text-slate-500 mt-1">إدارة حسابات المستخدمين والصلاحيات</p></div>
          </div>
        </div>

        {canManageUsers && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-500/30 h-12 px-6"><Plus className="h-5 w-5" />مستخدم جديد</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] rounded-3xl">
              <DialogHeader><DialogTitle className="text-xl">{editingUser ? "تعديل المستخدم" : "مستخدم جديد"}</DialogTitle></DialogHeader>
              <div className="space-y-4 px-8">
                <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">الاسم</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="الاسم" /></div>
                <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">البريد</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com" dir="ltr" /></div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-600">الدور</Label>
                  <Select value={formData.role} onValueChange={(val: UserRole) => setFormData({ ...formData, role: val })}>
                    <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin"><span className="text-amber-600">●</span> مدير النظام</SelectItem>
                      <SelectItem value="supervisor"><span className="text-blue-600">●</span> مشرف مالي</SelectItem>
                      <SelectItem value="collector"><span className="text-emerald-600">●</span> محصل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-600">{editingUser ? "كلمة المرور الجديدة (اختياري)" : "كلمة المرور"}</Label>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="pl-10" placeholder={editingUser ? "اتركه فارغاً" : "6 أحرف على الأقل"} dir="ltr" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                  </div>
                </div>
                {formData.password && (
                  <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">تأكيد كلمة المرور</Label><Input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder="أعد الكتابة" dir="ltr" /></div>
                )}
              </div>
              <DialogFooter className="px-8">
                <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }} className="rounded-xl h-11">إلغاء</Button>
                <Button onClick={handleSave} className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 h-11 gap-2">
                  {editingUser ? "تحديث" : "إضافة"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* المستخدم الحالي */}
      {currentUser && (
        <Card className="border-0 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 text-white overflow-hidden relative mb-8">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl border border-white/30">{currentUser.name?.charAt(0) || "م"}</div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{currentUser.name}</h2>
                <p className="text-white/80 text-sm">{currentUser.email}</p>
                <Badge className="mt-2 rounded-lg border-0 text-white bg-white/20">{(roleConfig[currentUser.role] || roleConfig.admin).label}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* قائمة المستخدمين */}
      <div className="grid gap-4">
        {users.map((u) => {
          const config = roleConfig[u.role] || roleConfig.collector;
          const isCurrentUser = u.id === currentUser?.id;
          return (
            <Card key={u.id} className={cn("border-0 bg-white/70 backdrop-blur-sm overflow-hidden hover-lift", isCurrentUser && "ring-2 ring-violet-300/50")}>
              <div className={cn("h-1.5 w-full bg-gradient-to-l", config.color)} />
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md bg-gradient-to-br", config.color)}>{u.name.charAt(0)}</div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-800">{u.name}</h3>
                        <Badge className={cn("rounded-lg border-0 text-white bg-gradient-to-r", config.color)}>{config.label}</Badge>
                        {isCurrentUser && <Badge variant="outline" className="rounded-lg border-violet-200 text-violet-600 bg-violet-50">أنت</Badge>}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1"><Mail className="h-3 w-3" />{u.email}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">{config.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canManageUsers && !isCurrentUser && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl"><MoreHorizontal className="h-5 w-5 text-slate-500" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem onClick={() => openEdit(u)} className="cursor-pointer rounded-lg"><Edit className="h-4 w-4 ml-2" />تعديل</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteConfirm(u.id)} className="cursor-pointer rounded-lg text-red-600 focus:text-red-600"><Trash2 className="h-4 w-4 ml-2" />حذف</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* تأكيد الحذف */}
      <Dialog open={deleteConfirm !== null} onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}>
        <DialogContent className="sm:max-w-[350px] rounded-3xl">
          <DialogHeader><DialogTitle className="text-xl flex items-center gap-2 text-red-600"><Trash2 className="h-5 w-5" />حذف المستخدم</DialogTitle><DialogDescription>هل أنت متأكد؟ لا يمكن التراجع.</DialogDescription></DialogHeader>
          <DialogFooter className="px-8">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="rounded-xl h-11">إلغاء</Button>
            <Button variant="destructive" onClick={() => deleteConfirm !== null && handleDelete(deleteConfirm)} className="rounded-xl h-11 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700">حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* جدول الصلاحيات */}
      <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden mt-8">
        <CardContent className="p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Shield className="h-5 w-5 text-violet-500" />مقارنة الصلاحيات</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-right py-3 px-4 text-slate-600 font-semibold">الصلاحية</th>
                  {(["admin", "supervisor", "collector"] as UserRole[]).map((role) => (
                    <th key={role} className="text-center py-3 px-4"><Badge className={cn("rounded-lg border-0 text-white bg-gradient-to-r", roleConfig[role].color)}>{roleConfig[role].label}</Badge></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { key: "العملاء", perms: ["view_customers", "manage_customers"] as const },
                  { key: "العقود", perms: ["view_contracts", "manage_contracts"] as const },
                  { key: "الأقساط", perms: ["view_installments", "manage_installments"] as const },
                  { key: "المنتجات", perms: ["view_products", "manage_products"] as const },
                  { key: "المخزون", perms: ["view_inventory", "manage_inventory"] as const },
                  { key: "المصروفات", perms: ["view_expenses", "manage_expenses"] as const },
                  { key: "التقارير", perms: ["view_expense_reports"] as const },
                  { key: "الإعدادات", perms: ["view_settings"] as const },
                  { key: "المستخدمين", perms: ["view_users", "manage_users"] as const },
                ].map((row) => (
                  <tr key={row.key} className="border-b border-slate-100/80 hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-medium text-slate-700">{row.key}</td>
                    {(["admin", "supervisor", "collector"] as UserRole[]).map((role) => {
                      const rolePerms = ROLE_PERMISSIONS[role] || [];
                      const hasAll = row.perms.every((p) => rolePerms.includes(p));
                      const hasSome = row.perms.some((p) => rolePerms.includes(p));
                      return (
                        <td key={role} className="text-center py-3 px-4">
                          {hasAll ? <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" /> : hasSome ? <Shield className="h-5 w-5 text-amber-500 mx-auto" /> : <XCircle className="h-5 w-5 text-slate-300 mx-auto" />}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Users;
"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { mockUsers } from "@/data/mockUsers";
import { User, UserRole } from "@/types";
import { showSuccess } from "@/utils/toast";
import {
  UserCog,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Key,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Sparkles,
  Mail,
  Calendar,
} from "lucide-react";

const roleConfig: Record<UserRole, { label: string; color: string; icon: any; description: string }> = {
  admin: {
    label: "مدير النظام",
    color: "from-amber-500 to-orange-500",
    icon: ShieldAlert,
    description: "جميع الصلاحيات - إدارة كاملة",
  },
  supervisor: {
    label: "مشرف مالي",
    color: "from-blue-500 to-cyan-500",
    icon: ShieldCheck,
    description: "إدارة الأقساط والمصروفات والتقارير",
  },
  collector: {
    label: "محصل",
    color: "from-emerald-500 to-teal-500",
    icon: Shield,
    description: "إدارة العملاء والعقود والأقساط فقط",
  },
};

const Users = () => {
  const { user: currentUser, hasPermission } = useAuth();
  const [users] = useState<User[]>(mockUsers);

  const canManageUsers = hasPermission("manage_users");

  const getPermissionsCount = (role: UserRole) => {
    const { ROLE_PERMISSIONS } = require("@/types");
    return ROLE_PERMISSIONS[role]?.length || 0;
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="relative">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-full opacity-20 blur-xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <UserCog className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">المستخدمين</h1>
              <p className="text-slate-500 mt-1">إدارة حسابات المستخدمين والصلاحيات</p>
            </div>
          </div>
        </div>
      </div>

      {/* المستخدم الحالي */}
      <Card className="border-0 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 text-white overflow-hidden relative mb-8">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl border border-white/30">
              {currentUser?.name?.charAt(0) || "م"}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{currentUser?.name}</h2>
              <p className="text-white/80 text-sm">{currentUser?.email}</p>
              <Badge className={cn(
                "mt-2 rounded-lg border-0 text-white bg-white/20",
              )}>
                {roleConfig[currentUser?.role || "admin"].icon({ className: "h-3 w-3 ml-1" })}
                {roleConfig[currentUser?.role || "admin"].label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* قائمة المستخدمين */}
      <div className="grid gap-4">
        {users.map((user) => {
          const config = roleConfig[user.role];
          const RoleIcon = config.icon;
          const isCurrentUser = user.id === currentUser?.id;

          return (
            <Card
              key={user.id}
              className={cn(
                "border-0 bg-white/70 backdrop-blur-sm overflow-hidden hover-lift",
                isCurrentUser && "ring-2 ring-violet-300/50"
              )}
            >
              <div className={cn("h-1.5 w-full bg-gradient-to-l", config.color)} />
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md bg-gradient-to-br",
                      config.color
                    )}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-800">{user.name}</h3>
                        <Badge className={cn(
                          "rounded-lg border-0 text-white bg-gradient-to-r",
                          config.color
                        )}>
                          <RoleIcon className="h-3 w-3 ml-1" />
                          {config.label}
                        </Badge>
                        {isCurrentUser && (
                          <Badge variant="outline" className="rounded-lg border-violet-200 text-violet-600 bg-violet-50">
                            أنت
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        {config.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className="rounded-lg text-xs gap-1 border-slate-200">
                      <Key className="h-3 w-3" />
                      صلاحيات
                    </Badge>
                    {canManageUsers && !isCurrentUser && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-lg text-slate-500 hover:text-violet-600"
                        onClick={() => showSuccess("✅ تم تحديث صلاحيات المستخدم (محاكاة)")}
                      >
                        <RefreshCw className="h-3.5 w-3.5 ml-1" />
                        تعديل
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* جدول الصلاحيات */}
      <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden mt-8">
        <CardContent className="p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-violet-500" />
            مقارنة الصلاحيات بين الأدوار
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-right py-3 px-4 text-slate-600 font-semibold">الصلاحية</th>
                  {(["admin", "supervisor", "collector"] as UserRole[]).map((role) => (
                    <th key={role} className="text-center py-3 px-4">
                      <Badge className={cn("rounded-lg border-0 text-white bg-gradient-to-r", roleConfig[role].color)}>
                        {roleConfig[role].icon({ className: "h-3 w-3 ml-1" })}
                        {roleConfig[role].label}
                      </Badge>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { key: "العملاء", perms: ["view_customers", "manage_customers"] },
                  { key: "العقود", perms: ["view_contracts", "manage_contracts"] },
                  { key: "الأقساط", perms: ["view_installments", "manage_installments"] },
                  { key: "المنتجات", perms: ["view_products", "manage_products"] },
                  { key: "المخزون", perms: ["view_inventory", "manage_inventory"] },
                  { key: "المصروفات", perms: ["view_expenses", "manage_expenses"] },
                  { key: "تقارير المصروفات", perms: ["view_expense_reports"] },
                  { key: "الإعدادات", perms: ["view_settings"] },
                  { key: "المستخدمين", perms: ["view_users", "manage_users"] },
                ].map((row) => {
                  const { ROLE_PERMISSIONS } = require("@/types");
                  return (
                    <tr key={row.key} className="border-b border-slate-100/80 hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-medium text-slate-700">{row.key}</td>
                      {(["admin", "supervisor", "collector"] as UserRole[]).map((role) => {
                        const rolePerms = ROLE_PERMISSIONS[role] || [];
                        const hasAll = row.perms.every((p) => rolePerms.includes(p));
                        const hasSome = row.perms.some((p) => rolePerms.includes(p));
                        return (
                          <td key={role} className="text-center py-3 px-4">
                            {hasAll ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
                            ) : hasSome ? (
                              <Shield className="h-5 w-5 text-amber-500 mx-auto" />
                            ) : (
                              <XCircle className="h-5 w-5 text-slate-300 mx-auto" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Users;
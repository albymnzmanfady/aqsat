"use client";

import { User } from "@/types";

export const mockUsers: User[] = [
  {
    id: 1,
    name: "محمد أحمد",
    email: "admin@system.com",
    role: "admin",
  },
  {
    id: 2,
    name: "خالد علي",
    email: "supervisor@system.com",
    role: "supervisor",
  },
  {
    id: 3,
    name: "سامي حسن",
    email: "collector@system.com",
    role: "collector",
  },
];

// تخزين كلمات المرور (محاكاة)
const STORAGE_PASSWORDS_KEY = "app_user_passwords";

export const mockPasswords: Record<string, string> = {
  "admin@system.com": "admin123",
  "supervisor@system.com": "super123",
  "collector@system.com": "collect123",
};

// تحميل كلمات المرور من localStorage
const getStoredPasswords = (): Record<string, string> => {
  try {
    const stored = localStorage.getItem(STORAGE_PASSWORDS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {};
};

// حفظ كلمات المرور
const savePasswords = (passwords: Record<string, string>) => {
  localStorage.setItem(STORAGE_PASSWORDS_KEY, JSON.stringify(passwords));
};

// إضافة مستخدم جديد مع كلمة مرور
export const addUserWithPassword = (user: User, password: string): void => {
  const users = getStoredUsers();
  users.push(user);
  localStorage.setItem("app_users", JSON.stringify(users));

  const passwords = { ...mockPasswords, ...getStoredPasswords() };
  passwords[user.email] = password;
  savePasswords(passwords);
};

// تحديث مستخدم مع كلمة مرور اختيارية
export const updateUserWithPassword = (userId: number, updated: Partial<User>, newPassword?: string): void => {
  const users = getStoredUsers().map((u) => (u.id === userId ? { ...u, ...updated } : u));
  localStorage.setItem("app_users", JSON.stringify(users));

  if (newPassword && updated.email) {
    const passwords = { ...mockPasswords, ...getStoredPasswords() };
    // إذا تغيّر الإيميل، نحذف القديم
    const oldUser = getStoredUsers().find(u => u.id === userId);
    if (oldUser && oldUser.email !== updated.email) {
      delete passwords[oldUser.email];
    }
    passwords[updated.email] = newPassword;
    savePasswords(passwords);
  }
};

// حذف مستخدم
export const deleteUserById = (userId: number): void => {
  const user = getStoredUsers().find(u => u.id === userId);
  const users = getStoredUsers().filter((u) => u.id !== userId);
  localStorage.setItem("app_users", JSON.stringify(users));
  if (user) {
    const passwords = { ...mockPasswords, ...getStoredPasswords() };
    delete passwords[user.email];
    savePasswords(passwords);
  }
};

// الحصول على جميع المستخدمين (من storage أو mock)
export const getStoredUsers = (): User[] => {
  try {
    const stored = localStorage.getItem("app_users");
    if (stored) return JSON.parse(stored);
  } catch {}
  // تهيئة أول مرة
  localStorage.setItem("app_users", JSON.stringify(mockUsers));
  // حفظ كلمات المرور الأولية
  savePasswords(mockPasswords);
  return mockUsers;
};

// التحقق من بيانات الدخول
export const checkCredentials = (email: string, password: string): User | null => {
  const users = getStoredUsers();
  const passwords = { ...mockPasswords, ...getStoredPasswords() };
  const user = users.find((u) => u.email === email);
  if (user && passwords[email] === password) {
    return user;
  }
  return null;
};
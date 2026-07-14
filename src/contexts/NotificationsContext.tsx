"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";

export type NotificationType = "overdue_installment" | "upcoming_installment" | "low_stock" | "out_of_stock";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
  priority: "high" | "medium" | "low";
  icon: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  removeNotification: (id: string) => void;
  refreshNotifications: () => void;
  navigateToNotification: (notification: Notification) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);
const STORAGE_KEY = "app_notifications_read";

const getReadIds = (): Set<string> => {
  try { const stored = localStorage.getItem(STORAGE_KEY); if (stored) return new Set(JSON.parse(stored)); } catch {}
  return new Set();
};

const saveReadIds = (ids: Set<string>) => { localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids])); };

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(getReadIds);

  const loadData = useCallback(async () => {
    try {
      const [inst, cont, prods] = await Promise.all([
        api.getInstallments(),
        api.getContracts(),
        api.getProducts(),
      ]);

      const today = new Date(); today.setHours(0, 0, 0, 0);
      const result: Notification[] = [];

      inst.filter((i: any) => !i.is_paid && new Date(i.year, i.month - 1, i.day) < today).forEach((instItem: any) => {
        const contract = cont.find((c: any) => c.id === instItem.contract_id);
        if (!contract) return;
        const daysOverdue = Math.floor((today.getTime() - new Date(instItem.year, instItem.month - 1, instItem.day).getTime()) / 86400000);
        const notifId = `overdue-${instItem.id}`;
        result.push({ id: notifId, type: "overdue_installment", title: "قسط متأخر", message: `${contract.customer_name} - القسط ${instItem.number} متأخر ${daysOverdue} يوم`, link: "/installments", read: readIds.has(notifId), createdAt: today.toISOString(), priority: daysOverdue > 7 ? "high" : "medium", icon: "⚠️" });
      });

      inst.filter((i: any) => { if (i.is_paid) return false; const d = new Date(i.year, i.month - 1, i.day); const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000); return diff >= 0 && diff <= 3; }).forEach((instItem: any) => {
        const contract = cont.find((c: any) => c.id === instItem.contract_id);
        if (!contract) return;
        const daysUntil = Math.ceil((new Date(instItem.year, instItem.month - 1, instItem.day).getTime() - today.getTime()) / 86400000);
        const notifId = `upcoming-${instItem.id}`;
        result.push({ id: notifId, type: "upcoming_installment", title: "قسط قريب", message: `${contract.customer_name} - القسط ${instItem.number} يستحق خلال ${daysUntil === 0 ? "اليوم" : daysUntil + " يوم"}`, link: "/installments", read: readIds.has(notifId), createdAt: today.toISOString(), priority: daysUntil === 0 ? "high" : "low", icon: "📅" });
      });

      prods.forEach((p: any) => {
        if (p.current_stock <= 0) { const n = `out-${p.id}`; result.push({ id: n, type: "out_of_stock", title: "نفذ من المخزون", message: `${p.name} نفذ بالكامل`, link: "/products", read: readIds.has(n), createdAt: today.toISOString(), priority: "high", icon: "🚫" }); }
        else if (p.current_stock <= p.min_stock) { const n = `low-${p.id}`; result.push({ id: n, type: "low_stock", title: "مخزون منخفض", message: `${p.name} - متبقي ${p.current_stock}`, link: "/products", read: readIds.has(n), createdAt: today.toISOString(), priority: "medium", icon: "📦" }); }
      });

      result.sort((a, b) => { if (a.read !== b.read) return a.read ? 1 : -1; const po: any = { high: 0, medium: 1, low: 2 }; return (po[a.priority] || 0) - (po[b.priority] || 0); });
      setNotifications(result);
    } catch {}
  }, [readIds]);

  useEffect(() => { loadData(); }, [loadData]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const markAsRead = useCallback((id: string) => { setReadIds((prev) => { const next = new Set(prev); next.add(id); saveReadIds(next); return next; }); }, []);
  const markAllAsRead = useCallback(() => { setReadIds((prev) => { const next = new Set(prev); notifications.forEach((n) => next.add(n.id)); saveReadIds(next); return next; }); }, [notifications]);
  const clearAll = markAllAsRead;
  const removeNotification = useCallback((id: string) => { setNotifications((prev) => prev.filter((n) => n.id !== id)); }, []);
  const refreshNotifications = useCallback(async () => { await loadData(); }, [loadData]);
  const navigate = useNavigate();
  const navigateToNotification = useCallback((notification: Notification) => { markAsRead(notification.id); navigate(notification.link); }, [markAsRead, navigate]);

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, clearAll, removeNotification, refreshNotifications, navigateToNotification }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error("useNotifications must be used within NotificationsProvider");
  return context;
};

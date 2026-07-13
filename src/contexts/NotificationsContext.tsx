"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { initialInstallments, initialContracts, initialProducts } from "@/data/mockData";
import { useNavigate } from "react-router-dom";

export type NotificationType =
  | "overdue_installment"
  | "upcoming_installment"
  | "low_stock"
  | "out_of_stock"
  | "new_contract"
  | "payment_received";

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
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return new Set(JSON.parse(stored));
  } catch {}
  return new Set();
};

const saveReadIds = (ids: Set<string>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
};

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(getReadIds);

  const generateNotifications = useCallback((): Notification[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result: Notification[] = [];

    // 1. Overdue installments
    const overdueInstallments = initialInstallments.filter((inst) => {
      if (inst.isPaid) return false;
      const dueDate = new Date(inst.year, inst.month - 1, inst.day);
      return dueDate < today;
    });

    overdueInstallments.forEach((inst) => {
      const contract = initialContracts.find((c) => c.id === inst.contractId);
      if (!contract) return;
      const dueDate = new Date(inst.year, inst.month - 1, inst.day);
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const notifId = `overdue-${inst.id}`;
      result.push({
        id: notifId,
        type: "overdue_installment",
        title: "قسط متأخر",
        message: `العميل ${contract.customerName} - القسط رقم ${inst.number} متأخر منذ ${daysOverdue} يوم (${inst.amount.toLocaleString()} ج.م)`,
        link: "/installments",
        read: readIds.has(notifId),
        createdAt: dueDate.toISOString(),
        priority: daysOverdue > 7 ? "high" : "medium",
        icon: "⚠️",
      });
    });

    // 2. Upcoming installments (within 3 days)
    const upcomingInstallments = initialInstallments.filter((inst) => {
      if (inst.isPaid) return false;
      const dueDate = new Date(inst.year, inst.month - 1, inst.day);
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 3;
    });

    upcomingInstallments.forEach((inst) => {
      const contract = initialContracts.find((c) => c.id === inst.contractId);
      if (!contract) return;
      const dueDate = new Date(inst.year, inst.month - 1, inst.day);
      const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const notifId = `upcoming-${inst.id}`;
      result.push({
        id: notifId,
        type: "upcoming_installment",
        title: "قسط قريباً",
        message: `العميل ${contract.customerName} - القسط رقم ${inst.number} يستحق خلال ${daysUntil === 0 ? "اليوم" : daysUntil + " يوم"} (${inst.amount.toLocaleString()} ج.م)`,
        link: "/installments",
        read: readIds.has(notifId),
        createdAt: today.toISOString(),
        priority: daysUntil === 0 ? "high" : "low",
        icon: "📅",
      });
    });

    // 3. Low stock products
    initialProducts.forEach((product) => {
      if (product.currentStock <= 0) {
        const notifId = `out-of-stock-${product.id}`;
        result.push({
          id: notifId,
          type: "out_of_stock",
          title: " produkt نفذ من المخزون",
          message: `${product.name} نفذ بالكامل من المخزن - يجب إعادة الطلب فوراً`,
          link: "/products",
          read: readIds.has(notifId),
          createdAt: today.toISOString(),
          priority: "high",
          icon: "🚫",
        });
      } else if (product.currentStock <= product.minStock) {
        const notifId = `low-stock-${product.id}`;
        result.push({
          id: notifId,
          type: "low_stock",
          title: "مخزون منخفض",
          message: `${product.name} - متبقي ${product.currentStock} ${product.unit} فقط (الحد الأدنى: ${product.minStock})`,
          link: "/products",
          read: readIds.has(notifId),
          createdAt: today.toISOString(),
          priority: "medium",
          icon: "📦",
        });
      }
    });

    // Sort: unread first, then by priority, then by date
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    result.sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [readIds]);

  useEffect(() => {
    setNotifications(generateNotifications());
  }, [generateNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((n) => next.add(n.id));
      saveReadIds(next);
      return next;
    });
  }, [notifications]);

  const clearAll = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((n) => next.add(n.id));
      saveReadIds(next);
      return next;
    });
  }, [notifications]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const refreshNotifications = useCallback(() => {
    setNotifications(generateNotifications());
  }, [generateNotifications]);

  const navigate = useNavigate();

  const navigateToNotification = useCallback((notification: Notification) => {
    markAsRead(notification.id);
    navigate(notification.link);
  }, [markAsRead, navigate]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearAll,
        removeNotification,
        refreshNotifications,
        navigateToNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
};
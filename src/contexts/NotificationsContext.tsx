import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { showError } from "@/utils/toast";

export interface Notification {
  id: string;
  type: "overdue_installment" | "upcoming_installment" | "low_stock" | "out_of_stock" | "new_contract" | "payment_received";
  title: string;
  message: string;
  priority: "high" | "medium" | "low";
  icon: string;
  read: boolean;
  link?: string;
  createdAt: Date;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  refreshNotifications: () => void;
  navigateToNotification: (notification: Notification) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const loadData = useCallback(async () => {
    try {
      const [inst, cont, prods] = await Promise.all([
        api.getInstallments(),
        api.getContracts(),
        api.getProducts(),
      ]);

      if (!inst || !cont || !prods) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const newNotifs: Notification[] = [];

      // Overdue installments
      if (Array.isArray(inst)) {
        (inst as any[]).filter((i: any) => !i.is_paid && new Date(i.year, i.month - 1, i.day) < today).forEach((instItem: any) => {
          const contract = Array.isArray(cont) ? (cont as any[]).find((c: any) => c.id === instItem.contract_id) : null;
          if (!contract) return;
          newNotifs.push({
            id: generateId(),
            type: "overdue_installment",
            title: "قسط متأخر",
            message: `العميل ${contract.customer_name} - القسط #${instItem.number} متأخر`,
            priority: "high",
            icon: "🚨",
            read: false,
            link: `/installments?contractId=${contract.id}`,
            createdAt: new Date(),
          });
        });

        // Upcoming installments (within 3 days)
        (inst as any[]).filter((i: any) => {
          if (i.is_paid) return false;
          const d = new Date(i.year, i.month - 1, i.day);
          const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000);
          return diff >= 0 && diff <= 3;
        }).forEach((instItem: any) => {
          const contract = Array.isArray(cont) ? (cont as any[]).find((c: any) => c.id === instItem.contract_id) : null;
          if (!contract) return;
          newNotifs.push({
            id: generateId(),
            type: "upcoming_installment",
            title: "اقتراب قسط",
            message: `العميل ${contract.customer_name} - القسط #${instItem.number} بعد ${Math.ceil((new Date(instItem.year, instItem.month - 1, instItem.day).getTime() - today.getTime()) / 86400000)} أيام`,
            priority: "medium",
            icon: "⏰",
            read: false,
            link: `/installments?contractId=${contract.id}`,
            createdAt: new Date(),
          });
        });
      }

      // Low stock products
      if (Array.isArray(prods)) {
        (prods as any[]).filter((p: any) => p.current_stock <= p.min_stock && p.current_stock > 0).forEach((p: any) => {
          newNotifs.push({
            id: generateId(),
            type: "low_stock",
            title: "مخزون منخفض",
            message: `المنتج ${p.name} وصل للحد الأدنى (${p.current_stock} ${p.unit})`,
            priority: "medium",
            icon: "📦",
            read: false,
            link: `/products?id=${p.id}`,
            createdAt: new Date(),
          });
        });

        (prods as any[]).filter((p: any) => p.current_stock <= 0).forEach((p: any) => {
          newNotifs.push({
            id: generateId(),
            type: "out_of_stock",
            title: "نفاد مخزون",
            message: `المنتج ${p.name} نفذ بالكامل`,
            priority: "high",
            icon: "🚫",
            read: false,
            link: `/products?id=${p.id}`,
            createdAt: new Date(),
          });
        });
      }

      setNotifications(newNotifs);
    } catch (e: any) {
      console.error("Notifications: Failed to load data", e);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [loadData]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const refreshNotifications = useCallback(() => {
    loadData();
  }, [loadData]);

  const navigateToNotification = useCallback((notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      const [path, query] = notification.link.split("?");
      navigate({ pathname: path, search: query ? `?${query}` : "" });
    }
  }, [markAsRead, navigate]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
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
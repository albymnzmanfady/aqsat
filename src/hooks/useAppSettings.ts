"use client";

import { useState, useEffect, useCallback } from "react";

export interface GeneralSettings {
  appName: string;
  logoUrl: string;
  companyName: string;
  companyPhone: string;
  companyAddress: string;
}

const DEFAULT_SETTINGS: GeneralSettings = {
  appName: "أقساط",
  logoUrl: "",
  companyName: "",
  companyPhone: "",
  companyAddress: "",
};

const STORAGE_KEY = "app_general_settings";

export function useAppSettings() {
  const [settings, setSettings] = useState<GeneralSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error("Error loading settings:", e);
    }
    return DEFAULT_SETTINGS;
  });

  const updateSettings = useCallback((newSettings: Partial<GeneralSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // تحديث عنوان الصفحة
  useEffect(() => {
    document.title = settings.appName
      ? `${settings.appName} - نظام إدارة الأقساط`
      : "أقساط - نظام إدارة الأقساط";
  }, [settings.appName]);

  // تحديث الأيقونة المفضلة من الشعار
  useEffect(() => {
    if (settings.logoUrl) {
      let link = document.querySelector(
        "link[rel~='icon']"
      ) as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = settings.logoUrl;
    }
  }, [settings.logoUrl]);

  return { settings, updateSettings };
}
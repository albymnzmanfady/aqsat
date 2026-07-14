"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

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

const SETTINGS_KEY = "general_settings";

export function useAppSettings() {
  const [settings, setSettings] = useState<GeneralSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.getSettings(SETTINGS_KEY)
      .then((data) => {
        if (data) setSettings({ ...DEFAULT_SETTINGS, ...data });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<GeneralSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      api.updateSettings(SETTINGS_KEY, updated).catch(console.error);
      return updated;
    });
  }, []);

  useEffect(() => {
    document.title = settings.appName
      ? `${settings.appName} - نظام إدارة الأقساط`
      : "أقساط - نظام إدارة الأقساط";
  }, [settings.appName]);

  useEffect(() => {
    if (settings.logoUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = settings.logoUrl;
    }
  }, [settings.logoUrl]);

  return { settings, updateSettings, loaded };
}

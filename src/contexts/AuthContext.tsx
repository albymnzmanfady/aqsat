"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { mockCredentials } from "@/data/mockUsers";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("auth_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("auth_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("auth_user");
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 500));

    const found = mockCredentials.find(
      (c) => c.email === email && c.password === password
    );

    if (found) {
      setUser(found.user);
      return { success: true };
    }

    return { success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === "admin") return true;
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        hasPermission,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
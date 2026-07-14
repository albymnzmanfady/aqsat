"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("❌ Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 dark:bg-[#05070c] p-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-rose-100 dark:bg-rose-950/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-10 w-10 text-rose-600 dark:text-rose-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              عذراً، حدث خطأ غير متوقع
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              واجه النظام مشكلة أثناء تحميل هذه الصفحة. يرجى المحاولة مرة أخرى أو العودة للصفحة الرئيسية.
            </p>
            {this.state.error && (
              <details className="mb-6 text-right">
                <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300">
                  تفاصيل الخطأ الفنية
                </summary>
                <p className="mt-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono text-slate-600 dark:text-slate-400 overflow-auto max-h-32">
                  {this.state.error.message}
                </p>
              </details>
            )}
            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={this.handleReset}
                className="rounded-xl h-12 px-6 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                إعادة المحاولة
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = "/"}
                className="rounded-xl h-12 px-6 gap-2"
              >
                <Home className="h-4 w-4" />
                الصفحة الرئيسية
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
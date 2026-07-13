"use client";

import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl font-bold text-blue-600">404</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">الصفحة غير موجودة</h1>
        <p className="text-slate-500 mb-6">عذراً، لا يمكننا العثور على الصفحة التي تبحث عنها</p>
        <Link to="/">
          <Button className="gap-2 rounded-xl bg-blue-600 hover:bg-blue-700">
            <Home className="h-4 w-4" />
            العودة للرئيسية
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
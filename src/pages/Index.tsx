"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { api, ApiContract, ApiInstallment } from "@/lib/api";
import { 
  Plus, CreditCard, Users, FileText, AlertTriangle, 
  CheckCircle2, Clock, MessageSquareText, Loader2 
} from "lucide-react";

const Index = () => {
  const [contracts, setContracts] = useState<ApiContract[]>([]);
  const [installments, setInstallments] = useState<ApiInstallment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.contracts.list(), api.installments.list()])
      .then(([c, i]) => { setContracts(c); setInstallments(i); })
      .finally(() => setLoading(false));
  }, []);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const overdueInstallments = installments.filter(i => !i.is_paid && new Date(i.year, i.month - 1, i.day) < today);
  const upcomingToday = installments.filter(i => !i.is_paid && new Date(i.year, i.month - 1, i.day).getTime() === today.getTime());

  if (loading) return <Layout><div className="flex items-center justify-center py-32"><Loader2 className="h-8 w-8 text-violet-500 animate-spin" /></div></Layout>;

  return (
    <Layout>
      <div className="space-y-6 pb-20">
        {/* ملخص سريع */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/20">
            <CardContent className="p-4">
              <p className="text-white/80 text-xs mb-1">متأخرات اليوم</p>
              <p className="text-2xl font-bold">{overdueInstallments.length}</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
            <CardContent className="p-4">
              <p className="text-white/80 text-xs mb-1">تحصيل اليوم</p>
              <p className="text-2xl font-bold">{upcomingToday.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* المهام العاجلة */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-800 px-1">المهام العاجلة</h2>
          {overdueInstallments.slice(0, 3).map(inst => (
            <div key={inst.id} className="bg-white p-4 rounded-2xl border border-rose-100 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-rose-500 h-5 w-5" />
                <div>
                  <p className="font-semibold text-sm text-slate-800">{contracts.find(c => c.id === inst.contract_id)?.customer_name}</p>
                  <p className="text-xs text-rose-500">متأخر {inst.amount} ج.م</p>
                </div>
              </div>
              <Button size="sm" className="rounded-xl bg-rose-100 text-rose-600 hover:bg-rose-200">تحصيل</Button>
            </div>
          ))}
        </div>
      </div>

      {/* زر الإجراءات السريع العائم */}
      <div className="fixed bottom-20 left-6 z-40 flex flex-col gap-3">
        <Link to="/installments">
          <Button className="h-14 w-14 rounded-full bg-violet-600 shadow-xl hover:bg-violet-700 active:scale-90 transition-all">
            <CreditCard className="h-6 w-6" />
          </Button>
        </Link>
        <Link to="/contracts">
          <Button className="h-14 w-14 rounded-full bg-emerald-600 shadow-xl hover:bg-emerald-700 active:scale-90 transition-all">
            <Plus className="h-7 w-7" />
          </Button>
        </Link>
      </div>
    </Layout>
  );
};

export default Index;
"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import CustomerForm from "@/components/CustomerForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, Search, Phone, CreditCard, User, Users2, Sparkles } from "lucide-react";
import { initialCustomers, initialGuarantors } from "@/data/mockData";
import { Customer, Guarantor } from "@/types";
import { showSuccess } from "@/utils/toast";

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [guarantors, setGuarantors] = useState<Guarantor[]>(initialGuarantors);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("customers");

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.includes(searchQuery) ||
      customer.phone.includes(searchQuery) ||
      customer.nationalId.includes(searchQuery)
  );

  const filteredGuarantors = guarantors.filter(
    (guarantor) =>
      guarantor.name.includes(searchQuery) ||
      guarantor.phone.includes(searchQuery) ||
      guarantor.nationalId.includes(searchQuery)
  );

  const handleAddCustomer = (customer: Customer, guarantor: Guarantor) => {
    setCustomers([...customers, customer]);
    if (!guarantors.find((g) => g.nationalId === guarantor.nationalId)) {
      setGuarantors([...guarantors, guarantor]);
    }
    setIsDialogOpen(false);
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="relative">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full opacity-20 blur-xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">العملاء والضامنين</h1>
              <p className="text-slate-500 mt-1">إضافة وتعديل بيانات العملاء والضامنين</p>
            </div>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/30 h-12 px-6">
              <Plus className="h-5 w-5" />
              إضافة عميل جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-500" />
                تسجيل عميل جديد
              </DialogTitle>
            </DialogHeader>
            <CustomerForm onSubmit={handleAddCustomer} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="text"
            placeholder="بحث بالاسم أو الهاتف أو الرقم القومي..."
            className="pr-12 rounded-2xl bg-white/70 backdrop-blur-sm border-slate-200 h-12 shadow-sm focus:shadow-md transition-shadow"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/70 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200/50">
          <TabsTrigger
            value="customers"
            className="rounded-xl gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 h-10"
          >
            <User className="h-4 w-4" />
            العملاء ({customers.length})
          </TabsTrigger>
          <TabsTrigger
            value="guarantors"
            className="rounded-xl gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/25 h-10"
          >
            <Users2 className="h-4 w-4" />
            الضامنين ({guarantors.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredCustomers.map((customer, index) => (
              <Card
                key={customer.id}
                className="border-0 bg-white/70 backdrop-blur-sm hover-lift overflow-hidden group"
              >
                <div className="h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500" />
                <CardContent className="p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                      {customer.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 text-lg">{customer.name}</h3>
                      <p className="text-sm text-slate-500">{customer.nationalId}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-600 p-2 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Phone className="h-4 w-4 text-blue-600" />
                      </div>
                      <span dir="ltr" className="font-medium">{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 p-2 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-violet-600" />
                      </div>
                      <span className="truncate font-medium">{customer.address}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-3xl border border-slate-200/50">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-600 mb-2">لا يوجد عملاء</h3>
              <p className="text-slate-500">لم يتم العثور على عملاء مطابقين لبحثك</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="guarantors">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredGuarantors.map((guarantor) => (
              <Card
                key={guarantor.id}
                className="border-0 bg-white/70 backdrop-blur-sm hover-lift overflow-hidden group"
              >
                <div className="h-1.5 bg-gradient-to-r from-violet-500 to-purple-500" />
                <CardContent className="p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform">
                      {guarantor.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 text-lg">{guarantor.name}</h3>
                      <p className="text-sm text-slate-500">{guarantor.nationalId}</p>
                      <Badge className="mt-2 bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 border-0 rounded-lg">
                        <Sparkles className="h-3 w-3 ml-1" />
                        ضامن
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-600 p-2 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                        <Phone className="h-4 w-4 text-violet-600" />
                      </div>
                      <span dir="ltr" className="font-medium">{guarantor.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 p-2 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="truncate font-medium">{guarantor.address}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredGuarantors.length === 0 && (
            <div className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-3xl border border-slate-200/50">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Users2 className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-600 mb-2">لا يوجد ضامنين</h3>
              <p className="text-slate-500">لم يتم العثور على ضامنين مطابقين لبحثك</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Customers;
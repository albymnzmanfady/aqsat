"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import CustomerForm from "@/components/CustomerForm";
import { initialCustomers } from "@/data/mockData";
import { Customer } from "@/types";
import { showSuccess } from "@/utils/toast";
import { Users, Search, Plus, UserCheck, Sparkles, Phone, MapPin, IdCard, X } from "lucide-react";

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"customer" | "guarantor">("customer");

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch = c.name.includes(searchQuery) || c.phone.includes(searchQuery);
    return matchesSearch;
  });

  const realCustomers = filteredCustomers.filter((c) => c.type === "customer");
  const guarantors = filteredCustomers.filter((c) => c.type === "guarantor");

  const handleAddCustomer = (data: any) => {
    const newCustomer: Customer = {
      id: customers.length + 1,
      ...data,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setCustomers((prev) => [...prev, newCustomer]);
    showSuccess(data.type === "customer" ? "تم إضافة العميل بنجاح" : "تم إضافة الضامن بنجاح");
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
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">العملاء</h1>
              <p className="text-slate-500 mt-1">إدارة العملاء والضامنين</p>
            </div>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <div className="flex gap-2">
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    className="gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/30 h-12 px-6 active:scale-[0.97]"
                    onClick={() => setDialogType("customer")}
                  >
                    <Plus className="h-5 w-5" />
                    عميل جديد
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="rounded-lg text-xs">
                  إضافة عميل جديد
                </TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 rounded-2xl border-blue-200 hover:bg-blue-50 h-12 px-6 active:scale-[0.97]"
                    onClick={() => setDialogType("guarantor")}
                  >
                    <UserCheck className="h-5 w-5 text-blue-500" />
                    ضامن جديد
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="rounded-lg text-xs">
                  إضافة ضامن جديد
                </TooltipContent>
              </Tooltip>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                {dialogType === "customer" ? "إضافة عميل جديد" : "إضافة ضامن جديد"}
              </DialogTitle>
              <DialogDescription>
                أدخل بيانات {dialogType === "customer" ? "العميل" : "الضامن"}
              </DialogDescription>
            </DialogHeader>
            <CustomerForm
              type={dialogType}
              onSave={handleAddCustomer}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">إجمالي العملاء</p>
                <p className="font-bold text-xl text-slate-800">{customers.filter(c => c.type === "customer").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">الضامنون</p>
                <p className="font-bold text-xl text-slate-800">{customers.filter(c => c.type === "guarantor").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input
          type="text"
          placeholder="بحث باسم العميل أو رقم الهاتف..."
          className="pr-12 rounded-2xl bg-white/70 backdrop-blur-sm border-slate-200/50 h-12 shadow-sm focus:shadow-md transition-shadow"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute left-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors text-slate-500"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="customers" className="w-full">
        <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-100 p-1 rounded-2xl mb-6">
          <TabsTrigger
            value="customers"
            className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
          >
            العملاء
          </TabsTrigger>
          <TabsTrigger
            value="guarantors"
            className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white"
          >
            الضامنون
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="mt-0">
          <div className="grid gap-4">
            {realCustomers.map((customer) => (
              <Card key={customer.id} className="border-0 bg-white/70 backdrop-blur-sm hover-lift overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{customer.name}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </span>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {customer.address}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="rounded-lg bg-blue-50 text-blue-600 border-blue-200">
                      عميل
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {realCustomers.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-600 mb-2">لا يوجد عملاء</h3>
                <p className="text-slate-500">لم يتم العثور على عملاء</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="guarantors" className="mt-0">
          <div className="grid gap-4">
            {guarantors.map((guarantor) => (
              <Card key={guarantor.id} className="border-0 bg-white/70 backdrop-blur-sm hover-lift overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {guarantor.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{guarantor.name}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {guarantor.phone}
                          </span>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {guarantor.address}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="rounded-lg bg-emerald-50 text-emerald-600 border-emerald-200">
                      ضامن
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {guarantors.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-600 mb-2">لا يوجد ضامنين</h3>
                <p className="text-slate-500">لم يتم العثور على ضامنين</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Customers;
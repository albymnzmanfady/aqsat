"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import CustomerForm from "@/components/CustomerForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, Search, Phone, CreditCard, User, Users2 } from "lucide-react";
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Users className="h-5 w-5 text-white" />
            </div>
            إدارة العملاء والضامنين
          </h1>
          <p className="text-slate-500 mt-2 mr-13">إضافة وتعديل بيانات العملاء والضامنين</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25">
              <Plus className="h-4 w-4" />
              إضافة عميل جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">تسجيل عميل جديد</DialogTitle>
            </DialogHeader>
            <CustomerForm onSubmit={handleAddCustomer} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="بحث بالاسم أو الهاتف أو الرقم القومي..."
            className="pr-10 rounded-xl bg-white border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-xl">
          <TabsTrigger
            value="customers"
            className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <User className="h-4 w-4" />
            العملاء ({customers.length})
          </TabsTrigger>
          <TabsTrigger
            value="guarantors"
            className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Users2 className="h-4 w-4" />
            الضامنين ({guarantors.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id} className="border-slate-200 bg-white hover:shadow-md transition-all duration-200">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/25">
                      {customer.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">{customer.name}</h3>
                      <p className="text-sm text-slate-500">{customer.nationalId}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span dir="ltr">{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CreditCard className="h-4 w-4 text-slate-400" />
                      <span className="truncate">{customer.address}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-1">لا يوجد عملاء</h3>
              <p className="text-slate-500">لم يتم العثور على عملاء مطابقين لبحثك</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="guarantors">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredGuarantors.map((guarantor) => (
              <Card key={guarantor.id} className="border-slate-200 bg-white hover:shadow-md transition-all duration-200">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/25">
                      {guarantor.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">{guarantor.name}</h3>
                      <p className="text-sm text-slate-500">{guarantor.nationalId}</p>
                      <Badge className="mt-1 bg-purple-100 text-purple-700">ضامن</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span dir="ltr">{guarantor.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CreditCard className="h-4 w-4 text-slate-400" />
                      <span className="truncate">{guarantor.address}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredGuarantors.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <Users2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-1">لا يوجد ضامنين</h3>
              <p className="text-slate-500">لم يتم العثور على ضامنين مطابقين لبحثك</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Customers;
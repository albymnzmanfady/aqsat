import { supabase } from "@/integrations/supabase/client";

// ===== Types =====

export interface ApiCustomer {
  id: number;
  name: string;
  phone: string;
  national_id?: string;
  address?: string;
  type: "customer" | "guarantor";
  created_at?: string;
}

export interface ApiContract {
  id: number;
  customer_id?: number;
  customer_name: string;
  customer_phone: string;
  product_type: string;
  product_id?: number;
  total_price: number;
  down_payment: number;
  number_of_receipts: number;
  installment_amount: number;
  start_date: string;
  end_date: string;
  status: "active" | "completed" | "defaulted";
  guarantor_name: string;
  guarantor_phone: string;
  created_at: string;
}

export interface ApiInstallment {
  id: number;
  contract_id: number;
  number: number;
  amount: number;
  due_date: string;
  is_paid: number;
  paid_date?: string;
  day: number;
  month: number;
  year: number;
}

export interface ApiProduct {
  id: number;
  name: string;
  category: string;
  unit: string;
  cost_price: number;
  selling_price: number;
  current_stock: number;
  min_stock: number;
  created_at?: string;
}

export interface ApiInventoryTransaction {
  id: number;
  product_id: number;
  product_name?: string;
  type: "purchase" | "sale" | "adjustment" | "return";
  quantity: number;
  unit_price: number;
  total: number;
  date: string;
  reference: string;
  notes: string;
  created_at?: string;
}

export interface ApiExpenseCategory {
  id: number;
  name: string;
  color: string;
}

export interface ApiExpense {
  id: number;
  description: string;
  category_id: number;
  category_name?: string;
  category_color?: string;
  amount: number;
  date: string;
  note?: string;
  receipt_image?: string;
  created_at?: string;
}

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

// ===== Error Handler =====
function handleError(error: any): never {
  throw new Error(error?.message || "حدث خطأ غير متوقع");
}

// ===== API =====
export const api = {
  // === Authentication ===
  login: async (email: string, password: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, role, avatar")
      .eq("email", email)
      .eq("password", password)
      .single();
    if (error || !data) throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    return data;
  },

  // === Backup & Restore ===
  backup: {
    exportUrl: () => "#",
    exportData: async () => {
      const tables = [
        "customers", "products", "contracts", "installments",
        "inventory_transactions", "expense_categories", "expenses",
        "users", "app_settings",
      ];
      const data: Record<string, any> = {};
      for (const table of tables) {
        const { data: rows } = await supabase.from(table).select("*");
        data[table] = rows || [];
      }
      data._metadata = {
        exportDate: new Date().toISOString(),
        version: "2.0-supabase",
        tablesCount: tables.length,
      };
      return data;
    },
    import: async (backupData: any) => {
      const validTables = [
        "app_settings", "expenses", "inventory_transactions",
        "installments", "contracts", "customers", "expense_categories",
        "products", "users",
      ];
      // Delete all data in reverse dependency order
      for (const table of validTables) {
        if (!backupData[table]) continue;
        if (table === "app_settings") {
          await supabase.from(table).delete().neq("key", "____nonexistent____");
        } else {
          await supabase.from(table).delete().gte("id", 0);
        }
      }
      // Insert data in dependency order (reversed from delete)
      const insertOrder = [
        "users", "products", "expense_categories", "customers",
        "contracts", "installments", "inventory_transactions",
        "expenses", "app_settings",
      ];
      for (const table of insertOrder) {
        if (backupData[table] && backupData[table].length > 0) {
          const { error } = await supabase.from(table).insert(backupData[table]);
          if (error) {
            console.error(`[backup] Error importing ${table}:`, error.message);
          }
        }
      }
      return { success: true };
    },
  },

  // === Nested API methods ===

  customers: {
    list: async (search?: string) => {
      let query = supabase.from("customers").select("*");
      if (search) {
        query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
      }
      const { data, error } = await query.order("id", { ascending: false });
      if (error) handleError(error);
      return data || [];
    },
    get: async (id: number) => {
      const { data, error } = await supabase.from("customers").select("*").eq("id", id).single();
      if (error || !data) throw new Error("العميل غير موجود");
      return data;
    },
    create: async (d: any) => {
      const { data, error } = await supabase
        .from("customers")
        .insert({
          name: d.name.trim(),
          phone: d.phone.trim(),
          national_id: d.nationalId || "",
          address: d.address || "",
          type: d.type || "customer",
          created_at: new Date().toISOString().split("T")[0],
        })
        .select()
        .single();
      if (error) handleError(error);
      return data;
    },
    update: async (id: number, d: any) => {
      const { data, error } = await supabase
        .from("customers")
        .update({
          name: d.name?.trim(),
          phone: d.phone?.trim(),
          national_id: d.nationalId || "",
          address: d.address || "",
          type: d.type || "customer",
        })
        .eq("id", id)
        .select()
        .single();
      if (error) handleError(error);
      return data;
    },
    delete: async (id: number) => {
      const { count } = await supabase
        .from("contracts")
        .select("*", { count: "exact", head: true })
        .eq("customer_id", id)
        .eq("status", "active");
      if (count && count > 0) {
        throw new Error(`لا يمكن حذف هذا العميل لأنه يرتبط بـ ${count} عقد(عقود) نشطة.`);
      }
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (error) handleError(error);
      return { success: true };
    },
  },

  contracts: {
    list: async (search?: string) => {
      let query = supabase.from("contracts").select("*");
      if (search) {
        query = query.or(
          `customer_name.ilike.%${search}%,product_type.ilike.%${search}%,customer_phone.ilike.%${search}%`
        );
      }
      const { data, error } = await query.order("id", { ascending: false });
      if (error) handleError(error);
      return data || [];
    },
    get: async (id: number) => {
      const { data, error } = await supabase.from("contracts").select("*").eq("id", id).single();
      if (error || !data) throw new Error("العقد غير موجود");
      return data;
    },
    create: async (d: any) => {
      // Look up guarantor info
      let guarantorName = "";
      let guarantorPhone = "";
      if (d.guarantorId) {
        const { data: guarantor } = await supabase
          .from("customers").select("name, phone").eq("id", d.guarantorId).single();
        if (guarantor) { guarantorName = guarantor.name; guarantorPhone = guarantor.phone; }
      }

      // Check product stock
      if (d.productId) {
        const { data: product } = await supabase
          .from("products").select("current_stock").eq("id", d.productId).single();
        if (!product) throw new Error("المنتج غير موجود");
        if (product.current_stock <= 0) throw new Error("المخزون غير متوفر لهذا المنتج");
      }

      // Insert contract
      const { data: contract, error: cErr } = await supabase
        .from("contracts")
        .insert({
          customer_id: d.customerId || null,
          customer_name: d.customerName,
          customer_phone: d.customerPhone,
          product_type: d.productType,
          product_id: d.productId || null,
          total_price: d.totalPrice || 0,
          down_payment: d.downPayment || 0,
          number_of_receipts: d.numberOfReceipts || 1,
          installment_amount: d.installmentAmount || 0,
          start_date: d.startDate,
          end_date: d.endDate || d.startDate,
          status: "active",
          guarantor_name: guarantorName,
          guarantor_phone: guarantorPhone,
          created_at: new Date().toISOString().split("T")[0],
        })
        .select()
        .single();
      if (cErr) handleError(cErr);

      // Create installments
      const start = new Date(d.startDate);
      const installments = [];
      for (let i = 0; i < d.numberOfReceipts; i++) {
        const due = new Date(start);
        due.setMonth(due.getMonth() + i + 1);
        installments.push({
          contract_id: contract.id,
          number: i + 1,
          amount: d.installmentAmount,
          due_date: due.toISOString().split("T")[0],
          is_paid: 0,
          day: due.getDate(),
          month: due.getMonth() + 1,
          year: due.getFullYear(),
        });
      }
      const { error: iErr } = await supabase.from("installments").insert(installments);
      if (iErr) handleError(iErr);

      // Update stock and create inventory transaction
      if (d.productId) {
        await supabase.rpc("decrement_product_stock", { product_id: d.productId, qty: 1 });
        await supabase.from("inventory_transactions").insert({
          product_id: d.productId,
          type: "sale",
          quantity: -1,
          unit_price: (d.totalPrice || 0) / (d.numberOfReceipts || 1),
          total: -(d.totalPrice || 0),
          date: new Date().toISOString().split("T")[0],
          reference: `عقد #${contract.id}`,
          notes: `بيع تلقائي - ${d.customerName}`,
        });
      }

      return contract;
    },
    update: async (id: number, d: any) => {
      const updateData: any = {};
      if (d.status) updateData.status = d.status;
      if (d.guarantorId !== undefined) {
        if (d.guarantorId) {
          const { data: g } = await supabase
            .from("customers").select("name, phone").eq("id", d.guarantorId).single();
          if (g) { updateData.guarantor_name = g.name; updateData.guarantor_phone = g.phone; }
        } else {
          updateData.guarantor_name = "";
          updateData.guarantor_phone = "";
        }
      }
      const { data, error } = await supabase.from("contracts").update(updateData).eq("id", id).select().single();
      if (error) handleError(error);
      return data;
    },
    delete: async (id: number) => {
      const { data: contract } = await supabase.from("contracts").select("*").eq("id", id).single();
      if (!contract) throw new Error("العقد غير موجود");

      // Restore stock
      if (contract.product_id) {
        await supabase.rpc("increment_product_stock", { product_id: contract.product_id, qty: 1 });
        await supabase.from("inventory_transactions").insert({
          product_id: contract.product_id,
          type: "return",
          quantity: 1,
          unit_price: (contract.total_price || 0) / (contract.number_of_receipts || 1),
          total: contract.total_price,
          date: new Date().toISOString().split("T")[0],
          reference: `حذف عقد #${contract.id}`,
          notes: `استرجاع مخزون - ${contract.customer_name}`,
        });
      }

      // Delete installments then contract
      await supabase.from("installments").delete().eq("contract_id", id);
      const { error } = await supabase.from("contracts").delete().eq("id", id);
      if (error) handleError(error);
      return { success: true };
    },
  },

  installments: {
    list: async (params?: { contractId?: number; isPaid?: string }) => {
      let query = supabase.from("installments").select("*");
      if (params?.contractId) query = query.eq("contract_id", params.contractId);
      if (params?.isPaid !== undefined) query = query.eq("is_paid", params.isPaid === "true" ? 1 : 0);
      const { data, error } = await query.order(params?.contractId ? "number" : "id", { ascending: !!params?.contractId });
      if (error) handleError(error);
      return data || [];
    },
    update: async (id: number, d: any) => {
      const updateData: any = {};
      if (d.isPaid !== undefined) updateData.is_paid = d.isPaid ? 1 : 0;
      if (d.paidDate !== undefined) updateData.paid_date = d.paidDate;
      const { data, error } = await supabase.from("installments").update(updateData).eq("id", id).select().single();
      if (error) handleError(error);
      return data;
    },
    delete: async (id: number) => {
      const { error } = await supabase.from("installments").delete().eq("id", id);
      if (error) handleError(error);
      return { success: true };
    },
  },

  products: {
    list: async (search?: string) => {
      let query = supabase.from("products").select("*");
      if (search) query = query.or(`name.ilike.%${search}%,category.ilike.%${search}%`);
      const { data, error } = await query.order("id", { ascending: false });
      if (error) handleError(error);
      return data || [];
    },
    create: async (d: any) => {
      const { data, error } = await supabase
        .from("products")
        .insert({
          name: d.name.trim(),
          category: d.category.trim(),
          unit: d.unit || "قطعة",
          cost_price: d.costPrice || 0,
          selling_price: d.sellingPrice || 0,
          current_stock: d.currentStock || 0,
          min_stock: d.minStock || 0,
          created_at: new Date().toISOString().split("T")[0],
        })
        .select()
        .single();
      if (error) handleError(error);
      return data;
    },
    update: async (id: number, d: any) => {
      const { data, error } = await supabase
        .from("products")
        .update({
          name: d.name?.trim(),
          category: d.category?.trim(),
          unit: d.unit || "قطعة",
          cost_price: d.costPrice || 0,
          selling_price: d.sellingPrice || 0,
          current_stock: d.currentStock || 0,
          min_stock: d.minStock || 0,
        })
        .eq("id", id)
        .select()
        .single();
      if (error) handleError(error);
      return data;
    },
    delete: async (id: number) => {
      const { count } = await supabase
        .from("contracts")
        .select("*", { count: "exact", head: true })
        .eq("product_id", id)
        .eq("status", "active");
      if (count && count > 0) {
        throw new Error(`لا يمكن حذف هذا المنتج لأنه مرتبط بـ ${count} عقد(عقود) نشطة`);
      }
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) handleError(error);
      return { success: true };
    },
  },

  inventory: {
    list: async () => {
      const { data, error } = await supabase
        .from("inventory_transactions")
        .select("*, products(name)")
        .order("id", { ascending: false });
      if (error) handleError(error);
      return (data || []).map((t: any) => ({
        ...t,
        product_name: t.products?.name || "غير معروف",
        products: undefined,
      }));
    },
    create: async (d: any) => {
      // Check stock for sales
      if (d.type === "sale") {
        const { data: product } = await supabase
          .from("products").select("current_stock").eq("id", d.productId).single();
        if (!product || product.current_stock < d.quantity) {
          throw new Error(`المخزون غير كافٍ. المتوفر: ${product?.current_stock || 0}`);
        }
      }
      const total = d.quantity * (d.unitPrice || 0);
      const { data: txn, error: tErr } = await supabase
        .from("inventory_transactions")
        .insert({
          product_id: d.productId,
          type: d.type,
          quantity: d.quantity,
          unit_price: d.unitPrice || 0,
          total,
          date: new Date().toISOString().split("T")[0],
          reference: d.reference || "",
          notes: d.notes || "",
        })
        .select()
        .single();
      if (tErr) handleError(tErr);

      // Update stock
      const qtyChange = (d.type === "purchase" || d.type === "return") ? Math.abs(d.quantity) : -Math.abs(d.quantity);
      await supabase.rpc("update_product_stock", { product_id: d.productId, qty_change: qtyChange });
      return txn;
    },
  },

  expenseCategories: {
    list: async () => {
      const { data, error } = await supabase.from("expense_categories").select("*").order("id", { ascending: true });
      if (error) handleError(error);
      return data || [];
    },
  },

  expenses: {
    list: async (search?: string, categoryId?: number) => {
      let query = supabase.from("expenses").select("*, expense_categories(name, color)");
      if (search) query = query.ilike("description", `%${search}%`);
      if (categoryId) query = query.eq("category_id", categoryId);
      const { data, error } = await query.order("id", { ascending: false });
      if (error) handleError(error);
      return (data || []).map((e: any) => ({
        ...e,
        category_name: e.expense_categories?.name || "أخرى",
        category_color: e.expense_categories?.color || "bg-slate-100 text-slate-700",
        expense_categories: undefined,
      }));
    },
    create: async (d: any) => {
      const { data, error } = await supabase
        .from("expenses")
        .insert({
          description: d.description.trim(),
          category_id: d.categoryId,
          amount: d.amount,
          date: d.date,
          note: d.note || "",
          receipt_image: d.receiptImage || null,
          created_at: new Date().toISOString().split("T")[0],
        })
        .select()
        .single();
      if (error) handleError(error);
      return data;
    },
    update: async (id: number, d: any) => {
      const { data, error } = await supabase
        .from("expenses")
        .update({
          description: d.description || "",
          category_id: d.categoryId || null,
          amount: d.amount || 0,
          date: d.date || "",
          note: d.note || "",
          receipt_image: d.receiptImage || null,
        })
        .eq("id", id)
        .select()
        .single();
      if (error) handleError(error);
      return data;
    },
    delete: async (id: number) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) handleError(error);
      return { success: true };
    },
  },

  users: {
    list: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, role, avatar")
        .order("id", { ascending: false });
      if (error) handleError(error);
      return data || [];
    },
    create: async (d: any) => {
      const { data: existing } = await supabase
        .from("users").select("id").eq("email", d.email.trim()).maybeSingle();
      if (existing) throw new Error("البريد الإلكتروني مستخدم بالفعل");

      const { data, error } = await supabase
        .from("users")
        .insert({
          name: d.name.trim(),
          email: d.email.trim(),
          password: d.password,
          role: d.role || "collector",
        })
        .select("id, name, email, role, avatar")
        .single();
      if (error) handleError(error);
      return data;
    },
    update: async (id: number, d: any) => {
      if (d.email) {
        const { data: existing } = await supabase
          .from("users").select("id").eq("email", d.email.trim()).neq("id", id).maybeSingle();
        if (existing) throw new Error("البريد الإلكتروني مستخدم بالفعل لمستخدم آخر");
      }
      const updateData: any = {
        name: d.name?.trim(),
        email: d.email?.trim(),
        role: d.role || "collector",
      };
      if (d.password) updateData.password = d.password;

      const { data, error } = await supabase
        .from("users").update(updateData).eq("id", id)
        .select("id, name, email, role, avatar").single();
      if (error) handleError(error);
      return data;
    },
    changePassword: async (id: number, currentPassword: string, newPassword: string) => {
      const { data: user } = await supabase.from("users").select("password").eq("id", id).single();
      if (!user) throw new Error("المستخدم غير موجود");
      if (user.password !== currentPassword) throw new Error("كلمة المرور الحالية غير صحيحة");
      const { error } = await supabase.from("users").update({ password: newPassword }).eq("id", id);
      if (error) handleError(error);
      return { success: true };
    },
    delete: async (id: number) => {
      const { data: user } = await supabase.from("users").select("role").eq("id", id).single();
      if (!user) throw new Error("المستخدم غير موجود");
      if (user.role === "admin") {
        const { count } = await supabase
          .from("users").select("*", { count: "exact", head: true }).eq("role", "admin");
        if (count && count <= 1) throw new Error("لا يمكن حذف آخر مدير في النظام");
      }
      const { error } = await supabase.from("users").delete().eq("id", id);
      if (error) handleError(error);
      return { success: true };
    },
  },

  settings: {
    get: async (key: string) => {
      const { data, error } = await supabase.from("app_settings").select("value").eq("key", key).single();
      if (error || !data) return null;
      return data.value;
    },
    set: async (key: string, data: any) => {
      const { error } = await supabase.from("app_settings").upsert({ key, value: data });
      if (error) handleError(error);
      return { success: true };
    },
  },

  // === Flat legacy methods ===
  getCustomers: (params?: { search?: string; type?: string }) =>
    api.customers.list(params?.search),
  getCustomer: (id: number) => api.customers.get(id),
  createCustomer: (data: any) => api.customers.create(data),
  updateCustomer: (id: number, data: any) => api.customers.update(id, data),
  deleteCustomer: (id: number) => api.customers.delete(id),

  getContracts: (params?: { search?: string; status?: string }) =>
    api.contracts.list(params?.search),
  getContract: (id: number) => api.contracts.get(id),
  createContract: (data: any) => api.contracts.create(data),
  updateContract: (id: number, data: any) => api.contracts.update(id, data),
  deleteContract: (id: number) => api.contracts.delete(id),

  getInstallments: (params?: { contractId?: number; isPaid?: string }) =>
    api.installments.list(params),
  updateInstallment: (id: number, data: any) => api.installments.update(id, data),
  deleteInstallment: (id: number) => api.installments.delete(id),

  getProducts: (params?: { search?: string }) =>
    api.products.list(params?.search),
  createProduct: (data: any) => api.products.create(data),
  updateProduct: (id: number, data: any) => api.products.update(id, data),
  deleteProduct: (id: number) => api.products.delete(id),

  getInventory: () => api.inventory.list(),
  createInventoryTransaction: (data: any) => api.inventory.create(data),

  getExpenseCategories: () => api.expenseCategories.list(),
  getExpenses: (params?: { search?: string; categoryId?: number }) =>
    api.expenses.list(params?.search, params?.categoryId),
  createExpense: (data: any) => api.expenses.create(data),
  updateExpense: (id: number, data: any) => api.expenses.update(id, data),
  deleteExpense: (id: number) => api.expenses.delete(id),

  getUsers: () => api.users.list(),
  createUser: (data: any) => api.users.create(data),
  updateUser: (id: number, data: any) => api.users.update(id, data),
  updateUserPassword: (id: number, currentPassword: string, newPassword: string) =>
    api.users.changePassword(id, currentPassword, newPassword),
  deleteUser: (id: number) => api.users.delete(id),

  getSettings: (key: string) => api.settings.get(key),
  updateSettings: (key: string, data: any) => api.settings.set(key, data),
};
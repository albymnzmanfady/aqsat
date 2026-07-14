import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { supabase } from "./supabase.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Helper to handle errors
const handleError = (res: any, error: any) => {
  console.error("Server error:", error);
  res.status(500).json({ error: error.message || "حدث خطأ في الخادم" });
};

// ============ CUSTOMERS ============
app.get("/api/customers", async (req, res) => {
  try {
    const { search, type } = req.query;
    let query = supabase.from("customers").select("*");
    if (search) { query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`); }
    if (type) { query = query.eq("type", type); }
    query = query.order("id", { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (e: any) { handleError(res, e); }
});

app.get("/api/customers/:id", async (req, res) => {
  try {
    const { data, error } = await supabase.from("customers").select("*").eq("id", req.params.id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "غير موجود" });
    res.json(data);
  } catch (e: any) { handleError(res, e); }
});

app.post("/api/customers", async (req, res) => {
  try {
    const { name, phone, nationalId, address, type } = req.body;
    const { data, error } = await supabase.from("customers").insert({
      name, phone, national_id: nationalId || "", address: address || "", type: type || "customer"
    }).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e: any) {
    if (e.message?.includes("duplicate")) {
      return res.status(400).json({ error: "هذا البريد موجود مسبقاً" });
    }
    handleError(res, e);
  }
});

app.put("/api/customers/:id", async (req, res) => {
  try {
    const { name, phone, nationalId, address, type } = req.body;
    const { data, error } = await supabase.from("customers").update({
      name, phone, national_id: nationalId || "", address: address || "", type
    }).eq("id", req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e: any) { handleError(res, e); }
});

app.delete("/api/customers/:id", async (req, res) => {
  try {
    const { error } = await supabase.from("customers").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (e: any) { handleError(res, e); }
});

// ============ CONTRACTS ============
app.get("/api/contracts", async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = supabase.from("contracts").select("*");
    if (search) { query = query.or(`customer_name.ilike.%${search}%,product_type.ilike.%${search}%`); }
    if (status) { query = query.eq("status", status); }
    query = query.order("id", { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (e: any) { handleError(res, e); }
});

app.get("/api/contracts/:id", async (req, res) => {
  try {
    const { data, error } = await supabase.from("contracts").select("*").eq("id", req.params.id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "غير موجود" });
    res.json(data);
  } catch (e: any) { handleError(res, e); }
});

app.post("/api/contracts", async (req, res) => {
  try {
    const {
      customerId, customerName, customerPhone, productType, productId,
      totalPrice, downPayment, numberOfReceipts, installmentAmount,
      startDate, endDate, guarantorName, guarantorPhone, status
    } = req.body;

    const { data: contract, error: contractError } = await supabase.from("contracts").insert({
      customer_id: customerId, customer_name: customerName, customer_phone: customerPhone,
      product_type: productType, product_id: productId || null, total_price: totalPrice,
      down_payment: downPayment || 0, number_of_receipts: numberOfReceipts,
      installment_amount: installmentAmount, start_date: startDate, end_date: endDate,
      status: status || "active", guarantor_name: guarantorName || "", guarantor_phone: guarantorPhone || ""
    }).select().single();

    if (contractError) throw contractError;

    // Generate installments
    const start = new Date(startDate);
    const installments = [];
    for (let i = 0; i < numberOfReceipts; i++) {
      const due = new Date(start);
      due.setMonth(due.getMonth() + i + 1);
      installments.push({
        contract_id: contract.id,
        number: i + 1,
        amount: installmentAmount,
        due_date: due.toISOString().split("T")[0],
        is_paid: 0,
        day: due.getDate(),
        month: due.getMonth() + 1,
        year: due.getFullYear()
      });
    }

    if (installments.length > 0) {
      const { error: instError } = await supabase.from("installments").insert(installments);
      if (instError) throw instError;
    }

    // Deduct product stock
    if (productId) {
      await supabase.rpc("decrement_product_stock", { product_id: productId, qty: 1 });
    }

    res.json(contract);
  } catch (e: any) { handleError(res, e); }
});

app.put("/api/contracts/:id", async (req, res) => {
  try {
    const {
      customerId, customerName, customerPhone, productType, productId,
      totalPrice, downPayment, numberOfReceipts, installmentAmount,
      startDate, endDate, guarantorName, guarantorPhone, status
    } = req.body;
    const { data, error } = await supabase.from("contracts").update({
      customer_id: customerId, customer_name: customerName, customer_phone: customerPhone,
      product_type: productType, product_id: productId || null, total_price: totalPrice,
      down_payment: downPayment || 0, number_of_receipts: numberOfReceipts,
      installment_amount: installmentAmount, start_date: startDate, end_date: endDate,
      status, guarantor_name: guarantorName || "", guarantor_phone: guarantorPhone || ""
    }).eq("id", req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e: any) { handleError(res, e); }
});

app.delete("/api/contracts/:id", async (req, res) => {
  try {
    const { data: contract } = await supabase.from("contracts").select("product_id").eq("id", req.params.id).single();
    if (contract?.product_id) {
      await supabase.rpc("increment_product_stock", { product_id: contract.product_id, qty: 1 });
    }
    await supabase.from("installments").delete().eq("contract_id", req.params.id);
    const { error } = await supabase.from("contracts").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (e: any) { handleError(res, e); }
});

// ============ INSTALLMENTS ============
app.get("/api/installments", async (req, res) => {
  try {
    const { contractId, isPaid } = req.query;
    let query = supabase.from("installments").select("*");
    if (contractId) { query = query.eq("contract_id", contractId); }
    if (isPaid !== undefined) { query = query.eq("is_paid", isPaid === "true" ? 1 : 0); }
    query = query.order("year").order("month").order("day");
    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (e: any) { handleError(res, e); }
});

app.put("/api/installments/:id", async (req, res) => {
  try {
    const { isPaid, paidDate } = req.body;
    const { data, error } = await supabase.from("installments").update({
      is_paid: isPaid ? 1 : 0, paid_date: paidDate || null
    }).eq("id", req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e: any) { handleError(res, e); }
});

app.post("/api/installments", async (req, res) => {
  try {
    const { contractId, number, amount, dueDate, day, month, year } = req.body;
    const { data, error } = await supabase.from("installments").insert({
      contract_id: contractId, number, amount, due_date: dueDate, is_paid: 0, day, month, year
    }).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e: any) { handleError(res, e); }
});

app.delete("/api/installments/:id", async (req, res) => {
  try {
    const { error } = await supabase.from("installments").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (e: any) { handleError(res, e); }
});

// ============ PRODUCTS ============
app.get("/api/products", async (req, res) => {
  try {
    const { search } = req.query;
    let query = supabase.from("products").select("*");
    if (search) { query = query.or(`name.ilike.%${search}%,category.ilike.%${search}%`); }
    query = query.order("id", { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (e: any) { handleError(res, e); }
});

app.post("/api/products", async (req, res) => {
  try {
    const { name, category, unit, costPrice, sellingPrice, currentStock, minStock } = req.body;
    const { data, error } = await supabase.from("products").insert({
      name, category: category || "", unit: unit || "قطعة", cost_price: costPrice,
      selling_price: sellingPrice, current_stock: currentStock || 0, min_stock: minStock || 0
    }).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e: any) { handleError(res, e); }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const { name, category, unit, costPrice, sellingPrice, currentStock, minStock } = req.body;
    const { data, error } = await supabase.from("products").update({
      name, category, unit, cost_price: costPrice, selling_price: sellingPrice,
      current_stock: currentStock, min_stock: minStock
    }).eq("id", req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e: any) { handleError(res, e); }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const { error } = await supabase.from("products").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (e: any) { handleError(res, e); }
});

// ============ INVENTORY ============
app.get("/api/inventory", async (req, res) => {
  try {
    const { search, type } = req.query;
    let query = supabase.from("inventory_transactions").select("*, products!inner(name)");
    if (search) { query = query.or(`products.name.ilike.%${search}%,reference.ilike.%${search}%`); }
    if (type && type !== "all") { query = query.eq("type", type); }
    query = query.order("id", { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    // Transform to match frontend expectation
    const transformed = (data || []).map((t: any) => ({
      ...t, product_name: t.products?.name || "غير معروف"
    }));
    res.json(transformed);
  } catch (e: any) { handleError(res, e); }
});

app.post("/api/inventory", async (req, res) => {
  try {
    const { productId, type, quantity, unitPrice, reference, notes } = req.body;
    const qty = type === "purchase" || type === "return" ? Math.abs(quantity) : -Math.abs(quantity);
    const total = qty * unitPrice;
    const { data, error } = await supabase.from("inventory_transactions").insert({
      product_id: productId, type, quantity: qty, unit_price: unitPrice, total,
      reference: reference || "", notes: notes || ""
    }).select().single();
    if (error) throw error;

    // Update product stock
    await supabase.rpc("update_product_stock", { product_id: productId, qty_change: qty });

    res.json(data);
  } catch (e: any) { handleError(res, e); }
});

// ============ EXPENSES ============
app.get("/api/expense-categories", async (_req, res) => {
  try {
    const { data, error } = await supabase.from("expense_categories").select("*").order("id");
    if (error) throw error;
    res.json(data || []);
  } catch (e: any) { handleError(res, e); }
});

app.get("/api/expenses", async (req, res) => {
  try {
    const { search, categoryId } = req.query;
    let query = supabase.from("expenses").select("*, expense_categories!inner(name, color)");
    if (search) { query = query.or(`description.ilike.%${search}%,note.ilike.%${search}%`); }
    if (categoryId) { query = query.eq("category_id", categoryId); }
    query = query.order("id", { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    const transformed = (data || []).map((e: any) => ({
      ...e,
      category_name: e.expense_categories?.name,
      category_color: e.expense_categories?.color
    }));
    res.json(transformed);
  } catch (e: any) { handleError(res, e); }
});

app.post("/api/expenses", async (req, res) => {
  try {
    const { description, categoryId, amount, date, note, receiptImage } = req.body;
    const { data, error } = await supabase.from("expenses").insert({
      description, category_id: categoryId, amount, date, note: note || "", receipt_image: receiptImage || null
    }).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e: any) { handleError(res, e); }
});

app.put("/api/expenses/:id", async (req, res) => {
  try {
    const { description, categoryId, amount, date, note, receiptImage } = req.body;
    const { data, error } = await supabase.from("expenses").update({
      description, category_id: categoryId, amount, date, note: note || "", receipt_image: receiptImage || null
    }).eq("id", req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e: any) { handleError(res, e); }
});

app.delete("/api/expenses/:id", async (req, res) => {
  try {
    const { error } = await supabase.from("expenses").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (e: any) { handleError(res, e); }
});

// ============ USERS ============
app.get("/api/users", async (_req, res) => {
  try {
    const { data, error } = await supabase.from("users").select("id, name, email, role, avatar").order("id");
    if (error) throw error;
    res.json(data || []);
  } catch (e: any) { handleError(res, e); }
});

app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.from("users").select("id, name, email, role, avatar")
      .eq("email", email).eq("password", password).single();
    if (error || !data) return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    res.json(data);
  } catch (e: any) { handleError(res, e); }
});

app.post("/api/users", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const { data, error } = await supabase.from("users").insert({
      name, email, password, role: role || "collector"
    }).select("id, name, email, role, avatar").single();
    if (error) {
      if (error.message?.includes("duplicate")) {
        return res.status(400).json({ error: "البريد الإلكتروني موجود مسبقاً" });
      }
      throw error;
    }
    res.json(data);
  } catch (e: any) { handleError(res, e); }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const updateData: any = { name, email, role };
    if (password) updateData.password = password;
    const { data, error } = await supabase.from("users").update(updateData)
      .eq("id", req.params.id).select("id, name, email, role, avatar").single();
    if (error) throw error;
    res.json(data);
  } catch (e: any) { handleError(res, e); }
});

app.put("/api/users/:id/password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { data: user, error: fetchError } = await supabase.from("users")
      .select("id, password").eq("id", req.params.id).single();
    if (fetchError || !user) return res.status(404).json({ error: "المستخدم غير موجود" });
    if (user.password !== currentPassword) return res.status(400).json({ error: "كلمة المرور الحالية غير صحيحة" });
    const { error } = await supabase.from("users").update({ password: newPassword }).eq("id", req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (e: any) { handleError(res, e); }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const { error } = await supabase.from("users").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (e: any) { handleError(res, e); }
});

// ============ SETTINGS ============
app.get("/api/settings/:key", async (req, res) => {
  try {
    const { data, error } = await supabase.from("app_settings").select("value").eq("key", req.params.key).single();
    if (error && error.code !== "PGRST116") throw error;
    res.json(data ? data.value : null);
  } catch (e: any) { handleError(res, e); }
});

app.put("/api/settings/:key", async (req, res) => {
  try {
    const { error } = await supabase.from("app_settings").upsert({
      key: req.params.key, value: req.body
    }, { onConflict: "key" });
    if (error) throw error;
    res.json({ success: true });
  } catch (e: any) { handleError(res, e); }
});

// ============ Serve Static Files (Production) ============
const distPath = path.join(process.cwd(), "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Using Supabase database`);
});
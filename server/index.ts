import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import db, { initDatabase, seedDatabase } from "./db.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Initialize database
initDatabase();
seedDatabase();

// ============ CUSTOMERS ============
app.get("/api/customers", (req, res) => {
  try {
    const { search, type } = req.query;
    let query = "SELECT * FROM customers WHERE 1=1";
    const params: any[] = [];
    if (search) { query += " AND (name LIKE ? OR phone LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }
    if (type) { query += " AND type = ?"; params.push(type); }
    query += " ORDER BY id DESC";
    res.json(db.prepare(query).all(...params));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/customers/:id", (req, res) => {
  try {
    const customer = db.prepare("SELECT * FROM customers WHERE id = ?").get(req.params.id);
    if (!customer) return res.status(404).json({ error: "Not found" });
    res.json(customer);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/customers", (req, res) => {
  try {
    const { name, phone, nationalId, address, type } = req.body;
    const result = db.prepare(
      "INSERT INTO customers (name, phone, national_id, address, type, created_at) VALUES (?, ?, ?, ?, ?, date('now'))"
    ).run(name, phone, nationalId || "", address || "", type || "customer");
    const customer = db.prepare("SELECT * FROM customers WHERE id = ?").get(result.lastInsertRowid);
    res.json(customer);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/customers/:id", (req, res) => {
  try {
    const { name, phone, nationalId, address, type } = req.body;
    db.prepare("UPDATE customers SET name=?, phone=?, national_id=?, address=?, type=? WHERE id=?")
      .run(name, phone, nationalId || "", address || "", type || "customer", req.params.id);
    const customer = db.prepare("SELECT * FROM customers WHERE id = ?").get(req.params.id);
    res.json(customer);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/customers/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM customers WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ============ CONTRACTS ============
app.get("/api/contracts", (req, res) => {
  try {
    const { search, status } = req.query;
    let query = "SELECT * FROM contracts WHERE 1=1";
    const params: any[] = [];
    if (search) { query += " AND (customer_name LIKE ? OR product_type LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }
    if (status) { query += " AND status = ?"; params.push(status); }
    query += " ORDER BY id DESC";
    res.json(db.prepare(query).all(...params));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/contracts/:id", (req, res) => {
  try {
    const contract = db.prepare("SELECT * FROM contracts WHERE id = ?").get(req.params.id);
    if (!contract) return res.status(404).json({ error: "Not found" });
    res.json(contract);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/contracts", (req, res) => {
  try {
    const {
      customerId, customerName, customerPhone, productType, productId,
      totalPrice, downPayment, numberOfReceipts, installmentAmount,
      startDate, endDate, guarantorName, guarantorPhone, status
    } = req.body;

    const result = db.prepare(
      `INSERT INTO contracts (customer_id, customer_name, customer_phone, product_type, product_id, total_price, down_payment, number_of_receipts, installment_amount, start_date, end_date, status, guarantor_name, guarantor_phone, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, date('now'))`
    ).run(customerId, customerName, customerPhone, productType, productId || null,
      totalPrice, downPayment || 0, numberOfReceipts, installmentAmount,
      startDate, endDate, status || "active", guarantorName || "", guarantorPhone || "");

    const contractId = result.lastInsertRowid;

    // Generate installments
    const start = new Date(startDate);
    const insertInst = db.prepare(
      "INSERT INTO installments (contract_id, number, amount, due_date, is_paid, day, month, year) VALUES (?, ?, ?, ?, 0, ?, ?, ?)"
    );
    for (let i = 0; i < numberOfReceipts; i++) {
      const due = new Date(start);
      due.setMonth(due.getMonth() + i + 1);
      const dueDateStr = due.toISOString().split("T")[0];
      insertInst.run(contractId, i + 1, installmentAmount, dueDateStr, due.getDate(), due.getMonth() + 1, due.getFullYear());
    }

    // Deduct product stock
    if (productId) {
      db.prepare("UPDATE products SET current_stock = current_stock - 1 WHERE id = ?").run(productId);
    }

    const contract = db.prepare("SELECT * FROM contracts WHERE id = ?").get(contractId);
    res.json(contract);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/contracts/:id", (req, res) => {
  try {
    const {
      customerId, customerName, customerPhone, productType, productId,
      totalPrice, downPayment, numberOfReceipts, installmentAmount,
      startDate, endDate, guarantorName, guarantorPhone, status
    } = req.body;
    db.prepare(
      `UPDATE contracts SET customer_id=?, customer_name=?, customer_phone=?, product_type=?, product_id=?,
       total_price=?, down_payment=?, number_of_receipts=?, installment_amount=?, start_date=?, end_date=?,
       status=?, guarantor_name=?, guarantor_phone=? WHERE id=?`
    ).run(customerId, customerName, customerPhone, productType, productId || null,
      totalPrice, downPayment || 0, numberOfReceipts, installmentAmount,
      startDate, endDate, status, guarantorName || "", guarantorPhone || "", req.params.id);
    const contract = db.prepare("SELECT * FROM contracts WHERE id = ?").get(req.params.id);
    res.json(contract);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/contracts/:id", (req, res) => {
  try {
    const contract = db.prepare("SELECT * FROM contracts WHERE id = ?").get(req.params.id) as any;
    if (contract?.product_id) {
      db.prepare("UPDATE products SET current_stock = current_stock + 1 WHERE id = ?").run(contract.product_id);
    }
    db.prepare("DELETE FROM installments WHERE contract_id = ?").run(req.params.id);
    db.prepare("DELETE FROM contracts WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ============ INSTALLMENTS ============
app.get("/api/installments", (req, res) => {
  try {
    const { contractId, isPaid } = req.query;
    let query = "SELECT * FROM installments WHERE 1=1";
    const params: any[] = [];
    if (contractId) { query += " AND contract_id = ?"; params.push(contractId); }
    if (isPaid !== undefined) { query += " AND is_paid = ?"; params.push(isPaid === "true" ? 1 : 0); }
    query += " ORDER BY year, month, day";
    res.json(db.prepare(query).all(...params));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/installments/:id", (req, res) => {
  try {
    const { isPaid, paidDate } = req.body;
    db.prepare("UPDATE installments SET is_paid=?, paid_date=? WHERE id=?")
      .run(isPaid ? 1 : 0, paidDate || null, req.params.id);
    const inst = db.prepare("SELECT * FROM installments WHERE id = ?").get(req.params.id);
    res.json(inst);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/installments", (req, res) => {
  try {
    const { contractId, number, amount, dueDate, day, month, year } = req.body;
    const result = db.prepare(
      "INSERT INTO installments (contract_id, number, amount, due_date, is_paid, day, month, year) VALUES (?, ?, ?, ?, 0, ?, ?, ?)"
    ).run(contractId, number, amount, dueDate, day, month, year);
    const inst = db.prepare("SELECT * FROM installments WHERE id = ?").get(result.lastInsertRowid);
    res.json(inst);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/installments/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM installments WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ============ PRODUCTS ============
app.get("/api/products", (req, res) => {
  try {
    const { search } = req.query;
    let query = "SELECT * FROM products WHERE 1=1";
    const params: any[] = [];
    if (search) { query += " AND (name LIKE ? OR category LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }
    query += " ORDER BY id DESC";
    res.json(db.prepare(query).all(...params));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/products", (req, res) => {
  try {
    const { name, category, unit, costPrice, sellingPrice, currentStock, minStock } = req.body;
    const result = db.prepare(
      "INSERT INTO products (name, category, unit, cost_price, selling_price, current_stock, min_stock, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, date('now'))"
    ).run(name, category || "", unit || "قطعة", costPrice, sellingPrice, currentStock || 0, minStock || 0);
    res.json(db.prepare("SELECT * FROM products WHERE id = ?").get(result.lastInsertRowid));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/products/:id", (req, res) => {
  try {
    const { name, category, unit, costPrice, sellingPrice, currentStock, minStock } = req.body;
    db.prepare("UPDATE products SET name=?, category=?, unit=?, cost_price=?, selling_price=?, current_stock=?, min_stock=? WHERE id=?")
      .run(name, category, unit, costPrice, sellingPrice, currentStock, minStock, req.params.id);
    res.json(db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/products/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ============ INVENTORY ============
app.get("/api/inventory", (req, res) => {
  try {
    const { search, type } = req.query;
    let query = "SELECT t.*, p.name as product_name FROM inventory_transactions t LEFT JOIN products p ON t.product_id = p.id WHERE 1=1";
    const params: any[] = [];
    if (search) { query += " AND (p.name LIKE ? OR t.reference LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }
    if (type && type !== "all") { query += " AND t.type = ?"; params.push(type); }
    query += " ORDER BY t.id DESC";
    res.json(db.prepare(query).all(...params));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/inventory", (req, res) => {
  try {
    const { productId, type, quantity, unitPrice, reference, notes } = req.body;
    const qty = type === "purchase" || type === "return" ? Math.abs(quantity) : -Math.abs(quantity);
    const total = qty * unitPrice;
    const result = db.prepare(
      "INSERT INTO inventory_transactions (product_id, type, quantity, unit_price, total, date, reference, notes, created_at) VALUES (?, ?, ?, ?, ?, date('now'), ?, ?, date('now'))"
    ).run(productId, type, qty, unitPrice, total, reference || "", notes || "");
    db.prepare("UPDATE products SET current_stock = current_stock + ? WHERE id = ?").run(qty, productId);
    res.json(db.prepare("SELECT t.*, p.name as product_name FROM inventory_transactions t LEFT JOIN products p ON t.product_id = p.id WHERE t.id = ?").get(result.lastInsertRowid));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ============ EXPENSES ============
app.get("/api/expense-categories", (_req, res) => {
  try {
    res.json(db.prepare("SELECT * FROM expense_categories ORDER BY id").all());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/expenses", (req, res) => {
  try {
    const { search, categoryId } = req.query;
    let query = "SELECT e.*, c.name as category_name, c.color as category_color FROM expenses e LEFT JOIN expense_categories c ON e.category_id = c.id WHERE 1=1";
    const params: any[] = [];
    if (search) { query += " AND (e.description LIKE ? OR e.note LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }
    if (categoryId) { query += " AND e.category_id = ?"; params.push(categoryId); }
    query += " ORDER BY e.id DESC";
    res.json(db.prepare(query).all(...params));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/expenses", (req, res) => {
  try {
    const { description, categoryId, amount, date, note, receiptImage } = req.body;
    const result = db.prepare(
      "INSERT INTO expenses (description, category_id, amount, date, note, receipt_image, created_at) VALUES (?, ?, ?, ?, ?, ?, date('now'))"
    ).run(description, categoryId, amount, date, note || "", receiptImage || null);
    res.json(db.prepare("SELECT * FROM expenses WHERE id = ?").get(result.lastInsertRowid));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/expenses/:id", (req, res) => {
  try {
    const { description, categoryId, amount, date, note, receiptImage } = req.body;
    db.prepare("UPDATE expenses SET description=?, category_id=?, amount=?, date=?, note=?, receipt_image=? WHERE id=?")
      .run(description, categoryId, amount, date, note || "", receiptImage || null, req.params.id);
    res.json(db.prepare("SELECT * FROM expenses WHERE id = ?").get(req.params.id));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/expenses/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM expenses WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ============ USERS ============
app.get("/api/users", (_req, res) => {
  try {
    res.json(db.prepare("SELECT id, name, email, role, avatar FROM users ORDER BY id").all());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/users/login", (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare("SELECT id, name, email, role, avatar FROM users WHERE email = ? AND password = ?").get(email, password);
    if (user) return res.json(user);
    res.status(401).json({ error: "Invalid credentials" });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/users", (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const result = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)")
      .run(name, email, password, role || "collector");
    res.json(db.prepare("SELECT id, name, email, role, avatar FROM users WHERE id = ?").get(result.lastInsertRowid));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.put("/api/users/:id", (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (password) {
      db.prepare("UPDATE users SET name=?, email=?, password=?, role=? WHERE id=?").run(name, email, password, role, req.params.id);
    } else {
      db.prepare("UPDATE users SET name=?, email=?, role=? WHERE id=?").run(name, email, role, req.params.id);
    }
    res.json(db.prepare("SELECT id, name, email, role, avatar FROM users WHERE id = ?").get(req.params.id));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Change password endpoint
app.put("/api/users/:id/password", (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = db.prepare("SELECT id, password FROM users WHERE id = ?").get(req.params.id) as any;
    if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });
    if (user.password !== currentPassword) return res.status(400).json({ error: "كلمة المرور الحالية غير صحيحة" });
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(newPassword, req.params.id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/users/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ============ SETTINGS ============
app.get("/api/settings/:key", (req, res) => {
  try {
    const row = db.prepare("SELECT value FROM app_settings WHERE key = ?").get(req.params.key) as any;
    res.json(row ? JSON.parse(row.value) : null);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/settings/:key", (req, res) => {
  try {
    const value = JSON.stringify(req.body);
    db.prepare("INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)").run(req.params.key, value);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
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
  console.log(`📦 Database: ${path.join(process.cwd(), "data", "app.db")}`);
});
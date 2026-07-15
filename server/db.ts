import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "app.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function initDatabase() {
  // إنشاء الجداول الأساسية
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      national_id TEXT DEFAULT '',
      address TEXT DEFAULT '',
      type TEXT DEFAULT 'customer',
      created_at TEXT DEFAULT (date('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT DEFAULT '',
      unit TEXT DEFAULT 'قطعة',
      cost_price REAL DEFAULT 0,
      selling_price REAL DEFAULT 0,
      current_stock INTEGER DEFAULT 0,
      min_stock INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (date('now'))
    );

    CREATE TABLE IF NOT EXISTS contracts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      product_type TEXT NOT NULL,
      product_id INTEGER,
      total_price REAL DEFAULT 0,
      down_payment REAL DEFAULT 0,
      number_of_receipts INTEGER DEFAULT 1,
      installment_amount REAL DEFAULT 0,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      guarantor_id INTEGER DEFAULT NULL,
      guarantor_name TEXT DEFAULT '',
      guarantor_phone TEXT DEFAULT '',
      created_at TEXT DEFAULT (date('now')),
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
      FOREIGN KEY (guarantor_id) REFERENCES customers(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS installments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contract_id INTEGER,
      number INTEGER NOT NULL,
      amount REAL DEFAULT 0,
      due_date TEXT NOT NULL,
      is_paid INTEGER DEFAULT 0,
      paid_date TEXT,
      day INTEGER DEFAULT 1,
      month INTEGER DEFAULT 1,
      year INTEGER DEFAULT 2025,
      FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS inventory_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      type TEXT NOT NULL,
      quantity INTEGER DEFAULT 0,
      unit_price REAL DEFAULT 0,
      total REAL DEFAULT 0,
      date TEXT DEFAULT (date('now')),
      reference TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (date('now')),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS expense_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT DEFAULT 'bg-slate-100 text-slate-700'
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      category_id INTEGER,
      amount REAL DEFAULT 0,
      date TEXT NOT NULL,
      note TEXT DEFAULT '',
      receipt_image TEXT,
      created_at TEXT DEFAULT (date('now')),
      FOREIGN KEY (category_id) REFERENCES expense_categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'collector',
      avatar TEXT
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // === ترقيات تلقائية للجداول القديمة ===
  const contractColumns = db.prepare("PRAGMA table_info(contracts)").all() as any[];
  const hasGuarantorId = contractColumns.some((col) => col.name === "guarantor_id");
  
  if (!hasGuarantorId) {
    console.log("[db] 🔄 Upgrading contracts table: adding guarantor_id column...");
    try {
      db.exec("ALTER TABLE contracts ADD COLUMN guarantor_id INTEGER DEFAULT NULL");
      // محاولة إضافة foreign key (لن يعمل في SQLite لكن لا مشكلة)
      console.log("[db] ✅ guarantor_id column added successfully");
    } catch (e: any) {
      console.log("[db] ⚠️ guarantor_id migration skipped:", e.message);
    }
  }
}

export function seedDatabase() {
  const customerCount = db.prepare("SELECT COUNT(*) as count FROM customers").get() as any;
  if (customerCount.count > 0) return;

  const insertCustomer = db.prepare(
    "INSERT INTO customers (name, phone, national_id, address, type, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const customers = [
    ["أحمد محمد", "01012345678", "12345678901234", "القاهرة", "customer", "2025-01-01"],
    ["محمود علي", "01023456789", "23456789012345", "الجيزة", "customer", "2025-01-05"],
    ["محمد إبراهيم", "01034567890", "34567890123456", "الإسكندرية", "customer", "2025-01-10"],
    ["خالد حسن", "01045678901", "45678901234567", "القاهرة", "customer", "2025-02-01"],
    ["سعيد عبد الله", "01056789012", "56789012345678", "المنصورة", "customer", "2025-02-10"],
    ["علي أحمد", "01067890123", "67890123456789", "طنطا", "guarantor", "2025-01-01"],
    ["حسن مصطفى", "01078901234", "78901234567890", "القاهرة", "guarantor", "2025-01-05"],
    ["كريم عبد الرحمن", "01089012345", "89012345678901", "الجيزة", "guarantor", "2025-02-01"],
  ];
  for (const c of customers) insertCustomer.run(...c);

  const insertProduct = db.prepare(
    "INSERT INTO products (name, category, unit, cost_price, selling_price, current_stock, min_stock, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const products = [
    ["ثلاجة سامسونج 14 قدم", "أجهزة كهربائية", "قطعة", 15000, 25000, 5, 2, "2025-01-01"],
    ["غسالة LG 7 كيلو", "أجهزة كهربائية", "قطعة", 10000, 18000, 3, 2, "2025-01-01"],
    ["تلفاز سامسونج 55 بوصة", "إلكترونيات", "قطعة", 8000, 12000, 2, 2, "2025-01-01"],
    ["مكيف سبليت 1.5 حصان", "أجهزة كهربائية", "قطعة", 20000, 32000, 4, 2, "2025-01-01"],
    ["بوتاجاز 4 شعلات", "أجهزة كهربائية", "قطعة", 5000, 8500, 1, 3, "2025-01-01"],
  ];
  for (const p of products) insertProduct.run(...p);

  const insertContract = db.prepare(
    `INSERT INTO contracts (customer_id, customer_name, customer_phone, product_type, product_id, total_price, down_payment, number_of_receipts, installment_amount, start_date, end_date, status, guarantor_id, guarantor_name, guarantor_phone, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const contracts = [
    [1, "أحمد محمد", "01012345678", "ثلاجة", 1, 25000, 5000, 12, 1667, "2025-01-15", "2026-01-15", "active", 6, "علي أحمد", "01067890123", "2025-01-15"],
    [2, "محمود علي", "01023456789", "غسالة", 2, 18000, 3000, 10, 1500, "2025-02-01", "2025-12-01", "active", 7, "حسن مصطفى", "01078901234", "2025-02-01"],
    [3, "محمد إبراهيم", "01034567890", "تلفاز", 3, 12000, 2000, 8, 1250, "2025-02-15", "2025-10-15", "active", 8, "كريم عبد الرحمن", "01089012345", "2025-02-15"],
    [4, "خالد حسن", "01045678901", "مكيف", 4, 32000, 7000, 15, 1667, "2025-03-01", "2026-06-01", "active", 6, "علي أحمد", "01067890123", "2025-03-01"],
    [5, "سعيد عبد الله", "01056789012", "ثلاجة", 1, 25000, 5000, 12, 1667, "2025-03-01", "2026-03-01", "active", 7, "حسن مصطفى", "01078901234", "2025-03-01"],
  ];
  for (const c of contracts) insertContract.run(...c);

  const insertInstallment = db.prepare(
    "INSERT INTO installments (contract_id, number, amount, due_date, is_paid, paid_date, day, month, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const installments = [
    [1, 1, 1667, "2025-02-15", 1, "2025-02-10", 15, 2, 2025],
    [1, 2, 1667, "2025-03-15", 1, "2025-03-12", 15, 3, 2025],
    [1, 3, 1667, "2025-04-15", 0, null, 15, 4, 2025],
    [1, 4, 1667, "2025-05-15", 0, null, 15, 5, 2025],
    [2, 1, 1500, "2025-03-01", 1, "2025-02-28", 1, 3, 2025],
    [2, 2, 1500, "2025-04-01", 0, null, 1, 4, 2025],
    [3, 1, 1250, "2025-03-15", 1, "2025-03-10", 15, 3, 2025],
    [3, 2, 1250, "2025-04-15", 0, null, 15, 4, 2025],
    [4, 1, 1667, "2025-04-01", 0, null, 1, 4, 2025],
  ];
  for (const i of installments) insertInstallment.run(...i);

  const insertCategory = db.prepare("INSERT INTO expense_categories (name, color) VALUES (?, ?)");
  const categories = [
    ["إيجار", "bg-cyan-100 text-cyan-700"],
    ["كهرباء", "bg-yellow-100 text-yellow-700"],
    ["رواتب", "bg-green-100 text-green-700"],
    ["صيانة", "bg-orange-100 text-orange-700"],
    ["تسويق", "bg-purple-100 text-purple-700"],
    ["مصاريف إدارية", "bg-slate-100 text-slate-700"],
    ["أخرى", "bg-gray-100 text-gray-700"],
  ];
  for (const c of categories) insertCategory.run(...c);

  const insertExpense = db.prepare(
    "INSERT INTO expenses (description, category_id, amount, date, note, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const expenses = [
    ["إيجار محل الفرع الرئيسي", 1, 15000, "2025-01-01", "إيجار شهر يناير", "2025-01-01"],
    ["فاتورة كهرباء يناير", 2, 3200, "2025-01-15", "قراءة العداد 1500 كيلو", "2025-01-15"],
    ["رواتب الموظفين يناير", 3, 45000, "2025-01-30", "رواتب شهر يناير", "2025-01-30"],
    ["صيانة مكيف الفرع", 4, 850, "2025-02-05", "صيانة مكيف سبليت", "2025-02-05"],
    ["حملة إعلانية فيسبوك", 5, 5000, "2025-02-10", "إعلانات يناير", "2025-02-10"],
    ["إيجار محل الفرع الرئيسي", 1, 15000, "2025-02-01", "إيجار شهر فبراير", "2025-02-01"],
    ["فاتورة كهرباء فبراير", 2, 2900, "2025-02-15", "قراءة العداد", "2025-02-15"],
    ["رواتب الموظفين فبراير", 3, 45000, "2025-02-28", "رواتب شهر فبراير", "2025-02-28"],
    ["إيجار محل الفرع الرئيسي", 1, 15000, "2025-03-01", "إيجار شهر مارس", "2025-03-01"],
    ["مستلزمات مكتبية", 6, 1200, "2025-03-05", "كراسات وأقلام وطباعة", "2025-03-05"],
    ["صيانة سيارات النقل", 4, 2400, "2025-03-08", "تغيير زيت وفلتر", "2025-03-08"],
    ["مصروفات نثرية", 7, 500, "2025-03-10", "", "2025-03-10"],
  ];
  for (const e of expenses) insertExpense.run(...e);

  const insertUser = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
  const users = [
    ["محمد أحمد", "admin@system.com", "admin123", "admin"],
    ["خالد علي", "supervisor@system.com", "super123", "supervisor"],
    ["سامي حسن", "collector@system.com", "collect123", "collector"],
  ];
  for (const u of users) {
    try { insertUser.run(...u); } catch {}
  }
}

export default db;
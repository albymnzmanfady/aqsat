-- Enable pgcrypto for gen_random_uuid if needed
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Helper function to decrement product stock
CREATE OR REPLACE FUNCTION decrement_product_stock(product_id INTEGER, qty INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products SET current_stock = current_stock - qty WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- Helper function to increment product stock
CREATE OR REPLACE FUNCTION increment_product_stock(product_id INTEGER, qty INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products SET current_stock = current_stock + qty WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- Helper function to update product stock by delta (can be negative or positive)
CREATE OR REPLACE FUNCTION update_product_stock(product_id INTEGER, qty_change INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products SET current_stock = current_stock + qty_change WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- ============ CUSTOMERS ============
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  national_id TEXT DEFAULT '',
  address TEXT DEFAULT '',
  type TEXT DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- ============ PRODUCTS ============
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT '',
  unit TEXT DEFAULT 'قطعة',
  cost_price REAL DEFAULT 0,
  selling_price REAL DEFAULT 0,
  current_stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ============ CONTRACTS ============
CREATE TABLE IF NOT EXISTS contracts (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  product_type TEXT NOT NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  total_price REAL DEFAULT 0,
  down_payment REAL DEFAULT 0,
  number_of_receipts INTEGER DEFAULT 1,
  installment_amount REAL DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active',
  guarantor_name TEXT DEFAULT '',
  guarantor_phone TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- ============ INSTALLMENTS ============
CREATE TABLE IF NOT EXISTS installments (
  id SERIAL PRIMARY KEY,
  contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  amount REAL DEFAULT 0,
  due_date DATE NOT NULL,
  is_paid INTEGER DEFAULT 0,
  paid_date DATE,
  day INTEGER DEFAULT 1,
  month INTEGER DEFAULT 1,
  year INTEGER DEFAULT 2025
);

ALTER TABLE installments ENABLE ROW LEVEL SECURITY;

-- ============ INVENTORY TRANSACTIONS ============
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  unit_price REAL DEFAULT 0,
  total REAL DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  reference TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- ============ EXPENSE CATEGORIES ============
CREATE TABLE IF NOT EXISTS expense_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT 'bg-slate-100 text-slate-700'
);

ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

-- ============ EXPENSES ============
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  category_id INTEGER REFERENCES expense_categories(id) ON DELETE SET NULL,
  amount REAL DEFAULT 0,
  date DATE NOT NULL,
  note TEXT DEFAULT '',
  receipt_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- ============ USERS ============
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'collector',
  avatar TEXT
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============ SETTINGS ============
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- ============ GRANTS (Development: allow full access) ============
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============ RLS Policies (Allow all for development) ============
CREATE POLICY "Allow all for anon" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON contracts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON installments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON inventory_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON expense_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON app_settings FOR ALL USING (true) WITH CHECK (true);

-- ============ SEED DATA ============
-- Seed users (admin, supervisor, collector)
INSERT INTO users (name, email, password, role) VALUES
  ('محمد أحمد', 'admin@system.com', 'admin123', 'admin'),
  ('خالد علي', 'supervisor@system.com', 'super123', 'supervisor'),
  ('سامي حسن', 'collector@system.com', 'collect123', 'collector')
ON CONFLICT (email) DO NOTHING;

-- Seed expense categories
INSERT INTO expense_categories (name, color) VALUES
  ('إيجار', 'bg-cyan-100 text-cyan-700'),
  ('كهرباء', 'bg-yellow-100 text-yellow-700'),
  ('رواتب', 'bg-green-100 text-green-700'),
  ('صيانة', 'bg-orange-100 text-orange-700'),
  ('تسويق', 'bg-purple-100 text-purple-700'),
  ('مصاريف إدارية', 'bg-slate-100 text-slate-700'),
  ('أخرى', 'bg-gray-100 text-gray-700')
ON CONFLICT DO NOTHING;
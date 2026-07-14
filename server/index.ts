import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import db, { initDatabase, seedDatabase } from './db.js';

// تهيئة قاعدة البيانات والبيانات الأولية
initDatabase();
try {
  seedDatabase();
} catch (e) {
  console.log("Database already seeded");
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 1. تسجيل الدخول
app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;
  try {
    const user = db.prepare('SELECT id, name, email, role, avatar FROM users WHERE email = ? AND password = ?').get(email, password) as any;
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. إدارة العملاء
app.get('/api/customers', (req, res) => {
  const { search } = req.query;
  try {
    let customers;
    if (search) {
      customers = db.prepare('SELECT * FROM customers WHERE name LIKE ? OR phone LIKE ? ORDER BY id DESC').all(`%${search}%`, `%${search}%`);
    } else {
      customers = db.prepare('SELECT * FROM customers ORDER BY id DESC').all();
    }
    res.json(customers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/customers/:id', (req, res) => {
  try {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    if (customer) res.json(customer);
    else res.status(404).json({ error: 'العميل غير موجود' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/customers', (req, res) => {
  const { name, phone, nationalId, address, type } = req.body;
  try {
    const result = db.prepare(
      'INSERT INTO customers (name, phone, national_id, address, type, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(name, phone, nationalId || '', address || '', type || 'customer', new Date().toISOString().split('T')[0]);
    
    const newCustomer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newCustomer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/customers/:id', (req, res) => {
  const { name, phone, nationalId, address, type } = req.body;
  try {
    db.prepare(
      'UPDATE customers SET name = ?, phone = ?, national_id = ?, address = ?, type = ? WHERE id = ?'
    ).run(name, phone, nationalId || '', address || '', type || 'customer', req.params.id);
    const updated = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/customers/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. المنتجات
app.get('/api/products', (req, res) => {
  const { search } = req.query;
  try {
    let products;
    if (search) {
      products = db.prepare('SELECT * FROM products WHERE name LIKE ? OR category LIKE ? ORDER BY id DESC').all(`%${search}%`, `%${search}%`);
    } else {
      products = db.prepare('SELECT * FROM products ORDER BY id DESC').all();
    }
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', (req, res) => {
  const { name, category, unit, costPrice, sellingPrice, currentStock, minStock } = req.body;
  try {
    const result = db.prepare(
      'INSERT INTO products (name, category, unit, cost_price, selling_price, current_stock, min_stock, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(name, category || '', unit || 'قطعة', costPrice || 0, sellingPrice || 0, currentStock || 0, minStock || 0, new Date().toISOString().split('T')[0]);
    const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newProduct);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', (req, res) => {
  const { name, category, unit, costPrice, sellingPrice, currentStock, minStock } = req.body;
  try {
    db.prepare(
      'UPDATE products SET name = ?, category = ?, unit = ?, cost_price = ?, selling_price = ?, current_stock = ?, min_stock = ? WHERE id = ?'
    ).run(name, category || '', unit || 'قطعة', costPrice || 0, sellingPrice || 0, currentStock || 0, minStock || 0, req.params.id);
    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. العقود
app.get('/api/contracts', (req, res) => {
  const { search } = req.query;
  try {
    let contracts;
    if (search) {
      contracts = db.prepare('SELECT * FROM contracts WHERE customer_name LIKE ? OR product_type LIKE ? ORDER BY id DESC').all(`%${search}%`, `%${search}%`);
    } else {
      contracts = db.prepare('SELECT * FROM contracts ORDER BY id DESC').all();
    }
    res.json(contracts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/contracts/:id', (req, res) => {
  try {
    const contract = db.prepare('SELECT * FROM contracts WHERE id = ?').get(req.params.id);
    if (contract) res.json(contract);
    else res.status(404).json({ error: 'العقد غير موجود' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/contracts', (req, res) => {
  const { customerId, customerName, customerPhone, productType, productId, totalPrice, downPayment, numberOfReceipts, installmentAmount, startDate, endDate, guarantorName, guarantorPhone } = req.body;
  try {
    const dbTxn = db.transaction(() => {
      // 1. إضافة العقد
      const result = db.prepare(
        `INSERT INTO contracts (customer_id, customer_name, customer_phone, product_type, product_id, total_price, down_payment, number_of_receipts, installment_amount, start_date, end_date, status, guarantor_name, guarantor_phone, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        customerId || null, customerName, customerPhone, productType, productId || null,
        totalPrice || 0, downPayment || 0, numberOfReceipts || 1, installmentAmount || 0,
        startDate, endDate, 'active', guarantorName || '', guarantorPhone || '', new Date().toISOString().split('T')[0]
      );

      const contractId = result.lastInsertRowid;

      // 2. توليد الأقساط
      const start = new Date(startDate);
      const insertInstallment = db.prepare(
        'INSERT INTO installments (contract_id, number, amount, due_date, is_paid, day, month, year) VALUES (?, ?, ?, ?, 0, ?, ?, ?)'
      );
      for (let i = 0; i < numberOfReceipts; i++) {
        const dueDate = new Date(start);
        dueDate.setMonth(dueDate.getMonth() + i + 1);
        const dueStr = dueDate.toISOString().split('T')[0];
        insertInstallment.run(contractId, i + 1, installmentAmount, dueStr, dueDate.getDate(), dueDate.getMonth() + 1, dueDate.getFullYear());
      }

      // 3. خصم من المخزون
      if (productId) {
        db.prepare('UPDATE products SET current_stock = MAX(0, current_stock - 1) WHERE id = ?').run(productId);
        // تسجيل حركة المخزون
        db.prepare(
          'INSERT INTO inventory_transactions (product_id, type, quantity, unit_price, total, date, reference, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).run(productId, 'sale', -1, totalPrice / numberOfReceipts, -totalPrice, new Date().toISOString().split('T')[0], `عقد #${contractId}`, `بيع تلقائي لعقد العميل ${customerName}`, new Date().toISOString().split('T')[0]);
      }

      return contractId;
    });

    const contractId = dbTxn();
    const newContract = db.prepare('SELECT * FROM contracts WHERE id = ?').get(contractId);
    res.status(201).json(newContract);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/contracts/:id', (req, res) => {
  const { status, guarantorName, guarantorPhone } = req.body;
  try {
    db.prepare('UPDATE contracts SET status = ?, guarantor_name = ?, guarantor_phone = ? WHERE id = ?')
      .run(status, guarantorName || '', guarantorPhone || '', req.params.id);
    const updated = db.prepare('SELECT * FROM contracts WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/contracts/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM contracts WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. الأقساط
app.get('/api/installments', (req, res) => {
  const { contractId, isPaid } = req.query;
  try {
    let installments;
    if (contractId && isPaid !== undefined) {
      installments = db.prepare('SELECT * FROM installments WHERE contract_id = ? AND is_paid = ? ORDER BY number ASC')
        .all(contractId, isPaid === 'true' ? 1 : 0);
    } else if (contractId) {
      installments = db.prepare('SELECT * FROM installments WHERE contract_id = ? ORDER BY number ASC')
        .all(contractId);
    } else {
      installments = db.prepare('SELECT * FROM installments ORDER BY id DESC').all();
    }
    res.json(installments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/installments/:id', (req, res) => {
  const { isPaid, paidDate } = req.body;
  try {
    db.prepare('UPDATE installments SET is_paid = ?, paid_date = ? WHERE id = ?')
      .run(isPaid ? 1 : 0, paidDate || null, req.params.id);
    const updated = db.prepare('SELECT * FROM installments WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/installments/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM installments WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. حركات المخزون
app.get('/api/inventory', (req, res) => {
  try {
    const transactions = db.prepare(`
      SELECT t.*, p.name as product_name 
      FROM inventory_transactions t 
      LEFT JOIN products p ON t.product_id = p.id 
      ORDER BY t.id DESC
    `).all();
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/inventory', (req, res) => {
  const { productId, type, quantity, unitPrice, reference, notes } = req.body;
  try {
    const total = quantity * unitPrice;
    const dbTxn = db.transaction(() => {
      const result = db.prepare(
        'INSERT INTO inventory_transactions (product_id, type, quantity, unit_price, total, date, reference, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(productId, type, quantity, unitPrice, total, new Date().toISOString().split('T')[0], reference || '', notes || '', new Date().toISOString().split('T')[0]);

      const qtyChange = (type === 'purchase' || type === 'return') ? Math.abs(quantity) : -Math.abs(quantity);
      db.prepare('UPDATE products SET current_stock = MAX(0, current_stock + ?) WHERE id = ?').run(qtyChange, productId);

      return result.lastInsertRowid;
    });

    const txnId = dbTxn();
    const newTxn = db.prepare('SELECT * FROM inventory_transactions WHERE id = ?').get(txnId);
    res.status(201).json(newTxn);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. فئات المصروفات
app.get('/api/expense-categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM expense_categories ORDER BY id ASC').all();
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. المصروفات
app.get('/api/expenses', (req, res) => {
  const { search, categoryId } = req.query;
  try {
    let query = `
      SELECT e.*, c.name as category_name, c.color as category_color 
      FROM expenses e 
      LEFT JOIN expense_categories c ON e.category_id = c.id 
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (search) {
      conditions.push('e.description LIKE ?');
      params.push(`%${search}%`);
    }
    if (categoryId) {
      conditions.push('e.category_id = ?');
      params.push(categoryId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY e.id DESC';

    const expenses = db.prepare(query).all(...params);
    res.json(expenses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/expenses', (req, res) => {
  const { description, categoryId, amount, date, note, receiptImage } = req.body;
  try {
    const result = db.prepare(
      'INSERT INTO expenses (description, category_id, amount, date, note, receipt_image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(description, categoryId, amount || 0, date, note || '', receiptImage || null, new Date().toISOString().split('T')[0]);
    const newExpense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newExpense);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/expenses/:id', (req, res) => {
  const { description, categoryId, amount, date, note, receiptImage } = req.body;
  try {
    db.prepare(
      'UPDATE expenses SET description = ?, category_id = ?, amount = ?, date = ?, note = ?, receipt_image = ? WHERE id = ?'
    ).run(description, categoryId, amount || 0, date, note || '', receiptImage || null, req.params.id);
    const updated = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/expenses/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 9. المستخدمين
app.get('/api/users', (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, email, role, avatar FROM users ORDER BY id DESC').all();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const result = db.prepare(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
    ).run(name, email, password, role || 'collector');
    const newUser = db.prepare('SELECT id, name, email, role, avatar FROM users WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newUser);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    if (password) {
      db.prepare('UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?')
        .run(name, email, password, role, req.params.id);
    } else {
      db.prepare('UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?')
        .run(name, email, role, req.params.id);
    }
    const updated = db.prepare('SELECT id, name, email, role, avatar FROM users WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id/password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id) as any;
    if (user && user.password === currentPassword) {
      db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newPassword, req.params.id);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 10. الإعدادات
app.get('/api/settings/:key', (req, res) => {
  try {
    const row = db.prepare('SELECT value FROM app_settings WHERE key = ?').get(req.params.key) as any;
    if (row) {
      res.json(JSON.parse(row.value));
    } else {
      res.json(null);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/settings/:key', (req, res) => {
  try {
    const valStr = JSON.stringify(req.body);
    db.prepare('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)')
      .run(req.params.key, valStr);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// الخدمة الثابتة للـ Frontend
const distPath = path.join(process.cwd(), "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
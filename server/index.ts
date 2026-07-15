import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import db, { initDatabase, seedDatabase } from './db.js';

// تهيئة قاعدة البيانات والبيانات الأولية
initDatabase();
try {
  seedDatabase();
} catch (e) {
  console.log("[server] Database already seeded");
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// ========== 1. تسجيل الدخول ==========
app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
  }
  try {
    const user = db.prepare('SELECT id, name, email, role, avatar FROM users WHERE email = ? AND password = ?').get(email, password) as any;
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'خطأ في الخادم: ' + error.message });
  }
});

// ========== 2. إدارة العملاء ==========
app.get('/api/customers', (req, res) => {
  const { search, type } = req.query;
  try {
    let query = 'SELECT * FROM customers';
    const conditions: string[] = [];
    const params: any[] = [];

    if (search) {
      conditions.push('(name LIKE ? OR phone LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (type) {
      conditions.push('type = ?');
      params.push(type);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY id DESC';
    const customers = db.prepare(query).all(...params);
    res.json(customers);
  } catch (error: any) {
    res.status(500).json({ error: 'خطأ في تحميل العملاء: ' + error.message });
  }
});

app.get('/api/customers/:id', (req, res) => {
  try {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    if (customer) res.json(customer);
    else res.status(404).json({ error: 'العميل غير موجود' });
  } catch (error: any) {
    res.status(500).json({ error: 'خطأ في تحميل بيانات العميل: ' + error.message });
  }
});

app.post('/api/customers', (req, res) => {
  const { name, phone, nationalId, address, type } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'اسم العميل مطلوب' });
  if (!phone || !phone.trim()) return res.status(400).json({ error: 'رقم الهاتف مطلوب' });
  try {
    const result = db.prepare(
      'INSERT INTO customers (name, phone, national_id, address, type, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(name.trim(), phone.trim(), nationalId || '', address || '', type || 'customer', new Date().toISOString().split('T')[0]);
    const newCustomer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newCustomer);
  } catch (error: any) {
    res.status(500).json({ error: 'خطأ في إضافة العميل: ' + error.message });
  }
});

app.put('/api/customers/:id', (req, res) => {
  const { name, phone, nationalId, address, type } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'اسم العميل مطلوب' });
  try {
    db.prepare(
      'UPDATE customers SET name = ?, phone = ?, national_id = ?, address = ?, type = ? WHERE id = ?'
    ).run(name.trim(), phone.trim(), nationalId || '', address || '', type || 'customer', req.params.id);
    const updated = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'خطأ في تعديل العميل: ' + error.message });
  }
});

app.delete('/api/customers/:id', (req, res) => {
  try {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id) as any;
    if (!customer) return res.status(404).json({ error: 'العميل غير موجود' });
    const activeContracts = db.prepare(
      "SELECT COUNT(*) as count FROM contracts WHERE customer_id = ? AND status = 'active'"
    ).get(req.params.id) as any;
    if (activeContracts && activeContracts.count > 0) {
      return res.status(400).json({ error: `لا يمكن حذف هذا العميل لأنه يرتبط بـ ${activeContracts.count} عقد(عقود) نشطة.` });
    }
    db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'خطأ في حذف العميل: ' + error.message });
  }
});

// ========== 3. المنتجات ==========
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
    res.status(500).json({ error: 'خطأ في تحميل المنتجات: ' + error.message });
  }
});

app.post('/api/products', (req, res) => {
  const { name, category, unit, costPrice, sellingPrice, currentStock, minStock } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'اسم المنتج مطلوب' });
  if (!category || !category.trim()) return res.status(400).json({ error: 'التصنيف مطلوب' });
  try {
    const result = db.prepare(
      'INSERT INTO products (name, category, unit, cost_price, selling_price, current_stock, min_stock, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(name.trim(), category.trim(), unit || 'قطعة', costPrice || 0, sellingPrice || 0, currentStock || 0, minStock || 0, new Date().toISOString().split('T')[0]);
    const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newProduct);
  } catch (error: any) {
    res.status(500).json({ error: 'خطأ في إضافة المنتج: ' + error.message });
  }
});

app.put('/api/products/:id', (req, res) => {
  const { name, category, unit, costPrice, sellingPrice, currentStock, minStock } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'اسم المنتج مطلوب' });
  try {
    db.prepare(
      'UPDATE products SET name = ?, category = ?, unit = ?, cost_price = ?, selling_price = ?, current_stock = ?, min_stock = ? WHERE id = ?'
    ).run(name.trim(), category.trim(), unit || 'قطعة', costPrice || 0, sellingPrice || 0, currentStock || 0, minStock || 0, req.params.id);
    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'خطأ في تعديل المنتج: ' + error.message });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    const linkedContracts = db.prepare(
      "SELECT COUNT(*) as count FROM contracts WHERE product_id = ? AND status = 'active'"
    ).get(req.params.id) as any;
    if (linkedContracts && linkedContracts.count > 0) {
      return res.status(400).json({ error: `لا يمكن حذف هذا المنتج لأنه مرتبط بـ ${linkedContracts.count} عقد(عقود) نشطة` });
    }
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'خطأ في حذف المنتج: ' + error.message });
  }
});

// ========== 4. العقود ==========
app.get('/api/contracts', (req, res) => {
  const { search } = req.query;
  try {
    let contracts;
    if (search) {
      contracts = db.prepare(
        'SELECT * FROM contracts WHERE customer_name LIKE ? OR product_type LIKE ? OR customer_phone LIKE ? ORDER BY id DESC'
      ).all(`%${search}%`, `%${search}%`, `%${search}%`);
    } else {
      contracts = db.prepare('SELECT * FROM contracts ORDER BY id DESC').all();
    }
    res.json(contracts);
  } catch (error: any) {
    res.status(500).json({ error: 'خطأ في تحميل العقود: ' + error.message });
  }
});

app.get('/api/contracts/:id', (req, res) => {
  try {
    const contract = db.prepare('SELECT * FROM contracts WHERE id = ?').get(req.params.id);
    if (contract) res.json(contract);
    else res.status(404).json({ error: 'العقد غير موجود' });
  } catch (error: any) {
    res.status(500).json({ error: 'خطأ في تحميل العقد: ' + error.message });
  }
});

app.post('/api/contracts', (req, res) => {
  const { customerId, customerName, customerPhone, productType, productId, totalPrice, downPayment, numberOfReceipts, installmentAmount, startDate, endDate, guarantorId, guarantorName, guarantorPhone } = req.body;
  
  if (!customerName || !customerName.trim()) return res.status(400).json({ error: 'اسم العميل مطلوب' });
  if (!customerPhone || !customerPhone.trim()) return res.status(400).json({ error: 'رقم هاتف العميل مطلوب' });
  if (!productType || !productType.trim()) return res.status(400).json({ error: 'نوع المنتج مطلوب' });
  if (!startDate) return res.status(400).json({ error: 'تاريخ البدء مطلوب' });
  if (!numberOfReceipts || numberOfReceipts <= 0) return res.status(400).json({ error: 'عدد الأقساط يجب أن يكون أكبر من صفر' });
  
  try {
    if (productId) {
      const product = db.prepare('SELECT current_stock FROM products WHERE id = ?').get(productId) as any;
      if (!product) return res.status(400).json({ error: 'المنتج غير موجود' });
      if (product.current_stock <= 0) return res.status(400).json({ error: 'المخزون غير متوفر لهذا المنتج' });
    }

    // إذا تم اختيار ضامن، نجلب بياناته للحفظ في العقد
    let finalGuarantorName = guarantorName || '';
    let finalGuarantorPhone = guarantorPhone || '';
    let finalGuarantorId = guarantorId || null;

    if (finalGuarantorId) {
      const guarantor = db.prepare('SELECT name, phone FROM customers WHERE id = ?').get(finalGuarantorId) as any;
      if (guarantor) {
        finalGuarantorName = guarantor.name;
        finalGuarantorPhone = guarantor.phone;
      }
    }

    const dbTxn = db.transaction(() => {
      const result = db.prepare(
        `INSERT INTO contracts (customer_id, customer_name, customer_phone, product_type, product_id, total_price, down_payment, number_of_receipts, installment_amount, start_date, end_date, status, guarantor_id, guarantor_name, guarantor_phone, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        customerId || null, customerName.trim(), customerPhone.trim(), productType.trim(), productId || null,
        totalPrice || 0, downPayment || 0, numberOfReceipts || 1, installmentAmount || 0,
        startDate, endDate || startDate, 'active', finalGuarantorId, finalGuarantorName, finalGuarantorPhone, new Date().toISOString().split('T')[0]
      );

      const contractId = result.lastInsertRowid;

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

      if (productId) {
        db.prepare('UPDATE products SET current_stock = MAX(0, current_stock - 1) WHERE id = ?').run(productId);
        db.prepare(
          'INSERT INTO inventory_transactions (product_id, type, quantity, unit_price, total, date, reference, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).run(productId, 'sale', -1, totalPrice / numberOfReceipts, -totalPrice, new Date().toISOString().split('T')[0], `عقد #${contractId}`, `بيع تلقائي لعقد العميل ${customerName.trim()}`, new Date().toISOString().split('T')[0]);
      }

      return contractId;
    });

    const contractId = dbTxn();
    const newContract = db.prepare('SELECT * FROM contracts WHERE id = ?').get(contractId);
    res.status(201).json(newContract);
  } catch (error: any) {
    res.status(500).json({ error: 'خطأ في إنشاء العقد: ' + error.message });
  }
});

app.put('/api/contracts/:id', (req, res) => {
  const { status, guarantorId, guarantorName, guarantorPhone } = req.body;
  try {
    const existing = db.prepare('SELECT * FROM contracts WHERE id = ?').get(req.params.id) as any;
    if (!existing) return res.status(404).json({ error: 'العقد غير موجود' });

    // إذا تم اختيار ضامن جديد، نجلب بياناته
    let finalGuarantorName = guarantorName || existing.guarantor_name || '';
    let finalGuarantorPhone = guarantorPhone || existing.guarantor_phone || '';
    let finalGuarantorId = guarantorId !== undefined ? guarantorId : existing.guarantor_id;

    if (guarantorId && guarantorId !== existing.guarantor_id) {
      if (guarantorId) {
        const guarantor = db.prepare('SELECT name, phone FROM customers WHERE id = ?').get(guarantorId) as any;
        if (guarantor) {
          finalGuarantorName = guarantor.name;
          finalGuarantorPhone = guarantor.phone;
        }
      } else {
        finalGuarantorName = '';
        finalGuarantorPhone = '';
      }
    }

    db.prepare('UPDATE contracts SET status = ?, guarantor_id = ?, guarantor_name = ?, guarantor_phone = ? WHERE id = ?')
      .run(status || 'active', finalGuarantorId, finalGuarantorName, finalGuarantorPhone, req.params.id);
    const updated = db.prepare('SELECT * FROM contracts WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'خطأ في تعديل العقد: ' + error.message });
  }
});

app.delete('/api/contracts/:id', (req, res) => {
  try {
    const contract = db.prepare('SELECT * FROM contracts WHERE id = ?').get(req.params.id) as any;
    if (!contract) return res.status(404).json({ error: 'العقد غير موجود' });

    const dbTxn = db.transaction(() => {
      if (contract.product_id) {
        db.prepare('UPDATE products SET current_stock = current_stock + 1 WHERE id = ?').run(contract.product_id);
        db.prepare(
          'INSERT INTO inventory_transactions (product_id, type, quantity, unit_price, total, date, reference, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).run(contract.product_id, 'return', 1, contract.total_price / contract.number_of_receipts, contract.total_price, new Date().toISOString().split('T')[0], `حذف عقد #${contract.id}`, `استرجاع مخزون due to contract deletion - العميل: ${contract.customer_name}`, new Date().toISOString().split('T')[0]);
      }
      db.prepare('DELETE FROM contracts WHERE id = ?').run(req.params.id);
    });
    dbTxn();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'خطأ في حذف العقد: ' + error.message });
  }
});

// ========== 5. الأقساط ==========
app.get('/api/installments', (req, res) => {
  const { contractId, isPaid } = req.query;
  try {
    let installments;
    if (contractId && isPaid !== undefined) {
      installments = db.prepare('SELECT * FROM installments WHERE contract_id = ? AND is_paid = ? ORDER BY number ASC')
        .all(contractId, isPaid === 'true' ? 1 : 0);
    } else if (contractId) {
      installments = db.prepare('SELECT * FROM installments WHERE contract_id = ? ORDER BY number ASC').all(contractId);
    } else {
      installments = db.prepare('SELECT * FROM installments ORDER BY id DESC').all();
    }
    res.json(installments);
  } catch (error: any) {
    res.status(500).json({ error: 'خطأ في تحميل الأقساط: ' + error.message });
  }
});

app.put('/api/installments/:id', (req, res) => {
  const { isPaid, paidDate } = req.body;
  try {
    const existing = db.prepare('SELECT * FROM installments WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'القسط غير موجود' });
    db.prepare('UPDATE installments SET is_paid = ?, paid_date = ? WHERE id = ?')
      .run(isPaid ? 1 : 0, paidDate || null, req.params.id);
    const updated = db.prepare('SELECT * FROM installments WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'خطأ في تعديل القسط: ' + error.message });
  }
});

app.delete('/api/installments/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM installments WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'خطأ في حذف القسط: ' + error.message });
  }
});

// ========== 6. حركات المخزون ==========
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
    res.status(500).json({ error: 'خطأ في تحميل حركات المخزون: ' + error.message });
  }
});

app.post('/api/inventory', (req, res) => {
  const { productId, type, quantity, unitPrice, reference, notes } = req.body;
  if (!productId) return res.status(400).json({ error: 'المنتج مطلوب' });
  if (!type) return res.status(400).json({ error: 'نوع الحركة مطلوب' });
  if (!quantity || quantity <= 0) return res.status(400).json({ error: 'الكمية يجب أن أكبر من صفر' });
  
  try {
    if (type === 'sale') {
      const product = db.prepare('SELECT current_stock FROM products WHERE id = ?').get(productId) as any;
      if (!product) return res.status(400).json({ error: 'المنتج غير موجود' });
      if (product.current_stock < quantity) {
        return res.status(400).json({ error: `المخزون غير كافٍ. المتوفر: ${product.current_stock}` });
      }
    }

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
    res.status(500).json({ error: 'خطأ في تسجيل الحركة: ' + error.message });
  }
});

// ========== 7. فئات المصروفات ==========
app.get('/api/expense-categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM expense_categories ORDER BY id ASC').all();
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: 'خطأ في تحميل فئات المصروفات: ' + error.message });
  }
});

// ========== 8. المصروفات ==========
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
    if (search) { conditions.push('e.description LIKE ?'); params.push(`%${search}%`); }
    if (categoryId) { conditions.push('e.category_id = ?'); params.push(categoryId); }
    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY e.id DESC';
    const expenses = db.prepare(query).all(...params);
    res.json(expenses);
  } catch (error: any) {
    res.status(500).json({ error: 'خطأ في تحميل المصروفات: ' + error.message });
  }
});

app.post('/api/expenses', (req, res) => {
  const { description, categoryId, amount, date, note, receiptImage } = req.body;
  if (!description || !description.trim()) return res.status(400).json({ error: 'وصف المصروف مطلوب' });
  if (!categoryId) return res.status(400).json({ error: 'فئة المصروف مطلوبة' });
  if (!amount || amount <= 0) return res.status(400).json({ error: 'المبلغ غير صحيح' });
  if (!date) return res.status(400).json({ error: 'التاريخ مطلوب' });
  try {
    const result = db.prepare(
      'INSERT INTO expenses (description, category_id, amount, date, note, receipt_image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(description.trim(), categoryId, amount || 0, date, note || '', receiptImage || null, new Date().toISOString().split('T')[0]);
    const newExpense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newExpense);
  } catch (error: any) {
    res.status(500).json({ error: 'خطأ في إضافة المصروف: ' + error.message });
  }
});

app.put('/api/expenses/:id', (req, res) => {
  const { description, categoryId, amount, date, note, receiptImage } = req.body;
  try {
    const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'المصروف غير موجود' });
    db.prepare('UPDATE expenses SET description = ?, category_id = ?, amount = ?, date = ?, note = ?, receipt_image = ? WHERE id = ?')
      .run(description || '', categoryId || null, amount || 0, date || '', note || '', receiptImage || null, req.params.id);
    const updated = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'خطأ في تعديل المصروف: ' + error.message });
  }
});

app.delete('/api/expenses/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'خطأ في حذف المصروف: ' + error.message });
  }
});

// ========== 9. المستخدمين ==========
app.get('/api/users', (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, email, role, avatar FROM users ORDER BY id DESC').all();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: 'خطأ في تحميل المستخدمين: ' + error.message });
  }
});

app.post('/api/users', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'اسم المستخدم مطلوب' });
  if (!email || !email.trim()) return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });
  if (!password || password.length < 6) return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.trim()) as any;
    if (existing) return res.status(400).json({ error: 'البريد الإلكتروني مستخدم بالفعل' });
    const result = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(name.trim(), email.trim(), password, role || 'collector');
    const newUser = db.prepare('SELECT id, name, email, role, avatar FROM users WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newUser);
  } catch (error: any) {
    res.status(500).json({ error: 'خطأ في إضافة المستخدم: ' + error.message });
  }
});

app.put('/api/users/:id', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'اسم المستخدم مطلوب' });
  try {
    if (email) {
      const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email.trim(), req.params.id) as any;
      if (existing) return res.status(400).json({ error: 'البريد الإلكتروني مستخدم بالفعل لمستخدم آخر' });
    }
    if (password) {
      db.prepare('UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?').run(name.trim(), email?.trim() || '', password, role || 'collector', req.params.id);
    } else {
      db.prepare('UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?').run(name.trim(), email?.trim() || '', role || 'collector', req.params.id);
    }
    const updated = db.prepare('SELECT id, name, email, role, avatar FROM users WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'خطأ في تعديل المستخدم: ' + error.message });
  }
});

app.put('/api/users/:id/password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'كلمتا المرور مطلوبتان' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' });
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id) as any;
    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
    if (user.password === currentPassword) {
      db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newPassword, req.params.id);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'خطأ في تغيير كلمة المرور: ' + error.message });
  }
});

app.delete('/api/users/:id', (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id) as any;
    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
    if (user.role === 'admin') {
      const adminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as any;
      if (adminCount && adminCount.count <= 1) return res.status(400).json({ error: 'لا يمكن حذف آخر مدير في النظام' });
    }
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'خطأ في حذف المستخدم: ' + error.message });
  }
});

// ========== 10. الإعدادات ==========
app.get('/api/settings/:key', (req, res) => {
  try {
    const row = db.prepare('SELECT value FROM app_settings WHERE key = ?').get(req.params.key) as any;
    res.json(row ? JSON.parse(row.value) : null);
  } catch (error: any) {
    res.status(500).json({ error: 'خطأ في تحميل الإعدادات: ' + error.message });
  }
});

app.put('/api/settings/:key', (req, res) => {
  try {
    db.prepare('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)').run(req.params.key, JSON.stringify(req.body));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'خطأ في حفظ الإعدادات: ' + error.message });
  }
});

// ========== 11. النسخة الاحتياطية ==========
app.get('/api/backup/export', (req, res) => {
  try {
    const tables = ['customers', 'products', 'contracts', 'installments', 'inventory_transactions', 'expense_categories', 'expenses', 'users', 'app_settings'];
    const data: Record<string, any> = {};
    for (const table of tables) {
      data[table] = db.prepare(`SELECT * FROM ${table}`).all();
    }
    data._metadata = { exportDate: new Date().toISOString(), version: "1.0", tablesCount: tables.length };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=aqsat-backup.json');
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'فشل تصدير النسخة الاحتياطية: ' + error.message });
  }
});

app.post('/api/backup/import', (req, res) => {
  const data = req.body;
  if (!data || typeof data !== 'object') return res.status(400).json({ error: 'الملف غير صالح' });
  const validTables = ['customers', 'products', 'contracts', 'installments', 'inventory_transactions', 'expense_categories', 'expenses', 'users', 'app_settings'];
  const providedTables = Object.keys(data).filter(t => validTables.includes(t));
  if (providedTables.length === 0) return res.status(400).json({ error: 'الملف لا يحتوي على جداول صالحة' });
  if (data.contracts && Array.isArray(data.contracts)) {
    for (const c of data.contracts) {
      if (!c.customer_name || !c.customer_phone) return res.status(400).json({ error: 'البيانات غير مكتملة: العقد يفتقر لبيانات العميل' });
    }
  }
  if (data.users && Array.isArray(data.users)) {
    for (const u of data.users) {
      if (!u.email || !u.password) return res.status(400).json({ error: 'البيانات غير مكتملة: المستخدم يفتقر للبريد أو كلمة المرور' });
    }
  }
  try {
    const dbTxn = db.transaction(() => {
      for (const table of validTables) {
        if (data[table] && Array.isArray(data[table])) {
          db.prepare(`DELETE FROM ${table}`).run();
          if (data[table].length > 0) {
            const columns = Object.keys(data[table][0]);
            const placeholders = columns.map(() => '?').join(',');
            const stmt = db.prepare(`INSERT INTO ${table} (${columns.join(',')}) VALUES (${placeholders})`);
            for (const row of data[table]) {
              stmt.run(...columns.map(col => row[col]));
            }
          }
        }
      }
    });
    dbTxn();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'فشل استيراد النسخة الاحتياطية: ' + error.message });
  }
});

// ========== 12. صحة الخادم ==========
app.get('/api/health', (req, res) => {
  try {
    const customerCount = (db.prepare('SELECT COUNT(*) as count FROM customers').get() as any).count;
    const contractCount = (db.prepare('SELECT COUNT(*) as count FROM contracts').get() as any).count;
    const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
    res.json({ status: 'ok', timestamp: new Date().toISOString(), data: { customers: customerCount, contracts: contractCount, users: userCount } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.use('/', createProxyMiddleware({ target: 'http://localhost:8080', changeOrigin: true, ws: true }));
} else {
  const distPath = path.join(process.cwd(), "dist");
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get("*", (_req, res) => { res.sendFile(path.join(distPath, "index.html")); });
  }
}

app.listen(PORT, () => {
  console.log(`🚀 [server] Running on http://localhost:${PORT}`);
});
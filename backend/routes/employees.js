const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

// ============================================================
// KITCHEN LOOKUP HELPER
// ============================================================
async function getKitchensMap() {
  const kitchens = await db('kitchens').select('id', 'name');
  const map = {};
  kitchens.forEach(k => { map[k.id] = k.name; });
  return map;
}

// Helper: group employees by role within a kitchen
const groupByRole = (list) => ({
  'Ahli Gizi': list.filter(e => e.role === 'Ahli Gizi'),
  'Driver':    list.filter(e => e.role === 'Driver'),
  'Juru Masak':list.filter(e => e.role === 'Juru Masak'),
});

// ============================================================
// ROUTES
// ============================================================

/**
 * GET /api/employees/kitchen/:kitchenId
 */
router.get('/kitchen/:kitchenId', async (req, res) => {
  try {
    const { kitchenId } = req.params;
    const { role, includeTerminated } = req.query;

    let query = db('employees')
      .join('kitchens', 'employees.kitchen_id', 'kitchens.id')
      .select(
        'employees.id',
        'employees.name',
        'employees.email',
        'employees.role',
        'employees.kitchen_id as kitchenId',
        'kitchens.name as kitchenName',
        'employees.salary',
        'employees.status',
        'employees.paid_this_month as paidThisMonth'
      );

    if (includeTerminated !== 'true') {
      query = query.where('employees.status', '!=', 'terminated');
    }

    if (kitchenId !== 'all') {
      query = query.where('employees.kitchen_id', kitchenId);
    }

    if (role) {
      query = query.where('employees.role', role);
    }

    const employeesData = await query;
    
    // Map status from db format to frontend format if needed
    // 'active' -> 'Active', 'on_leave' -> 'On Leave', 'terminated' -> 'Terminated'
    const statusMap = {
      'active': 'Active',
      'on_leave': 'On Leave',
      'terminated': 'Terminated'
    };
    
    const mappedData = employeesData.map(emp => ({
      ...emp,
      status: statusMap[emp.status] || emp.status,
      paidThisMonth: !!emp.paidThisMonth // ensure boolean
    }));

    if (role) {
      return res.json({
        success: true,
        filter: { kitchenId, role },
        data: mappedData,
        meta: { total: mappedData.length },
      });
    }

    // Group by kitchen → then by role
    const kitchens = {};
    mappedData.forEach(emp => {
      if (!kitchens[emp.kitchenId]) {
        kitchens[emp.kitchenId] = { kitchenId: emp.kitchenId, kitchenName: emp.kitchenName, employees: [] };
      }
      kitchens[emp.kitchenId].employees.push(emp);
    });

    const result = Object.values(kitchens).map(k => ({
      ...k,
      grouped: groupByRole(k.employees),
      totalEmployees: k.employees.length,
    }));

    res.json({
      success: true,
      filter: { kitchenId },
      data: result,
      meta: { totalKitchens: result.length, totalEmployees: mappedData.length },
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

/**
 * POST /api/employees
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, role, kitchenId, salary } = req.body;

    if (!name || !role || !kitchenId) {
      return res.status(400).json({ success: false, error: 'Nama, jabatan, dan dapur wajib diisi.' });
    }

    const validRoles = ['Ahli Gizi', 'Driver', 'Juru Masak'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, error: `Role tidak valid. Pilih: ${validRoles.join(', ')}` });
    }

    const DEFAULT_SALARY = { 'Ahli Gizi': 5500000, 'Driver': 4200000, 'Juru Masak': 4800000 };
    
    const newId = crypto.randomUUID();
    const newEmp = {
      id: newId,
      kitchen_id: kitchenId,
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@mbg.id`,
      role,
      salary: salary || DEFAULT_SALARY[role] || 4000000,
      status: 'active',
      paid_this_month: false,
    };

    await db('employees').insert(newEmp);

    res.status(201).json({
      success: true,
      data: { id: newId },
      message: `Karyawan "${name}" berhasil ditambahkan.`,
    });
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

/**
 * PUT /api/employees/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const dbUpdates = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.email) dbUpdates.email = updates.email;
    if (updates.role) dbUpdates.role = updates.role;
    if (updates.kitchenId) dbUpdates.kitchen_id = updates.kitchenId;
    if (updates.salary !== undefined) dbUpdates.salary = Number(updates.salary);
    if (updates.status) {
      const statusMap = { 'Active': 'active', 'On Leave': 'on_leave', 'Terminated': 'terminated' };
      dbUpdates.status = statusMap[updates.status] || updates.status;
    }

    const count = await db('employees').where('id', id).update(dbUpdates);
    
    if (count === 0) {
      return res.status(404).json({ success: false, error: `Employee "${id}" tidak ditemukan.` });
    }

    res.json({
      success: true,
      message: `Data karyawan berhasil diperbarui.`,
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

/**
 * DELETE /api/employees/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const count = await db('employees').where('id', id).update({ status: 'terminated' });
    
    if (count === 0) {
      return res.status(404).json({ success: false, error: `Employee "${id}" tidak ditemukan.` });
    }

    res.json({
      success: true,
      message: `Karyawan telah di-offboard (Terminated).`,
    });
  } catch (error) {
    console.error('Error terminating employee:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

/**
 * POST /api/employees/:id/pay
 */
router.post('/:id/pay', async (req, res) => {
  try {
    const { id } = req.params;
    
    const emp = await db('employees')
      .join('kitchens', 'employees.kitchen_id', 'kitchens.id')
      .select('employees.*', 'kitchens.name as kitchenName')
      .where('employees.id', id).first();
      
    if (!emp) {
      return res.status(404).json({ success: false, error: `Employee "${id}" tidak ditemukan.` });
    }

    if (emp.status === 'terminated') {
      return res.status(400).json({ success: false, error: 'Tidak dapat membayar gaji karyawan yang sudah di-terminate.' });
    }

    if (emp.paid_this_month) {
      return res.status(400).json({ success: false, error: `Gaji "${emp.name}" sudah dibayar bulan ini.` });
    }

    // Start transaction
    await db.transaction(async (trx) => {
      // 1. Mark as paid
      await trx('employees').where('id', id).update({ paid_this_month: true });
      
      // 2. Add salary payment record
      await trx('salary_payments').insert({
        id: crypto.randomUUID(),
        employee_id: id,
        kitchen_id: emp.kitchen_id,
        amount: emp.salary,
        period_month: new Date().getMonth() + 1,
        period_year: new Date().getFullYear(),
        status: 'paid',
        paid_at: new Date()
      });
      
      // 3. Add cashflow transaction
      await trx('cashflow_transactions').insert({
        id: crypto.randomUUID(),
        kitchen_id: emp.kitchen_id,
        type: 'out',
        amount: emp.salary,
        description: `Gaji Karyawan: ${emp.name} (${emp.role}) — ${emp.kitchenName}`,
        category: 'Gaji Karyawan',
        transaction_date: new Date()
      });
    });

    res.json({
      success: true,
      message: `Gaji ${emp.name} sebesar Rp ${Number(emp.salary).toLocaleString('id-ID')} berhasil dibayarkan.`,
    });
  } catch (error) {
    console.error('Error paying employee:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// GET /api/employees/kitchen/all is handled by /kitchen/:kitchenId where kitchenId = 'all'

module.exports = router;

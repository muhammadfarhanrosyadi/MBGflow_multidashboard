const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { generateDateFilter, parseReportParams } = require('../services/reportService');

const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(n) || 0);

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
    const filterParams = parseReportParams(req.query);

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

    query = generateDateFilter(query, filterParams.reportType, filterParams.startDate, filterParams.endDate, 'employees.created_at');

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

// ── GET /api/employees/export?format=xlsx|pdf ───────────────────────────────
router.get('/export', async (req, res) => {
  try {
    const { format = 'xlsx' } = req.query;
    const filterParams = parseReportParams(req.query);
    const statusMap = { active: 'Active', on_leave: 'On Leave', terminated: 'Terminated' };

    let query = db('employees')
      .join('kitchens', 'employees.kitchen_id', 'kitchens.id')
      .select(
        'employees.name as nama',
        'employees.role as jabatan',
        'kitchens.name as dapur',
        'employees.salary as gaji',
        'employees.status as status',
        'employees.email'
      )
      .where('employees.status', '!=', 'terminated')
      .orderBy('kitchens.name')
      .orderBy('employees.role');

    query = generateDateFilter(query, filterParams.reportType, filterParams.startDate, filterParams.endDate, 'employees.created_at');
    const employees = await query;

    const rows = employees.map(e => ({
      ...e,
      gaji: formatRupiah(e.gaji),
      status: statusMap[e.status] || e.status,
    }));

    if (format === 'xlsx') {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Data Karyawan');
      if (rows.length > 0) {
        ws.columns = Object.keys(rows[0]).map(k => ({
          header: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          key: k, width: 24,
        }));
        ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B6B45' } };
        rows.forEach(r => ws.addRow(r));
      }
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="karyawan_export.xlsx"');
      await wb.xlsx.write(res);
      res.end();

    } else if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="karyawan_export.pdf"');
      doc.pipe(res);
      doc.fontSize(16).font('Helvetica-Bold').text('Laporan Data Karyawan', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, { align: 'center' });
      doc.moveDown(1);
      if (rows.length > 0) {
        const cols = Object.keys(rows[0]);
        const colW = Math.floor((doc.page.width - 80) / cols.length);
        let y = doc.y;
        doc.rect(40, y, cols.length * colW, 18).fill('#1B6B45');
        cols.forEach((k, i) => {
          doc.fillColor('white').font('Helvetica-Bold').fontSize(8)
             .text(k.toUpperCase(), 40 + i * colW + 3, y + 5, { width: colW - 6, lineBreak: false });
        });
        doc.y = y + 20;
        rows.forEach((row, ri) => {
          y = doc.y + 1;
          if (y > 520) { doc.addPage(); y = 40; }
          doc.rect(40, y, cols.length * colW, 15).fill(ri % 2 === 0 ? '#F9FAFB' : '#FFFFFF');
          cols.forEach((k, i) => {
            doc.fillColor('#111827').font('Helvetica').fontSize(7.5)
               .text(String(row[k] ?? '-').substring(0, 30), 40 + i * colW + 3, y + 4, { width: colW - 6, lineBreak: false });
          });
          doc.y = y + 15;
        });
      }
      doc.end();
    } else {
      res.status(400).json({ success: false, error: 'format harus xlsx atau pdf' });
    }
  } catch (error) {
    console.error('Employee export error:', error);
    res.status(500).json({ success: false, error: 'Export error' });
  }
});

module.exports = router;

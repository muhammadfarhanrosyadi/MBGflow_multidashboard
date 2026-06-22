const express = require('express');
const router = express.Router();
const db = require('../db');
const financeAuditor = require('../services/financeAuditor');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { parseReportParams, generateDateFilter } = require('../services/reportService');

const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(n) || 0);

// ============================================================
// ROUTES
// ============================================================

// GET /api/finance/approvals
router.get('/approvals', async (req, res) => {
  try {
    const approvals = await db('finance_requests')
      .join('kitchens', 'finance_requests.kitchen_id', 'kitchens.id')
      .join('users', 'finance_requests.requested_by', 'users.id')
      .select(
        'finance_requests.id',
        'finance_requests.kitchen_id as kitchenId',
        'kitchens.name as kitchenName',
        'finance_requests.amount as nominal',
        'finance_requests.description as keperluan',
        'finance_requests.status',
        'finance_requests.created_at as requestedAt',
        'finance_requests.ai_notes as aiNotes',
        'users.name as requestedBy'
      )
      .orderBy('finance_requests.created_at', 'desc');

    const mappedApprovals = approvals.map(a => {
      // Map status
      const sMap = { 'pending': 'Pending', 'approved': 'Approved', 'rejected': 'Rejected' };
      
      // format date roughly matching original '2026-05-06 09:00'
      const dt = new Date(a.requestedAt);
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      const hh = String(dt.getHours()).padStart(2, '0');
      const min = String(dt.getMinutes()).padStart(2, '0');
      
      return {
        ...a,
        status: sMap[a.status] || a.status,
        requestedAt: `${yyyy}-${mm}-${dd} ${hh}:${min}`,
        aiNotes: typeof a.aiNotes === 'string' ? JSON.parse(a.aiNotes) : a.aiNotes
      };
    });

    const pendingCount = mappedApprovals.filter(a => a.status === 'Pending').length;

    res.json({
      success: true,
      data: mappedApprovals,
      meta: { total: mappedApprovals.length, pending: pendingCount },
    });
  } catch (error) {
    console.error('Error fetching approvals:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// POST /api/finance/approvals/:id  — body: { action: 'approve' | 'reject' }
router.post('/approvals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, error: 'action harus "approve" atau "reject"' });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    
    // Start transaction since approval might trigger cashflow
    await db.transaction(async (trx) => {
      const updated = await trx('finance_requests')
        .where('id', id)
        .update({ 
          status: newStatus,
          approved_at: new Date()
        });

      if (updated === 0) {
        throw new Error('NOT_FOUND');
      }

      // If approved, optionally log to cashflow. For now, we only update the request status.
      // Usually you'd insert to cashflow_transactions here, but let's stick to the simplest implementation for now.
    });

    res.json({ success: true, message: `Request ${id} berhasil di-${action}` });
  } catch (error) {
    if (error.message === 'NOT_FOUND') {
      return res.status(404).json({ success: false, error: `Approval ID "${req.params.id}" tidak ditemukan` });
    }
    console.error('Error updating approval:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// POST /api/finance/analyze-request/:id
router.post('/analyze-request/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch request details
    const request = await db('finance_requests')
      .join('kitchens', 'finance_requests.kitchen_id', 'kitchens.id')
      .join('users', 'finance_requests.requested_by', 'users.id')
      .select(
        'finance_requests.id',
        'finance_requests.amount as nominal',
        'finance_requests.description as keperluan',
        'kitchens.name as kitchenName',
        'users.name as requestedBy',
        'finance_requests.ai_notes as aiNotes'
      )
      .where('finance_requests.id', id).first();

    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    if (request.aiNotes) {
      return res.json({ success: true, data: typeof request.aiNotes === 'string' ? JSON.parse(request.aiNotes) : request.aiNotes });
    }

    // Call Gemini Service
    const aiResponse = await financeAuditor.analyzeApprovalRequest(request);

    // Save to DB
    await db('finance_requests').where('id', id).update({
      ai_notes: JSON.stringify(aiResponse)
    });

    res.json({ success: true, data: aiResponse });
  } catch (error) {
    console.error('Error analyzing request:', error);
    res.status(500).json({ success: false, error: 'Failed to analyze request' });
  }
});

// GET /api/finance/cashflow
router.get('/cashflow', async (req, res) => {
  try {
    // 1. Fetch transactions
    const txns = await db('cashflow_transactions')
      .orderBy('transaction_date', 'desc')
      .limit(50); // limit to latest 50

    const mappedTxns = txns.map(t => {
      const dt = new Date(t.transaction_date);
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      return {
        id: t.id,
        tanggal: `${yyyy}-${mm}-${dd}`,
        keterangan: t.description,
        type: t.type,
        nominal: Number(t.amount)
      };
    });

    // 2. Compute Summary
    // Since we may not have all data in db, we aggregate what's there
    const aggr = await db('cashflow_transactions')
      .select('type')
      .sum('amount as total')
      .groupBy('type');
      
    let totalIn = 0;
    let totalOut = 0;
    
    aggr.forEach(a => {
      if (a.type === 'in') totalIn = Number(a.total);
      if (a.type === 'out') totalOut = Number(a.total);
    });

    // 3. Fake chart data for the last 6 days based on current date
    // In a real scenario, we'd group by day. Let's do a simple grouping if data exists.
    const chartData = [
      { date: 'Sen', in: 0, out: 0 },
      { date: 'Sel', in: 0, out: 0 },
      { date: 'Rab', in: 0, out: 0 },
      { date: 'Kam', in: 0, out: 0 },
      { date: 'Jum', in: 0, out: 0 },
      { date: 'Sab', in: 0, out: 0 },
    ];
    
    // Group existing transactions by day of week (0=Sun, 1=Mon...6=Sat)
    txns.forEach(t => {
       const d = new Date(t.transaction_date).getDay();
       let idx = d - 1; // Mon = 0
       if (idx < 0) return; // ignore Sunday for now
       if (idx > 5) return; // ignore Sunday for now
       
       if (t.type === 'in') chartData[idx].in += Number(t.amount);
       if (t.type === 'out') chartData[idx].out += Number(t.amount);
    });

    const cashflowData = {
      summary: {
        totalIn,
        totalOut,
        balance: totalIn - totalOut,
        period: 'Data Transaksi',
      },
      chartData,
      transactions: mappedTxns
    };

    res.json({
      success: true,
      data: cashflowData,
      meta: { generatedAt: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Error fetching cashflow:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// GET /api/finance/analyze-cashflow
router.get('/analyze-cashflow', async (req, res) => {
  try {
    // 1. Fetch transactions (last 50 for broad view, gemini service will pick top 15)
    const rawTxns = await db('cashflow_transactions')
      .orderBy('transaction_date', 'desc')
      .limit(50);

    const txns = rawTxns.map(t => {
      const dt = new Date(t.transaction_date);
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      return {
        id: t.id,
        tanggal: `${yyyy}-${mm}-${dd}`,
        keterangan: t.description,
        type: t.type,
        nominal: Number(t.amount)
      };
    });
      
    // 2. Compute Summary
    const aggr = await db('cashflow_transactions')
      .select('type')
      .sum('amount as total')
      .groupBy('type');
      
    let totalIn = 0;
    let totalOut = 0;
    aggr.forEach(a => {
      if (a.type === 'in') totalIn = Number(a.total);
      if (a.type === 'out') totalOut = Number(a.total);
    });

    const summary = {
      totalIn,
      totalOut,
      balance: totalIn - totalOut
    };

    // 3. Call AI
    const aiInsight = await financeAuditor.analyzeCashflow(summary, txns);
    
    res.json({ success: true, data: aiInsight });
  } catch (error) {
    console.error('Error analyzing cashflow:', error);
    res.status(500).json({ success: false, error: 'Failed to analyze cashflow' });
  }
});

// GET /api/finance/kitchen-balance — Saldo per dapur + penggajian + approval pending
router.get('/kitchen-balance', async (req, res) => {
  try {
    // 1. Ambil semua dapur aktif
    const kitchens = await db('kitchens')
      .where('status', '!=', 'inactive')
      .select('id', 'name', 'city', 'status');

    const result = [];

    for (const k of kitchens) {
      // 2. Hitung pemasukan & pengeluaran dari cashflow_transactions
      const cfAggr = await db('cashflow_transactions')
        .where('kitchen_id', k.id)
        .select('type')
        .sum('amount as total')
        .groupBy('type');

      let totalIn = 0, totalOut = 0;
      cfAggr.forEach(a => {
        if (a.type === 'in') totalIn = Number(a.total);
        if (a.type === 'out') totalOut = Number(a.total);
      });

      // 3. Hitung total gaji karyawan di dapur ini
      const [salaryAggr] = await db('employees')
        .where('kitchen_id', k.id)
        .where('status', '!=', 'terminated')
        .select(
          db.raw('SUM(salary) as totalSalary'),
          db.raw('COUNT(*) as totalEmployees'),
          db.raw('SUM(CASE WHEN paid_this_month = true THEN 1 ELSE 0 END) as paidCount')
        );

      const totalSalary = Number(salaryAggr?.totalSalary || 0);
      const totalEmployees = Number(salaryAggr?.totalEmployees || 0);
      const paidCount = Number(salaryAggr?.paidCount || 0);
      const unpaidCount = totalEmployees - paidCount;

      // 4. Hitung approval pending
      const [pendingAggr] = await db('finance_requests')
        .where('kitchen_id', k.id)
        .where('status', 'pending')
        .select(
          db.raw('COUNT(*) as pendingCount'),
          db.raw('COALESCE(SUM(amount), 0) as pendingAmount')
        );

      const pendingCount = Number(pendingAggr?.pendingCount || 0);
      const pendingAmount = Number(pendingAggr?.pendingAmount || 0);

      result.push({
        kitchenId: k.id,
        kitchenName: k.name,
        city: k.city,
        status: k.status,
        totalIn,
        totalOut,
        balance: totalIn - totalOut,
        payroll: {
          totalSalary,
          totalEmployees,
          paidCount,
          unpaidCount,
          unpaidAmount: (unpaidCount / totalEmployees) * totalSalary || 0,
        },
        pendingApproval: {
          count: pendingCount,
          amount: pendingAmount,
        },
      });
    }

    // Grand total
    const grandTotalIn = result.reduce((s, r) => s + r.totalIn, 0);
    const grandTotalOut = result.reduce((s, r) => s + r.totalOut, 0);
    const grandTotalSalary = result.reduce((s, r) => s + r.payroll.totalSalary, 0);
    const grandTotalUnpaid = result.reduce((s, r) => s + r.payroll.unpaidAmount, 0);
    const grandPendingAmount = result.reduce((s, r) => s + r.pendingApproval.amount, 0);
    const grandPendingCount = result.reduce((s, r) => s + r.pendingApproval.count, 0);

    res.json({
      success: true,
      data: {
        grandTotal: {
          totalIn: grandTotalIn,
          totalOut: grandTotalOut,
          balance: grandTotalIn - grandTotalOut,
          totalSalary: grandTotalSalary,
          unpaidSalary: grandTotalUnpaid,
          pendingApprovalAmount: grandPendingAmount,
          pendingApprovalCount: grandPendingCount,
        },
        kitchens: result,
      },
    });
  } catch (error) {
    console.error('Error fetching kitchen balance:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// ── GET /api/finance/export?type=approvals|cashflow&format=xlsx|pdf ───────────
router.get('/export', async (req, res) => {
  try {
    const { type = 'cashflow', format = 'xlsx' } = req.query;
    const { reportType, startDate, endDate } = parseReportParams(req.query);

    let rows = [];
    let title = '';

    if (type === 'approvals') {
      title = 'Laporan Approval Dana';
      let q = db('finance_requests')
        .join('kitchens', 'finance_requests.kitchen_id', 'kitchens.id')
        .join('users', 'finance_requests.requested_by', 'users.id')
        .select(
          'finance_requests.id',
          'kitchens.name as dapur',
          'finance_requests.description as keperluan',
          'finance_requests.amount as nominal',
          'users.name as pemohon',
          'finance_requests.status',
          'finance_requests.created_at as tanggal'
        )
        .orderBy('finance_requests.created_at', 'desc');
      if (reportType) q = generateDateFilter(q, reportType, startDate, endDate, 'finance_requests.created_at');
      rows = (await q).map(r => ({
        ...r, nominal: formatRupiah(r.nominal),
        tanggal: r.tanggal ? new Date(r.tanggal).toLocaleDateString('id-ID') : '-',
      }));

    } else {
      title = 'Laporan Cash Flow';
      let q = db('cashflow_transactions').orderBy('transaction_date', 'desc');
      if (reportType) q = generateDateFilter(q, reportType, startDate, endDate, 'transaction_date');
      rows = (await q).map(t => ({
        id: t.id,
        tanggal: t.transaction_date ? new Date(t.transaction_date).toLocaleDateString('id-ID') : '-',
        keterangan: t.description,
        tipe: t.type === 'in' ? 'Masuk' : 'Keluar',
        nominal: formatRupiah(t.amount),
      }));
    }

    if (format === 'xlsx') {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet(title);
      if (rows.length > 0) {
        ws.columns = Object.keys(rows[0]).map(k => ({
          header: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          key: k, width: 22,
        }));
        ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B6B45' } };
        rows.forEach(r => ws.addRow(r));
      }
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="finance_${type}.xlsx"`);
      await wb.xlsx.write(res);
      res.end();

    } else if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="finance_${type}.pdf"`);
      doc.pipe(res);
      doc.fontSize(16).font('Helvetica-Bold').text(title, { align: 'center' });
      doc.fontSize(10).font('Helvetica').text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, { align: 'center' });
      doc.moveDown(1);
      if (rows.length > 0) {
        const cols = Object.keys(rows[0]).filter(k => k !== 'id');
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
    console.error('Finance export error:', error);
    res.status(500).json({ success: false, error: 'Export error' });
  }
});

module.exports = router;


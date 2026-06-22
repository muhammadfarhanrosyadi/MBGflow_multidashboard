const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const vendorService = require('../services/vendorService');

// ── Error handler helper ──────────────────────────────────────────────────────
function handleError(res, err) {
  const status = err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan pada server';
  console.error('[VendorController]', err.message);
  return res.status(status).json({ success: false, message });
}

// ── GET /api/vendors ──────────────────────────────────────────────────────────
async function getAllVendors(req, res) {
  try {
    const vendors = await vendorService.listVendors(req.query);
    res.json({ success: true, data: vendors, meta: { total: vendors.length } });
  } catch (err) { handleError(res, err); }
}

// ── GET /api/vendors/stats ────────────────────────────────────────────────────
async function getVendorStats(req, res) {
  try {
    const stats = await vendorService.getVendorStats();
    res.json({ success: true, data: stats });
  } catch (err) { handleError(res, err); }
}

// ── GET /api/vendors/pending ──────────────────────────────────────────────────
async function getPendingVendors(req, res) {
  try {
    const vendors = await vendorService.listPendingVendors();
    res.json({ success: true, data: vendors, meta: { total: vendors.length } });
  } catch (err) { handleError(res, err); }
}

// ── GET /api/vendors/export ───────────────────────────────────────────────────
async function exportVendors(req, res) {
  try {
    const { format = 'xlsx' } = req.query;
    const vendors = await vendorService.listVendors(req.query);

    if (format === 'xlsx') {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Vendor List');

      // Header styling
      ws.columns = [
        { header: 'ID',              key: 'id',              width: 8  },
        { header: 'Nama Vendor',     key: 'name',            width: 28 },
        { header: 'PIC',             key: 'contact_person',  width: 22 },
        { header: 'Telepon',         key: 'phone',           width: 18 },
        { header: 'Email',           key: 'email',           width: 28 },
        { header: 'Alamat',          key: 'address',         width: 35 },
        { header: 'Status',          key: 'approval_status', width: 14 },
        { header: 'Disetujui Oleh',  key: 'approver_name',  width: 20 },
        { header: 'Tgl Persetujuan', key: 'approved_at',    width: 20 },
        { header: 'Tgl Daftar',      key: 'created_at',     width: 20 },
      ];

      // Header row styling
      ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B6B45' } };
      ws.getRow(1).alignment = { horizontal: 'center' };

      // Status badge colours
      const statusColors = { approved: 'FF22A06B', rejected: 'FFEF4444', pending: 'FFFBBF24' };

      vendors.forEach(v => {
        const row = ws.addRow({
          ...v,
          approved_at: v.approved_at ? new Date(v.approved_at).toLocaleDateString('id-ID') : '-',
          created_at:  v.created_at  ? new Date(v.created_at).toLocaleDateString('id-ID')  : '-',
        });
        const statusCell = row.getCell('approval_status');
        statusCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        statusCell.fill = {
          type: 'pattern', pattern: 'solid',
          fgColor: { argb: statusColors[v.approval_status] || 'FF999999' },
        };
        statusCell.alignment = { horizontal: 'center' };
      });

      ws.getRow(1).height = 22;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="vendor_list.xlsx"');
      await wb.xlsx.write(res);
      res.end();

    } else if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="vendor_list.pdf"');
      doc.pipe(res);

      // Title
      doc.fontSize(16).font('Helvetica-Bold').text('Laporan Daftar Vendor', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, { align: 'center' });
      doc.moveDown(1);

      // Table header
      const cols = { x: 40, widths: [30, 120, 90, 80, 110, 80, 65, 90, 80] };
      const headers = ['ID', 'Nama Vendor', 'PIC', 'Telepon', 'Email', 'Alamat', 'Status', 'Disetujui', 'Tgl Daftar'];
      let y = doc.y;
      doc.rect(cols.x, y, cols.widths.reduce((s,w) => s+w, 0), 18).fill('#1B6B45');
      let xOff = cols.x;
      headers.forEach((h, i) => {
        doc.fillColor('white').font('Helvetica-Bold').fontSize(8).text(h, xOff + 3, y + 5, { width: cols.widths[i] - 6, lineBreak: false });
        xOff += cols.widths[i];
      });
      doc.moveDown(0.1);

      // Table rows
      vendors.forEach((v, rowIdx) => {
        y = doc.y + 2;
        if (y > 520) { doc.addPage(); y = 40; }

        const bg = rowIdx % 2 === 0 ? '#F9FAFB' : '#FFFFFF';
        const rowHeight = 16;
        doc.rect(cols.x, y, cols.widths.reduce((s,w)=>s+w,0), rowHeight).fill(bg);

        const statusColors2 = { approved: '#22A06B', rejected: '#EF4444', pending: '#F59E0B' };
        const cells = [
          String(v.id),
          v.name || '-',
          v.contact_person || '-',
          v.phone || '-',
          v.email || '-',
          (v.address || '-').substring(0, 30),
          v.approval_status || '-',
          v.approver_name || '-',
          v.created_at ? new Date(v.created_at).toLocaleDateString('id-ID') : '-',
        ];

        xOff = cols.x;
        cells.forEach((cell, i) => {
          const color = i === 6 ? (statusColors2[v.approval_status] || '#666') : '#111827';
          doc.fillColor(color).font(i === 6 ? 'Helvetica-Bold' : 'Helvetica').fontSize(7.5)
             .text(cell, xOff + 3, y + 4, { width: cols.widths[i] - 6, lineBreak: false });
          xOff += cols.widths[i];
        });
        doc.y = y + rowHeight;
      });

      doc.end();
    } else {
      res.status(400).json({ success: false, message: 'format harus xlsx atau pdf' });
    }
  } catch (err) { handleError(res, err); }
}

// ── GET /api/vendors/:id ──────────────────────────────────────────────────────
async function getVendorById(req, res) {
  try {
    const vendor = await vendorService.getVendorById(req.params.id);
    res.json({ success: true, data: vendor });
  } catch (err) { handleError(res, err); }
}

// ── POST /api/vendors ─────────────────────────────────────────────────────────
async function createVendor(req, res) {
  try {
    const userId = req.user?.id || null;
    const vendor = await vendorService.createVendor(req.body, userId);
    res.status(201).json({ success: true, data: vendor, message: 'Vendor berhasil didaftarkan dengan status pending.' });
  } catch (err) { handleError(res, err); }
}

// ── PUT /api/vendors/:id ──────────────────────────────────────────────────────
async function updateVendor(req, res) {
  try {
    const vendor = await vendorService.updateVendor(req.params.id, req.body);
    res.json({ success: true, data: vendor, message: 'Vendor berhasil diperbarui.' });
  } catch (err) { handleError(res, err); }
}

// ── DELETE /api/vendors/:id ───────────────────────────────────────────────────
async function deleteVendor(req, res) {
  try {
    await vendorService.deleteVendor(req.params.id);
    res.json({ success: true, message: 'Vendor berhasil dihapus.' });
  } catch (err) { handleError(res, err); }
}

// ── POST /api/vendors/:id/approve ────────────────────────────────────────────
async function approveVendor(req, res) {
  try {
    const userId = req.user?.id || null;
    const { notes } = req.body;
    const vendor = await vendorService.approveVendor(req.params.id, userId, notes);
    res.json({ success: true, data: vendor, message: 'Vendor berhasil disetujui.' });
  } catch (err) { handleError(res, err); }
}

// ── POST /api/vendors/:id/reject ─────────────────────────────────────────────
async function rejectVendor(req, res) {
  try {
    const userId = req.user?.id || null;
    const { reason, notes } = req.body;

    if (!reason || String(reason).trim() === '') {
      return res.status(400).json({ success: false, message: 'Alasan penolakan (reason) wajib diisi.' });
    }

    const vendor = await vendorService.rejectVendor(req.params.id, userId, reason, notes);
    res.json({ success: true, data: vendor, message: 'Vendor berhasil ditolak.' });
  } catch (err) { handleError(res, err); }
}

// ── GET /api/vendors/:id/logs ─────────────────────────────────────────────────
async function getVendorLogs(req, res) {
  try {
    const logs = await vendorService.getVendorLogs(req.params.id);
    res.json({ success: true, data: logs, meta: { total: logs.length } });
  } catch (err) { handleError(res, err); }
}

module.exports = {
  getAllVendors,
  getVendorStats,
  getPendingVendors,
  exportVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
  approveVendor,
  rejectVendor,
  getVendorLogs,
};

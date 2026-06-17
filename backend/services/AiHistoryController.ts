/**
 * AiHistoryController.ts
 * ──────────────────────────────────────────────────────────────
 * HTTP layer for Universal AI History endpoints.
 *
 * Endpoints:
 *  GET  /api/ai/history/:module_name            → paginated list
 *  POST /api/ai/history                         → save new prediction
 *  GET  /api/ai/history/export/:module_name     → download XLSX or PDF
 *    query param: ?format=xlsx  (default) | pdf
 * ──────────────────────────────────────────────────────────────
 */

import { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

import {
  AiHistoryService,
  MODULE_NAMES,
  type ModuleName,
  type SavePredictionDTO,
} from './AiHistoryService';

// ── Helpers ───────────────────────────────────────────────────────────────────

function isValidModule(value: unknown): value is ModuleName {
  return MODULE_NAMES.includes(value as ModuleName);
}

/** Flatten a prediction_result JSON object into an ordered key=value string for PDF cells. */
function flattenResult(obj: Record<string, unknown>): string {
  return Object.entries(obj)
    .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
    .join('\n');
}

// ── Column definitions for Excel export (per module) ─────────────────────────

const MODULE_EXCEL_COLUMNS: Record<ModuleName, { header: string; key: string }[]> = {
  inventory: [
    { header: 'Kitchen',            key: 'kitchen_name' },
    { header: 'Prediction Date',    key: 'prediction_date' },
    { header: 'Stock Level',        key: 'stock_level' },
    { header: 'Reorder Point',      key: 'reorder_point' },
    { header: 'Shortage Days',      key: 'predicted_shortage_days' },
    { header: 'Items at Risk',      key: 'items_at_risk' },
    { header: 'Recommendations',    key: 'recommendations' },
  ],
  production: [
    { header: 'Kitchen',            key: 'kitchen_name' },
    { header: 'Prediction Date',    key: 'prediction_date' },
    { header: 'Predicted Output',   key: 'predicted_output' },
    { header: 'Efficiency Rate (%)', key: 'efficiency_rate' },
    { header: 'Waste (kg)',         key: 'waste_kg' },
    { header: 'Recommendations',   key: 'recommendations' },
  ],
  distribution: [
    { header: 'Kitchen',            key: 'kitchen_name' },
    { header: 'Prediction Date',    key: 'prediction_date' },
    { header: 'Delay Risk (%)',     key: 'delay_risk_pct' },
    { header: 'On-Time Rate (%)',   key: 'on_time_rate' },
    { header: 'Deliveries',        key: 'delivery_count' },
    { header: 'Routes at Risk',    key: 'routes_at_risk' },
    { header: 'Recommendations',   key: 'recommendations' },
  ],
  finance: [
    { header: 'Kitchen',            key: 'kitchen_name' },
    { header: 'Prediction Date',    key: 'prediction_date' },
    { header: 'Predicted Revenue',  key: 'predicted_revenue' },
    { header: 'Cost Variance',      key: 'cost_variance' },
    { header: 'Cashflow 7d (IDR)',  key: 'cashflow_7d' },
    { header: 'Budget Utilisation (%)', key: 'budget_utilisation' },
    { header: 'Alerts',            key: 'alerts' },
  ],
  employee: [
    { header: 'Kitchen',            key: 'kitchen_name' },
    { header: 'Prediction Date',    key: 'prediction_date' },
    { header: 'Attendance Rate (%)', key: 'attendance_rate' },
    { header: 'Overtime Hours',    key: 'overtime_hours' },
    { header: 'Performance Score', key: 'performance_score' },
    { header: 'Flagged Employees', key: 'flagged_count' },
    { header: 'Recommendations',   key: 'recommendations' },
  ],
};

// ── GET /api/ai/history/:module_name ─────────────────────────────────────────

export async function getHistory(req: Request, res: Response): Promise<void> {
  try {
    const { module_name } = req.params;

    if (!isValidModule(module_name)) {
      res.status(400).json({
        success: false,
        error: `module_name tidak valid. Harus salah satu dari: ${MODULE_NAMES.join(', ')}`,
      });
      return;
    }

    const {
      kitchen_id,
      search,
      limit: limitParam = '50',
      page:  pageParam  = '1',
    } = req.query as Record<string, string>;

    const limit  = Math.min(Math.max(parseInt(limitParam) || 50, 1), 200);
    const page   = Math.max(parseInt(pageParam)  || 1, 1);
    const offset = (page - 1) * limit;

    const [history, total] = await Promise.all([
      AiHistoryService.getHistory({ module_name, kitchen_id, search, limit, offset }),
      AiHistoryService.countHistory({ module_name, kitchen_id, search }),
    ]);

    res.json({
      success: true,
      module_name,
      data: history,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[AiHistoryController] getHistory error:', msg);
    res.status(500).json({ success: false, error: 'Gagal mengambil riwayat AI: ' + msg });
  }
}

// ── POST /api/ai/history ──────────────────────────────────────────────────────

export async function saveHistory(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as Partial<SavePredictionDTO>;

    const missing: string[] = [];
    if (!body.kitchen_id)      missing.push('kitchen_id');
    if (!body.module_name)     missing.push('module_name');
    if (!body.prediction_date) missing.push('prediction_date');
    if (!body.prediction_result) missing.push('prediction_result');

    if (missing.length > 0) {
      res.status(400).json({ success: false, error: `Field wajib: ${missing.join(', ')}` });
      return;
    }

    if (!isValidModule(body.module_name)) {
      res.status(400).json({
        success: false,
        error: `module_name tidak valid. Pilihan: ${MODULE_NAMES.join(', ')}`,
      });
      return;
    }

    const record = await AiHistoryService.savePrediction(body as SavePredictionDTO);
    res.status(201).json({ success: true, message: 'Prediksi disimpan.', data: record });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[AiHistoryController] saveHistory error:', msg);
    res.status(500).json({ success: false, error: 'Gagal menyimpan prediksi: ' + msg });
  }
}

// ── GET /api/ai/history/export/:module_name ───────────────────────────────────

export async function exportHistory(req: Request, res: Response): Promise<void> {
  try {
    const { module_name } = req.params;
    const format = (req.query.format as string || 'xlsx').toLowerCase();

    if (!isValidModule(module_name)) {
      res.status(400).json({ success: false, error: 'module_name tidak valid.' });
      return;
    }

    if (!['xlsx', 'pdf'].includes(format)) {
      res.status(400).json({ success: false, error: 'format harus "xlsx" atau "pdf".' });
      return;
    }

    const rows = await AiHistoryService.getAllForExport(module_name);
    const moduleLabel = module_name.charAt(0).toUpperCase() + module_name.slice(1);
    const filename    = `AI_History_${moduleLabel}_${new Date().toISOString().slice(0, 10)}`;

    // ── XLSX Export ───────────────────────────────────────────────────────────
    if (format === 'xlsx') {
      const workbook  = new ExcelJS.Workbook();
      workbook.creator = 'SCM MBG Platform';
      workbook.created  = new Date();

      const sheet = workbook.addWorksheet(`${moduleLabel} AI History`);
      const cols  = MODULE_EXCEL_COLUMNS[module_name];

      // ── Header row ────────────────────────────────────────────
      sheet.columns = cols.map(c => ({ header: c.header, key: c.key, width: 22 }));

      // Style header
      const headerRow = sheet.getRow(1);
      headerRow.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      headerRow.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B6B45' } };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
      headerRow.height    = 28;

      // ── Data rows ─────────────────────────────────────────────
      rows.forEach((r, idx) => {
        const result = r.prediction_result;
        const rowData: Record<string, unknown> = {
          kitchen_name:   r.kitchen_name,
          prediction_date: r.prediction_date,
          ...result,
        };
        const dataRow = sheet.addRow(cols.map(c => {
          const v = rowData[c.key];
          return Array.isArray(v) ? (v as unknown[]).join(', ') : v ?? '—';
        }));

        // Alternating row background
        if (idx % 2 === 0) {
          dataRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4F6F9' } };
        }
        dataRow.height = 20;
      });

      // ── Borders on all cells ───────────────────────────────────
      sheet.eachRow(row => {
        row.eachCell(cell => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE8EBF0' } },
            bottom: { style: 'thin', color: { argb: 'FFE8EBF0' } },
            left: { style: 'thin', color: { argb: 'FFE8EBF0' } },
            right: { style: 'thin', color: { argb: 'FFE8EBF0' } },
          };
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);

      const buffer = await workbook.xlsx.writeBuffer();
      res.send(buffer);
      return;
    }

    // ── PDF Export ────────────────────────────────────────────────────────────
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
    doc.pipe(res);

    // ── Title block ───────────────────────────────────────────────
    doc
      .rect(0, 0, doc.page.width, 70)
      .fill('#1B6B45');

    doc
      .fillColor('#FFFFFF')
      .fontSize(18)
      .font('Helvetica-Bold')
      .text(`SCM MBG — AI History: ${moduleLabel}`, 40, 18)
      .fontSize(10)
      .font('Helvetica')
      .text(`Generated: ${new Date().toLocaleString('id-ID')}   |   Total Records: ${rows.length}`, 40, 45);

    doc.moveDown(4);
    doc.fillColor('#1A1D23');

    const cols = MODULE_EXCEL_COLUMNS[module_name];
    const colW = (doc.page.width - 80) / cols.length;
    const startX = 40;
    let   y      = 90;

    // ── Table header ───────────────────────────────────────────────
    doc.rect(startX, y, doc.page.width - 80, 20).fill('#E6F5EE');
    doc.fillColor('#1B6B45').font('Helvetica-Bold').fontSize(8);

    cols.forEach((c, i) => {
      doc.text(c.header, startX + i * colW + 4, y + 5, { width: colW - 4, ellipsis: true });
    });
    y += 20;

    // ── Table rows ─────────────────────────────────────────────────
    rows.forEach((r, idx) => {
      const result = r.prediction_result;
      const data: Record<string, unknown> = {
        kitchen_name:    r.kitchen_name,
        prediction_date: r.prediction_date,
        ...result,
      };

      const rowHeight = 30;

      // Alternating background
      if (idx % 2 === 0) {
        doc.rect(startX, y, doc.page.width - 80, rowHeight).fill('#F8F9FC');
      }

      doc.fillColor('#6B7280').font('Helvetica').fontSize(7.5);

      cols.forEach((c, i) => {
        const v = data[c.key];
        const text = Array.isArray(v) ? (v as unknown[]).join(', ') : String(v ?? '—');
        doc.text(text, startX + i * colW + 4, y + 4, {
          width: colW - 8,
          height: rowHeight - 4,
          ellipsis: true,
        });
      });

      // Row bottom border
      doc
        .moveTo(startX, y + rowHeight)
        .lineTo(startX + (doc.page.width - 80), y + rowHeight)
        .strokeColor('#E8EBF0')
        .lineWidth(0.5)
        .stroke();

      y += rowHeight;

      // Page break if needed
      if (y > doc.page.height - 60) {
        doc.addPage({ layout: 'landscape' });
        y = 40;
      }
    });

    doc.end();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[AiHistoryController] exportHistory error:', msg);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Gagal mengekspor data: ' + msg });
    }
  }
}

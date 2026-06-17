/**
 * AiHistoryController.ts — updated for corrected schema
 * ──────────────────────────────────────────────────────────────
 * - module_name now accepts any string (matching frontend IDs)
 * - kitchen_id optional in saveHistory
 * - Export columns unified to show the AI result fields
 *   (kesimpulan, temuanMasalah, analisisAI, solusiStrategis, confidence)
 *   which are the standard shape from masterAnalyst.js
 * ──────────────────────────────────────────────────────────────
 */

import { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

import { AiHistoryService, MODULE_NAMES } from './AiHistoryService';

// ── Helpers ───────────────────────────────────────────────────────────────────

function isValidModule(v: unknown): boolean {
  return typeof v === 'string' && v.trim().length > 0;
}

/** Flatten arrays and objects in prediction_result to readable strings */
function fmtCell(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (Array.isArray(v)) return (v as unknown[]).join(' | ');
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

// ── Standard AI result export columns (matches masterAnalyst output) ──────────

const STANDARD_AI_COLUMNS = [
  { header: 'Dapur / Konteks',       key: 'kitchen_name'      },
  { header: 'Modul',                 key: 'module_label'       },
  { header: 'Tanggal Analisis',      key: 'prediction_date'    },
  { header: 'Kesimpulan',            key: 'kesimpulan'         },
  { header: 'Temuan Masalah',        key: 'temuanMasalah'      },
  { header: 'Analisis AI',           key: 'analisisAI'         },
  { header: 'Solusi Strategis',      key: 'solusiStrategis'    },
  { header: 'Confidence Score (%)',  key: 'confidenceScore'    },
  { header: 'Sumber',                key: 'source'             },
];

// ── GET /api/ai/history/:module_name ─────────────────────────────────────────

export async function getHistory(req: Request, res: Response): Promise<void> {
  try {
    const { module_name } = req.params;

    if (!isValidModule(module_name)) {
      res.status(400).json({ success: false, error: 'module_name tidak valid.' });
      return;
    }

    const {
      kitchen_id,
      search,
      limit: limitParam = '50',
      page:  pageParam  = '1',
    } = req.query as Record<string, string>;

    const limit  = Math.min(Math.max(parseInt(limitParam) || 50, 1), 200);
    const page   = Math.max(parseInt(pageParam) || 1, 1);
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
    res.status(500).json({ success: false, error: 'Gagal mengambil riwayat AI: ' + msg });
  }
}

// ── GET /api/ai/history (all modules, no filter) ─────────────────────────────

export async function getAllHistory(req: Request, res: Response): Promise<void> {
  try {
    const {
      search,
      limit: limitParam = '50',
      page:  pageParam  = '1',
    } = req.query as Record<string, string>;

    const limit  = Math.min(Math.max(parseInt(limitParam) || 50, 1), 200);
    const page   = Math.max(parseInt(pageParam) || 1, 1);
    const offset = (page - 1) * limit;

    const [history, total] = await Promise.all([
      AiHistoryService.getHistory({ search, limit, offset }),
      AiHistoryService.countHistory({ search }),
    ]);

    res.json({
      success: true,
      module_name: 'all',
      data: history,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: 'Gagal mengambil riwayat AI: ' + msg });
  }
}

// ── POST /api/ai/history ─────────────────────────────────────────────────────

export async function saveHistory(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as {
      kitchen_id?: string;
      module_name?: string;
      module_label?: string;
      prediction_date?: string;
      prediction_result?: Record<string, unknown>;
    };

    const missing: string[] = [];
    if (!body.module_name)       missing.push('module_name');
    if (!body.prediction_date)   missing.push('prediction_date');
    if (!body.prediction_result) missing.push('prediction_result');

    if (missing.length > 0) {
      res.status(400).json({ success: false, error: `Field wajib: ${missing.join(', ')}` });
      return;
    }

    const record = await AiHistoryService.savePrediction({
      kitchen_id:        body.kitchen_id ?? null,
      module_name:       body.module_name!,
      module_label:      body.module_label ?? null,
      prediction_date:   body.prediction_date!,
      prediction_result: body.prediction_result!,
    });

    res.status(201).json({ success: true, message: 'Prediksi disimpan.', data: record });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
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

    // Support 'all' as a special module_name to export all modules
    const rows = module_name === 'all'
      ? await AiHistoryService.getAllForExport('')   // see note in service
      : await AiHistoryService.getAllForExport(module_name);

    const moduleLabel = module_name === 'all' ? 'Semua Modul' :
      rows[0]?.module_label ?? module_name;
    const filename = `AI_History_${module_name}_${new Date().toISOString().slice(0, 10)}`;

    // ── XLSX ──────────────────────────────────────────────────────────────────
    if (format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SCM MBG Platform';
      workbook.created = new Date();

      const sheet = workbook.addWorksheet(`AI History — ${moduleLabel}`);
      sheet.columns = STANDARD_AI_COLUMNS.map(c => ({
        header: c.header, key: c.key, width: c.key === 'kesimpulan' || c.key === 'analisisAI' ? 45 : 22,
      }));

      // Style header
      const hRow = sheet.getRow(1);
      hRow.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
      hRow.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B6B45' } };
      hRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      hRow.height    = 30;

      rows.forEach((r, idx) => {
        const res_data = r.prediction_result as Record<string, unknown>;
        const rowData: Record<string, unknown> = {
          kitchen_name:   r.kitchen_name,
          module_label:   r.module_label ?? r.module_name,
          prediction_date: r.prediction_date,
          kesimpulan:     fmtCell(res_data.kesimpulan),
          temuanMasalah:  fmtCell(res_data.temuanMasalah),
          analisisAI:     fmtCell(res_data.analisisAI),
          solusiStrategis: fmtCell(res_data.solusiStrategis),
          confidenceScore: res_data.confidenceScore ?? '—',
          source:         res_data.source ?? '—',
        };

        const dataRow = sheet.addRow(STANDARD_AI_COLUMNS.map(c => rowData[c.key] ?? '—'));
        if (idx % 2 === 0) {
          dataRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4F6F9' } };
        }
        dataRow.alignment = { wrapText: true, vertical: 'top' };
        dataRow.height = 60;
      });

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

    // ── PDF ───────────────────────────────────────────────────────────────────
    // IMPORTANT: we generate the PDF into an in-memory buffer first,
    // then send it in one shot.  Piping directly to `res` causes "Failed to
    // fetch" on the client when any render call throws, because Express has
    // already started the HTTP response before we can send an error JSON body.
    const { PassThrough } = require('stream') as typeof import('stream');

    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });

    // Collect chunks from the PDF stream
    const pdfBuffer: Buffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      const passThrough = new PassThrough();

      doc.pipe(passThrough);

      passThrough.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
      passThrough.on('end',  () => resolve(Buffer.concat(chunks)));
      passThrough.on('error', reject);

      try {
        // ── Title block ───────────────────────────────────────────────
        doc.rect(0, 0, doc.page.width, 70).fill('#1B6B45');
        doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold')
          .text(`SCM MBG — Riwayat AI: ${moduleLabel}`, 40, 18);
        doc.fontSize(8.5).font('Helvetica')
          .text(`Digenerate: ${new Date().toLocaleString('id-ID')}   |   Total: ${rows.length} catatan`, 40, 44);

        doc.fillColor('#1A1D23');

        const cols = [
          { key: 'kitchen_name',    label: 'Dapur',        w: 90  },
          { key: 'module_label',    label: 'Modul',        w: 85  },
          { key: 'prediction_date', label: 'Tanggal',      w: 80  },
          { key: 'kesimpulan',      label: 'Kesimpulan',   w: 175 },
          { key: 'solusiStrategis', label: 'Solusi',       w: 175 },
          { key: 'confidenceScore', label: 'Conf.%',       w: 50  },
        ];

        let y = 90;

        // ── Table header ──────────────────────────────────────────────
        doc.rect(40, y, doc.page.width - 80, 22).fill('#E6F5EE');
        doc.fillColor('#1B6B45').font('Helvetica-Bold').fontSize(7.5);
        let x = 40;
        cols.forEach(c => {
          doc.text(c.label, x + 3, y + 6, { width: c.w - 4, ellipsis: true });
          x += c.w;
        });
        y += 22;

        if (rows.length === 0) {
          // Empty state
          doc.fillColor('#9CA3AF').font('Helvetica').fontSize(11)
            .text('Belum ada data analisis untuk diekspor.', 40, y + 30, { align: 'center' });
        }

        // ── Data rows ─────────────────────────────────────────────────
        rows.forEach((r, idx) => {
          const rd = r.prediction_result as Record<string, unknown>;
          const rowData: Record<string, string> = {
            kitchen_name:    r.kitchen_name ?? 'Global',
            module_label:    String(r.module_label ?? r.module_name),
            prediction_date: String(r.prediction_date ?? '').slice(0, 16),
            kesimpulan:      fmtCell(rd.kesimpulan).slice(0, 220),
            solusiStrategis: fmtCell(rd.solusiStrategis).slice(0, 220),
            confidenceScore: String(rd.confidenceScore ?? '—'),
          };

          const rowH = 52;
          if (idx % 2 === 0) {
            doc.rect(40, y, doc.page.width - 80, rowH).fill('#F8F9FC');
          }

          doc.fillColor('#374151').font('Helvetica').fontSize(7);
          x = 40;
          cols.forEach(c => {
            doc.text(rowData[c.key] ?? '—', x + 3, y + 5, {
              width: c.w - 6,
              height: rowH - 8,
              ellipsis: true,
            });
            x += c.w;
          });

          doc.moveTo(40, y + rowH)
            .lineTo(40 + (doc.page.width - 80), y + rowH)
            .strokeColor('#E5E7EB').lineWidth(0.5).stroke();

          y += rowH;

          if (y > doc.page.height - 70) {
            doc.addPage({ size: 'A4', layout: 'landscape' });
            y = 40;
          }
        });

        doc.end();   // finalize — triggers 'end' on passThrough
      } catch (genErr) {
        reject(genErr);
      }
    });

    // All good — send the buffer
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
    res.setHeader('Content-Length', String(pdfBuffer.length));
    res.send(pdfBuffer);

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[AiHistoryController] exportHistory PDF error:', msg);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Gagal mengekspor PDF: ' + msg });
    }
  }
}


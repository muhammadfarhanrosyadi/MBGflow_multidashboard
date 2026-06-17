const express = require('express');
const router  = express.Router();

const { generateStockPrediction } = require('../services/aiPrediction');
const { analyzeModuleData }       = require('../services/masterAnalyst');

// ── Import Universal AI History controller (TypeScript via ts-node) ───────────
const {
  getHistory,
  getAllHistory,
  saveHistory,
  exportHistory,
} = require('../services/AiHistoryController');

// Import AiHistoryService directly for auto-save inside the analyze endpoint
const { AiHistoryService } = require('../services/AiHistoryService');

// ── GET /api/ai/predict-stock ─────────────────────────────────────────────────
router.get('/predict-stock', (req, res) => {
  try {
    const predictions = generateStockPrediction();
    res.json({
      success:   true,
      timestamp: new Date().toISOString(),
      predictions: {
        beras:  predictions.beras,
        telur:  Math.round(predictions.telur),
        minyak: predictions.minyak,
      },
      message: 'Prediksi stok minggu depan berhasil dibuat',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating prediction: ' + error.message });
  }
});

// ── POST /api/ai/analyze ──────────────────────────────────────────────────────
// Body: { moduleName, moduleLabel, tableData, chartData, kitchen_id? }
//
// After a successful analysis, the result is AUTOMATICALLY saved to
// universal_ai_histories so the history dashboard always stays up-to-date.
router.post('/analyze', async (req, res) => {
  try {
    const { moduleName, moduleLabel, tableData, chartData, kitchen_id } = req.body;

    if (!moduleName) {
      return res.status(400).json({ success: false, error: 'moduleName wajib diisi.' });
    }

    console.log(`[POST /api/ai/analyze] Modul: ${moduleName} — ${new Date().toLocaleTimeString('id-ID')}`);

    const analysis = await analyzeModuleData({ moduleName, moduleLabel, tableData, chartData });

    // ── Auto-save to universal_ai_histories ──────────────────────────────────
    // We do this asynchronously (fire-and-forget with error log) so it never
    // delays the response back to the frontend.
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');

    AiHistoryService.savePrediction({
      kitchen_id:        kitchen_id ?? null,
      module_name:       moduleName,
      module_label:      moduleLabel ?? moduleName,
      prediction_date:   nowStr,
      prediction_result: analysis,           // stores the full AI JSON payload
    }).then(() => {
      console.log(`[AI History] Saved analysis for module "${moduleName}" ✓`);
    }).catch(err => {
      console.warn(`[AI History] Auto-save failed (non-fatal): ${err.message}`);
    });
    // ── End auto-save ─────────────────────────────────────────────────────────

    res.json({
      success:     true,
      module:      moduleName,
      analysis,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[AI Analyze Error]', error.message);
    res.status(500).json({ success: false, error: 'Gagal memproses analisis AI: ' + error.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// UNIVERSAL AI HISTORY  —  /api/ai/history/*
// NOTE: more specific paths MUST be registered before /:module_name
// ══════════════════════════════════════════════════════════════════════════════

// ── GET /api/ai/history/export/:module_name?format=xlsx|pdf ──────────────────
router.get('/history/export/:module_name', exportHistory);

// ── GET /api/ai/history (all modules) ────────────────────────────────────────
// Query: search?, limit?, page?
router.get('/history', getAllHistory);

// ── GET /api/ai/history/:module_name ─────────────────────────────────────────
// Query: search?, kitchen_id?, limit?, page?
router.get('/history/:module_name', getHistory);

// ── POST /api/ai/history (manual save) ───────────────────────────────────────
// Body: { module_name, module_label?, kitchen_id?, prediction_date, prediction_result }
router.post('/history', saveHistory);

module.exports = router;

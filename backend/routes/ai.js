const express = require('express');
const router = express.Router();
const { generateStockPrediction } = require('../services/aiPrediction');
const { analyzeModuleData } = require('../services/masterAnalyst');

// ── GET /api/ai/predict-stock ─────────────────────────────────────────────────
router.get('/predict-stock', (req, res) => {
  try {
    const predictions = generateStockPrediction();
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      predictions: {
        beras: predictions.beras,
        telur: Math.round(predictions.telur),
        minyak: predictions.minyak,
      },
      message: 'Prediksi stok minggu depan berhasil dibuat',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating prediction: ' + error.message });
  }
});

// ── POST /api/ai/analyze ──────────────────────────────────────────────────────
// Body: { moduleName, moduleLabel, tableData, chartData }
router.post('/analyze', async (req, res) => {
  try {
    const { moduleName, moduleLabel, tableData, chartData } = req.body;

    if (!moduleName) {
      return res.status(400).json({ success: false, error: 'moduleName wajib diisi.' });
    }

    console.log(`[POST /api/ai/analyze] Modul: ${moduleName} — ${new Date().toLocaleTimeString('id-ID')}`);

    const analysis = await analyzeModuleData({ moduleName, moduleLabel, tableData, chartData });

    res.json({
      success: true,
      module: moduleName,
      analysis,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[AI Analyze Error]', error.message);
    res.status(500).json({ success: false, error: 'Gagal memproses analisis AI: ' + error.message });
  }
});

module.exports = router;

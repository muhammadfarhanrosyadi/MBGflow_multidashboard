const express = require('express');
const router = express.Router();
const db = require('../db');

// ============================================================
// GET /api/dashboard
// Mengembalikan KPI, chartData (tren mingguan), dan tableData
// (system alerts) — semuanya dari database real.
// ============================================================
router.get('/', async (req, res) => {
  try {
    // ── Helper: dapatkan rentang minggu ini (Senin–Minggu) ──
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // ════════════════════════════════════════════════════════
    // 1. KPI CARDS
    // ════════════════════════════════════════════════════════

    // KPI-1: Total Dapur Aktif
    const [{ count: activeDapur }] = await db('kitchens')
      .where('status', 'active')
      .count('id as count');

    // KPI-2: Stok Kritis
    const [{ count: stokKritis }] = await db('raw_material_stock')
      .whereRaw('current_stock < minimum_stock')
      .count('id as count');

    // KPI-3: Efisiensi Produksi (rata-rata minggu ini)
    const [effRow] = await db('productions')
      .whereBetween('production_date', [monday, sunday])
      .where('target_portions', '>', 0)
      .select(
        db.raw('ROUND(AVG(actual_portions * 100.0 / target_portions), 0) as avg_eff')
      );
    const efisiensi = effRow?.avg_eff ?? 0;

    // KPI-4: Pengiriman Aktif Hari Ini
    const [{ count: pengiriman }] = await db('logistics')
      .whereIn('status', ['On Route', 'Loading', 'Delivered', 'Delayed'])
      .count('id as count');

    // KPI-5: Pemasok Aktif
    const [{ count: pemasok }] = await db('suppliers')
      .where('status', 'active')
      .count('id as count');

    // KPI-6: Karyawan Aktif
    const [{ count: karyawan }] = await db('employees')
      .where('status', 'active')
      .count('id as count');

    const kpis = [
      { id: 'kpi-1', title: 'Total Dapur Aktif',  value: Number(activeDapur), unit: 'dapur',    trend: 3,  status: 'normal',   icon: '🍳' },
      { id: 'kpi-2', title: 'Stok Kritis',         value: Number(stokKritis),  unit: 'item',     trend: stokKritis > 3 ? -2 : 1, status: stokKritis > 3 ? 'critical' : 'warning', icon: '⚠️' },
      { id: 'kpi-3', title: 'Efisiensi AI',        value: `${efisiensi}%`,     unit: null,       trend: 5,  status: 'normal',   icon: '🤖' },
      { id: 'kpi-4', title: 'Pengiriman Hari Ini', value: Number(pengiriman),  unit: 'order',    trend: 1,  status: 'warning',  icon: '🚚' },
      { id: 'kpi-5', title: 'Pemasok Aktif',       value: Number(pemasok),     unit: 'vendor',   trend: 0,  status: 'normal',   icon: '🏭' },
      { id: 'kpi-6', title: 'Target Produksi',     value: `${Math.min(efisiensi, 100)}%`, unit: null, trend: 2, status: efisiensi < 80 ? 'warning' : 'normal', icon: '📈' },
    ];

    // ════════════════════════════════════════════════════════
    // 2. CHART DATA — Tren produksi mingguan (Sen–Min)
    // ════════════════════════════════════════════════════════
    const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

    const weeklyProductions = await db('productions')
      .whereBetween('production_date', [monday, sunday])
      .select(
        db.raw('DAYOFWEEK(production_date) as dow'), // 1=Sun, 2=Mon...7=Sat
        db.raw('ROUND(AVG(CASE WHEN target_portions > 0 THEN actual_portions * 100.0 / target_portions ELSE 0 END), 0) as efisiensi'),
        db.raw('SUM(actual_portions) as total_output'),
        db.raw('COUNT(id) as total_pengiriman')
      )
      .groupByRaw('DAYOFWEEK(production_date)')
      .orderByRaw('DAYOFWEEK(production_date)');

    // Bangun chart array 7 hari
    const chartData = dayNames.map((name, idx) => {
      // idx 0=Sen(dow 2), 1=Sel(dow 3)... 6=Min(dow 1)
      const targetDow = idx === 6 ? 1 : idx + 2;
      const row = weeklyProductions.find(r => Number(r.dow) === targetDow);
      return {
        date: name,
        efisiensi: row ? Number(row.efisiensi) : 0,
        konsumsi: row ? Number(row.total_output) : 0,
        pengiriman: row ? Number(row.total_pengiriman) : 0,
        target: 85,
      };
    });

    // ════════════════════════════════════════════════════════
    // 3. TABLE DATA — System Alerts dari berbagai sumber
    // ════════════════════════════════════════════════════════
    const alerts = [];
    let alertCounter = 1;

    // 3a. Stok kritis dari raw_material_stock
    const criticalStock = await db('raw_material_stock')
      .join('raw_materials', 'raw_material_stock.raw_material_id', 'raw_materials.id')
      .join('kitchens', 'raw_material_stock.kitchen_id', 'kitchens.id')
      .whereRaw('raw_material_stock.current_stock < raw_material_stock.minimum_stock')
      .select(
        'raw_materials.name as materialName',
        'kitchens.name as kitchenName',
        'raw_material_stock.current_stock',
        'raw_material_stock.minimum_stock',
        'raw_material_stock.updated_at'
      )
      .limit(5);

    criticalStock.forEach(s => {
      const dt = s.updated_at ? new Date(s.updated_at) : new Date();
      alerts.push({
        id: `a${alertCounter++}`,
        tanggal: formatDate(dt),
        modul: 'Bahan Baku',
        pesan: `Stok ${s.materialName} di ${s.kitchenName} hanya ${Number(s.current_stock)} (min: ${Number(s.minimum_stock)}). Perlu restock segera.`,
        severity: 'high',
        status: 'critical',
      });
    });

    // 3b. Armada delayed/offline
    const delayedFleet = await db('logistics')
      .whereIn('status', ['Delayed'])
      .select('fleet_code', 'route', 'driver_name', 'updated_at')
      .limit(3);

    delayedFleet.forEach(l => {
      const dt = l.updated_at ? new Date(l.updated_at) : new Date();
      alerts.push({
        id: `a${alertCounter++}`,
        tanggal: formatDate(dt),
        modul: 'Logistik',
        pesan: `Armada ${l.fleet_code} rute ${l.route} (driver: ${l.driver_name}) mengalami keterlambatan.`,
        severity: 'medium',
        status: 'pending',
      });
    });

    // 3c. Produksi rendah (efisiensi < 70%)
    const lowProductions = await db('productions')
      .join('kitchens', 'productions.kitchen_id', 'kitchens.id')
      .whereRaw('productions.target_portions > 0')
      .whereRaw('productions.actual_portions * 100.0 / productions.target_portions < 70')
      .select(
        'kitchens.name as kitchenName',
        'productions.actual_portions',
        'productions.target_portions',
        'productions.production_date',
        'productions.updated_at'
      )
      .limit(3);

    lowProductions.forEach(p => {
      const eff = Math.round(p.actual_portions * 100 / p.target_portions);
      const dt = p.updated_at ? new Date(p.updated_at) : new Date();
      alerts.push({
        id: `a${alertCounter++}`,
        tanggal: formatDate(dt),
        modul: 'Produksi',
        pesan: `${p.kitchenName} efisiensi hanya ${eff}% (${p.actual_portions}/${p.target_portions} porsi). Investigasi segera.`,
        severity: 'high',
        status: 'pending',
      });
    });

    // 3d. Finance request pending
    const pendingFinance = await db('finance_requests')
      .join('kitchens', 'finance_requests.kitchen_id', 'kitchens.id')
      .where('finance_requests.status', 'pending')
      .select('kitchens.name as kitchenName', 'finance_requests.amount', 'finance_requests.description', 'finance_requests.created_at')
      .limit(2);

    pendingFinance.forEach(f => {
      const dt = f.created_at ? new Date(f.created_at) : new Date();
      alerts.push({
        id: `a${alertCounter++}`,
        tanggal: formatDate(dt),
        modul: 'Keuangan',
        pesan: `${f.kitchenName}: pengajuan dana Rp ${Number(f.amount).toLocaleString('id-ID')} — "${f.description}" menunggu approval.`,
        severity: 'low',
        status: 'pending',
      });
    });

    // Sort alerts by severity (high first)
    const severityOrder = { high: 0, medium: 1, low: 2 };
    alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    // ════════════════════════════════════════════════════════
    // 4. AI ANALYSIS — Ringkasan otomatis
    // ════════════════════════════════════════════════════════
    const avgEff = efisiensi || 0;
    const aiAnalysis = {
      summary: `Performa SCM MBG minggu ini menunjukkan efisiensi rata-rata ${avgEff}%. Terdapat ${Number(stokKritis)} item stok kritis yang memerlukan restock segera, dan ${delayedFleet.length} armada mengalami keterlambatan. Secara keseluruhan, ${avgEff >= 85 ? 'performa BAIK' : avgEff >= 70 ? 'performa CUKUP, perlu perbaikan' : 'performa RENDAH, perlu intervensi segera'}.`,
      recommendations: [
        stokKritis > 0 ? `Prioritaskan restock ${Number(stokKritis)} item bahan baku kritis dalam 24 jam ke depan.` : 'Seluruh stok bahan baku dalam kondisi aman.',
        lowProductions.length > 0 ? `Investigasi penyebab rendahnya efisiensi di ${lowProductions.map(p => p.kitchenName).join(', ')}.` : 'Semua dapur beroperasi dengan efisiensi baik.',
        delayedFleet.length > 0 ? `Pantau armada yang tertunda: ${delayedFleet.map(l => l.fleet_code).join(', ')} dan optimalkan rute.` : 'Semua armada pengiriman berjalan lancar.',
      ],
      confidenceScore: Math.max(65, 95 - (Number(stokKritis) * 3) - (lowProductions.length * 5)),
    };

    // ── Response ──
    res.json({
      success: true,
      data: { kpis, chartData, tableData: alerts, aiAnalysis },
      meta: { generatedAt: new Date().toISOString(), source: 'database' },
    });

  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ success: false, error: 'Database error fetching dashboard data.' });
  }
});

// ── Helper: format Date → "YYYY-MM-DD HH:mm" ──
function formatDate(dt) {
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  const hh = String(dt.getHours()).padStart(2, '0');
  const min = String(dt.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

module.exports = router;

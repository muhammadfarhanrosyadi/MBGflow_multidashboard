const express = require('express');
const router = express.Router();
const db = require('../db');

// ============================================================
// GET /api/notifications
// Mengembalikan notifikasi aktif berdasarkan data real-time:
//   HIGH   → stok kritis, produksi efisiensi < 70%, armada delayed
//   MEDIUM → finance request pending approval, dapur maintenance,
//             gaji belum dibayar bulan ini
//   LOW    → stok mendekati minimum (70-100%), armada baru selesai
// ============================================================

router.get('/', async (req, res) => {
  try {
    const notifications = [];
    let counter = 1;

    const now = new Date();

    // ── HIGH: Stok Kritis (current_stock < minimum_stock) ─────
    const criticalStocks = await db('raw_material_stock')
      .join('raw_materials', 'raw_material_stock.raw_material_id', 'raw_materials.id')
      .join('kitchens', 'raw_material_stock.kitchen_id', 'kitchens.id')
      .whereRaw('raw_material_stock.current_stock < raw_material_stock.minimum_stock * 0.7')
      .select(
        'raw_materials.name as materialName',
        'kitchens.name as kitchenName',
        'kitchens.id as kitchenId',
        'raw_material_stock.current_stock',
        'raw_material_stock.minimum_stock',
        'raw_material_stock.updated_at'
      )
      .orderByRaw('(raw_material_stock.minimum_stock - raw_material_stock.current_stock) DESC')
      .limit(6);

    criticalStocks.forEach(s => {
      const deficit = Number(s.minimum_stock) - Number(s.current_stock);
      notifications.push({
        id: `n${counter++}`,
        severity: 'high',
        type: 'stock_critical',
        icon: '⚠️',
        title: `Stok KRITIS: ${s.materialName}`,
        message: `${s.kitchenName} — Hanya ${Number(s.current_stock).toFixed(0)} tersisa (min: ${Number(s.minimum_stock).toFixed(0)}). Defisit: ${deficit.toFixed(0)} unit. Restock SEGERA!`,
        navigate: 'bahan-baku',
        timestamp: s.updated_at ? new Date(s.updated_at).toISOString() : now.toISOString(),
        read: false,
      });
    });

    // ── HIGH: Stok Warning (70% < current < min) ──────────────
    const warningStocks = await db('raw_material_stock')
      .join('raw_materials', 'raw_material_stock.raw_material_id', 'raw_materials.id')
      .join('kitchens', 'raw_material_stock.kitchen_id', 'kitchens.id')
      .whereRaw('raw_material_stock.current_stock >= raw_material_stock.minimum_stock * 0.7')
      .whereRaw('raw_material_stock.current_stock < raw_material_stock.minimum_stock')
      .select(
        'raw_materials.name as materialName',
        'kitchens.name as kitchenName',
        'raw_material_stock.current_stock',
        'raw_material_stock.minimum_stock',
        'raw_material_stock.updated_at'
      )
      .limit(4);

    warningStocks.forEach(s => {
      notifications.push({
        id: `n${counter++}`,
        severity: 'medium',
        type: 'stock_warning',
        icon: '🟡',
        title: `Stok Rendah: ${s.materialName}`,
        message: `${s.kitchenName} — Stok ${Number(s.current_stock).toFixed(0)} hampir mencapai batas minimum (${Number(s.minimum_stock).toFixed(0)}). Pertimbangkan restock.`,
        navigate: 'bahan-baku',
        timestamp: s.updated_at ? new Date(s.updated_at).toISOString() : now.toISOString(),
        read: false,
      });
    });

    // ── HIGH: Produksi Efisiensi < 70% ────────────────────────
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    const lowEfficiency = await db('productions')
      .join('kitchens', 'productions.kitchen_id', 'kitchens.id')
      .whereRaw('productions.target_portions > 0')
      .whereRaw('productions.actual_portions * 100.0 / productions.target_portions < 70')
      .where('productions.production_date', '>=', monday)
      .select(
        'kitchens.name as kitchenName',
        'productions.shift',
        'productions.actual_portions',
        'productions.target_portions',
        'productions.production_date',
        'productions.notes',
        'productions.updated_at'
      )
      .orderBy('productions.production_date', 'desc')
      .limit(4);

    lowEfficiency.forEach(p => {
      const eff = Math.round(p.actual_portions * 100 / p.target_portions);
      const dateStr = new Date(p.production_date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
      notifications.push({
        id: `n${counter++}`,
        severity: 'high',
        type: 'production_low',
        icon: '🍳',
        title: `Produksi Kritis: ${p.kitchenName}`,
        message: `Shift ${p.shift} (${dateStr}) — Efisiensi hanya ${eff}% (${p.actual_portions}/${p.target_portions} porsi). ${p.notes || 'Investigasi segera.'}`,
        navigate: 'produksi',
        timestamp: p.updated_at ? new Date(p.updated_at).toISOString() : now.toISOString(),
        read: false,
      });
    });

    // ── HIGH: Armada Delayed ───────────────────────────────────
    const delayedFleet = await db('logistics')
      .join('kitchens', 'logistics.kitchen_id', 'kitchens.id')
      .where('logistics.status', 'Delayed')
      .select(
        'logistics.fleet_code',
        'logistics.route',
        'logistics.driver_name',
        'logistics.battery_level',
        'kitchens.name as kitchenName',
        'logistics.updated_at'
      )
      .limit(3);

    delayedFleet.forEach(l => {
      notifications.push({
        id: `n${counter++}`,
        severity: 'high',
        type: 'fleet_delayed',
        icon: '🚚',
        title: `Armada Terlambat: ${l.fleet_code}`,
        message: `Rute ${l.route} dari ${l.kitchenName} (Driver: ${l.driver_name}) mengalami keterlambatan. Baterai GPS: ${l.battery_level ?? '?'}%.`,
        navigate: 'logistik',
        timestamp: l.updated_at ? new Date(l.updated_at).toISOString() : now.toISOString(),
        read: false,
      });
    });

    // ── MEDIUM: Finance Requests Pending Approval ──────────────
    const pendingFinance = await db('finance_requests')
      .join('kitchens', 'finance_requests.kitchen_id', 'kitchens.id')
      .join('users', 'finance_requests.requested_by', 'users.id')
      .where('finance_requests.status', 'pending')
      .select(
        'finance_requests.id',
        'kitchens.name as kitchenName',
        'finance_requests.amount',
        'finance_requests.description',
        'users.name as requestedBy',
        'finance_requests.created_at'
      )
      .orderBy('finance_requests.amount', 'desc')
      .limit(5);

    pendingFinance.forEach(f => {
      const amount = Number(f.amount).toLocaleString('id-ID');
      notifications.push({
        id: `n${counter++}`,
        severity: 'medium',
        type: 'approval_pending',
        icon: '💰',
        title: `Approval Pending: ${f.kitchenName}`,
        message: `Pengajuan dana Rp ${amount} oleh ${f.requestedBy} — "${f.description}" menunggu persetujuan Anda.`,
        navigate: 'keuangan',
        timestamp: f.created_at ? new Date(f.created_at).toISOString() : now.toISOString(),
        read: false,
      });
    });

    // ── MEDIUM: Karyawan Belum Gajian ─────────────────────────
    const unpaidEmployees = await db('employees')
      .join('kitchens', 'employees.kitchen_id', 'kitchens.id')
      .where('employees.paid_this_month', false)
      .where('employees.status', 'active')
      .count('employees.id as count')
      .sum('employees.salary as totalSalary')
      .select('kitchens.name as kitchenName', 'kitchens.id as kitchenId')
      .groupBy('kitchens.id', 'kitchens.name')
      .having(db.raw('COUNT(employees.id)'), '>', 0)
      .limit(4);

    unpaidEmployees.forEach(k => {
      const count = Number(k.count);
      const total = Number(k.totalSalary).toLocaleString('id-ID');
      if (count > 0) {
        notifications.push({
          id: `n${counter++}`,
          severity: 'medium',
          type: 'payroll_pending',
          icon: '👥',
          title: `Gaji Belum Dibayar: ${k.kitchenName}`,
          message: `${count} karyawan belum menerima gaji bulan ini. Total: Rp ${total}. Proses segera.`,
          navigate: 'karyawan',
          timestamp: now.toISOString(),
          read: false,
        });
      }
    });

    // ── MEDIUM: Dapur Maintenance ──────────────────────────────
    const maintenanceKitchens = await db('kitchens')
      .where('status', 'maintenance')
      .select('id', 'name', 'city', 'updated_at')
      .limit(3);

    maintenanceKitchens.forEach(k => {
      notifications.push({
        id: `n${counter++}`,
        severity: 'medium',
        type: 'kitchen_maintenance',
        icon: '🔧',
        title: `Dapur Maintenance: ${k.name}`,
        message: `${k.name} (${k.city}) sedang dalam maintenance dan tidak beroperasi. Distribusi mungkin terdampak.`,
        navigate: 'produksi',
        timestamp: k.updated_at ? new Date(k.updated_at).toISOString() : now.toISOString(),
        read: false,
      });
    });

    // ── LOW: Armada Baterai Rendah ─────────────────────────────
    const lowBattery = await db('logistics')
      .where('battery_level', '<', 20)
      .whereIn('status', ['On Route', 'Loading'])
      .select('fleet_code', 'route', 'driver_name', 'battery_level', 'updated_at')
      .limit(3);

    lowBattery.forEach(l => {
      notifications.push({
        id: `n${counter++}`,
        severity: 'low',
        type: 'fleet_battery_low',
        icon: '🔋',
        title: `Baterai GPS Kritis: ${l.fleet_code}`,
        message: `Armada ${l.fleet_code} (rute ${l.route}) — baterai tracker hanya ${l.battery_level}%. Hubungi driver ${l.driver_name}.`,
        navigate: 'tracking',
        timestamp: l.updated_at ? new Date(l.updated_at).toISOString() : now.toISOString(),
        read: false,
      });
    });

    // Sort: high → medium → low, kemudian by timestamp (terbaru dulu)
    const severityOrder = { high: 0, medium: 1, low: 2 };
    notifications.sort((a, b) => {
      const sA = severityOrder[a.severity] ?? 9;
      const sB = severityOrder[b.severity] ?? 9;
      if (sA !== sB) return sA - sB;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    const highCount = notifications.filter(n => n.severity === 'high').length;
    const mediumCount = notifications.filter(n => n.severity === 'medium').length;

    res.json({
      success: true,
      data: notifications,
      meta: {
        total: notifications.length,
        unread: notifications.length,
        highCount,
        mediumCount,
        lowCount: notifications.length - highCount - mediumCount,
        generatedAt: now.toISOString(),
      },
    });
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ success: false, error: 'Database error fetching notifications.' });
  }
});

module.exports = router;

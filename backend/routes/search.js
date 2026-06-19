const express = require('express');
const router = express.Router();
const db = require('../db');

// ============================================================
// GET /api/search?q=<query>
// Full-text search across: kitchens, menus, suppliers, employees, modules
// Returns grouped results with navigation link per item
// ============================================================

const MODULE_LINKS = {
  produksi: { id: 'produksi', label: 'Produksi & Multi Dapur', icon: '🍳' },
  'bahan-baku': { id: 'bahan-baku', label: 'Bahan Baku & Pemasok', icon: '📦' },
  'menu-planning': { id: 'menu-planning', label: 'Menu Planning & AI', icon: '🤖' },
  logistik: { id: 'logistik', label: 'Logistik & Distribusi', icon: '🚚' },
  tracking: { id: 'tracking', label: 'Mobile Tracking', icon: '📍' },
  keuangan: { id: 'keuangan', label: 'Keuangan', icon: '💰' },
  karyawan: { id: 'karyawan', label: 'Kelola Karyawan', icon: '👥' },
  dashboard: { id: 'dashboard', label: 'Dashboard SCM', icon: '📊' },
};

// Static module items always searchable
const STATIC_MODULES = [
  { id: 'dashboard',     label: 'Dashboard SCM',             subtitle: 'KPI global & ringkasan operasional',  icon: '📊' },
  { id: 'produksi',      label: 'Produksi & Multi Dapur',    subtitle: 'Rekap output harian semua dapur',      icon: '🍳' },
  { id: 'bahan-baku',    label: 'Bahan Baku & Pemasok',      subtitle: 'Stok inventaris & daftar pemasok',     icon: '📦' },
  { id: 'menu-planning', label: 'Menu Planning & AI',         subtitle: 'Perencanaan menu & rekomendasi AI',    icon: '🤖' },
  { id: 'logistik',      label: 'Logistik & Distribusi',      subtitle: 'Status armada & rute pengiriman',      icon: '🚚' },
  { id: 'tracking',      label: 'Mobile Distribution Tracking', subtitle: 'GPS tracking armada real-time',     icon: '📍' },
  { id: 'keuangan',      label: 'Keuangan',                   subtitle: 'Arus kas, approval & penggajian',     icon: '💰' },
  { id: 'karyawan',      label: 'Kelola Karyawan',            subtitle: 'Data karyawan per dapur',             icon: '👥' },
];

router.get('/', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || String(q).trim().length < 1) {
      return res.json({ success: true, results: [], total: 0 });
    }

    const query = String(q).trim();
    const likeQuery = `%${query}%`;
    const results = [];

    // ── 1. Static Modules ──────────────────────────────────────
    const matchedModules = STATIC_MODULES.filter(m =>
      m.label.toLowerCase().includes(query.toLowerCase()) ||
      m.subtitle.toLowerCase().includes(query.toLowerCase())
    ).map(m => ({
      type: 'Modul',
      id: m.id,
      title: m.label,
      subtitle: m.subtitle,
      icon: m.icon,
      navigate: m.id,
    }));
    results.push(...matchedModules);

    // ── 2. Kitchens ────────────────────────────────────────────
    const kitchens = await db('kitchens')
      .where('name', 'like', likeQuery)
      .orWhere('city', 'like', likeQuery)
      .orWhere('region', 'like', likeQuery)
      .select('id', 'name', 'city', 'status')
      .limit(5);

    kitchens.forEach(k => {
      results.push({
        type: 'Dapur',
        id: k.id,
        title: k.name,
        subtitle: `${k.city} — Status: ${k.status}`,
        icon: '🏪',
        navigate: 'produksi',
      });
    });

    // ── 3. Menus ───────────────────────────────────────────────
    const menus = await db('menus')
      .where('name', 'like', likeQuery)
      .orWhere('category', 'like', likeQuery)
      .orWhere('description', 'like', likeQuery)
      .select('id', 'name', 'category', 'sell_price', 'is_active')
      .limit(5);

    menus.forEach(m => {
      results.push({
        type: 'Menu',
        id: m.id,
        title: m.name,
        subtitle: `${m.category} — Rp ${Number(m.sell_price).toLocaleString('id-ID')}`,
        icon: '🍽️',
        navigate: 'menu-planning',
      });
    });

    // ── 4. Suppliers ───────────────────────────────────────────
    const suppliers = await db('suppliers')
      .where('name', 'like', likeQuery)
      .orWhere('city', 'like', likeQuery)
      .orWhere('contact_person', 'like', likeQuery)
      .select('id', 'name', 'city', 'status', 'rating')
      .limit(4);

    suppliers.forEach(s => {
      results.push({
        type: 'Supplier',
        id: s.id,
        title: s.name,
        subtitle: `${s.city} — Rating: ${s.rating ?? '-'}/5`,
        icon: '🏭',
        navigate: 'bahan-baku',
      });
    });

    // ── 5. Employees ───────────────────────────────────────────
    const employees = await db('employees')
      .join('kitchens', 'employees.kitchen_id', 'kitchens.id')
      .where('employees.name', 'like', likeQuery)
      .orWhere('employees.role', 'like', likeQuery)
      .orWhere('employees.email', 'like', likeQuery)
      .select('employees.id', 'employees.name', 'employees.role', 'kitchens.name as kitchenName', 'employees.status')
      .limit(4);

    employees.forEach(e => {
      results.push({
        type: 'Karyawan',
        id: e.id,
        title: e.name,
        subtitle: `${e.role} — ${e.kitchenName}`,
        icon: '👤',
        navigate: 'karyawan',
      });
    });

    // ── 6. Raw Materials ───────────────────────────────────────
    const rawMaterials = await db('raw_materials')
      .where('name', 'like', likeQuery)
      .orWhere('category', 'like', likeQuery)
      .select('id', 'name', 'category', 'unit', 'price_per_unit')
      .limit(4);

    rawMaterials.forEach(r => {
      results.push({
        type: 'Bahan Baku',
        id: r.id,
        title: r.name,
        subtitle: `${r.category} — Rp ${Number(r.price_per_unit).toLocaleString('id-ID')}/${r.unit}`,
        icon: '🥦',
        navigate: 'bahan-baku',
      });
    });

    res.json({
      success: true,
      results,
      total: results.length,
      query,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, error: 'Database error during search.' });
  }
});

module.exports = router;

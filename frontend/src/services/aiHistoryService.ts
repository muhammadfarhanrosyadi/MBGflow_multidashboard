/**
 * aiHistoryService.ts — aligned with real system module names
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, '') || 'http://localhost:5000';

// ── Real module names — exactly as the backend sends them ────────────────────

export const MODULES = [
  'all',
  'dashboard',
  'produksi',
  'bahan-baku',
  'menu-planning',
  'logistik',
  'tracking',
  'keuangan',
  'karyawan',
] as const;

export type ModuleName = typeof MODULES[number];

// ── Per-module UI config ─────────────────────────────────────────────────────

export interface ModuleConfig {
  label:   string;
  icon:    string;
  color:   string;
  columns: ColumnDef[];
}

export interface ColumnDef {
  key:     string;
  header:  string;
  source:  'root' | 'result';
  format?: 'text' | 'list' | 'number' | 'pct' | 'score';
}

// All AI results from masterAnalyst.js share the same JSON shape:
//   { kesimpulan, temuanMasalah[], analisisAI, solusiStrategis[], confidenceScore, source }
// We define common columns once and reuse them per module.

const COMMON_AI_COLUMNS: ColumnDef[] = [
  { key: 'kitchen_name',    header: 'Dapur / Konteks',  source: 'root',   format: 'text'  },
  { key: 'prediction_date', header: 'Tanggal Analisis', source: 'root',   format: 'text'  },
  { key: 'kesimpulan',      header: 'Kesimpulan',       source: 'result', format: 'text'  },
  { key: 'temuanMasalah',   header: 'Temuan Masalah',   source: 'result', format: 'list'  },
  { key: 'solusiStrategis', header: 'Solusi Strategis', source: 'result', format: 'list'  },
  { key: 'confidenceScore', header: 'Confidence',       source: 'result', format: 'score' },
];

export const MODULE_CONFIG: Record<ModuleName, ModuleConfig> = {
  all: {
    label: 'Semua Modul',
    icon:  '🔍',
    color: '#64748B',
    columns: COMMON_AI_COLUMNS,
  },
  dashboard: {
    label: 'Dashboard SCM',
    icon:  '📊',
    color: '#1B6B45',
    columns: COMMON_AI_COLUMNS,
  },
  produksi: {
    label: 'Produksi & Multi Dapur',
    icon:  '🍳',
    color: '#D97706',
    columns: COMMON_AI_COLUMNS,
  },
  'bahan-baku': {
    label: 'Bahan Baku & Pemasok',
    icon:  '📦',
    color: '#2563EB',
    columns: COMMON_AI_COLUMNS,
  },
  'menu-planning': {
    label: 'Menu Planning & AI',
    icon:  '🤖',
    color: '#7C3AED',
    columns: COMMON_AI_COLUMNS,
  },
  logistik: {
    label: 'Logistik & Distribusi',
    icon:  '🚚',
    color: '#B45309',
    columns: COMMON_AI_COLUMNS,
  },
  tracking: {
    label: 'Mobile Tracking',
    icon:  '📍',
    color: '#0891B2',
    columns: COMMON_AI_COLUMNS,
  },
  keuangan: {
    label: 'Keuangan',
    icon:  '💰',
    color: '#059669',
    // Keuangan bisa punya 2 format:
    //   1. Standard AI (dari masterAnalyst): kesimpulan, temuanMasalah, solusiStrategis, confidenceScore
    //   2. Cashflow Audit AI: kebocoran_anggaran, tren_pengeluaran, saran
    // Kolom yang ditampilkan bisa handle keduanya
    columns: [
      { key: 'kitchen_name',         header: 'Dapur / Konteks',       source: 'root',   format: 'text'  },
      { key: 'prediction_date',      header: 'Tanggal Analisis',      source: 'root',   format: 'text'  },
      { key: 'kesimpulan',           header: 'Kesimpulan / Kebocoran', source: 'result', format: 'text'  },
      { key: 'temuanMasalah',        header: 'Temuan / Tren',         source: 'result', format: 'list'  },
      { key: 'solusiStrategis',      header: 'Solusi / Saran',        source: 'result', format: 'list'  },
      { key: 'confidenceScore',      header: 'Confidence',            source: 'result', format: 'score' },
    ],
  },
  karyawan: {
    label: 'Kelola Karyawan',
    icon:  '👥',
    color: '#DC2626',
    columns: COMMON_AI_COLUMNS,
  },
};

// ── API Types ────────────────────────────────────────────────────────────────

export interface AiHistoryRecord {
  id: string | number;
  kitchen_id: string | null;
  kitchen_name: string | null;
  module_name: string;
  module_label: string | null;
  prediction_date: string;
  prediction_result: Record<string, unknown>;
  created_at: string;
}

export interface HistoryResponse {
  success: boolean;
  module_name: string;
  data: AiHistoryRecord[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

// ── API Helpers ──────────────────────────────────────────────────────────────

function authHeader(): HeadersInit {
  const token = localStorage.getItem('scm_token') ?? '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchHistory(
  module_name: ModuleName,
  params: { search?: string; kitchen_id?: string; limit?: number; page?: number; reportType?: string; startDate?: string; endDate?: string } = {},
): Promise<HistoryResponse> {
  const endpoint = module_name === 'all'
    ? `${BASE_URL}/api/ai/history`
    : `${BASE_URL}/api/ai/history/${module_name}`;

  const url = new URL(endpoint);
  if (params.search)     url.searchParams.set('search',     params.search);
  if (params.kitchen_id) url.searchParams.set('kitchen_id', params.kitchen_id);
  if (params.limit)      url.searchParams.set('limit',      String(params.limit));
  if (params.page)       url.searchParams.set('page',       String(params.page));
  if (params.reportType) url.searchParams.set('reportType', params.reportType);
  if (params.startDate)  url.searchParams.set('startDate',  params.startDate);
  if (params.endDate)    url.searchParams.set('endDate',    params.endDate);

  const res = await fetch(url.toString(), { headers: authHeader() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Triggers a file download from the export endpoint */
export function downloadExport(
  module_name: ModuleName | string, 
  format: 'xlsx' | 'pdf',
  params: { reportType?: string; startDate?: string; endDate?: string } = {}
): void {
  const url = new URL(`${BASE_URL}/api/ai/history/export/${module_name}`);
  url.searchParams.set('format', format);
  if (params.reportType) url.searchParams.set('reportType', params.reportType);
  if (params.startDate)  url.searchParams.set('startDate',  params.startDate);
  if (params.endDate)    url.searchParams.set('endDate',    params.endDate);

  fetch(url.toString(), { headers: authHeader() })
    .then(async res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href   = URL.createObjectURL(blob);
      link.download = `AI_History_${module_name}_${new Date().toISOString().slice(0, 10)}.${format}`;
      link.click();
      URL.revokeObjectURL(link.href);
    })
    .catch(err => alert('Gagal mengunduh: ' + err.message));
}

// ── Demo data generator (fallback when backend is offline) ───────────────────

export function generateDemoData(module_name: ModuleName): AiHistoryRecord[] {
  const cfg = MODULE_CONFIG[module_name];

  const kitchens = [
    { id: 'K-JKT-01', name: 'Dapur Jakarta Pusat' },
    { id: 'K-BDG-01', name: 'Dapur Bandung Barat' },
    { id: 'K-SBY-01', name: 'Dapur Surabaya Timur' },
    { id: 'K-YGY-01', name: 'Dapur Yogyakarta' },
    { id: null,       name: 'Global / Semua Dapur' },
  ];

  const kesimpulanPool = [
    `Modul ${cfg.label} menampilkan 12 record data dengan 2 item kritis dan 1 item peringatan. Diperlukan tindakan segera pada item berstatus kritis.`,
    `Kondisi operasional ${cfg.label} berjalan relatif stabil. Tren efisiensi menunjukkan kenaikan +8% dari periode sebelumnya.`,
    `Terdeteksi 3 anomali pada modul ${cfg.label} yang memerlukan perhatian. Pola menunjukkan potensi bottleneck.`,
  ];

  const temuanPool = [
    ['⚠️ Item "Beras Premium" berada dalam status KRITIS', '⚡ Rute Selatan menunjukkan tanda peringatan', '📊 15 record berhasil diidentifikasi'],
    ['⚠️ Kapasitas dapur Jakarta mendekati batas maksimum', '⚡ Stok sayuran di bawah safety stock', '📈 Efisiensi produksi meningkat'],
    ['📊 Data operasional dalam batas normal', '✅ Semua armada aktif beroperasi'],
  ];

  const solusiPool = [
    ['Lakukan audit kapasitas dapur dalam 24 jam', 'Aktifkan Purchase Order otomatis', 'Koordinasi dengan supplier utama'],
    ['Optimalisasi rute distribusi', 'Review safety stock minimum', 'Jadwalkan maintenance preventif'],
    ['Monitor KPI harian', 'Sinkronisasi data lintas modul', 'Review mingguan dengan kepala dapur'],
  ];

  const scores = [92, 78, 85, 71, 88, 95, 67, 82, 90, 76];

  const records: AiHistoryRecord[] = [];
  const today = new Date();

  for (let i = 0; i < 20; i++) {
    const kitchen = kitchens[i % kitchens.length];
    const date = new Date(today);
    date.setDate(date.getDate() - Math.floor(i / kitchens.length));
    date.setHours(Math.floor(Math.random() * 8) + 9, Math.floor(Math.random() * 60), 0, 0);

    const pick = i % 3;
    records.push({
      id:               `demo-${module_name}-${i.toString().padStart(3, '0')}`,
      kitchen_id:       kitchen.id,
      kitchen_name:     kitchen.name,
      module_name,
      module_label:     cfg.label,
      prediction_date:  date.toISOString().slice(0, 16).replace('T', ' '),
      prediction_result: {
        kesimpulan:      kesimpulanPool[pick],
        temuanMasalah:   temuanPool[pick],
        analisisAI:      `Berdasarkan pola data yang teridentifikasi pada modul ${cfg.label}, kondisi operasional menunjukkan tren yang perlu diperhatikan. Optimasi proses diperlukan.`,
        solusiStrategis: solusiPool[pick],
        confidenceScore: scores[i % scores.length],
        source:          i % 4 === 0 ? 'gemini' : 'rule-based',
      },
      created_at: date.toISOString(),
    });
  }

  return records;
}

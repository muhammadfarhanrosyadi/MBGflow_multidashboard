/**
 * aiHistoryService.ts
 * Frontend API client for the Universal AI History feature.
 */

const BASE_URL = 'http://localhost:5000';

// ── Canonical module list ────────────────────────────────────────────────────

export const MODULES = ['inventory', 'production', 'distribution', 'finance', 'employee'] as const;
export type ModuleName = typeof MODULES[number];

// ── Per-module UI config ─────────────────────────────────────────────────────

export interface ModuleConfig {
  label:   string;
  icon:    string;
  color:   string;           // accent hex for tab indicator
  columns: ColumnDef[];      // table columns to render
}

export interface ColumnDef {
  key:     string;           // key inside prediction_result (or 'kitchen_name' / 'prediction_date')
  header:  string;
  source:  'root' | 'result'; // 'root' = top-level row field, 'result' = prediction_result key
  format?: 'number' | 'pct' | 'currency' | 'text' | 'list';
}

export const MODULE_CONFIG: Record<ModuleName, ModuleConfig> = {
  inventory: {
    label: 'Inventory',
    icon:  '📦',
    color: '#2563EB',
    columns: [
      { key: 'kitchen_name',            header: 'Dapur',             source: 'root'   },
      { key: 'prediction_date',          header: 'Tanggal Prediksi',  source: 'root'   },
      { key: 'stock_level',             header: 'Level Stok',        source: 'result', format: 'number' },
      { key: 'reorder_point',           header: 'Reorder Point',     source: 'result', format: 'number' },
      { key: 'predicted_shortage_days', header: 'Shortage (hari)',   source: 'result', format: 'number' },
      { key: 'recommendations',         header: 'Rekomendasi',       source: 'result', format: 'text'   },
    ],
  },
  production: {
    label: 'Produksi',
    icon:  '🍳',
    color: '#1B6B45',
    columns: [
      { key: 'kitchen_name',   header: 'Dapur',            source: 'root'   },
      { key: 'prediction_date', header: 'Tanggal Prediksi', source: 'root'   },
      { key: 'predicted_output', header: 'Output Prediksi', source: 'result', format: 'number' },
      { key: 'efficiency_rate',  header: 'Efisiensi (%)',   source: 'result', format: 'pct'    },
      { key: 'waste_kg',        header: 'Waste (kg)',       source: 'result', format: 'number' },
      { key: 'recommendations', header: 'Rekomendasi',      source: 'result', format: 'text'   },
    ],
  },
  distribution: {
    label: 'Distribusi',
    icon:  '🚚',
    color: '#B45309',
    columns: [
      { key: 'kitchen_name',    header: 'Dapur',            source: 'root'   },
      { key: 'prediction_date', header: 'Tanggal Prediksi', source: 'root'   },
      { key: 'delay_risk_pct',  header: 'Risiko Delay (%)', source: 'result', format: 'pct'    },
      { key: 'on_time_rate',    header: 'On-Time (%)',      source: 'result', format: 'pct'    },
      { key: 'delivery_count',  header: 'Pengiriman',       source: 'result', format: 'number' },
      { key: 'recommendations', header: 'Rekomendasi',      source: 'result', format: 'text'   },
    ],
  },
  finance: {
    label: 'Keuangan',
    icon:  '💰',
    color: '#7C3AED',
    columns: [
      { key: 'kitchen_name',      header: 'Dapur',             source: 'root'   },
      { key: 'prediction_date',   header: 'Tanggal Prediksi',  source: 'root'   },
      { key: 'predicted_revenue', header: 'Est. Pendapatan',   source: 'result', format: 'currency' },
      { key: 'cost_variance',     header: 'Selisih Biaya',     source: 'result', format: 'currency' },
      { key: 'budget_utilisation',header: 'Utilisasi (%)',     source: 'result', format: 'pct'      },
      { key: 'alerts',            header: 'Alert',             source: 'result', format: 'text'     },
    ],
  },
  employee: {
    label: 'Karyawan',
    icon:  '👥',
    color: '#DC2626',
    columns: [
      { key: 'kitchen_name',     header: 'Dapur',            source: 'root'   },
      { key: 'prediction_date',  header: 'Tanggal Prediksi', source: 'root'   },
      { key: 'attendance_rate',  header: 'Kehadiran (%)',    source: 'result', format: 'pct'    },
      { key: 'overtime_hours',   header: 'Lembur (jam)',     source: 'result', format: 'number' },
      { key: 'performance_score',header: 'Skor Kinerja',     source: 'result', format: 'number' },
      { key: 'recommendations',  header: 'Rekomendasi',      source: 'result', format: 'text'   },
    ],
  },
};

// ── API Types ────────────────────────────────────────────────────────────────

export interface AiHistoryRecord {
  id: string;
  kitchen_id: string;
  kitchen_name: string;
  module_name: ModuleName;
  prediction_date: string;
  prediction_result: Record<string, unknown>;
  created_at: string;
}

export interface HistoryResponse {
  success: boolean;
  module_name: ModuleName;
  data: AiHistoryRecord[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

// ── API Calls ────────────────────────────────────────────────────────────────

export async function fetchHistory(
  module_name: ModuleName,
  params: { search?: string; kitchen_id?: string; limit?: number; page?: number } = {},
): Promise<HistoryResponse> {
  const url = new URL(`${BASE_URL}/api/ai/history/${module_name}`);
  if (params.search)     url.searchParams.set('search',     params.search);
  if (params.kitchen_id) url.searchParams.set('kitchen_id', params.kitchen_id);
  if (params.limit)      url.searchParams.set('limit',      String(params.limit));
  if (params.page)       url.searchParams.set('page',       String(params.page));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${localStorage.getItem('scm_token') ?? ''}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Triggers a file download from the export endpoint. */
export function downloadExport(module_name: ModuleName, format: 'xlsx' | 'pdf'): void {
  const token = localStorage.getItem('scm_token') ?? '';
  const url = `${BASE_URL}/api/ai/history/export/${module_name}?format=${format}`;

  // Use fetch so we can attach auth header, then create object URL
  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
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
  const kitchens = [
    { id: 'K-JKT-01', name: 'Dapur Jakarta Pusat' },
    { id: 'K-BDG-01', name: 'Dapur Bandung Barat' },
    { id: 'K-SBY-01', name: 'Dapur Surabaya Timur' },
    { id: 'K-YGY-01', name: 'Dapur Yogyakarta' },
    { id: 'K-MDN-01', name: 'Dapur Medan Kota' },
  ];

  const resultByModule: Record<ModuleName, () => Record<string, unknown>> = {
    inventory: () => ({
      stock_level:              Math.floor(Math.random() * 800 + 200),
      reorder_point:            Math.floor(Math.random() * 200 + 50),
      predicted_shortage_days:  Math.floor(Math.random() * 10),
      items_at_risk:            Math.floor(Math.random() * 5),
      recommendations:          ['Segera restock beras dan minyak', 'Koordinasi dengan supplier minggu ini', 'Audit stok sayuran harian'][Math.floor(Math.random() * 3)],
    }),
    production: () => ({
      predicted_output:   Math.floor(Math.random() * 400 + 100),
      efficiency_rate:    parseFloat((Math.random() * 25 + 70).toFixed(1)),
      waste_kg:           parseFloat((Math.random() * 20 + 2).toFixed(2)),
      target_vs_actual:   `${Math.floor(Math.random() * 400 + 100)} / ${Math.floor(Math.random() * 400 + 100)}`,
      recommendations:    ['Kurangi porsi nasi 10%', 'Optimalkan shift pagi', 'Tambah variasi menu'][Math.floor(Math.random() * 3)],
    }),
    distribution: () => ({
      delay_risk_pct:  parseFloat((Math.random() * 30).toFixed(1)),
      on_time_rate:    parseFloat((Math.random() * 20 + 78).toFixed(1)),
      delivery_count:  Math.floor(Math.random() * 20 + 5),
      routes_at_risk:  Math.floor(Math.random() * 3),
      recommendations: ['Rute Selatan perlu driver cadangan', 'Periksa armada JKT-B02', 'Optimalkan jadwal pengiriman siang'][Math.floor(Math.random() * 3)],
    }),
    finance: () => ({
      predicted_revenue:  Math.floor(Math.random() * 50_000_000 + 10_000_000),
      cost_variance:      Math.floor(Math.random() * 5_000_000 - 2_500_000),
      cashflow_7d:        Math.floor(Math.random() * 30_000_000 + 5_000_000),
      budget_utilisation: parseFloat((Math.random() * 30 + 60).toFixed(1)),
      alerts:             ['Anggaran operasional mendekati limit', 'Arus kas positif minggu ini', 'Revisi proyeksi Q3'][Math.floor(Math.random() * 3)],
    }),
    employee: () => ({
      attendance_rate:   parseFloat((Math.random() * 15 + 82).toFixed(1)),
      overtime_hours:    parseFloat((Math.random() * 20).toFixed(1)),
      performance_score: parseFloat((Math.random() * 2 + 3).toFixed(2)),
      flagged_count:     Math.floor(Math.random() * 4),
      recommendations:   ['Jadwalkan pelatihan dapur', 'Review karyawan underperform', 'Tambah shift siang Rabu–Jumat'][Math.floor(Math.random() * 3)],
    }),
  };

  const records: AiHistoryRecord[] = [];
  const today = new Date();

  for (let i = 0; i < 25; i++) {
    const kitchen = kitchens[i % kitchens.length];
    const date    = new Date(today);
    date.setDate(date.getDate() - Math.floor(i / kitchens.length));

    records.push({
      id:                `demo-${module_name}-${i.toString().padStart(3, '0')}`,
      kitchen_id:        kitchen.id,
      kitchen_name:      kitchen.name,
      module_name,
      prediction_date:   date.toISOString().slice(0, 16).replace('T', ' '),
      prediction_result: resultByModule[module_name](),
      created_at:        date.toISOString(),
    });
  }

  return records;
}

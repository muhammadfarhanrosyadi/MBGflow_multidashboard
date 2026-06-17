/**
 * aiPredictionService.ts
 * ──────────────────────────────────────────────────────────────
 * Frontend API service for the AI Prediction History feature.
 * Communicates with GET /api/ai/predictions/history.
 * ──────────────────────────────────────────────────────────────
 */

const BASE_URL = 'http://localhost:5000';

// ── Types (mirror the backend response shape) ────────────────────────────────

export interface AiPredictionRecord {
  id: string;
  kitchen_id: string;
  kitchen_name: string;          // joined from kitchens table
  prediction_date: string;       // 'YYYY-MM-DD'
  predicted_waste_kg: number;
  suggested_portion_adjustment: string | null;
  confidence_score: number | null;
  model_version: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PredictionHistoryResponse {
  success: boolean;
  data: AiPredictionRecord[];
  pagination: PaginationMeta;
}

export interface FetchHistoryParams {
  kitchen_id?: string;
  search?: string;
  limit?: number;
  page?: number;
}

// ── API Call ─────────────────────────────────────────────────────────────────

export async function fetchPredictionHistory(
  params: FetchHistoryParams = {},
): Promise<PredictionHistoryResponse> {
  const url = new URL(`${BASE_URL}/api/ai/predictions/history`);

  if (params.kitchen_id) url.searchParams.set('kitchen_id', params.kitchen_id);
  if (params.search)     url.searchParams.set('search',     params.search);
  if (params.limit)      url.searchParams.set('limit',      String(params.limit));
  if (params.page)       url.searchParams.set('page',       String(params.page));

  const res = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('scm_token') ?? ''}`,
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  const json: PredictionHistoryResponse = await res.json();

  if (!json.success) {
    throw new Error('Server returned success: false');
  }

  return json;
}

// ── Seed/Demo helper (for UI when no real DB is connected) ───────────────────

export function generateDemoData(): AiPredictionRecord[] {
  const kitchens = [
    { id: 'K-JKT-01', name: 'Dapur Jakarta Pusat' },
    { id: 'K-BDG-01', name: 'Dapur Bandung Barat' },
    { id: 'K-SBY-01', name: 'Dapur Surabaya Timur' },
    { id: 'K-YGY-01', name: 'Dapur Yogyakarta' },
    { id: 'K-MDN-01', name: 'Dapur Medan Kota' },
  ];

  const adjustments = [
    'Kurangi porsi nasi 10% — estimasi waste tinggi akibat over-produksi.',
    'Pertahankan porsi saat ini — prediksi efisiensi optimal.',
    'Tingkatkan porsi sayuran 5% — tren konsumsi meningkat.',
    'Kurangi porsi lauk 8% — demand rendah akhir minggu.',
    'Optimalkan waktu produksi ke shift pagi — reduksi waste 12%.',
    'Tambah variasi menu — waste disebabkan menu monoton.',
    'Kurangi produksi total 15% — hari libur nasional besok.',
    'Fokus pada porsi protein — kebutuhan gizi meningkat.',
  ];

  const records: AiPredictionRecord[] = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const kitchen = kitchens[i % kitchens.length];
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    records.push({
      id:                           `demo-${i.toString().padStart(3, '0')}`,
      kitchen_id:                   kitchen.id,
      kitchen_name:                 kitchen.name,
      prediction_date:              date.toISOString().slice(0, 10),
      predicted_waste_kg:           parseFloat((Math.random() * 25 + 2).toFixed(2)),
      suggested_portion_adjustment: adjustments[i % adjustments.length],
      confidence_score:             parseFloat((Math.random() * 0.3 + 0.7).toFixed(4)),
      model_version:                'gemini-2.5-flash',
      created_at:                   date.toISOString(),
      updated_at:                   date.toISOString(),
    });
  }

  return records;
}

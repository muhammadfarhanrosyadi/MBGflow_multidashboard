/**
 * src/api/services/aiApi.ts
 * AI history, analysis, and prediction API calls.
 */
import { apiGet, apiGetFull, apiPost, apiDownload } from '../client';
import type { AiHistoryRecord, ModuleName } from '../../services/aiHistoryService';

// ── Types ──────────────────────────────────────────────────────────────────────
export interface AiPrediction {
  beras: number;
  telur: number;
  minyak: number;
}

export interface AiAnalysisResult {
  kesimpulan: string;
  temuanMasalah: string[];
  analisisAI: string;
  solusiStrategis: string[];
  confidenceScore: number;
  source?: string;
}

export interface AnalyzePayload {
  moduleName: ModuleName;
  moduleLabel?: string;
  tableData?: Record<string, unknown>[];
  chartData?: Record<string, unknown>[];
  kitchen_id?: number | null;
}

export const aiApi = {
  /** GET /api/ai/predict-stock */
  predictStock(): Promise<AiPrediction> {
    return apiGet<AiPrediction>('/ai/predict-stock');
  },

  /** POST /api/ai/analyze */
  analyze(payload: AnalyzePayload): Promise<AiAnalysisResult> {
    return apiPost<AiAnalysisResult>('/ai/analyze', payload);
  },

  /** GET /api/ai/history/:module */
  getHistory(module: ModuleName, params?: Record<string, string>) {
    return apiGetFull<AiHistoryRecord[]>(`/ai/history/${module}`, { params });
  },

  /** GET /api/ai/history (all modules) */
  getAllHistory(params?: Record<string, string>) {
    return apiGetFull<AiHistoryRecord[]>('/ai/history', { params });
  },

  /** POST /api/ai/history */
  saveHistory(record: Omit<AiHistoryRecord, 'id' | 'created_at'>) {
    return apiPost<AiHistoryRecord>('/ai/history', record);
  },

  /** GET /api/ai/history/export/:module?format=xlsx|pdf */
  exportHistory(module: ModuleName, format: 'xlsx' | 'pdf', extraParams?: Record<string, string>) {
    return apiDownload(
      `/ai/history/export/${module}`,
      `ai_history_${module}.${format}`,
      { params: { format, ...extraParams } },
    );
  },
};

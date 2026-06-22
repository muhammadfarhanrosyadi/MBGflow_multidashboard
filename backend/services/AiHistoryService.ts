/**
 * AiHistoryService.ts — updated for corrected schema
 * ──────────────────────────────────────────────────────────────
 * Now supports:
 *  - module_name as VARCHAR(50) — any moduleName from the system
 *  - kitchen_id nullable — global/multi-kitchen analyses allowed
 *  - module_label stored alongside module_name
 * ──────────────────────────────────────────────────────────────
 */

import { v4 as uuidv4 } from 'uuid';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require('../db') as import('knex').Knex;
const { generateDateFilter } = require('./reportService');

// ── Constants ─────────────────────────────────────────────────────────────────

const TABLE = 'universal_ai_histories';

/** All valid module_name values — matches the frontend moduleName identifiers */
export const MODULE_NAMES = [
  'dashboard',
  'produksi',
  'bahan-baku',
  'menu-planning',
  'logistik',
  'tracking',
  'keuangan',
  'karyawan',
] as const;

export type ModuleName = typeof MODULE_NAMES[number];

// ── Domain Types ──────────────────────────────────────────────────────────────

export interface UniversalAiHistory {
  id: string;
  kitchen_id: string | null;
  kitchen_name: string;
  module_name: string;
  module_label: string | null;
  prediction_date: string;
  prediction_result: Record<string, unknown>;
  created_at: string;
}

export interface SavePredictionDTO {
  kitchen_id?: string | null;
  module_name: string;
  module_label?: string | null;
  prediction_date: string;
  prediction_result: Record<string, unknown>;
}

export interface FetchHistoryOptions {
  module_name?: string;
  kitchen_id?: string;
  search?: string;
  limit?: number;
  offset?: number;
  reportType?: string;
  startDate?: string;
  endDate?: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export class AiHistoryService {
  static async savePrediction(dto: SavePredictionDTO): Promise<UniversalAiHistory> {
    const id  = uuidv4();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await db(TABLE).insert({
      id,
      kitchen_id:        dto.kitchen_id ?? null,
      module_name:       dto.module_name,
      module_label:      dto.module_label ?? null,
      prediction_date:   dto.prediction_date,
      prediction_result: JSON.stringify(dto.prediction_result),
      created_at:        now,
    });

    const [row] = await db(TABLE).where({ id }).select('*');
    return AiHistoryService._parseRow(row);
  }

  static async getHistory(opts: FetchHistoryOptions = {}): Promise<UniversalAiHistory[]> {
    const { module_name, kitchen_id, search, limit = 100, offset = 0, reportType, startDate, endDate } = opts;

    let query = db(TABLE)
      .select(
        `${TABLE}.id`,
        `${TABLE}.kitchen_id`,
        `${TABLE}.module_name`,
        `${TABLE}.module_label`,
        `${TABLE}.prediction_date`,
        `${TABLE}.prediction_result`,
        `${TABLE}.created_at`,
        db.raw(`COALESCE(kitchens.name, ${TABLE}.kitchen_id, 'Global / Semua Dapur') AS kitchen_name`),
      )
      .leftJoin('kitchens', `${TABLE}.kitchen_id`, 'kitchens.id')
      .orderBy(`${TABLE}.created_at`, 'desc')
      .limit(limit)
      .offset(offset);

    if (module_name) query = query.where(`${TABLE}.module_name`, module_name);
    if (kitchen_id)  query = query.where(`${TABLE}.kitchen_id`, kitchen_id);

    if (search && search.trim()) {
      const kw = `%${search.trim()}%`;
      query = query.where((b: import('knex').Knex.QueryBuilder) => {
        b.orWhereLike(`${TABLE}.module_name`,  kw)
          .orWhereLike(`${TABLE}.module_label`, kw)
          .orWhereLike(`${TABLE}.prediction_date`, kw)
          .orWhereLike('kitchens.name', kw)
          .orWhereRaw(`CAST(${TABLE}.prediction_result AS CHAR) LIKE ?`, [kw]);
      });
    }

    query = generateDateFilter(query, reportType, startDate, endDate, `${TABLE}.prediction_date`);

    const rows = await query;
    return rows.map(AiHistoryService._parseRow);
  }

  static async countHistory(opts: Omit<FetchHistoryOptions, 'limit' | 'offset'> = {}): Promise<number> {
    const { module_name, kitchen_id, search, reportType, startDate, endDate } = opts;

    let query = db(TABLE)
      .leftJoin('kitchens', `${TABLE}.kitchen_id`, 'kitchens.id')
      .count({ total: `${TABLE}.id` });

    if (module_name) query = query.where(`${TABLE}.module_name`, module_name);
    if (kitchen_id)  query = query.where(`${TABLE}.kitchen_id`, kitchen_id);

    if (search && search.trim()) {
      const kw = `%${search.trim()}%`;
      query = query.where((b: import('knex').Knex.QueryBuilder) => {
        b.orWhereLike(`${TABLE}.module_name`,  kw)
          .orWhereLike(`${TABLE}.module_label`, kw)
          .orWhereLike(`${TABLE}.prediction_date`, kw)
          .orWhereLike('kitchens.name', kw)
          .orWhereRaw(`CAST(${TABLE}.prediction_result AS CHAR) LIKE ?`, [kw]);
      });
    }

    query = generateDateFilter(query, reportType, startDate, endDate, `${TABLE}.prediction_date`);

    const [{ total }] = await query;
    return Number(total);
  }

  static async getAllForExport(module_name: string, opts: Omit<FetchHistoryOptions, 'limit' | 'offset'> = {}): Promise<UniversalAiHistory[]> {
    let query = db(TABLE)
      .select(
        `${TABLE}.id`,
        `${TABLE}.kitchen_id`,
        `${TABLE}.module_name`,
        `${TABLE}.module_label`,
        `${TABLE}.prediction_date`,
        `${TABLE}.prediction_result`,
        `${TABLE}.created_at`,
        db.raw(`COALESCE(kitchens.name, ${TABLE}.kitchen_id, 'Global / Semua Dapur') AS kitchen_name`),
      )
      .leftJoin('kitchens', `${TABLE}.kitchen_id`, 'kitchens.id')
      .orderBy(`${TABLE}.created_at`, 'desc');

    // Empty string or 'all' → no filter, return everything
    if (module_name && module_name !== 'all') {
      query = query.where(`${TABLE}.module_name`, module_name);
    }

    query = generateDateFilter(query, opts.reportType, opts.startDate, opts.endDate, `${TABLE}.prediction_date`);

    const rows = await query;
    return rows.map(AiHistoryService._parseRow);
  }


  private static _parseRow(row: Record<string, unknown>): UniversalAiHistory {
    const result = row.prediction_result;
    return {
      ...row,
      prediction_result: typeof result === 'string'
        ? (JSON.parse(result) as Record<string, unknown>)
        : (result as Record<string, unknown>) ?? {},
    } as UniversalAiHistory;
  }
}

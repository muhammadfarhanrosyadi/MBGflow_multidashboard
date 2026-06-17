/**
 * AiHistoryService.ts
 * ──────────────────────────────────────────────────────────────
 * Data-access layer for the `universal_ai_histories` table.
 *
 * The JSON `prediction_result` column stores module-specific
 * payloads.  Example shapes per module:
 *
 *  inventory   : { stock_level, reorder_point, predicted_shortage_days, items_at_risk, recommendations }
 *  production  : { predicted_output, efficiency_rate, waste_kg, target_vs_actual, recommendations }
 *  distribution: { delay_risk_pct, on_time_rate, delivery_count, routes_at_risk, recommendations }
 *  finance     : { predicted_revenue, cost_variance, cashflow_7d, budget_utilisation, alerts }
 *  employee    : { attendance_rate, overtime_hours, performance_score, flagged_count, recommendations }
 * ──────────────────────────────────────────────────────────────
 */

import { v4 as uuidv4 } from 'uuid';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require('../db') as import('knex').Knex;

// ── Constants ─────────────────────────────────────────────────────────────────

const TABLE = 'universal_ai_histories';

export const MODULE_NAMES = [
  'inventory',
  'production',
  'distribution',
  'finance',
  'employee',
] as const;

export type ModuleName = typeof MODULE_NAMES[number];

// ── Domain Types ──────────────────────────────────────────────────────────────

/** A fully-hydrated row as returned from the database. */
export interface UniversalAiHistory {
  id: string;
  kitchen_id: string;
  kitchen_name: string;          // joined from kitchens
  module_name: ModuleName;
  prediction_date: string;       // ISO datetime string
  prediction_result: Record<string, unknown>; // dynamic JSON payload
  created_at: string;
}

/** DTO for creating a new prediction record. */
export interface SavePredictionDTO {
  kitchen_id: string;
  module_name: ModuleName;
  prediction_date: string;       // ISO datetime 'YYYY-MM-DD HH:mm:ss'
  prediction_result: Record<string, unknown>;
}

/** Options for fetching history. */
export interface FetchHistoryOptions {
  module_name?: ModuleName;
  kitchen_id?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// ── Service ───────────────────────────────────────────────────────────────────

export class AiHistoryService {
  /**
   * Persist a new AI prediction row.
   * The `prediction_result` object is serialised as JSON automatically
   * by mysql2 when stored in a JSON column.
   */
  static async savePrediction(dto: SavePredictionDTO): Promise<UniversalAiHistory> {
    const id  = uuidv4();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await db(TABLE).insert({
      id,
      kitchen_id:        dto.kitchen_id,
      module_name:       dto.module_name,
      prediction_date:   dto.prediction_date,
      prediction_result: JSON.stringify(dto.prediction_result), // explicit stringify for safety
      created_at:        now,
    });

    const [row] = await db(TABLE).where({ id }).select('*');
    return AiHistoryService._parseRow(row);
  }

  /**
   * Retrieve history ordered by prediction_date DESC.
   * Supports optional module_name + full-text keyword search.
   *
   * The search term is applied against:
   *   – kitchen_id / kitchen name
   *   – prediction_date
   *   – the raw JSON text of prediction_result (via CAST … AS CHAR)
   */
  static async getHistory(opts: FetchHistoryOptions = {}): Promise<UniversalAiHistory[]> {
    const { module_name, kitchen_id, search, limit = 100, offset = 0 } = opts;

    let query = db(TABLE)
      .select(
        `${TABLE}.id`,
        `${TABLE}.kitchen_id`,
        `${TABLE}.module_name`,
        `${TABLE}.prediction_date`,
        `${TABLE}.prediction_result`,
        `${TABLE}.created_at`,
        db.raw(`COALESCE(kitchens.name, ${TABLE}.kitchen_id) AS kitchen_name`),
      )
      .leftJoin('kitchens', `${TABLE}.kitchen_id`, 'kitchens.id')
      .orderBy(`${TABLE}.prediction_date`, 'desc')
      .orderBy(`${TABLE}.created_at`, 'desc')
      .limit(limit)
      .offset(offset);

    if (module_name) {
      query = query.where(`${TABLE}.module_name`, module_name);
    }

    if (kitchen_id) {
      query = query.where(`${TABLE}.kitchen_id`, kitchen_id);
    }

    if (search && search.trim()) {
      const kw = `%${search.trim()}%`;
      query = query.where((b) => {
        b.whereLike(`${TABLE}.kitchen_id`, kw)
          .orWhereLike(`${TABLE}.prediction_date`, kw)
          .orWhereLike('kitchens.name', kw)
          // Search inside the JSON column by casting to text
          .orWhereRaw(`CAST(${TABLE}.prediction_result AS CHAR) LIKE ?`, [kw]);
      });
    }

    const rows = await query;
    return rows.map(AiHistoryService._parseRow);
  }

  /** Total count — same filters as getHistory (no limit/offset). */
  static async countHistory(opts: Omit<FetchHistoryOptions, 'limit' | 'offset'> = {}): Promise<number> {
    const { module_name, kitchen_id, search } = opts;

    let query = db(TABLE)
      .leftJoin('kitchens', `${TABLE}.kitchen_id`, 'kitchens.id')
      .count({ total: `${TABLE}.id` });

    if (module_name) query = query.where(`${TABLE}.module_name`, module_name);
    if (kitchen_id)  query = query.where(`${TABLE}.kitchen_id`, kitchen_id);

    if (search && search.trim()) {
      const kw = `%${search.trim()}%`;
      query = query.where((b: import('knex').Knex.QueryBuilder) => {
        b.whereLike(`${TABLE}.kitchen_id`, kw)
          .orWhereLike(`${TABLE}.prediction_date`, kw)
          .orWhereLike('kitchens.name', kw)
          .orWhereRaw(`CAST(${TABLE}.prediction_result AS CHAR) LIKE ?`, [kw]);
      });
    }

    const [{ total }] = await query;
    return Number(total);
  }

  /** Raw rows for export (no pagination). */
  static async getAllForExport(module_name: ModuleName): Promise<UniversalAiHistory[]> {
    const rows = await db(TABLE)
      .select(
        `${TABLE}.id`,
        `${TABLE}.kitchen_id`,
        `${TABLE}.module_name`,
        `${TABLE}.prediction_date`,
        `${TABLE}.prediction_result`,
        `${TABLE}.created_at`,
        db.raw(`COALESCE(kitchens.name, ${TABLE}.kitchen_id) AS kitchen_name`),
      )
      .leftJoin('kitchens', `${TABLE}.kitchen_id`, 'kitchens.id')
      .where(`${TABLE}.module_name`, module_name)
      .orderBy(`${TABLE}.prediction_date`, 'desc');

    return rows.map(AiHistoryService._parseRow);
  }

  // ── Private helper ─────────────────────────────────────────────────────────

  /**
   * mysql2 may return the JSON column as a string OR as a parsed object
   * depending on driver configuration — normalise both cases.
   */
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

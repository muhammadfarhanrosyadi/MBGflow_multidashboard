/**
 * AiPredictionService.ts
 * ──────────────────────────────────────────────────────────────
 * Business-logic layer for the `ai_predictions` table.
 *
 * Responsibilities:
 *  • savePrediction  — insert a new AI prediction row
 *  • getHistory      — fetch prediction history, newest first
 *  • getByKitchen    — fetch history filtered by kitchen_id
 *
 * All database access is done through the shared Knex instance
 * exported from `../../db` (CommonJS module — typed via require).
 * ──────────────────────────────────────────────────────────────
 */

import { v4 as uuidv4 } from 'uuid';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require('../db') as import('knex').Knex;

// ── Types ─────────────────────────────────────────────────────────────────────

/** A row as it exists in the database (all fields populated). */
export interface AiPrediction {
  id: string;
  kitchen_id: string;
  prediction_date: string;       // ISO date string 'YYYY-MM-DD'
  predicted_waste_kg: number;
  suggested_portion_adjustment: string | null;
  confidence_score: number | null;
  model_version: string | null;
  created_at: string;
  updated_at: string;
}

/** The payload required to save a new prediction. */
export interface CreateAiPredictionDTO {
  kitchen_id: string;
  prediction_date: string;       // 'YYYY-MM-DD'
  predicted_waste_kg: number;
  suggested_portion_adjustment?: string;
  confidence_score?: number;
  model_version?: string;
}

/** Options accepted by getHistory / getByKitchen. */
export interface FetchHistoryOptions {
  /** Filter to a specific kitchen UUID. */
  kitchen_id?: string;
  /** Keyword search on suggestion text or kitchen_id. */
  search?: string;
  /** Maximum rows to return (default: 100). */
  limit?: number;
  /** Offset for pagination (default: 0). */
  offset?: number;
}

// ── Table name constant ───────────────────────────────────────────────────────
const TABLE = 'ai_predictions';

// ── Service Class ─────────────────────────────────────────────────────────────

export class AiPredictionService {
  /**
   * Persist a new AI prediction row.
   *
   * @param dto - The prediction data to insert.
   * @returns The newly created prediction (full row).
   */
  static async savePrediction(dto: CreateAiPredictionDTO): Promise<AiPrediction> {
    const id = uuidv4();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const row = {
      id,
      kitchen_id: dto.kitchen_id,
      prediction_date: dto.prediction_date,
      predicted_waste_kg: dto.predicted_waste_kg,
      suggested_portion_adjustment: dto.suggested_portion_adjustment ?? null,
      confidence_score: dto.confidence_score ?? null,
      model_version: dto.model_version ?? null,
      created_at: now,
      updated_at: now,
    };

    await db(TABLE).insert(row);

    // Return the freshly inserted row
    const [created] = await db(TABLE).where({ id }).select('*');
    return created as AiPrediction;
  }

  /**
   * Retrieve prediction history, ordered by prediction_date DESC then created_at DESC.
   *
   * Supports optional kitchen_id filter and keyword search.
   *
   * @param opts - Filtering and pagination options.
   * @returns Array of AiPrediction rows.
   */
  static async getHistory(opts: FetchHistoryOptions = {}): Promise<AiPrediction[]> {
    const { kitchen_id, search, limit = 100, offset = 0 } = opts;

    let query = db(TABLE)
      .select(
        `${TABLE}.id`,
        `${TABLE}.kitchen_id`,
        `${TABLE}.prediction_date`,
        `${TABLE}.predicted_waste_kg`,
        `${TABLE}.suggested_portion_adjustment`,
        `${TABLE}.confidence_score`,
        `${TABLE}.model_version`,
        `${TABLE}.created_at`,
        `${TABLE}.updated_at`,
        // Optionally join kitchen name for display
        db.raw(`COALESCE(kitchens.name, ${TABLE}.kitchen_id) AS kitchen_name`),
      )
      .leftJoin('kitchens', `${TABLE}.kitchen_id`, 'kitchens.id')
      .orderBy(`${TABLE}.prediction_date`, 'desc')
      .orderBy(`${TABLE}.created_at`, 'desc')
      .limit(limit)
      .offset(offset);

    // Optional: filter by specific kitchen
    if (kitchen_id) {
      query = query.where(`${TABLE}.kitchen_id`, kitchen_id);
    }

    // Optional: keyword search across key fields
    if (search && search.trim()) {
      const kw = `%${search.trim()}%`;
      query = query.where((builder) => {
        builder
          .whereLike(`${TABLE}.kitchen_id`, kw)
          .orWhereLike(`${TABLE}.suggested_portion_adjustment`, kw)
          .orWhereLike(`${TABLE}.prediction_date`, kw)
          .orWhereLike('kitchens.name', kw);
      });
    }

    const rows = await query;
    return rows as AiPrediction[];
  }

  /**
   * Count total predictions (optionally filtered) — useful for pagination metadata.
   *
   * @param opts - Same filter options as getHistory (limit/offset ignored).
   * @returns Total count of matching rows.
   */
  static async countHistory(opts: Omit<FetchHistoryOptions, 'limit' | 'offset'> = {}): Promise<number> {
    const { kitchen_id, search } = opts;

    let query = db(TABLE)
      .leftJoin('kitchens', `${TABLE}.kitchen_id`, 'kitchens.id')
      .count({ total: `${TABLE}.id` });

    if (kitchen_id) {
      query = query.where(`${TABLE}.kitchen_id`, kitchen_id);
    }

    if (search && search.trim()) {
      const kw = `%${search.trim()}%`;
      query = query.where((builder: import('knex').Knex.QueryBuilder) => {
        builder
          .whereLike(`${TABLE}.kitchen_id`, kw)
          .orWhereLike(`${TABLE}.suggested_portion_adjustment`, kw)
          .orWhereLike(`${TABLE}.prediction_date`, kw)
          .orWhereLike('kitchens.name', kw);
      });
    }

    const [{ total }] = await query;
    return Number(total);
  }
}

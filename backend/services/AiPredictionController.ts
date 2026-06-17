/**
 * AiPredictionController.ts
 * ──────────────────────────────────────────────────────────────
 * HTTP request/response layer for AI Prediction endpoints.
 *
 * Endpoints handled:
 *  GET  /api/ai/predictions/history
 *      → Returns prediction history (paginated, searchable).
 *      Query params:
 *        kitchen_id  (string, optional)  — filter by kitchen UUID
 *        search      (string, optional)  — keyword filter
 *        limit       (number, optional, default 50)
 *        page        (number, optional, default 1)
 *
 *  POST /api/ai/predictions
 *      → Save a new prediction (for internal/AI service use).
 *      Body: CreateAiPredictionDTO
 * ──────────────────────────────────────────────────────────────
 */

import { Request, Response } from 'express';
import { AiPredictionService, CreateAiPredictionDTO } from '../services/AiPredictionService';

// ── GET /api/ai/predictions/history ──────────────────────────────────────────

export async function getPredictionHistory(req: Request, res: Response): Promise<void> {
  try {
    const {
      kitchen_id,
      search,
      limit: limitParam = '50',
      page: pageParam = '1',
    } = req.query as Record<string, string>;

    // Validate & coerce pagination params
    const limit  = Math.min(Math.max(parseInt(limitParam, 10)  || 50,  1), 200);
    const page   = Math.max(parseInt(pageParam, 10) || 1, 1);
    const offset = (page - 1) * limit;

    const [predictions, total] = await Promise.all([
      AiPredictionService.getHistory({ kitchen_id, search, limit, offset }),
      AiPredictionService.countHistory({ kitchen_id, search }),
    ]);

    res.json({
      success: true,
      data: predictions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[AiPredictionController] getPredictionHistory error:', message);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil riwayat prediksi AI: ' + message,
    });
  }
}

// ── POST /api/ai/predictions ──────────────────────────────────────────────────

export async function createPrediction(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as Partial<CreateAiPredictionDTO>;

    // Validation
    const missing: string[] = [];
    if (!body.kitchen_id)        missing.push('kitchen_id');
    if (!body.prediction_date)   missing.push('prediction_date');
    if (body.predicted_waste_kg === undefined || body.predicted_waste_kg === null) {
      missing.push('predicted_waste_kg');
    }

    if (missing.length > 0) {
      res.status(400).json({
        success: false,
        error: `Field wajib tidak lengkap: ${missing.join(', ')}`,
      });
      return;
    }

    // Type guard — predicted_waste_kg must be a valid number
    const wasteKg = Number(body.predicted_waste_kg);
    if (isNaN(wasteKg) || wasteKg < 0) {
      res.status(400).json({
        success: false,
        error: 'predicted_waste_kg harus berupa angka non-negatif.',
      });
      return;
    }

    const prediction = await AiPredictionService.savePrediction({
      kitchen_id:                    body.kitchen_id!,
      prediction_date:               body.prediction_date!,
      predicted_waste_kg:            wasteKg,
      suggested_portion_adjustment:  body.suggested_portion_adjustment,
      confidence_score:              body.confidence_score !== undefined
                                       ? Number(body.confidence_score)
                                       : undefined,
      model_version:                 body.model_version,
    });

    res.status(201).json({
      success: true,
      message: 'Prediksi berhasil disimpan.',
      data: prediction,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[AiPredictionController] createPrediction error:', message);
    res.status(500).json({
      success: false,
      error: 'Gagal menyimpan prediksi AI: ' + message,
    });
  }
}

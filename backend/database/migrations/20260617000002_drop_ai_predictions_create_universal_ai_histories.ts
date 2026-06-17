import type { Knex } from 'knex';

// ================================================================
// Migration: Universal AI Histories
// Date      : 2026-06-17
// Purpose   :
//   Step 1 — Drop the old kitchen-scoped `ai_predictions` table
//             if it exists (clean up the incorrect schema).
//   Step 2 — Create the new `universal_ai_histories` table that
//             stores AI prediction results for EVERY module using
//             a JSON column, making the schema flexible enough to
//             hold arbitrary prediction payloads per module.
//
// Supported module_name values:
//   'inventory' | 'production' | 'distribution' | 'finance' | 'employee'
//
// Example prediction_result JSON shapes:
//   inventory   : { stock_level, reorder_point, predicted_shortage, recommendations }
//   production  : { predicted_output, efficiency_rate, waste_kg, recommendations }
//   distribution: { delay_risk_pct, on_time_rate, delivery_count, routes_at_risk }
//   finance     : { predicted_revenue, cost_variance, cashflow_7d, alerts }
//   employee    : { attendance_rate, overtime_hours, performance_score, flagged_employees }
// ================================================================

const MODULE_NAMES = [
  'inventory',
  'production',
  'distribution',
  'finance',
  'employee',
] as const;

export async function up(knex: Knex): Promise<void> {
  // ── Step 1: Drop legacy table ─────────────────────────────────
  // Disable FK checks temporarily so the drop succeeds even if
  // other tables theoretically reference ai_predictions.
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
  await knex.schema.dropTableIfExists('ai_predictions');
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

  // ── Step 2: Create universal_ai_histories ─────────────────────
  await knex.schema.createTable('universal_ai_histories', (t) => {
    // Primary key — UUID v4 generated at application layer
    t.string('id', 36).primary().comment('UUID v4');

    // Which kitchen this prediction is for
    // Nullable FK: allows orphan records when kitchen is deleted
    t.string('kitchen_id', 36)
      .notNullable()
      .references('id')
      .inTable('kitchens')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')
      .comment('References kitchens.id');

    // Which SCM module generated this prediction
    t.enum('module_name', MODULE_NAMES as unknown as string[])
      .notNullable()
      .comment('SCM module that owns this prediction');

    // When the prediction was generated / is valid for
    t.datetime('prediction_date')
      .notNullable()
      .comment('Datetime the prediction targets or was generated');

    // ── CRITICAL: JSON payload — flexible per module ───────────
    // MySQL JSON column supports validation, indexing on paths,
    // and efficient serialisation of arbitrary prediction shapes.
    t.json('prediction_result')
      .notNullable()
      .comment('Arbitrary JSON payload; shape varies per module_name');

    // Auto-managed creation timestamp only (no updated_at needed —
    // predictions are immutable once saved)
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    // ── Indexes ────────────────────────────────────────────────
    t.index('kitchen_id',      'idx_uai_kitchen_id');
    t.index('module_name',     'idx_uai_module_name');
    t.index('prediction_date', 'idx_uai_prediction_date');
    t.index(['kitchen_id', 'module_name'], 'idx_uai_kitchen_module');
    t.index(['module_name', 'prediction_date'], 'idx_uai_module_date');
  });
}

// ================================================================
// DOWN — Rollback: drop universal table, recreate old predictions
// ================================================================
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('universal_ai_histories');

  // Re-create the old table so rollback doesn't break the migration chain
  await knex.schema.createTable('ai_predictions', (t) => {
    t.string('id', 36).primary();
    t.string('kitchen_id', 36).notNullable()
      .references('id').inTable('kitchens')
      .onDelete('CASCADE').onUpdate('CASCADE');
    t.date('prediction_date').notNullable();
    t.decimal('predicted_waste_kg', 10, 3).notNullable().defaultTo(0);
    t.text('suggested_portion_adjustment').nullable();
    t.decimal('confidence_score', 5, 4).nullable();
    t.string('model_version', 50).nullable();
    t.timestamps(true, true);
  });
}

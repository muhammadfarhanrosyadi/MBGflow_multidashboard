import type { Knex } from 'knex';

// ================================================================
// Migration: SCM MBG — Create ai_predictions Table
// Date      : 2026-06-17
// Purpose   : Stores AI-generated waste predictions and portion
//             adjustment recommendations per kitchen per day.
//
// Columns:
//   id                         — UUID v4 primary key
//   kitchen_id                 — References kitchens.id (FK)
//   prediction_date            — The date the prediction is for
//   predicted_waste_kg         — Predicted food waste in kilograms
//   suggested_portion_adjustment — AI textual recommendation
//   created_at / updated_at    — Auto-managed timestamps
// ================================================================

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('ai_predictions', (t) => {
    // ── Primary Key ────────────────────────────────────────────
    t.string('id', 36)
      .primary()
      .comment('UUID v4 — generated at application layer');

    // ── Foreign Key: Kitchen ───────────────────────────────────
    // Nullable FK so we can store predictions even for archived/deleted kitchens
    t.string('kitchen_id', 36)
      .notNullable()
      .references('id')
      .inTable('kitchens')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')
      .comment('The kitchen this prediction belongs to');

    // ── Prediction Payload ─────────────────────────────────────
    t.date('prediction_date')
      .notNullable()
      .comment('The calendar date this prediction targets (YYYY-MM-DD)');

    t.decimal('predicted_waste_kg', 10, 3)
      .notNullable()
      .defaultTo(0)
      .comment('Forecasted food waste quantity in kilograms (up to 9,999,999.999)');

    t.text('suggested_portion_adjustment')
      .nullable()
      .comment('Free-text AI recommendation on how to adjust portion sizes');

    // ── Confidence & Source Metadata (optional future-proofing) ─
    t.decimal('confidence_score', 5, 4)
      .nullable()
      .comment('Model confidence 0.0000–1.0000 (optional)');

    t.string('model_version', 50)
      .nullable()
      .comment('Identifier of the AI model version that generated this row');

    // ── Timestamps ─────────────────────────────────────────────
    // t.timestamps(true, true) creates both created_at and updated_at
    // with defaultTo(knex.fn.now()) and auto-update behaviour in MySQL
    t.timestamps(true, true);

    // ── Indexes ────────────────────────────────────────────────
    t.index('kitchen_id',      'idx_ai_pred_kitchen_id');
    t.index('prediction_date', 'idx_ai_pred_date');

    // Composite: quickly fetch a kitchen's history ordered by date
    t.index(['kitchen_id', 'prediction_date'], 'idx_ai_pred_kitchen_date');
  });
}

// ================================================================
// DOWN — Rollback: simply drop the table
// ================================================================
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('ai_predictions');
}

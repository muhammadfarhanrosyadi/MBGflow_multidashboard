import type { Knex } from 'knex';

// ================================================================
// Migration: Fix universal_ai_histories schema
// Date: 2026-06-17
//
// Problems fixed:
//  1. module_name was ENUM('inventory','production','distribution',
//     'finance','employee') — does NOT match the actual moduleName
//     values sent by the frontend ('dashboard', 'produksi',
//     'bahan-baku', 'menu-planning', 'logistik', 'tracking',
//     'karyawan', 'keuangan').
//     Fix → Change to VARCHAR(50) (flexible, no future migration needed).
//
//  2. kitchen_id was NOT NULL with FK → kitchens.id.
//     Dashboard & multi-kitchen analyses have no single kitchen
//     context.
//     Fix → DROP FK constraint, make kitchen_id nullable.
//
//  3. Add module_label VARCHAR(100) to store the human-readable
//     label ('Dashboard Global SCM', 'Produksi & Multi Dapur' …)
//     so history page can display it without a lookup table.
// ================================================================

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('universal_ai_histories', (t) => {
    // ── 1. Drop old FK on kitchen_id ──────────────────────────
    // knex cannot drop FK by constraint name directly in MySQL
    // so we use raw SQL below.
  });

  // Drop the foreign key constraint (MySQL requires knowing the
  // exact constraint name — it was set by our previous migration).
  await knex.raw(`
    ALTER TABLE universal_ai_histories
      DROP FOREIGN KEY universal_ai_histories_kitchen_id_foreign
  `).catch(() => {
    // Constraint may already be gone — ignore error
  });

  await knex.schema.alterTable('universal_ai_histories', (t) => {
    // ── 2. Make kitchen_id nullable ───────────────────────────
    t.string('kitchen_id', 100).nullable().alter();

    // ── 3. Change module_name from ENUM → VARCHAR(50) ─────────
    t.string('module_name', 50).notNullable().alter();

    // ── 4. Add module_label column ────────────────────────────
    t.string('module_label', 100).nullable().after('module_name')
      .comment('Human-readable label, e.g. "Dashboard Global SCM"');
  });

  // Re-add index on module_name (was on the ENUM column, still valid)
  // Drop first to avoid duplicate index error on re-runs
  await knex.raw(`
    ALTER TABLE universal_ai_histories
      DROP INDEX IF EXISTS idx_uai_module_name
  `).catch(() => {});

  await knex.raw(`
    CREATE INDEX idx_uai_module_name ON universal_ai_histories (module_name)
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Remove the module_label column
  await knex.schema.alterTable('universal_ai_histories', (t) => {
    t.dropColumn('module_label');
  });

  // Revert module_name to original ENUM (data may be truncated —
  // this is a best-effort rollback only)
  await knex.raw(`
    ALTER TABLE universal_ai_histories
      MODIFY COLUMN module_name
        ENUM('inventory','production','distribution','finance','employee')
        NOT NULL
  `);

  // Revert kitchen_id to NOT NULL (may fail if NULLs exist)
  await knex.raw(`
    ALTER TABLE universal_ai_histories
      MODIFY COLUMN kitchen_id VARCHAR(36) NOT NULL
  `).catch(() => {});
}

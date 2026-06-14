import type { Knex } from 'knex';

// ================================================================
// Migration: Drop vendor_approvals table
// Tanggal : 2026-06-09
// Deskripsi: Menghapus tabel vendor_approvals karena fitur
//            Approval Vendor sudah dihilangkan dari sistem.
// ================================================================

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('vendor_approvals');
}

export async function down(knex: Knex): Promise<void> {
  // Recreate table for rollback safety
  const exists = await knex.schema.hasTable('vendor_approvals');
  if (!exists) {
    await knex.schema.createTable('vendor_approvals', (t) => {
      t.increments('id').primary();
      t.string('external_vendor_id', 100).notNullable();
      t.string('vendor_name', 255).notNullable();
      t.enum('status', ['pending', 'approved', 'rejected']).notNullable().defaultTo('pending');
      t.timestamps(true, true);
      t.index('status', 'idx_vendor_approvals_status');
      t.index('external_vendor_id', 'idx_vendor_approvals_ext_id');
    });
  }
}

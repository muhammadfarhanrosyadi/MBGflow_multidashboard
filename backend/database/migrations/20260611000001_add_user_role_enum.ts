import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Tambahkan 'user' ke enum role di tabel users
  await knex.schema.raw(
    "ALTER TABLE `users` MODIFY COLUMN `role` ENUM('master_admin', 'admin_dapur', 'finance', 'viewer', 'user') NOT NULL DEFAULT 'admin_dapur'"
  );
}

export async function down(knex: Knex): Promise<void> {
  // Kembalikan ke enum awal
  await knex.schema.raw(
    "ALTER TABLE `users` MODIFY COLUMN `role` ENUM('master_admin', 'admin_dapur', 'finance', 'viewer') NOT NULL DEFAULT 'admin_dapur'"
  );
}

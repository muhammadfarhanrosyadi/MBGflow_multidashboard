/**
 * seed-migrations.js
 * One-shot script: marks the already-applied migrations as completed
 * in the knex_migrations table so knex doesn't try to re-run them.
 */
require('dotenv').config({ path: __dirname + '/.env' });
const knex = require('knex');

const db = knex({
  client: 'mysql2',
  connection: {
    host:     process.env.DB_HOST     || '127.0.0.1',
    port:     Number(process.env.DB_PORT || 3306),
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'SCM_MBG',
  },
});

const already_run = [
  '20260519000001_create_all_tables.ts',
  '20260519041226_add_ai_notes_to_finance.ts',
  '20260609000001_drop_vendor_approvals.ts',
  '20260611000001_add_user_role_enum.ts',
];

async function run() {
  try {
    // Delete any existing rows to avoid duplicates
    await db('knex_migrations').whereIn('name', already_run).delete();

    // Insert them as batch 1
    const rows = already_run.map(name => ({
      name,
      batch: 1,
      migration_time: new Date(),
    }));
    await db('knex_migrations').insert(rows);

    console.log('✅ Migration history seeded successfully.');
    const list = await db('knex_migrations').select('*').orderBy('id');
    console.table(list);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

run();

// knexfile.js  — SCM MBG
// Sengaja dibuat sebagai JavaScript (bukan .ts) agar Knex CLI
// bisa membacanya langsung TANPA perlu ts-node untuk file ini.
// File migrasi (.ts) tetap dijalankan via ts-node yang di-register
// oleh flag `node -r ts-node/register` di npm scripts.

require('dotenv').config({ path: __dirname + '/.env' });
const path = require('path');

/** @type {Record<string, import('knex').Knex.Config>} */
module.exports = {

  development: {
    client: 'mysql2',
    connection: {
      host    : process.env.DB_HOST     || '127.0.0.1',
      port    : Number(process.env.DB_PORT || 3306),
      user    : process.env.DB_USER     || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME     || 'SCM_MBG',
      charset : 'utf8mb4',
    },
    pool: { min: 2, max: 10 },
    migrations: {
      tableName     : 'knex_migrations',
      directory     : path.join(__dirname, 'database/migrations'),
      extension     : 'ts',
      loadExtensions: ['.ts'],
    },
    seeds: {
      directory     : path.join(__dirname, 'database/seeds'),
      extension     : 'ts',
      loadExtensions: ['.ts'],
    },
    debug: process.env.NODE_ENV === 'development',
  },

  production: {
    client: 'mysql2',
    connection: {
      host    : process.env.DB_HOST,
      port    : Number(process.env.DB_PORT || 3306),
      user    : process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset : 'utf8mb4',
    },
    pool: { min: 2, max: 20 },
    migrations: {
      tableName     : 'knex_migrations',
      directory     : path.join(__dirname, 'database/migrations'),
      extension     : 'ts',
      loadExtensions: ['.ts'],
    },
    seeds: {
      directory     : path.join(__dirname, 'database/seeds'),
      extension     : 'ts',
      loadExtensions: ['.ts'],
    },
    debug: false,
  },
};

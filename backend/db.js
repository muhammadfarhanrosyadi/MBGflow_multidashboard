const knex = require('knex');
const knexfile = require('./knexfile');

// Gunakan environment 'development' atau sesuai NODE_ENV
const environment = process.env.NODE_ENV || 'development';
const config = knexfile[environment];

const db = knex(config);

module.exports = db;

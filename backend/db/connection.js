'use strict';

require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/aplicacion_gastos';

const pool = new Pool({ connectionString });

async function query(text, params) {
  return pool.query(text, params);
}

async function ping() {
  const result = await query('select now() as now');
  return result.rows[0];
}

module.exports = { pool, query, ping, connectionString };

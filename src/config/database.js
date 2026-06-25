require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const logger = require('../utils/logger');

// Render's managed Postgres requires SSL. Enable it whenever a DATABASE_URL is set
// (production); local dev without the var keeps the plain connection.
const useSSL = Boolean(process.env.DATABASE_URL) && process.env.PGSSL !== 'false';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => logger.error('PG pool error', { err }));

// Create tables on boot if they don't exist (idempotent). Keeps deploys
// zero-touch — no manual psql/migration step required.
async function runSchema(client) {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  await client.query(sql);
  logger.info('Schema ensured (tables created if missing)');
}

async function connectDB() {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    await runSchema(client);
    logger.info('PostgreSQL connected');
  } finally {
    client.release();
  }
}

module.exports = { pool, connectDB };

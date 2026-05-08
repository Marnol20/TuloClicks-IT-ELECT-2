/**
 * setup-db.js
 *
 * Reads init-db.sql and executes every statement against the configured
 * MySQL database.  Safe to run multiple times — all CREATE TABLE statements
 * use IF NOT EXISTS and the ticket_types view uses CREATE OR REPLACE.
 *
 * Usage (standalone):
 *   node setup-db.js
 *
 * Usage (from server.js on startup):
 *   const setupDb = require('./setup-db');
 *   setupDb();
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const db   = require('./db');

async function setupDb() {
  const sqlFile = path.join(__dirname, 'init-db.sql');

  if (!fs.existsSync(sqlFile)) {
    console.error('❌ setup-db: init-db.sql not found at', sqlFile);
    return;
  }

  // Check whether the schema has already been initialised by probing for the
  // users table.  This avoids re-running the full SQL on every cold start.
  try {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS cnt
       FROM information_schema.tables
       WHERE table_schema = DATABASE()
         AND table_name   = 'users'`
    );

    if (rows[0].cnt > 0) {
      console.log('✅ setup-db: schema already exists — skipping initialisation.');
      return;
    }
  } catch (err) {
    console.error('❌ setup-db: could not query information_schema:', err.message);
    return;
  }

  console.log('🔧 setup-db: initialising database schema from init-db.sql …');

  const sql = fs.readFileSync(sqlFile, 'utf8');

  // Split on semicolons, strip comments and blank lines, execute each statement.
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let executed = 0;
  let failed   = 0;

  for (const statement of statements) {
    try {
      await db.query(statement);
      executed++;
    } catch (err) {
      console.error(`❌ setup-db: failed to execute statement:\n${statement}\nError: ${err.message}`);
      failed++;
    }
  }

  if (failed === 0) {
    console.log(`✅ setup-db: schema initialised successfully (${executed} statements executed).`);
  } else {
    console.warn(`⚠️  setup-db: completed with ${failed} error(s) out of ${executed + failed} statements.`);
  }
}

module.exports = setupDb;

// Allow running directly: `node setup-db.js`
if (require.main === module) {
  setupDb()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('❌ setup-db: unexpected error:', err);
      process.exit(1);
    });
}

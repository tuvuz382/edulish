import fs from 'fs';
import mysql from 'mysql2/promise';

const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    envVars[key.trim()] = values.join('=').trim().replace(/['"]/g, '');
  }
});

async function run() {
  const connection = await mysql.createConnection({
    host: envVars.DB_HOST || 'localhost',
    port: Number(envVars.DB_PORT) || 3307,
    user: envVars.DB_USER || 'root',
    password: envVars.DB_PASSWORD || '',
    multipleStatements: true
  });

  console.log('Adding streak columns to users table...');
  const sql = `
    USE edulish;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS streak INT UNSIGNED NOT NULL DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_freeze INT UNSIGNED NOT NULL DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_date DATE NULL;
  `;
  
  try {
    await connection.query(sql);
    console.log('Done! Streak columns added.');
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}

run().catch(console.error);

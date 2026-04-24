import fs from 'fs';
import mysql from 'mysql2/promise';
import path from 'path';

// Đọc .env.local thủ công vì Next.js không có sẵn dotenv package
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

  const sql = fs.readFileSync('./database/questions.sql', 'utf8');
  console.log('Running questions.sql...');
  await connection.query(sql);
  console.log('Done seeding 40 questions!');
  process.exit(0);
}

run().catch(console.error);

import fs from 'fs';
import mysql from 'mysql2/promise';

// Đọc .env.local thủ công
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

  console.log('Creating messages table...');
  const sql = `
    USE edulish;
    CREATE TABLE IF NOT EXISTS messages (
      id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      sender_id    INT UNSIGNED NOT NULL,
      receiver_id  INT UNSIGNED NOT NULL,
      content      TEXT NOT NULL,
      is_read      TINYINT(1) DEFAULT 0,
      created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `;
  
  await connection.query(sql);
  console.log('Done! Messages table is ready.');
  process.exit(0);
}

run().catch(console.error);

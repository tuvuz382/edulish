import fs from 'fs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  await connection.query('CREATE DATABASE IF NOT EXISTS `edulish` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
  await connection.query('USE `edulish`;');

  const schema = fs.readFileSync('./database/schema.sql', 'utf8');
  console.log('Running schema.sql...');
  await connection.query(schema);
  console.log('Done!');
  process.exit(0);
}

run().catch(console.error);

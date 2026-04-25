
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function testConnection() {
  console.log("Testing connection with settings:");
  console.log({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    ssl: !!process.env.DB_SSL
  });

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_HOST !== 'localhost' ? {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false
      } : undefined
    });
    console.log("Successfully connected to the database!");
    await connection.end();
  } catch (error) {
    console.error("Connection failed:", error);
  }
}

testConnection();

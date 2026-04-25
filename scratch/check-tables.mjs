
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    content.split("\n").forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

async function checkTables() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'edulish'
  };

  try {
    const connection = await mysql.createConnection(config);
    console.log("Connected to database:", config.database);
    
    const [tables] = await connection.query("SHOW TABLES");
    console.log("Tables found:", tables.map(t => Object.values(t)[0]));
    
    await connection.end();
  } catch (error) {
    console.error("Failed to check tables:", error.message);
  }
}

checkTables();

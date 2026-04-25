
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

// Thủ công load .env.local nếu không có dotenv
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

async function checkDB() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  };

  console.log("Checking MySQL connection to:", config.host, ":", config.port);

  try {
    const connection = await mysql.createConnection(config);
    console.log("Connection successful!");
    
    const [rows] = await connection.query("SHOW DATABASES LIKE 'edulish'");
    if (rows.length > 0) {
      console.log("Database 'edulish' exists.");
    } else {
      console.log("Database 'edulish' DOES NOT EXIST.");
    }
    
    await connection.end();
  } catch (error) {
    console.error("Connection failed:", error.message);
  }
}

checkDB();

import mysql from "mysql2/promise";

// Tạo một connection pool thay vì tạo kết nối mới mỗi lần.
// Pool giúp tái sử dụng kết nối, tránh bị "too many connections".
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 4000,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // Chỉ dùng SSL nếu không phải là localhost (TiDB Cloud yêu cầu SSL, XAMPP thì không)
  ssl: process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1' ? {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: false
  } : undefined,

  connectionLimit: 10,
  waitForConnections: true,
  connectTimeout: 10000, // Tăng timeout cho môi trường Serverless
});

export default pool;

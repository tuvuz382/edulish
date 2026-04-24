import mysql from "mysql2/promise";

// Tạo một connection pool thay vì tạo kết nối mới mỗi lần.
// Pool giúp tái sử dụng kết nối, tránh bị "too many connections".
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "edulish",

  // Số kết nối tối đa trong pool. 10 là đủ cho dự án MVP.
  connectionLimit: 10,

  // Tự động chờ nếu pool đầy thay vì báo lỗi ngay.
  waitForConnections: true,
});

export default pool;

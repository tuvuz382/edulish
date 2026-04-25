import fs from 'fs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local nếu tồn tại (cho local), nếu không sẽ dùng biến môi trường (cho production)
dotenv.config({ path: '.env.local' });

async function run() {
  const isLocal = process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '127.0.0.1';
  
  console.log(`Đang kết nối tới ${isLocal ? 'Local (XAMPP)' : 'Production (TiDB Cloud)'}: ${process.env.DB_HOST}`);

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || (isLocal ? 3307 : 4000),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'edulish',
      multipleStatements: true,
      // BẮT BUỘC: TiDB Cloud yêu cầu SSL
      ssl: !isLocal ? {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false
      } : undefined
    });

    console.log('Kết nối thành công. Đang chạy schema.sql...');

    const schemaPath = path.resolve(process.cwd(), './database/schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Không tìm thấy file schema tại: ${schemaPath}`);
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    await connection.query(schema);
    
    console.log('Migration hoàn tất! Toàn bộ bảng đã được khởi tạo.');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi chạy migration:', error.message);
    process.exit(1);
  }
}

run();

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";

interface JwtPayload {
  userId: number;
  role: string;
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("edulish_token")?.value;
    if (!token) return NextResponse.json({ success: false }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const { userId, role } = decoded;

    let sql = "";
    const params = [userId];

    if (role === "student") {
      // Học sinh: Lấy danh sách giáo viên dạy lớp mình + các bạn cùng lớp
      sql = `
        (SELECT DISTINCT u.id, u.name, u.email, u.role
         FROM users u
         JOIN class_teachers ct ON u.id = ct.user_id
         JOIN class_members cm ON ct.class_id = cm.class_id
         WHERE cm.user_id = ? AND u.role = 'teacher')
        UNION
        (SELECT DISTINCT u.id, u.name, u.email, u.role
         FROM users u
         JOIN class_members cm_target ON u.id = cm_target.user_id
         JOIN class_members cm_me ON cm_target.class_id = cm_me.class_id
         WHERE cm_me.user_id = ? AND u.id != ?)
      `;
      params.push(userId, userId); // Thêm params cho phần UNION
    } else if (role === "teacher") {
      // Giáo viên: Lấy danh sách học sinh trong các lớp mình dạy
      sql = `
        SELECT DISTINCT u.id, u.name, u.email, u.role
        FROM users u
        JOIN class_members cm ON u.id = cm.user_id
        JOIN class_teachers ct ON cm.class_id = ct.class_id
        WHERE ct.user_id = ? AND u.role = 'student'
      `;
    } else {
      // Admin hoặc khác: Lấy tất cả (đơn giản hoá cho MVP)
      sql = `SELECT id, name, email, role FROM users WHERE id != ? LIMIT 50`;
    }

    const [contacts] = await pool.query<RowDataPacket[]>(sql, params);

    return NextResponse.json({ success: true, contacts });
  } catch (error) {
    console.error("[API Contacts GET] Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

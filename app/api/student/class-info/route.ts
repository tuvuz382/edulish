import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";

interface JwtPayload {
  userId: number;
  role: string;
}

// Lấy thông tin lớp học của học sinh (gồm chi tiết lớp, giáo viên, và danh sách bạn cùng lớp)
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("edulish_token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const userId = decoded.userId;

    // 1. Tìm class_id của học sinh
    const [memberRows] = await pool.query<RowDataPacket[]>(
      "SELECT class_id, joined_at FROM class_members WHERE user_id = ?",
      [userId]
    );

    if (memberRows.length === 0) {
      return NextResponse.json({ success: true, hasClass: false, message: "Bạn chưa được phân vào lớp nào." });
    }

    const classId = memberRows[0].class_id;
    const joinedAt = memberRows[0].joined_at;

    // 2. Lấy thông tin lớp học
    const [classRows] = await pool.query<RowDataPacket[]>(
      "SELECT id, name, level, room, created_at FROM classes WHERE id = ?",
      [classId]
    );
    const classInfo = classRows[0];

    // 3. Lấy thông tin giáo viên phụ trách
    const [teacherRows] = await pool.query<RowDataPacket[]>(
      `SELECT u.id, u.name, u.email 
       FROM users u 
       JOIN class_teachers ct ON u.id = ct.user_id 
       WHERE ct.class_id = ?`,
      [classId]
    );
    const teacherInfo = teacherRows.length > 0 ? teacherRows[0] : null;

    // 4. Lấy danh sách bạn cùng lớp
    const [classmates] = await pool.query<RowDataPacket[]>(
      `SELECT u.id, u.name, u.email, cm.joined_at 
       FROM users u 
       JOIN class_members cm ON u.id = cm.user_id 
       WHERE cm.class_id = ? AND u.id != ?
       ORDER BY u.name ASC`,
      [classId, userId]
    );

    return NextResponse.json({
      success: true,
      hasClass: true,
      classInfo,
      joinedAt,
      teacherInfo,
      classmates
    });

  } catch (error) {
    console.error("[API Student ClassInfo] Error:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ" }, { status: 500 });
  }
}

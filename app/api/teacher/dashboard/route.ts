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
    if (decoded.role !== 'teacher') return NextResponse.json({ success: false }, { status: 403 });
    const userId = decoded.userId;

    // 1. Lấy thông tin user
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT name FROM users WHERE id = ?",
      [userId]
    );
    if (users.length === 0) return NextResponse.json({ success: false }, { status: 404 });
    const user = users[0];

    // 2. Lấy số lớp phụ trách
    const [classes] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(class_id) as classCount FROM class_teachers WHERE user_id = ?",
      [userId]
    );
    const classCount = classes[0].classCount;

    // 3. Lấy tổng số học sinh
    const [students] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT cm.user_id) as studentCount 
       FROM class_members cm 
       JOIN class_teachers ct ON cm.class_id = ct.class_id 
       WHERE ct.user_id = ?`,
      [userId]
    );
    const studentCount = students[0].studentCount;

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        classCount,
        studentCount
      }
    });

  } catch (error) {
    console.error("[Teacher Dashboard API Error]:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

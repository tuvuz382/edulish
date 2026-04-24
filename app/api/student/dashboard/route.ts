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
    const userId = decoded.userId;

    // 1. Lấy thông tin user cơ bản và streak
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT name, streak, DATE_FORMAT(last_active_date, '%Y-%m-%d') as last_active FROM users WHERE id = ?",
      [userId]
    );
    if (users.length === 0) return NextResponse.json({ success: false }, { status: 404 });
    const user = users[0];

    const today = new Date().toISOString().split('T')[0];
    const hasAnsweredToday = user.last_active === today;

    // 2. Lấy thông tin lớp học (nếu có)
    const [classes] = await pool.query<RowDataPacket[]>(
      `SELECT c.name as class_name 
       FROM classes c 
       JOIN class_members cm ON c.id = cm.class_id 
       WHERE cm.user_id = ? LIMIT 1`,
      [userId]
    );
    const className = classes.length > 0 ? classes[0].class_name : "Chưa có lớp";

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        streak: user.streak,
        hasAnsweredToday,
        className
      }
    });

  } catch (error) {
    console.error("[Dashboard API Error]:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";

interface JwtPayload {
  userId: number;
  role: string;
}

// Định nghĩa interface cho kết quả truy vấn từ MySQL
interface UserDashboardRow extends RowDataPacket {
  name: string;
  streak: number;
  last_active: string | null;
}

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("edulish_token")?.value;
    if (!token) {
      console.warn("[Dashboard API] No token found in cookies");
      return NextResponse.json({ success: false, message: "Bạn chưa đăng nhập." }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("[Dashboard API] JWT_SECRET is missing");
      return NextResponse.json({ success: false, message: "Lỗi cấu hình server." }, { status: 500 });
    }

    let userId;
    try {
      const decoded = jwt.verify(token, secret) as JwtPayload;
      userId = decoded.userId;
    } catch (jwtErr: any) {
      console.error("[Dashboard API] JWT Error:", jwtErr.message);
      return NextResponse.json({ success: false, message: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại." }, { status: 401 });
    }

    // 1. Lấy thông tin user
    const [users] = await pool.query<UserDashboardRow[]>(
      "SELECT name, streak, DATE_FORMAT(last_active_date, '%Y-%m-%d') as last_active FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return NextResponse.json({ success: false, message: "Người dùng không tồn tại hoặc đã bị xóa." }, { status: 404 });
    }
    
    const user = users[0];
    const today = new Date().toISOString().split('T')[0];
    const hasAnsweredToday = user.last_active === today;

    // 2. Lấy thông tin lớp học
    const [classes] = await pool.query<RowDataPacket[]>(
      `SELECT c.name as class_name 
       FROM classes c 
       JOIN class_members cm ON c.id = cm.class_id 
       WHERE cm.user_id = ? LIMIT 1`,
      [userId]
    );
    const className = (classes as any[]).length > 0 ? (classes as any[])[0].class_name : "Chưa vào lớp";

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        streak: user.streak,
        hasAnsweredToday,
        className
      }
    });

  } catch (error: any) {
    console.error("[Dashboard API Error]:", error);
    return NextResponse.json({ success: false, message: "Lỗi kết nối Database: " + error.message }, { status: 500 });
  }
}

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
    const { userId } = decoded;

    // Lấy tất cả liên hệ: 
    // - Những người trong cùng lớp (cả giáo viên và học sinh)
    // - Những người đã từng nhắn tin (gửi hoặc nhận)
    // - Kèm theo số tin nhắn chưa đọc và thời gian tin nhắn mới nhất để hiển thị
    
    const sql = `
      SELECT 
        u.id, u.name, u.email, u.role,
        (SELECT COUNT(*) FROM messages m WHERE m.sender_id = u.id AND m.receiver_id = ? AND m.is_read = 0) as unread_count,
        (SELECT MAX(created_at) FROM messages m WHERE (m.sender_id = u.id AND m.receiver_id = ?) OR (m.receiver_id = u.id AND m.sender_id = ?)) as last_message_time
      FROM users u
      WHERE u.id IN (
        SELECT cm.user_id FROM class_members cm WHERE cm.class_id IN (SELECT class_id FROM class_members WHERE user_id = ?)
        UNION
        SELECT ct.user_id FROM class_teachers ct WHERE ct.class_id IN (SELECT class_id FROM class_members WHERE user_id = ?)
        UNION
        SELECT cm.user_id FROM class_members cm WHERE cm.class_id IN (SELECT class_id FROM class_teachers WHERE user_id = ?)
        UNION
        SELECT ct.user_id FROM class_teachers ct WHERE ct.class_id IN (SELECT class_id FROM class_teachers WHERE user_id = ?)
        UNION
        SELECT sender_id FROM messages WHERE receiver_id = ?
        UNION
        SELECT receiver_id FROM messages WHERE sender_id = ?
      ) AND u.id != ?
      ORDER BY unread_count DESC, last_message_time DESC, u.name ASC
    `;

    // params = [userId x 10]
    const params = Array(10).fill(userId);

    const [contacts] = await pool.query<RowDataPacket[]>(sql, params);

    return NextResponse.json({ success: true, contacts });
  } catch (error) {
    console.error("[API Contacts GET] Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface JwtPayload {
  userId: number;
  role: string;
}

// Helper lấy userId từ token
async function getUserIdFromRequest(req: NextRequest) {
  const token = req.cookies.get("edulish_token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    return decoded.userId;
  } catch {
    return null;
  }
}

// ── GET: Lấy lịch sử tin nhắn giữa 2 người ──
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });

    const withUserId = req.nextUrl.searchParams.get("withUserId");
    if (!withUserId) return NextResponse.json({ success: false, message: "Thiếu withUserId" }, { status: 400 });

    const [messages] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM messages 
       WHERE (sender_id = ? AND receiver_id = ?) 
          OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at ASC`,
      [userId, withUserId, withUserId, userId]
    );

    // Đánh dấu đã đọc khi lấy tin nhắn
    await pool.query("UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ?", [withUserId, userId]);

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error("[API Messages GET] Error:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ" }, { status: 500 });
  }
}

// ── POST: Gửi tin nhắn mới ──
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });

    const { receiver_id, content } = await req.json();

    if (!receiver_id || !content) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin người nhận hoặc nội dung" }, { status: 400 });
    }

    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)",
      [userId, receiver_id, content]
    );

    return NextResponse.json({
      success: true,
      message: "Đã gửi tin nhắn",
      messageId: result.insertId
    });
  } catch (error) {
    console.error("[API Messages POST] Error:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ" }, { status: 500 });
  }
}

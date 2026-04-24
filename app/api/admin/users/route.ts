import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcrypt";

// GET /api/admin/users
export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC"
    );
    return NextResponse.json({ success: true, users: rows });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ success: false, error: "Lỗi khi lấy danh sách người dùng" }, { status: 500 });
  }
}

// POST /api/admin/users
export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, error: "Vui lòng điền đủ thông tin" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role]
    );

    return NextResponse.json({ success: true, message: "Thêm người dùng thành công", id: (result as any).insertId });
  } catch (error: any) {
    console.error("Error creating user:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ success: false, error: "Email đã tồn tại" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Lỗi khi thêm người dùng" }, { status: 500 });
  }
}

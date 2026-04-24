import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/admin/materials
export async function GET() {
  try {
    const [rows] = await pool.query("SELECT * FROM materials ORDER BY created_at DESC");
    return NextResponse.json({ success: true, materials: rows });
  } catch (error) {
    console.error("Error fetching materials:", error);
    return NextResponse.json({ success: false, error: "Lỗi khi lấy danh sách tài liệu" }, { status: 500 });
  }
}

// POST /api/admin/materials
export async function POST(req: Request) {
  try {
    const { name, description, url, type, level } = await req.json();

    if (!name || !url || !type || !level) {
      return NextResponse.json({ success: false, error: "Vui lòng điền đủ thông tin bắt buộc" }, { status: 400 });
    }

    const [result] = await pool.query(
      "INSERT INTO materials (name, description, url, type, level) VALUES (?, ?, ?, ?, ?)",
      [name, description, url, type, level]
    );

    return NextResponse.json({ success: true, message: "Thêm tài liệu thành công", id: (result as any).insertId });
  } catch (error) {
    console.error("Error creating material:", error);
    return NextResponse.json({ success: false, error: "Lỗi khi thêm tài liệu" }, { status: 500 });
  }
}

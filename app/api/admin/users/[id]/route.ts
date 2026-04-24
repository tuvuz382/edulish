import { NextResponse } from "next/server";
import pool from "@/lib/db";

// PUT /api/admin/users/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, email, role, is_active } = await req.json();

    await pool.query(
      "UPDATE users SET name = ?, email = ?, role = ?, is_active = ? WHERE id = ?",
      [name, email, role, is_active, id]
    );

    return NextResponse.json({ success: true, message: "Cập nhật thành công" });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ success: false, error: "Lỗi khi cập nhật người dùng" }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await pool.query("DELETE FROM users WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "Xóa người dùng thành công" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ success: false, error: "Lỗi khi xóa người dùng" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import pool from "@/lib/db";

// PUT /api/admin/materials/[id]
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { name, description, url, type, level } = await req.json();

    await pool.query(
      "UPDATE materials SET name = ?, description = ?, url = ?, type = ?, level = ? WHERE id = ?",
      [name, description, url, type, level, params.id]
    );

    return NextResponse.json({ success: true, message: "Cập nhật tài liệu thành công" });
  } catch (error) {
    console.error("Error updating material:", error);
    return NextResponse.json({ success: false, error: "Lỗi khi cập nhật tài liệu" }, { status: 500 });
  }
}

// DELETE /api/admin/materials/[id]
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await pool.query("DELETE FROM materials WHERE id = ?", [params.id]);
    return NextResponse.json({ success: true, message: "Xóa tài liệu thành công" });
  } catch (error) {
    console.error("Error deleting material:", error);
    return NextResponse.json({ success: false, error: "Lỗi khi xóa tài liệu" }, { status: 500 });
  }
}

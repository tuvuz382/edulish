import { NextResponse } from "next/server";
import pool from "@/lib/db";

// PUT /api/admin/classes/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, level, room, teacher_id } = await req.json();

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        "UPDATE classes SET name = ?, level = ?, room = ? WHERE id = ?",
        [name, level, room, id]
      );

      // Cập nhật giáo viên: Xóa giáo viên cũ và thêm giáo viên mới (chỉ 1 giáo viên phụ trách)
      await connection.query("DELETE FROM class_teachers WHERE class_id = ?", [id]);
      if (teacher_id) {
        await connection.query(
          "INSERT INTO class_teachers (class_id, user_id) VALUES (?, ?)",
          [id, teacher_id]
        );
      }

      await connection.commit();
      return NextResponse.json({ success: true, message: "Cập nhật thành công" });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error updating class:", error);
    return NextResponse.json({ success: false, error: "Lỗi khi cập nhật lớp học" }, { status: 500 });
  }
}

// DELETE /api/admin/classes/[id]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await pool.query("DELETE FROM classes WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "Xóa lớp học thành công" });
  } catch (error) {
    console.error("Error deleting class:", error);
    return NextResponse.json({ success: false, error: "Lỗi khi xóa lớp học" }, { status: 500 });
  }
}

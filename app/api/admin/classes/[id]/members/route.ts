import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/admin/classes/[id]/members
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: classId } = await params;
    // Get students
    const [students] = await pool.query(`
      SELECT u.id, u.name, u.email, u.role
      FROM users u
      JOIN class_members cm ON u.id = cm.user_id
      WHERE cm.class_id = ?
    `, [classId]);

    // Get teachers
    const [teachers] = await pool.query(`
      SELECT u.id, u.name, u.email, u.role
      FROM users u
      JOIN class_teachers ct ON u.id = ct.user_id
      WHERE ct.class_id = ?
    `, [classId]);

    return NextResponse.json({ success: true, members: [...(students as any[]), ...(teachers as any[])] });
  } catch (error) {
    console.error("Error fetching class members:", error);
    return NextResponse.json({ success: false, error: "Lỗi khi lấy danh sách thành viên" }, { status: 500 });
  }
}

// POST /api/admin/classes/[id]/members
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: classId } = await params;
    const { user_id, role } = await req.json();

    if (!user_id || !role) {
      return NextResponse.json({ success: false, error: "Thiếu user_id hoặc role" }, { status: 400 });
    }

    if (role === 'teacher') {
      await pool.query("INSERT IGNORE INTO class_teachers (class_id, user_id) VALUES (?, ?)", [classId, user_id]);
    } else {
      await pool.query("INSERT IGNORE INTO class_members (class_id, user_id) VALUES (?, ?)", [classId, user_id]);
    }

    return NextResponse.json({ success: true, message: "Thêm thành viên thành công" });
  } catch (error) {
    console.error("Error adding member:", error);
    return NextResponse.json({ success: false, error: "Lỗi khi thêm thành viên" }, { status: 500 });
  }
}

// DELETE /api/admin/classes/[id]/members
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: classId } = await params;
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");
    const role = searchParams.get("role");

    if (!user_id || !role) {
      return NextResponse.json({ success: false, error: "Thiếu user_id hoặc role" }, { status: 400 });
    }

    if (role === 'teacher') {
      await pool.query("DELETE FROM class_teachers WHERE class_id = ? AND user_id = ?", [classId, user_id]);
    } else {
      await pool.query("DELETE FROM class_members WHERE class_id = ? AND user_id = ?", [classId, user_id]);
    }

    return NextResponse.json({ success: true, message: "Xóa thành viên thành công" });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json({ success: false, error: "Lỗi khi xóa thành viên" }, { status: 500 });
  }
}

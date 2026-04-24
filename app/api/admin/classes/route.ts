import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/admin/classes
export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM class_members WHERE class_id = c.id) as student_count,
        u.name as teacher_name 
      FROM classes c
      LEFT JOIN class_teachers ct ON c.id = ct.class_id
      LEFT JOIN users u ON ct.user_id = u.id
      ORDER BY c.created_at DESC
    `);
    return NextResponse.json({ success: true, classes: rows });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json({ success: false, error: "Lỗi khi lấy danh sách lớp học" }, { status: 500 });
  }
}

// POST /api/admin/classes
export async function POST(req: Request) {
  try {
    const { name, level, room, teacher_id } = await req.json();

    if (!name || !level || !room) {
      return NextResponse.json({ success: false, error: "Vui lòng điền đủ thông tin" }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        "INSERT INTO classes (name, level, room) VALUES (?, ?, ?)",
        [name, level, room]
      );
      const classId = (result as any).insertId;

      if (teacher_id) {
        await connection.query(
          "INSERT INTO class_teachers (class_id, user_id) VALUES (?, ?)",
          [classId, teacher_id]
        );
      }

      await connection.commit();
      return NextResponse.json({ success: true, message: "Thêm lớp học thành công", id: classId });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json({ success: false, error: "Lỗi khi thêm lớp học" }, { status: 500 });
  }
}

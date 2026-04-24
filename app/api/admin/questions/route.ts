import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// ── Kiểu dữ liệu ──
interface QuestionRow extends RowDataPacket {
  id: number;
  content: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_ans: "A" | "B" | "C" | "D";
  category: string;
  difficulty: string;
  explanation: string | null;
  created_by: number | null;
  created_at: string;
  creator_name: string | null;
}

// ════════════════════════════════════════
// GET /api/admin/questions
// Lấy danh sách câu hỏi, lọc theo category và difficulty
// ════════════════════════════════════════
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const category   = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const search     = searchParams.get("search");

    let sql = `
      SELECT q.*, u.name AS creator_name
      FROM questions q
      LEFT JOIN users u ON u.id = q.created_by
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    // Lọc theo phân loại
    if (category && category !== "all") {
      sql += " AND q.category = ?";
      params.push(category);
    }

    // Lọc theo độ khó
    if (difficulty && difficulty !== "all") {
      sql += " AND q.difficulty = ?";
      params.push(difficulty);
    }

    // Tìm kiếm trong nội dung câu hỏi
    if (search && search.trim()) {
      sql += " AND q.content LIKE ?";
      params.push(`%${search.trim()}%`);
    }

    sql += " ORDER BY q.created_at DESC";

    const [questions] = await pool.query<QuestionRow[]>(sql, params);

    return NextResponse.json({ success: true, questions });
  } catch (error) {
    console.error("[Admin/Questions GET] Lỗi lấy danh sách câu hỏi:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}

// ════════════════════════════════════════
// POST /api/admin/questions
// Tạo câu hỏi mới
// Body: { content, option_a, option_b, option_c, option_d, correct_ans, category, difficulty, explanation? }
// ════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      content, option_a, option_b, option_c, option_d,
      correct_ans, category, difficulty, explanation,
    } = body as {
      content: string;
      option_a: string; option_b: string; option_c: string; option_d: string;
      correct_ans: "A" | "B" | "C" | "D";
      category: string;
      difficulty: string;
      explanation?: string;
    };

    // Validate bắt buộc
    if (!content || !option_a || !option_b || !option_c || !option_d || !correct_ans || !category || !difficulty) {
      return NextResponse.json(
        { success: false, message: "Vui lòng điền đầy đủ nội dung câu hỏi và các đáp án." },
        { status: 400 }
      );
    }

    // Kiểm tra đáp án đúng hợp lệ
    if (!["A", "B", "C", "D"].includes(correct_ans)) {
      return NextResponse.json(
        { success: false, message: "Đáp án đúng phải là A, B, C hoặc D." },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO questions
        (content, option_a, option_b, option_c, option_d, correct_ans, category, difficulty, explanation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        content.trim(), option_a.trim(), option_b.trim(), option_c.trim(), option_d.trim(),
        correct_ans, category, difficulty, explanation?.trim() ?? null,
      ]
    );

    return NextResponse.json(
      { success: true, message: "Thêm câu hỏi thành công.", questionId: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Admin/Questions POST] Lỗi tạo câu hỏi:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}

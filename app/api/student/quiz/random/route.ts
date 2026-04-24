import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

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
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const category = searchParams.get("category");

    let sql = "SELECT * FROM questions";
    const params: (string | number)[] = [];

    if (category && category !== "all") {
      sql += " WHERE category = ?";
      params.push(category);
    }

    // Lấy ngẫu nhiên
    sql += " ORDER BY RAND() LIMIT ?";
    params.push(limit);

    const [questions] = await pool.query<QuestionRow[]>(sql, params);

    // Chuyển đổi định dạng để trả về cho frontend (giống với cấu trúc SAMPLE_QUESTIONS)
    const formattedQuestions = questions.map((q) => ({
      id: q.id,
      question: q.content,
      options: [q.option_a, q.option_b, q.option_c, q.option_d],
      // Index 0=A, 1=B, 2=C, 3=D
      correct: q.correct_ans === "A" ? 0 : q.correct_ans === "B" ? 1 : q.correct_ans === "C" ? 2 : 3,
      category: q.category,
      difficulty: q.difficulty,
    }));

    return NextResponse.json({ success: true, questions: formattedQuestions });
  } catch (error) {
    console.error("[Student/RandomQuiz GET] Lỗi lấy câu hỏi ngẫu nhiên:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}

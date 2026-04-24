import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface JwtPayload {
  userId: number;
  role: string;
}

// Hàm hỗ trợ lấy ID người dùng từ JWT Token
async function getUserId(req: NextRequest): Promise<number | null> {
  const token = req.cookies.get("edulish_token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    return decoded.userId;
  } catch {
    return null;
  }
}

// ════════════════════════════════════════
// GET: Lấy Câu hỏi Hàng ngày & Thông tin Streak
// ════════════════════════════════════════
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    // 1. Lấy thông tin user (streak, last_active_date)
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT streak, DATE_FORMAT(last_active_date, '%Y-%m-%d') as last_active FROM users WHERE id = ?",
      [userId]
    );
    if (users.length === 0) return NextResponse.json({ success: false }, { status: 404 });
    const user = users[0];

    // Kiểm tra xem hôm nay đã trả lời chưa
    const today = new Date().toISOString().split('T')[0];
    const hasAnsweredToday = user.last_active === today;

    // 2. Lấy câu hỏi ngẫu nhiên cho hôm nay.
    // Dùng DAYOFYEAR + userId làm seed cho hàm RAND() để luôn ra 1 câu giống nhau trong ngày cho user đó.
    const [questions] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM questions ORDER BY RAND(DAYOFYEAR(CURRENT_DATE()) + ?) LIMIT 1",
      [userId]
    );

    if (questions.length === 0) {
      return NextResponse.json({ success: false, message: "Ngân hàng câu hỏi trống." });
    }

    const q = questions[0];
    const formattedQuestion = {
      id: q.id,
      question: q.content,
      options: [
        { id: "A", text: q.option_a },
        { id: "B", text: q.option_b },
        { id: "C", text: q.option_c },
        { id: "D", text: q.option_d },
      ],
      correct: q.correct_ans
    };

    return NextResponse.json({
      success: true,
      question: formattedQuestion,
      hasAnsweredToday,
      streak: user.streak
    });

  } catch (error) {
    console.error("[DailyQuestion GET] Error:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ" }, { status: 500 });
  }
}

// ════════════════════════════════════════
// POST: Nộp câu trả lời & Tính toán Streak
// Logic Streak & Freeze được xử lý rất cẩn thận tại đây.
// ════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    // 1. Lấy thông tin hiện tại của User
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT streak, last_active_date FROM users WHERE id = ?",
      [userId]
    );
    if (users.length === 0) return NextResponse.json({ success: false }, { status: 404 });
    
    let { streak, last_active_date } = users[0];
    
    // Nếu chưa từng học (null), gán mốc quá khứ rất xa để dễ tính toán
    const lastDate = last_active_date ? new Date(last_active_date) : new Date(0);
    const todayDate = new Date();
    
    // Chuẩn hoá về giờ 00:00:00 để so sánh số ngày chênh lệch chính xác
    lastDate.setHours(0, 0, 0, 0);
    todayDate.setHours(0, 0, 0, 0);
    
    // Tính khoảng cách giữa ngày hôm nay và ngày học cuối cùng (tính theo millisecond)
    const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // -- LOGIC TÍNH STREAK VÀ FREEZE (QUAN TRỌNG) --
    
    // Trường hợp 1: Đã làm bài hôm nay rồi -> Không cộng thêm streak nữa
    if (diffDays === 0 && last_active_date !== null) {
      return NextResponse.json({
        success: true,
        message: "Đã ghi nhận, nhưng streak hôm nay đã được cộng từ trước.",
        streak
      });
    }

    // Trường hợp 2: Học đều đặn (Khoảng cách đúng 1 ngày) HOẶC là ngày học đầu tiên
    if (diffDays === 1 || last_active_date === null) {
      streak += 1;
    }
    
    // Trường hợp 3: Bỏ lỡ ĐÚNG 1 NGÀY (Khoảng cách là 2 ngày)
    else if (diffDays === 2) {
      // Mất chuỗi, bắt đầu lại từ 1
      streak = 1;
    }
    
    // Trường hợp 4: Bỏ lỡ QUÁ NHIỀU NGÀY (> 2 ngày)
    else if (diffDays > 2) {
      // Bắt đầu lại từ 1
      streak = 1;
    }

    // 2. Cập nhật vào Cơ sở dữ liệu
    // Cập nhật lại streak và gán last_active_date = CURDATE()
    await pool.query(
      `UPDATE users 
       SET streak = ?, last_active_date = CURRENT_DATE() 
       WHERE id = ?`,
      [streak, userId]
    );

    return NextResponse.json({
      success: true,
      message: "Cập nhật streak thành công!",
      streak
    });

  } catch (error) {
    console.error("[DailyQuestion POST] Error:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ" }, { status: 500 });
  }
}

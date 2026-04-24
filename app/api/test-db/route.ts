import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/test-db
// API chỉ dùng để kiểm tra kết nối MySQL có hoạt động không.
export async function GET() {
  try {
    // Lấy một kết nối từ pool và thực hiện truy vấn đơn giản
    const [rows] = await pool.query("SELECT 1 + 1 AS result");

    // Nếu tới đây là kết nối thành công!
    return NextResponse.json({
      success: true,
      message: "Kết nối MySQL thành công! 🎉",
      data: rows,
    });
  } catch (error: unknown) {
    // In lỗi ra console để dễ debug
    console.error("Lỗi kết nối MySQL:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Lỗi không xác định";

    return NextResponse.json(
      {
        success: false,
        message: "Kết nối MySQL thất bại. Kiểm tra lại XAMPP và file .env.local.",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

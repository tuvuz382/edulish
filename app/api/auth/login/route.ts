import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// Kiểu dữ liệu trả về từ MySQL query
interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "student" | "teacher" | "admin";
  is_active: number;
}

export async function POST(req: NextRequest) {
  try {
    // ── 1. Lấy body từ request ──
    const body = await req.json();
    const { email, password } = body as { email: string; password: string };

    // ── 2. Validate input cơ bản ──
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập email và mật khẩu." },
        { status: 400 }
      );
    }

    // ── 3. Tìm user trong database ──
    const [rows] = await pool.query<UserRow[]>(
      "SELECT id, name, email, password, role, is_active FROM users WHERE email = ? LIMIT 1",
      [email.trim().toLowerCase()]
    );

    // Không tìm thấy user → báo lỗi chung (tránh lộ thông tin)
    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Email hoặc mật khẩu không đúng." },
        { status: 401 }
      );
    }

    const user = rows[0];

    // ── 4. Kiểm tra tài khoản có bị khóa không ──
    if (user.is_active === 0) {
      return NextResponse.json(
        { success: false, message: "Tài khoản đã bị khóa. Liên hệ quản trị viên." },
        { status: 403 }
      );
    }

    // ── 5. So sánh mật khẩu bằng bcrypt ──
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Email hoặc mật khẩu không đúng." },
        { status: 401 }
      );
    }

    // ── 6. Tạo JWT token ──
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("[Auth] JWT_SECRET chưa được cấu hình trong .env.local");
      return NextResponse.json(
        { success: false, message: "Lỗi cấu hình hệ thống." },
        { status: 500 }
      );
    }

    const payload = {
      userId: user.id,
      name:   user.name,
      email:  user.email,
      role:   user.role,
    };

    // Token hết hạn sau 7 ngày
    const token = jwt.sign(payload, secret, { expiresIn: "7d" });

    // ── 7. Trả về response thành công + set cookie ──
    const response = NextResponse.json({
      success: true,
      message: "Đăng nhập thành công!",
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });

    // Lưu token vào HttpOnly cookie (an toàn hơn localStorage)
    response.cookies.set("edulish_token", token, {
      httpOnly: true,       // JavaScript không đọc được (chống XSS)
      secure:   false,      // Đổi thành true khi deploy HTTPS
      sameSite: "lax",
      maxAge:   60 * 60 * 24 * 7, // 7 ngày (giây)
      path:     "/",
    });

    return response;
  } catch (error) {
    // Bắt mọi lỗi không mong đợi
    console.error("[Auth] Lỗi đăng nhập:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: number;
  name:   string;
  email:  string;
  role:   string;
}

// API trả về thông tin user hiện tại từ JWT cookie
// Dùng để kiểm tra "đã đăng nhập chưa" và lấy thông tin user
export async function GET(req: NextRequest) {
  try {
    const token  = req.cookies.get("edulish_token")?.value;
    const secret = process.env.JWT_SECRET;

    // Chưa đăng nhập (không có token)
    if (!token) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    if (!secret) {
      return NextResponse.json({ success: false, user: null }, { status: 500 });
    }

    // Xác minh và giải mã token
    const decoded = jwt.verify(token, secret) as JwtPayload;

    return NextResponse.json({
      success: true,
      user: {
        id:    decoded.userId,
        name:  decoded.name,
        email: decoded.email,
        role:  decoded.role,
      },
    });
  } catch {
    // Token hết hạn hoặc không hợp lệ
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }
}

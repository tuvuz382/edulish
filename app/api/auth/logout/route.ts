import { NextResponse } from "next/server";

export async function POST() {
  // Xóa cookie token → đăng xuất
  const response = NextResponse.json({ success: true, message: "Đã đăng xuất." });

  response.cookies.set("edulish_token", "", {
    httpOnly: true,
    secure:   false,
    sameSite: "lax",
    maxAge:   0, // Hết hạn ngay lập tức
    path:     "/",
  });

  return response;
}

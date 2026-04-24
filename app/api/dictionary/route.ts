import { NextRequest, NextResponse } from "next/server";

// ── API proxy cho Free Dictionary API ──
// Gọi từ frontend để tránh lỗi CORS và giữ API key (nếu có) phía server

export async function GET(req: NextRequest) {
  try {
    // Lấy từ cần tra từ query string: /api/dictionary?word=hello
    const word = req.nextUrl.searchParams.get("word")?.trim();

    if (!word) {
      return NextResponse.json(
        { success: false, message: "Thiếu tham số 'word'." },
        { status: 400 }
      );
    }

    // Gọi Free Dictionary API (miễn phí, không cần API key)
    const dictRes = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      { next: { revalidate: 3600 } } // Cache 1 giờ để tiết kiệm request
    );

    // Nếu không tìm thấy từ (API trả 404)
    if (!dictRes.ok) {
      return NextResponse.json(
        { success: false, message: `Không tìm thấy từ "${word}" trong từ điển.` },
        { status: 404 }
      );
    }

    const data = await dictRes.json();

    // Chỉ trả về entry đầu tiên (phổ biến nhất)
    return NextResponse.json({ success: true, entry: data[0] });
  } catch (error) {
    console.error("[Dictionary] Lỗi khi tra từ điển:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}

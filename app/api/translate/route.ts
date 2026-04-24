import { NextRequest, NextResponse } from "next/server";

// ── API proxy cho MyMemory Translation API ──
// Dịch từ tiếng Anh sang tiếng Việt (en|vi)
// Docs: https://mymemory.translated.net/doc/spec.php

export async function GET(req: NextRequest) {
  try {
    // Lấy từ/câu cần dịch: /api/translate?q=hello&from=en&to=vi
    const q    = req.nextUrl.searchParams.get("q")?.trim();
    const from = req.nextUrl.searchParams.get("from") ?? "en";
    const to   = req.nextUrl.searchParams.get("to")   ?? "vi";

    if (!q) {
      return NextResponse.json(
        { success: false, message: "Thiếu tham số 'q' (văn bản cần dịch)." },
        { status: 400 }
      );
    }

    // Giới hạn độ dài để tránh lạm dụng API (MyMemory giới hạn ~500 ký tự/request miễn phí)
    if (q.length > 500) {
      return NextResponse.json(
        { success: false, message: "Văn bản quá dài (tối đa 500 ký tự)." },
        { status: 400 }
      );
    }

    // Xây dựng URL cho MyMemory API
    const url = new URL("https://api.mymemory.translated.net/get");
    url.searchParams.set("q",        q);
    url.searchParams.set("langpair", `${from}|${to}`);

    // Nếu có email cấu hình thì thêm vào để tăng giới hạn (1000 req/ngày → 10000 req/ngày)
    const email = process.env.MYMEMORY_EMAIL;
    if (email) url.searchParams.set("de", email);

    const translateRes = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // Cache 1 giờ
    });

    if (!translateRes.ok) {
      return NextResponse.json(
        { success: false, message: "Không thể kết nối đến dịch vụ dịch thuật." },
        { status: 502 }
      );
    }

    const data = await translateRes.json();

    // MyMemory trả về responseStatus 200 khi thành công
    if (data.responseStatus !== 200) {
      return NextResponse.json(
        { success: false, message: data.responseMessage ?? "Lỗi từ dịch vụ dịch thuật." },
        { status: 400 }
      );
    }

    const translated = data.responseData?.translatedText as string | undefined;

    return NextResponse.json({
      success:    true,
      original:   q,
      translated: translated ?? "",
      from,
      to,
    });
  } catch (error) {
    console.error("[Translate] Lỗi khi dịch:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}

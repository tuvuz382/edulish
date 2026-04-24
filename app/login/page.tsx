"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Đường dẫn dashboard theo từng role
const REDIRECT: Record<string, string> = {
  student: "/student/dashboard",
  teacher: "/teacher/dashboard",
  admin:   "/admin/dashboard",
};

export default function LoginPage() {
  const router = useRouter();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // ── Gọi API đăng nhập thật ──
      const res = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Hiển thị lỗi từ server (sai mật khẩu, bị khóa, v.v.)
        setError(data.message ?? "Đăng nhập thất bại. Thử lại nhé!");
        return;
      }

      // ── Đăng nhập thành công → redirect theo role ──
      const role = data.user?.role as string;
      const path = REDIRECT[role] ?? "/login";
      router.push(path);
      router.refresh(); // Làm mới server context để layout đọc được cookie

    } catch (err) {
      // Lỗi mạng hoặc server không phản hồi
      console.error("[Login] Lỗi:", err);
      setError("Không thể kết nối đến máy chủ. Kiểm tra lại kết nối mạng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600">
      {/* Decorative blobs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md space-y-6 animate-fade-in-up">
        {/* ── Brand ── */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg mb-4 text-4xl select-none">
            🦉
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Edulish</h1>
          <p className="text-blue-200 mt-1 text-sm">Học tiếng Anh thông minh mỗi ngày</p>
        </div>

        {/* ── Card ── */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Đăng nhập</h2>

          {/* Thông báo lỗi */}
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 animate-fade-in">
              <span className="flex-shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@edulish.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder:text-slate-300 text-sm transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder:text-slate-300 text-sm transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl transition-all duration-200 shadow-md disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  Đang đăng nhập…
                </span>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-5">
            Quên mật khẩu?{" "}
            <a href="#" className="text-blue-600 font-medium hover:underline">
              Liên hệ quản trị viên
            </a>
          </p>

          {/* Gợi ý tài khoản demo */}
          <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-1.5">
            <p className="text-xs font-semibold text-slate-600 mb-2">🔑 Tài khoản demo (mật khẩu: <code className="bg-slate-200 px-1 rounded">Password@123</code>)</p>
            {[
              { role: "Admin",      email: "admin@edulish.com",               icon: "⚙️" },
              { role: "Giáo viên", email: "lan.tran@edulish.com",            icon: "👩‍🏫" },
              { role: "Học sinh",   email: "an.nguyen@student.edulish.com",   icon: "🎓" },
            ].map((a) => (
              <button
                key={a.email}
                type="button"
                onClick={() => { setEmail(a.email); setPassword("Password@123"); setError(null); }}
                className="w-full flex items-center gap-2 text-left rounded-lg px-3 py-2 text-xs text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <span>{a.icon}</span>
                <span className="font-medium w-20 flex-shrink-0">{a.role}:</span>
                <span className="text-slate-400 truncate">{a.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Support button ── */}
      <button className="fixed bottom-5 right-5 flex items-center gap-2 bg-white text-blue-600 px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 font-semibold text-sm z-50">
        <span>💬</span> Hỗ trợ
      </button>
    </div>
  );
}

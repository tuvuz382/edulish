"use client";

import { useState } from "react";

export default function StudentProfilePage() {
  const [tab, setTab]           = useState<"info" | "password">("info");
  const [saved, setSaved]       = useState(false);
  const [pwSaved, setPwSaved]   = useState(false);

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleChangePw = (e: React.FormEvent) => {
    e.preventDefault();
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 2500);
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h2 className="text-2xl font-bold text-slate-800">Hồ sơ cá nhân 👤</h2>
        <p className="mt-1 text-slate-500">Quản lý thông tin tài khoản của bạn</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-fade-in-up delay-75">
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-4xl font-bold text-white shadow-md">
          🎓
        </div>
        <div>
          <p className="text-lg font-bold text-slate-800">Người dùng</p>
          <p className="text-sm text-slate-500">Học sinh</p>
          <button className="mt-2 text-xs font-medium text-blue-600 hover:underline">
            Thay đổi ảnh đại diện
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 animate-fade-in-up delay-150">
        {(["info", "password"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
              tab === t
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t === "info" ? "Thông tin cá nhân" : "Đổi mật khẩu"}
          </button>
        ))}
      </div>

      {/* Info form */}
      {tab === "info" && (
        <form
          onSubmit={handleSaveInfo}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 animate-fade-in-up"
        >
          {[
            { label: "Họ và tên",      id: "name",  type: "text",  ph: "Nguyễn Văn A" },
            { label: "Email",          id: "email", type: "email", ph: "example@edulish.com" },
            { label: "Số điện thoại", id: "phone", type: "tel",   ph: "0901234567" },
            { label: "Ngày sinh",      id: "dob",   type: "date",  ph: "" },
          ].map((f) => (
            <div key={f.id}>
              <label htmlFor={f.id} className="mb-1.5 block text-sm font-medium text-slate-700">{f.label}</label>
              <input
                id={f.id} type={f.type} placeholder={f.ph}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-700"
              />
            </div>
          ))}
          <div className="flex items-center gap-4 pt-2">
            <button type="submit" className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-700 active:scale-95">
              Lưu thay đổi
            </button>
            {saved && <span className="text-sm text-emerald-600 font-medium animate-fade-in">✅ Đã lưu!</span>}
          </div>
        </form>
      )}

      {/* Password form */}
      {tab === "password" && (
        <form
          onSubmit={handleChangePw}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 animate-fade-in-up"
        >
          {[
            { label: "Mật khẩu hiện tại", id: "cur",    ph: "••••••••" },
            { label: "Mật khẩu mới",      id: "newpw",  ph: "••••••••" },
            { label: "Xác nhận mật khẩu", id: "confirm", ph: "••••••••" },
          ].map((f) => (
            <div key={f.id}>
              <label htmlFor={f.id} className="mb-1.5 block text-sm font-medium text-slate-700">{f.label}</label>
              <input
                id={f.id} type="password" placeholder={f.ph}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-700"
              />
            </div>
          ))}
          <div className="flex items-center gap-4 pt-2">
            <button type="submit" className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-700 active:scale-95">
              Đổi mật khẩu
            </button>
            {pwSaved && <span className="text-sm text-emerald-600 font-medium animate-fade-in">✅ Đã đổi mật khẩu!</span>}
          </div>
        </form>
      )}
    </div>
  );
}

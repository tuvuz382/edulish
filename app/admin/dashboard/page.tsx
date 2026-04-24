import Link from "next/link";

const STATS = [
  { icon: "👥", label: "Tổng người dùng",    value: "—", href: "/admin/users",     bg: "bg-violet-50",  iconBg: "bg-violet-100",  text: "text-violet-600"  },
  { icon: "🏫", label: "Tổng lớp học",       value: "—", href: "/admin/classes",   bg: "bg-indigo-50",  iconBg: "bg-indigo-100",  text: "text-indigo-600"  },
  { icon: "❓", label: "Câu hỏi trong ngân hàng", value: "—", href: "/admin/questions", bg: "bg-fuchsia-50", iconBg: "bg-fuchsia-100", text: "text-fuchsia-600" },
  { icon: "📚", label: "Tài liệu học tập",   value: "—", href: "/admin/materials", bg: "bg-pink-50",    iconBg: "bg-pink-100",    text: "text-pink-600"    },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Welcome */}
      <div className="animate-fade-in-up">
        <h2 className="text-2xl font-bold text-slate-800">Tổng quan hệ thống ⚙️</h2>
        <p className="mt-1 text-slate-500">Quản lý toàn bộ nền tảng Edulish</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 animate-fade-in-up delay-75">
        {STATS.map((s) => (
          <Link key={s.label} href={s.href}>
            <div className={`${s.bg} flex flex-col gap-3 rounded-2xl p-5 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer`}>
              <div className={`${s.iconBg} flex h-10 w-10 items-center justify-center rounded-xl text-xl`}>{s.icon}</div>
              <div>
                <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">{s.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="animate-fade-in-up delay-150">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Quản lý nhanh</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/admin/users",     icon: "👤", label: "Thêm người dùng",  color: "text-violet-600 bg-violet-50 hover:bg-violet-100" },
            { href: "/admin/classes",   icon: "🏫", label: "Tạo lớp học mới",  color: "text-indigo-600 bg-indigo-50 hover:bg-indigo-100" },
            { href: "/admin/questions", icon: "➕", label: "Thêm câu hỏi",     color: "text-fuchsia-600 bg-fuchsia-50 hover:bg-fuchsia-100" },
            { href: "/admin/materials", icon: "📄", label: "Tải tài liệu lên", color: "text-pink-600 bg-pink-50 hover:bg-pink-100" },
          ].map((a) => (
            <Link key={a.href} href={a.href}>
              <div className={`flex items-center gap-3 rounded-xl ${a.color} px-4 py-3.5 transition-colors cursor-pointer`}>
                <span className="text-2xl">{a.icon}</span>
                <span className="text-sm font-semibold">{a.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-fade-in-up delay-225">
        <h3 className="mb-4 font-semibold text-slate-700">Nhật ký hoạt động gần đây</h3>
        <div className="flex flex-col items-center py-8 text-slate-400">
          <span className="mb-2 text-4xl">📋</span>
          <p className="font-medium text-slate-500">Chưa có hoạt động</p>
          <p className="mt-1 text-xs">Hoạt động quản trị sẽ được ghi lại ở đây</p>
        </div>
      </div>
    </div>
  );
}

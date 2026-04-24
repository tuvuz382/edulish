export default function TeacherClassesPage() {
  const LEVELS = ["Beginner", "Elementary", "Intermediate", "Upper-Intermediate", "Advanced"];

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="animate-fade-in-up">
        <h2 className="text-2xl font-bold text-slate-800">Lớp học của tôi 🏫</h2>
        <p className="mt-1 text-slate-500">Danh sách các lớp được phân công phụ trách</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 animate-fade-in-up delay-75">
        {["Tất cả", ...LEVELS].map((l, i) => (
          <button
            key={l}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              i === 0
                ? "bg-emerald-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Classes grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in-up delay-150">
        {/* Placeholder cards */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm opacity-40">
            <div className="mb-4 flex items-center justify-between">
              <div className="h-4 w-32 rounded-lg bg-slate-200" />
              <div className="h-6 w-20 rounded-full bg-slate-100" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-24 rounded bg-slate-100" />
              <div className="h-3 w-20 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>

      {/* Empty state notice */}
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center animate-fade-in-up delay-225">
        <span className="text-5xl">🏫</span>
        <p className="mt-3 font-semibold text-slate-600">Chưa có lớp học nào</p>
        <p className="mt-1 text-sm text-slate-400">Dữ liệu lớp học sẽ hiển thị sau khi kết nối cơ sở dữ liệu</p>
      </div>
    </div>
  );
}

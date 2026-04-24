export default function TeacherProgressPage() {
  const COLS = ["Học sinh", "Điểm tổng", "Streak", "Bài đã làm", "Tình trạng"];

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="animate-fade-in-up">
        <h2 className="text-2xl font-bold text-slate-800">Tiến độ học viên 📊</h2>
        <p className="mt-1 text-slate-500">Báo cáo thống kê chi tiết về từng học sinh trong lớp</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 animate-fade-in-up delay-75">
        <select className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100">
          <option>Chọn lớp…</option>
        </select>
        <select className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100">
          <option>Tất cả trạng thái</option>
          <option>Đang hoạt động</option>
          <option>Streak bị phá</option>
          <option>Chưa làm bài</option>
        </select>
        <input
          type="text"
          placeholder="Tìm học sinh…"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 flex-1 min-w-40"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm animate-fade-in-up delay-150">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {COLS.map((c) => (
                  <th key={c} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {c}
                  </th>
                ))}
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={COLS.length + 1} className="py-16 text-center">
                  <div className="flex flex-col items-center text-slate-400">
                    <span className="mb-2 text-5xl">📊</span>
                    <p className="font-medium text-slate-500">Chưa có dữ liệu học sinh</p>
                    <p className="mt-1 text-xs">Chọn lớp để xem báo cáo tiến độ</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

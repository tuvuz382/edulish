"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const WEEK_DATA = [45, 70, 30, 95, 60, 50, 20];
const WEEK_DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

interface DashboardData {
  name: string;
  streak: number;
  hasAnsweredToday: boolean;
  className: string;
}

export default function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/student/dashboard");
        const json = await res.json();
        if (json.success) {
          setData(json.user);
        } else {
          setError(json.message || "Không thể tải dữ liệu.");
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu dashboard:", err);
        setError("Lỗi kết nối máy chủ.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-slate-500 font-medium italic">Đang tải bảng điều khiển...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-4 text-center">
        <div className="mb-4 text-4xl">⚠️</div>
        <h3 className="text-lg font-bold text-slate-800">Ối! Đã có lỗi xảy ra</h3>
        <p className="mt-1 text-slate-500 max-w-md">{error || "Không thể tải dữ liệu. Vui lòng thử lại sau."}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-all"
        >
          Thử tải lại trang
        </button>
      </div>
    );
  }

  // Tự động sinh danh sách thống kê từ dữ liệu thật
  const STATS = [
    { icon: "🔥", label: "Streak hiện tại", value: `${data.streak} ngày`, sub: "Chuỗi học liên tiếp", bg: "bg-orange-50", iconBg: "bg-orange-100", text: "text-orange-600" },
    { icon: "🏫", label: "Lớp học",         value: data.className,        sub: "Lớp hiện tại",        bg: "bg-blue-50",   iconBg: "bg-blue-100",   text: "text-blue-600"   },
    { icon: "⭐", label: "Tổng điểm",       value: "150 XP",              sub: "Sắp tới ra mắt",      bg: "bg-amber-50",  iconBg: "bg-amber-100",  text: "text-amber-600"  },
  ];

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Welcome */}
      <div className="animate-fade-in-up">
        <h2 className="text-2xl font-bold text-slate-800">Xin chào, {data.name}! 👋</h2>
        <p className="mt-1 text-slate-500">Hãy duy trì thói quen học tập hàng ngày nhé!</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 animate-fade-in-up delay-75">
        {STATS.map((s) => (
          <div key={s.label} className={`${s.bg} flex items-center gap-4 rounded-2xl p-5 shadow-sm`}>
            <div className={`${s.iconBg} flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-2xl`}>
              {s.icon}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-slate-500 truncate">{s.label}</p>
              <p className={`text-2xl font-bold ${s.text} truncate`}>{s.value}</p>
              <p className="text-xs text-slate-400 truncate">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="animate-fade-in-up delay-150">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Hành động nhanh</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link href="/student/daily-question">
            <div className={`group cursor-pointer rounded-2xl p-6 text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${data.hasAnsweredToday ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
              <div className="mb-3 flex items-center justify-between">
                <div className="text-3xl">📅</div>
                {data.hasAnsweredToday && <div className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">Hoàn thành ✓</div>}
              </div>
              <p className="text-lg font-bold">Câu hỏi hôm nay</p>
              <p className={`mt-1 text-sm ${data.hasAnsweredToday ? 'text-emerald-200' : 'text-blue-200'}`}>
                {data.hasAnsweredToday ? "Đã cộng streak · Xem lại" : "Chưa hoàn thành · Thực hiện ngay!"}
              </p>
              <div className={`mt-4 flex items-center gap-1 text-sm transition-all group-hover:gap-2 ${data.hasAnsweredToday ? 'text-emerald-200' : 'text-blue-200'}`}>
                <span>{data.hasAnsweredToday ? "Xem" : "Bắt đầu"}</span><span>→</span>
              </div>
            </div>
          </Link>
          <Link href="/student/random-test">
            <div className="group cursor-pointer rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-6 text-white transition-all duration-200 hover:from-violet-600 hover:to-purple-700 hover:shadow-lg hover:-translate-y-0.5">
              <div className="mb-3 text-3xl">🎲</div>
              <p className="text-lg font-bold">Luyện tập ngẫu nhiên</p>
              <p className="mt-1 text-sm text-purple-200">10 câu hỏi · Lấy ngẫu nhiên từ ngân hàng</p>
              <div className="mt-4 flex items-center gap-1 text-sm text-purple-200 transition-all group-hover:gap-2">
                <span>Luyện tập ngay</span><span>→</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 animate-fade-in-up delay-225">
        {/* Weekly chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-slate-700">Tiến độ tuần này</h3>
          <div className="flex h-24 items-end gap-2">
            {WEEK_DATA.map((pct, i) => (
              <div key={WEEK_DAYS[i]} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full flex-1 items-end rounded-md bg-slate-100">
                  <div
                    className="w-full rounded-md bg-blue-400 transition-all duration-500"
                    style={{ height: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400">{WEEK_DAYS[i]}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-slate-300">Tính năng biểu đồ đang được phát triển</p>
        </div>

        {/* Recent activity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-slate-700">Hoạt động gần đây</h3>
          <div className="flex h-28 flex-col items-center justify-center text-slate-400">
            <span className="mb-2 text-4xl">🔥</span>
            <p className="text-sm font-medium text-slate-500">Giữ vững phong độ!</p>
            <p className="mt-1 text-xs text-slate-400">Hãy tiếp tục giải đố mỗi ngày nhé.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

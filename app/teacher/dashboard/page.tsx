"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface TeacherDashboardData {
  name: string;
  classCount: number;
  studentCount: number;
}

export default function TeacherDashboard() {
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/teacher/dashboard");
        const json = await res.json();
        if (json.success) {
          setData(json.user);
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <p className="text-slate-500 font-medium">Đang tải bảng điều khiển...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-4">
        <p className="text-slate-500">Không thể tải dữ liệu. Vui lòng thử lại.</p>
      </div>
    );
  }

  const STATS = [
    { icon: "🏫", label: "Lớp phụ trách",   value: data.classCount.toString(),  bg: "bg-emerald-50", iconBg: "bg-emerald-100", text: "text-emerald-600" },
    { icon: "👥", label: "Tổng học sinh",    value: data.studentCount.toString(), bg: "bg-teal-50",    iconBg: "bg-teal-100",    text: "text-teal-600"   },
    { icon: "📊", label: "Tỉ lệ hoàn thành bài", value: "Đang cập nhật",          bg: "bg-cyan-50",    iconBg: "bg-cyan-100",    text: "text-cyan-600 text-lg"   },
  ];

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Welcome */}
      <div className="animate-fade-in-up">
        <h2 className="text-2xl font-bold text-slate-800">Xin chào, Cô/Thầy {data.name}! 👩‍🏫</h2>
        <p className="mt-1 text-slate-500">Theo dõi tiến độ học sinh và quản lý lớp học của bạn tại đây.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 animate-fade-in-up delay-75">
        {STATS.map((s) => (
          <div key={s.label} className={`${s.bg} flex items-center gap-4 rounded-2xl p-5 shadow-sm`}>
            <div className={`${s.iconBg} flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-2xl`}>
              {s.icon}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-slate-500 truncate">{s.label}</p>
              <p className={`text-2xl font-bold ${s.text} truncate`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 animate-fade-in-up delay-150">
        <Link href="/teacher/classes">
          <div className="group cursor-pointer rounded-2xl bg-emerald-600 hover:bg-emerald-700 p-6 text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
            <div className="mb-3 text-3xl">🏫</div>
            <p className="text-lg font-bold">Lớp học của tôi</p>
            <p className="mt-1 text-sm text-white/70">Xem danh sách {data.classCount} lớp phụ trách</p>
            <div className="mt-4 flex items-center gap-1 text-sm text-emerald-200 transition-all group-hover:gap-2">
              <span>Quản lý</span><span>→</span>
            </div>
          </div>
        </Link>
        <Link href="/teacher/progress">
          <div className="group cursor-pointer rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 p-6 text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
            <div className="mb-3 text-3xl">📊</div>
            <p className="text-lg font-bold">Tiến độ học viên</p>
            <p className="mt-1 text-sm text-white/70">Báo cáo điểm số và tần suất làm bài</p>
            <div className="mt-4 flex items-center gap-1 text-sm text-emerald-200 transition-all group-hover:gap-2">
              <span>Xem báo cáo</span><span>→</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Notice */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-fade-in-up delay-225">
        <h3 className="mb-3 font-semibold text-slate-700">Thông báo mới nhất</h3>
        <div className="flex flex-col items-center py-8 text-slate-400">
          <span className="mb-2 text-4xl">🔔</span>
          <p className="text-sm text-slate-500 font-medium">Chưa có thông báo nào</p>
          <p className="mt-1 text-xs">Các hoạt động nổi bật của học sinh sẽ hiển thị ở đây</p>
        </div>
      </div>
    </div>
  );
}

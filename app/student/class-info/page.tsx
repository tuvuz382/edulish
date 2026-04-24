"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ClassInfo {
  id: number;
  name: string;
  level: string;
  room: string;
  created_at: string;
}

interface TeacherInfo {
  id: number;
  name: string;
  email: string;
}

interface Classmate {
  id: number;
  name: string;
  email: string;
  joined_at: string;
}

export default function ClassInfoPage() {
  const [data, setData] = useState<{
    hasClass: boolean;
    classInfo: ClassInfo | null;
    teacherInfo: TeacherInfo | null;
    classmates: Classmate[];
    joinedAt: string;
  } | null>(null);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/student/class-info");
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <p className="text-slate-500 font-medium">Đang tải thông tin lớp học...</p>
      </div>
    );
  }

  if (!data || !data.hasClass || !data.classInfo) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-4">
        <span className="text-6xl mb-4">🏫</span>
        <h2 className="text-xl font-bold text-slate-700">Chưa xếp lớp</h2>
        <p className="text-slate-500 mt-2">Bạn hiện chưa được phân công vào lớp học nào.</p>
        <p className="text-slate-500 text-sm">Vui lòng liên hệ Giáo vụ hoặc Admin để được hỗ trợ.</p>
      </div>
    );
  }

  const { classInfo, teacherInfo, classmates, joinedAt } = data;

  return (
    <div className="space-y-6 p-4 lg:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h2 className="text-2xl font-bold text-slate-800">Thông tin lớp học 🏫</h2>
        <p className="mt-1 text-slate-500">Thông tin chi tiết về lớp và giáo viên phụ trách của bạn</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 animate-fade-in-up delay-75">
        {/* Class card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-2xl">🏫</div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">Lớp học hiện tại</p>
              <h3 className="text-lg font-bold text-slate-800">{classInfo.name}</h3>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { icon: "📌", label: "Phòng học",    value: classInfo.room },
              { icon: "📊", label: "Trình độ",     value: classInfo.level },
              { icon: "👥", label: "Sĩ số",        value: `${classmates.length + 1} học sinh` }, // +1 tính cả bản thân
              { icon: "🗓️", label: "Ngày tham gia", value: new Date(joinedAt).toLocaleDateString("vi-VN") },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-lg">{row.icon}</span>
                <span className="flex-1 text-sm text-slate-500">{row.label}</span>
                <span className="text-sm font-semibold text-slate-700">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Teacher card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">👩‍🏫</div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">Giáo viên phụ trách</p>
              <h3 className="text-lg font-bold text-slate-800">{teacherInfo?.name || "Chưa có giáo viên"}</h3>
            </div>
          </div>
          {teacherInfo ? (
            <div className="space-y-3">
              {[
                { icon: "📧", label: "Email liên hệ", value: teacherInfo.email },
                { icon: "💬", label: "Hỗ trợ",        value: "Nhắn tin qua Inbox" },
                { icon: "🎓", label: "Chuyên môn",    value: "Tiếng Anh Tổng Quát" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                  <span className="text-lg">{row.icon}</span>
                  <span className="flex-1 text-sm text-slate-500">{row.label}</span>
                  <span className="text-sm font-semibold text-slate-700">{row.value}</span>
                </div>
              ))}
              <div className="mt-4 text-center">
                <Link href={`/student/messages?to=${teacherInfo.id}`} className="inline-block rounded-xl bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-200 transition-colors">
                  💬 Nhắn tin cho Giáo viên
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 text-slate-400">
              <span className="text-3xl mb-2">⏳</span>
              <p className="text-sm">Đang chờ nhà trường phân công giáo viên</p>
            </div>
          )}
        </div>
      </div>

      {/* Classmates */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-fade-in-up delay-150">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Danh sách bạn cùng lớp ({classmates.length})</h3>
        </div>
        
        {classmates.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-slate-400">
            <span className="mb-2 text-4xl">👥</span>
            <p className="text-sm font-medium text-slate-500">Lớp chưa có học sinh nào khác</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classmates.map((student) => (
              <Link 
                key={student.id} 
                href={`/student/messages?to=${student.id}`}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 hover:border-blue-300 hover:bg-blue-50 transition-all group"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 uppercase group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {student.name.charAt(0)}
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{student.name}</p>
                  <p className="truncate text-xs text-slate-500">{student.email}</p>
                </div>
                <div className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  💬
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

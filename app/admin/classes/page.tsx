"use client";

import { useState, useEffect } from "react";

interface ClassItem {
  id: number;
  name: string;
  level: string;
  room: string;
  teacher_name: string | null;
  student_count: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function AdminClassesPage() {
  const [showModal, setShowModal] = useState(false);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [currentClass, setCurrentClass] = useState<ClassItem | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("student");

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", room: "", level: "Beginner", teacher_id: "" });
  const [error, setError] = useState("");

  const COLS = ["Tên lớp", "Giáo viên", "Số học sinh", "Trình độ", "Phòng học", "Hành động"];

  useEffect(() => {
    fetchClasses();
    fetchAllUsers();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/classes");
      const data = await res.json();
      if (data.success) {
        setClasses(data.classes);
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu lớp học", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) {
        setAllUsers(data.users);
        setTeachers(data.users.filter((u: any) => u.role === 'teacher'));
      }
    } catch (err) {
      console.error("Lỗi khi tải users", err);
    }
  };

  const handleCreateClass = async () => {
    setError("");
    try {
      const payload = {
        ...formData,
        teacher_id: formData.teacher_id ? Number(formData.teacher_id) : null
      };
      const res = await fetch("/api/admin/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setFormData({ name: "", room: "", level: "Beginner", teacher_id: "" });
        fetchClasses();
      } else {
        setError(data.error || "Có lỗi xảy ra");
      }
    } catch (err) {
      setError("Không thể kết nối đến server");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa lớp học này? Mọi dữ liệu liên quan sẽ bị xóa!")) return;
    try {
      const res = await fetch(`/api/admin/classes/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchClasses();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Lỗi khi xóa lớp học");
    }
  };

  const fetchMembers = async (classId: number) => {
    try {
      const res = await fetch(`/api/admin/classes/${classId}/members`);
      const data = await res.json();
      if (data.success) {
        setMembers(data.members);
      }
    } catch (err) {
      console.error("Lỗi tải thành viên", err);
    }
  };

  const handleOpenMembers = (c: ClassItem) => {
    setCurrentClass(c);
    fetchMembers(c.id);
    setShowMemberModal(true);
  };

  const handleAddMember = async () => {
    if (!currentClass || !selectedUserId) return;
    try {
      const res = await fetch(`/api/admin/classes/${currentClass.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: selectedUserId, role: selectedRole })
      });
      const data = await res.json();
      if (data.success) {
        fetchMembers(currentClass.id);
        fetchClasses(); 
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert("Lỗi thêm thành viên");
    }
  };

  const handleRemoveMember = async (userId: number, role: string) => {
    if (!currentClass) return;
    if (!confirm("Xóa thành viên khỏi lớp?")) return;
    try {
      const res = await fetch(`/api/admin/classes/${currentClass.id}/members?user_id=${userId}&role=${role}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        fetchMembers(currentClass.id);
        fetchClasses();
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert("Lỗi xóa thành viên");
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý lớp học 🏫</h2>
          <p className="mt-1 text-slate-500">Tạo lớp, xếp giáo viên và thêm học sinh</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-violet-700 active:scale-95">
          ＋ Tạo lớp mới
        </button>
      </div>

      <div className="flex flex-wrap gap-3 animate-fade-in-up delay-75">
        <input type="text" placeholder="Tìm kiếm lớp học…"
          className="flex-1 min-w-48 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100" />
        <select className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none">
          <option>Tất cả trình độ</option>
          <option>Beginner</option>
          <option>Elementary</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm animate-fade-in-up delay-150">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {COLS.map((c) => (
                  <th key={c} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={COLS.length} className="py-10 text-center text-slate-500">Đang tải...</td>
                </tr>
              ) : classes.length === 0 ? (
                <tr>
                  <td colSpan={COLS.length} className="py-16 text-center">
                    <div className="flex flex-col items-center text-slate-400">
                      <span className="mb-2 text-5xl">🏫</span>
                      <p className="font-medium text-slate-500">Chưa có lớp học nào</p>
                      <button onClick={() => setShowModal(true)} className="mt-4 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700">
                        ＋ Tạo lớp học
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                classes.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-4 font-bold text-slate-800">{c.name}</td>
                    <td className="px-5 py-4 text-slate-600">{c.teacher_name || <span className="text-slate-400 italic">Chưa phân công</span>}</td>
                    <td className="px-5 py-4 font-medium">{c.student_count} hs</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700">{c.level}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{c.room}</td>
                    <td className="px-5 py-4 space-x-3">
                      <button onClick={() => handleOpenMembers(c)} className="text-blue-600 hover:text-blue-800 font-medium">Thành viên</button>
                      <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 font-medium">Xóa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tạo lớp modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-scale-in">
            <h3 className="mb-5 text-xl font-bold text-slate-800">Tạo lớp học mới</h3>
            {error && <p className="mb-4 text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>}
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Tên lớp</label>
                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" placeholder="Lớp A1 — Beginner" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Phòng học</label>
                <input value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} type="text" placeholder="Phòng 201" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Trình độ</label>
                <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none">
                  <option value="Beginner">Beginner</option>
                  <option value="Elementary">Elementary</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Upper-Intermediate">Upper-Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Giáo viên phụ trách</label>
                <select value={formData.teacher_id} onChange={e => setFormData({...formData, teacher_id: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none">
                  <option value="">— Chọn giáo viên —</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Hủy</button>
              <button onClick={handleCreateClass} className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-700">Tạo lớp</button>
            </div>
          </div>
        </div>
      )}

      {/* Quản lý Thành viên modal */}
      {showMemberModal && currentClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl animate-scale-in">
            <h3 className="mb-2 text-xl font-bold text-slate-800">Thành viên lớp: {currentClass.name}</h3>
            
            <div className="mb-6 flex gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <select 
                value={selectedRole} 
                onChange={e => setSelectedRole(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none"
              >
                <option value="student">Học viên</option>
                <option value="teacher">Giáo viên</option>
              </select>
              <select 
                value={selectedUserId} 
                onChange={e => setSelectedUserId(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none"
              >
                <option value="">-- Chọn tài khoản --</option>
                {allUsers.filter(u => u.role === selectedRole && !members.find(m => m.id === u.id)).map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
              <button 
                onClick={handleAddMember}
                className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-bold text-white hover:bg-violet-700"
              >
                Thêm
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-left">
                    <th className="p-3">Tên</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Vai trò</th>
                    <th className="p-3 text-right">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {members.length === 0 ? (
                    <tr><td colSpan={4} className="p-4 text-center text-slate-500">Chưa có thành viên nào</td></tr>
                  ) : members.map(m => (
                    <tr key={m.id} className="border-b border-slate-100">
                      <td className="p-3 font-medium">{m.name}</td>
                      <td className="p-3 text-slate-500">{m.email}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${m.role === 'teacher' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                          {m.role === 'teacher' ? 'Giáo viên' : 'Học viên'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button onClick={() => handleRemoveMember(m.id, m.role)} className="text-red-500 hover:text-red-700">Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={() => setShowMemberModal(false)}
                className="rounded-xl bg-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-300">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

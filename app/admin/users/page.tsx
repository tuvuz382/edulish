"use client";

import { useState, useEffect } from "react";

type Role = "all" | "student" | "teacher";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: number;
  created_at: string;
}

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState<Role>("all");
  const [showModal, setShowModal]   = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "student" });
  const [error, setError] = useState("");

  const COLS = ["Họ tên", "Email", "Vai trò", "Trạng thái", "Ngày tạo", "Hành động"];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu người dùng", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    setError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setFormData({ name: "", email: "", password: "", role: "student" });
        fetchUsers();
      } else {
        setError(data.error || "Có lỗi xảy ra");
      }
    } catch (err) {
      setError("Không thể kết nối đến server");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Lỗi khi xóa người dùng");
    }
  };

  const filteredUsers = users.filter(u => roleFilter === "all" || u.role === roleFilter);

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý người dùng 👥</h2>
          <p className="mt-1 text-slate-500">Thêm, chỉnh sửa và xóa tài khoản</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-violet-700 active:scale-95"
        >
          ＋ Thêm người dùng
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 animate-fade-in-up delay-75">
        {(["all", "student", "teacher"] as Role[]).map((r) => {
          const labels: Record<Role, string> = { all: "Tất cả", student: "Học sinh", teacher: "Giáo viên" };
          return (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                roleFilter === r ? "bg-violet-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}>
              {labels[r]}
            </button>
          );
        })}
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
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={COLS.length} className="py-16 text-center">
                    <div className="flex flex-col items-center text-slate-400">
                      <span className="mb-2 text-5xl">👥</span>
                      <p className="font-medium text-slate-500">Chưa có người dùng nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-800">{user.name}</td>
                    <td className="px-5 py-4 text-slate-600">{user.email}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${user.role === 'teacher' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {user.role === 'teacher' ? 'Giáo viên' : user.role === 'student' ? 'Học sinh' : user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {user.is_active ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:text-red-700 font-medium">Xóa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-scale-in">
            <h3 className="mb-5 text-xl font-bold text-slate-800">Thêm người dùng mới</h3>
            {error && <p className="mb-4 text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>}
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Họ và tên</label>
                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" placeholder="Nguyễn Văn A" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} type="email" placeholder="example@edulish.com" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Mật khẩu</label>
                <input value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} type="password" placeholder="••••••••" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Vai trò</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100">
                  <option value="student">Học sinh</option>
                  <option value="teacher">Giáo viên</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Hủy</button>
              <button onClick={handleAddUser} className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-700">Thêm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";

const MATERIAL_TYPES = [
  { id: "all",      label: "Tất cả",   icon: "📂" },
  { id: "pdf",      label: "PDF",      icon: "📄" },
  { id: "audio",    label: "Âm thanh", icon: "🎵" },
  { id: "video",    label: "Video",    icon: "🎬" },
  { id: "exercise", label: "Bài tập",  icon: "📝" },
];

interface Material {
  id: number;
  name: string;
  description: string;
  url: string;
  type: string;
  level: string;
  created_at: string;
}

export default function AdminMaterialsPage() {
  const [typeFilter, setTypeFilter]         = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", description: "", url: "", type: "pdf", level: "Beginner" });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/materials");
      const data = await res.json();
      if (data.success) {
        setMaterials(data.materials);
      }
    } catch (err) {
      console.error("Lỗi khi tải tài liệu", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMaterial = async () => {
    setError("");
    try {
      const res = await fetch("/api/admin/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setFormData({ name: "", description: "", url: "", type: "pdf", level: "Beginner" });
        fetchMaterials();
      } else {
        setError(data.error || "Có lỗi xảy ra");
      }
    } catch (err) {
      setError("Không thể kết nối đến server");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;
    try {
      const res = await fetch(`/api/admin/materials/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchMaterials();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Lỗi khi xóa tài liệu");
    }
  };

  const filteredMaterials = materials.filter(m => typeFilter === "all" || m.type === typeFilter);

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tài liệu học tập 📚</h2>
          <p className="mt-1 text-slate-500">Quản lý bộ tài liệu và tài nguyên học tập</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-violet-700 active:scale-95">
          ＋ Tải tài liệu lên
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 animate-fade-in-up delay-75">
        <div className="flex gap-2 flex-wrap">
          {MATERIAL_TYPES.map((t) => (
            <button key={t.id} onClick={() => setTypeFilter(t.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                typeFilter === t.id ? "bg-violet-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <input type="text" placeholder="Tìm tài liệu…"
            className="w-52 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100" />
        </div>
      </div>

      <div className="animate-fade-in-up delay-150">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 opacity-30">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 h-8 w-8 rounded-xl bg-slate-200" />
                <div className="mb-2 h-4 w-3/4 rounded-lg bg-slate-200" />
                <div className="h-3 w-1/2 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <span className="text-6xl">📚</span>
            <p className="mt-4 text-lg font-semibold text-slate-600">Chưa có tài liệu nào</p>
            <p className="mt-1 text-sm text-slate-400">Tải lên tài liệu đầu tiên để học sinh có thể tham khảo</p>
            <button onClick={() => setShowModal(true)}
              className="mt-5 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-violet-700">
              ＋ Tải tài liệu lên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMaterials.map((m) => {
              const typeInfo = MATERIAL_TYPES.find(t => t.id === m.type) || MATERIAL_TYPES[0];
              return (
                <div key={m.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                  <div className="mb-3 text-3xl">{typeInfo.icon}</div>
                  <h3 className="mb-1 font-bold text-slate-800 line-clamp-1" title={m.name}>{m.name}</h3>
                  <p className="mb-3 text-xs text-slate-500 line-clamp-2 min-h-8">{m.description}</p>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {m.level}
                    </span>
                    <div className="flex gap-2">
                      <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-700 text-sm font-semibold">Xem</a>
                      <button onClick={() => handleDelete(m.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Xóa</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-scale-in">
            <h3 className="mb-5 text-xl font-bold text-slate-800">Tải tài liệu lên</h3>
            {error && <p className="mb-4 text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>}
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Tên tài liệu</label>
                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" placeholder="VD: Grammar Book Level 1"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Mô tả</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={2} placeholder="Mô tả ngắn về tài liệu…"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 resize-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Đường dẫn / URL tài liệu</label>
                <input value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} type="url" placeholder="https://…"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Loại tài liệu</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none">
                    <option value="pdf">PDF</option>
                    <option value="audio">Âm thanh</option>
                    <option value="video">Video</option>
                    <option value="exercise">Bài tập</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Trình độ</label>
                  <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none">
                    <option value="Beginner">Beginner</option>
                    <option value="Elementary">Elementary</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Upper-Intermediate">Upper-Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Hủy</button>
              <button onClick={handleCreateMaterial} className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-700">Lưu tài liệu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

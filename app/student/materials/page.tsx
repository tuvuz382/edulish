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

export default function StudentMaterialsPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

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

  const filteredMaterials = materials.filter(m => typeFilter === "all" || m.type === typeFilter);

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tài liệu học tập 📚</h2>
          <p className="mt-1 text-slate-500">Tra cứu tài liệu và tài nguyên bổ trợ</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 animate-fade-in-up delay-75">
        <div className="flex gap-2 flex-wrap">
          {MATERIAL_TYPES.map((t) => (
            <button key={t.id} onClick={() => setTypeFilter(t.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                typeFilter === t.id ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
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
                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-blue-100 text-blue-700 px-4 py-1.5 hover:bg-blue-200 text-sm font-semibold transition-colors">Truy cập</a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

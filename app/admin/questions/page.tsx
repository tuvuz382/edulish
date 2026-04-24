"use client";

import { useState, useEffect } from "react";

type Category = "all" | "vocabulary" | "grammar" | "reading" | "listening";

interface Question {
  id: number;
  content: string;
  category: string;
  difficulty: string;
  created_at: string;
}

export default function AdminQuestionsPage() {
  const [cat, setCat]             = useState<Category>("all");
  const [showModal, setShowModal] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [difficulty, setDifficulty] = useState("all");

  // Form state
  const [formData, setFormData] = useState({
    content: "",
    option_a: "", option_b: "", option_c: "", option_d: "",
    correct_ans: "A",
    category: "vocabulary",
    difficulty: "easy"
  });

  const CATS: { id: Category; label: string }[] = [
    { id: "all",        label: "Tất cả"       },
    { id: "vocabulary", label: "Từ vựng"      },
    { id: "grammar",    label: "Ngữ pháp"     },
    { id: "reading",    label: "Đọc hiểu"     },
    { id: "listening",  label: "Nghe hiểu"    },
  ];

  const COLS = ["Câu hỏi", "Phân loại", "Độ khó", "Ngày tạo", "Hành động"];

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (cat !== "all") query.append("category", cat);
      if (difficulty !== "all") query.append("difficulty", difficulty);
      if (search) query.append("search", search);

      const res = await fetch(`/api/admin/questions?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [cat, difficulty, search]);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xoá câu hỏi này?")) return;
    try {
      const res = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchQuestions();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Lỗi xoá câu hỏi");
    }
  };

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setFormData({
          content: "", option_a: "", option_b: "", option_c: "", option_d: "",
          correct_ans: "A", category: "vocabulary", difficulty: "easy"
        });
        fetchQuestions();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Lỗi tạo câu hỏi");
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ngân hàng câu hỏi ❓</h2>
          <p className="mt-1 text-slate-500">Thêm, chỉnh sửa và phân loại câu hỏi trắc nghiệm</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-violet-700 active:scale-95">
          ＋ Thêm câu hỏi
        </button>
      </div>

      {/* Category tabs & Filters */}
      <div className="flex flex-wrap gap-2 animate-fade-in-up delay-75">
        {CATS.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              cat === c.id ? "bg-violet-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}>
            {c.label}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-violet-400 focus:outline-none">
            <option value="all">Mọi độ khó</option>
            <option value="easy">Dễ</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Khó</option>
          </select>
          <input type="text" placeholder="Tìm kiếm câu hỏi…" value={search} onChange={e => setSearch(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 w-56" />
        </div>
      </div>

      {/* Table */}
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
                <tr><td colSpan={COLS.length} className="py-16 text-center text-slate-500">Đang tải...</td></tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan={COLS.length} className="py-16 text-center">
                    <div className="flex flex-col items-center text-slate-400">
                      <span className="mb-2 text-5xl">❓</span>
                      <p className="font-medium text-slate-500">Chưa có câu hỏi nào</p>
                      <button onClick={() => setShowModal(true)} className="mt-4 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700">
                        ＋ Thêm câu hỏi
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr key={q.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-800 max-w-md truncate" title={q.content}>{q.content}</td>
                    <td className="px-5 py-4 text-slate-600 capitalize">{q.category}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{new Date(q.created_at).toLocaleDateString("vi-VN")}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleDelete(q.id)} className="text-red-500 hover:text-red-700 font-medium text-xs">Xoá</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <h3 className="mb-5 text-xl font-bold text-slate-800">Thêm câu hỏi mới</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Nội dung câu hỏi</label>
                <textarea rows={3} placeholder="Nhập câu hỏi…" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 resize-none" />
              </div>
              {["A", "B", "C", "D"].map((opt) => (
                <div key={opt} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">{opt}</span>
                  <input type="text" placeholder={`Đáp án ${opt}`} value={formData[`option_${opt.toLowerCase()}` as keyof typeof formData]} onChange={e => setFormData({...formData, [`option_${opt.toLowerCase()}`]: e.target.value})}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Đáp án đúng</label>
                  <select value={formData.correct_ans} onChange={e => setFormData({...formData, correct_ans: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none">
                    <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Phân loại</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none">
                    <option value="vocabulary">Từ vựng</option>
                    <option value="grammar">Ngữ pháp</option>
                    <option value="reading">Đọc hiểu</option>
                    <option value="listening">Nghe hiểu</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Độ khó</label>
                <div className="flex gap-2">
                  {[{id: "easy", label: "Dễ"}, {id: "medium", label: "Trung bình"}, {id: "hard", label: "Khó"}].map((d) => (
                    <button key={d.id} type="button" onClick={() => setFormData({...formData, difficulty: d.id})}
                      className={`flex-1 rounded-xl border py-2 text-xs font-semibold transition-all ${
                        formData.difficulty === d.id ? "border-violet-500 bg-violet-50 text-violet-600" : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Hủy</button>
              <button onClick={handleCreate} className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-700">Lưu câu hỏi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

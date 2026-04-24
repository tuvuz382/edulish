"use client";

import { useState, useEffect } from "react";

interface Option {
  id: string;
  text: string;
}

interface DailyQuestion {
  id: number;
  question: string;
  options: Option[];
  correct: string;
}

export default function DailyQuestionPage() {
  const [question, setQuestion] = useState<DailyQuestion | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch dữ liệu câu hỏi hàng ngày
  useEffect(() => {
    const fetchDailyData = async () => {
      try {
        const res = await fetch("/api/student/daily-question");
        const data = await res.json();
        
        if (data.success && data.question) {
          setQuestion(data.question);
          setStreak(data.streak);
          setSubmitted(data.hasAnsweredToday);
        }
      } catch (err) {
        console.error("Lỗi lấy câu hỏi:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDailyData();
  }, []);

  const handleSubmit = async () => {
    if (!selected || submitted || !question) return;
    
    try {
      // Gọi API nộp bài để tính toán Streak
      const res = await fetch("/api/student/daily-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, selectedOption: selected }),
      });
      const data = await res.json();
      
      if (data.success) {
        setSubmitted(true);
        // Cập nhật lại streak từ server
        setStreak(data.streak);
      }
    } catch (err) {
      console.error("Lỗi nộp bài:", err);
    }
  };

  const optionClass = (id: string) => {
    const base = "flex items-center gap-3 w-full p-4 rounded-xl border-2 text-left text-sm font-medium transition-all duration-150 ";
    if (!submitted) {
      return base + (selected === id
        ? "border-blue-500 bg-blue-50 text-blue-700"
        : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 text-slate-700 cursor-pointer");
    }
    
    if (!question) return base;
    if (id === question.correct)  return base + "border-emerald-500 bg-emerald-50 text-emerald-700";
    if (id === selected) return base + "border-red-400 bg-red-50 text-red-600";
    return base + "border-slate-200 bg-white text-slate-400";
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-slate-500 font-medium">Đang lấy câu hỏi hôm nay...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-slate-400">
        <span className="text-6xl mb-4">📭</span>
        <p className="font-medium">Chưa có câu hỏi cho hôm nay.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📅</span>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Câu hỏi hàng ngày</h2>
            <p className="text-sm text-slate-500">Hoàn thành mỗi ngày để duy trì Streak (Chuỗi học) của bạn!</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 animate-fade-in-up delay-75">
        {/* ── Question card ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Status bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${submitted ? "bg-emerald-500" : "bg-amber-400 animate-pulse"}`} />
              <span className="text-sm font-medium text-slate-600">
                {submitted ? "Đã hoàn thành hôm nay ✅" : "Nhiệm vụ hôm nay chưa hoàn thành"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-600">
                🔥 Streak: {streak} ngày
              </span>
            </div>
          </div>

          {/* Question */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Nhiệm vụ hàng ngày</p>
            <h3 className="mb-6 text-lg font-semibold text-slate-800 leading-relaxed">
              {question.question}
            </h3>

            <div className="space-y-3">
              {question.options.map((opt) => (
                <button
                  key={opt.id}
                  disabled={submitted}
                  onClick={() => setSelected(opt.id)}
                  className={optionClass(opt.id)}
                >
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold">
                    {opt.id}
                  </span>
                  {opt.text}
                  {submitted && opt.id === question.correct && (
                    <span className="ml-auto text-emerald-500 font-bold text-lg">✓</span>
                  )}
                  {submitted && opt.id === selected && opt.id !== question.correct && (
                    <span className="ml-auto text-red-500 font-bold text-lg">✗</span>
                  )}
                </button>
              ))}
            </div>

            {!submitted ? (
               <div className="mt-6">
                <button
                  onClick={handleSubmit}
                  disabled={!selected}
                  className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
                >
                  Gửi đáp án & Nhận Streak 🔥
                </button>
              </div>
            ) : (
              <div className={`mt-6 rounded-xl p-4 text-center border-2 ${selected === question.correct ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>
                {selected === question.correct ? (
                  <p className="font-bold text-emerald-600">🎉 Tuyệt vời! Bạn đã trả lời chính xác.</p>
                ) : (
                  <p className="font-bold text-red-600">
                    ❌ Sai rồi! Đáp án đúng là <strong>{question.correct}. {question.options.find(o => o.id === question.correct)?.text}</strong>
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-2">Chuỗi học tập (Streak) của bạn đã được cập nhật an toàn.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Dictionary widget ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm h-fit sticky top-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">📖</span>
            <p className="font-semibold text-slate-700">Tra từ nhanh</p>
          </div>
          <p className="text-xs text-slate-500 mb-3 leading-relaxed">
            Gặp từ khó trong câu hỏi? Sử dụng tính năng tra từ điển ở menu chính để hiểu rõ ngữ nghĩa nhé!
          </p>
          <div className="flex flex-col items-center py-6 text-slate-300 bg-slate-50 rounded-xl">
            <span className="mb-2 text-4xl">💡</span>
            <p className="text-xs text-center px-4 font-medium">Bí kíp: Dịch câu hỏi trước khi chọn đáp án sẽ giúp bạn nhớ lâu hơn.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

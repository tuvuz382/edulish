"use client";

import { useState, useEffect } from "react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  category: string;
  difficulty: string;
}

export default function RandomTestPage() {
  const [started, setStarted]   = useState(false);
  const [current, setCurrent]   = useState(0);
  const [answers, setAnswers]   = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading]   = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student/quiz/random?limit=10");
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error("Lỗi tải câu hỏi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const total = questions.length;
  const q     = questions[current];

  const handleAnswer = (idx: number) => {
    if (answers[current] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [current]: idx }));
  };

  const handleNext = () => {
    if (current < total - 1) setCurrent((c) => c + 1);
    else setFinished(true);
  };

  const restart = () => {
    setStarted(false);
    setCurrent(0);
    setAnswers({});
    setFinished(false);
    fetchQuestions();
  };

  const score = Object.entries(answers).filter(
    ([qi, ai]) => questions[parseInt(qi)].correct === ai
  ).length;

  if (loading && !started) {
    return (
      <div className="flex min-h-full items-center justify-center p-4">
        <p className="text-slate-500 font-medium">Đang tải câu hỏi...</p>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="flex min-h-full items-center justify-center p-4 lg:p-6">
        <div className="w-full max-w-md animate-scale-in">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center">
            <div className="mb-4 text-6xl">🎲</div>
            <h2 className="text-2xl font-bold text-slate-800">Luyện tập ngẫu nhiên</h2>
            <p className="mt-2 text-slate-500">Kiểm tra kiến thức của bạn với bộ câu hỏi ngẫu nhiên!</p>
            <div className="my-6 grid grid-cols-3 gap-4 text-center">
              {[
                { label: "Số câu", value: `${total} câu` },
                { label: "Thời gian", value: "~10 phút" },
                { label: "Điểm thưởng", value: "+30 XP" },
              ].map((i) => (
                <div key={i.label} className="rounded-xl bg-slate-50 p-3">
                  <p className="text-lg font-bold text-blue-600">{i.value}</p>
                  <p className="text-xs text-slate-500">{i.label}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStarted(true)}
              disabled={total === 0}
              className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
            >
              {total === 0 ? "Chưa có câu hỏi" : "Bắt đầu kiểm tra 🚀"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score / total) * 100);
    return (
      <div className="flex min-h-full items-center justify-center p-4 lg:p-6">
        <div className="w-full max-w-md animate-scale-in">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center">
            <div className="mb-4 text-6xl">{pct >= 70 ? "🎉" : "😅"}</div>
            <h2 className="text-2xl font-bold text-slate-800">Kết quả</h2>
            <div className="my-6 flex items-center justify-center">
              <div className="relative h-32 w-32">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke={pct >= 70 ? "#10b981" : "#f59e0b"} strokeWidth="3"
                    strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-800">{score}/{total}</span>
                  <span className="text-xs text-slate-500">{pct}%</span>
                </div>
              </div>
            </div>
            <p className={`text-lg font-semibold ${pct >= 70 ? "text-emerald-600" : "text-amber-600"}`}>
              {pct >= 70 ? "Xuất sắc! Tiếp tục phát huy!" : "Cần cố gắng thêm nhé!"}
            </p>
            <button
              onClick={restart}
              className="mt-6 w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition-all hover:bg-blue-700 active:scale-95"
            >
              Làm lại bài khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6 max-w-3xl mx-auto">
      {/* Progress */}
      <div className="animate-fade-in-up">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-700">Câu {current + 1} / {total}</span>
          <span className="text-slate-500">{Object.keys(answers).length} đã trả lời</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: `${((current + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      {q && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-fade-in-up delay-75">
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">Câu {current + 1}</p>
            <div className="flex gap-2">
              <span className="px-2 py-1 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">{q.category}</span>
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
              }`}>{q.difficulty}</span>
            </div>
          </div>
          
          <h3 className="mb-6 text-lg font-semibold text-slate-800">{q.question}</h3>
          
          <div className="space-y-3">
            {q.options.map((opt, idx) => {
              const ans = answers[current];
              const base = "flex items-center gap-3 w-full p-4 rounded-xl border-2 text-left text-sm font-medium transition-all duration-150 ";
              let cls = base;
              if (ans === undefined) {
                cls += "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 text-slate-700 cursor-pointer";
              } else if (idx === q.correct) {
                cls += "border-emerald-500 bg-emerald-50 text-emerald-700";
              } else if (idx === ans) {
                cls += "border-red-400 bg-red-50 text-red-600";
              } else {
                cls += "border-slate-200 bg-white text-slate-400";
              }
              return (
                <button key={idx} onClick={() => handleAnswer(idx)} className={cls} disabled={ans !== undefined}>
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold">
                    {["A", "B", "C", "D"][idx]}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
          {answers[current] !== undefined && (
            <button
              onClick={handleNext}
              className="mt-5 w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition-all hover:bg-blue-700 active:scale-95"
            >
              {current < total - 1 ? "Câu tiếp theo →" : "Xem kết quả 🎯"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

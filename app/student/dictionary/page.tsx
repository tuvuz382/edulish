"use client";

import { useState, useCallback, useRef } from "react";

// ── Kiểu dữ liệu từ Free Dictionary API ──
interface Phonetic {
  text?: string;
  audio?: string;
}

interface Definition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms?: string[];
  antonyms?: string[];
}

interface DictEntry {
  word: string;
  phonetic?: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  sourceUrls?: string[];
}

// ── Kiểu dữ liệu kết quả tổng hợp ──
interface SearchResult {
  entry: DictEntry;
  translation: string | null; // Bản dịch tiếng Việt (từ MyMemory)
}

// ──────────────────────────────────────────────────────────────

export default function DictionaryPage() {
  const [query,   setQuery]   = useState("");
  const [result,  setResult]  = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  // Ref để điều khiển audio player
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Hàm tìm kiếm chính: gọi song song 2 API ──
  const search = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const word = query.trim();
    if (!word) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Gọi song song cả 2 API: tra từ điển + dịch nghĩa
      // Promise.allSettled để nếu 1 cái lỗi thì cái kia vẫn hiện
      const [dictRes, transRes] = await Promise.allSettled([
        fetch(`/api/dictionary?word=${encodeURIComponent(word)}`),
        fetch(`/api/translate?q=${encodeURIComponent(word)}&from=en&to=vi`),
      ]);

      // Xử lý kết quả từ điển (bắt buộc phải có)
      if (dictRes.status === "rejected") {
        throw new Error("Không thể kết nối đến từ điển. Kiểm tra mạng và thử lại.");
      }

      const dictData = await dictRes.value.json();
      if (!dictData.success) {
        // Từ không tồn tại trong từ điển
        setError(dictData.message ?? `Không tìm thấy từ "${word}".`);
        return;
      }

      // Xử lý kết quả dịch (không bắt buộc — nếu lỗi thì bỏ qua)
      let translation: string | null = null;
      if (transRes.status === "fulfilled") {
        const transData = await transRes.value.json();
        if (transData.success && transData.translated) {
          translation = transData.translated;
        }
      }

      setResult({ entry: dictData.entry, translation });
    } catch (err: unknown) {
      console.error("[Dictionary] Lỗi tìm kiếm:", err);
      setError((err as Error).message ?? "Đã xảy ra lỗi. Thử lại nhé!");
    } finally {
      setLoading(false);
    }
  }, [query]);

  // ── Tìm audio URL ưu tiên loại /en-US/ ──
  const audioSrc = result?.entry.phonetics?.find((p) => p.audio)?.audio;

  // ── Tìm phiên âm để hiển thị ──
  const phonetic =
    result?.entry.phonetic ??
    result?.entry.phonetics?.find((p) => p.text)?.text;

  // ── Badge màu theo loại từ (part of speech) ──
  const posColors: Record<string, string> = {
    noun:        "bg-blue-100 text-blue-700",
    verb:        "bg-green-100 text-green-700",
    adjective:   "bg-purple-100 text-purple-700",
    adverb:      "bg-orange-100 text-orange-700",
    pronoun:     "bg-pink-100 text-pink-700",
    preposition: "bg-yellow-100 text-yellow-700",
    conjunction: "bg-teal-100 text-teal-700",
    interjection:"bg-red-100 text-red-700",
  };

  const getPosColor = (pos: string) =>
    posColors[pos.toLowerCase()] ?? "bg-slate-100 text-slate-600";

  // ──────────────────────────────────────────────

  return (
    <div className="space-y-6 p-4 lg:p-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="animate-fade-in-up">
        <h2 className="text-2xl font-bold text-slate-800">Từ điển Anh – Việt 📖</h2>
        <p className="mt-1 text-slate-500 text-sm">
          Tra nghĩa, phiên âm tiếng Anh và bản dịch tiếng Việt
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={search} className="flex gap-3 animate-fade-in-up" style={{ animationDelay: "50ms" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nhập từ tiếng Anh… (vd: eloquent, persevere)"
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm
                     focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm
                     transition-all duration-200"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white
                     transition-all hover:bg-blue-700 active:scale-95
                     disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Đang tra…
            </span>
          ) : "Tra cứu"}
        </button>
      </form>

      {/* Error banner */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 flex items-center gap-3 animate-fade-in">
          <span className="text-xl">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="animate-pulse space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <div className="h-8 w-40 rounded-lg bg-slate-200" />
            <div className="h-4 w-24 rounded-lg bg-slate-200" />
            <div className="h-10 w-56 rounded-xl bg-slate-100" />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <div className="h-5 w-16 rounded-full bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-3/4 rounded bg-slate-200" />
          </div>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="space-y-4 animate-fade-in-up">

          {/* ── Card: Từ + phiên âm + bản dịch + audio ── */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">

              {/* Left: word info */}
              <div className="space-y-2">
                {/* Từ chính */}
                <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                  {result.entry.word}
                </h3>

                {/* Phiên âm */}
                {phonetic && (
                  <p className="text-slate-400 italic text-base">{phonetic}</p>
                )}

                {/* Bản dịch tiếng Việt (từ MyMemory) */}
                {result.translation && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-700">
                      🇻🇳 Tiếng Việt
                    </span>
                    <span className="text-base font-semibold text-slate-700">
                      {result.translation}
                    </span>
                  </div>
                )}
              </div>

              {/* Right: Audio player */}
              {audioSrc && (
                <div className="flex flex-col items-center gap-1">
                  <audio ref={audioRef} src={audioSrc} className="hidden" />
                  <button
                    onClick={() => {
                      // Tạo audio mới mỗi lần bấm để tránh bug trình duyệt
                      const a = new Audio(audioSrc);
                      a.play().catch(() => {});
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-full
                               bg-blue-600 text-white hover:bg-blue-700 active:scale-95
                               transition-all shadow-md"
                    title="Nghe phát âm"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7L8 5z" />
                    </svg>
                  </button>
                  <span className="text-xs text-slate-400">Phát âm</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Cards: Meanings ── */}
          {result.entry.meanings.map((meaning, mi) => (
            <div key={mi} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">

              {/* Part of speech badge */}
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${getPosColor(meaning.partOfSpeech)}`}>
                {meaning.partOfSpeech}
              </span>

              {/* Synonyms cho cả meaning (nếu có) */}
              {meaning.synonyms && meaning.synonyms.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs text-slate-500 font-medium">Đồng nghĩa:</span>
                  {meaning.synonyms.slice(0, 6).map((s) => (
                    <button
                      key={s}
                      onClick={() => { setQuery(s); }}
                      className="rounded-lg bg-blue-50 px-2 py-0.5 text-xs text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                      title={`Tra từ "${s}"`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Definitions */}
              <ol className="space-y-4">
                {meaning.definitions.slice(0, 3).map((def, di) => (
                  <li key={di} className="flex gap-3">
                    {/* Số thứ tự */}
                    <span className="flex-shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center
                                     rounded-full bg-blue-600 text-[11px] font-bold text-white">
                      {di + 1}
                    </span>

                    <div className="space-y-1 min-w-0">
                      {/* Định nghĩa */}
                      <p className="text-sm text-slate-700 leading-relaxed">{def.definition}</p>

                      {/* Ví dụ câu */}
                      {def.example && (
                        <p className="text-xs text-slate-400 italic pl-1 border-l-2 border-slate-200">
                          &ldquo;{def.example}&rdquo;
                        </p>
                      )}

                      {/* Synonyms của definition */}
                      {def.synonyms && def.synonyms.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {def.synonyms.slice(0, 4).map((s) => (
                            <button
                              key={s}
                              onClick={() => setQuery(s)}
                              className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                              title={`Tra từ "${s}"`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}

          {/* Source */}
          {result.entry.sourceUrls?.[0] && (
            <p className="text-center text-xs text-slate-400">
              Nguồn:{" "}
              <a
                href={result.entry.sourceUrls[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-500 transition-colors"
              >
                {result.entry.sourceUrls[0]}
              </a>
            </p>
          )}
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && !error && (
        <div className="flex flex-col items-center py-20 text-slate-400 animate-fade-in">
          <span className="mb-4 text-7xl">📖</span>
          <p className="font-semibold text-slate-500 text-base">Tra cứu từ điển Anh – Việt</p>
          <p className="mt-2 text-sm text-center max-w-xs">
            Nhập một từ tiếng Anh để xem định nghĩa, phiên âm, phát âm và bản dịch tiếng Việt
          </p>
          {/* Gợi ý từ mẫu */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {["eloquent", "persevere", "serendipity", "benevolent", "resilient"].map((w) => (
              <button
                key={w}
                onClick={() => setQuery(w)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600
                           hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm"
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

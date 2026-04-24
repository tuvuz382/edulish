"use client";

import { useState, useEffect, useRef } from "react";

interface Contact {
  id: number;
  name: string;
  role: string;
  email: string;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
  is_read: number;
}

export default function TeacherMessagesPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]     = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [search, setSearch]   = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Lấy danh sách liên hệ (Học sinh)
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch("/api/messages/contacts");
        const data = await res.json();
        if (data.success) setContacts(data.contacts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingContacts(false);
      }
    };
    fetchContacts();
  }, []);

  // Lấy lịch sử tin nhắn
  useEffect(() => {
    if (!activeId) return;
    
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages?withUserId=${activeId}`);
        const data = await res.json();
        if (data.success) setMessages(data.messages);
      } catch (err) {
        console.error(err);
      } finally {
        setTimeout(scrollToBottom, 50);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [activeId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeId) return;
    const content = input;
    setInput("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiver_id: activeId, content }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, {
          id: data.messageId,
          sender_id: 0, 
          receiver_id: activeId,
          content,
          created_at: new Date().toISOString(),
          is_read: 0
        }]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeContact = contacts.find(c => c.id === activeId);

  return (
    <div className="flex h-[calc(100vh-4rem)] animate-fade-in-up overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className={`flex w-full flex-col border-r border-slate-200 bg-white sm:w-72 lg:w-80 flex-shrink-0 ${activeId ? "hidden sm:flex" : "flex"}`}>
        <div className="border-b border-slate-200 p-4 bg-slate-50/50">
          <h2 className="font-bold text-slate-800">Học sinh liên hệ 💬</h2>
          <div className="mt-3 relative">
            <input 
              type="text" 
              placeholder="Tìm học sinh…" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-50 focus:border-emerald-400" 
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingContacts ? (
            <div className="p-4 text-center text-sm text-slate-400">Đang tải...</div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">Không tìm thấy học sinh nào.</div>
          ) : (
            filteredContacts.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`flex w-full items-center gap-3 px-4 py-4 text-left transition-all hover:bg-slate-50 ${
                  activeId === c.id ? "bg-emerald-50 border-r-4 border-emerald-500 shadow-sm" : ""
                }`}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-600">
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{c.name}</p>
                  <p className="truncate text-[10px] uppercase font-bold text-slate-400 tracking-wider">Học sinh</p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ── Main Chat ── */}
      <div className={`flex flex-1 flex-col bg-[#f8fafc] min-w-0 ${!activeId ? "hidden sm:flex" : "flex"}`}>
        {activeId && activeContact ? (
          <>
            <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm z-10">
              <button onClick={() => setActiveId(null)} className="mr-1 text-slate-400 hover:text-slate-600 sm:hidden">←</button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-600 flex-shrink-0">
                {activeContact.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{activeContact.name}</p>
                <p className="text-[10px] text-slate-400 font-medium uppercase">Đang trao đổi trực tiếp</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 opacity-30">
                  <div className="bg-emerald-100 p-6 rounded-full mb-4">
                    <span className="text-4xl">📧</span>
                  </div>
                  <p className="text-sm font-medium">Bắt đầu hỗ trợ học sinh ngay nào!</p>
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isMine = m.sender_id !== activeId;
                  return (
                    <div key={m.id || idx} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                        isMine 
                        ? "bg-emerald-600 text-white rounded-tr-sm" 
                        : "bg-white text-slate-700 rounded-tl-sm border border-slate-100"
                      }`}>
                        {m.content}
                        <p className={`text-[9px] mt-1 opacity-60 ${isMine ? "text-right" : "text-left"}`}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-slate-200 bg-white p-4">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Gửi phản hồi cho học sinh…"
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-50 transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 active:scale-95 disabled:opacity-40 transition-all"
                >
                  Gửi đi
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-slate-300 p-8 text-center">
            <div className="mb-6 relative">
              <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-10 rounded-full"></div>
              <span className="text-8xl relative z-10">👩‍🏫</span>
            </div>
            <h3 className="text-xl font-bold text-slate-700">Góc hỗ trợ Giáo viên</h3>
            <p className="mt-2 text-slate-400 max-w-xs text-sm">Hãy chọn một học sinh cần hỗ trợ từ danh sách bên trái để bắt đầu giải đáp thắc mắc.</p>
          </div>
        )}
      </div>
    </div>
  );
}

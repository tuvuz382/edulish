"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

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

function StudentMessagesContent() {
  const searchParams = useSearchParams();
  const toId = searchParams.get("to");

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeId, setActiveId] = useState<number | null>(toId ? parseInt(toId) : null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]     = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Lấy danh sách liên hệ (Giáo viên)
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

  // Lấy lịch sử tin nhắn khi chọn người nhận
  useEffect(() => {
    if (!activeId) return;
    
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await fetch(`/api/messages?withUserId=${activeId}`);
        const data = await res.json();
        if (data.success) setMessages(data.messages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMessages(false);
        setTimeout(scrollToBottom, 100);
      }
    };

    fetchMessages();
    
    // Polling đơn giản mỗi 5 giây để cập nhật tin nhắn mới
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [activeId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeId) return;

    const content = input;
    setInput(""); // Clear input ngay để tạo cảm giác mượt

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiver_id: activeId, content }),
      });
      const data = await res.json();
      if (data.success) {
        // Cập nhật local messages để hiện ngay lập tức
        const newMessage: Message = {
          id: data.messageId,
          sender_id: 0, // Sẽ được fetch lại đúng, tạm thời để 0 (hoặc lấy từ context user nếu có)
          receiver_id: activeId,
          content,
          created_at: new Date().toISOString(),
          is_read: 0
        };
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeContact = contacts.find(c => c.id === activeId);

  return (
    <div className="flex h-[calc(100vh-4rem)] animate-fade-in-up overflow-hidden">
      {/* ── Contact list ── */}
      <aside className={`flex w-full flex-col border-r border-slate-200 bg-white sm:w-72 lg:w-80 flex-shrink-0 ${activeId ? "hidden sm:flex" : "flex"}`}>
        <div className="border-b border-slate-200 p-4">
          <h2 className="font-bold text-slate-800">Tin nhắn hỗ trợ 💬</h2>
          <p className="text-xs text-slate-500 mt-1">Trao đổi trực tiếp với giáo viên</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingContacts ? (
            <div className="p-4 text-center text-sm text-slate-400">Đang tải danh sách...</div>
          ) : contacts.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">Không tìm thấy giáo viên liên quan.</div>
          ) : (
            contacts.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-slate-50 ${
                  activeId === c.id ? "bg-blue-50 border-r-4 border-blue-500" : ""
                }`}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{c.name}</p>
                  <p className="truncate text-[10px] uppercase font-bold text-slate-400 tracking-wider">{c.role}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ── Chat area ── */}
      <div className={`flex flex-1 flex-col bg-slate-50 min-w-0 ${!activeId ? "hidden sm:flex" : "flex"}`}>
        {activeId && activeContact ? (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm z-10">
              <button onClick={() => setActiveId(null)} className="mr-1 text-slate-400 hover:text-slate-600 sm:hidden">←</button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 flex-shrink-0">
                {activeContact.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{activeContact.name}</p>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <p className="text-[10px] text-slate-400 font-medium uppercase">{activeContact.role}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages && messages.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-10">Đang tải tin nhắn...</div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                  <span className="text-4xl mb-2">👋</span>
                  <p className="text-sm">Hãy gửi tin nhắn đầu tiên để trao đổi nhé!</p>
                </div>
              ) : (
                messages.map((m, idx) => {
                  // Giả định nếu sender_id != activeId thì là của mình
                  const isMine = m.sender_id !== activeId;
                  return (
                    <div key={m.id || idx} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                        isMine 
                        ? "bg-blue-600 text-white rounded-tr-sm" 
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

            {/* Input */}
            <div className="border-t border-slate-200 bg-white p-4">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Nhập nội dung trao đổi bài học…"
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-40"
                >
                  Gửi
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-slate-300">
            <div className="bg-white p-8 rounded-full shadow-inner mb-4">
              <span className="text-6xl">📬</span>
            </div>
            <p className="font-bold text-slate-500">Hộp thư trao đổi Edulish</p>
            <p className="mt-1 text-sm text-slate-400">Chọn một giáo viên bên trái để bắt đầu hỏi bài</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudentMessagesPage() {
  return (
    <Suspense fallback={<div className="flex h-[calc(100vh-4rem)] items-center justify-center text-slate-400">Đang tải...</div>}>
      <StudentMessagesContent />
    </Suspense>
  );
}

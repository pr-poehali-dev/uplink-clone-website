import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const LIVE_CHAT_URL = "https://functions.poehali.dev/baa85bce-d7a6-4cae-8aff-c94dd8c9c1d2";

interface Session {
  session_id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  created_at: string;
  last_message_at: string;
  is_closed: boolean;
  unread: number;
}

interface Message {
  id: number;
  sender: "visitor" | "operator";
  text: string;
  created_at: string;
  is_read: boolean;
}

interface LiveChatTabProps {
  token: string | null;
}

export function LiveChatTab({ token }: LiveChatTabProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadSessions = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${LIVE_CHAT_URL}?action=sessions`, {
        headers: { "X-Auth-Token": token },
      });
      const data = await res.json();
      if (data.sessions) setSessions(data.sessions);
    } catch (e) {
      console.warn("[LiveChatTab] loadSessions error", e);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (sessionId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${LIVE_CHAT_URL}?action=history&session_id=${sessionId}`, {
        headers: { "X-Auth-Token": token },
      });
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        setSessions(prev => prev.map(s => s.session_id === sessionId ? { ...s, unread: 0 } : s));
      }
    } catch (e) {
      console.warn("[LiveChatTab] loadHistory error", e);
    }
  };

  useEffect(() => {
    loadSessions();
    pollRef.current = setInterval(loadSessions, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (selectedSession) loadHistory(selectedSession);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSession]);

  const sendReply = async () => {
    const text = reply.trim();
    if (!text || !selectedSession || sending) return;
    setSending(true);
    setReply("");
    const tempMsg: Message = { id: Date.now(), sender: "operator", text, created_at: new Date().toISOString(), is_read: true };
    setMessages(prev => [...prev, tempMsg]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    try {
      await fetch(`${LIVE_CHAT_URL}?action=send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": token || "" },
        body: JSON.stringify({ text, session_id: selectedSession, sender: "operator" }),
      });
    } catch (e) {
      console.warn("[LiveChatTab] sendReply error", e);
    }
    setSending(false);
  };

  const closeSession = async (sessionId: string) => {
    try {
      await fetch(`${LIVE_CHAT_URL}?action=close&session_id=${sessionId}`, {
        method: "POST",
        headers: { "X-Auth-Token": token || "" },
      });
      setSessions(prev => prev.map(s => s.session_id === sessionId ? { ...s, is_closed: true } : s));
    } catch (e) {
      console.warn("[LiveChatTab] closeSession error", e);
    }
  };

  const totalUnread = sessions.reduce((acc, s) => acc + s.unread, 0);

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4">
      {/* Список сессий */}
      <div className="w-72 flex flex-col gap-2 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-white">Чаты {totalUnread > 0 && <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{totalUnread}</span>}</h2>
          <button onClick={loadSessions} className="text-cyan-400 hover:text-cyan-300 transition-colors">
            <Icon name="RefreshCw" size={14} />
          </button>
        </div>

        {loading && <p className="text-sm text-gray-400">Загрузка...</p>}
        {!loading && sessions.length === 0 && (
          <p className="text-sm text-gray-400">Пока нет диалогов</p>
        )}

        <div className="flex flex-col gap-1 overflow-y-auto">
          {sessions.map(s => (
            <button
              key={s.session_id}
              onClick={() => setSelectedSession(s.session_id)}
              className={`text-left rounded-xl px-3 py-2.5 transition-colors ${
                selectedSession === s.session_id
                  ? "bg-cyan-500/20 border border-cyan-500/40"
                  : "bg-white/5 hover:bg-white/10 border border-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white truncate">
                  {s.visitor_name || "Гость"}
                </span>
                <div className="flex items-center gap-1">
                  {s.unread > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">{s.unread}</span>
                  )}
                  {s.is_closed && <span className="text-xs text-gray-500">закрыт</span>}
                </div>
              </div>
              {s.visitor_email && <p className="text-xs text-gray-400 truncate">{s.visitor_email}</p>}
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(s.last_message_at).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Окно чата */}
      <div className="flex-1 flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-white/5">
        {!selectedSession ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Выберите диалог слева
          </div>
        ) : (
          <>
            {/* Шапка */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div>
                <span className="text-white font-medium">
                  {sessions.find(s => s.session_id === selectedSession)?.visitor_name || "Гость"}
                </span>
                <span className="text-xs text-gray-400 ml-2">
                  #{selectedSession.slice(0, 8)}
                </span>
              </div>
              {!sessions.find(s => s.session_id === selectedSession)?.is_closed && (
                <button
                  onClick={() => closeSession(selectedSession)}
                  className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <Icon name="X" size={12} /> Закрыть диалог
                </button>
              )}
            </div>

            {/* Сообщения */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === "operator" ? "justify-end" : "justify-start"}`}>
                  <div
                    className="max-w-[70%] rounded-2xl px-3 py-2 text-sm"
                    style={
                      msg.sender === "operator"
                        ? { background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", borderBottomRightRadius: "4px" }
                        : { background: "rgba(255,255,255,0.1)", color: "white", borderBottomLeftRadius: "4px" }
                    }
                  >
                    {msg.text}
                    <div className="text-xs opacity-50 mt-0.5 text-right">
                      {new Date(msg.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Поле ответа */}
            {!sessions.find(s => s.session_id === selectedSession)?.is_closed ? (
              <div className="flex items-end gap-2 p-3 border-t border-white/10">
                <textarea
                  rows={2}
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  placeholder="Написать ответ... (Enter — отправить)"
                  className="flex-1 resize-none rounded-xl px-3 py-2 text-sm bg-white/10 text-white placeholder-gray-400 outline-none border border-white/10 focus:border-cyan-500/50"
                />
                <button
                  onClick={sendReply}
                  disabled={!reply.trim() || sending}
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity"
                  style={{ background: "hsl(var(--primary))" }}
                >
                  <Icon name="Send" size={16} style={{ color: "hsl(var(--primary-foreground))" }} />
                </button>
              </div>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-400 border-t border-white/10 text-center">
                Диалог закрыт
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

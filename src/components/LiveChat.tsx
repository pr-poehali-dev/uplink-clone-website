import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

const LIVE_CHAT_URL = "https://functions.poehali.dev/baa85bce-d7a6-4cae-8aff-c94dd8c9c1d2";
const POLL_INTERVAL = 4000;
const SESSION_KEY = "live_chat_session_id";
const MAX_MSG_ID_KEY = "live_chat_last_id";

interface Message {
  id: number;
  sender: "visitor" | "operator";
  text: string;
  created_at: string;
}

type Step = "intro" | "chat";

export default function LiveChat() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("intro");
  const [name, setName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string>(() => localStorage.getItem(SESSION_KEY) || "");
  const [lastId, setLastId] = useState<number>(() => parseInt(localStorage.getItem(MAX_MSG_ID_KEY) || "0"));
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const poll = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`${LIVE_CHAT_URL}?action=poll&session_id=${sessionId}&since_id=${lastId}`);
      const data = await res.json();
      if (data.messages && data.messages.length > 0) {
        setMessages(prev => [...prev, ...data.messages]);
        const newMax = Math.max(...data.messages.map((m: Message) => m.id));
        setLastId(newMax);
        localStorage.setItem(MAX_MSG_ID_KEY, String(newMax));
        if (!open) setUnread(u => u + data.messages.length);
        scrollToBottom();
      }
    } catch (e) {
      console.warn("[LiveChat] poll error", e);
    }
  }, [sessionId, lastId, open]);

  useEffect(() => {
    if (sessionId) {
      setStep("chat");
      pollRef.current = setInterval(poll, POLL_INTERVAL);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(poll, POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [poll, sessionId]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      scrollToBottom();
    }
  }, [open]);

  const startChat = async () => {
    if (!name.trim()) return;
    const greeting = `Добрый день! Меня зовут ${name}.`;
    setSending(true);
    try {
      const res = await fetch(`${LIVE_CHAT_URL}?action=send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: greeting, name: name.trim() }),
      });
      const data = await res.json();
      if (data.session_id) {
        localStorage.setItem(SESSION_KEY, data.session_id);
        setSessionId(data.session_id);
        const msg: Message = { id: Date.now(), sender: "visitor", text: greeting, created_at: new Date().toISOString() };
        setMessages([msg]);
        setStep("chat");
      }
    } catch (e) {
      console.warn("[LiveChat] startChat error", e);
    }
    setSending(false);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !sessionId || sending) return;
    setInput("");
    setSending(true);
    const tempMsg: Message = { id: Date.now(), sender: "visitor", text, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);
    scrollToBottom();
    try {
      await fetch(`${LIVE_CHAT_URL}?action=send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, session_id: sessionId, name }),
      });
    } catch (e) {
      console.warn("[LiveChat] sendMessage error", e);
    }
    setSending(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      {/* Плавающая кнопка */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        style={{ background: "hsl(var(--primary))" }}
        aria-label="Открыть чат"
      >
        {open ? (
          <Icon name="X" size={24} style={{ color: "hsl(var(--primary-foreground))" }} />
        ) : (
          <Icon name="MessageCircle" size={26} style={{ color: "hsl(var(--primary-foreground))" }} />
        )}
        {unread > 0 && !open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </button>

      {/* Виджет чата */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", maxHeight: "480px" }}
        >
          {/* Шапка */}
          <div className="flex items-center gap-3 px-4 py-3" style={{ background: "hsl(var(--primary))" }}>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Icon name="Headset" size={18} style={{ color: "hsl(var(--primary-foreground))" }} />
            </div>
            <div>
              <div className="font-semibold text-sm" style={{ color: "hsl(var(--primary-foreground))" }}>Онлайн-чат</div>
              <div className="text-xs opacity-75" style={{ color: "hsl(var(--primary-foreground))" }}>Обычно отвечаем за несколько минут</div>
            </div>
          </div>

          {/* Шаг 1: Ввод имени */}
          {step === "intro" && (
            <div className="flex flex-col gap-4 p-5">
              <p className="text-sm" style={{ color: "hsl(var(--foreground))" }}>
                Привет! Как вас зовут?
              </p>
              <input
                autoFocus
                type="text"
                placeholder="Ваше имя"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && startChat()}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--border))" }}
              />
              <button
                onClick={startChat}
                disabled={!name.trim() || sending}
                className="w-full rounded-lg py-2 text-sm font-semibold transition-opacity disabled:opacity-50"
                style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
              >
                {sending ? "Подключение..." : "Начать чат"}
              </button>
            </div>
          )}

          {/* Шаг 2: Чат */}
          {step === "chat" && (
            <>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2" style={{ minHeight: 0, maxHeight: "300px" }}>
                {messages.length === 0 && (
                  <p className="text-xs text-center py-4" style={{ color: "hsl(var(--muted-foreground))" }}>
                    Напишите ваш вопрос — мы ответим в ближайшее время
                  </p>
                )}
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "visitor" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className="max-w-[75%] rounded-2xl px-3 py-2 text-sm"
                      style={
                        msg.sender === "visitor"
                          ? { background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", borderBottomRightRadius: "4px" }
                          : { background: "hsl(var(--secondary))", color: "hsl(var(--foreground))", borderBottomLeftRadius: "4px" }
                      }
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Поле ввода */}
              <div className="flex items-end gap-2 p-3" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                <textarea
                  rows={1}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Написать сообщение..."
                  className="flex-1 resize-none rounded-xl px-3 py-2 text-sm outline-none"
                  style={{
                    background: "hsl(var(--secondary))",
                    color: "hsl(var(--foreground))",
                    border: "1px solid hsl(var(--border))",
                    maxHeight: "80px",
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity disabled:opacity-40"
                  style={{ background: "hsl(var(--primary))" }}
                >
                  <Icon name="Send" size={16} style={{ color: "hsl(var(--primary-foreground))" }} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
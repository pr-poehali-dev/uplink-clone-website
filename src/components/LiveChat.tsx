import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

const LIVE_CHAT_URL = "https://functions.poehali.dev/baa85bce-d7a6-4cae-8aff-c94dd8c9c1d2";
const POLL_INTERVAL = 4000;
const SESSION_KEY = "live_chat_session_id";
const SESSION_TS_KEY = "live_chat_session_ts";
const MAX_MSG_ID_KEY = "live_chat_last_id";
const SESSION_TTL_MS = 3 * 60 * 60 * 1000; // 3 часа

function getSavedSession(): string {
  const sid = localStorage.getItem(SESSION_KEY) || "";
  const ts = parseInt(localStorage.getItem(SESSION_TS_KEY) || "0");
  if (sid && ts && Date.now() - ts < SESSION_TTL_MS) return sid;
  if (sid) {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_TS_KEY);
    localStorage.removeItem(MAX_MSG_ID_KEY);
  }
  return "";
}

interface Message {
  id: number;
  sender: "visitor" | "operator";
  text: string;
  created_at: string;
}

interface ChatSettings {
  welcome_text: string;
  services: string;
  header_title: string;
  header_subtitle: string;
}

type Step = "welcome" | "form" | "chat";

export default function LiveChat() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("welcome");
  const [selectedService, setSelectedService] = useState("");
  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const [lastId, setLastId] = useState<number>(() => parseInt(localStorage.getItem(MAX_MSG_ID_KEY) || "0"));
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const [settings, setSettings] = useState<ChatSettings | null>(null);
  const [restoringSession, setRestoringSession] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Фоновая сессия — существует даже если форма показана заново
  const bgSessionId = useRef<string>(getSavedSession());

  // Загружаем настройки с бэкенда
  useEffect(() => {
    fetch(`${LIVE_CHAT_URL}?action=settings`)
      .then(r => r.json())
      .then(d => { if (d.settings) setSettings(d.settings); })
      .catch(() => {});
  }, []);

  // Восстанавливаем сессию после обновления страницы
  useEffect(() => {
    const saved = getSavedSession();
    if (!saved) return;
    setRestoringSession(true);
    fetch(`${LIVE_CHAT_URL}?action=history&public=1&session_id=${saved}`)
      .then(r => r.json())
      .then(d => {
        if (d.messages && d.messages.length > 0) {
          setMessages(d.messages);
          const maxId = Math.max(...d.messages.map((m: Message) => m.id));
          setLastId(maxId);
          localStorage.setItem(MAX_MSG_ID_KEY, String(maxId));
        }
        setSessionId(saved);
        bgSessionId.current = saved;
        setStep("chat");
      })
      .catch(() => {})
      .finally(() => setRestoringSession(false));
   
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const servicesList = settings?.services
    ? settings.services.split(",").map(s => s.trim()).filter(Boolean)
    : ["IT-аутсорсинг", "Видеонаблюдение", "Администрирование серверов", "Монтаж ЛВС / СКС", "IP-телефония", "Вызов IT-специалиста", "Другой вопрос"];

  // ----------------------------------------------------------------
  // Polling активной сессии
  // ----------------------------------------------------------------
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

  // Фоновый polling — работает пока форма показана заново
  const bgPoll = useCallback(async () => {
    const sid = bgSessionId.current;
    if (!sid) return;
    try {
      const storedLastId = parseInt(localStorage.getItem(MAX_MSG_ID_KEY) || "0");
      const res = await fetch(`${LIVE_CHAT_URL}?action=poll&session_id=${sid}&since_id=${storedLastId}`);
      const data = await res.json();
      if (data.messages && data.messages.length > 0) {
        const newMax = Math.max(...data.messages.map((m: Message) => m.id));
        localStorage.setItem(MAX_MSG_ID_KEY, String(newMax));
        setLastId(newMax);
        setMessages(prev => [...prev, ...data.messages]);
        setUnread(u => u + data.messages.length);
        // Пришёл ответ — переключаем в чат
        setStep("chat");
        setSessionId(bgSessionId.current);
        scrollToBottom();
      }
    } catch (e) {
      console.warn("[LiveChat] bgPoll error", e);
    }
  }, []);

  // Запускаем фоновый polling при монтировании если есть сессия
  useEffect(() => {
    if (bgSessionId.current) {
      pollRef.current = setInterval(bgPoll, POLL_INTERVAL);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Переключаем на основной polling когда сессия активна
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

  // ----------------------------------------------------------------
  // Отправка первого сообщения
  // ----------------------------------------------------------------
  const startChat = async () => {
    if (!name.trim() || !question.trim() || !selectedService) return;
    setSending(true);
    try {
      const res = await fetch(`${LIVE_CHAT_URL}?action=send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: question.trim(),
          name: name.trim(),
          service_topic: selectedService,
        }),
      });
      const data = await res.json();
      if (data.session_id) {
        localStorage.setItem(SESSION_KEY, data.session_id);
        localStorage.setItem(SESSION_TS_KEY, String(Date.now()));
        bgSessionId.current = data.session_id;
        setSessionId(data.session_id);
        const msg: Message = { id: Date.now(), sender: "visitor", text: question.trim(), created_at: new Date().toISOString() };
        setMessages([msg]);
        setStep("chat");
      }
    } catch (e) {
      console.warn("[LiveChat] startChat error", e);
    }
    setSending(false);
  };

  // ----------------------------------------------------------------
  // Отправка следующих сообщений
  // ----------------------------------------------------------------
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

  const canSubmit = name.trim().length > 0 && question.trim().length > 0 && selectedService !== "";

  return (
    <>
      {/* Плавающая кнопка */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        style={{ background: "hsl(var(--primary))" }}
        aria-label="Открыть чат"
      >
        {open
          ? <Icon name="X" size={24} style={{ color: "hsl(var(--primary-foreground))" }} />
          : <Icon name="MessageCircle" size={26} style={{ color: "hsl(var(--primary-foreground))" }} />
        }
        {unread > 0 && !open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </button>

      {/* Виджет */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", maxHeight: "560px" }}
        >
          {/* Шапка */}
          <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ background: "hsl(var(--primary))" }}>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Icon name="Headset" size={18} style={{ color: "hsl(var(--primary-foreground))" }} />
            </div>
            <div>
              <div className="font-semibold text-sm" style={{ color: "hsl(var(--primary-foreground))" }}>
                {settings?.header_title || "Онлайн-чат"}
              </div>
              <div className="text-xs opacity-75" style={{ color: "hsl(var(--primary-foreground))" }}>
                {settings?.header_subtitle || "Обычно отвечаем за несколько минут"}
              </div>
            </div>
          </div>

          {/* ШАГ 1: Приветствие + выбор услуги */}
          {step === "welcome" && (
            <div className="flex flex-col overflow-y-auto" style={{ maxHeight: "460px" }}>
              <div className="px-4 pt-4 pb-2">
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "hsl(var(--foreground))" }}>
                  {settings?.welcome_text || "Добро пожаловать! Выберите тему обращения:"}
                </p>
              </div>
              <div className="flex flex-col gap-1.5 px-4 pb-4">
                {servicesList.map(service => (
                  <button
                    key={service}
                    onClick={() => { setSelectedService(service); setStep("form"); }}
                    className="text-left text-sm px-3 py-2.5 rounded-xl transition-all hover:scale-[1.02]"
                    style={{
                      background: "hsl(var(--secondary))",
                      color: "hsl(var(--foreground))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ШАГ 2: Имя + вопрос */}
          {step === "form" && (
            <div className="flex flex-col gap-3 p-4 overflow-y-auto" style={{ maxHeight: "460px" }}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep("welcome")}
                  className="text-xs flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity"
                  style={{ color: "hsl(var(--foreground))" }}
                >
                  <Icon name="ChevronLeft" size={14} /> Назад
                </button>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: "hsl(var(--primary) / 0.2)", color: "hsl(var(--primary))" }}
                >
                  {selectedService}
                </span>
              </div>

              <p className="text-sm" style={{ color: "hsl(var(--foreground))" }}>
                Как вас зовут и в чём вопрос?
              </p>

              <input
                autoFocus
                type="text"
                placeholder="Ваше имя"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--border))" }}
              />

              <textarea
                rows={3}
                placeholder="Опишите ваш вопрос..."
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && canSubmit) { e.preventDefault(); startChat(); } }}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
                style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--border))" }}
              />

              <button
                onClick={startChat}
                disabled={!canSubmit || sending}
                className="w-full rounded-lg py-2 text-sm font-semibold transition-opacity disabled:opacity-40"
                style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
              >
                {sending ? "Отправляем..." : "Начать диалог"}
              </button>
            </div>
          )}

          {/* ШАГ 3: Чат */}
          {step === "chat" && (
            <>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2" style={{ minHeight: 0, maxHeight: "360px" }}>
                {messages.length === 0 && (
                  <p className="text-xs text-center py-4" style={{ color: "hsl(var(--muted-foreground))" }}>
                    Ваш вопрос отправлен — ответим в ближайшее время
                  </p>
                )}
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === "visitor" ? "justify-end" : "justify-start"}`}>
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

              <div className="flex items-end gap-2 p-3 flex-shrink-0" style={{ borderTop: "1px solid hsl(var(--border))" }}>
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
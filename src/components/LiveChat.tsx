import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

const LIVE_CHAT_URL = "https://functions.poehali.dev/baa85bce-d7a6-4cae-8aff-c94dd8c9c1d2";
const POLL_INTERVAL = 4000;
const SESSION_KEY = "live_chat_session_id";
const SESSION_TS_KEY = "live_chat_session_ts";
const MAX_MSG_ID_KEY = "live_chat_last_id";
// Время бездействия клиента до сброса чата (настраивается из админки).
// По умолчанию 10 минут; обновляется после загрузки настроек.
const DEFAULT_INACTIVITY_MIN = 10;
let inactivityMs = DEFAULT_INACTIVITY_MIN * 60 * 1000;

function setInactivityMinutes(min: number) {
  if (min && min > 0) inactivityMs = min * 60 * 1000;
}

function touchActivity() {
  localStorage.setItem(SESSION_TS_KEY, String(Date.now()));
}

function clearSessionStorage() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_TS_KEY);
  localStorage.removeItem(MAX_MSG_ID_KEY);
}

function getSavedSession(): string {
  const sid = localStorage.getItem(SESSION_KEY) || "";
  if (!sid) return "";
  const ts = parseInt(localStorage.getItem(SESSION_TS_KEY) || "0");
  // Если ts нет — сессия создана до нашего обновления, считаем её живой и ставим ts сейчас
  if (!ts) {
    touchActivity();
    return sid;
  }
  // Сброс при бездействии клиента дольше заданного времени
  if (Date.now() - ts < inactivityMs) return sid;
  clearSessionStorage();
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
  inactivity_minutes?: string;
}

type Step = "welcome" | "form" | "chat";

// Маска телефона: +7 (XXX) XXX-XX-XX
function formatPhone(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (!d.startsWith("7")) d = "7" + d;
  d = d.slice(0, 11);
  let res = "+7";
  if (d.length > 1) res += " (" + d.slice(1, 4);
  if (d.length >= 4) res += ") " + d.slice(4, 7);
  if (d.length >= 7) res += "-" + d.slice(7, 9);
  if (d.length >= 9) res += "-" + d.slice(9, 11);
  return res;
}

function isPhoneValid(phone: string): boolean {
  return phone.replace(/\D/g, "").length === 11;
}

function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function LiveChat() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("welcome");
  const [selectedService, setSelectedService] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+7");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState({ name: false, phone: false, email: false });
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const [lastId, setLastId] = useState<number>(() => parseInt(localStorage.getItem(MAX_MSG_ID_KEY) || "0"));
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const [settings, setSettings] = useState<ChatSettings | null>(null);
  const [restoringSession, setRestoringSession] = useState(false);
  const [expiredNotice, setExpiredNotice] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Фоновая сессия — существует даже если форма показана заново
  const bgSessionId = useRef<string>(getSavedSession());

  // Сброс чата к форме приветствия (при бездействии клиента 10 минут)
  const resetChat = useCallback(() => {
    clearSessionStorage();
    bgSessionId.current = "";
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    setSessionId("");
    setMessages([]);
    setLastId(0);
    setInput("");
    setName("");
    setPhone("+7");
    setEmail("");
    setTouched({ name: false, phone: false, email: false });
    setQuestion("");
    setSelectedService("");
    setUnread(0);
    setExpiredNotice(false);
    setStep("welcome");
  }, []);

  // Завершение диалога по неактивности: показываем уведомление, затем сбрасываем
  const expireChat = useCallback(() => {
    // Чистим хранилище сразу, чтобы сессия не восстановилась
    clearSessionStorage();
    bgSessionId.current = "";
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    setSessionId("");
    setExpiredNotice(true);
    // Через 3.5 сек сбрасываем чат к форме приветствия
    setTimeout(() => resetChat(), 3500);
  }, [resetChat]);

  // Таймер бездействия: проверяем, не молчит ли клиент дольше 10 минут
  useEffect(() => {
    const check = () => {
      const sid = localStorage.getItem(SESSION_KEY);
      if (!sid) return;
      const ts = parseInt(localStorage.getItem(SESSION_TS_KEY) || "0");
      if (ts && Date.now() - ts >= inactivityMs) {
        expireChat();
      }
    };
    const timer = setInterval(check, 30 * 1000); // проверка каждые 30 сек
    return () => clearInterval(timer);
  }, [expireChat]);

  // Загружаем настройки с бэкенда
  useEffect(() => {
    fetch(`${LIVE_CHAT_URL}?action=settings`)
      .then(r => r.json())
      .then(d => {
        if (d.settings) {
          setSettings(d.settings);
          const min = parseInt(d.settings.inactivity_minutes || "");
          if (min > 0) setInactivityMinutes(min);
        }
      })
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
    if (!isPhoneValid(phone) || !isEmailValid(email)) {
      setTouched({ name: true, phone: true, email: true });
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${LIVE_CHAT_URL}?action=send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: question.trim(),
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          service_topic: selectedService,
        }),
      });
      const data = await res.json();
      if (data.session_id) {
        localStorage.setItem(SESSION_KEY, data.session_id);
        touchActivity();
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
    touchActivity(); // клиент активен — продлеваем сессию
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

  const canSubmit = name.trim().length > 0 && question.trim().length > 0 && selectedService !== ""
    && isPhoneValid(phone) && isEmailValid(email);

  return (
    <>
      {/* Плавающая кнопка */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-110 bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-lg shadow-cyan-500/40"
        aria-label="Открыть чат"
      >
        {open
          ? <Icon name="X" size={24} className="text-[#080c14]" />
          : <Icon name="MessageCircle" size={26} className="text-[#080c14]" />
        }
        {unread > 0 && !open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold border-2 border-[#080c14]">
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

          {/* Уведомление о завершении диалога по неактивности */}
          {expiredNotice && (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-1" style={{ background: "hsl(var(--secondary))" }}>
                <Icon name="Clock" size={24} className="text-cyan-400" />
              </div>
              <p className="text-sm font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                Диалог завершён из-за неактивности
              </p>
              <p className="text-xs opacity-70" style={{ color: "hsl(var(--foreground))" }}>
                Начинаем заново — сейчас откроется форма обращения
              </p>
            </div>
          )}

          {/* ШАГ 1: Приветствие + выбор услуги */}
          {!expiredNotice && step === "welcome" && (
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
          {!expiredNotice && step === "form" && (
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
                Заполните контакты и опишите вопрос:
              </p>

              <div>
                <input
                  autoFocus
                  type="text"
                  placeholder="Ваше имя *"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, name: true }))}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{
                    background: "hsl(var(--secondary))",
                    color: "hsl(var(--foreground))",
                    border: `1px solid ${touched.name && !name.trim() ? "rgba(239,68,68,0.6)" : "hsl(var(--border))"}`,
                  }}
                />
              </div>

              <div>
                <input
                  type="tel"
                  inputMode="tel"
                  placeholder="+7 (___) ___-__-__ *"
                  value={phone}
                  onChange={e => setPhone(formatPhone(e.target.value))}
                  onBlur={() => setTouched(t => ({ ...t, phone: true }))}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{
                    background: "hsl(var(--secondary))",
                    color: "hsl(var(--foreground))",
                    border: `1px solid ${touched.phone && !isPhoneValid(phone) ? "rgba(239,68,68,0.6)" : "hsl(var(--border))"}`,
                  }}
                />
                {touched.phone && !isPhoneValid(phone) && (
                  <p className="text-xs mt-1" style={{ color: "rgb(248,113,113)" }}>Введите корректный номер телефона</p>
                )}
              </div>

              <div>
                <input
                  type="email"
                  inputMode="email"
                  placeholder="E-mail *"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, email: true }))}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{
                    background: "hsl(var(--secondary))",
                    color: "hsl(var(--foreground))",
                    border: `1px solid ${touched.email && !isEmailValid(email) ? "rgba(239,68,68,0.6)" : "hsl(var(--border))"}`,
                  }}
                />
                {touched.email && !isEmailValid(email) && (
                  <p className="text-xs mt-1" style={{ color: "rgb(248,113,113)" }}>Введите корректный e-mail</p>
                )}
              </div>

              <textarea
                rows={3}
                placeholder="Опишите ваш вопрос... *"
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
          {!expiredNotice && step === "chat" && (
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
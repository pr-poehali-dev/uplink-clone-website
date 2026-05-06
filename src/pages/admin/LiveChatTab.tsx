import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const LIVE_CHAT_URL = "https://functions.poehali.dev/baa85bce-d7a6-4cae-8aff-c94dd8c9c1d2";
const WEBHOOK_URL = `${LIVE_CHAT_URL}?action=webhook`;

interface Session {
  session_id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  created_at: string;
  last_message_at: string;
  is_closed: boolean;
  service_topic: string | null;
  maax_chat_id: string | null;
  unread: number;
}

interface Message {
  id: number;
  sender: "visitor" | "operator";
  text: string;
  created_at: string;
  is_read: boolean;
}

interface ChatSettings {
  welcome_text: string;
  services: string;
  header_title: string;
  header_subtitle: string;
}

interface LiveChatTabProps {
  token: string | null;
}

type AdminTab = "chats" | "settings";

export function LiveChatTab({ token }: LiveChatTabProps) {
  const [adminTab, setAdminTab] = useState<AdminTab>("chats");

  // --- Чаты ---
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [deletingSession, setDeletingSession] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "open" | "closed">("open");
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Настройки ---
  const [settings, setSettings] = useState<ChatSettings>({
    welcome_text: "",
    services: "",
    header_title: "",
    header_subtitle: "",
  });
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // --- Вебхук ---
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);
  const [registeringWebhook, setRegisteringWebhook] = useState(false);

  // ================================================================
  // Загрузка сессий
  // ================================================================
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
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    loadSessions();
    pollRef.current = setInterval(loadSessions, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ================================================================
  // История
  // ================================================================
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
    if (selectedSession) loadHistory(selectedSession);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSession]);

  // ================================================================
  // Отправка ответа
  // ================================================================
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

  // ================================================================
  // Закрыть / удалить диалог
  // ================================================================
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

  const deleteSession = async (sessionId: string) => {
    if (!confirm("Удалить диалог? Все сообщения будут удалены безвозвратно.")) return;
    setDeletingSession(sessionId);
    try {
      await fetch(`${LIVE_CHAT_URL}?action=delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": token || "" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      setSessions(prev => prev.filter(s => s.session_id !== sessionId));
      if (selectedSession === sessionId) {
        setSelectedSession(null);
        setMessages([]);
      }
    } catch (e) {
      console.warn("[LiveChatTab] deleteSession error", e);
    }
    setDeletingSession(null);
  };

  // ================================================================
  // Настройки
  // ================================================================
  const loadSettings = async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch(`${LIVE_CHAT_URL}?action=settings`);
      const data = await res.json();
      if (data.settings) setSettings(data.settings as ChatSettings);
    } catch (e) {
      console.warn("[LiveChatTab] loadSettings error", e);
    }
    setLoadingSettings(false);
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await fetch(`${LIVE_CHAT_URL}?action=settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": token || "" },
        body: JSON.stringify({ settings }),
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (e) {
      console.warn("[LiveChatTab] saveSettings error", e);
    }
    setSavingSettings(false);
  };

  useEffect(() => {
    if (adminTab === "settings") loadSettings();
  }, [adminTab]);

  // ================================================================
  // Вебхук
  // ================================================================
  const registerWebhook = async () => {
    setRegisteringWebhook(true);
    setWebhookStatus(null);
    try {
      const res = await fetch(`${LIVE_CHAT_URL}?action=register_webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": token || "" },
        body: JSON.stringify({ webhook_url: WEBHOOK_URL }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setWebhookStatus("✅ Вебхук зарегистрирован. Ответы из MAX теперь доставляются мгновенно.");
      } else {
        setWebhookStatus(`❌ Ошибка: ${data.error || JSON.stringify(data)}`);
      }
    } catch {
      setWebhookStatus("❌ Ошибка соединения");
    }
    setRegisteringWebhook(false);
  };

  // ================================================================
  // Фильтр и счётчики
  // ================================================================
  const filteredSessions = sessions.filter(s => {
    if (filter === "open") return !s.is_closed;
    if (filter === "closed") return s.is_closed;
    return true;
  });
  const totalUnread = sessions.reduce((acc, s) => acc + s.unread, 0);
  const selectedSessionData = sessions.find(s => s.session_id === selectedSession);

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.1)",
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Вкладки */}
      <div className="flex gap-1 mb-4 bg-white/5 rounded-xl p-1 w-fit">
        {([["chats", "MessageSquare", "Диалоги"], ["settings", "Settings", "Настройки"]] as const).map(([tab, icon, label]) => (
          <button
            key={tab}
            onClick={() => setAdminTab(tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              adminTab === tab ? "bg-white/15 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Icon name={icon} size={14} />
            {label}
            {tab === "chats" && totalUnread > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">{totalUnread}</span>
            )}
          </button>
        ))}
      </div>

      {/* ====== ВКЛАДКА: ДИАЛОГИ ====== */}
      {adminTab === "chats" && (
        <div className="flex flex-1 gap-4 min-h-0">
          {/* Список сессий */}
          <div className="w-72 flex flex-col gap-2 flex-shrink-0 min-h-0">
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {(["open", "closed", "all"] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                      filter === f ? "bg-white/20 text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {f === "open" ? "Открытые" : f === "closed" ? "Закрытые" : "Все"}
                  </button>
                ))}
              </div>
              <button onClick={loadSessions} className="text-gray-400 hover:text-cyan-400 transition-colors">
                <Icon name="RefreshCw" size={13} />
              </button>
            </div>

            {loadingSessions && <p className="text-sm text-gray-400 text-center py-4">Загрузка...</p>}
            {!loadingSessions && filteredSessions.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Нет диалогов</p>
            )}

            <div className="flex flex-col gap-1 overflow-y-auto flex-1">
              {filteredSessions.map(s => (
                <div key={s.session_id} className="relative group">
                  <button
                    onClick={() => setSelectedSession(s.session_id)}
                    className={`w-full text-left rounded-xl px-3 py-2.5 pr-8 transition-colors ${
                      selectedSession === s.session_id
                        ? "bg-cyan-500/20 border border-cyan-500/40"
                        : "bg-white/5 hover:bg-white/10 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white truncate">{s.visitor_name || "Гость"}</span>
                      <div className="flex items-center gap-1">
                        {s.unread > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">{s.unread}</span>
                        )}
                        {s.is_closed && <span className="text-xs text-gray-500">закрыт</span>}
                      </div>
                    </div>
                    {s.service_topic && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: "hsl(var(--primary))" }}>{s.service_topic}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(s.last_message_at).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </button>
                  {/* Кнопка удалить */}
                  <button
                    onClick={() => deleteSession(s.session_id)}
                    disabled={deletingSession === s.session_id}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                    title="Удалить диалог"
                  >
                    <Icon name="Trash2" size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Окно чата */}
          <div className="flex-1 flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-white/5 min-h-0">
            {!selectedSession ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
                <Icon name="MessageSquare" size={32} />
                <p className="text-sm">Выберите диалог слева</p>
              </div>
            ) : (
              <>
                {/* Шапка чата */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
                  <div>
                    <span className="text-white font-medium">{selectedSessionData?.visitor_name || "Гость"}</span>
                    {selectedSessionData?.service_topic && (
                      <span className="text-xs ml-2 px-2 py-0.5 rounded-full" style={{ background: "hsl(var(--primary)/0.2)", color: "hsl(var(--primary))" }}>
                        {selectedSessionData.service_topic}
                      </span>
                    )}
                    <span className="text-xs text-gray-500 ml-2">#{selectedSession.slice(0, 8)}</span>
                    {selectedSessionData?.maax_chat_id && (
                      <span className="text-xs text-gray-600 ml-2">chat:{selectedSessionData.maax_chat_id.toString().slice(-6)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!selectedSessionData?.is_closed && (
                      <button
                        onClick={() => closeSession(selectedSession)}
                        className="text-xs text-gray-400 hover:text-yellow-400 transition-colors flex items-center gap-1"
                      >
                        <Icon name="CheckCircle" size={13} /> Закрыть
                      </button>
                    )}
                    <button
                      onClick={() => deleteSession(selectedSession)}
                      className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1"
                    >
                      <Icon name="Trash2" size={13} /> Удалить
                    </button>
                  </div>
                </div>

                {/* Сообщения */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 min-h-0">
                  {messages.length === 0 && (
                    <p className="text-xs text-center text-gray-500 py-4">Нет сообщений</p>
                  )}
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === "operator" ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[70%]">
                        <div
                          className="rounded-2xl px-3 py-2 text-sm"
                          style={
                            msg.sender === "operator"
                              ? { background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", borderBottomRightRadius: "4px" }
                              : { background: "rgba(255,255,255,0.1)", color: "#fff", borderBottomLeftRadius: "4px" }
                          }
                        >
                          {msg.text}
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5 px-1">
                          {new Date(msg.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Поле ответа */}
                {!selectedSessionData?.is_closed ? (
                  <div className="flex items-end gap-2 p-3 border-t border-white/10 flex-shrink-0">
                    <textarea
                      rows={1}
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                      placeholder="Ответить клиенту..."
                      className="flex-1 resize-none rounded-xl px-3 py-2 text-sm outline-none"
                      style={{ ...inputStyle, maxHeight: "100px" }}
                    />
                    <button
                      onClick={sendReply}
                      disabled={!reply.trim() || sending}
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity disabled:opacity-40"
                      style={{ background: "hsl(var(--primary))" }}
                    >
                      <Icon name="Send" size={15} style={{ color: "hsl(var(--primary-foreground))" }} />
                    </button>
                  </div>
                ) : (
                  <div className="px-4 py-3 border-t border-white/10 text-center text-xs text-gray-500 flex-shrink-0">
                    Диалог закрыт
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ====== ВКЛАДКА: НАСТРОЙКИ ====== */}
      {adminTab === "settings" && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl flex flex-col gap-6">

            {/* Вебхук MAX */}
            <div className="rounded-2xl p-5 border border-white/10 bg-white/5">
              <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                <Icon name="Zap" size={16} /> Подключение MAX
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                Регистрирует вебхук в боте MAX. Без этого ответы из MAX не доставляются клиентам.
                Нужно выполнить один раз после смены URL функции.
              </p>
              <button
                onClick={registerWebhook}
                disabled={registeringWebhook}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-opacity disabled:opacity-50"
                style={{ background: "rgba(6,182,212,0.2)", color: "#22d3ee", border: "1px solid rgba(6,182,212,0.3)" }}
              >
                <Icon name="Zap" size={14} />
                {registeringWebhook ? "Регистрация..." : "Зарегистрировать вебхук"}
              </button>
              {webhookStatus && (
                <p className={`text-sm mt-3 px-3 py-2 rounded-lg ${webhookStatus.startsWith("✅") ? "bg-green-500/15 text-green-300" : "bg-red-500/15 text-red-300"}`}>
                  {webhookStatus}
                </p>
              )}
            </div>

            {/* Текст виджета */}
            {loadingSettings ? (
              <p className="text-gray-400 text-sm">Загрузка настроек...</p>
            ) : (
              <>
                <div className="rounded-2xl p-5 border border-white/10 bg-white/5 flex flex-col gap-4">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Icon name="MessageCircle" size={16} /> Виджет чата
                  </h3>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400">Заголовок</label>
                    <input
                      value={settings.header_title}
                      onChange={e => setSettings(s => ({ ...s, header_title: e.target.value }))}
                      className="rounded-xl px-3 py-2 text-sm outline-none"
                      style={inputStyle}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400">Подзаголовок</label>
                    <input
                      value={settings.header_subtitle}
                      onChange={e => setSettings(s => ({ ...s, header_subtitle: e.target.value }))}
                      className="rounded-xl px-3 py-2 text-sm outline-none"
                      style={inputStyle}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400">Приветственное сообщение</label>
                    <textarea
                      rows={3}
                      value={settings.welcome_text}
                      onChange={e => setSettings(s => ({ ...s, welcome_text: e.target.value }))}
                      className="rounded-xl px-3 py-2 text-sm outline-none resize-none"
                      style={inputStyle}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400">
                      Список услуг <span className="text-gray-600">(каждая с новой строки или через запятую)</span>
                    </label>
                    <textarea
                      rows={6}
                      value={settings.services.split(",").join("\n")}
                      onChange={e => setSettings(s => ({
                        ...s,
                        services: e.target.value.split("\n").map(v => v.trim()).filter(Boolean).join(","),
                      }))}
                      className="rounded-xl px-3 py-2 text-sm outline-none resize-none font-mono"
                      style={inputStyle}
                      placeholder={"IT-аутсорсинг\nВидеонаблюдение\nДругой вопрос"}
                    />
                  </div>
                </div>

                <button
                  onClick={saveSettings}
                  disabled={savingSettings}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50 w-fit"
                  style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
                >
                  <Icon name={settingsSaved ? "Check" : "Save"} size={15} />
                  {settingsSaved ? "Сохранено!" : savingSettings ? "Сохранение..." : "Сохранить настройки"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

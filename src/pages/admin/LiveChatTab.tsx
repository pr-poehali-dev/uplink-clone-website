import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { ChatSessionList } from "./ChatSessionList";
import { ChatWindow } from "./ChatWindow";
import { ChatSettingsTab } from "./ChatSettingsTab";

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
  // Счётчики
  // ================================================================
  const totalUnread = sessions.reduce((acc, s) => acc + s.unread, 0);
  const selectedSessionData = sessions.find(s => s.session_id === selectedSession);

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
          <ChatSessionList
            sessions={sessions}
            selectedSession={selectedSession}
            filter={filter}
            loadingSessions={loadingSessions}
            deletingSession={deletingSession}
            onSelectSession={setSelectedSession}
            onFilterChange={setFilter}
            onRefresh={loadSessions}
            onDelete={deleteSession}
          />
          <ChatWindow
            selectedSession={selectedSession}
            selectedSessionData={selectedSessionData}
            messages={messages}
            reply={reply}
            sending={sending}
            bottomRef={bottomRef}
            onReplyChange={setReply}
            onSendReply={sendReply}
            onClose={closeSession}
            onDelete={deleteSession}
          />
        </div>
      )}

      {/* ====== ВКЛАДКА: НАСТРОЙКИ ====== */}
      {adminTab === "settings" && (
        <ChatSettingsTab
          settings={settings}
          loadingSettings={loadingSettings}
          savingSettings={savingSettings}
          settingsSaved={settingsSaved}
          webhookStatus={webhookStatus}
          registeringWebhook={registeringWebhook}
          onSettingsChange={setSettings}
          onSaveSettings={saveSettings}
          onRegisterWebhook={registerWebhook}
        />
      )}
    </div>
  );
}

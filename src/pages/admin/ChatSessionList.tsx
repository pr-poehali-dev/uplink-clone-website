import Icon from "@/components/ui/icon";

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

interface ChatSessionListProps {
  sessions: Session[];
  selectedSession: string | null;
  filter: "all" | "open" | "closed";
  loadingSessions: boolean;
  deletingSession: string | null;
  onSelectSession: (id: string) => void;
  onFilterChange: (f: "all" | "open" | "closed") => void;
  onRefresh: () => void;
  onDelete: (id: string) => void;
}

export function ChatSessionList({
  sessions,
  selectedSession,
  filter,
  loadingSessions,
  deletingSession,
  onSelectSession,
  onFilterChange,
  onRefresh,
  onDelete,
}: ChatSessionListProps) {
  const filteredSessions = sessions.filter(s => {
    if (filter === "open") return !s.is_closed;
    if (filter === "closed") return s.is_closed;
    return true;
  });

  return (
    <div className="w-72 flex flex-col gap-2 flex-shrink-0 min-h-0">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {(["open", "closed", "all"] as const).map(f => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                filter === f ? "bg-white/20 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {f === "open" ? "Открытые" : f === "closed" ? "Закрытые" : "Все"}
            </button>
          ))}
        </div>
        <button onClick={onRefresh} className="text-gray-400 hover:text-cyan-400 transition-colors">
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
              onClick={() => onSelectSession(s.session_id)}
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
            <button
              onClick={() => onDelete(s.session_id)}
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
  );
}

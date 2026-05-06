import { useRef } from "react";
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

interface Message {
  id: number;
  sender: "visitor" | "operator";
  text: string;
  created_at: string;
  is_read: boolean;
}

interface ChatWindowProps {
  selectedSession: string | null;
  selectedSessionData: Session | undefined;
  messages: Message[];
  reply: string;
  sending: boolean;
  bottomRef: React.RefObject<HTMLDivElement>;
  onReplyChange: (v: string) => void;
  onSendReply: () => void;
  onClose: (id: string) => void;
  onDelete: (id: string) => void;
}

const inputStyle = {
  background: "rgba(255,255,255,0.05)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.1)",
};

export function ChatWindow({
  selectedSession,
  selectedSessionData,
  messages,
  reply,
  sending,
  bottomRef,
  onReplyChange,
  onSendReply,
  onClose,
  onDelete,
}: ChatWindowProps) {
  return (
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
                  onClick={() => onClose(selectedSession)}
                  className="text-xs text-gray-400 hover:text-yellow-400 transition-colors flex items-center gap-1"
                >
                  <Icon name="CheckCircle" size={13} /> Закрыть
                </button>
              )}
              <button
                onClick={() => onDelete(selectedSession)}
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
                onChange={e => onReplyChange(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSendReply(); } }}
                placeholder="Ответить клиенту..."
                className="flex-1 resize-none rounded-xl px-3 py-2 text-sm outline-none"
                style={{ ...inputStyle, maxHeight: "100px" }}
              />
              <button
                onClick={onSendReply}
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
  );
}

import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

interface HistoryEntry {
  id: number;
  username: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  description: string;
  created_at: string;
}

interface Props {
  token: string;
  cmsApiUrl: string;
}

const ACTION_LABELS: Record<string, string> = {
  save_settings: "Настройки",
  save_service: "Услуга",
  save_plan: "Тариф",
  save_project: "Проект",
  save_pages: "Страницы",
  save_nav_items: "Навигация",
  save_whyus_cards: "Почему мы",
  save_quickorder_steps: "Быстрый заказ",
  save_pricing_items: "Прайс",
  save_faq: "FAQ",
  save_calc_options: "Калькулятор",
  save_video_cameras: "Камеры",
  save_video_equipment: "Оборудование",
  rollback: "Откат",
  add_service: "Добавлена услуга",
  delete_service: "Удалена услуга",
};

const ACTION_COLORS: Record<string, string> = {
  rollback: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  delete_service: "text-red-400 bg-red-500/10 border-red-500/20",
};

export function HistoryTab({ token, cmsApiUrl }: Props) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [rollbackId, setRollbackId] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [msg, setMsg] = useState("");
  const [snapshotEntry, setSnapshotEntry] = useState<{ id: number; snapshot: Record<string, unknown> } | null>(null);

  const showMsg = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 4000); };

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${cmsApiUrl}?action=get_history`, {
        headers: { "X-Admin-Token": token },
      });
      const data = await r.json();
      if (data.history) setHistory(data.history);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const loadSnapshot = async (id: number) => {
    const r = await fetch(`${cmsApiUrl}?action=get_snapshot&id=${id}`, {
      headers: { "X-Admin-Token": token },
    });
    const data = await r.json();
    if (data.snapshot) setSnapshotEntry({ id, snapshot: data.snapshot });
  };

  const doRollback = async () => {
    if (!rollbackId) return;
    setRolling(true);
    try {
      const r = await fetch(cmsApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Token": token },
        body: JSON.stringify({ action: "rollback", history_id: rollbackId }),
      });
      const data = await r.json();
      if (data.ok) {
        showMsg("Откат выполнен успешно!");
        setRollbackId(null);
        load();
      } else {
        showMsg(data.error || "Ошибка отката");
      }
    } catch {
      showMsg("Ошибка соединения");
    } finally {
      setRolling(false);
    }
  };

  const formatDate = (str: string) => {
    try {
      return new Date(str).toLocaleString("ru", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    } catch { return str; }
  };

  if (loading) return <div className="text-gray-400 text-sm">Загружаю историю...</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-['Oswald'] text-white">История изменений</h2>
          <p className="text-gray-500 text-sm mt-0.5">Последние {history.length} записей · Кликните на запись для отката</p>
        </div>
        {msg && (
          <span className={`text-xs px-3 py-1.5 rounded-full ${msg.includes("успешно") ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
            {msg}
          </span>
        )}
      </div>

      {/* Rollback confirm */}
      {rollbackId && (
        <div className="glass-card border border-amber-500/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="AlertTriangle" size={20} className="text-amber-400" />
            <div>
              <div className="text-white font-medium text-sm">Откатить изменения к версии #{rollbackId}?</div>
              <div className="text-gray-400 text-xs mt-0.5">Текущие данные будут заменены. Это действие нельзя отменить.</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={doRollback} disabled={rolling} className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-500 text-black hover:bg-amber-400 transition-all disabled:opacity-50">
              {rolling ? "Откатываю..." : "Откатить"}
            </button>
            <button onClick={() => setRollbackId(null)} className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all">
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Snapshot viewer */}
      {snapshotEntry && (
        <div className="glass-card neon-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-white text-sm">Снапшот #{snapshotEntry.id}</h3>
            <button onClick={() => setSnapshotEntry(null)} className="text-gray-400 hover:text-white">
              <Icon name="X" size={16} />
            </button>
          </div>
          <pre className="text-xs text-gray-400 bg-black/30 rounded-lg p-3 overflow-auto max-h-64 font-mono">
            {JSON.stringify(snapshotEntry.snapshot, null, 2)}
          </pre>
        </div>
      )}

      {history.length === 0 ? (
        <div className="glass-card neon-border rounded-xl p-8 text-center">
          <Icon name="History" size={32} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Пока нет записей истории</p>
          <p className="text-gray-600 text-xs mt-1">История начнёт заполняться при изменениях через новую авторизацию</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((h) => {
            const colorClass = ACTION_COLORS[h.action] || "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
            return (
              <div key={h.id} className="glass-card neon-border rounded-xl p-4 flex items-center gap-4 hover:border-white/20 transition-all">
                <div className={`flex-shrink-0 text-xs px-2 py-1 rounded-md border font-medium ${colorClass}`}>
                  {ACTION_LABELS[h.action] || h.action}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white font-medium truncate">{h.description || h.entity_type}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {h.username || "admin"} · {formatDate(h.created_at)}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => loadSnapshot(h.id)}
                    title="Посмотреть снапшот"
                    className="p-2 text-gray-500 hover:text-cyan-400 transition-colors rounded-lg hover:bg-cyan-500/10"
                  >
                    <Icon name="Eye" size={14} />
                  </button>
                  {(h.entity_type === "settings") && (
                    <button
                      onClick={() => setRollbackId(h.id)}
                      title="Откатить к этой версии"
                      className="p-2 text-gray-500 hover:text-amber-400 transition-colors rounded-lg hover:bg-amber-500/10"
                    >
                      <Icon name="RotateCcw" size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

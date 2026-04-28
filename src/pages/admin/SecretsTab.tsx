import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

const API_URL = "https://functions.poehali.dev/8256f7f0-fe5a-4828-b153-52cd6f391f35";

interface AppSecret {
  key: string;
  value: string;
  filled: boolean;
  description: string;
  is_sensitive: boolean;
  updated_at: string;
}

interface SecretsTabProps {
  password: string;
}

export function SecretsTab({ password }: SecretsTabProps) {
  const [secrets, setSecrets] = useState<AppSecret[]>([]);
  const [loading, setLoading] = useState(true);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showValue, setShowValue] = useState<Record<string, boolean>>({});
  const [revealedValues, setRevealedValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSensitive, setNewSensitive] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const showMsg = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(API_URL, {
        headers: { "X-Admin-Token": password },
      });
      const data = await r.json();
      setSecrets(Array.isArray(data) ? data : []);
    } catch {
      showMsg("Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => { load(); }, [load]);

  const revealValue = async (key: string) => {
    if (revealedValues[key] !== undefined) {
      setShowValue((p) => ({ ...p, [key]: !p[key] }));
      return;
    }
    try {
      const r = await fetch(`${API_URL}?reveal=1&key=${key}`, {
        headers: { "X-Admin-Token": password },
      });
      const data = await r.json();
      setRevealedValues((p) => ({ ...p, [key]: data.value }));
      setShowValue((p) => ({ ...p, [key]: true }));
    } catch {
      showMsg("Ошибка получения значения");
    }
  };

  const startEdit = async (key: string) => {
    setEditKey(key);
    if (revealedValues[key] !== undefined) {
      setEditValue(revealedValues[key]);
      return;
    }
    try {
      const r = await fetch(`${API_URL}?reveal=1&key=${key}`, {
        headers: { "X-Admin-Token": password },
      });
      const data = await r.json();
      setEditValue(data.value || "");
      setRevealedValues((p) => ({ ...p, [key]: data.value }));
    } catch {
      setEditValue("");
    }
  };

  const saveEdit = async (key: string) => {
    setSaving(true);
    try {
      const secret = secrets.find((s) => s.key === key);
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Token": password },
        body: JSON.stringify({
          key,
          value: editValue,
          description: secret?.description || "",
          is_sensitive: secret?.is_sensitive ?? true,
        }),
      });
      setRevealedValues((p) => ({ ...p, [key]: editValue }));
      setEditKey(null);
      showMsg("Сохранено!");
      load();
    } catch {
      showMsg("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const addSecret = async () => {
    if (!newKey.trim()) return;
    setSaving(true);
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Token": password },
        body: JSON.stringify({
          key: newKey.trim().toUpperCase(),
          value: newValue,
          description: newDesc,
          is_sensitive: newSensitive,
        }),
      });
      setNewKey("");
      setNewValue("");
      setNewDesc("");
      setNewSensitive(true);
      setShowAdd(false);
      showMsg("Добавлено!");
      load();
    } catch {
      showMsg("Ошибка добавления");
    } finally {
      setSaving(false);
    }
  };

  const deleteSecret = async (key: string) => {
    setSaving(true);
    try {
      await fetch(API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "X-Admin-Token": password },
        body: JSON.stringify({ key }),
      });
      setDeleteConfirm(null);
      showMsg("Удалено!");
      load();
    } catch {
      showMsg("Ошибка удаления");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold font-['Oswald']">Секреты и настройки</h2>
          <p className="text-gray-500 text-sm mt-0.5">Telegram, email и другие интеграции</p>
        </div>
        <div className="flex items-center gap-3">
          {msg && (
            <span className={`text-sm px-3 py-1 rounded-full ${msg === "Сохранено!" || msg === "Добавлено!" || msg === "Удалено!" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
              {msg}
            </span>
          )}
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="btn-neon px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
          >
            <Icon name="Plus" size={15} />
            Добавить
          </button>
        </div>
      </div>

      {/* Форма добавления */}
      {showAdd && (
        <div className="glass-card neon-border rounded-2xl p-5 space-y-3">
          <h3 className="font-semibold text-cyan-400 text-sm uppercase tracking-wide">Новый секрет</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Название (KEY)</label>
              <input
                value={newKey}
                onChange={(e) => setNewKey(e.target.value.toUpperCase())}
                placeholder="TELEGRAM_BOT_TOKEN"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 font-mono"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Значение</label>
              <input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Введите значение"
                type={newSensitive ? "password" : "text"}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Описание</label>
            <input
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Для чего используется этот секрет"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-400">
              <input
                type="checkbox"
                checked={newSensitive}
                onChange={(e) => setNewSensitive(e.target.checked)}
                className="w-4 h-4 accent-cyan-400"
              />
              Конфиденциальный (скрывать значение)
            </label>
            <div className="flex gap-2">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-colors">
                Отмена
              </button>
              <button onClick={addSecret} disabled={saving || !newKey.trim()} className="btn-neon px-4 py-2 rounded-lg text-sm font-semibold">
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Список секретов */}
      {loading ? (
        <div className="text-center text-gray-500 py-10">Загрузка...</div>
      ) : (
        <div className="space-y-2">
          {secrets.map((s) => (
            <div key={s.key} className="glass-card rounded-xl border border-white/5 p-4">
              {editKey === s.key ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 text-sm font-bold">{s.key}</span>
                    {s.is_sensitive && <span className="text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded">конфиденциальный</span>}
                  </div>
                  {s.description && <p className="text-gray-500 text-xs">{s.description}</p>}
                  <input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    type={s.is_sensitive ? "text" : "text"}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-cyan-500/40 text-white text-sm focus:outline-none font-mono"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(s.key)} disabled={saving} className="btn-neon px-4 py-1.5 rounded-lg text-sm font-semibold">
                      Сохранить
                    </button>
                    <button onClick={() => setEditKey(null)} className="px-4 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white border border-white/10 transition-colors">
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-cyan-400 text-sm font-bold">{s.key}</span>
                      {s.is_sensitive && <Icon name="Lock" size={12} className="text-gray-600" />}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${s.filled ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                        {s.filled ? "Заполнен" : "Пустой"}
                      </span>
                    </div>
                    {s.description && <p className="text-gray-500 text-xs mb-2">{s.description}</p>}
                    {s.filled && (
                      <div className="flex items-center gap-2">
                        <code className="text-gray-400 text-xs font-mono bg-white/5 px-2 py-1 rounded">
                          {showValue[s.key] && revealedValues[s.key] !== undefined
                            ? revealedValues[s.key]
                            : "••••••••"}
                        </code>
                        {s.is_sensitive && (
                          <button onClick={() => revealValue(s.key)} className="text-gray-600 hover:text-cyan-400 transition-colors">
                            <Icon name={showValue[s.key] ? "EyeOff" : "Eye"} size={13} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => startEdit(s.key)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                      title="Редактировать"
                    >
                      <Icon name="Pencil" size={14} />
                    </button>
                    {deleteConfirm === s.key ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-red-400">Удалить?</span>
                        <button onClick={() => deleteSecret(s.key)} className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors">Да</button>
                        <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 text-xs text-gray-500 rounded hover:text-white transition-colors">Нет</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(s.key)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Удалить"
                      >
                        <Icon name="Trash2" size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
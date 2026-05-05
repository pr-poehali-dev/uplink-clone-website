import { useState, useEffect } from "react";
import { AdminUser } from "@/hooks/useAdminAuth";
import Icon from "@/components/ui/icon";

const ALL_PERMISSIONS = [
  { key: "pages.view", label: "Просмотр страниц" },
  { key: "pages.edit", label: "Редактирование страниц" },
  { key: "pages.publish", label: "Публикация страниц" },
  { key: "pages.create", label: "Создание страниц" },
  { key: "pages.delete", label: "Удаление страниц" },
  { key: "media.manage", label: "Медиабиблиотека" },
  { key: "leads.view", label: "Просмотр заявок" },
  { key: "settings.edit", label: "Настройки сайта" },
  { key: "analytics.view", label: "Аналитика / Метрика" },
  { key: "ai.use", label: "ИИ-ассистент" },
  { key: "history.view", label: "История изменений" },
  { key: "history.rollback", label: "Откат изменений" },
  { key: "design.edit", label: "Дизайн" },
  { key: "calculator.edit", label: "Калькулятор" },
  { key: "services.edit", label: "Услуги" },
  { key: "plans.edit", label: "Тарифы" },
  { key: "nav.edit", label: "Навигация" },
  { key: "faq.edit", label: "FAQ" },
  { key: "team.edit", label: "Команда" },
  { key: "projects.edit", label: "Проекты" },
  { key: "pricing.edit", label: "Прайс" },
  { key: "secrets.manage", label: "Секреты API" },
  { key: "users.manage", label: "Управление пользователями" },
];

const ROLE_LABELS: Record<string, string> = {
  owner: "Владелец",
  editor: "Редактор",
  viewer: "Просмотр",
};

interface UserRow {
  id: number;
  username: string;
  display_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
  permission_overrides: Record<string, boolean>;
}

interface Props {
  token: string;
  authApiUrl: string;
  currentUser: AdminUser;
}

export function UsersTab({ token, authApiUrl, currentUser }: Props) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [rolePerms, setRolePerms] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const [newUsername, setNewUsername] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newRole, setNewRole] = useState("editor");
  const [newPassword, setNewPassword] = useState("");
  const [newPerms, setNewPerms] = useState<Record<string, boolean>>({});

  const showMsg = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(authApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Token": token },
        body: JSON.stringify({ action: "list_users" }),
      });
      const data = await r.json();
      if (data.users) { setUsers(data.users); setRolePerms(data.role_permissions || {}); }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createUser = async () => {
    if (!newUsername || !newPassword) { showMsg("Заполните логин и пароль"); return; }
    setSaving(true);
    const r = await fetch(authApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Token": token },
      body: JSON.stringify({ action: "create_user", username: newUsername, display_name: newDisplayName, role: newRole, password: newPassword, permission_overrides: newPerms }),
    });
    setSaving(false);
    const data = await r.json();
    if (data.ok) {
      showMsg("Пользователь создан!");
      setShowCreate(false);
      setNewUsername(""); setNewDisplayName(""); setNewPassword(""); setNewPerms({});
      load();
    } else { showMsg(data.error || "Ошибка"); }
  };

  const updateUser = async (user: UserRow) => {
    setSaving(true);
    const r = await fetch(authApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Token": token },
      body: JSON.stringify({ action: "update_user", id: user.id, display_name: user.display_name, role: user.role, is_active: user.is_active, permission_overrides: user.permission_overrides }),
    });
    setSaving(false);
    const data = await r.json();
    if (data.ok) { showMsg("Сохранено!"); setEditUser(null); load(); }
    else showMsg(data.error || "Ошибка");
  };

  const deactivate = async (id: number) => {
    if (!confirm("Отключить пользователя?")) return;
    const r = await fetch(authApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Token": token },
      body: JSON.stringify({ action: "deactivate_user", id }),
    });
    const data = await r.json();
    if (data.ok) { showMsg("Пользователь отключён"); load(); }
    else showMsg(data.error || "Ошибка");
  };

  const effectivePerms = (user: UserRow) => {
    const base = new Set(rolePerms[user.role] || []);
    for (const [perm, granted] of Object.entries(user.permission_overrides)) {
      if (granted) base.add(perm); else base.delete(perm);
    }
    return base;
  };

  if (loading) return <div className="text-gray-400 text-sm">Загружаю...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-['Oswald'] text-white">Пользователи</h2>
          <p className="text-gray-500 text-sm mt-0.5">Управление доступом к админке</p>
        </div>
        <div className="flex items-center gap-2">
          {msg && <span className={`text-xs px-3 py-1.5 rounded-full ${msg.includes("!") ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{msg}</span>}
          <button onClick={() => setShowCreate(true)} className="btn-neon px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
            <Icon name="UserPlus" size={14} />
            Добавить
          </button>
        </div>
      </div>

      {/* Create User Form */}
      {showCreate && (
        <div className="glass-card neon-border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-white flex items-center gap-2"><Icon name="UserPlus" size={16} className="text-cyan-400" /> Новый пользователь</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Логин</label>
              <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="ivanov" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Имя</label>
              <input value={newDisplayName} onChange={(e) => setNewDisplayName(e.target.value)} placeholder="Иван Иванов" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Пароль</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Минимум 6 символов" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Роль</label>
              <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50">
                <option value="editor">Редактор</option>
                <option value="viewer">Просмотр</option>
                {currentUser.role === "owner" && <option value="owner">Владелец</option>}
              </select>
            </div>
          </div>
          <PermissionsGrid perms={newPerms} onChange={setNewPerms} rolePerms={rolePerms[newRole] || []} />
          <div className="flex gap-2">
            <button onClick={createUser} disabled={saving} className="btn-neon px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50">
              {saving ? "Создаю..." : "Создать"}
            </button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all">
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="space-y-3">
        {users.map((u) => (
          <div key={u.id} className={`glass-card rounded-xl border transition-all ${!u.is_active ? "opacity-50 border-white/5" : "neon-border"}`}>
            {editUser?.id === u.id ? (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Имя</label>
                    <input value={editUser.display_name} onChange={(e) => setEditUser({ ...editUser, display_name: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Роль</label>
                    <select value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-[#0a0f1a] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50">
                      <option value="editor">Редактор</option>
                      <option value="viewer">Просмотр</option>
                      {currentUser.role === "owner" && <option value="owner">Владелец</option>}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id={`active-${u.id}`} checked={editUser.is_active} onChange={(e) => setEditUser({ ...editUser, is_active: e.target.checked })} className="rounded" />
                  <label htmlFor={`active-${u.id}`} className="text-sm text-gray-300">Активен</label>
                </div>
                <PermissionsGrid perms={editUser.permission_overrides} onChange={(p) => setEditUser({ ...editUser, permission_overrides: p })} rolePerms={rolePerms[editUser.role] || []} />
                <div className="flex gap-2">
                  <button onClick={() => updateUser(editUser)} disabled={saving} className="btn-neon px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50">{saving ? "Сохраняю..." : "Сохранить"}</button>
                  <button onClick={() => setEditUser(null)} className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all">Отмена</button>
                </div>
              </div>
            ) : (
              <div className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-cyan-400 font-bold text-sm uppercase">
                    {(u.display_name || u.username).charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm">{u.display_name || u.username}</span>
                    <span className="text-gray-500 text-xs">@{u.username}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${u.role === "owner" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : u.role === "editor" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
                      {ROLE_LABELS[u.role] || u.role}
                    </span>
                    {!u.is_active && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Отключён</span>}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    {effectivePerms(u).size} прав · Последний вход: {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString("ru") : "никогда"}
                  </div>
                </div>
                {u.id !== currentUser.id && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditUser({ ...u })} className="p-2 text-gray-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-cyan-500/10">
                      <Icon name="Edit" size={14} />
                    </button>
                    {u.is_active && (
                      <button onClick={() => deactivate(u.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10">
                        <Icon name="UserX" size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PermissionsGrid({ perms, onChange, rolePerms }: { perms: Record<string, boolean>; onChange: (p: Record<string, boolean>) => void; rolePerms: string[] }) {
  const toggle = (key: string, currentGranted: boolean) => {
    const inRole = rolePerms.includes(key);
    const override = perms[key];
    if (override !== undefined) {
      const copy = { ...perms };
      delete copy[key];
      onChange(copy);
    } else {
      onChange({ ...perms, [key]: !inRole });
    }
    void currentGranted;
  };

  const isGranted = (key: string) => {
    if (perms[key] !== undefined) return perms[key];
    return rolePerms.includes(key);
  };

  const hasOverride = (key: string) => perms[key] !== undefined;

  return (
    <div>
      <div className="text-xs text-gray-400 mb-2">Права доступа <span className="text-gray-600">(✱ = переопределено вручную)</span></div>
      <div className="grid grid-cols-2 gap-1">
        {ALL_PERMISSIONS.map((p) => (
          <label key={p.key} className="flex items-center gap-2 cursor-pointer py-1 px-2 rounded-lg hover:bg-white/5 transition-colors">
            <div
              onClick={() => toggle(p.key, isGranted(p.key))}
              className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 cursor-pointer transition-all ${isGranted(p.key) ? "bg-cyan-500 border-cyan-500" : "bg-transparent border-white/20"}`}
            >
              {isGranted(p.key) && <Icon name="Check" size={10} className="text-black" />}
            </div>
            <span className={`text-xs ${isGranted(p.key) ? "text-gray-300" : "text-gray-600"}`}>
              {p.label}{hasOverride(p.key) && " ✱"}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

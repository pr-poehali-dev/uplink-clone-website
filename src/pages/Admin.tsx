import { useState, useEffect } from "react";
import { CMS_API_URL, CmsContent, CmsService, CmsPlan, CmsProject, CmsTeamMember } from "@/hooks/useCmsContent";
import Icon from "@/components/ui/icon";

type Tab = "settings" | "services" | "plans" | "projects" | "team" | "password";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [content, setContent] = useState<CmsContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("settings");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const loadContent = async (pwd: string) => {
    setLoading(true);
    const r = await fetch(CMS_API_URL);
    const data = await r.json();
    setLoading(false);
    if (data.settings) {
      setContent(data);
      return true;
    }
    return false;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const r = await fetch(CMS_API_URL + "/save/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, updates: {} }),
    });
    if (r.ok) {
      setAuthed(true);
      loadContent(password);
    } else {
      setAuthError("Неверный пароль");
    }
  };

  const showMsg = (msg: string) => {
    setSaveMsg(msg);
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const save = async (path: string, body: object) => {
    setSaving(true);
    const r = await fetch(CMS_API_URL + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, ...body }),
    });
    setSaving(false);
    if (r.ok) {
      showMsg("Сохранено!");
      loadContent(password);
    } else {
      showMsg("Ошибка сохранения");
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <Icon name="Settings" size={16} className="text-[#080c14]" />
              </div>
              <span className="text-white font-bold font-['Oswald'] text-xl">Панель управления</span>
            </div>
            <p className="text-gray-500 text-sm">ИТК Аплинк-IT</p>
          </div>
          <form onSubmit={handleLogin} className="glass-card neon-border rounded-2xl p-8 space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
            {authError && <p className="text-red-400 text-sm">{authError}</p>}
            <button type="submit" className="btn-neon w-full py-3 rounded-xl font-semibold">
              Войти
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading || !content) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <div className="text-cyan-400">Загрузка...</div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "settings", label: "Настройки", icon: "Settings" },
    { id: "services", label: "Услуги", icon: "Briefcase" },
    { id: "plans", label: "Тарифы", icon: "CreditCard" },
    { id: "projects", label: "Проекты", icon: "FolderOpen" },
    { id: "team", label: "Команда", icon: "Users" },
    { id: "password", label: "Пароль", icon: "Lock" },
  ];

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0a0f1a]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <Icon name="Settings" size={16} className="text-[#080c14]" />
            </div>
            <span className="font-bold font-['Oswald'] text-lg">Панель управления</span>
          </div>
          <div className="flex items-center gap-3">
            {saveMsg && (
              <span className={`text-sm px-3 py-1 rounded-full ${saveMsg === "Сохранено!" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                {saveMsg}
              </span>
            )}
            <a href="/" className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors">
              <Icon name="ExternalLink" size={14} />
              Сайт
            </a>
            <button onClick={() => setAuthed(false)} className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors">
              <Icon name="LogOut" size={14} />
              Выйти
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-48 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    tab === t.id
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon name={t.icon as "Settings"} size={16} />
                  {t.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {tab === "settings" && <SettingsTab content={content} password={password} save={save} saving={saving} />}
            {tab === "services" && <ServicesTab content={content} password={password} save={save} saving={saving} />}
            {tab === "plans" && <PlansTab content={content} password={password} save={save} saving={saving} />}
            {tab === "projects" && <ProjectsTab content={content} password={password} save={save} saving={saving} />}
            {tab === "team" && <TeamTab content={content} password={password} save={save} saving={saving} />}
            {tab === "password" && <PasswordTab password={password} setPassword={setPassword} save={save} saving={saving} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- SETTINGS TAB ----
function SettingsTab({ content, save, saving }: { content: CmsContent; password: string; save: (path: string, body: object) => void; saving: boolean }) {
  const [vals, setVals] = useState<Record<string, string>>({});

  useEffect(() => {
    const filtered: Record<string, string> = {};
    Object.entries(content.settings).forEach(([k, v]) => {
      if (k !== "admin_password") filtered[k] = v;
    });
    setVals(filtered);
  }, [content.settings]);

  const handleSave = () => save("/save/settings", { updates: vals });

  const groups: { label: string; keys: string[] }[] = [
    { label: "Контакты", keys: ["phone", "phone_href", "email_support", "email_info", "address", "work_hours", "response_time"] },
    { label: "Главный экран", keys: ["hero_badge", "hero_title_1", "hero_title_2", "hero_description"] },
    { label: "Цифры в шапке", keys: ["hero_stat_1_value", "hero_stat_1_label", "hero_stat_2_value", "hero_stat_2_label", "hero_stat_3_value", "hero_stat_3_label"] },
    { label: "Достижения", keys: ["whyus_stat_1_num", "whyus_stat_1_label", "whyus_stat_2_num", "whyus_stat_2_label", "whyus_stat_3_num", "whyus_stat_3_label", "whyus_stat_4_num", "whyus_stat_4_label"] },
  ];

  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <div key={g.label} className="glass-card neon-border rounded-2xl p-6">
          <h3 className="text-white font-bold font-['Oswald'] text-lg mb-4">{g.label}</h3>
          <div className="space-y-3">
            {g.keys.map((key) => {
              const label = content.settings[key] !== undefined ? key : key;
              const settingsMeta: Record<string, string> = {
                phone: "Телефон (отображается)", phone_href: "Телефон (ссылка tel:)", email_support: "Email поддержки", email_info: "Email общий",
                address: "Адрес", work_hours: "Режим работы", response_time: "Время реагирования",
                hero_badge: "Подпись над заголовком", hero_title_1: "Заголовок (строка 1)", hero_title_2: "Заголовок (строка 2)", hero_description: "Описание",
                hero_stat_1_value: "Цифра 1", hero_stat_1_label: "Подпись 1", hero_stat_2_value: "Цифра 2", hero_stat_2_label: "Подпись 2", hero_stat_3_value: "Цифра 3", hero_stat_3_label: "Подпись 3",
                whyus_stat_1_num: "Цифра 1", whyus_stat_1_label: "Подпись 1", whyus_stat_2_num: "Цифра 2", whyus_stat_2_label: "Подпись 2",
                whyus_stat_3_num: "Цифра 3", whyus_stat_3_label: "Подпись 3", whyus_stat_4_num: "Цифра 4", whyus_stat_4_label: "Подпись 4",
              };
              return (
                <div key={key}>
                  <label className="block text-gray-400 text-xs mb-1">{settingsMeta[key] || key}</label>
                  {(key === "hero_description") ? (
                    <textarea
                      value={vals[key] || ""}
                      onChange={(e) => setVals({ ...vals, [key]: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
                    />
                  ) : (
                    <input
                      value={vals[key] || ""}
                      onChange={(e) => setVals({ ...vals, [key]: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <SaveButton onClick={handleSave} saving={saving} />
    </div>
  );
}

// ---- SERVICES TAB ----
function ServicesTab({ content, save, saving }: { content: CmsContent; password: string; save: (path: string, body: object) => void; saving: boolean }) {
  const [selected, setSelected] = useState<CmsService | null>(null);

  useEffect(() => {
    if (content.services.length && !selected) setSelected(content.services[0]);
  }, [content.services]);

  const handleSave = () => selected && save("/save/service", { service: selected });

  if (!selected) return null;

  return (
    <div className="flex gap-4">
      <div className="w-48 flex-shrink-0 space-y-1">
        {content.services.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelected({ ...s })}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${selected.id === s.id ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
          >
            {s.title}
          </button>
        ))}
      </div>
      <div className="flex-1 glass-card neon-border rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-bold font-['Oswald'] text-lg">Редактирование услуги</h3>
        <div>
          <label className="block text-gray-400 text-xs mb-1">Название</label>
          <input value={selected.title} onChange={(e) => setSelected({ ...selected, title: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
        </div>
        <div>
          <label className="block text-gray-400 text-xs mb-1">Описание</label>
          <textarea value={selected.description} onChange={(e) => setSelected({ ...selected, description: e.target.value })}
            rows={3} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all resize-none" />
        </div>
        <div>
          <label className="block text-gray-400 text-xs mb-2">Пункты услуги</label>
          <div className="space-y-2">
            {selected.items.filter(i => i.item_text !== "[удалено]").map((item, idx) => (
              <input key={item.id} value={item.item_text}
                onChange={(e) => {
                  const items = [...selected.items];
                  items[idx] = { ...item, item_text: e.target.value };
                  setSelected({ ...selected, items });
                }}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="svc_active" checked={selected.is_active}
            onChange={(e) => setSelected({ ...selected, is_active: e.target.checked })} className="accent-cyan-400" />
          <label htmlFor="svc_active" className="text-gray-400 text-sm">Показывать на сайте</label>
        </div>
        <SaveButton onClick={handleSave} saving={saving} />
      </div>
    </div>
  );
}

// ---- PLANS TAB ----
function PlansTab({ content, save, saving }: { content: CmsContent; password: string; save: (path: string, body: object) => void; saving: boolean }) {
  const [selected, setSelected] = useState<CmsPlan | null>(null);

  useEffect(() => {
    if (content.plans.length && !selected) setSelected(content.plans[0]);
  }, [content.plans]);

  const handleSave = () => selected && save("/save/plan", { plan: selected });

  if (!selected) return null;

  return (
    <div className="flex gap-4">
      <div className="w-48 flex-shrink-0 space-y-1">
        {content.plans.map((p) => (
          <button key={p.id} onClick={() => setSelected({ ...p })}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${selected.id === p.id ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
            {p.name}
          </button>
        ))}
      </div>
      <div className="flex-1 glass-card neon-border rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-bold font-['Oswald'] text-lg">Редактирование тарифа</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-400 text-xs mb-1">Название тарифа</label>
            <input value={selected.name} onChange={(e) => setSelected({ ...selected, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Цена</label>
            <input value={selected.price} onChange={(e) => setSelected({ ...selected, price: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
          </div>
        </div>
        <div>
          <label className="block text-gray-400 text-xs mb-1">Бейдж (например: «Рекомендуем»)</label>
          <input value={selected.badge || ""} onChange={(e) => setSelected({ ...selected, badge: e.target.value || null })}
            placeholder="Оставьте пустым, если не нужен"
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
        </div>
        <div>
          <label className="block text-gray-400 text-xs mb-1">Описание тарифа</label>
          <textarea value={selected.description} onChange={(e) => setSelected({ ...selected, description: e.target.value })}
            rows={2} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all resize-none" />
        </div>
        <div>
          <label className="block text-gray-400 text-xs mb-2">Что включено</label>
          <div className="space-y-2">
            {selected.features.filter(f => f.feature_text !== "[удалено]").map((feat, idx) => (
              <input key={feat.id} value={feat.feature_text}
                onChange={(e) => {
                  const features = [...selected.features];
                  features[idx] = { ...feat, feature_text: e.target.value };
                  setSelected({ ...selected, features });
                }}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input type="checkbox" checked={selected.is_highlighted} onChange={(e) => setSelected({ ...selected, is_highlighted: e.target.checked })} className="accent-cyan-400" />
            Выделить (рекомендуемый)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input type="checkbox" checked={selected.is_active} onChange={(e) => setSelected({ ...selected, is_active: e.target.checked })} className="accent-cyan-400" />
            Показывать на сайте
          </label>
        </div>
        <SaveButton onClick={handleSave} saving={saving} />
      </div>
    </div>
  );
}

// ---- PROJECTS TAB ----
function ProjectsTab({ content, save, saving }: { content: CmsContent; password: string; save: (path: string, body: object) => void; saving: boolean }) {
  const [selected, setSelected] = useState<CmsProject | null>(null);

  useEffect(() => {
    if (content.projects.length && !selected) setSelected(content.projects[0]);
  }, [content.projects]);

  const handleSave = () => selected && save("/save/project", { project: selected });

  if (!selected) return null;

  return (
    <div className="flex gap-4">
      <div className="w-48 flex-shrink-0 space-y-1">
        {content.projects.map((p) => (
          <button key={p.id} onClick={() => setSelected({ ...p })}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${selected.id === p.id ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
            {p.client}
          </button>
        ))}
      </div>
      <div className="flex-1 glass-card neon-border rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-bold font-['Oswald'] text-lg">Редактирование проекта</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-400 text-xs mb-1">Клиент</label>
            <input value={selected.client} onChange={(e) => setSelected({ ...selected, client: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Категория</label>
            <input value={selected.category} onChange={(e) => setSelected({ ...selected, category: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
          </div>
        </div>
        <div>
          <label className="block text-gray-400 text-xs mb-1">Описание</label>
          <textarea value={selected.description} onChange={(e) => setSelected({ ...selected, description: e.target.value })}
            rows={3} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all resize-none" />
        </div>
        <div>
          <label className="block text-gray-400 text-xs mb-1">Результат</label>
          <input value={selected.result || ""} onChange={(e) => setSelected({ ...selected, result: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
        </div>
        <div>
          <label className="block text-gray-400 text-xs mb-2">Метрики проекта</label>
          <div className="space-y-2">
            {selected.metrics.filter(m => m.label !== "[удалено]").map((m, idx) => (
              <div key={m.id} className="flex gap-2">
                <input value={m.value} placeholder="Значение" onChange={(e) => {
                  const metrics = [...selected.metrics];
                  metrics[idx] = { ...m, value: e.target.value };
                  setSelected({ ...selected, metrics });
                }} className="w-24 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
                <input value={m.label} placeholder="Подпись" onChange={(e) => {
                  const metrics = [...selected.metrics];
                  metrics[idx] = { ...m, label: e.target.value };
                  setSelected({ ...selected, metrics });
                }} className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="proj_active" checked={selected.is_active} onChange={(e) => setSelected({ ...selected, is_active: e.target.checked })} className="accent-cyan-400" />
          <label htmlFor="proj_active" className="text-gray-400 text-sm">Показывать на сайте</label>
        </div>
        <SaveButton onClick={handleSave} saving={saving} />
      </div>
    </div>
  );
}

// ---- TEAM TAB ----
function TeamTab({ content, save, saving }: { content: CmsContent; password: string; save: (path: string, body: object) => void; saving: boolean }) {
  const [selected, setSelected] = useState<CmsTeamMember | null>(null);

  useEffect(() => {
    if (content.team.length && !selected) setSelected(content.team[0]);
  }, [content.team]);

  const handleSave = () => selected && save("/save/team", { member: selected });

  if (!selected) return null;

  return (
    <div className="flex gap-4">
      <div className="w-48 flex-shrink-0 space-y-1">
        {content.team.map((m) => (
          <button key={m.id} onClick={() => setSelected({ ...m })}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${selected.id === m.id ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
            {m.name}
          </button>
        ))}
      </div>
      <div className="flex-1 glass-card neon-border rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-bold font-['Oswald'] text-lg">Редактирование сотрудника</h3>
        <div>
          <label className="block text-gray-400 text-xs mb-1">Имя</label>
          <input value={selected.name} onChange={(e) => setSelected({ ...selected, name: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
        </div>
        <div>
          <label className="block text-gray-400 text-xs mb-1">Должность</label>
          <input value={selected.position} onChange={(e) => setSelected({ ...selected, position: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
        </div>
        <div>
          <label className="block text-gray-400 text-xs mb-1">Опыт</label>
          <input value={selected.experience || ""} onChange={(e) => setSelected({ ...selected, experience: e.target.value })}
            placeholder="Например: 10 лет опыта"
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="team_active" checked={selected.is_active} onChange={(e) => setSelected({ ...selected, is_active: e.target.checked })} className="accent-cyan-400" />
          <label htmlFor="team_active" className="text-gray-400 text-sm">Показывать на сайте</label>
        </div>
        <SaveButton onClick={handleSave} saving={saving} />
      </div>
    </div>
  );
}

// ---- PASSWORD TAB ----
function PasswordTab({ password, setPassword, save, saving }: { password: string; setPassword: (p: string) => void; save: (path: string, body: object) => void; saving: boolean }) {
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (newPwd.length < 6) { setError("Минимум 6 символов"); return; }
    if (newPwd !== confirmPwd) { setError("Пароли не совпадают"); return; }
    setError("");
    save("/save/password", { new_password: newPwd });
    setPassword(newPwd);
    setNewPwd("");
    setConfirmPwd("");
  };

  return (
    <div className="glass-card neon-border rounded-2xl p-6 max-w-md space-y-4">
      <h3 className="text-white font-bold font-['Oswald'] text-lg">Изменить пароль</h3>
      <div>
        <label className="block text-gray-400 text-xs mb-1">Новый пароль</label>
        <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
      </div>
      <div>
        <label className="block text-gray-400 text-xs mb-1">Повторите пароль</label>
        <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <SaveButton onClick={handleSave} saving={saving} />
    </div>
  );
}

function SaveButton({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  return (
    <button onClick={onClick} disabled={saving}
      className="btn-neon px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 disabled:opacity-60">
      {saving ? (
        <><div className="w-4 h-4 border-2 border-[#080c14]/30 border-t-[#080c14] rounded-full animate-spin" />Сохранение...</>
      ) : (
        <><Icon name="Save" size={16} />Сохранить</>
      )}
    </button>
  );
}

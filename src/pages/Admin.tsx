import { useState } from "react";
import { CMS_API_URL, CmsContent } from "@/hooks/useCmsContent";
import Icon from "@/components/ui/icon";
import { SettingsTab, ServicesTab, PlansTab } from "./admin/AdminTabs";
import { ProjectsTab, TeamTab, PasswordTab } from "./admin/AdminTabs2";
import { SectionsTab } from "./admin/SectionsTab";
import { FaqTab } from "./admin/FaqTab";
import { CalculatorTab } from "./admin/CalculatorTab";
import { PreviewPanel } from "./admin/PreviewPanel";

type Tab = "settings" | "sections" | "services" | "plans" | "calculator" | "projects" | "team" | "faq" | "password";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [content, setContent] = useState<CmsContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("settings");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [preview, setPreview] = useState(false);

  const loadContent = async (_pwd: string) => {
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
    try {
      const r = await fetch(CMS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_settings", password, updates: {} }),
      });
      if (r.ok) {
        setAuthed(true);
        loadContent(password);
      } else {
        setAuthError("Неверный пароль");
      }
    } catch {
      setAuthError("Ошибка соединения, попробуйте ещё раз");
    }
  };

  const showMsg = (msg: string) => {
    setSaveMsg(msg);
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const save = async (action: string, body: object) => {
    setSaving(true);
    try {
      const r = await fetch(CMS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, password, ...body }),
      });
      if (r.ok) {
        showMsg("Сохранено!");
        loadContent(password);
      } else {
        showMsg("Ошибка сохранения");
      }
    } catch {
      showMsg("Ошибка соединения");
    } finally {
      setSaving(false);
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
    { id: "sections", label: "Секции", icon: "LayoutDashboard" },
    { id: "services", label: "Услуги", icon: "Briefcase" },
    { id: "plans", label: "Тарифы", icon: "CreditCard" },
    { id: "calculator", label: "Калькулятор", icon: "Calculator" },
    { id: "projects", label: "Проекты", icon: "FolderOpen" },
    { id: "team", label: "Команда", icon: "Users" },
    { id: "faq", label: "FAQ", icon: "HelpCircle" },
    { id: "password", label: "Пароль", icon: "Lock" },
  ];

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      {preview && <PreviewPanel onClose={() => setPreview(false)} />}

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
            <button
              onClick={() => setPreview(true)}
              className="text-gray-400 hover:text-cyan-400 text-sm flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20"
            >
              <Icon name="Monitor" size={14} />
              Предпросмотр
            </button>
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
            {tab === "sections" && <SectionsTab content={content} password={password} save={save} saving={saving} />}
            {tab === "services" && <ServicesTab content={content} password={password} save={save} saving={saving} />}
            {tab === "plans" && <PlansTab content={content} password={password} save={save} saving={saving} />}
            {tab === "calculator" && <CalculatorTab content={content} save={save} saving={saving} />}
            {tab === "projects" && <ProjectsTab content={content} password={password} save={save} saving={saving} />}
            {tab === "team" && <TeamTab content={content} password={password} save={save} saving={saving} />}
            {tab === "faq" && <FaqTab content={content} password={password} save={save} saving={saving} />}
            {tab === "password" && <PasswordTab password={password} setPassword={setPassword} save={save} saving={saving} />}
          </div>
        </div>
      </div>
    </div>
  );
}
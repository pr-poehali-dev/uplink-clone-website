import { useState, useEffect, useCallback } from "react";
import { CmsContent } from "@/hooks/useCmsContent";
import { useAdminAuth, AUTH_API_URL, CMS_API_URL } from "@/hooks/useAdminAuth";
import Icon from "@/components/ui/icon";
import { SettingsTab, ServicesTab, PlansTab } from "./admin/AdminTabs";
import { ProjectsTab, TeamTab, PasswordTab } from "./admin/AdminTabs2";
import { SectionsTab } from "./admin/SectionsTab";
import { FaqTab } from "./admin/FaqTab";
import { CalculatorTab } from "./admin/CalculatorTab";
import { SecretsTab } from "./admin/SecretsTab";
import { PreviewPanel } from "./admin/PreviewPanel";
import { LeadsTab } from "./admin/LeadsTab";
import { WhyUsTab } from "./admin/WhyUsTab";
import { QuickOrderTab } from "./admin/QuickOrderTab";
import { PricingTab } from "./admin/PricingTab";
import { NavTab } from "./admin/NavTab";
import { VideoCalcTab } from "./admin/VideoCalcTab";
import { PagesTab } from "./admin/PagesTab";
import { MediaTab } from "./admin/MediaTab";
import { DesignTab } from "./admin/DesignTab";
import { UsersTab } from "./admin/UsersTab";
import { HistoryTab } from "./admin/HistoryTab";

type Tab =
  | "dashboard" | "leads" | "settings" | "sections" | "services" | "plans"
  | "calculator" | "projects" | "team" | "faq" | "secrets" | "password"
  | "whyus" | "quickorder" | "pricing" | "nav" | "videocalc" | "pages"
  | "media" | "design" | "users" | "history";

interface NavGroup {
  label: string;
  items: { id: Tab; label: string; icon: string; badge?: number }[];
}

export default function Admin() {
  const auth = useAdminAuth();
  const [loginStep, setLoginStep] = useState<"username" | "password">("username");
  const [loginUsername, setLoginUsername] = useState("owner");
  const [loginPassword, setLoginPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [setupNewPassword, setSetupNewPassword] = useState("");
  const [setupConfirm, setSetupConfirm] = useState("");
  const [setupError, setSetupError] = useState("");

  const [content, setContent] = useState<CmsContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [preview, setPreview] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [unreadLeads, setUnreadLeads] = useState(0);

  const loadContent = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(CMS_API_URL);
      const data = await r.json();
      if (data.settings) setContent(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (auth.isAuthed) loadContent();
  }, [auth.isAuthed]);

  const showMsg = (msg: string) => {
    setSaveMsg(msg);
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const save = async (action: string, body: object) => {
    setSaving(true);
    try {
      const r = await fetch(CMS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(auth.token ? { "X-Admin-Token": auth.token } : {}),
        },
        body: JSON.stringify({
          action,
          password: content ? (content.settings as Record<string, string>)?.admin_password ?? "" : "",
          ...body,
        }),
      });
      if (r.ok) {
        showMsg("Сохранено!");
        loadContent();
      } else {
        showMsg("Ошибка сохранения");
      }
    } catch {
      showMsg("Ошибка соединения");
    } finally {
      setSaving(false);
    }
  };

  const handleUsernameStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim()) return;
    const result = await auth.checkSetup(loginUsername.trim());
    if (result && "setupRequired" in result && result.setupRequired) return; // покажет экран настройки
    if (result && "error" in result) return;
    setLoginStep("password");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await auth.login(loginUsername, loginPassword);
  };

  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError("");
    if (setupNewPassword.length < 6) { setSetupError("Минимум 6 символов"); return; }
    if (setupNewPassword !== setupConfirm) { setSetupError("Пароли не совпадают"); return; }
    const result = await auth.setupPassword(setupNewPassword);
    if (result && "error" in result) { setSetupError(result.error || "Ошибка"); return; }
    setLoginStep("password");
  };

  if (!auth.isAuthed) {
    const logoBlock = (
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <Icon name="Settings" size={16} className="text-[#080c14]" />
          </div>
          <span className="text-white font-bold font-['Oswald'] text-xl">Панель управления</span>
        </div>
        <p className="text-gray-500 text-sm">ИТК Аплинк-IT</p>
      </div>
    );

    // Экран установки пароля (первый вход)
    if (auth.setupRequired) {
      return (
        <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4">
          <div className="w-full max-w-sm">
            {logoBlock}
            <div className="glass-card neon-border rounded-2xl p-8 space-y-2 mb-4">
              <div className="flex items-center gap-2 text-amber-400 mb-3">
                <Icon name="KeyRound" size={16} />
                <span className="font-semibold text-sm">Первый вход — установите пароль</span>
              </div>
              <p className="text-gray-500 text-xs">Придумайте надёжный пароль для входа в админку</p>
            </div>
            <form onSubmit={handleSetupPassword} className="glass-card neon-border rounded-2xl p-8 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Новый пароль</label>
                <input
                  type="password" value={setupNewPassword} autoFocus
                  onChange={(e) => setSetupNewPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Повторите пароль</label>
                <input
                  type="password" value={setupConfirm}
                  onChange={(e) => setSetupConfirm(e.target.value)}
                  placeholder="Повторите пароль"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                />
              </div>
              {setupError && <p className="text-red-400 text-sm">{setupError}</p>}
              <button type="submit" disabled={auth.loading} className="btn-neon w-full py-3 rounded-xl font-semibold disabled:opacity-50">
                {auth.loading ? "Сохраняю..." : "Установить пароль и войти"}
              </button>
            </form>
          </div>
        </div>
      );
    }

    // Шаг 1: ввод логина
    if (loginStep === "username") {
      return (
        <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4">
          <div className="w-full max-w-sm">
            {logoBlock}
            <form onSubmit={handleUsernameStep} className="glass-card neon-border rounded-2xl p-8 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Логин</label>
                <input
                  type="text" value={loginUsername} autoFocus
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="owner"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                />
              </div>
              {auth.error && <p className="text-red-400 text-sm">{auth.error}</p>}
              <button type="submit" disabled={auth.loading} className="btn-neon w-full py-3 rounded-xl font-semibold disabled:opacity-50">
                {auth.loading ? "Проверяю..." : "Продолжить"}
              </button>
            </form>
          </div>
        </div>
      );
    }

    // Шаг 2: ввод пароля
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {logoBlock}
          <form onSubmit={handleLogin} className="glass-card neon-border rounded-2xl p-8 space-y-4">
            <button type="button" onClick={() => { setLoginStep("username"); setLoginPassword(""); }} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-sm transition-colors mb-1">
              <Icon name="ArrowLeft" size={14} />
              {loginUsername}
            </button>
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Пароль</label>
              <input
                type="password" value={loginPassword} autoFocus
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Введите пароль"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
            {auth.error && <p className="text-red-400 text-sm">{auth.error}</p>}
            <button type="submit" disabled={auth.loading} className="btn-neon w-full py-3 rounded-xl font-semibold disabled:opacity-50">
              {auth.loading ? "Вхожу..." : "Войти"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading || !content) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-400">
          <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          Загружаю данные...
        </div>
      </div>
    );
  }

  const password = (content.settings as Record<string, string>)?.admin_password ?? "";

  const navGroups: NavGroup[] = [
    {
      label: "Аналитика",
      items: [
        { id: "dashboard", label: "Дашборд", icon: "LayoutDashboard" },
        { id: "leads", label: "Заявки", icon: "Inbox", badge: unreadLeads || undefined },
        { id: "history", label: "История правок", icon: "History" },
      ],
    },
    {
      label: "Страницы",
      items: [
        { id: "pages", label: "Страницы / SEO", icon: "FileText" },
        { id: "sections", label: "Секции", icon: "Layers" },
        { id: "nav", label: "Навигация", icon: "Menu" },
      ],
    },
    {
      label: "Контент",
      items: [
        { id: "settings", label: "Настройки", icon: "Settings" },
        { id: "services", label: "Услуги", icon: "Briefcase" },
        { id: "plans", label: "Тарифы", icon: "CreditCard" },
        { id: "pricing", label: "Прайс", icon: "Receipt" },
        { id: "calculator", label: "Калькулятор IT", icon: "Calculator" },
        { id: "videocalc", label: "Видеонаблюдение", icon: "Camera" },
        { id: "whyus", label: "Почему мы", icon: "Star" },
        { id: "quickorder", label: "Быстрый заказ", icon: "Zap" },
        { id: "projects", label: "Проекты", icon: "FolderOpen" },
        { id: "team", label: "Команда", icon: "Users" },
        { id: "faq", label: "FAQ", icon: "HelpCircle" },
      ],
    },
    {
      label: "Система",
      items: [
        { id: "media", label: "Медиабиблиотека", icon: "Image" },
        { id: "design", label: "Дизайн", icon: "Palette" },
        ...(auth.can("users.manage") ? [{ id: "users" as Tab, label: "Пользователи", icon: "UserCog" }] : []),
        ...(auth.can("secrets.manage") ? [{ id: "secrets" as Tab, label: "Секреты API", icon: "KeyRound" }] : []),
        { id: "password", label: "Мой пароль", icon: "Lock" },
      ],
    },
  ];

  void setUnreadLeads;
  void newPassword;
  void setNewPassword;

  return (
    <div className="min-h-screen bg-[#080c14] text-white flex flex-col">
      {preview && <PreviewPanel onClose={() => setPreview(false)} />}

      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#0a0f1a] flex-shrink-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
            >
              <Icon name="Menu" size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <Icon name="Settings" size={14} className="text-[#080c14]" />
              </div>
              <span className="font-bold font-['Oswald'] text-base">Панель управления</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveMsg && (
              <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${saveMsg === "Сохранено!" ? "bg-green-500/20 text-green-400 border border-green-500/20" : "bg-red-500/20 text-red-400 border border-red-500/20"}`}>
                {saveMsg === "Сохранено!" ? "✓ " : "✗ "}{saveMsg}
              </span>
            )}
            <button onClick={() => setPreview(true)} className="text-gray-400 hover:text-cyan-400 text-sm flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20">
              <Icon name="Monitor" size={14} />
              <span className="hidden sm:inline">Предпросмотр</span>
            </button>
            <a href="/" target="_blank" className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5">
              <Icon name="ExternalLink" size={14} />
              <span className="hidden sm:inline">Сайт</span>
            </a>
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <div className="text-xs text-white font-medium">{auth.user?.display_name || auth.user?.username}</div>
                <div className="text-xs text-gray-500 capitalize">{auth.user?.role === "owner" ? "Владелец" : auth.user?.role === "editor" ? "Редактор" : "Просмотр"}</div>
              </div>
              <button onClick={auth.logout} className="text-gray-400 hover:text-red-400 text-sm flex items-center gap-1 transition-colors p-1.5 rounded-lg hover:bg-red-500/10" title="Выйти">
                <Icon name="LogOut" size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? "w-12" : "w-56"} flex-shrink-0 bg-[#0a0f1a] border-r border-white/10 overflow-y-auto transition-all duration-200 flex flex-col`}>
          <nav className="p-2 flex-1">
            {navGroups.map((group) => (
              <div key={group.label} className="mb-3">
                {!sidebarCollapsed && (
                  <div className="px-3 py-1 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                    {group.label}
                  </div>
                )}
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all mb-0.5 relative ${
                      tab === item.id
                        ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/25"
                        : "text-gray-400 hover:text-white border border-transparent hover:bg-white/5"
                    }`}
                  >
                    <Icon name={item.icon as Parameters<typeof Icon>[0]["name"]} size={15} className="flex-shrink-0" />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    {item.badge && item.badge > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold min-w-[18px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
                {!sidebarCollapsed && <div className="h-px bg-white/5 mt-2" />}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-5xl">
            {tab === "dashboard" && (
              <DashboardTab content={content} onNavigate={setTab} />
            )}
            {tab === "leads" && <LeadsTab password={password} cmsApiUrl={CMS_API_URL} />}
            {tab === "history" && <HistoryTab token={auth.token} cmsApiUrl={CMS_API_URL} />}
            {tab === "settings" && <SettingsTab content={content} password={password} save={save} saving={saving} />}
            {tab === "sections" && <SectionsTab content={content} save={save} saving={saving} />}
            {tab === "nav" && <NavTab content={content} password={password} save={save} saving={saving} />}
            {tab === "pages" && <PagesTab content={content} password={password} save={save} saving={saving} />}
            {tab === "services" && <ServicesTab content={content} password={password} save={save} saving={saving} />}
            {tab === "plans" && <PlansTab content={content} password={password} save={save} saving={saving} />}
            {tab === "pricing" && <PricingTab content={content} password={password} save={save} saving={saving} />}
            {tab === "calculator" && <CalculatorTab content={content} save={save} saving={saving} />}
            {tab === "videocalc" && <VideoCalcTab content={content} password={password} save={save} saving={saving} />}
            {tab === "whyus" && <WhyUsTab content={content} password={password} save={save} saving={saving} />}
            {tab === "quickorder" && <QuickOrderTab content={content} password={password} save={save} saving={saving} />}
            {tab === "projects" && <ProjectsTab content={content} password={password} save={save} saving={saving} />}
            {tab === "team" && <TeamTab content={content} password={password} save={save} saving={saving} />}
            {tab === "faq" && <FaqTab content={content} save={save} saving={saving} />}
            {tab === "media" && <MediaTab password={password} />}
            {tab === "design" && <DesignTab content={content} password={password} save={save} saving={saving} />}
            {tab === "users" && auth.can("users.manage") && (
              <UsersTab token={auth.token} authApiUrl={AUTH_API_URL} currentUser={auth.user!} />
            )}
            {tab === "secrets" && auth.can("secrets.manage") && <SecretsTab password={password} />}
            {tab === "password" && (
              <PasswordTab
                password={password}
                setPassword={() => {}}
                save={save}
                saving={saving}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function DashboardTab({ content, onNavigate }: { content: CmsContent; onNavigate: (tab: Tab) => void }) {
  const settings = content.settings as Record<string, string>;
  const stats = [
    { label: "Услуг", value: content.services?.length ?? 0, icon: "Briefcase", tab: "services" as Tab, color: "cyan" },
    { label: "Тарифов", value: content.plans?.length ?? 0, icon: "CreditCard", tab: "plans" as Tab, color: "blue" },
    { label: "Проектов", value: content.projects?.length ?? 0, icon: "FolderOpen", tab: "projects" as Tab, color: "purple" },
    { label: "Пунктов меню", value: content.nav_items?.length ?? 0, icon: "Menu", tab: "nav" as Tab, color: "green" },
    { label: "FAQ вопросов", value: content.faq?.length ?? 0, icon: "HelpCircle", tab: "faq" as Tab, color: "orange" },
    { label: "Страниц", value: content.pages?.length ?? 0, icon: "FileText", tab: "pages" as Tab, color: "pink" },
  ];

  const colorMap: Record<string, string> = {
    cyan: "border-cyan-500/20 bg-cyan-500/5 text-cyan-400",
    blue: "border-blue-500/20 bg-blue-500/5 text-blue-400",
    purple: "border-purple-500/20 bg-purple-500/5 text-purple-400",
    green: "border-green-500/20 bg-green-500/5 text-green-400",
    orange: "border-orange-500/20 bg-orange-500/5 text-orange-400",
    pink: "border-pink-500/20 bg-pink-500/5 text-pink-400",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-['Oswald'] text-white mb-1">Дашборд</h1>
        <p className="text-gray-400 text-sm">{settings?.company_name || "ИТК Аплинк-IT"} — панель управления сайтом</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {stats.map((s) => (
          <button key={s.tab} onClick={() => onNavigate(s.tab)}
            className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] ${colorMap[s.color]}`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon name={s.icon as Parameters<typeof Icon>[0]["name"]} size={16} />
              <span className="text-xs text-gray-400">{s.label}</span>
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-card neon-border rounded-xl p-5">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Icon name="Phone" size={16} className="text-cyan-400" />
            Контакты
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Телефон</span>
              <span className="text-white">{settings?.phone || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="text-white">{settings?.email_info || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Адрес</span>
              <span className="text-white text-right max-w-[180px] truncate">{settings?.address || "—"}</span>
            </div>
          </div>
          <button onClick={() => onNavigate("settings")} className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
            <Icon name="Edit" size={12} />
            Редактировать
          </button>
        </div>

        <div className="glass-card neon-border rounded-xl p-5">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Icon name="Zap" size={16} className="text-cyan-400" />
            Быстрые действия
          </h3>
          <div className="space-y-2">
            {[
              { label: "Добавить услугу", tab: "services" as Tab, icon: "Plus" },
              { label: "Новый пункт прайса", tab: "pricing" as Tab, icon: "Plus" },
              { label: "Управление секциями", tab: "sections" as Tab, icon: "Layers" },
              { label: "История изменений", tab: "history" as Tab, icon: "History" },
            ].map((a) => (
              <button key={a.tab} onClick={() => onNavigate(a.tab)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-300 hover:text-white transition-all text-left">
                <Icon name={a.icon as Parameters<typeof Icon>[0]["name"]} size={14} className="text-cyan-400" />
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
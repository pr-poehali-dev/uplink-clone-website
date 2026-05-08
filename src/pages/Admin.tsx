import { useState, useEffect, useCallback } from "react";
import { CmsContent, clearCmsCache } from "@/hooks/useCmsContent";
import { useAdminAuth, AUTH_API_URL, CMS_API_URL } from "@/hooks/useAdminAuth";
import { ServicesTab } from "./admin/AdminTabs";
import { ProjectsTab, TeamTab, PasswordTab } from "./admin/AdminTabs2";
import { CalculatorTab } from "./admin/CalculatorTab";
import { SecretsTab } from "./admin/SecretsTab";
import { PreviewPanel } from "./admin/PreviewPanel";
import { LeadsTab } from "./admin/LeadsTab";
import { PricingTab } from "./admin/PricingTab";
import { NavTab } from "./admin/NavTab";
import { VideoCalcTab } from "./admin/VideoCalcTab";
import { PagesTab } from "./admin/PagesTab";
import { MediaTab } from "./admin/MediaTab";
import { DesignTab } from "./admin/DesignTab";
import { UsersTab } from "./admin/UsersTab";
import { HistoryTab } from "./admin/HistoryTab";
import { SeoTab } from "./admin/SeoTab";
import { AdminLogin } from "./admin/AdminLogin";
import { AdminHeader } from "./admin/AdminHeader";
import { AdminSidebar, Tab, NavGroup } from "./admin/AdminSidebar";
import { DashboardTab } from "./admin/AdminDashboard";
import { HomePageTab } from "./admin/HomePageTab";
import { PrivacyPageTab } from "./admin/PrivacyPageTab";
import { LiveChatTab } from "./admin/LiveChatTab";
import { SectionsAnimTab } from "./admin/SectionsAnimTab";

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

  const loadContent = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const r = await fetch(CMS_API_URL);
      const data = await r.json();
      if (data.settings) setContent(data);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (auth.isAuthed) loadContent();
  }, [auth.isAuthed]); // eslint-disable-line react-hooks/exhaustive-deps

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
        clearCmsCache();
        showMsg("Сохранено!");
        loadContent(true);
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
    if (result && "setupRequired" in result && result.setupRequired) return;
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
    return (
      <AdminLogin
        loginStep={loginStep}
        loginUsername={loginUsername}
        loginPassword={loginPassword}
        setupNewPassword={setupNewPassword}
        setupConfirm={setupConfirm}
        setupError={setupError}
        setupRequired={auth.setupRequired}
        authLoading={auth.loading}
        authError={auth.error}
        onSetLoginUsername={setLoginUsername}
        onSetLoginPassword={setLoginPassword}
        onSetSetupNewPassword={setSetupNewPassword}
        onSetSetupConfirm={setSetupConfirm}
        onUsernameStep={handleUsernameStep}
        onLogin={handleLogin}
        onSetupPassword={handleSetupPassword}
        onBackToUsername={() => { setLoginStep("username"); setLoginPassword(""); }}
      />
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
        { id: "livechat", label: "Живой чат", icon: "MessageCircle" },
        { id: "history", label: "История правок", icon: "History" },
      ],
    },
    {
      label: "Страницы",
      items: [
        { id: "home", label: "Главная", icon: "Home" },
        { id: "services", label: "Услуги", icon: "Briefcase" },
        { id: "pricing", label: "Прайс", icon: "Receipt" },
        { id: "privacy", label: "Конфиденциальность", icon: "ShieldCheck" },
      ],
    },
    {
      label: "Оформление",
      items: [
        { id: "design", label: "Дизайн", icon: "Palette" },
        { id: "sections_anim", label: "Анимации секций", icon: "Sparkles" },
        { id: "media", label: "Медиабиблиотека", icon: "Image" },
        { id: "nav", label: "Навигация", icon: "Menu" },
      ],
    },
    {
      label: "Система",
      items: [
        { id: "seo", label: "SEO", icon: "TrendingUp" },
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

      <AdminHeader
        saveMsg={saveMsg}
        sidebarCollapsed={sidebarCollapsed}
        user={auth.user}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onOpenPreview={() => setPreview(true)}
        onLogout={auth.logout}
      />

      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar
          tab={tab}
          collapsed={sidebarCollapsed}
          navGroups={navGroups}
          onTabChange={setTab}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-5xl">
            {tab === "dashboard" && <DashboardTab content={content} onNavigate={setTab} />}
            {tab === "leads" && <LeadsTab password={password} cmsApiUrl={CMS_API_URL} />}
            {tab === "livechat" && <LiveChatTab token={auth.token} />}
            {tab === "history" && <HistoryTab token={auth.token} cmsApiUrl={CMS_API_URL} />}

            {/* Страницы */}
            {tab === "home" && <HomePageTab content={content} password={password} save={save} saving={saving} />}
            {tab === "services" && <ServicesTab content={content} password={password} save={save} saving={saving} />}
            {tab === "pricing" && <PricingTab content={content} password={password} save={save} saving={saving} />}
            {tab === "privacy" && <PrivacyPageTab content={content} password={password} save={save} saving={saving} />}

            {/* Оформление */}
            {tab === "design" && <DesignTab content={content} password={password} save={save} saving={saving} />}
            {tab === "sections_anim" && <SectionsAnimTab content={content} save={save} saving={saving} />}
            {tab === "media" && <MediaTab password={password} />}
            {tab === "nav" && <NavTab content={content} password={password} save={save} saving={saving} />}

            {/* Система */}
            {tab === "seo" && <SeoTab token={auth.token} />}
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

            {/* Устаревшие вкладки — доступны по прямому переходу */}
            {tab === "pages" && <PagesTab content={content} password={password} save={save} saving={saving} />}
            {tab === "calculator" && <CalculatorTab content={content} save={save} saving={saving} />}
            {tab === "videocalc" && <VideoCalcTab content={content} password={password} save={save} saving={saving} />}
            {tab === "projects" && <ProjectsTab content={content} password={password} save={save} saving={saving} />}
            {tab === "team" && <TeamTab content={content} password={password} save={save} saving={saving} />}
          </div>
        </main>
      </div>
    </div>
  );
}
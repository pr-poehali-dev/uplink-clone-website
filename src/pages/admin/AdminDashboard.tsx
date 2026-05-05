import { CmsContent } from "@/hooks/useCmsContent";
import Icon from "@/components/ui/icon";
import { Tab } from "./AdminSidebar";

interface DashboardTabProps {
  content: CmsContent;
  onNavigate: (tab: Tab) => void;
}

export function DashboardTab({ content, onNavigate }: DashboardTabProps) {
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
        <p className="text-gray-400 text-sm">
          {settings?.company_name || "ИТК Аплинк-IT"} — панель управления сайтом
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {stats.map((s) => (
          <button
            key={s.tab}
            onClick={() => onNavigate(s.tab)}
            className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] ${colorMap[s.color]}`}
          >
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
              <span className="text-white text-right max-w-[180px] truncate">
                {settings?.address || "—"}
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigate("settings")}
            className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
          >
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
              <button
                key={a.tab}
                onClick={() => onNavigate(a.tab)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-300 hover:text-white transition-all text-left"
              >
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

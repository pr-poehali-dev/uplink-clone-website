import { useState } from "react";
import { CmsContent } from "@/hooks/useCmsContent";
import { SaveFn } from "./AdminShared";
import Icon from "@/components/ui/icon";
import { SettingsTab } from "./AdminTabs";
import { SectionsTab } from "./SectionsTab";
import { WhyUsTab } from "./WhyUsTab";
import { PlansTab } from "./AdminTabs";
import { QuickOrderTab } from "./QuickOrderTab";
import { FaqTab } from "./FaqTab";
import { ProjectsTab, TeamTab } from "./AdminTabs2";

interface Props {
  content: CmsContent;
  password: string;
  save: SaveFn;
  saving: boolean;
}

type HomeTab =
  | "sections"
  | "settings"
  | "whyus"
  | "plans"
  | "quickorder"
  | "faq"
  | "projects"
  | "team";

const HOME_TABS: { id: HomeTab; label: string; icon: string }[] = [
  { id: "sections", label: "Секции", icon: "Layers" },
  { id: "settings", label: "Общие настройки", icon: "Settings" },
  { id: "whyus", label: "Почему мы", icon: "Star" },
  { id: "plans", label: "Тарифы", icon: "CreditCard" },
  { id: "quickorder", label: "Быстрый заказ", icon: "Zap" },
  { id: "faq", label: "FAQ", icon: "HelpCircle" },
  { id: "projects", label: "Проекты", icon: "FolderOpen" },
  { id: "team", label: "Команда", icon: "Users" },
];

export function HomePageTab({ content, password, save, saving }: Props) {
  const [activeTab, setActiveTab] = useState<HomeTab>("sections");

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <Icon name="Home" size={20} className="text-cyan-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white font-['Oswald']">Главная страница</h2>
          <p className="text-gray-500 text-xs">Управление секциями и контентом главной страницы</p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="ml-auto flex items-center gap-1.5 text-xs text-cyan-400 hover:underline"
        >
          <Icon name="ExternalLink" size={12} />
          Открыть сайт
        </a>
      </div>

      {/* Вкладки */}
      <div className="flex flex-wrap gap-1 mb-6 bg-white/5 rounded-xl p-1">
        {HOME_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === t.id
                ? "bg-cyan-500/20 text-cyan-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Icon name={t.icon as "Layers"} size={13} />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "sections" && <SectionsTab content={content} save={save} saving={saving} />}
      {activeTab === "settings" && <SettingsTab content={content} password={password} save={save} saving={saving} />}
      {activeTab === "whyus" && <WhyUsTab content={content} password={password} save={save} saving={saving} />}
      {activeTab === "plans" && <PlansTab content={content} password={password} save={save} saving={saving} />}
      {activeTab === "quickorder" && <QuickOrderTab content={content} password={password} save={save} saving={saving} />}
      {activeTab === "faq" && <FaqTab content={content} save={save} saving={saving} />}
      {activeTab === "projects" && <ProjectsTab content={content} password={password} save={save} saving={saving} />}
      {activeTab === "team" && <TeamTab content={content} password={password} save={save} saving={saving} />}
    </div>
  );
}

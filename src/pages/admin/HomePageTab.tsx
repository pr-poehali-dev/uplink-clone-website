import { useState, useEffect } from "react";
import { CmsContent, CmsPage } from "@/hooks/useCmsContent";
import { SaveButton, SaveFn } from "./AdminShared";
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
  | "seo"
  | "whyus"
  | "plans"
  | "quickorder"
  | "faq"
  | "projects"
  | "team";

const HOME_TABS: { id: HomeTab; label: string; icon: string }[] = [
  { id: "sections", label: "Секции", icon: "Layers" },
  { id: "settings", label: "Общие настройки", icon: "Settings" },
  { id: "seo", label: "SEO", icon: "Search" },
  { id: "whyus", label: "Почему мы", icon: "Star" },
  { id: "plans", label: "Тарифы", icon: "CreditCard" },
  { id: "quickorder", label: "Быстрый заказ", icon: "Zap" },
  { id: "faq", label: "FAQ", icon: "HelpCircle" },
  { id: "projects", label: "Проекты", icon: "FolderOpen" },
  { id: "team", label: "Команда", icon: "Users" },
];

const cls = {
  input: "px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 w-full transition-colors",
  textarea: "px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 w-full transition-colors resize-none",
  label: "block text-gray-400 text-xs mb-1",
};

const SEO_FIELDS: { key: keyof CmsPage; label: string; hint?: string; rows?: number }[] = [
  { key: "seo_title", label: "SEO Title", hint: "Отображается во вкладке браузера и в результатах поиска" },
  { key: "seo_description", label: "SEO Description", hint: "Краткое описание для поисковиков (до 160 символов)", rows: 3 },
  { key: "og_title", label: "OG Title (для соцсетей)" },
  { key: "og_description", label: "OG Description (для соцсетей)", rows: 2 },
  { key: "og_image_url", label: "OG Image URL", hint: "Полный URL картинки для превью в соцсетях (1200×630 px)" },
];

function HomeSeoTab({ content, save, saving }: { content: CmsContent; save: SaveFn; saving: boolean }) {
  const [page, setPage] = useState<CmsPage | null>(null);

  useEffect(() => {
    const found = (content.pages ?? []).find((p) => p.route === "/");
    if (found) setPage({ ...found });
  }, [content.pages]);

  const update = (patch: Partial<CmsPage>) => setPage((prev) => prev ? { ...prev, ...patch } : prev);

  const handleSave = () => {
    if (!page) return;
    const all = (content.pages ?? []).map((p) => p.route === "/" ? page : p);
    save("save_pages", { items: all });
  };

  if (!page) return <div className="text-gray-500 text-sm p-4">Загрузка...</div>;

  return (
    <div className="glass-card neon-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center">
          <Icon name="Search" size={17} className="text-cyan-400" />
        </div>
        <div>
          <h3 className="text-white font-bold font-['Oswald'] text-lg leading-tight">SEO главной страницы</h3>
          <span className="text-gray-500 text-xs">Как сайт выглядит в поиске и соцсетях</span>
        </div>
      </div>
      <div className="space-y-4">
        {SEO_FIELDS.map(({ key, label, hint, rows }) => {
          const val = String(page[key] ?? "");
          return (
            <div key={key}>
              <label className={cls.label}>{label}</label>
              {rows ? (
                <textarea value={val} onChange={(e) => update({ [key]: e.target.value } as Partial<CmsPage>)} rows={rows} className={cls.textarea} />
              ) : (
                <input value={val} onChange={(e) => update({ [key]: e.target.value } as Partial<CmsPage>)} className={cls.input} />
              )}
              {hint && <p className="text-gray-600 text-xs mt-1">{hint}</p>}
              {key === "seo_title" && val.length > 0 && (
                <p className={`text-xs mt-1 ${val.length > 70 ? "text-yellow-500" : "text-gray-600"}`}>{val.length} / 70 символов</p>
              )}
              {key === "seo_description" && val.length > 0 && (
                <p className={`text-xs mt-1 ${val.length > 160 ? "text-yellow-500" : "text-gray-600"}`}>{val.length} / 160 символов</p>
              )}
            </div>
          );
        })}
      </div>
      <SaveButton onClick={handleSave} saving={saving} />
    </div>
  );
}

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
      {activeTab === "seo" && <HomeSeoTab content={content} save={save} saving={saving} />}
      {activeTab === "whyus" && <WhyUsTab content={content} password={password} save={save} saving={saving} />}
      {activeTab === "plans" && <PlansTab content={content} password={password} save={save} saving={saving} />}
      {activeTab === "quickorder" && <QuickOrderTab content={content} password={password} save={save} saving={saving} />}
      {activeTab === "faq" && <FaqTab content={content} save={save} saving={saving} />}
      {activeTab === "projects" && <ProjectsTab content={content} password={password} save={save} saving={saving} />}
      {activeTab === "team" && <TeamTab content={content} password={password} save={save} saving={saving} />}
    </div>
  );
}
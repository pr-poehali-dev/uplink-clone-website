import { useState, useEffect } from "react";
import { CmsContent, CmsPage } from "@/hooks/useCmsContent";
import { SaveButton, SaveFn } from "./AdminShared";
import Icon from "@/components/ui/icon";

interface Props {
  content: CmsContent;
  password: string;
  save: SaveFn;
  saving: boolean;
}

type PrivacyTab = "content" | "seo";

const cls = {
  input: "px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 w-full transition-colors",
  textarea: "px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 w-full transition-colors resize-none",
  label: "block text-gray-400 text-xs mb-1",
};

export function PrivacyPageTab({ content, save, saving }: Props) {
  const [activeTab, setActiveTab] = useState<PrivacyTab>("content");
  const [privacyText, setPrivacyText] = useState("");
  const [page, setPage] = useState<(CmsPage & { is_published?: boolean; metrika_counter?: string }) | null>(null);
  const [pages, setPages] = useState<CmsPage[]>([]);

  useEffect(() => {
    setPrivacyText(content.settings?.privacy_policy_content ?? "");
  }, [content.settings]);

  useEffect(() => {
    const all = [...(content.pages ?? [])];
    setPages(all);
    const found = all.find((p) => p.route === "/privacy");
    if (found) setPage(found as CmsPage & { is_published?: boolean; metrika_counter?: string });
  }, [content.pages]);

  const updatePage = (patch: Partial<CmsPage & { is_published?: boolean; metrika_counter?: string }>) => {
    if (!page) return;
    setPage({ ...page, ...patch });
    setPages((prev) => prev.map((p) => p.route === "/privacy" ? { ...p, ...patch } : p));
  };

  const handleSaveContent = () => {
    save("save_settings", { settings: { privacy_policy_content: privacyText } });
  };

  const handleSaveSeo = () => {
    save("save_pages", { items: pages });
  };

  const TABS = [
    { id: "content" as PrivacyTab, label: "Контент", icon: "FileText" },
    { id: "seo" as PrivacyTab, label: "SEO", icon: "Search" },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <Icon name="ShieldCheck" size={20} className="text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white font-['Oswald']">Конфиденциальность</h2>
          <p className="text-gray-500 text-xs">Политика конфиденциальности и SEO страницы</p>
        </div>
        <a
          href="/privacy"
          target="_blank"
          rel="noreferrer"
          className="ml-auto flex items-center gap-1.5 text-xs text-cyan-400 hover:underline"
        >
          <Icon name="ExternalLink" size={12} />
          Открыть страницу
        </a>
      </div>

      <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === t.id ? "bg-cyan-500/20 text-cyan-400" : "text-gray-400 hover:text-white"
            }`}
          >
            <Icon name={t.icon as "FileText"} size={13} />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "content" && (
        <div className="glass-card neon-border rounded-2xl p-5 space-y-4 max-w-3xl">
          <p className="text-gray-500 text-xs leading-relaxed">
            Текст политики конфиденциальности. Поддерживает простой текст с переносами строк.
          </p>
          <div>
            <label className={cls.label}>Текст политики</label>
            <textarea
              value={privacyText}
              onChange={(e) => setPrivacyText(e.target.value)}
              rows={20}
              className={cls.textarea + " font-mono text-xs resize-y"}
            />
          </div>
          <SaveButton onClick={handleSaveContent} saving={saving} />
        </div>
      )}

      {activeTab === "seo" && page && (
        <div className="glass-card neon-border rounded-2xl p-5 space-y-4 max-w-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-gray-400 text-xs font-mono">/privacy</span>
            <button
              onClick={() => updatePage({ is_published: !page.is_published })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                page.is_published !== false
                  ? "bg-green-500/15 text-green-400 border-green-500/25"
                  : "bg-gray-500/15 text-gray-400 border-gray-500/25"
              }`}
            >
              <Icon name={page.is_published !== false ? "Eye" : "EyeOff"} size={12} />
              {page.is_published !== false ? "Опубликована" : "Скрыта"}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className={cls.label}>SEO Title</label>
              <input value={page.seo_title ?? ""} onChange={(e) => updatePage({ seo_title: e.target.value })} className={cls.input} />
              {page.seo_title && (
                <p className={`text-xs mt-1 ${page.seo_title.length > 70 ? "text-yellow-500" : "text-gray-600"}`}>
                  {page.seo_title.length} / 70 символов
                </p>
              )}
            </div>
            <div>
              <label className={cls.label}>SEO Description</label>
              <textarea value={page.seo_description ?? ""} onChange={(e) => updatePage({ seo_description: e.target.value })} rows={2} className={cls.textarea} />
              {page.seo_description && (
                <p className={`text-xs mt-1 ${page.seo_description.length > 160 ? "text-yellow-500" : "text-gray-600"}`}>
                  {page.seo_description.length} / 160 символов
                </p>
              )}
            </div>
            <div>
              <label className={cls.label}>OG Title (для соцсетей)</label>
              <input value={page.og_title ?? ""} onChange={(e) => updatePage({ og_title: e.target.value })} className={cls.input} />
            </div>
            <div>
              <label className={cls.label}>OG Description (для соцсетей)</label>
              <textarea value={page.og_description ?? ""} onChange={(e) => updatePage({ og_description: e.target.value })} rows={2} className={cls.textarea} />
            </div>
          </div>

          {(page.seo_title || page.seo_description) && (
            <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02] space-y-1">
              <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-2">Предпросмотр в поиске</p>
              <p className="text-blue-400 text-sm font-medium truncate">{page.seo_title || "—"}</p>
              <p className="text-green-500 text-xs font-mono">https://yourdomain.ru/privacy</p>
              <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{page.seo_description || "—"}</p>
            </div>
          )}

          <div className="pt-2 border-t border-white/5">
            <SaveButton onClick={handleSaveSeo} saving={saving} />
          </div>
        </div>
      )}
    </div>
  );
}

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

const cls = {
  input:
    "px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 w-full transition-colors",
  textarea:
    "px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 w-full transition-colors resize-none",
  label: "block text-gray-400 text-xs mb-1",
};

const PAGE_ICON: Record<string, string> = {
  "/": "Home",
  "/pricing": "CreditCard",
  "/privacy": "ShieldCheck",
};

const ROUTE_LABEL: Record<string, string> = {
  "/": "Главная",
  "/pricing": "Прайс-лист",
  "/privacy": "Политика конфиденциальности",
};

const EDITABLE_FIELDS: {
  key: keyof CmsPage;
  label: string;
  hint?: string;
  rows?: number;
}[] = [
  {
    key: "seo_title",
    label: "SEO Title",
    hint: "Отображается во вкладке браузера и в результатах поиска",
  },
  {
    key: "seo_description",
    label: "SEO Description",
    hint: "Краткое описание страницы для поисковиков (до 160 символов)",
    rows: 2,
  },
  {
    key: "og_title",
    label: "OG Title (для соцсетей)",
  },
  {
    key: "og_description",
    label: "OG Description (для соцсетей)",
    rows: 2,
  },
  {
    key: "og_image_url",
    label: "OG Image URL",
    hint: "Полный URL картинки для превью в соцсетях (1200×630 px)",
  },
];

export function PagesTab({ content, save, saving }: Props) {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  useEffect(() => {
    const sorted = [...(content.pages ?? [])].sort((a, b) =>
      a.route.localeCompare(b.route)
    );
    setPages(sorted);
    if (sorted.length && selectedRoute === null) {
      setSelectedRoute(sorted[0].route);
    }
  }, [content.pages]);

  const selectedPage = pages.find((p) => p.route === selectedRoute) ?? null;

  const updatePage = (route: string, patch: Partial<CmsPage>) =>
    setPages((prev) =>
      prev.map((p) => (p.route === route ? { ...p, ...patch } : p))
    );

  const handleSave = () => {
    save("save_pages", { items: pages });
  };

  return (
    <div className="flex gap-4 min-h-0">
      {/* Sidebar */}
      <div className="w-52 flex-shrink-0 space-y-1">
        <p className="text-gray-500 text-xs px-2 mb-2 uppercase tracking-wider font-semibold">
          Страницы
        </p>
        {pages.map((page) => (
          <button
            key={page.route}
            onClick={() => setSelectedRoute(page.route)}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all text-left ${
              selectedRoute === page.route
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon
              name={(PAGE_ICON[page.route] ?? "FileText") as "Home"}
              size={14}
              className="flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="truncate font-medium">
                {ROUTE_LABEL[page.route] ?? page.route}
              </div>
              <div className="text-xs opacity-50 font-mono truncate">{page.route}</div>
            </div>
          </button>
        ))}

        {pages.length === 0 && (
          <p className="text-gray-600 text-xs px-2">Нет страниц</p>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 min-w-0">
        {!selectedPage ? (
          <div className="glass-card neon-border rounded-2xl p-10 flex items-center justify-center">
            <p className="text-gray-500 text-sm">Выберите страницу</p>
          </div>
        ) : (
          <div className="glass-card neon-border rounded-2xl p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <Icon
                  name={(PAGE_ICON[selectedPage.route] ?? "FileText") as "Home"}
                  size={17}
                  className="text-cyan-400"
                />
              </div>
              <div>
                <h3 className="text-white font-bold font-['Oswald'] text-lg leading-tight">
                  {ROUTE_LABEL[selectedPage.route] ?? selectedPage.route}
                </h3>
                <span className="text-gray-500 text-xs font-mono">
                  {selectedPage.route}
                </span>
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              {EDITABLE_FIELDS.map(({ key, label, hint, rows }) => {
                const val = String(selectedPage[key] ?? "");
                return (
                  <div key={key}>
                    <label className={cls.label}>{label}</label>
                    {rows ? (
                      <textarea
                        value={val}
                        onChange={(e) =>
                          updatePage(selectedPage.route, { [key]: e.target.value } as Partial<CmsPage>)
                        }
                        rows={rows}
                        className={cls.textarea}
                      />
                    ) : (
                      <input
                        value={val}
                        onChange={(e) =>
                          updatePage(selectedPage.route, { [key]: e.target.value } as Partial<CmsPage>)
                        }
                        className={cls.input}
                      />
                    )}
                    {hint && (
                      <p className="text-gray-600 text-xs mt-1">{hint}</p>
                    )}
                    {key === "seo_title" && val.length > 0 && (
                      <p className={`text-xs mt-1 ${val.length > 70 ? "text-yellow-500" : "text-gray-600"}`}>
                        {val.length} / 70 символов
                      </p>
                    )}
                    {key === "seo_description" && val.length > 0 && (
                      <p className={`text-xs mt-1 ${val.length > 160 ? "text-yellow-500" : "text-gray-600"}`}>
                        {val.length} / 160 символов
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* SEO preview */}
            {(selectedPage.seo_title || selectedPage.seo_description) && (
              <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02] space-y-1">
                <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-2">
                  Предпросмотр в поиске
                </p>
                <p className="text-blue-400 text-sm font-medium truncate">
                  {selectedPage.seo_title || "—"}
                </p>
                <p className="text-green-500 text-xs font-mono">
                  {`https://yourdomain.ru${selectedPage.route}`}
                </p>
                <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                  {selectedPage.seo_description || "—"}
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-white/5">
              <SaveButton onClick={handleSave} saving={saving} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

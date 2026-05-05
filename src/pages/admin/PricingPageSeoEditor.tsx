import { CmsPage } from "@/hooks/useCmsContent";
import { SaveButton, SaveFn } from "./AdminShared";
import Icon from "@/components/ui/icon";
import { cls } from "./pricing-shared";

type PricingPageType = CmsPage & { is_published?: boolean; metrika_counter?: string };

interface Props {
  pricingPage: PricingPageType | null;
  saving: boolean;
  onUpdatePage: (patch: Partial<PricingPageType>) => void;
  onSave: () => void;
}

export function PricingPageSeoEditor({ pricingPage, saving, onUpdatePage, onSave }: Props) {
  if (!pricingPage) {
    return (
      <div className="glass-card neon-border rounded-2xl p-8 text-center text-gray-500 text-sm max-w-2xl">
        Данные страницы /pricing не найдены в CMS
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="glass-card neon-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <span className="text-gray-400 text-xs font-mono">/pricing</span>
          <button
            onClick={() => onUpdatePage({ is_published: pricingPage.is_published === false ? true : false })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              pricingPage.is_published !== false
                ? "bg-green-500/15 text-green-400 border-green-500/25"
                : "bg-gray-500/15 text-gray-400 border-gray-500/25"
            }`}
          >
            <Icon name={pricingPage.is_published !== false ? "Eye" : "EyeOff"} size={12} />
            {pricingPage.is_published !== false ? "Опубликована" : "Скрыта"}
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={cls.label}>SEO Title</label>
            <input
              value={pricingPage.seo_title ?? ""}
              onChange={(e) => onUpdatePage({ seo_title: e.target.value })}
              className={cls.input}
            />
            {pricingPage.seo_title && (
              <p className={`text-xs mt-1 ${pricingPage.seo_title.length > 70 ? "text-yellow-500" : "text-gray-600"}`}>
                {pricingPage.seo_title.length} / 70 символов
              </p>
            )}
          </div>

          <div>
            <label className={cls.label}>SEO Description</label>
            <textarea
              value={pricingPage.seo_description ?? ""}
              onChange={(e) => onUpdatePage({ seo_description: e.target.value })}
              rows={2}
              className={cls.textarea}
            />
            {pricingPage.seo_description && (
              <p className={`text-xs mt-1 ${pricingPage.seo_description.length > 160 ? "text-yellow-500" : "text-gray-600"}`}>
                {pricingPage.seo_description.length} / 160 символов
              </p>
            )}
          </div>

          <div>
            <label className={cls.label}>OG Title (для соцсетей)</label>
            <input
              value={pricingPage.og_title ?? ""}
              onChange={(e) => onUpdatePage({ og_title: e.target.value })}
              className={cls.input}
            />
          </div>

          <div>
            <label className={cls.label}>OG Description (для соцсетей)</label>
            <textarea
              value={pricingPage.og_description ?? ""}
              onChange={(e) => onUpdatePage({ og_description: e.target.value })}
              rows={2}
              className={cls.textarea}
            />
          </div>
        </div>

        {(pricingPage.seo_title || pricingPage.seo_description) && (
          <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02] space-y-1">
            <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-2">Предпросмотр в поиске</p>
            <p className="text-blue-400 text-sm font-medium truncate">{pricingPage.seo_title || "—"}</p>
            <p className="text-green-500 text-xs font-mono">https://yourdomain.ru/pricing</p>
            <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{pricingPage.seo_description || "—"}</p>
          </div>
        )}
      </div>

      <SaveButton onClick={onSave} saving={saving} />
    </div>
  );
}

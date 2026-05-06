import { useState } from "react";
import { CmsService } from "@/hooks/useCmsContent";
import Icon from "@/components/ui/icon";
import { SaveFn } from "./AdminShared";
import { getStoredToken } from "@/hooks/useAdminAuth";
import { AiField, Field } from "./ServiceEditorShared";

interface Props {
  service: CmsService;
  save: SaveFn;
  saving: boolean;
}

export function ServiceInfoEditor({ service, save, saving }: Props) {
  const [s, setS] = useState({ ...service });
  const token = getStoredToken();
  const svcCtx = `Услуга: ${service.title}. Компания: Аплинк-IT (IT-аутсорсинг, Воронеж).`;

  const handleSave = () => {
    save("save_service", { service: s, order: [] });
  };

  return (
    <div className="space-y-3">
      <Field label="URL страницы (slug, латиницей)" placeholder="it-outsourcing">
        <input
          value={s.slug || ""}
          onChange={(e) => setS({ ...s, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
          placeholder="it-outsourcing"
        />
      </Field>

      <AiField
        label="Краткое описание (для меню и карточки)"
        token={token}
        fieldHint="краткое описание IT-услуги для карточки (1-2 предложения)"
        context={svcCtx}
        onResult={(t) => setS({ ...s, short_desc: t })}
      >
        <textarea
          value={s.short_desc || ""}
          onChange={(e) => setS({ ...s, short_desc: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 resize-none"
        />
      </AiField>

      <AiField
        label="Заголовок hero-блока"
        token={token}
        fieldHint="короткий цепляющий заголовок для hero-блока страницы услуги (до 8 слов)"
        context={svcCtx}
        onResult={(t) => setS({ ...s, hero_title: t })}
      >
        <input
          value={s.hero_title || ""}
          onChange={(e) => setS({ ...s, hero_title: e.target.value })}
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
        />
      </AiField>

      <AiField
        label="Подзаголовок hero-блока"
        token={token}
        fieldHint="подзаголовок hero-блока страницы услуги (1-2 предложения, конкретные выгоды)"
        context={svcCtx}
        onResult={(t) => setS({ ...s, hero_subtitle: t })}
      >
        <textarea
          value={s.hero_subtitle || ""}
          onChange={(e) => setS({ ...s, hero_subtitle: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 resize-none"
        />
      </AiField>

      <AiField
        label="Полное описание"
        token={token}
        fieldHint="полное описание IT-услуги для страницы (3-5 абзацев: что это, как работаем, что получает клиент)"
        context={svcCtx}
        onResult={(t) => setS({ ...s, full_description: t })}
      >
        <textarea
          value={s.full_description || ""}
          onChange={(e) => setS({ ...s, full_description: e.target.value })}
          rows={5}
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 resize-none"
        />
      </AiField>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Цена (от)">
          <input
            value={s.price_from || ""}
            onChange={(e) => setS({ ...s, price_from: e.target.value })}
            placeholder="от 7 000 ₽/мес"
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
          />
        </Field>
        <Field label="Для кого (короткий блок)">
          <input
            value={s.for_whom || ""}
            onChange={(e) => setS({ ...s, for_whom: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3 pt-3 border-t border-white/5">
        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">SEO</div>
        <AiField
          label="SEO Title (тег title)"
          token={token}
          fieldHint="SEO title для страницы услуги (до 65 символов, ключевые слова + город)"
          context={svcCtx}
          onResult={(t) => setS({ ...s, seo_title: t })}
        >
          <input
            value={s.seo_title || ""}
            onChange={(e) => setS({ ...s, seo_title: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
          />
        </AiField>
        <AiField
          label="SEO Description (мета-описание)"
          token={token}
          fieldHint="SEO description для страницы услуги (до 155 символов, конкретные выгоды + CTA)"
          context={svcCtx}
          onResult={(t) => setS({ ...s, seo_description: t })}
        >
          <textarea
            value={s.seo_description || ""}
            onChange={(e) => setS({ ...s, seo_description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 resize-none"
          />
        </AiField>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-neon px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 disabled:opacity-60"
      >
        <Icon name="Save" size={16} />
        Сохранить страницу
      </button>
    </div>
  );
}

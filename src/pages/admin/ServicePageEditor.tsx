import { useState } from "react";
import { CmsService, CmsServiceBenefit, CmsServiceStep, CmsServiceFaq } from "@/hooks/useCmsContent";
import Icon from "@/components/ui/icon";
import { SaveFn } from "./AdminShared";
import { AiAssistantButton } from "@/components/AiAssistant";
import { getStoredToken } from "@/hooks/useAdminAuth";
import { QuickAuditBadge } from "./QuickAuditBadge";

interface Props {
  service: CmsService;
  save: SaveFn;
  saving: boolean;
}

export function ServicePageEditor({ service, save, saving }: Props) {
  const [tab, setTab] = useState<"info" | "benefits" | "steps" | "faq">("info");

  const subTabs: { id: typeof tab; label: string; icon: string }[] = [
    { id: "info", label: "Контент страницы", icon: "FileText" },
    { id: "benefits", label: "Преимущества", icon: "Sparkles" },
    { id: "steps", label: "Этапы", icon: "Workflow" },
    { id: "faq", label: "FAQ", icon: "HelpCircle" },
  ];

  return (
    <div className="mt-6 pt-6 border-t border-cyan-500/15">
      <div className="relative flex items-center gap-2 mb-1">
        <Icon name="LayoutGrid" size={16} className="text-cyan-400" />
        <h4 className="text-white font-bold font-['Oswald']">Страница услуги</h4>
        {service.slug && (
          <a
            href={`/services/${service.slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
          >
            <Icon name="ExternalLink" size={12} />
            Открыть страницу
          </a>
        )}
        <QuickAuditBadge slug={service.slug || ""} token={getStoredToken()} />
      </div>
      {!service.slug && (
        <p className="text-amber-400/80 text-xs mb-3 flex items-start gap-1.5">
          <Icon name="AlertTriangle" size={12} className="mt-0.5 flex-shrink-0" />
          Не задан slug — страница не будет доступна. Заполните поле slug ниже.
        </p>
      )}

      <div className="flex flex-wrap gap-1 mb-4 bg-white/5 rounded-xl p-1">
        {subTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              tab === t.id
                ? "bg-cyan-500/20 text-cyan-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Icon name={t.icon as "FileText"} size={12} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "info" && <ServiceInfoEditor service={service} save={save} saving={saving} />}
      {tab === "benefits" && <BenefitsEditor service={service} save={save} saving={saving} />}
      {tab === "steps" && <StepsEditor service={service} save={save} saving={saving} />}
      {tab === "faq" && <ServiceFaqEditor service={service} save={save} saving={saving} />}
    </div>
  );
}

function AiBtn({ token, fieldHint, context, onResult }: { token: string; fieldHint: string; context: string; onResult: (t: string) => void }) {
  const [open, setOpen] = useState(false);
  if (!token) return null;
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-gray-600 hover:text-purple-400 transition-colors"
      >
        <Icon name="Sparkles" size={10} />ИИ
      </button>
    );
  }
  return (
    <AiAssistantButton
      token={token}
      fieldHint={fieldHint}
      context={context}
      onResult={(t) => { onResult(t); setOpen(false); }}
    />
  );
}

function ServiceInfoEditor({ service, save, saving }: Props) {
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

function BenefitsEditor({ service, save, saving }: Props) {
  const [items, setItems] = useState<CmsServiceBenefit[]>(
    (service.benefits || []).filter((b) => b.title !== "[удалено]")
  );
  const token = getStoredToken();
  const svcCtx = `Услуга: ${service.title}. Компания: Аплинк-IT.`;

  const add = () => {
    setItems([...items, { id: -Date.now(), sort_order: items.length + 1, icon: "Check", title: "Новое преимущество", description: "" }]);
  };
  const remove = (id: number) => setItems(items.filter((i) => i.id !== id));
  const update = (id: number, patch: Partial<CmsServiceBenefit>) =>
    setItems(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const handleSave = () => save("save_service_extras", {
    service_id: service.id,
    kind: "benefits",
    items: items.map((i) => i.id < 0 ? { ...i, id: undefined } : i),
  });

  return (
    <div className="space-y-3">
      {items.map((b) => (
        <div key={b.id} className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
          <div className="grid grid-cols-[100px_1fr_auto] gap-2 items-start">
            <input
              value={b.icon}
              onChange={(e) => update(b.id, { icon: e.target.value })}
              placeholder="Lucide icon"
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500/50"
            />
            <input
              value={b.title}
              onChange={(e) => update(b.id, { title: e.target.value })}
              placeholder="Заголовок"
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
            />
            <button onClick={() => remove(b.id)} className="p-2 text-gray-500 hover:text-red-400">
              <Icon name="Trash2" size={14} />
            </button>
          </div>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-gray-600 text-xs">Описание</span>
            <AiBtn
              token={token}
              fieldHint={`описание преимущества "${b.title}" для IT-услуги (1-2 предложения)`}
              context={svcCtx}
              onResult={(t) => update(b.id, { description: t })}
            />
          </div>
          <textarea
            value={b.description || ""}
            onChange={(e) => update(b.id, { description: e.target.value })}
            placeholder="Описание"
            rows={2}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 resize-none"
          />
        </div>
      ))}
      <div className="flex gap-2">
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-cyan-400 border border-dashed border-cyan-500/30 hover:bg-cyan-500/5">
          <Icon name="Plus" size={14} />Добавить преимущество
        </button>
        <button onClick={handleSave} disabled={saving} className="btn-neon px-5 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 disabled:opacity-60 ml-auto">
          <Icon name="Save" size={14} />Сохранить
        </button>
      </div>
    </div>
  );
}

function StepsEditor({ service, save, saving }: Props) {
  const [items, setItems] = useState<CmsServiceStep[]>(
    (service.steps || []).filter((s) => s.step_title !== "[удалено]")
  );
  const token = getStoredToken();
  const svcCtx = `Услуга: ${service.title}. Компания: Аплинк-IT.`;

  const add = () => setItems([...items, { id: -Date.now(), sort_order: items.length + 1, step_title: "Новый этап", step_description: "" }]);
  const remove = (id: number) => setItems(items.filter((i) => i.id !== id));
  const update = (id: number, patch: Partial<CmsServiceStep>) =>
    setItems(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const handleSave = () => save("save_service_extras", {
    service_id: service.id,
    kind: "steps",
    items: items.map((i) => i.id < 0 ? { ...i, id: undefined } : i),
  });

  return (
    <div className="space-y-3">
      {items.map((st, i) => (
        <div key={st.id} className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {i + 1}
            </div>
            <input
              value={st.step_title}
              onChange={(e) => update(st.id, { step_title: e.target.value })}
              placeholder="Название этапа"
              className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
            />
            <button onClick={() => remove(st.id)} className="p-2 text-gray-500 hover:text-red-400">
              <Icon name="Trash2" size={14} />
            </button>
          </div>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-gray-600 text-xs">Описание</span>
            <AiBtn
              token={token}
              fieldHint={`описание этапа "${st.step_title}" при подключении IT-услуги (1-2 предложения)`}
              context={svcCtx}
              onResult={(t) => update(st.id, { step_description: t })}
            />
          </div>
          <textarea
            value={st.step_description || ""}
            onChange={(e) => update(st.id, { step_description: e.target.value })}
            placeholder="Описание"
            rows={2}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 resize-none"
          />
        </div>
      ))}
      <div className="flex gap-2">
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-cyan-400 border border-dashed border-cyan-500/30 hover:bg-cyan-500/5">
          <Icon name="Plus" size={14} />Добавить этап
        </button>
        <button onClick={handleSave} disabled={saving} className="btn-neon px-5 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 disabled:opacity-60 ml-auto">
          <Icon name="Save" size={14} />Сохранить
        </button>
      </div>
    </div>
  );
}

function ServiceFaqEditor({ service, save, saving }: Props) {
  const [items, setItems] = useState<CmsServiceFaq[]>(
    (service.faq || []).filter((f) => f.question !== "[удалено]")
  );
  const token = getStoredToken();
  const svcCtx = `Услуга: ${service.title}. Компания: Аплинк-IT (IT-аутсорсинг, Воронеж).`;

  const add = () => setItems([...items, { id: -Date.now(), sort_order: items.length + 1, question: "Новый вопрос", answer: "" }]);
  const remove = (id: number) => setItems(items.filter((i) => i.id !== id));
  const update = (id: number, patch: Partial<CmsServiceFaq>) =>
    setItems(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const handleSave = () => save("save_service_extras", {
    service_id: service.id,
    kind: "faq",
    items: items.map((i) => i.id < 0 ? { ...i, id: undefined } : i),
  });

  return (
    <div className="space-y-3">
      {items.map((f) => (
        <div key={f.id} className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
          <div className="flex gap-2">
            <input
              value={f.question}
              onChange={(e) => update(f.id, { question: e.target.value })}
              placeholder="Вопрос"
              className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
            />
            <button onClick={() => remove(f.id)} className="p-2 text-gray-500 hover:text-red-400">
              <Icon name="Trash2" size={14} />
            </button>
          </div>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-gray-600 text-xs">Ответ</span>
            <AiBtn
              token={token}
              fieldHint={`развёрнутый ответ на вопрос клиента об IT-услуге`}
              context={`${svcCtx} Вопрос: ${f.question}`}
              onResult={(t) => update(f.id, { answer: t })}
            />
          </div>
          <textarea
            value={f.answer}
            onChange={(e) => update(f.id, { answer: e.target.value })}
            placeholder="Ответ"
            rows={3}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 resize-none"
          />
        </div>
      ))}
      <div className="flex gap-2">
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-cyan-400 border border-dashed border-cyan-500/30 hover:bg-cyan-500/5">
          <Icon name="Plus" size={14} />Добавить вопрос
        </button>
        <button onClick={handleSave} disabled={saving} className="btn-neon px-5 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 disabled:opacity-60 ml-auto">
          <Icon name="Save" size={14} />Сохранить
        </button>
      </div>
    </div>
  );
}

function AiField({ label, token, fieldHint, context, onResult, children }: {
  label: string;
  token: string;
  fieldHint: string;
  context: string;
  onResult: (t: string) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-gray-400 text-xs">{label}</label>
        {token && !open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-purple-400 transition-colors"
          >
            <Icon name="Sparkles" size={10} />ИИ
          </button>
        )}
      </div>
      {children}
      {open && (
        <AiAssistantButton
          token={token}
          fieldHint={fieldHint}
          context={context}
          onResult={(t) => { onResult(t); setOpen(false); }}
        />
      )}
    </div>
  );
}

function Field({ label, children, placeholder: _ }: { label: string; children: React.ReactNode; placeholder?: string }) {
  return (
    <div>
      <label className="block text-gray-400 text-xs mb-1">{label}</label>
      {children}
    </div>
  );
}
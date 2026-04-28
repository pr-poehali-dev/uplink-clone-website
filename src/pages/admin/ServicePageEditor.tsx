import { useState } from "react";
import { CmsService, CmsServiceBenefit, CmsServiceStep, CmsServiceFaq } from "@/hooks/useCmsContent";
import Icon from "@/components/ui/icon";
import { SaveFn } from "./AdminShared";

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
      <div className="flex items-center gap-2 mb-1">
        <Icon name="LayoutGrid" size={16} className="text-cyan-400" />
        <h4 className="text-white font-bold font-['Oswald']">Страница услуги</h4>
        {service.slug && (
          <a
            href={`/services/${service.slug}`}
            target="_blank"
            rel="noreferrer"
            className="ml-auto text-xs text-cyan-400 hover:underline flex items-center gap-1"
          >
            <Icon name="ExternalLink" size={12} />
            Открыть страницу
          </a>
        )}
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

function ServiceInfoEditor({ service, save, saving }: Props) {
  const [s, setS] = useState({ ...service });

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

      <Field label="Краткое описание (для меню и карточки)">
        <textarea
          value={s.short_desc || ""}
          onChange={(e) => setS({ ...s, short_desc: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 resize-none"
        />
      </Field>

      <Field label="Заголовок hero-блока">
        <input
          value={s.hero_title || ""}
          onChange={(e) => setS({ ...s, hero_title: e.target.value })}
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
        />
      </Field>

      <Field label="Подзаголовок hero-блока">
        <textarea
          value={s.hero_subtitle || ""}
          onChange={(e) => setS({ ...s, hero_subtitle: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 resize-none"
        />
      </Field>

      <Field label="Полное описание">
        <textarea
          value={s.full_description || ""}
          onChange={(e) => setS({ ...s, full_description: e.target.value })}
          rows={5}
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 resize-none"
        />
      </Field>

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
        <Field label="SEO Title (тег title)">
          <input
            value={s.seo_title || ""}
            onChange={(e) => setS({ ...s, seo_title: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
          />
        </Field>
        <Field label="SEO Description (мета-описание)">
          <textarea
            value={s.seo_description || ""}
            onChange={(e) => setS({ ...s, seo_description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 resize-none"
          />
        </Field>
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

function Field({ label, children, placeholder: _ }: { label: string; children: React.ReactNode; placeholder?: string }) {
  return (
    <div>
      <label className="block text-gray-400 text-xs mb-1">{label}</label>
      {children}
    </div>
  );
}

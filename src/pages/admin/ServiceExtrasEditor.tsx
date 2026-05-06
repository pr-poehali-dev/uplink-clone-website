import { useState } from "react";
import { CmsService, CmsServiceBenefit, CmsServiceStep, CmsServiceFaq } from "@/hooks/useCmsContent";
import Icon from "@/components/ui/icon";
import { SaveFn } from "./AdminShared";
import { getStoredToken } from "@/hooks/useAdminAuth";
import { AiBtn } from "./ServiceEditorShared";

interface Props {
  service: CmsService;
  save: SaveFn;
  saving: boolean;
}

export function BenefitsEditor({ service, save, saving }: Props) {
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

export function StepsEditor({ service, save, saving }: Props) {
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

export function ServiceFaqEditor({ service, save, saving }: Props) {
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

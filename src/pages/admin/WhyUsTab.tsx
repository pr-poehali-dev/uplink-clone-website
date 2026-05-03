import { useState } from "react";
import { CmsContent, CmsWhyusCard } from "@/hooks/useCmsContent";
import { SaveButton, SaveFn } from "./AdminShared";
import Icon from "@/components/ui/icon";

interface WhyUsTabProps {
  content: CmsContent;
  password: string;
  save: SaveFn;
  saving: boolean;
}

export function WhyUsTab({ content, save, saving }: WhyUsTabProps) {
  const [cards, setCards] = useState<CmsWhyusCard[]>(() =>
    [...(content.whyus_cards ?? [])].sort((a, b) => a.sort_order - b.sort_order)
  );

  const update = (idx: number, patch: Partial<CmsWhyusCard>) => {
    setCards(prev => prev.map((c, i) => i === idx ? { ...c, ...patch } : c));
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setCards(prev => { const a = [...prev]; [a[idx - 1], a[idx]] = [a[idx], a[idx - 1]]; return a; });
  };

  const moveDown = (idx: number) => {
    setCards(prev => {
      if (idx >= prev.length - 1) return prev;
      const a = [...prev]; [a[idx], a[idx + 1]] = [a[idx + 1], a[idx]]; return a;
    });
  };

  const add = () => {
    setCards(prev => [...prev, { id: -Date.now(), sort_order: prev.length + 1, icon: "Check", title: "Новое преимущество", description: "Описание", is_active: true }]);
  };

  const remove = (idx: number) => {
    setCards(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    const items = cards.map((c, i) => ({ ...c, sort_order: i + 1, id: c.id < 0 ? undefined : c.id }));
    save("save_whyus_cards", { items });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white font-['Oswald']">Почему мы</h2>
          <p className="text-gray-400 text-sm mt-0.5">{cards.length} карточек / {cards.filter(c => c.is_active).length} активных</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={add} className="px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-sm hover:bg-cyan-500/30 transition-colors flex items-center gap-1.5">
            <Icon name="Plus" size={14} /> Добавить
          </button>
          <SaveButton saving={saving} onClick={handleSave} />
        </div>
      </div>

      <div className="space-y-3">
        {cards.map((card, idx) => (
          <div key={card.id} className={`glass-card neon-border rounded-2xl p-5 ${!card.is_active ? "opacity-60" : ""}`}>
            <div className="flex items-start gap-3">
              <div className="flex flex-col gap-1 flex-shrink-0 mt-1">
                <button onClick={() => moveUp(idx)} disabled={idx === 0} className="text-gray-500 hover:text-white disabled:opacity-30 p-0.5">
                  <Icon name="ChevronUp" size={14} />
                </button>
                <span className="text-xs text-gray-600 text-center">{idx + 1}</span>
                <button onClick={() => moveDown(idx)} disabled={idx === cards.length - 1} className="text-gray-500 hover:text-white disabled:opacity-30 p-0.5">
                  <Icon name="ChevronDown" size={14} />
                </button>
              </div>

              <div className="flex-1 grid sm:grid-cols-[80px_1fr] gap-3">
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Иконка</label>
                  <input
                    value={card.icon}
                    onChange={e => update(idx, { icon: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-cyan-400 text-sm focus:outline-none focus:border-cyan-500/50 w-full font-mono"
                    placeholder="Clock"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Заголовок</label>
                  <input
                    value={card.title}
                    onChange={e => update(idx, { title: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 w-full"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-400 text-xs mb-1">Описание</label>
                  <textarea
                    value={card.description}
                    onChange={e => update(idx, { description: e.target.value })}
                    rows={2}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 w-full resize-none"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={card.is_active} onChange={e => update(idx, { is_active: e.target.checked })} className="accent-cyan-500" />
                  <span className="text-xs text-gray-400">Вкл</span>
                </label>
                <button onClick={() => remove(idx)} className="text-red-400 hover:text-red-300 p-1">
                  <Icon name="X" size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

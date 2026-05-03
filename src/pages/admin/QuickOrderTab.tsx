import { useState, useEffect } from "react";
import { CmsContent, CmsQuickorderStep } from "@/hooks/useCmsContent";
import { SaveButton, SaveFn } from "./AdminShared";
import Icon from "@/components/ui/icon";

interface QuickOrderTabProps {
  content: CmsContent;
  password: string;
  save: SaveFn;
  saving: boolean;
}

const textareaClass =
  "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all resize-none";

function emptyStep(id: number, sort_order: number): CmsQuickorderStep {
  return { id, sort_order, icon: "Zap", title: "", description: "", is_active: true };
}

export function QuickOrderTab({ content, save, saving }: QuickOrderTabProps) {
  const [steps, setSteps] = useState<CmsQuickorderStep[]>([]);

  useEffect(() => {
    setSteps(
      [...(content.quickorder_steps ?? [])].sort((a, b) => a.sort_order - b.sort_order)
    );
  }, [content.quickorder_steps]);

  const update = (id: number, patch: Partial<CmsQuickorderStep>) =>
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const remove = (id: number) =>
    setSteps((prev) => prev.filter((s) => s.id !== id));

  const addStep = () => {
    const tempId = -Date.now();
    setSteps((prev) => [...prev, emptyStep(tempId, prev.length + 1)]);
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = [...steps];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSteps(next);
  };

  const handleSave = () => {
    const items = steps.map((s, i) => ({
      ...s,
      sort_order: i + 1,
      id: s.id < 0 ? undefined : s.id,
    }));
    save("save_quickorder_steps", { items });
  };

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="glass-card neon-border rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Icon name="Zap" size={20} className="text-cyan-400" />
            </div>
            <div>
              <h3 className="text-white font-bold font-['Oswald'] text-lg leading-tight">
                Шаги «Как заказать»
              </h3>
              <p className="text-gray-500 text-xs mt-0.5">
                {steps.length} шагов ·{" "}
                {steps.filter((s) => s.is_active).length} активных
              </p>
            </div>
          </div>
          <button
            onClick={addStep}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-cyan-400 border border-dashed border-cyan-500/30 hover:bg-cyan-500/5 transition-all disabled:opacity-50"
          >
            <Icon name="Plus" size={14} />
            Добавить шаг
          </button>
        </div>
      </div>

      {/* Empty state */}
      {steps.length === 0 && (
        <div className="glass-card neon-border rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
          <Icon name="ListOrdered" size={32} className="text-gray-600" />
          <p className="text-gray-500 text-sm">Нет шагов. Нажмите «Добавить шаг».</p>
        </div>
      )}

      {/* Steps list */}
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div
            key={step.id}
            className={`glass-card rounded-2xl p-5 border transition-all ${
              step.is_active ? "border-white/10" : "border-white/5 opacity-60"
            }`}
          >
            {/* Step header row */}
            <div className="flex items-center gap-2 mb-4">
              {/* Step number badge */}
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>

              {/* Icon input */}
              <div className="w-28 flex-shrink-0">
                <input
                  value={step.icon}
                  onChange={(e) => update(step.id, { icon: e.target.value })}
                  placeholder="Icon (Lucide)"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-cyan-400 text-sm font-mono focus:outline-none focus:border-cyan-500/50 transition-all"
                />
              </div>

              {/* Title input */}
              <input
                value={step.title}
                onChange={(e) => update(step.id, { title: e.target.value })}
                placeholder="Название шага"
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
              />

              {/* Controls */}
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="p-1.5 text-gray-500 hover:text-cyan-400 disabled:opacity-25 transition-colors"
                  title="Переместить вверх"
                >
                  <Icon name="ChevronUp" size={15} />
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === steps.length - 1}
                  className="p-1.5 text-gray-500 hover:text-cyan-400 disabled:opacity-25 transition-colors"
                  title="Переместить вниз"
                >
                  <Icon name="ChevronDown" size={15} />
                </button>
                <button
                  onClick={() => remove(step.id)}
                  className="p-1.5 text-gray-500 hover:text-red-400 transition-colors ml-1"
                  title="Удалить"
                >
                  <Icon name="X" size={15} />
                </button>
              </div>
            </div>

            {/* Description */}
            <textarea
              value={step.description}
              onChange={(e) => update(step.id, { description: e.target.value })}
              placeholder="Описание шага"
              rows={2}
              className={textareaClass}
            />

            {/* Active toggle */}
            <div className="flex items-center gap-2 mt-3">
              <input
                type="checkbox"
                id={`qo_active_${step.id}`}
                checked={step.is_active}
                onChange={(e) => update(step.id, { is_active: e.target.checked })}
                className="accent-cyan-400 w-4 h-4"
              />
              <label
                htmlFor={`qo_active_${step.id}`}
                className="text-gray-400 text-sm cursor-pointer select-none"
              >
                Показывать на сайте
              </label>
            </div>
          </div>
        ))}
      </div>

      {steps.length > 0 && (
        <div className="flex items-center gap-3">
          <SaveButton onClick={handleSave} saving={saving} />
          <span className="text-gray-600 text-xs">
            Изменения применяются ко всем шагам сразу
          </span>
        </div>
      )}
    </div>
  );
}

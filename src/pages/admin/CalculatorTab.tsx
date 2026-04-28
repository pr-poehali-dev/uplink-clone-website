import { useState, useEffect } from "react";
import { CmsContent, CmsCalcOption } from "@/hooks/useCmsContent";
import { SaveButton, SaveFn } from "./AdminShared";
import Icon from "@/components/ui/icon";

interface Props {
  content: CmsContent;
  save: SaveFn;
  saving: boolean;
}

const SETTINGS_GROUPS: { label: string; keys: { key: string; label: string; type: "text" | "number" }[] }[] = [
  {
    label: "Заголовки",
    keys: [
      { key: "title", label: "Заголовок калькулятора", type: "text" },
      { key: "subtitle", label: "Подзаголовок", type: "text" },
      { key: "discount_label", label: "Поясняющая фраза под итогом", type: "text" },
      { key: "cta_text", label: "Текст кнопки заявки", type: "text" },
    ],
  },
  {
    label: "Базовые цены",
    keys: [
      { key: "base_price", label: "Базовая абонентская плата (₽)", type: "number" },
      { key: "price_per_pc", label: "Цена за 1 ПК (₽)", type: "number" },
      { key: "price_per_server", label: "Цена за 1 сервер (₽)", type: "number" },
      { key: "price_per_visit", label: "Цена за 1 выезд (₽)", type: "number" },
    ],
  },
  {
    label: "Коэффициенты времени реакции",
    keys: [
      { key: "response_4h_multiplier", label: "До 4 часов (×)", type: "number" },
      { key: "response_2h_multiplier", label: "До 2 часов (×)", type: "number" },
      { key: "response_1h_multiplier", label: "До 1 часа (×)", type: "number" },
    ],
  },
  {
    label: "Диапазоны слайдеров",
    keys: [
      { key: "min_pc", label: "Мин. ПК", type: "number" },
      { key: "max_pc", label: "Макс. ПК", type: "number" },
      { key: "min_servers", label: "Мин. серверов", type: "number" },
      { key: "max_servers", label: "Макс. серверов", type: "number" },
      { key: "min_visits", label: "Мин. выездов", type: "number" },
      { key: "max_visits", label: "Макс. выездов", type: "number" },
    ],
  },
];

export function CalculatorTab({ content, save, saving }: Props) {
  const [vals, setVals] = useState<Record<string, string>>({});
  const [options, setOptions] = useState<CmsCalcOption[]>([]);

  useEffect(() => {
    setVals(content.calc_settings || {});
    setOptions((content.calc_options || []).filter((o) => o.label !== "[удалено]"));
  }, [content.calc_settings, content.calc_options]);

  const handleSaveSettings = () => save("save_calc_settings", { updates: vals });

  const handleSaveOptions = () => {
    save("save_calc_options", {
      options: options.map((o) => o.id < 0 ? { ...o, id: undefined } : o),
    });
  };

  const addOption = () => {
    const id = -Date.now();
    setOptions([...options, {
      id,
      sort_order: options.length + 1,
      key: `option_${Math.random().toString(36).slice(2, 7)}`,
      label: "Новая опция",
      description: "",
      price: 1000,
      icon: "Plus",
      is_active: true,
    }]);
  };

  const updateOption = (id: number, patch: Partial<CmsCalcOption>) =>
    setOptions(options.map((o) => o.id === id ? { ...o, ...patch } : o));

  const removeOption = (id: number) => setOptions(options.filter((o) => o.id !== id));

  const moveOption = (id: number, dir: -1 | 1) => {
    const idx = options.findIndex((o) => o.id === id);
    if (idx < 0) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= options.length) return;
    const next = [...options];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    setOptions(next);
  };

  return (
    <div className="space-y-6">
      <div className="glass-card neon-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Calculator" size={18} className="text-cyan-400" />
          <h3 className="text-white font-bold font-['Oswald'] text-lg">Настройки калькулятора</h3>
        </div>

        {SETTINGS_GROUPS.map((g) => (
          <div key={g.label} className="mb-5 last:mb-0">
            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">{g.label}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {g.keys.map((f) => (
                <div key={f.key}>
                  <label className="block text-gray-400 text-xs mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={vals[f.key] ?? ""}
                    onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-3 border-t border-white/5">
          <SaveButton onClick={handleSaveSettings} saving={saving} />
        </div>
      </div>

      <div className="glass-card neon-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon name="ListPlus" size={18} className="text-cyan-400" />
            <h3 className="text-white font-bold font-['Oswald'] text-lg">Дополнительные опции (чекбоксы)</h3>
          </div>
          <button
            onClick={addOption}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-cyan-400 border border-dashed border-cyan-500/30 hover:bg-cyan-500/5"
          >
            <Icon name="Plus" size={14} />Добавить
          </button>
        </div>

        <div className="space-y-3">
          {options.map((o, i) => (
            <div key={o.id} className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
              <div className="grid grid-cols-[100px_1fr_120px_110px_auto] gap-2 items-start">
                <input
                  value={o.icon}
                  onChange={(e) => updateOption(o.id, { icon: e.target.value })}
                  placeholder="Icon"
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500/50"
                />
                <input
                  value={o.label}
                  onChange={(e) => updateOption(o.id, { label: e.target.value })}
                  placeholder="Название"
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                />
                <input
                  type="number"
                  value={o.price}
                  onChange={(e) => updateOption(o.id, { price: Number(e.target.value) })}
                  placeholder="Цена"
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                />
                <input
                  value={o.key}
                  onChange={(e) => updateOption(o.id, { key: e.target.value.replace(/[^a-z0-9_]/gi, "_") })}
                  placeholder="ключ"
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500/50 font-mono"
                />
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => moveOption(o.id, -1)}
                    disabled={i === 0}
                    className="p-1.5 text-gray-500 hover:text-cyan-400 disabled:opacity-30"
                  >
                    <Icon name="ChevronUp" size={14} />
                  </button>
                  <button
                    onClick={() => moveOption(o.id, 1)}
                    disabled={i === options.length - 1}
                    className="p-1.5 text-gray-500 hover:text-cyan-400 disabled:opacity-30"
                  >
                    <Icon name="ChevronDown" size={14} />
                  </button>
                  <button onClick={() => removeOption(o.id)} className="p-1.5 text-gray-500 hover:text-red-400">
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>
              </div>
              <textarea
                value={o.description || ""}
                onChange={(e) => updateOption(o.id, { description: e.target.value })}
                placeholder="Описание под названием"
                rows={1}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 resize-none"
              />
              <label className="flex items-center gap-2 text-xs text-gray-400">
                <input
                  type="checkbox"
                  checked={o.is_active}
                  onChange={(e) => updateOption(o.id, { is_active: e.target.checked })}
                  className="accent-cyan-400"
                />
                Показывать на сайте
              </label>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-white/5 mt-4">
          <SaveButton onClick={handleSaveOptions} saving={saving} />
        </div>
      </div>
    </div>
  );
}

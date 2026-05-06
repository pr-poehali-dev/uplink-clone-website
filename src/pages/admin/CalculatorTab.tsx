import { useState, useEffect } from "react";
import { CmsContent, CmsCalcOption, CmsCalcSlider } from "@/hooks/useCmsContent";
import { SaveButton, SaveFn } from "./AdminShared";
import Icon from "@/components/ui/icon";

interface Props {
  content: CmsContent;
  save: SaveFn;
  saving: boolean;
}

const cls = {
  input: "px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 w-full",
  label: "block text-gray-400 text-xs mb-1",
};

const SETTINGS_FIELDS: { key: string; label: string; type: "text" | "number"; hint?: string }[] = [
  { key: "title", label: "Заголовок калькулятора", type: "text" },
  { key: "subtitle", label: "Подзаголовок", type: "text" },
  { key: "cta_text", label: "Текст кнопки заявки", type: "text" },
  { key: "discount_label", label: "Пояснение под итогом", type: "text" },
  { key: "base_price", label: "Базовая абонентская плата (₽/мес)", type: "number", hint: "Фиксированная часть независимо от параметров" },
  { key: "response_4h_multiplier", label: "Коэф. реакции до 4 ч (×)", type: "number" },
  { key: "response_2h_multiplier", label: "Коэф. реакции до 2 ч (×)", type: "number" },
  { key: "response_1h_multiplier", label: "Коэф. реакции до 1 ч (×)", type: "number" },
];

export function CalculatorTab({ content, save, saving }: Props) {
  const [vals, setVals] = useState<Record<string, string>>({});
  const [sliders, setSliders] = useState<CmsCalcSlider[]>([]);
  const [options, setOptions] = useState<CmsCalcOption[]>([]);

  useEffect(() => {
    const v: Record<string, string> = {};
    SETTINGS_FIELDS.forEach(f => { v[f.key] = content.calc_settings?.[f.key] ?? ""; });
    setVals(v);
    setSliders((content.calc_sliders || []).sort((a, b) => a.sort_order - b.sort_order));
    setOptions((content.calc_options || []).filter(o => o.label !== "[удалено]"));
  }, [content.calc_settings, content.calc_sliders, content.calc_options]);

  /* --- settings --- */
  const handleSaveSettings = () => save("save_calc_settings", { updates: vals });

  /* --- sliders --- */
  const handleSaveSliders = () =>
    save("save_calc_sliders", { items: sliders.map((s, i) => ({ ...s, sort_order: i + 1, id: s.id < 0 ? undefined : s.id })) });

  const addSlider = () => setSliders(prev => [...prev, {
    id: -Date.now(), sort_order: prev.length + 1,
    key: `slider_${Math.random().toString(36).slice(2, 6)}`,
    label: "Новый параметр", suffix: "шт.",
    price_key: `price_per_item_${Math.random().toString(36).slice(2, 6)}`,
    price_default: 500, min_val: 0, max_val: 50, default_val: 1, is_active: true,
  }]);

  const updSlider = (id: number, patch: Partial<CmsCalcSlider>) =>
    setSliders(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  const delSlider = (id: number) => setSliders(prev => prev.filter(s => s.id !== id));
  const moveSlider = (i: number, dir: -1 | 1) => {
    const t = i + dir;
    if (t < 0 || t >= sliders.length) return;
    const next = [...sliders];
    [next[i], next[t]] = [next[t], next[i]];
    setSliders(next);
  };

  /* --- options --- */
  const handleSaveOptions = () =>
    save("save_calc_options", { options: options.map(o => o.id < 0 ? { ...o, id: undefined } : o) });

  const addOption = () => setOptions(prev => [...prev, {
    id: -Date.now(), sort_order: prev.length + 1,
    key: `option_${Math.random().toString(36).slice(2, 7)}`,
    label: "Новая опция", description: "", price: 1000, icon: "Plus", is_active: true,
  }]);

  const updOption = (id: number, patch: Partial<CmsCalcOption>) =>
    setOptions(prev => prev.map(o => o.id === id ? { ...o, ...patch } : o));
  const delOption = (id: number) => setOptions(prev => prev.filter(o => o.id !== id));
  const moveOption = (id: number, dir: -1 | 1) => {
    const idx = options.findIndex(o => o.id === id);
    if (idx < 0) return;
    const t = idx + dir;
    if (t < 0 || t >= options.length) return;
    const next = [...options];
    [next[idx], next[t]] = [next[t], next[idx]];
    setOptions(next);
  };

  return (
    <div className="space-y-5">

      {/* ── Настройки ── */}
      <div className="glass-card neon-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Calculator" size={18} className="text-cyan-400" />
          <h3 className="text-white font-bold font-['Oswald'] text-lg">Настройки IT-калькулятора</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SETTINGS_FIELDS.map(f => (
            <div key={f.key} className={f.key === "title" || f.key === "subtitle" || f.key === "discount_label" ? "sm:col-span-2" : ""}>
              <label className={cls.label}>{f.label}</label>
              <input
                type={f.type}
                value={vals[f.key] ?? ""}
                onChange={e => setVals(p => ({ ...p, [f.key]: e.target.value }))}
                className={cls.input}
                step={f.type === "number" ? "0.01" : undefined}
              />
              {f.hint && <p className="text-gray-600 text-xs mt-0.5">{f.hint}</p>}
            </div>
          ))}
        </div>
        <div className="pt-3 border-t border-white/5 mt-4">
          <SaveButton onClick={handleSaveSettings} saving={saving} />
        </div>
      </div>

      {/* ── Слайдеры (пункты расчёта) ── */}
      <div className="glass-card neon-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Icon name="Sliders" size={18} className="text-cyan-400" />
            <h3 className="text-white font-bold font-['Oswald'] text-lg">Пункты расчёта — слайдеры</h3>
            <span className="text-gray-500 text-sm font-normal">({sliders.length})</span>
          </div>
          <button onClick={addSlider} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-cyan-400 border border-dashed border-cyan-500/30 hover:bg-cyan-500/5">
            <Icon name="Plus" size={14} />Добавить
          </button>
        </div>
        <p className="text-gray-500 text-xs mb-3">Каждый слайдер — параметр инфраструктуры. Цена берётся из «Ключа цены» (должен совпадать с полем в настройках выше или быть уникальным).</p>

        {sliders.length === 0 && <p className="text-gray-500 text-sm text-center py-4">Нет пунктов. Будут использованы дефолтные (ПК, серверы, выезды).</p>}

        <div className="space-y-2">
          {sliders.map((s, i) => (
            <div key={s.id} className={`border rounded-xl p-3 space-y-2 ${s.is_active ? "bg-white/3 border-white/10" : "bg-white/[0.02] border-white/5 opacity-55"}`}>
              {/* Строка 1: лейбл + суффикс + мин/макс/дефолт + управление */}
              <div className="flex gap-2 flex-wrap items-center">
                <input
                  value={s.label}
                  onChange={e => updSlider(s.id, { label: e.target.value })}
                  placeholder="Название параметра"
                  className="flex-1 min-w-[140px] px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                />
                <input
                  value={s.suffix}
                  onChange={e => updSlider(s.id, { suffix: e.target.value })}
                  placeholder="шт."
                  className="w-16 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                />
                {(["min_val","max_val","default_val"] as const).map(field => (
                  <input
                    key={field}
                    type="number"
                    value={s[field]}
                    onChange={e => updSlider(s.id, { [field]: Number(e.target.value) })}
                    placeholder={field === "min_val" ? "Мин" : field === "max_val" ? "Макс" : "Деф."}
                    title={field === "min_val" ? "Минимум" : field === "max_val" ? "Максимум" : "Значение по умолчанию"}
                    className="w-20 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                  />
                ))}
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button onClick={() => moveSlider(i, -1)} disabled={i === 0} className="p-1 text-gray-500 hover:text-cyan-400 disabled:opacity-30"><Icon name="ChevronUp" size={14} /></button>
                  <button onClick={() => moveSlider(i, 1)} disabled={i === sliders.length - 1} className="p-1 text-gray-500 hover:text-cyan-400 disabled:opacity-30"><Icon name="ChevronDown" size={14} /></button>
                  <button onClick={() => delSlider(s.id)} className="p-1 text-gray-500 hover:text-red-400"><Icon name="Trash2" size={14} /></button>
                </div>
              </div>
              {/* Строка 2: ключ цены + цена + активность */}
              <div className="flex gap-2 flex-wrap items-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500 text-xs whitespace-nowrap">Ключ цены:</span>
                  <input
                    value={s.price_key}
                    onChange={e => updSlider(s.id, { price_key: e.target.value.replace(/[^a-z0-9_]/gi, "_") })}
                    placeholder="price_per_pc"
                    className="w-44 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-cyan-400 text-xs font-mono focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500 text-xs whitespace-nowrap">Цена по умолч. (₽):</span>
                  <input
                    type="number"
                    value={s.price_default}
                    onChange={e => updSlider(s.id, { price_default: Number(e.target.value) })}
                    className="w-24 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer ml-auto">
                  <input type="checkbox" checked={s.is_active} onChange={e => updSlider(s.id, { is_active: e.target.checked })} className="accent-cyan-400" />
                  Активен
                </label>
              </div>
            </div>
          ))}
        </div>
        <div className="pt-3 border-t border-white/5 mt-3">
          <SaveButton onClick={handleSaveSliders} saving={saving} />
        </div>
      </div>

      {/* ── Доп. опции (чекбоксы) ── */}
      <div className="glass-card neon-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon name="ListPlus" size={18} className="text-cyan-400" />
            <h3 className="text-white font-bold font-['Oswald'] text-lg">Дополнительные опции (чекбоксы)</h3>
            <span className="text-gray-500 text-sm font-normal">({options.length})</span>
          </div>
          <button onClick={addOption} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-cyan-400 border border-dashed border-cyan-500/30 hover:bg-cyan-500/5">
            <Icon name="Plus" size={14} />Добавить
          </button>
        </div>

        {options.length === 0 && <p className="text-gray-500 text-sm text-center py-4">Нет доп. опций</p>}

        <div className="space-y-3">
          {options.map((o, i) => (
            <div key={o.id} className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
              <div className="grid grid-cols-[80px_1fr_110px_auto] gap-2 items-start">
                <input
                  value={o.icon}
                  onChange={e => updOption(o.id, { icon: e.target.value })}
                  placeholder="Иконка"
                  className="px-2.5 py-2 rounded-xl bg-white/5 border border-white/10 text-cyan-400 text-xs font-mono focus:outline-none focus:border-cyan-500/50"
                />
                <input
                  value={o.label}
                  onChange={e => updOption(o.id, { label: e.target.value })}
                  placeholder="Название опции"
                  className="px-2.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                />
                <input
                  type="number"
                  value={o.price}
                  onChange={e => updOption(o.id, { price: Number(e.target.value) })}
                  placeholder="Цена (₽)"
                  className="px-2.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                />
                <div className="flex items-center gap-0.5">
                  <button onClick={() => moveOption(o.id, -1)} disabled={i === 0} className="p-1.5 text-gray-500 hover:text-cyan-400 disabled:opacity-30"><Icon name="ChevronUp" size={14} /></button>
                  <button onClick={() => moveOption(o.id, 1)} disabled={i === options.length - 1} className="p-1.5 text-gray-500 hover:text-cyan-400 disabled:opacity-30"><Icon name="ChevronDown" size={14} /></button>
                  <button onClick={() => delOption(o.id)} className="p-1.5 text-gray-500 hover:text-red-400"><Icon name="Trash2" size={14} /></button>
                </div>
              </div>
              <textarea
                value={o.description || ""}
                onChange={e => updOption(o.id, { description: e.target.value })}
                placeholder="Описание (необязательно)"
                rows={1}
                className="w-full px-2.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 resize-none"
              />
              <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                <input type="checkbox" checked={o.is_active} onChange={e => updOption(o.id, { is_active: e.target.checked })} className="accent-cyan-400" />
                Показывать на сайте
              </label>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-white/5 mt-4">
          <SaveButton onClick={handleSaveOptions} saving={saving} />
        </div>
      </div>
    </div>
  );
}

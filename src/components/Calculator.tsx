import { useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { CmsCalcOption, CmsCalcSlider } from "@/hooks/useCmsContent";

interface CalculatorProps {
  calcSettings?: Record<string, string>;
  calcOptions?: CmsCalcOption[];
  calcSliders?: CmsCalcSlider[];
  onContactClick: (source: string, payload?: string) => void;
}

const num = (v: string | undefined, d: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

const formatRub = (n: number) =>
  new Intl.NumberFormat("ru-RU").format(Math.round(n)) + " ₽";

// Дефолтные слайдеры если таблица пустая
const DEFAULT_SLIDERS: CmsCalcSlider[] = [
  { id: -1, sort_order: 1, key: "pc", label: "Количество ПК / ноутбуков", suffix: "шт.", price_key: "price_per_pc", price_default: 500, min_val: 1, max_val: 50, default_val: 5, is_active: true },
  { id: -2, sort_order: 2, key: "servers", label: "Количество серверов", suffix: "шт.", price_key: "price_per_server", price_default: 2500, min_val: 0, max_val: 10, default_val: 0, is_active: true },
  { id: -3, sort_order: 3, key: "visits", label: "Выездов специалиста в месяц", suffix: "выезд.", price_key: "price_per_visit", price_default: 1500, min_val: 0, max_val: 20, default_val: 1, is_active: true },
];

export default function Calculator({ calcSettings, calcOptions, calcSliders, onContactClick }: CalculatorProps) {
  const cs = calcSettings || {};

  const activeSliders = ((calcSliders?.filter(s => s.is_active) ?? []).length > 0
    ? calcSliders!.filter(s => s.is_active)
    : DEFAULT_SLIDERS
  ).sort((a, b) => a.sort_order - b.sort_order);

  const basePrice = num(cs.base_price, 3000);

  const responseMultipliers: Record<string, { label: string; value: number }> = {
    "4h": { label: "до 4 часов", value: num(cs.response_4h_multiplier, 1.0) },
    "2h": { label: "до 2 часов", value: num(cs.response_2h_multiplier, 1.25) },
    "1h": { label: "до 1 часа",  value: num(cs.response_1h_multiplier, 1.5) },
  };

  // Инициализируем значения слайдеров из дефолтов
  const initSliderVals = () => {
    const vals: Record<string, number> = {};
    activeSliders.forEach(s => {
      vals[s.key] = Math.max(s.min_val, s.default_val);
    });
    return vals;
  };

  const [sliderVals, setSliderVals] = useState<Record<string, number>>(initSliderVals);
  const [response, setResponse] = useState<"4h" | "2h" | "1h">("4h");
  const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>({});

  const activeOptions = (calcOptions || []).filter((o) => o.is_active);

  const optionsTotal = useMemo(() => {
    return activeOptions.reduce((acc, o) => acc + (selectedOptions[o.key] ? Number(o.price) || 0 : 0), 0);
  }, [activeOptions, selectedOptions]);

  const breakdown = useMemo(() => {
    const slidersTotal = activeSliders.reduce((acc, s) => {
      const val = sliderVals[s.key] ?? s.default_val;
      const pricePerUnit = num(cs[s.price_key], s.price_default);
      return acc + val * pricePerUnit;
    }, 0);
    const baseCalc = basePrice + slidersTotal;
    const mult = responseMultipliers[response].value;
    const subtotal = baseCalc * mult;
    const total = subtotal + optionsTotal;
    return { baseCalc, mult, subtotal, total };
  }, [activeSliders, sliderVals, basePrice, response, optionsTotal, cs, responseMultipliers]);

  const setSlider = (key: string, val: number) => setSliderVals(p => ({ ...p, [key]: val }));

  const toggleOption = (key: string) => {
    setSelectedOptions((p) => ({ ...p, [key]: !p[key] }));
  };

  const handleSubmit = () => {
    const selectedKeys = Object.entries(selectedOptions).filter(([, v]) => v).map(([k]) => k);
    const selectedLabels = activeOptions
      .filter((o) => selectedKeys.includes(o.key))
      .map((o) => o.label)
      .join(", ");
    const slidersStr = activeSliders
      .map(s => `${s.label}: ${sliderVals[s.key] ?? s.default_val}`)
      .join(" | ");
    const payload = [
      slidersStr,
      `Реакция: ${responseMultipliers[response].label}`,
      selectedLabels ? `Доп. опции: ${selectedLabels}` : "",
      `Итог: ${formatRub(breakdown.total)}/мес`,
    ].filter(Boolean).join(" | ");
    onContactClick("Калькулятор IT-аутсорсинга", payload);
  };

  return (
    <section id="calculator" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
            <Icon name="Calculator" size={14} />
            Калькулятор стоимости
          </div>
          <h2 className="section-title text-white mb-4">
            {cs.title || "Калькулятор IT-аутсорсинга"}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            {cs.subtitle || "Рассчитайте ориентировочную стоимость обслуживания за 30 секунд"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Параметры */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card neon-border rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white font-['Oswald'] mb-5 flex items-center gap-2">
                <Icon name="Sliders" size={18} className="text-cyan-400" />
                Параметры
              </h3>

              {activeSliders.map(s => (
                <SliderRow
                  key={s.key}
                  label={s.label}
                  value={sliderVals[s.key] ?? s.default_val}
                  onChange={(v) => setSlider(s.key, v)}
                  min={s.min_val}
                  max={s.max_val}
                  suffix={s.suffix}
                />
              ))}

              <div className="mt-5">
                <div className="text-sm text-gray-400 mb-2">Время реагирования</div>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(responseMultipliers) as Array<keyof typeof responseMultipliers>).map((k) => (
                    <button
                      key={k}
                      onClick={() => setResponse(k as "4h" | "2h" | "1h")}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                        response === k
                          ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
                          : "bg-white/5 text-gray-400 border-white/10 hover:border-cyan-500/30"
                      }`}
                    >
                      {responseMultipliers[k].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {activeOptions.length > 0 && (
              <div className="glass-card neon-border rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white font-['Oswald'] mb-5 flex items-center gap-2">
                  <Icon name="Plus" size={18} className="text-cyan-400" />
                  Дополнительные опции
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeOptions.map((o) => {
                    const checked = !!selectedOptions[o.key];
                    return (
                      <button
                        key={o.id}
                        onClick={() => toggleOption(o.key)}
                        className={`text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                          checked
                            ? "bg-cyan-500/10 border-cyan-500/40"
                            : "bg-white/5 border-white/10 hover:border-cyan-500/30"
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          checked ? "bg-cyan-500/30" : "bg-white/5"
                        }`}>
                          <Icon name={o.icon as "Check"} size={16} className={checked ? "text-cyan-400" : "text-gray-400"} fallback="Plus" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="text-sm font-semibold text-white truncate">{o.label}</div>
                            <div className="text-sm font-bold text-cyan-400 whitespace-nowrap">+{formatRub(Number(o.price))}</div>
                          </div>
                          {o.description && (
                            <div className="text-xs text-gray-500 leading-snug">{o.description}</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Итог */}
          <div className="lg:col-span-1">
            <div className="glass-card neon-border rounded-2xl p-6 lg:sticky lg:top-24">
              <h3 className="text-lg font-bold text-white font-['Oswald'] mb-5 flex items-center gap-2">
                <Icon name="Receipt" size={18} className="text-cyan-400" />
                Расчёт
              </h3>

              <div className="space-y-2 mb-5 text-sm">
                {activeSliders.map(s => {
                  const val = sliderVals[s.key] ?? s.default_val;
                  const price = num(cs[s.price_key], s.price_default);
                  return (
                    <SummaryRow key={s.key} label={`${s.label.split(" ")[0] === "Количество" ? s.label.replace("Количество ", "") : s.label} × ${val}`} value={formatRub(val * price)} />
                  );
                })}
                <SummaryRow label="Базовая абонплата" value={formatRub(basePrice)} />
                {breakdown.mult !== 1 && (
                  <SummaryRow label={`Реакция ${responseMultipliers[response].label}`} value={`× ${breakdown.mult}`} />
                )}
                {optionsTotal > 0 && (
                  <SummaryRow label="Доп. опции" value={formatRub(optionsTotal)} />
                )}
              </div>

              <div className="border-t border-cyan-500/20 pt-4 mb-5">
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Итого в месяц</div>
                <div className="text-3xl font-bold gradient-text font-['Oswald']">
                  {formatRub(breakdown.total)}
                </div>
                {cs.discount_label && (
                  <div className="text-xs text-cyan-400/80 mt-2 flex items-start gap-1.5">
                    <Icon name="Sparkles" size={12} className="mt-0.5 flex-shrink-0" />
                    <span>{cs.discount_label}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleSubmit}
                className="btn-neon w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <Icon name="Send" size={16} />
                {cs.cta_text || "Получить точный расчёт"}
              </button>
              <p className="text-xs text-gray-500 mt-3 text-center leading-snug">
                Ориентировочная стоимость. Точный расчёт — после бесплатного IT-аудита.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SliderRow({
  label, value, onChange, min, max, suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  suffix?: string;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm text-gray-400">{label}</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChange(Math.max(min, value - 1))}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-400 text-sm flex items-center justify-center transition-all"
          >
            −
          </button>
          <span className="text-sm font-bold text-cyan-400 min-w-[3rem] text-center">
            {value} {suffix}
          </span>
          <button
            onClick={() => onChange(Math.min(max, value + 1))}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-400 text-sm flex items-center justify-center transition-all"
          >
            +
          </button>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-gray-600 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-gray-400">
      <span>{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}

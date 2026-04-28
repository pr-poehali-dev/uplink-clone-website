import { useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { CmsCalcOption } from "@/hooks/useCmsContent";

interface CalculatorProps {
  calcSettings?: Record<string, string>;
  calcOptions?: CmsCalcOption[];
  onContactClick: (source: string, payload?: string) => void;
}

const num = (v: string | undefined, d: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

const formatRub = (n: number) =>
  new Intl.NumberFormat("ru-RU").format(Math.round(n)) + " ₽";

export default function Calculator({ calcSettings, calcOptions, onContactClick }: CalculatorProps) {
  const cs = calcSettings || {};

  const minPc = num(cs.min_pc, 1);
  const maxPc = num(cs.max_pc, 50);
  const minServers = num(cs.min_servers, 0);
  const maxServers = num(cs.max_servers, 10);
  const minVisits = num(cs.min_visits, 0);
  const maxVisits = num(cs.max_visits, 20);

  const basePrice = num(cs.base_price, 3000);
  const pricePerPc = num(cs.price_per_pc, 500);
  const pricePerServer = num(cs.price_per_server, 2500);
  const pricePerVisit = num(cs.price_per_visit, 1500);

  const responseMultipliers: Record<string, { label: string; value: number }> = {
    "4h": { label: "до 4 часов", value: num(cs.response_4h_multiplier, 1.0) },
    "2h": { label: "до 2 часов", value: num(cs.response_2h_multiplier, 1.25) },
    "1h": { label: "до 1 часа",  value: num(cs.response_1h_multiplier, 1.5) },
  };

  const [pc, setPc] = useState(Math.max(minPc, 5));
  const [servers, setServers] = useState(minServers);
  const [visits, setVisits] = useState(Math.max(minVisits, 1));
  const [response, setResponse] = useState<"4h" | "2h" | "1h">("4h");
  const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>({});

  const activeOptions = (calcOptions || []).filter((o) => o.is_active);

  const optionsTotal = useMemo(() => {
    return activeOptions.reduce((acc, o) => acc + (selectedOptions[o.key] ? Number(o.price) || 0 : 0), 0);
  }, [activeOptions, selectedOptions]);

  const breakdown = useMemo(() => {
    const baseCalc = basePrice + pc * pricePerPc + servers * pricePerServer + visits * pricePerVisit;
    const mult = responseMultipliers[response].value;
    const subtotal = baseCalc * mult;
    const total = subtotal + optionsTotal;
    return { baseCalc, mult, subtotal, total };
  }, [basePrice, pc, pricePerPc, servers, pricePerServer, visits, pricePerVisit, response, optionsTotal, responseMultipliers]);

  const toggleOption = (key: string) => {
    setSelectedOptions((p) => ({ ...p, [key]: !p[key] }));
  };

  const handleSubmit = () => {
    const selectedKeys = Object.entries(selectedOptions).filter(([, v]) => v).map(([k]) => k);
    const selectedLabels = activeOptions
      .filter((o) => selectedKeys.includes(o.key))
      .map((o) => o.label)
      .join(", ");
    const payload = [
      `ПК: ${pc}`,
      `Серверов: ${servers}`,
      `Выездов в месяц: ${visits}`,
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

              <SliderRow
                label="Количество ПК / ноутбуков"
                value={pc}
                onChange={setPc}
                min={minPc}
                max={maxPc}
                suffix="шт."
              />

              <SliderRow
                label="Количество серверов"
                value={servers}
                onChange={setServers}
                min={minServers}
                max={maxServers}
                suffix="шт."
              />

              <SliderRow
                label="Выездов специалиста в месяц"
                value={visits}
                onChange={setVisits}
                min={minVisits}
                max={maxVisits}
                suffix="выезд."
              />

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
                <SummaryRow label={`ПК × ${pc}`} value={formatRub(pc * pricePerPc)} />
                <SummaryRow label={`Серверы × ${servers}`} value={formatRub(servers * pricePerServer)} />
                <SummaryRow label={`Выезды × ${visits}`} value={formatRub(visits * pricePerVisit)} />
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
  label,
  value,
  onChange,
  min,
  max,
  suffix,
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
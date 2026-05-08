import { useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { CmsVideoCameraType, CmsVideoEquipment, CmsSettings, CmsVideoCalcSlider } from "@/hooks/useCmsContent";

interface VideoSurveillanceCalculatorProps {
  onContactClick: (source: string, payload?: string) => void;
  videoCameras?: CmsVideoCameraType[];
  videoEquipment?: CmsVideoEquipment[];
  videoCalcSliders?: CmsVideoCalcSlider[];
  settings?: CmsSettings;
  compact?: boolean;
}

const formatRub = (n: number) =>
  new Intl.NumberFormat("ru-RU").format(Math.round(n)) + " ₽";

const num = (v: number | undefined, d: number) =>
  (v !== undefined && Number.isFinite(v)) ? v : d;

const DEFAULT_CAMERA_TYPES: CmsVideoCameraType[] = [
  { id: 1, label: "Внутренние камеры", price: 1500, icon: "Camera", sort_order: 1, is_active: true },
  { id: 2, label: "Уличные камеры", price: 2000, icon: "Camera", sort_order: 2, is_active: true },
  { id: 3, label: "Поворотные (PTZ)", price: 3000, icon: "ScanEye", sort_order: 3, is_active: true },
];

const DEFAULT_EXTRA_WORKS: CmsVideoEquipment[] = [
  { id: 1, label: "Настройка и программирование", price: 3500, icon: "Settings", default_checked: true, sort_order: 1, is_active: true },
  { id: 2, label: "Прокладка кабеля в коробе", price: 2500, icon: "Zap", default_checked: false, sort_order: 2, is_active: true },
  { id: 3, label: "Установка и настройка HDD-архива", price: 2000, icon: "HardDrive", default_checked: false, sort_order: 3, is_active: true },
  { id: 4, label: "Настройка удалённого доступа", price: 1500, icon: "Monitor", default_checked: false, sort_order: 4, is_active: true },
];

const DEFAULT_VIDEO_SLIDERS: CmsVideoCalcSlider[] = [
  { id: -1, sort_order: 10, key: "cable", label: "Длина кабельной трассы", suffix: "м", price_per_unit: 80, min_val: 10, max_val: 500, default_val: 50, is_active: true },
];

function SliderRow({
  label, value, onChange, min, max, suffix,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; suffix: string;
}) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm" style={{ color: "var(--text-secondary)" }}>{label}</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChange(Math.max(min, value - 1))}
            className="w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all"
            style={{ background: "var(--range-track)", color: "var(--text-muted)" }}
          >−</button>
          <span className="text-sm font-bold min-w-[3.5rem] text-center" style={{ color: "var(--neon-blue)" }}>{value} {suffix}</span>
          <button
            onClick={() => onChange(Math.min(max, value + 1))}
            className="w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all"
            style={{ background: "var(--range-track)", color: "var(--text-muted)" }}
          >+</button>
        </div>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, var(--neon-blue) ${pct}%, var(--range-track) 0%)` }}
      />
      <div className="flex justify-between text-xs mt-1" style={{ color: "var(--text-muted)" }}>
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
}

export default function VideoSurveillanceCalculator({
  onContactClick, videoCameras, videoEquipment, videoCalcSliders, settings, compact = false,
}: VideoSurveillanceCalculatorProps) {
  const cameraTypes = ((videoCameras?.filter(c => c.is_active) ?? []).length > 0
    ? videoCameras!.filter(c => c.is_active)
    : DEFAULT_CAMERA_TYPES
  ).sort((a, b) => a.sort_order - b.sort_order);

  const extraWorks = ((videoEquipment?.filter(e => e.is_active) ?? []).length > 0
    ? videoEquipment!.filter(e => e.is_active)
    : DEFAULT_EXTRA_WORKS
  ).sort((a, b) => a.sort_order - b.sort_order);

  const extraSliders = ((videoCalcSliders?.filter(s => s.is_active) ?? []).length > 0
    ? videoCalcSliders!.filter(s => s.is_active)
    : DEFAULT_VIDEO_SLIDERS
  ).sort((a, b) => a.sort_order - b.sort_order);

  const title = settings?.video_calc_title || "Стоимость монтажа видеонаблюдения";
  const subtitle = settings?.video_calc_subtitle || "Укажите параметры — ориентировочная стоимость работ за 1 минуту";
  const disclaimer = settings?.video_calc_disclaimer || "Расчёт приблизительный. Точная стоимость — после выезда специалиста.";

  const initCameraVals = () => {
    const vals: Record<string, number> = {};
    cameraTypes.forEach(c => { vals[String(c.id)] = 0; });
    if (cameraTypes.length > 0) vals[String(cameraTypes[0].id)] = 4;
    return vals;
  };

  const initSliderVals = () => {
    const vals: Record<string, number> = {};
    extraSliders.forEach(s => { vals[s.key] = Math.max(s.min_val, s.default_val); });
    return vals;
  };

  const initExtras = () => {
    const vals: Record<string, boolean> = {};
    extraWorks.forEach(e => { if (e.default_checked) vals[String(e.id)] = true; });
    return vals;
  };

  const [cameraVals, setCameraVals] = useState<Record<string, number>>(initCameraVals);
  const [sliderVals, setSliderVals] = useState<Record<string, number>>(initSliderVals);
  const [selectedExtras, setSelectedExtras] = useState<Record<string, boolean>>(initExtras);

  const setCameraVal = (key: string, val: number) => setCameraVals(p => ({ ...p, [key]: val }));
  const setSlider = (key: string, val: number) => setSliderVals(p => ({ ...p, [key]: val }));
  const toggleExtra = (key: string) => setSelectedExtras(p => ({ ...p, [key]: !p[key] }));

  const totalCameras = useMemo(() =>
    cameraTypes.reduce((acc, c) => acc + (cameraVals[String(c.id)] ?? 0), 0),
    [cameraTypes, cameraVals]
  );

  const result = useMemo(() => {
    const cameraTotal = cameraTypes.reduce((acc, c) => {
      const count = cameraVals[String(c.id)] ?? 0;
      return acc + count * num(c.price, 0);
    }, 0);
    const slidersTotal = extraSliders.reduce((acc, s) => {
      return acc + (sliderVals[s.key] ?? s.default_val) * s.price_per_unit;
    }, 0);
    const extrasTotal = extraWorks.reduce((acc, w) => acc + (selectedExtras[String(w.id)] ? num(w.price, 0) : 0), 0);
    return { cameraTotal, slidersTotal, extrasTotal, total: cameraTotal + slidersTotal + extrasTotal };
  }, [cameraTypes, cameraVals, extraSliders, sliderVals, extraWorks, selectedExtras]);

  const handleOrder = () => {
    const camsStr = cameraTypes
      .filter(c => (cameraVals[String(c.id)] ?? 0) > 0)
      .map(c => `${c.label}: ${cameraVals[String(c.id)]} шт.`)
      .join(", ");
    const slidersStr = extraSliders.map(s => `${s.label}: ${sliderVals[s.key] ?? s.default_val} ${s.suffix}`).join(", ");
    const extrasList = extraWorks.filter(w => selectedExtras[String(w.id)]).map(w => w.label).join(", ");
    const payload = [
      camsStr ? `Камеры: ${camsStr}` : "",
      slidersStr,
      extrasList ? `Доп. работы: ${extrasList}` : "",
      `Ориентировочная стоимость: ${formatRub(result.total)}`,
    ].filter(Boolean).join(" | ");
    onContactClick("Калькулятор монтажа видеонаблюдения", payload);
  };

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Типы камер — слайдеры */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
            <Icon name="Camera" size={13} style={{ color: "var(--neon-blue)" }} />
            Количество камер
          </div>
          {cameraTypes.map(c => (
            <SliderRow
              key={c.id}
              label={`${c.label} (${formatRub(c.price)}/шт.)`}
              value={cameraVals[String(c.id)] ?? 0}
              onChange={v => setCameraVal(String(c.id), v)}
              min={0} max={32} suffix="шт."
            />
          ))}
        </div>

        {/* Доп. слайдеры */}
        {extraSliders.length > 0 && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
              <Icon name="Sliders" size={13} style={{ color: "var(--neon-blue)" }} />
              Параметры
            </div>
            {extraSliders.map(s => (
              <SliderRow
                key={s.key}
                label={s.label}
                value={sliderVals[s.key] ?? s.default_val}
                onChange={v => setSlider(s.key, v)}
                min={s.min_val} max={s.max_val} suffix={s.suffix}
              />
            ))}
          </div>
        )}

        {/* Доп. работы */}
        {extraWorks.length > 0 && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
              <Icon name="Wrench" size={13} style={{ color: "var(--neon-blue)" }} />
              Дополнительные работы
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {extraWorks.map(w => {
                const checked = !!selectedExtras[String(w.id)];
                return (
                  <button
                    key={w.id}
                    onClick={() => toggleExtra(String(w.id))}
                    className="text-left px-3 py-2.5 rounded-xl border transition-all flex items-center gap-2.5"
                    style={checked
                      ? { background: "rgba(var(--neon-blue-rgb),0.08)", borderColor: "var(--neon-blue)" }
                      : { background: "var(--range-track)", borderColor: "var(--card-border)" }
                    }
                  >
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: checked ? "rgba(var(--neon-blue-rgb),0.18)" : "var(--range-track)" }}
                    >
                      <Icon name={w.icon as "Settings"} size={13} style={{ color: checked ? "var(--neon-blue)" : "var(--text-muted)" }} fallback="Wrench" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium leading-tight truncate" style={{ color: "var(--text-primary)" }}>{w.label}</div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>{formatRub(w.price)}</div>
                    </div>
                    <div className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center"
                      style={checked
                        ? { background: "var(--neon-blue)", borderColor: "var(--neon-blue)" }
                        : { borderColor: "var(--text-muted)" }
                      }
                    >
                      {checked && <Icon name="Check" size={10} className="text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Итог */}
        <div className="rounded-2xl p-4" style={{ background: "var(--range-track)", border: "1px solid var(--card-border)" }}>
          <div className="space-y-1.5 text-sm mb-3">
            {cameraTypes.filter(c => (cameraVals[String(c.id)] ?? 0) > 0).map(c => {
              const count = cameraVals[String(c.id)] ?? 0;
              return (
                <div key={c.id} className="flex justify-between">
                  <span style={{ color: "var(--text-muted)" }}>{c.label} × {count}</span>
                  <span className="font-medium" style={{ color: "var(--text-primary)" }}>{formatRub(count * c.price)}</span>
                </div>
              );
            })}
            {totalCameras === 0 && (
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Камеры не выбраны</span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>0 ₽</span>
              </div>
            )}
            {extraSliders.filter(s => s.price_per_unit > 0).map(s => (
              <div key={s.key} className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>{s.label} ({sliderVals[s.key] ?? s.default_val} {s.suffix})</span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>{formatRub((sliderVals[s.key] ?? s.default_val) * s.price_per_unit)}</span>
              </div>
            ))}
            {result.extrasTotal > 0 && (
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Дополнительные работы</span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>{formatRub(result.extrasTotal)}</span>
              </div>
            )}
          </div>
          <div className="pt-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--card-border)" }}>
            <div>
              <div className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Итого работы</div>
              <div className="text-2xl font-bold gradient-text font-['Oswald']">{formatRub(result.total)}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Оборудование — отдельно</div>
            </div>
            <button onClick={handleOrder} className="btn-neon px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 text-sm">
              <Icon name="PhoneCall" size={15} />
              Заказать
            </button>
          </div>
          <p className="text-xs mt-3 leading-relaxed" style={{ color: "var(--text-muted)" }}>{disclaimer}</p>
        </div>
      </div>
    );
  }

  return (
    <section id="video-calculator" className="py-14 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
            <Icon name="Wrench" size={14} />
            Калькулятор стоимости работ
          </div>
          <h2 className="section-title text-[var(--text-primary)] mb-4">
            <span className="gradient-text">{title}</span>
          </h2>
          <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-base">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="lg:col-span-2 space-y-5">

            {/* Слайдеры по типам камер */}
            <div className="glass-card neon-border rounded-2xl p-6">
              <h3 className="text-base font-bold text-[var(--text-primary)] font-['Oswald'] mb-5 flex items-center gap-2">
                <Icon name="Camera" size={18} className="text-cyan-400" />
                Количество камер
              </h3>
              {cameraTypes.map(c => (
                <SliderRow
                  key={c.id}
                  label={`${c.label} — ${formatRub(c.price)}/шт.`}
                  value={cameraVals[String(c.id)] ?? 0}
                  onChange={v => setCameraVal(String(c.id), v)}
                  min={0} max={32} suffix="шт."
                />
              ))}
            </div>

            {/* Доп. слайдеры */}
            {extraSliders.length > 0 && (
              <div className="glass-card neon-border rounded-2xl p-6">
                <h3 className="text-base font-bold text-[var(--text-primary)] font-['Oswald'] mb-5 flex items-center gap-2">
                  <Icon name="Sliders" size={18} className="text-cyan-400" />
                  Параметры
                </h3>
                {extraSliders.map(s => (
                  <SliderRow
                    key={s.key}
                    label={s.label}
                    value={sliderVals[s.key] ?? s.default_val}
                    onChange={v => setSlider(s.key, v)}
                    min={s.min_val} max={s.max_val} suffix={s.suffix}
                  />
                ))}
              </div>
            )}

            {/* Доп. работы */}
            {extraWorks.length > 0 && (
              <div className="glass-card neon-border rounded-2xl p-6">
                <h3 className="text-base font-bold text-[var(--text-primary)] font-['Oswald'] mb-4 flex items-center gap-2">
                  <Icon name="Wrench" size={18} className="text-cyan-400" />
                  Дополнительные работы
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {extraWorks.map(w => {
                    const checked = !!selectedExtras[String(w.id)];
                    return (
                      <button
                        key={w.id}
                        onClick={() => toggleExtra(String(w.id))}
                        className={`text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                          checked ? "bg-cyan-500/10 border-cyan-500/40" : "bg-white/5 border-white/10 hover:border-cyan-500/30"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${checked ? "bg-cyan-500/30" : "bg-white/5"}`}>
                          <Icon name={w.icon as "Settings"} size={15} className={checked ? "text-cyan-400" : "text-gray-400"} fallback="Wrench" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-[var(--text-primary)] leading-tight">{w.label}</div>
                          <div className="text-xs text-gray-500">{formatRub(w.price)}</div>
                        </div>
                        <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${checked ? "bg-cyan-500 border-cyan-500" : "border-gray-600"}`}>
                          {checked && <Icon name="Check" size={10} className="text-white" />}
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
              <h3 className="text-base font-bold text-[var(--text-primary)] font-['Oswald'] mb-5 flex items-center gap-2">
                <Icon name="Receipt" size={18} className="text-cyan-400" />
                Стоимость работ
              </h3>
              <div className="space-y-3 mb-5">
                {cameraTypes.filter(c => (cameraVals[String(c.id)] ?? 0) > 0).map(c => {
                  const count = cameraVals[String(c.id)] ?? 0;
                  return (
                    <LineItem key={c.id} label={`${c.label} (${count} шт.)`} value={count * c.price} />
                  );
                })}
                {totalCameras === 0 && (
                  <p className="text-sm text-gray-400">Выберите камеры с помощью слайдеров</p>
                )}
                {extraSliders.filter(s => s.price_per_unit > 0).map(s => (
                  <LineItem key={s.key} label={`${s.label} (${sliderVals[s.key] ?? s.default_val} ${s.suffix})`} value={(sliderVals[s.key] ?? s.default_val) * s.price_per_unit} />
                ))}
                {result.extrasTotal > 0 && <LineItem label="Дополнительные работы" value={result.extrasTotal} />}
              </div>
              <div className="border-t border-white/10 pt-4 mb-5">
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Итого работы (примерно)</div>
                <div className="text-2xl font-bold gradient-text font-['Oswald']">{formatRub(result.total)}</div>
                <p className="text-xs text-gray-600 mt-1">Стоимость оборудования — отдельно</p>
              </div>
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 mb-5">
                <p className="text-xs text-amber-400/90 leading-relaxed">{disclaimer}</p>
              </div>
              <button onClick={handleOrder} className="btn-neon w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm">
                <Icon name="PhoneCall" size={16} />
                Получить точный расчёт
              </button>
              <p className="text-xs text-gray-600 text-center mt-3">Выезд специалиста для оценки — бесплатно</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LineItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-400 leading-tight">{label}</span>
      <span className="text-[var(--text-primary)] font-medium whitespace-nowrap ml-2">{formatRub(value)}</span>
    </div>
  );
}

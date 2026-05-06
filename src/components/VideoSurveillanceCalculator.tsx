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

const DEFAULT_MOUNT_TYPES = [
  { key: "indoor", label: "Внутренние камеры", price: 1500, icon: "Camera" },
  { key: "outdoor", label: "Уличные камеры", price: 2000, icon: "Camera" },
  { key: "ptz", label: "Поворотные (PTZ)", price: 3000, icon: "ScanEye" },
];

const DEFAULT_EXTRA_WORKS = [
  { key: "config", label: "Настройка и программирование", price: 3500, icon: "Settings", defaultChecked: true },
  { key: "cabling", label: "Прокладка кабеля в коробе", price: 2500, icon: "Zap", defaultChecked: false },
  { key: "hdd", label: "Установка и настройка HDD-архива", price: 2000, icon: "HardDrive", defaultChecked: false },
  { key: "remote", label: "Настройка удалённого доступа", price: 1500, icon: "Monitor", defaultChecked: false },
];

const DEFAULT_VIDEO_SLIDERS: CmsVideoCalcSlider[] = [
  { id: -1, sort_order: 1, key: "cameras", label: "Количество камер", suffix: "шт.", price_per_unit: 0, min_val: 1, max_val: 32, default_val: 4, is_active: true },
  { id: -2, sort_order: 2, key: "cable", label: "Длина кабельной трассы", suffix: "м", price_per_unit: 80, min_val: 10, max_val: 500, default_val: 50, is_active: true },
];

function SliderRow({
  label, value, onChange, min, max, suffix,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; suffix: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-sm font-bold text-cyan-400">{value} {suffix}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, #00d4ff ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) 0%)` }}
      />
      <div className="flex justify-between text-xs text-gray-600 mt-1">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
}

export default function VideoSurveillanceCalculator({
  onContactClick, videoCameras, videoEquipment, videoCalcSliders, settings, compact = false,
}: VideoSurveillanceCalculatorProps) {
  const mountTypes = (videoCameras?.filter(c => c.is_active) ?? []).length > 0
    ? videoCameras!.filter(c => c.is_active).map(c => ({ key: String(c.id), label: c.label, price: c.price, icon: c.icon }))
    : DEFAULT_MOUNT_TYPES;

  const extraWorks = (videoEquipment?.filter(e => e.is_active) ?? []).length > 0
    ? videoEquipment!.filter(e => e.is_active).map(e => ({ key: String(e.id), label: e.label, price: e.price, icon: e.icon, defaultChecked: e.default_checked }))
    : DEFAULT_EXTRA_WORKS;

  const activeSliders = ((videoCalcSliders?.filter(s => s.is_active) ?? []).length > 0
    ? videoCalcSliders!.filter(s => s.is_active)
    : DEFAULT_VIDEO_SLIDERS
  ).sort((a, b) => a.sort_order - b.sort_order);

  const title = settings?.video_calc_title || "Стоимость монтажа видеонаблюдения";
  const subtitle = settings?.video_calc_subtitle || "Укажите параметры — ориентировочная стоимость работ за 1 минуту";
  const disclaimer = settings?.video_calc_disclaimer || "Расчёт приблизительный. Точная стоимость — после выезда специалиста.";

  const defaultExtras: Record<string, boolean> = {};
  extraWorks.forEach(e => { if (e.defaultChecked) defaultExtras[e.key] = true; });

  const initSliderVals = () => {
    const vals: Record<string, number> = {};
    activeSliders.forEach(s => { vals[s.key] = Math.max(s.min_val, s.default_val); });
    return vals;
  };

  const [mountType, setMountType] = useState<string>(mountTypes[0]?.key ?? "indoor");
  const [sliderVals, setSliderVals] = useState<Record<string, number>>(initSliderVals);
  const [selectedExtras, setSelectedExtras] = useState<Record<string, boolean>>(defaultExtras);

  const setSlider = (key: string, val: number) => setSliderVals(p => ({ ...p, [key]: val }));
  const toggleExtra = (key: string) => setSelectedExtras(p => ({ ...p, [key]: !p[key] }));

  // Слайдер "cameras" используется для расчёта монтажа
  const cameraCount = sliderVals["cameras"] ?? 4;

  const result = useMemo(() => {
    const mount = mountTypes.find(m => m.key === mountType) ?? mountTypes[0];
    const mountTotal = (mount?.price ?? 0) * cameraCount;
    const slidersTotal = activeSliders
      .filter(s => s.key !== "cameras")
      .reduce((acc, s) => acc + (sliderVals[s.key] ?? s.default_val) * s.price_per_unit, 0);
    const extrasTotal = extraWorks.reduce((acc, w) => acc + (selectedExtras[w.key] ? w.price : 0), 0);
    const total = mountTotal + slidersTotal + extrasTotal;
    return { mountTotal, slidersTotal, extrasTotal, total };
  }, [mountType, cameraCount, sliderVals, selectedExtras, mountTypes, activeSliders, extraWorks]);

  const handleOrder = () => {
    const extrasList = extraWorks.filter(w => selectedExtras[w.key]).map(w => w.label).join(", ");
    const mountLabel = mountTypes.find(m => m.key === mountType)?.label ?? "";
    const slidersStr = activeSliders.map(s => `${s.label}: ${sliderVals[s.key] ?? s.default_val} ${s.suffix}`).join(", ");
    const payload = [
      `Тип монтажа: ${mountLabel}`,
      slidersStr,
      extrasList ? `Доп. работы: ${extrasList}` : "",
      `Ориентировочная стоимость работ: ${formatRub(result.total)}`,
    ].filter(Boolean).join(" | ");
    onContactClick("Калькулятор монтажа видеонаблюдения", payload);
  };

  const currentMount = mountTypes.find(m => m.key === mountType) ?? mountTypes[0];

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Тип монтажа */}
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Icon name="Camera" size={13} className="text-cyan-400" />
            Тип камер
          </div>
          <div className="grid grid-cols-3 gap-2">
            {mountTypes.map(mt => (
              <button
                key={mt.key}
                onClick={() => setMountType(mt.key)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  mountType === mt.key ? "bg-cyan-500/15 border-cyan-500/50" : "bg-white/5 border-white/10 hover:border-cyan-500/30"
                }`}
              >
                <div className="text-xs font-semibold text-white truncate">{mt.label}</div>
                <div className="text-xs text-gray-500">{formatRub(mt.price)}/шт.</div>
              </button>
            ))}
          </div>
        </div>

        {/* Слайдеры */}
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Icon name="Sliders" size={13} className="text-cyan-400" />
            Параметры
          </div>
          {activeSliders.map(s => (
            <SliderRow
              key={s.key}
              label={s.label}
              value={sliderVals[s.key] ?? s.default_val}
              onChange={v => setSlider(s.key, v)}
              min={s.min_val} max={s.max_val} suffix={s.suffix}
            />
          ))}
        </div>

        {/* Доп. работы */}
        {extraWorks.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Icon name="Wrench" size={13} className="text-cyan-400" />
              Дополнительные работы
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {extraWorks.map(w => {
                const checked = !!selectedExtras[w.key];
                return (
                  <button
                    key={w.key}
                    onClick={() => toggleExtra(w.key)}
                    className={`text-left px-3 py-2.5 rounded-xl border transition-all flex items-center gap-2.5 ${
                      checked ? "bg-cyan-500/10 border-cyan-500/40" : "bg-white/5 border-white/10 hover:border-cyan-500/30"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${checked ? "bg-cyan-500/30" : "bg-white/5"}`}>
                      <Icon name={w.icon as "Settings"} size={13} className={checked ? "text-cyan-400" : "text-gray-400"} fallback="Wrench" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-white leading-tight truncate">{w.label}</div>
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

        {/* Итог */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="space-y-1.5 text-sm mb-3">
            <div className="flex justify-between text-gray-400">
              <span>Монтаж {currentMount?.label} ({cameraCount} шт.)</span>
              <span className="text-white font-medium">{formatRub(result.mountTotal)}</span>
            </div>
            {activeSliders.filter(s => s.key !== "cameras" && s.price_per_unit > 0).map(s => (
              <div key={s.key} className="flex justify-between text-gray-400">
                <span>{s.label} ({sliderVals[s.key] ?? s.default_val} {s.suffix})</span>
                <span className="text-white font-medium">{formatRub((sliderVals[s.key] ?? s.default_val) * s.price_per_unit)}</span>
              </div>
            ))}
            {result.extrasTotal > 0 && (
              <div className="flex justify-between text-gray-400">
                <span>Дополнительные работы</span>
                <span className="text-white font-medium">{formatRub(result.extrasTotal)}</span>
              </div>
            )}
          </div>
          <div className="border-t border-white/10 pt-3 flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">Итого работы</div>
              <div className="text-2xl font-bold gradient-text font-['Oswald']">{formatRub(result.total)}</div>
              <div className="text-xs text-gray-600 mt-0.5">Оборудование — отдельно</div>
            </div>
            <button onClick={handleOrder} className="btn-neon px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 text-sm">
              <Icon name="PhoneCall" size={15} />
              Заказать
            </button>
          </div>
          <p className="text-xs text-amber-400/70 mt-3 leading-relaxed">{disclaimer}</p>
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
            <div className="glass-card neon-border rounded-2xl p-6">
              <h3 className="text-base font-bold text-[var(--text-primary)] font-['Oswald'] mb-4 flex items-center gap-2">
                <Icon name="Camera" size={18} className="text-cyan-400" />
                Тип камер для монтажа
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {mountTypes.map(mt => (
                  <button
                    key={mt.key}
                    onClick={() => setMountType(mt.key)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      mountType === mt.key ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400" : "bg-white/5 border-white/10 hover:border-cyan-500/30"
                    }`}
                  >
                    <Icon name={mt.icon as "Camera"} size={20} className={mountType === mt.key ? "text-cyan-400 mb-2" : "text-gray-400 mb-2"} fallback="Camera" />
                    <div className="text-sm font-semibold">{mt.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{formatRub(mt.price)}/шт.</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card neon-border rounded-2xl p-6">
              <h3 className="text-base font-bold text-[var(--text-primary)] font-['Oswald'] mb-5 flex items-center gap-2">
                <Icon name="Sliders" size={18} className="text-cyan-400" />
                Параметры
              </h3>
              {activeSliders.map(s => (
                <SliderRow
                  key={s.key}
                  label={s.label}
                  value={sliderVals[s.key] ?? s.default_val}
                  onChange={v => setSlider(s.key, v)}
                  min={s.min_val} max={s.max_val} suffix={s.suffix}
                />
              ))}
            </div>

            {extraWorks.length > 0 && (
              <div className="glass-card neon-border rounded-2xl p-6">
                <h3 className="text-base font-bold text-[var(--text-primary)] font-['Oswald'] mb-4 flex items-center gap-2">
                  <Icon name="Wrench" size={18} className="text-cyan-400" />
                  Дополнительные работы
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {extraWorks.map(w => {
                    const checked = !!selectedExtras[w.key];
                    return (
                      <button
                        key={w.key}
                        onClick={() => toggleExtra(w.key)}
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

          <div className="lg:col-span-1">
            <div className="glass-card neon-border rounded-2xl p-6 lg:sticky lg:top-24">
              <h3 className="text-base font-bold text-[var(--text-primary)] font-['Oswald'] mb-5 flex items-center gap-2">
                <Icon name="Receipt" size={18} className="text-cyan-400" />
                Стоимость работ
              </h3>
              <div className="space-y-3 mb-5">
                <LineItem label={`Монтаж: ${currentMount?.label} (${cameraCount} шт.)`} value={result.mountTotal} />
                {activeSliders.filter(s => s.key !== "cameras" && s.price_per_unit > 0).map(s => (
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

import { useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { CmsVideoCameraType, CmsVideoEquipment, CmsSettings } from "@/hooks/useCmsContent";

interface VideoSurveillanceCalculatorProps {
  onContactClick: (source: string, payload?: string) => void;
  videoCameras?: CmsVideoCameraType[];
  videoEquipment?: CmsVideoEquipment[];
  settings?: CmsSettings;
}

const formatRub = (n: number) =>
  new Intl.NumberFormat("ru-RU").format(Math.round(n)) + " ₽";

// Дефолтные типы монтажа (если не заданы в CMS)
const DEFAULT_MOUNT_TYPES = [
  { key: "indoor", label: "Внутренние камеры", price: 1500, icon: "Camera" },
  { key: "outdoor", label: "Уличные камеры", price: 2000, icon: "Camera" },
  { key: "ptz", label: "Поворотные (PTZ)", price: 3000, icon: "ScanEye" },
];

// Дефолтные дополнительные работы (если не заданы в CMS)
const DEFAULT_EXTRA_WORKS = [
  { key: "config", label: "Настройка и программирование", price: 3500, icon: "Settings", defaultChecked: true },
  { key: "cabling", label: "Прокладка кабеля в коробе", price: 2500, icon: "Zap", defaultChecked: false },
  { key: "hdd", label: "Установка и настройка HDD-архива", price: 2000, icon: "HardDrive", defaultChecked: false },
  { key: "remote", label: "Настройка удалённого доступа", price: 1500, icon: "Monitor", defaultChecked: false },
];

function SliderRow({
  label, value, onChange, min, max, suffix,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; suffix: string;
}) {
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-sm font-bold text-cyan-400">
          {value} {suffix}
        </span>
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

export default function VideoSurveillanceCalculator({ onContactClick, videoCameras, videoEquipment, settings }: VideoSurveillanceCalculatorProps) {
  // Типы монтажа (переиспользуем cms_video_camera_types как виды работ по камерам)
  const mountTypes = (videoCameras?.filter(c => c.is_active) ?? []).length > 0
    ? videoCameras!.filter(c => c.is_active).map(c => ({ key: String(c.id), label: c.label, price: c.price, icon: c.icon }))
    : DEFAULT_MOUNT_TYPES;

  // Дополнительные работы (переиспользуем cms_video_equipment)
  const extraWorks = (videoEquipment?.filter(e => e.is_active) ?? []).length > 0
    ? videoEquipment!.filter(e => e.is_active).map(e => ({ key: String(e.id), label: e.label, price: e.price, icon: e.icon, defaultChecked: e.default_checked }))
    : DEFAULT_EXTRA_WORKS;

  const cablePricePerM = Number(settings?.video_calc_cable_per_meter ?? 80);
  const minCameras = Number(settings?.video_calc_min_cameras ?? 1);
  const maxCameras = Number(settings?.video_calc_max_cameras ?? 32);
  const minCable = Number(settings?.video_calc_min_cable ?? 10);
  const maxCable = Number(settings?.video_calc_max_cable ?? 500);

  const title = settings?.video_calc_title || "Калькулятор стоимости монтажа";
  const subtitle = settings?.video_calc_subtitle || "Укажите параметры — получите ориентировочную стоимость работ за 1 минуту";
  const disclaimer = settings?.video_calc_disclaimer || "Расчёт является приблизительным. Точная стоимость определяется после выезда специалиста на объект.";

  const defaultExtras: Record<string, boolean> = {};
  extraWorks.forEach(e => { if (e.defaultChecked) defaultExtras[e.key] = true; });

  const [mountType, setMountType] = useState<string>(mountTypes[0]?.key ?? "indoor");
  const [cameraCount, setCameraCount] = useState(4);
  const [cableLength, setCableLength] = useState(50);
  const [selectedExtras, setSelectedExtras] = useState<Record<string, boolean>>(defaultExtras);

  const toggleExtra = (key: string) => setSelectedExtras(p => ({ ...p, [key]: !p[key] }));

  const result = useMemo(() => {
    const mount = mountTypes.find(m => m.key === mountType) ?? mountTypes[0];
    const mountTotal = (mount?.price ?? 0) * cameraCount;
    const cableTotal = cablePricePerM * cableLength;
    const extrasTotal = extraWorks.reduce((acc, w) => acc + (selectedExtras[w.key] ? w.price : 0), 0);
    const total = mountTotal + cableTotal + extrasTotal;
    return { mountTotal, cableTotal, extrasTotal, total };
  }, [mountType, cameraCount, cableLength, selectedExtras, mountTypes, extraWorks, cablePricePerM]);

  const handleOrder = () => {
    const extrasList = extraWorks.filter(w => selectedExtras[w.key]).map(w => w.label).join(", ");
    const mountLabel = mountTypes.find(m => m.key === mountType)?.label ?? "";
    const payload = [
      `Тип монтажа: ${mountLabel}`,
      `Количество камер: ${cameraCount} шт.`,
      `Длина кабельной трассы: ${cableLength} м`,
      extrasList ? `Доп. работы: ${extrasList}` : "",
      `Ориентировочная стоимость работ: ${formatRub(result.total)}`,
    ].filter(Boolean).join(" | ");
    onContactClick("Калькулятор монтажа видеонаблюдения", payload);
  };

  const currentMount = mountTypes.find(m => m.key === mountType) ?? mountTypes[0];

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
            {title.includes("видеонаблюдения") || title.includes("монтаж") ? (
              <span dangerouslySetInnerHTML={{ __html: title.replace(/(монтаж|работ[а-я]*|видеонаблюден[а-я]+)/gi, '<span class="gradient-text">$1</span>') }} />
            ) : (
              <>{title}</>
            )}
          </h2>
          <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-base">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="lg:col-span-2 space-y-5">

            {/* Тип монтажа */}
            <div className="glass-card neon-border rounded-2xl p-6">
              <h3 className="text-base font-bold text-[var(--text-primary)] font-['Oswald'] mb-4 flex items-center gap-2">
                <Icon name="Camera" size={18} className="text-cyan-400" />
                Тип камер для монтажа
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {mountTypes.map((mt) => (
                  <button
                    key={mt.key}
                    onClick={() => setMountType(mt.key)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      mountType === mt.key
                        ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400"
                        : "bg-white/5 border-white/10 text-[var(--text-secondary)] hover:border-cyan-500/30"
                    }`}
                  >
                    <Icon name={mt.icon as "Camera"} size={20} className={mountType === mt.key ? "text-cyan-400 mb-2" : "text-gray-400 mb-2"} fallback="Camera" />
                    <div className="text-sm font-semibold">{mt.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{formatRub(mt.price)}/шт.</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Параметры */}
            <div className="glass-card neon-border rounded-2xl p-6">
              <h3 className="text-base font-bold text-[var(--text-primary)] font-['Oswald'] mb-5 flex items-center gap-2">
                <Icon name="Sliders" size={18} className="text-cyan-400" />
                Количество и кабель
              </h3>
              <SliderRow
                label="Количество камер"
                value={cameraCount}
                onChange={setCameraCount}
                min={minCameras} max={maxCameras} suffix="шт."
              />
              <SliderRow
                label="Длина кабельной трассы"
                value={cableLength}
                onChange={setCableLength}
                min={minCable} max={maxCable} suffix="м"
              />
            </div>

            {/* Дополнительные работы */}
            {extraWorks.length > 0 && (
              <div className="glass-card neon-border rounded-2xl p-6">
                <h3 className="text-base font-bold text-[var(--text-primary)] font-['Oswald'] mb-4 flex items-center gap-2">
                  <Icon name="Wrench" size={18} className="text-cyan-400" />
                  Дополнительные работы
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {extraWorks.map((w) => {
                    const checked = !!selectedExtras[w.key];
                    return (
                      <button
                        key={w.key}
                        onClick={() => toggleExtra(w.key)}
                        className={`text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                          checked
                            ? "bg-cyan-500/10 border-cyan-500/40"
                            : "bg-white/5 border-white/10 hover:border-cyan-500/30"
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
                <LineItem label={`Монтаж: ${currentMount?.label} (${cameraCount} шт.)`} value={result.mountTotal} />
                <LineItem label={`Прокладка кабеля ${cableLength} м`} value={result.cableTotal} />
                {result.extrasTotal > 0 && (
                  <LineItem label="Дополнительные работы" value={result.extrasTotal} />
                )}
              </div>

              <div className="border-t border-white/10 pt-4 mb-5">
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Итого работы (примерно)</div>
                <div className="text-2xl font-bold gradient-text font-['Oswald']">{formatRub(result.total)}</div>
                <p className="text-xs text-gray-600 mt-1">Стоимость оборудования — отдельно</p>
              </div>

              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 mb-5">
                <p className="text-xs text-amber-400/90 leading-relaxed">{disclaimer}</p>
              </div>

              <button
                onClick={handleOrder}
                className="btn-neon w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm"
              >
                <Icon name="PhoneCall" size={16} />
                Получить точный расчёт
              </button>

              <p className="text-xs text-gray-600 text-center mt-3">
                Выезд специалиста для оценки — бесплатно
              </p>
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

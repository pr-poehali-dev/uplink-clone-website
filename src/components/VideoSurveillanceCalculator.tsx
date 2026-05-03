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

const CAMERA_TYPES = [
  { key: "indoor", label: "Внутренние камеры", price: 3500, icon: "Camera" },
  { key: "outdoor", label: "Уличные камеры", price: 5500, icon: "Camera" },
  { key: "ptz", label: "Поворотные (PTZ)", price: 9000, icon: "ScanEye" },
];

const EQUIPMENT_ITEMS = [
  { key: "dvr", label: "Видеорегистратор (NVR)", price: 8000, icon: "HardDrive" },
  { key: "router", label: "Роутер / коммутатор", price: 4500, icon: "Network" },
  { key: "hdd", label: "Жёсткий диск для архива", price: 5000, icon: "Database" },
  { key: "ups", label: "Источник бесперебойного питания", price: 6500, icon: "Zap" },
  { key: "monitor", label: "Монитор для просмотра", price: 7000, icon: "Monitor" },
];

const CABLE_PRICE_PER_M = 150;

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
  const cameraTypes = (videoCameras?.filter(c => c.is_active) ?? []).length > 0
    ? (videoCameras!.filter(c => c.is_active).map((c, i) => ({ key: String(c.id), label: c.label, price: c.price, icon: c.icon })))
    : CAMERA_TYPES;
  const equipmentItems = (videoEquipment?.filter(e => e.is_active) ?? []).length > 0
    ? (videoEquipment!.filter(e => e.is_active).map(e => ({ key: String(e.id), label: e.label, price: e.price, icon: e.icon, defaultChecked: e.default_checked })))
    : EQUIPMENT_ITEMS.map(e => ({ ...e, defaultChecked: e.key === "dvr" }));

  const installPerCamera = Number(settings?.video_calc_install_per_camera ?? 1500);
  const cablePricePerM = Number(settings?.video_calc_cable_per_meter ?? 150);
  const minCameras = Number(settings?.video_calc_min_cameras ?? 1);
  const maxCameras = Number(settings?.video_calc_max_cameras ?? 32);
  const minCable = Number(settings?.video_calc_min_cable ?? 10);
  const maxCable = Number(settings?.video_calc_max_cable ?? 500);

  const defaultEquipment: Record<string, boolean> = {};
  equipmentItems.forEach(e => { if ("defaultChecked" in e && e.defaultChecked) defaultEquipment[e.key] = true; });

  const [cameraType, setCameraType] = useState<string>(cameraTypes[0]?.key ?? "indoor");
  const [cameraCount, setCameraCount] = useState(4);
  const [cableLength, setCableLength] = useState(50);
  const [selectedEquipment, setSelectedEquipment] = useState<Record<string, boolean>>(defaultEquipment);

  const toggleEquipment = (key: string) => {
    setSelectedEquipment((p) => ({ ...p, [key]: !p[key] }));
  };

  const result = useMemo(() => {
    const camera = cameraTypes.find((c) => c.key === cameraType) ?? cameraTypes[0];
    const camerasTotal = (camera?.price ?? 0) * cameraCount;
    const cableTotal = cablePricePerM * cableLength;
    const equipmentTotal = equipmentItems.reduce(
      (acc, eq) => acc + (selectedEquipment[eq.key] ? eq.price : 0), 0
    );
    const total = camerasTotal + installCameras + cableTotal + equipmentTotal;
    return { camerasTotal, installCameras, cableTotal, equipmentTotal, total };
  }, [cameraType, cameraCount, cableLength, selectedEquipment, cameraTypes, equipmentItems, installPerCamera, cablePricePerM]);

  const handleOrder = () => {
    const eqList = equipmentItems.filter((e) => selectedEquipment[e.key]).map((e) => e.label).join(", ");
    const camType = cameraTypes.find((c) => c.key === cameraType)?.label ?? "";
    const payload = [
      `Тип камер: ${camType}`,
      `Количество камер: ${cameraCount} шт.`,
      `Длина кабеля: ${cableLength} м`,
      eqList ? `Оборудование: ${eqList}` : "",
      `Приблизительная стоимость: ${formatRub(result.total)}`,
    ].filter(Boolean).join(" | ");
    onContactClick("Калькулятор видеонаблюдения", payload);
  };

  const camera = cameraTypes.find((c) => c.key === cameraType) ?? cameraTypes[0];

  return (
    <section id="video-calculator" className="py-14 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
            <Icon name="Calculator" size={14} />
            Калькулятор стоимости
          </div>
          <h2 className="section-title text-[var(--text-primary)] mb-4">
            Рассчитайте стоимость <span className="gradient-text">видеонаблюдения</span>
          </h2>
          <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-base">
            Укажите параметры — получите ориентировочную стоимость за 1 минуту
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="lg:col-span-2 space-y-5">
            {/* Тип камер */}
            <div className="glass-card neon-border rounded-2xl p-6">
              <h3 className="text-base font-bold text-[var(--text-primary)] font-['Oswald'] mb-4 flex items-center gap-2">
                <Icon name="Camera" size={18} className="text-cyan-400" />
                Тип камер
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {cameraTypes.map((ct) => (
                  <button
                    key={ct.key}
                    onClick={() => setCameraType(ct.key)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      cameraType === ct.key
                        ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400"
                        : "bg-white/5 border-white/10 text-[var(--text-secondary)] hover:border-cyan-500/30"
                    }`}
                  >
                    <Icon name={ct.icon as "Camera"} size={20} className={cameraType === ct.key ? "text-cyan-400 mb-2" : "text-gray-400 mb-2"} fallback="Camera" />
                    <div className="text-sm font-semibold">{ct.label}</div>
                    <div className="text-xs text-gray-500 mt-1">от {formatRub(ct.price)}/шт.</div>
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

            {/* Оборудование */}
            <div className="glass-card neon-border rounded-2xl p-6">
              <h3 className="text-base font-bold text-[var(--text-primary)] font-['Oswald'] mb-4 flex items-center gap-2">
                <Icon name="Package" size={18} className="text-cyan-400" />
                Дополнительное оборудование
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {equipmentItems.map((eq) => {
                  const checked = !!selectedEquipment[eq.key];
                  return (
                    <button
                      key={eq.key}
                      onClick={() => toggleEquipment(eq.key)}
                      className={`text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                        checked
                          ? "bg-cyan-500/10 border-cyan-500/40"
                          : "bg-white/5 border-white/10 hover:border-cyan-500/30"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${checked ? "bg-cyan-500/30" : "bg-white/5"}`}>
                        <Icon name={eq.icon as "HardDrive"} size={15} className={checked ? "text-cyan-400" : "text-gray-400"} fallback="Box" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[var(--text-primary)] leading-tight">{eq.label}</div>
                        <div className="text-xs text-gray-500">от {formatRub(eq.price)}</div>
                      </div>
                      <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${checked ? "bg-cyan-500 border-cyan-500" : "border-gray-600"}`}>
                        {checked && <Icon name="Check" size={10} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Итог */}
          <div className="lg:col-span-1">
            <div className="glass-card neon-border rounded-2xl p-6 lg:sticky lg:top-24">
              <h3 className="text-base font-bold text-[var(--text-primary)] font-['Oswald'] mb-5 flex items-center gap-2">
                <Icon name="Receipt" size={18} className="text-cyan-400" />
                Расчёт стоимости
              </h3>

              <div className="space-y-3 mb-5">
                <LineItem label={`${camera.label} (${cameraCount} шт.)`} value={result.camerasTotal} />
                <LineItem label={`Монтаж камер (${cameraCount} шт.)`} value={result.installCameras} />
                <LineItem label={`Кабель ${cableLength} м`} value={result.cableTotal} />
                {result.equipmentTotal > 0 && (
                  <LineItem label="Оборудование" value={result.equipmentTotal} />
                )}
              </div>

              <div className="border-t border-white/10 pt-4 mb-5">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-[var(--text-primary)]">Итого (примерно)</span>
                  <span className="text-xl font-bold gradient-text font-['Oswald']">{formatRub(result.total)}</span>
                </div>
              </div>

              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 mb-5">
                <p className="text-xs text-amber-400/90 leading-relaxed">
                  Расчёт является приблизительным. Точная стоимость определяется после выезда специалиста на объект.
                </p>
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
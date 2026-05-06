import { useState, useEffect } from "react";
import { CmsContent, CmsVideoCameraType, CmsVideoEquipment } from "@/hooks/useCmsContent";
import { SaveButton, SaveFn } from "./AdminShared";
import Icon from "@/components/ui/icon";

interface Props {
  content: CmsContent;
  password: string;
  save: SaveFn;
  saving: boolean;
}

const cls = {
  input:
    "px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 w-full transition-colors",
  label: "block text-gray-400 text-xs mb-1",
  addBtn:
    "px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-sm hover:bg-cyan-500/30 transition-colors flex items-center gap-1.5",
  delBtn: "text-red-400 hover:text-red-300 p-1 transition-colors",
  moveBtn: "p-1 text-gray-500 hover:text-cyan-400 disabled:opacity-25 transition-colors",
};

const VIDEO_SETTINGS: { key: string; label: string; placeholder: string; type?: "text" | "number" }[] = [
  { key: "video_calc_title", label: "Заголовок калькулятора", placeholder: "Калькулятор стоимости монтажа", type: "text" },
  { key: "video_calc_subtitle", label: "Подзаголовок", placeholder: "Укажите параметры — получите ориентировочную стоимость работ", type: "text" },
  { key: "video_calc_disclaimer", label: "Дисклеймер / Примечание", placeholder: "Расчёт является приблизительным...", type: "text" },
  { key: "video_calc_cable_per_meter", label: "Прокладка кабеля за 1 м (₽)", placeholder: "80", type: "number" },
  { key: "video_calc_min_cameras", label: "Мин. камер", placeholder: "1", type: "number" },
  { key: "video_calc_max_cameras", label: "Макс. камер", placeholder: "32", type: "number" },
  { key: "video_calc_min_cable", label: "Мин. кабель (м)", placeholder: "10", type: "number" },
  { key: "video_calc_max_cable", label: "Макс. кабель (м)", placeholder: "500", type: "number" },
];

export function VideoCalcTab({ content, save, saving }: Props) {
  const [cameras, setCameras] = useState<CmsVideoCameraType[]>([]);
  const [equipment, setEquipment] = useState<CmsVideoEquipment[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    setCameras(
      [...(content.video_cameras ?? [])].sort((a, b) => a.sort_order - b.sort_order)
    );
    setEquipment(
      [...(content.video_equipment ?? [])].sort((a, b) => a.sort_order - b.sort_order)
    );
    const vals: Record<string, string> = {};
    VIDEO_SETTINGS.forEach(({ key }) => {
      vals[key] = content.settings[key] ?? "";
    });
    setSettings(vals);
  }, [content.video_cameras, content.video_equipment, content.settings]);

  /* ---- camera helpers ---- */
  const updateCamera = (id: number, patch: Partial<CmsVideoCameraType>) =>
    setCameras((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const removeCamera = (id: number) =>
    setCameras((prev) => prev.filter((c) => c.id !== id));
  const moveCamera = (i: number, dir: -1 | 1) => {
    const t = i + dir;
    if (t < 0 || t >= cameras.length) return;
    const next = [...cameras];
    [next[i], next[t]] = [next[t], next[i]];
    setCameras(next);
  };
  const addCamera = () => {
    const tempId = -Date.now();
    setCameras((prev) => [
      ...prev,
      { id: tempId, label: "", price: 0, icon: "Camera", sort_order: prev.length + 1, is_active: true },
    ]);
  };

  /* ---- equipment helpers ---- */
  const updateEquip = (id: number, patch: Partial<CmsVideoEquipment>) =>
    setEquipment((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const removeEquip = (id: number) =>
    setEquipment((prev) => prev.filter((e) => e.id !== id));
  const moveEquip = (i: number, dir: -1 | 1) => {
    const t = i + dir;
    if (t < 0 || t >= equipment.length) return;
    const next = [...equipment];
    [next[i], next[t]] = [next[t], next[i]];
    setEquipment(next);
  };
  const addEquip = () => {
    const tempId = -Date.now();
    setEquipment((prev) => [
      ...prev,
      {
        id: tempId,
        label: "",
        price: 0,
        icon: "Package",
        default_checked: false,
        sort_order: prev.length + 1,
        is_active: true,
      },
    ]);
  };

  /* ---- save handlers ---- */
  const saveCameras = () => {
    const items = cameras.map((c, i) => ({
      ...c,
      sort_order: i + 1,
      id: c.id < 0 ? undefined : c.id,
    }));
    save("save_video_cameras", { items });
  };
  const saveEquipment = () => {
    const items = equipment.map((e, i) => ({
      ...e,
      sort_order: i + 1,
      id: e.id < 0 ? undefined : e.id,
    }));
    save("save_video_equipment", { items });
  };
  const saveSettings = () => save("save_settings", { updates: settings });

  return (
    <div className="space-y-5">
      {/* Camera types */}
      <div className="glass-card neon-border rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold font-['Oswald'] text-lg flex items-center gap-2">
            <Icon name="Camera" size={18} className="text-cyan-400" />
            Виды монтажа (по типу камер)
            <span className="text-gray-500 text-sm font-normal">({cameras.length})</span>
          </h3>
          <button onClick={addCamera} disabled={saving} className={cls.addBtn}>
            <Icon name="Plus" size={14} />
            Добавить
          </button>
        </div>

        {cameras.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">Нет видов монтажа. Укажите типы камер и цену работ за 1 шт.</p>
        )}

        <div className="space-y-2">
          {cameras.map((cam, i) => (
            <div
              key={cam.id}
              className={`border rounded-xl p-3 transition-opacity ${
                cam.is_active
                  ? "bg-white/3 border-white/10"
                  : "bg-white/[0.02] border-white/5 opacity-55"
              }`}
            >
              <div className="flex items-center gap-2 flex-wrap">
                {/* Icon */}
                <div className="w-24 flex-shrink-0">
                  <input
                    value={cam.icon}
                    onChange={(e) => updateCamera(cam.id, { icon: e.target.value })}
                    placeholder="Camera"
                    className={cls.input + " font-mono text-xs text-cyan-400"}
                  />
                </div>
                {/* Label */}
                <div className="flex-1 min-w-[120px]">
                  <input
                    value={cam.label}
                    onChange={(e) => updateCamera(cam.id, { label: e.target.value })}
                    placeholder="Тип камеры"
                    className={cls.input}
                  />
                </div>
                {/* Price */}
                <div className="w-32 flex-shrink-0">
                  <input
                    type="number"
                    value={cam.price}
                    onChange={(e) => updateCamera(cam.id, { price: Number(e.target.value) })}
                    placeholder="Цена работ (₽/шт.)"
                    className={cls.input}
                  />
                </div>
                {/* Active */}
                <label className="flex items-center gap-1.5 cursor-pointer select-none flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={cam.is_active}
                    onChange={(e) => updateCamera(cam.id, { is_active: e.target.checked })}
                    className="accent-cyan-400 w-3.5 h-3.5"
                  />
                  <span className="text-gray-400 text-xs">Активна</span>
                </label>
                {/* Controls */}
                <div className="flex items-center gap-0 flex-shrink-0">
                  <button onClick={() => moveCamera(i, -1)} disabled={i === 0} className={cls.moveBtn} title="Вверх">
                    <Icon name="ChevronUp" size={15} />
                  </button>
                  <button onClick={() => moveCamera(i, 1)} disabled={i === cameras.length - 1} className={cls.moveBtn} title="Вниз">
                    <Icon name="ChevronDown" size={15} />
                  </button>
                  <button onClick={() => removeCamera(cam.id)} className={cls.delBtn} title="Удалить">
                    <Icon name="X" size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-white/5">
          <SaveButton onClick={saveCameras} saving={saving} />
        </div>
      </div>

      {/* Equipment */}
      <div className="glass-card neon-border rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold font-['Oswald'] text-lg flex items-center gap-2">
            <Icon name="Wrench" size={18} className="text-cyan-400" />
            Дополнительные работы (чекбоксы)
            <span className="text-gray-500 text-sm font-normal">({equipment.length})</span>
          </h3>
          <button onClick={addEquip} disabled={saving} className={cls.addBtn}>
            <Icon name="Plus" size={14} />
            Добавить
          </button>
        </div>

        {equipment.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">Нет дополнительных работ</p>
        )}

        <div className="space-y-2">
          {equipment.map((eq, i) => (
            <div
              key={eq.id}
              className={`border rounded-xl p-3 transition-opacity ${
                eq.is_active
                  ? "bg-white/3 border-white/10"
                  : "bg-white/[0.02] border-white/5 opacity-55"
              }`}
            >
              <div className="flex items-center gap-2 flex-wrap">
                {/* Icon */}
                <div className="w-24 flex-shrink-0">
                  <input
                    value={eq.icon}
                    onChange={(e) => updateEquip(eq.id, { icon: e.target.value })}
                    placeholder="Package"
                    className={cls.input + " font-mono text-xs text-cyan-400"}
                  />
                </div>
                {/* Label */}
                <div className="flex-1 min-w-[120px]">
                  <input
                    value={eq.label}
                    onChange={(e) => updateEquip(eq.id, { label: e.target.value })}
                    placeholder="Название оборудования"
                    className={cls.input}
                  />
                </div>
                {/* Price */}
                <div className="w-32 flex-shrink-0">
                  <input
                    type="number"
                    value={eq.price}
                    onChange={(e) => updateEquip(eq.id, { price: Number(e.target.value) })}
                    placeholder="Стоимость работ (₽)"
                    className={cls.input}
                  />
                </div>
                {/* Default checked */}
                <label className="flex items-center gap-1.5 cursor-pointer select-none flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={eq.default_checked}
                    onChange={(e) => updateEquip(eq.id, { default_checked: e.target.checked })}
                    className="accent-cyan-400 w-3.5 h-3.5"
                  />
                  <span className="text-gray-400 text-xs">Вкл. по умолч.</span>
                </label>
                {/* Active */}
                <label className="flex items-center gap-1.5 cursor-pointer select-none flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={eq.is_active}
                    onChange={(e) => updateEquip(eq.id, { is_active: e.target.checked })}
                    className="accent-cyan-400 w-3.5 h-3.5"
                  />
                  <span className="text-gray-400 text-xs">Активно</span>
                </label>
                {/* Controls */}
                <div className="flex items-center gap-0 flex-shrink-0">
                  <button onClick={() => moveEquip(i, -1)} disabled={i === 0} className={cls.moveBtn} title="Вверх">
                    <Icon name="ChevronUp" size={15} />
                  </button>
                  <button onClick={() => moveEquip(i, 1)} disabled={i === equipment.length - 1} className={cls.moveBtn} title="Вниз">
                    <Icon name="ChevronDown" size={15} />
                  </button>
                  <button onClick={() => removeEquip(eq.id)} className={cls.delBtn} title="Удалить">
                    <Icon name="X" size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-white/5">
          <SaveButton onClick={saveEquipment} saving={saving} />
        </div>
      </div>

      {/* Calculator settings */}
      <div className="glass-card neon-border rounded-2xl p-5 space-y-4">
        <h3 className="text-white font-bold font-['Oswald'] text-lg flex items-center gap-2">
          <Icon name="SlidersHorizontal" size={18} className="text-cyan-400" />
          Параметры калькулятора
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {VIDEO_SETTINGS.map(({ key, label, placeholder, type }) => (
            <div key={key} className={key.endsWith("disclaimer") || key.endsWith("title") || key.endsWith("subtitle") ? "sm:col-span-2" : ""}>
              <label className={cls.label}>{label}</label>
              <input
                type={type ?? "text"}
                value={settings[key] ?? ""}
                onChange={(e) => setSettings((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                className={cls.input}
              />
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center gap-3">
          <SaveButton onClick={saveSettings} saving={saving} />
          <p className="text-gray-600 text-xs">Настройки применяются к калькулятору монтажа видеонаблюдения</p>
        </div>
      </div>
    </div>
  );
}
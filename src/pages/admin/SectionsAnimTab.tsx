import { useState, useEffect } from "react";
import { CmsContent, CmsSectionAnimation } from "@/hooks/useCmsContent";
import { SaveButton, SaveFn } from "./AdminShared";
import Icon from "@/components/ui/icon";

interface Props {
  content: CmsContent;
  save: SaveFn;
  saving: boolean;
}

const PAGES = [
  { id: "/",              label: "Главная",        icon: "Home" },
  { id: "pricing",        label: "Прайс",          icon: "CreditCard" },
  { id: "services/:slug", label: "Страницы услуг", icon: "Layers" },
];

const SCROLL_OPTIONS = [
  { id: "inherit", label: "Как глобально" },
  { id: "fade-up",    label: "Снизу вверх" },
  { id: "fade-down",  label: "Сверху вниз" },
  { id: "fade-left",  label: "Слева" },
  { id: "fade-right", label: "Справа" },
  { id: "zoom-in",    label: "Увеличение" },
  { id: "zoom-out",   label: "Уменьшение" },
  { id: "flip-x",     label: "Поворот X" },
  { id: "flip-y",     label: "Поворот Y" },
  { id: "slide-up",   label: "Сдвиг вверх" },
  { id: "bounce",     label: "Отскок" },
  { id: "rotate-in",  label: "Вращение" },
  { id: "blur-in",    label: "Расфокус" },
  { id: "none",       label: "Без анимации" },
];

const HOVER_CARD_OPTIONS = [
  { id: "inherit",      label: "Как глобально" },
  { id: "lift",         label: "Подъём" },
  { id: "glow",         label: "Свечение" },
  { id: "scale",        label: "Масштаб" },
  { id: "border-glow",  label: "Бордер-свечение" },
  { id: "tilt",         label: "3D-наклон" },
  { id: "pulse-border", label: "Пульс рамки" },
  { id: "spotlight",    label: "Прожектор" },
  { id: "magnetic",     label: "Магнит" },
  { id: "morph",        label: "Морфинг" },
  { id: "flicker",      label: "Неон-мигание" },
  { id: "float-up",     label: "Парение" },
  { id: "trace",        label: "Обводка" },
  { id: "none",         label: "Без эффекта" },
];

const HOVER_BTN_OPTIONS = [
  { id: "inherit",    label: "Как глобально" },
  { id: "glow",       label: "Свечение" },
  { id: "scale",      label: "Масштаб" },
  { id: "lift",       label: "Подъём" },
  { id: "pulse",      label: "Пульс" },
  { id: "shake",      label: "Тряска" },
  { id: "ripple",     label: "Рябь" },
  { id: "slide-fill", label: "Заливка" },
  { id: "magnetic",   label: "Магнит" },
  { id: "rubber",     label: "Резина" },
  { id: "jello",      label: "Желе" },
  { id: "heartbeat",  label: "Сердцебиение" },
  { id: "shockwave",  label: "Волна-клик" },
  { id: "wipe",       label: "Неон-заливка" },
  { id: "glitch",     label: "Глитч" },
  { id: "trace",      label: "Обводка" },
  { id: "none",       label: "Без эффекта" },
];

const SPEED_OPTIONS = [
  { id: "inherit", label: "Как глобально" },
  { id: "fast",    label: "Быстро (0.35s)" },
  { id: "normal",  label: "Нормально (0.6s)" },
  { id: "slow",    label: "Медленно (1.1s)" },
];

const cls = {
  select: "w-full px-2 py-1.5 rounded-lg bg-[#0d1421] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500/50 transition-colors",
  label: "block text-gray-500 text-[10px] mb-1 uppercase tracking-wider",
};

function SectionRow({
  section,
  onChange,
}: {
  section: CmsSectionAnimation;
  onChange: (patch: Partial<CmsSectionAnimation>) => void;
}) {
  const isCustomized =
    section.scroll_anim !== "inherit" ||
    section.hover_cards !== "inherit" ||
    section.hover_buttons !== "inherit" ||
    section.anim_speed !== "inherit";

  return (
    <div className={`rounded-xl border p-4 transition-all ${
      isCustomized
        ? "border-cyan-500/30 bg-cyan-500/5"
        : "border-white/8 bg-white/2"
    }`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isCustomized ? "bg-cyan-400" : "bg-gray-700"}`} />
        <span className="text-white text-sm font-medium">{section.label}</span>
        {isCustomized && (
          <span className="ml-auto text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">
            Настроено
          </span>
        )}
        {isCustomized && (
          <button
            onClick={() => onChange({ scroll_anim: "inherit", hover_cards: "inherit", hover_buttons: "inherit", anim_speed: "inherit" })}
            className="text-[10px] text-gray-500 hover:text-red-400 transition-colors ml-1"
            title="Сбросить"
          >
            <Icon name="RotateCcw" size={11} />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className={cls.label}>Прокрутка</label>
          <select value={section.scroll_anim} onChange={(e) => onChange({ scroll_anim: e.target.value })} className={cls.select}>
            {SCROLL_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className={cls.label}>Карточки</label>
          <select value={section.hover_cards} onChange={(e) => onChange({ hover_cards: e.target.value })} className={cls.select}>
            {HOVER_CARD_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className={cls.label}>Кнопки</label>
          <select value={section.hover_buttons} onChange={(e) => onChange({ hover_buttons: e.target.value })} className={cls.select}>
            {HOVER_BTN_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className={cls.label}>Скорость</label>
          <select value={section.anim_speed} onChange={(e) => onChange({ anim_speed: e.target.value })} className={cls.select}>
            {SPEED_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

export function SectionsAnimTab({ content, save, saving }: Props) {
  const [activePage, setActivePage] = useState("/");
  const [sections, setSections] = useState<CmsSectionAnimation[]>([]);

  useEffect(() => {
    setSections(content.section_animations ?? []);
  }, [content.section_animations]);

  const updateSection = (section_id: string, patch: Partial<CmsSectionAnimation>) => {
    setSections((prev) =>
      prev.map((s) => (s.section_id === section_id ? { ...s, ...patch } : s))
    );
  };

  const handleSave = () => save("save_section_animations", { items: sections });

  const filtered = sections.filter((s) => s.page === activePage);
  const customizedCount = sections.filter(
    (s) => s.scroll_anim !== "inherit" || s.hover_cards !== "inherit" || s.hover_buttons !== "inherit" || s.anim_speed !== "inherit"
  ).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white font-['Oswald']">Анимации по секциям</h2>
          <p className="text-gray-500 text-xs mt-0.5">
            Переопределяют глобальные настройки для каждой секции отдельно
            {customizedCount > 0 && (
              <span className="ml-2 text-cyan-400">{customizedCount} настроено</span>
            )}
          </p>
        </div>
        <SaveButton saving={saving} onClick={handleSave} />
      </div>

      {/* Легенда */}
      <div className="p-3 rounded-xl bg-white/3 border border-white/8 text-gray-500 text-xs flex items-start gap-2">
        <Icon name="Info" size={13} className="flex-shrink-0 mt-0.5 text-cyan-500/60" />
        <span>
          Выбери <b className="text-gray-300">«Как глобально»</b> — секция использует настройки из раздела Дизайн.
          Выбери конкретный эффект — он применится <b className="text-gray-300">только к этой секции</b>.
        </span>
      </div>

      {/* Страницы-табы */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1">
        {PAGES.map((p) => {
          const count = sections.filter(
            (s) => s.page === p.id &&
            (s.scroll_anim !== "inherit" || s.hover_cards !== "inherit" || s.hover_buttons !== "inherit" || s.anim_speed !== "inherit")
          ).length;
          return (
            <button key={p.id} onClick={() => setActivePage(p.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all flex-1 justify-center ${
                activePage === p.id ? "bg-cyan-500/20 text-cyan-400" : "text-gray-400 hover:text-white"
              }`}>
              <Icon name={p.icon as "Home"} size={12} />
              {p.label}
              {count > 0 && (
                <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Секции */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-gray-600 text-sm text-center py-8">Нет секций для этой страницы</div>
        )}
        {filtered.map((section) => (
          <SectionRow key={section.section_id} section={section}
            onChange={(patch) => updateSection(section.section_id, patch)} />
        ))}
      </div>

      <SaveButton saving={saving} onClick={handleSave} />
    </div>
  );
}

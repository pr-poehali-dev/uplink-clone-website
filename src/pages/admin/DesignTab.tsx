import { useState, useEffect, useRef } from "react";
import { CmsContent } from "@/hooks/useCmsContent";
import { SaveButton, SaveFn } from "./AdminShared";
import Icon from "@/components/ui/icon";

interface DesignTabProps {
  content: CmsContent;
  password: string;
  save: SaveFn;
  saving: boolean;
}

type DesignSection = "colors" | "animations" | "background" | "components";

const SECTIONS: { id: DesignSection; label: string; icon: string }[] = [
  { id: "colors", label: "Цвета и шрифты", icon: "Palette" },
  { id: "animations", label: "Анимации", icon: "Sparkles" },
  { id: "background", label: "Эффекты фона", icon: "Layers" },
  { id: "components", label: "Компоненты", icon: "Square" },
];

const GOOGLE_FONTS = ["Oswald","Roboto","Open Sans","Montserrat","Raleway","Playfair Display","Inter","Nunito","Lato","Poppins","Exo 2","Unbounded","Geologica","Russo One"];
const BODY_FONTS = ["Golos Text","Roboto","Open Sans","Inter","Nunito","Lato","Source Sans Pro","PT Sans","Manrope","Onest"];

const SCROLL_ANIMS = [
  { id: "fade-up",    label: "Снизу вверх",   icon: "ArrowUp" },
  { id: "fade-down",  label: "Сверху вниз",   icon: "ArrowDown" },
  { id: "fade-left",  label: "Слева",          icon: "ArrowRight" },
  { id: "fade-right", label: "Справа",         icon: "ArrowLeft" },
  { id: "zoom-in",    label: "Увеличение",     icon: "ZoomIn" },
  { id: "zoom-out",   label: "Уменьшение",     icon: "ZoomOut" },
  { id: "flip-x",     label: "Поворот X",      icon: "RotateCcw" },
  { id: "flip-y",     label: "Поворот Y",      icon: "RefreshCw" },
  { id: "slide-up",   label: "Сдвиг вверх",   icon: "ChevronsUp" },
  { id: "bounce",     label: "Отскок",         icon: "Zap" },
  { id: "rotate-in",  label: "Вращение",       icon: "Wind" },
  { id: "blur-in",    label: "Расфокус",       icon: "Aperture" },
  { id: "none",       label: "Без анимации",   icon: "Minus" },
];

// Hover-эффекты для карточек — id соответствует CSS-классу .anim-*
const HOVER_CARDS = [
  { id: "lift",       label: "Подъём",           desc: "Карточка приподнимается" },
  { id: "glow",       label: "Свечение",          desc: "Неоновое свечение вокруг" },
  { id: "scale",      label: "Масштаб",           desc: "Плавное увеличение" },
  { id: "border-glow",label: "Бордер-свечение",   desc: "Светящаяся рамка" },
  { id: "tilt",       label: "3D-наклон",         desc: "Следует за мышкой (3D)" },
  { id: "pulse-border",label:"Пульс рамки",       desc: "Пульсирующая рамка" },
  { id: "spotlight",  label: "Прожектор",         desc: "Свет следует за мышкой" },
  { id: "magnetic",   label: "Магнит",            desc: "Притягивается к мышке" },
  { id: "morph",      label: "Морфинг",           desc: "Рамка меняет форму" },
  { id: "flicker",    label: "Неон-мигание",      desc: "Мигает неоном" },
  { id: "float-up",   label: "Парение",           desc: "Медленный подъём + тень" },
  { id: "trace",      label: "Обводка",           desc: "Бегущая неоновая рамка" },
  { id: "none",       label: "Без эффекта",       desc: "" },
];

const HOVER_BUTTONS = [
  { id: "glow",       label: "Свечение",      desc: "Неоновое свечение" },
  { id: "scale",      label: "Масштаб",       desc: "Увеличивается" },
  { id: "lift",       label: "Подъём",        desc: "Приподнимается" },
  { id: "pulse",      label: "Пульс",         desc: "Пульсирует" },
  { id: "shake",      label: "Тряска",        desc: "Трясётся влево-вправо" },
  { id: "ripple",     label: "Рябь",          desc: "Эффект ряби" },
  { id: "slide-fill", label: "Заливка",       desc: "Заливается цветом" },
  { id: "magnetic",   label: "Магнит",        desc: "Притягивается к мышке" },
  { id: "rubber",     label: "Резина",        desc: "Резиновый отскок" },
  { id: "jello",      label: "Желе",          desc: "Покачивается как желе" },
  { id: "heartbeat",  label: "Сердцебиение",  desc: "Бьётся как сердце" },
  { id: "shockwave",  label: "Волна-клик",    desc: "Волна при нажатии" },
  { id: "wipe",       label: "Неон-заливка",  desc: "Заливается неоном" },
  { id: "glitch",     label: "Глитч",         desc: "Эффект помех" },
  { id: "trace",      label: "Обводка",       desc: "Бегущая рамка" },
  { id: "none",       label: "Без эффекта",   desc: "" },
];

const HOVER_MENU = [
  { id: "underline",    label: "Подчёркивание" },
  { id: "glow-text",    label: "Свечение текста" },
  { id: "bg-fill",      label: "Заливка фона" },
  { id: "scale",        label: "Увеличение" },
  { id: "slide-up",     label: "Сдвиг вверх" },
  { id: "border-bottom",label: "Нижний бордер" },
  { id: "none",         label: "Без эффекта" },
];

const MODAL_ANIMS = [
  { id: "scale-in",   label: "Масштаб" },
  { id: "slide-up",   label: "Снизу вверх" },
  { id: "slide-down", label: "Сверху вниз" },
  { id: "flip-in",    label: "Переворот" },
  { id: "zoom-blur",  label: "Зум + блюр" },
  { id: "bounce-in",  label: "Отскок" },
  { id: "none",       label: "Без анимации" },
];

const ANIM_SPEEDS = [
  { id: "fast",   label: "Быстро",      hint: "0.35s" },
  { id: "normal", label: "Нормально",   hint: "0.6s" },
  { id: "slow",   label: "Медленно",    hint: "1.1s" },
];

const BG_EFFECTS = [
  { id: "grid",     label: "Сетка",     icon: "Grid3x3" },
  { id: "dots",     label: "Точки",     icon: "Circle" },
  { id: "diagonal", label: "Диагональ", icon: "Slash" },
  { id: "hexagon",  label: "Соты",      icon: "Hexagon" },
  { id: "circuit",  label: "Схема",     icon: "Cpu" },
  { id: "waves",    label: "Волны",     icon: "Activity" },
  { id: "noise",    label: "Шум",       icon: "Radio" },
  { id: "aurora",   label: "Аврора",    icon: "Sparkles" },
  { id: "particles",label: "Частицы",   icon: "Atom" },
  { id: "stars",    label: "Звёзды",    icon: "Star" },
  { id: "none",     label: "Без фона",  icon: "EyeOff" },
];

const BTN_STYLES = [
  { id: "rounded",      label: "Скруглённые",   cls: "rounded-xl" },
  { id: "pill",         label: "Таблетка",       cls: "rounded-full" },
  { id: "sharp",        label: "Острые",         cls: "rounded-none" },
  { id: "sharp-sm",     label: "Мягко-острые",   cls: "rounded-sm" },
  { id: "squircle",     label: "Сквиркл",        cls: "rounded-3xl" },
  { id: "cut-corner",   label: "Срез угла",      cls: "rounded-none" },
  { id: "outline-only", label: "Контурные",      cls: "rounded-xl" },
  { id: "ghost",        label: "Призрак",        cls: "rounded-xl" },
];

const CARD_STYLES = [
  { id: "glass",        label: "Стекло" },
  { id: "flat",         label: "Плоский" },
  { id: "bordered",     label: "Только рамка" },
  { id: "solid",        label: "Монолитный" },
  { id: "neon-outline", label: "Неон-рамка" },
  { id: "gradient",     label: "Градиент" },
  { id: "frosted",      label: "Матовое стекло" },
];

const SHADOW_STYLES = [
  { id: "neon",    label: "Неоновая" },
  { id: "soft",    label: "Мягкая" },
  { id: "hard",    label: "Жёсткая" },
  { id: "colored", label: "Цветная" },
  { id: "inner",   label: "Внутренняя" },
  { id: "none",    label: "Без тени" },
];

// ── Предпросмотр hover-анимации ──
function HoverPreview({ animId, type }: { animId: string; type: "card" | "btn" }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (animId === "magnetic" || animId === "tilt" || animId === "spotlight") {
      const onMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        if (animId === "magnetic") {
          const dx = (e.clientX - cx) * 0.3;
          const dy = (e.clientY - cy) * 0.3;
          el.style.transform = `translate(${dx}px, ${dy}px)`;
        }
        if (animId === "tilt") {
          const x = (e.clientX - rect.left) / rect.width;
          const y = (e.clientY - rect.top) / rect.height;
          el.style.transform = `perspective(400px) rotateX(${(y - 0.5) * -18}deg) rotateY(${(x - 0.5) * 18}deg) scale(1.04)`;
        }
        if (animId === "spotlight") {
          el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
          el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
        }
      };
      const onLeave = () => { el.style.transform = ""; };
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
    }
  }, [animId]);

  const animClass = animId !== "none" && !["lift","glow","scale","border-glow","pulse-border","slide-fill","ripple"].includes(animId)
    ? `anim-${animId}`
    : "";

  const hoverTw = {
    "lift":         "hover:-translate-y-2 hover:shadow-lg",
    "glow":         "hover:shadow-[0_0_20px_rgba(0,212,255,0.5)]",
    "scale":        "hover:scale-110",
    "border-glow":  "hover:border-cyan-400 hover:shadow-[0_0_0_1px_#00d4ff]",
    "pulse-border": "hover:animate-pulse",
    "slide-fill":   "hover:bg-cyan-500/20",
    "ripple":       "hover:bg-cyan-500/10",
  }[animId] ?? "";

  if (type === "btn") {
    return (
      <div ref={ref} data-text="Кнопка"
        className={`px-4 py-2 rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 text-xs font-medium cursor-pointer transition-all duration-200 select-none ${animClass} ${hoverTw}`}>
        Кнопка
      </div>
    );
  }
  return (
    <div ref={ref} data-text="Карточка"
      className={`w-20 h-12 rounded-xl border border-white/15 bg-white/5 cursor-pointer transition-all duration-200 select-none ${animClass} ${hoverTw}`} />
  );
}

function OptionCard({
  selected, onClick, label, desc, preview,
}: {
  selected: boolean; onClick: () => void; label: string; desc?: string; preview?: React.ReactNode;
}) {
  return (
    <button onClick={onClick}
      className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
        selected
          ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400"
          : "bg-white/3 border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
      }`}>
      {preview}
      <span className="text-center leading-tight">{label}</span>
      {desc && <span className="text-center leading-tight opacity-50 text-[10px] font-normal">{desc}</span>}
      {selected && <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400" />}
    </button>
  );
}

function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 pb-3 border-b border-white/10 mb-4">
      <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
        <Icon name={icon as "Palette"} size={17} className="text-cyan-400" />
      </div>
      <div>
        <h3 className="text-white font-bold font-['Oswald'] text-base leading-tight">{title}</h3>
        {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
      </div>
    </div>
  );
}

export function DesignTab({ content, save, saving }: DesignTabProps) {
  const s = content.settings;
  const [section, setSection] = useState<DesignSection>("colors");

  const [vals, setVals] = useState({
    design_accent_color: s.design_accent_color ?? "#00d4ff",
    design_accent_color_light: s.design_accent_color_light ?? "#0284c7",
    design_font_heading: s.design_font_heading ?? "Oswald",
    design_font_body: s.design_font_body ?? "Golos Text",
    design_animations_enabled: s.design_animations_enabled ?? "true",
    design_float_btn_visible: s.design_float_btn_visible ?? "true",
    design_float_btn_emoji: s.design_float_btn_emoji ?? "💬",
    design_scroll_animation: s.design_scroll_animation ?? "fade-up",
    design_hover_cards: s.design_hover_cards ?? "lift",
    design_hover_buttons: s.design_hover_buttons ?? "glow",
    design_hover_menu: s.design_hover_menu ?? "underline",
    design_modal_animation: s.design_modal_animation ?? "scale-in",
    design_anim_speed: s.design_anim_speed ?? "normal",
    design_bg_effect: s.design_bg_effect ?? "grid",
    design_btn_style: s.design_btn_style ?? "rounded",
    design_card_style: s.design_card_style ?? "glass",
    design_shadow_style: s.design_shadow_style ?? "neon",
  });

  useEffect(() => {
    setVals({
      design_accent_color: s.design_accent_color ?? "#00d4ff",
      design_accent_color_light: s.design_accent_color_light ?? "#0284c7",
      design_font_heading: s.design_font_heading ?? "Oswald",
      design_font_body: s.design_font_body ?? "Golos Text",
      design_animations_enabled: s.design_animations_enabled ?? "true",
      design_float_btn_visible: s.design_float_btn_visible ?? "true",
      design_float_btn_emoji: s.design_float_btn_emoji ?? "💬",
      design_scroll_animation: s.design_scroll_animation ?? "fade-up",
      design_hover_cards: s.design_hover_cards ?? "lift",
      design_hover_buttons: s.design_hover_buttons ?? "glow",
      design_hover_menu: s.design_hover_menu ?? "underline",
      design_modal_animation: s.design_modal_animation ?? "scale-in",
      design_anim_speed: s.design_anim_speed ?? "normal",
      design_bg_effect: s.design_bg_effect ?? "grid",
      design_btn_style: s.design_btn_style ?? "rounded",
      design_card_style: s.design_card_style ?? "glass",
      design_shadow_style: s.design_shadow_style ?? "neon",
    });
  }, [s]);

  const set = (k: keyof typeof vals, v: string) => setVals((p) => ({ ...p, [k]: v }));
  const handleSave = () => save("save_settings", { updates: vals });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white font-['Oswald']">Дизайн</h2>
        <SaveButton saving={saving} onClick={handleSave} />
      </div>

      {/* Вкладки */}
      <div className="flex flex-wrap gap-1 bg-white/5 rounded-xl p-1">
        {SECTIONS.map((sec) => (
          <button key={sec.id} onClick={() => setSection(sec.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              section === sec.id ? "bg-cyan-500/20 text-cyan-400" : "text-gray-400 hover:text-white"
            }`}>
            <Icon name={sec.icon as "Palette"} size={13} />
            {sec.label}
          </button>
        ))}
      </div>

      {/* ── ЦВЕТА И ШРИФТЫ ── */}
      {section === "colors" && (
        <div className="space-y-4">
          <div className="glass-card neon-border rounded-2xl p-5">
            <SectionHeader icon="Palette" title="Акцентный цвет" subtitle="Основной цвет бренда — кнопки, ссылки, иконки" />
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { key: "design_accent_color" as const, label: "Тёмная тема" },
                { key: "design_accent_color_light" as const, label: "Светлая тема" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-gray-400 text-xs mb-2">{label}</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={vals[key]} onChange={(e) => set(key, e.target.value)}
                      className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer flex-shrink-0" />
                    <input value={vals[key]} onChange={(e) => set(key, e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 font-mono" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 h-7 rounded-lg transition-all"
              style={{ background: vals.design_accent_color, boxShadow: `0 0 20px ${vals.design_accent_color}60` }} />
          </div>

          <div className="glass-card neon-border rounded-2xl p-5">
            <SectionHeader icon="Type" title="Шрифты" subtitle="Загружаются с Google Fonts автоматически" />
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-xs mb-2">Шрифт заголовков</label>
                <select value={vals.design_font_heading} onChange={(e) => set("design_font_heading", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1421] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50">
                  {GOOGLE_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <p className="text-gray-300 text-sm mt-2 font-bold" style={{ fontFamily: vals.design_font_heading }}>
                  Пример — {vals.design_font_heading}
                </p>
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-2">Шрифт текста</label>
                <select value={vals.design_font_body} onChange={(e) => set("design_font_body", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1421] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50">
                  {BODY_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <p className="text-gray-400 text-sm mt-2">Пример — {vals.design_font_body}</p>
              </div>
            </div>
          </div>

          <div className="glass-card neon-border rounded-2xl p-5">
            <SectionHeader icon="Settings" title="Интерфейс" />
            <div className="space-y-3">
              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <div>
                  <div className="text-sm text-white font-medium">Плавающая кнопка</div>
                  <div className="text-xs text-gray-500">Кнопка в правом нижнем углу</div>
                </div>
                <input type="checkbox" checked={vals.design_float_btn_visible === "true"}
                  onChange={(e) => set("design_float_btn_visible", e.target.checked ? "true" : "false")}
                  className="w-5 h-5 accent-cyan-500 cursor-pointer" />
              </label>
              {vals.design_float_btn_visible === "true" && (
                <div>
                  <label className="block text-gray-400 text-xs mb-1.5">Эмодзи плавающей кнопки</label>
                  <input value={vals.design_float_btn_emoji} onChange={(e) => set("design_float_btn_emoji", e.target.value)}
                    maxLength={4}
                    className="w-24 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-lg focus:outline-none focus:border-cyan-500/50 text-center" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── АНИМАЦИИ ── */}
      {section === "animations" && (
        <div className="space-y-4">
          {/* Скорость */}
          <div className="glass-card neon-border rounded-2xl p-5">
            <SectionHeader icon="Timer" title="Скорость анимаций" subtitle="Влияет на все анимации сайта" />
            <div className="flex gap-3">
              {ANIM_SPEEDS.map((sp) => (
                <button key={sp.id} onClick={() => set("design_anim_speed", sp.id)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                    vals.design_anim_speed === sp.id
                      ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400"
                      : "bg-white/3 border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                  }`}>
                  <div>{sp.label}</div>
                  <div className="text-xs opacity-60 mt-0.5">{sp.hint}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Скролл-анимации */}
          <div className="glass-card neon-border rounded-2xl p-5">
            <SectionHeader icon="MousePointer" title="Анимация прокрутки" subtitle="Как элементы появляются при скролле" />
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {SCROLL_ANIMS.map((a) => (
                <OptionCard key={a.id} selected={vals.design_scroll_animation === a.id}
                  onClick={() => set("design_scroll_animation", a.id)} label={a.label}
                  preview={<Icon name={a.icon as "ArrowUp"} size={20} className={vals.design_scroll_animation === a.id ? "text-cyan-400" : "text-gray-500"} />} />
              ))}
            </div>
          </div>

          {/* Карточки hover */}
          <div className="glass-card neon-border rounded-2xl p-5">
            <SectionHeader icon="MousePointerClick" title="Карточки при наведении"
              subtitle="Наведи мышку на превью — увидишь эффект" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {HOVER_CARDS.map((h) => (
                <OptionCard key={h.id} selected={vals.design_hover_cards === h.id}
                  onClick={() => set("design_hover_cards", h.id)} label={h.label} desc={h.desc}
                  preview={<HoverPreview animId={h.id} type="card" />} />
              ))}
            </div>
          </div>

          {/* Кнопки hover */}
          <div className="glass-card neon-border rounded-2xl p-5">
            <SectionHeader icon="Hand" title="Кнопки при наведении"
              subtitle="Наведи мышку на превью — увидишь эффект" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {HOVER_BUTTONS.map((h) => (
                <OptionCard key={h.id} selected={vals.design_hover_buttons === h.id}
                  onClick={() => set("design_hover_buttons", h.id)} label={h.label} desc={h.desc}
                  preview={<HoverPreview animId={h.id} type="btn" />} />
              ))}
            </div>
          </div>

          {/* Меню */}
          <div className="glass-card neon-border rounded-2xl p-5">
            <SectionHeader icon="Menu" title="Пункты меню" subtitle="Эффект при наведении на навигацию" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {HOVER_MENU.map((h) => (
                <OptionCard key={h.id} selected={vals.design_hover_menu === h.id}
                  onClick={() => set("design_hover_menu", h.id)} label={h.label}
                  preview={
                    <div className={`text-xs px-2 py-0.5 border-b-2 transition-all ${
                      vals.design_hover_menu === h.id ? "border-cyan-400 text-cyan-400" : "border-transparent text-gray-500"
                    }`}>Пункт</div>
                  } />
              ))}
            </div>
          </div>

          {/* Модальные окна */}
          <div className="glass-card neon-border rounded-2xl p-5">
            <SectionHeader icon="PanelTop" title="Модальные окна" subtitle="Анимация появления форм и всплывающих окон" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MODAL_ANIMS.map((m) => (
                <OptionCard key={m.id} selected={vals.design_modal_animation === m.id}
                  onClick={() => set("design_modal_animation", m.id)} label={m.label}
                  preview={
                    <div className={`w-10 h-7 rounded border transition-all ${
                      vals.design_modal_animation === m.id ? "border-cyan-500/50 bg-cyan-500/10" : "border-white/15 bg-white/5"
                    }`} />
                  } />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ЭФФЕКТЫ ФОНА ── */}
      {section === "background" && (
        <div className="glass-card neon-border rounded-2xl p-5">
          <SectionHeader icon="Layers" title="Эффект фона" subtitle="Декоративный паттерн на фоне страниц" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BG_EFFECTS.map((bg) => (
              <OptionCard key={bg.id} selected={vals.design_bg_effect === bg.id}
                onClick={() => set("design_bg_effect", bg.id)} label={bg.label}
                preview={
                  <div className={`w-14 h-10 rounded-lg border overflow-hidden flex items-center justify-center transition-all ${
                    vals.design_bg_effect === bg.id ? "border-cyan-500/50" : "border-white/10"
                  }`} style={{ background: "#080c14" }}>
                    <Icon name={bg.icon as "Grid3x3"} size={18} className={vals.design_bg_effect === bg.id ? "text-cyan-400" : "text-gray-600"} />
                  </div>
                } />
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-white/3 border border-white/8 text-gray-500 text-xs">
            Эффект применяется как полупрозрачный слой поверх фона страниц.
          </div>
        </div>
      )}

      {/* ── КОМПОНЕНТЫ ── */}
      {section === "components" && (
        <div className="space-y-4">
          <div className="glass-card neon-border rounded-2xl p-5">
            <SectionHeader icon="RectangleHorizontal" title="Стиль кнопок" subtitle="Форма и оформление всех кнопок" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BTN_STYLES.map((b) => (
                <OptionCard key={b.id} selected={vals.design_btn_style === b.id}
                  onClick={() => set("design_btn_style", b.id)} label={b.label}
                  preview={
                    <div className={`px-3 py-1.5 text-xs font-medium border transition-all ${
                      vals.design_btn_style === b.id ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-400" : "border-white/20 bg-white/5 text-gray-400"
                    } ${b.cls}`}>
                      Кнопка
                    </div>
                  } />
              ))}
            </div>
          </div>

          <div className="glass-card neon-border rounded-2xl p-5">
            <SectionHeader icon="LayoutGrid" title="Стиль карточек" subtitle="Внешний вид блоков и карточек" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CARD_STYLES.map((c) => (
                <OptionCard key={c.id} selected={vals.design_card_style === c.id}
                  onClick={() => set("design_card_style", c.id)} label={c.label}
                  preview={
                    <div className={`w-14 h-9 rounded-lg border transition-all ${
                      vals.design_card_style === c.id ? "border-cyan-500/50 bg-cyan-500/8" : "border-white/10 bg-white/3"
                    }`} />
                  } />
              ))}
            </div>
          </div>

          <div className="glass-card neon-border rounded-2xl p-5">
            <SectionHeader icon="Sun" title="Стиль теней" subtitle="Тип тени для карточек и блоков" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SHADOW_STYLES.map((sh) => (
                <OptionCard key={sh.id} selected={vals.design_shadow_style === sh.id}
                  onClick={() => set("design_shadow_style", sh.id)} label={sh.label}
                  preview={
                    <div className={`w-14 h-9 rounded-lg border transition-all ${
                      vals.design_shadow_style === sh.id
                        ? "border-cyan-500/30 bg-cyan-500/8 shadow-[0_0_12px_rgba(0,212,255,0.3)]"
                        : "border-white/10 bg-white/3"
                    }`} />
                  } />
              ))}
            </div>
          </div>
        </div>
      )}

      <SaveButton saving={saving} onClick={handleSave} />
    </div>
  );
}

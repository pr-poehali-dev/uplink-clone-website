import { useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

export type DesignSection = "colors" | "animations" | "background" | "components";

export const SECTIONS: { id: DesignSection; label: string; icon: string }[] = [
  { id: "colors",     label: "Цвета и шрифты", icon: "Palette" },
  { id: "animations", label: "Анимации",        icon: "Sparkles" },
  { id: "background", label: "Эффекты фона",    icon: "Layers" },
  { id: "components", label: "Компоненты",      icon: "Square" },
];

export const GOOGLE_FONTS = ["Oswald","Roboto","Open Sans","Montserrat","Raleway","Playfair Display","Inter","Nunito","Lato","Poppins","Exo 2","Unbounded","Geologica","Russo One"];
export const BODY_FONTS = ["Golos Text","Roboto","Open Sans","Inter","Nunito","Lato","Source Sans Pro","PT Sans","Manrope","Onest"];

export const SCROLL_ANIMS = [
  { id: "fade-up",    label: "Снизу вверх",  icon: "ArrowUp" },
  { id: "fade-down",  label: "Сверху вниз",  icon: "ArrowDown" },
  { id: "fade-left",  label: "Слева",         icon: "ArrowRight" },
  { id: "fade-right", label: "Справа",        icon: "ArrowLeft" },
  { id: "zoom-in",    label: "Увеличение",    icon: "ZoomIn" },
  { id: "zoom-out",   label: "Уменьшение",    icon: "ZoomOut" },
  { id: "flip-x",     label: "Поворот X",     icon: "RotateCcw" },
  { id: "flip-y",     label: "Поворот Y",     icon: "RefreshCw" },
  { id: "slide-up",   label: "Сдвиг вверх",  icon: "ChevronsUp" },
  { id: "bounce",     label: "Отскок",        icon: "Zap" },
  { id: "rotate-in",  label: "Вращение",      icon: "Wind" },
  { id: "blur-in",    label: "Расфокус",      icon: "Aperture" },
  { id: "none",       label: "Без анимации",  icon: "Minus" },
];

export const HOVER_CARDS = [
  { id: "lift",        label: "Подъём",         desc: "Карточка приподнимается" },
  { id: "glow",        label: "Свечение",        desc: "Неоновое свечение вокруг" },
  { id: "scale",       label: "Масштаб",         desc: "Плавное увеличение" },
  { id: "border-glow", label: "Бордер-свечение", desc: "Светящаяся рамка" },
  { id: "tilt",        label: "3D-наклон",       desc: "Следует за мышкой (3D)" },
  { id: "pulse-border",label: "Пульс рамки",     desc: "Пульсирующая рамка" },
  { id: "spotlight",   label: "Прожектор",       desc: "Свет следует за мышкой" },
  { id: "magnetic",    label: "Магнит",          desc: "Притягивается к мышке" },
  { id: "morph",       label: "Морфинг",         desc: "Рамка меняет форму" },
  { id: "flicker",     label: "Неон-мигание",    desc: "Мигает неоном" },
  { id: "float-up",    label: "Парение",         desc: "Медленный подъём + тень" },
  { id: "trace",       label: "Обводка",         desc: "Бегущая неоновая рамка" },
  { id: "none",        label: "Без эффекта",     desc: "" },
];

export const HOVER_BUTTONS = [
  { id: "glow",       label: "Свечение",     desc: "Неоновое свечение" },
  { id: "scale",      label: "Масштаб",      desc: "Увеличивается" },
  { id: "lift",       label: "Подъём",       desc: "Приподнимается" },
  { id: "pulse",      label: "Пульс",        desc: "Пульсирует" },
  { id: "shake",      label: "Тряска",       desc: "Трясётся влево-вправо" },
  { id: "ripple",     label: "Рябь",         desc: "Эффект ряби" },
  { id: "slide-fill", label: "Заливка",      desc: "Заливается цветом" },
  { id: "magnetic",   label: "Магнит",       desc: "Притягивается к мышке" },
  { id: "rubber",     label: "Резина",       desc: "Резиновый отскок" },
  { id: "jello",      label: "Желе",         desc: "Покачивается как желе" },
  { id: "heartbeat",  label: "Сердцебиение", desc: "Бьётся как сердце" },
  { id: "shockwave",  label: "Волна-клик",   desc: "Волна при нажатии" },
  { id: "wipe",       label: "Неон-заливка", desc: "Заливается неоном" },
  { id: "glitch",     label: "Глитч",        desc: "Эффект помех" },
  { id: "trace",      label: "Обводка",      desc: "Бегущая рамка" },
  { id: "none",       label: "Без эффекта",  desc: "" },
];

export const HOVER_MENU = [
  { id: "underline",     label: "Подчёркивание" },
  { id: "glow-text",     label: "Свечение текста" },
  { id: "bg-fill",       label: "Заливка фона" },
  { id: "scale",         label: "Увеличение" },
  { id: "slide-up",      label: "Сдвиг вверх" },
  { id: "border-bottom", label: "Нижний бордер" },
  { id: "none",          label: "Без эффекта" },
];

export const MODAL_ANIMS = [
  { id: "scale-in",   label: "Масштаб" },
  { id: "slide-up",   label: "Снизу вверх" },
  { id: "slide-down", label: "Сверху вниз" },
  { id: "flip-in",    label: "Переворот" },
  { id: "zoom-blur",  label: "Зум + блюр" },
  { id: "bounce-in",  label: "Отскок" },
  { id: "none",       label: "Без анимации" },
];

export const ANIM_SPEEDS = [
  { id: "fast",   label: "Быстро",    hint: "0.35s" },
  { id: "normal", label: "Нормально", hint: "0.6s" },
  { id: "slow",   label: "Медленно",  hint: "1.1s" },
];

export const BG_EFFECTS = [
  { id: "grid",      label: "Сетка",    icon: "Grid3x3" },
  { id: "dots",      label: "Точки",    icon: "Circle" },
  { id: "diagonal",  label: "Диагональ",icon: "Slash" },
  { id: "hexagon",   label: "Соты",     icon: "Hexagon" },
  { id: "circuit",   label: "Схема",    icon: "Cpu" },
  { id: "waves",     label: "Волны",    icon: "Activity" },
  { id: "noise",     label: "Шум",      icon: "Radio" },
  { id: "aurora",    label: "Аврора",   icon: "Sparkles" },
  { id: "particles", label: "Частицы",  icon: "Atom" },
  { id: "stars",     label: "Звёзды",   icon: "Star" },
  { id: "none",      label: "Без фона", icon: "EyeOff" },
];

export const BTN_STYLES = [
  { id: "rounded",      label: "Скруглённые",  cls: "rounded-xl" },
  { id: "pill",         label: "Таблетка",      cls: "rounded-full" },
  { id: "sharp",        label: "Острые",        cls: "rounded-none" },
  { id: "sharp-sm",     label: "Мягко-острые",  cls: "rounded-sm" },
  { id: "squircle",     label: "Сквиркл",       cls: "rounded-3xl" },
  { id: "cut-corner",   label: "Срез угла",     cls: "rounded-none" },
  { id: "outline-only", label: "Контурные",     cls: "rounded-xl" },
  { id: "ghost",        label: "Призрак",       cls: "rounded-xl" },
];

export const CARD_STYLES = [
  { id: "glass",        label: "Стекло" },
  { id: "flat",         label: "Плоский" },
  { id: "bordered",     label: "Только рамка" },
  { id: "solid",        label: "Монолитный" },
  { id: "neon-outline", label: "Неон-рамка" },
  { id: "gradient",     label: "Градиент" },
  { id: "frosted",      label: "Матовое стекло" },
];

export const SHADOW_STYLES = [
  { id: "neon",    label: "Неоновая" },
  { id: "soft",    label: "Мягкая" },
  { id: "hard",    label: "Жёсткая" },
  { id: "colored", label: "Цветная" },
  { id: "inner",   label: "Внутренняя" },
  { id: "none",    label: "Без тени" },
];

// ── Shared UI ──

export function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
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

export function OptionCard({
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

export function HoverPreview({ animId, type }: { animId: string; type: "card" | "btn" }) {
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

  const hoverTw = ({
    "lift":         "hover:-translate-y-2 hover:shadow-lg",
    "glow":         "hover:shadow-[0_0_20px_rgba(0,212,255,0.5)]",
    "scale":        "hover:scale-110",
    "border-glow":  "hover:border-cyan-400 hover:shadow-[0_0_0_1px_#00d4ff]",
    "pulse-border": "hover:animate-pulse",
    "slide-fill":   "hover:bg-cyan-500/20",
    "ripple":       "hover:bg-cyan-500/10",
  } as Record<string, string>)[animId] ?? "";

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

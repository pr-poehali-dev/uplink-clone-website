import Icon from "@/components/ui/icon";
import {
  SectionHeader, OptionCard, HoverPreview,
  SCROLL_ANIMS, HOVER_CARDS, HOVER_BUTTONS, HOVER_MENU, MODAL_ANIMS, ANIM_SPEEDS, BG_EFFECTS,
} from "./DesignShared";

export type AnimVals = {
  design_scroll_animation: string;
  design_hover_cards: string;
  design_hover_buttons: string;
  design_hover_menu: string;
  design_modal_animation: string;
  design_anim_speed: string;
  design_bg_effect: string;
};

interface AnimProps {
  vals: AnimVals;
  set: (k: keyof AnimVals, v: string) => void;
}

interface BgProps {
  vals: Pick<AnimVals, "design_bg_effect">;
  set: (k: "design_bg_effect", v: string) => void;
}

export function DesignAnimationsTab({ vals, set }: AnimProps) {
  return (
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
  );
}

export function DesignBackgroundTab({ vals, set }: BgProps) {
  return (
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
  );
}

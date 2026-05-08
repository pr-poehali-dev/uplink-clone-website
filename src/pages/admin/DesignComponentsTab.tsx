import { SectionHeader, OptionCard, BTN_STYLES, CARD_STYLES, SHADOW_STYLES } from "./DesignShared";

export type ComponentVals = {
  design_btn_style: string;
  design_card_style: string;
  design_shadow_style: string;
};

interface Props {
  vals: ComponentVals;
  set: (k: keyof ComponentVals, v: string) => void;
}

export function DesignComponentsTab({ vals, set }: Props) {
  return (
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
  );
}

import { SectionHeader } from "./DesignShared";
import { GOOGLE_FONTS, BODY_FONTS } from "./DesignShared";

export type DesignVals = {
  design_accent_color: string;
  design_accent_color_light: string;
  design_font_heading: string;
  design_font_body: string;
  design_float_btn_visible: string;
  design_float_btn_emoji: string;
};

interface Props {
  vals: DesignVals;
  set: (k: keyof DesignVals, v: string) => void;
}

export function DesignColorsTab({ vals, set }: Props) {
  return (
    <div className="space-y-4">
      <div className="glass-card neon-border rounded-2xl p-5">
        <SectionHeader icon="Palette" title="Акцентный цвет" subtitle="Основной цвет бренда — кнопки, ссылки, иконки" />
        <div className="grid sm:grid-cols-2 gap-4">
          {([
            { key: "design_accent_color" as const,       label: "Тёмная тема" },
            { key: "design_accent_color_light" as const, label: "Светлая тема" },
          ]).map(({ key, label }) => (
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
  );
}

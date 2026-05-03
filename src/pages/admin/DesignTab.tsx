import { useState, useEffect } from "react";
import { CmsContent } from "@/hooks/useCmsContent";
import { SaveButton, SaveFn } from "./AdminShared";
import Icon from "@/components/ui/icon";

interface DesignTabProps {
  content: CmsContent;
  password: string;
  save: SaveFn;
  saving: boolean;
}

const GOOGLE_FONTS = ["Oswald", "Roboto", "Open Sans", "Montserrat", "Raleway", "Playfair Display", "Inter", "Nunito", "Lato", "Poppins"];
const BODY_FONTS = ["Golos Text", "Roboto", "Open Sans", "Inter", "Nunito", "Lato", "Source Sans Pro", "PT Sans"];

export function DesignTab({ content, save, saving }: DesignTabProps) {
  const s = content.settings;
  const [vals, setVals] = useState({
    design_accent_color: s.design_accent_color ?? "#00d4ff",
    design_accent_color_light: s.design_accent_color_light ?? "#0284c7",
    design_font_heading: s.design_font_heading ?? "Oswald",
    design_font_body: s.design_font_body ?? "Golos Text",
    design_animations_enabled: s.design_animations_enabled ?? "true",
    design_float_btn_visible: s.design_float_btn_visible ?? "true",
    design_float_btn_emoji: s.design_float_btn_emoji ?? "💬",
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
    });
  }, [s]);

  const set = (k: keyof typeof vals, v: string) => setVals(p => ({ ...p, [k]: v }));

  const handleSave = () => save("save_settings", { updates: vals });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white font-['Oswald']">Дизайн</h2>
        <SaveButton saving={saving} onClick={handleSave} />
      </div>

      {/* Цвета */}
      <div className="glass-card neon-border rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-bold font-['Oswald'] text-base flex items-center gap-2">
          <Icon name="Palette" size={16} className="text-cyan-400" />
          Цвета
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 text-xs mb-2">Акцентный цвет (тёмная тема)</label>
            <div className="flex items-center gap-3">
              <input type="color" value={vals.design_accent_color} onChange={e => set("design_accent_color", e.target.value)}
                className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
              <input value={vals.design_accent_color} onChange={e => set("design_accent_color", e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 font-mono" />
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-2">Акцентный цвет (светлая тема)</label>
            <div className="flex items-center gap-3">
              <input type="color" value={vals.design_accent_color_light} onChange={e => set("design_accent_color_light", e.target.value)}
                className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
              <input value={vals.design_accent_color_light} onChange={e => set("design_accent_color_light", e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 font-mono" />
            </div>
          </div>
        </div>
        <p className="text-gray-600 text-xs">После сохранения цвет применится при следующей загрузке сайта.</p>
      </div>

      {/* Шрифты */}
      <div className="glass-card neon-border rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-bold font-['Oswald'] text-base flex items-center gap-2">
          <Icon name="Type" size={16} className="text-cyan-400" />
          Шрифты
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 text-xs mb-2">Шрифт заголовков</label>
            <select value={vals.design_font_heading} onChange={e => set("design_font_heading", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0d1421] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50">
              {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <p className="text-gray-500 text-xs mt-1.5" style={{ fontFamily: vals.design_font_heading }}>
              Пример заголовка — {vals.design_font_heading}
            </p>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-2">Шрифт основного текста</label>
            <select value={vals.design_font_body} onChange={e => set("design_font_body", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0d1421] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50">
              {BODY_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <p className="text-gray-500 text-xs mt-1.5">
              Пример текста — {vals.design_font_body}
            </p>
          </div>
        </div>
      </div>

      {/* Интерфейс */}
      <div className="glass-card neon-border rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-bold font-['Oswald'] text-base flex items-center gap-2">
          <Icon name="Sliders" size={16} className="text-cyan-400" />
          Интерфейс
        </h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <div>
              <div className="text-sm text-white font-medium">Анимации при прокрутке</div>
              <div className="text-xs text-gray-500">Элементы появляются при скролле</div>
            </div>
            <input type="checkbox" checked={vals.design_animations_enabled === "true"}
              onChange={e => set("design_animations_enabled", e.target.checked ? "true" : "false")}
              className="w-5 h-5 accent-cyan-500 cursor-pointer" />
          </label>
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <div>
              <div className="text-sm text-white font-medium">Плавающая кнопка</div>
              <div className="text-xs text-gray-500">Кнопка в правом нижнем углу страницы</div>
            </div>
            <input type="checkbox" checked={vals.design_float_btn_visible === "true"}
              onChange={e => set("design_float_btn_visible", e.target.checked ? "true" : "false")}
              className="w-5 h-5 accent-cyan-500 cursor-pointer" />
          </label>
          {vals.design_float_btn_visible === "true" && (
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Эмодзи плавающей кнопки</label>
              <input value={vals.design_float_btn_emoji}
                onChange={e => set("design_float_btn_emoji", e.target.value)}
                maxLength={4}
                className="w-24 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-lg focus:outline-none focus:border-cyan-500/50 text-center" />
            </div>
          )}
        </div>
      </div>

      <SaveButton saving={saving} onClick={handleSave} />
    </div>
  );
}

import { useState, useEffect } from "react";
import { CmsContent } from "@/hooks/useCmsContent";
import { SaveButton, SaveFn } from "./AdminShared";
import Icon from "@/components/ui/icon";
import { SECTIONS, DesignSection } from "./DesignShared";
import { DesignColorsTab } from "./DesignColorsTab";
import { DesignAnimationsTab, DesignBackgroundTab } from "./DesignAnimationsTab";
import { DesignComponentsTab } from "./DesignComponentsTab";

interface DesignTabProps {
  content: CmsContent;
  password: string;
  save: SaveFn;
  saving: boolean;
}

type DesignVals = {
  design_accent_color: string;
  design_accent_color_light: string;
  design_font_heading: string;
  design_font_body: string;
  design_animations_enabled: string;
  design_float_btn_visible: string;
  design_float_btn_emoji: string;
  design_scroll_animation: string;
  design_hover_cards: string;
  design_hover_buttons: string;
  design_hover_menu: string;
  design_modal_animation: string;
  design_anim_speed: string;
  design_bg_effect: string;
  design_btn_style: string;
  design_card_style: string;
  design_shadow_style: string;
  default_theme: string;
  theme_toggle_enabled: string;
};

function makeDefaults(s: Record<string, string>): DesignVals {
  return {
    design_accent_color:       s.design_accent_color       ?? "#00d4ff",
    design_accent_color_light: s.design_accent_color_light ?? "#0284c7",
    design_font_heading:       s.design_font_heading       ?? "Oswald",
    design_font_body:          s.design_font_body          ?? "Golos Text",
    design_animations_enabled: s.design_animations_enabled ?? "true",
    design_float_btn_visible:  s.design_float_btn_visible  ?? "true",
    design_float_btn_emoji:    s.design_float_btn_emoji    ?? "💬",
    design_scroll_animation:   s.design_scroll_animation   ?? "fade-up",
    design_hover_cards:        s.design_hover_cards        ?? "lift",
    design_hover_buttons:      s.design_hover_buttons      ?? "glow",
    design_hover_menu:         s.design_hover_menu         ?? "underline",
    design_modal_animation:    s.design_modal_animation    ?? "scale-in",
    design_anim_speed:         s.design_anim_speed         ?? "normal",
    design_bg_effect:          s.design_bg_effect          ?? "grid",
    design_btn_style:          s.design_btn_style          ?? "rounded",
    design_card_style:         s.design_card_style         ?? "glass",
    design_shadow_style:       s.design_shadow_style       ?? "neon",
    default_theme:             s.default_theme             ?? "dark",
    theme_toggle_enabled:      s.theme_toggle_enabled      ?? "true",
  };
}

export function DesignTab({ content, save, saving }: DesignTabProps) {
  const s = content.settings as Record<string, string>;
  const [section, setSection] = useState<DesignSection>("colors");
  const [vals, setVals] = useState<DesignVals>(() => makeDefaults(s));

  useEffect(() => { setVals(makeDefaults(s)); }, [content.settings]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof DesignVals>(k: K, v: string) =>
    setVals((p) => ({ ...p, [k]: v }));

  const handleSave = () => save("save_settings", { updates: vals });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white font-['Oswald']">Дизайн</h2>
        <SaveButton saving={saving} onClick={handleSave} />
      </div>

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

      {section === "colors" && (
        <>
          <div className="glass-card neon-border rounded-2xl p-5 space-y-4">
            <h3 className="text-white font-bold font-['Oswald'] flex items-center gap-2">
              <Icon name="Moon" size={16} className="text-cyan-400" />
              Тема сайта
            </h3>
            <div>
              <label className="block text-gray-400 text-xs mb-2">Тема по умолчанию для новых посетителей</label>
              <div className="flex gap-2">
                {[
                  { val: "dark", label: "Тёмная", icon: "Moon" },
                  { val: "light", label: "Светлая", icon: "Sun" },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => set("default_theme", opt.val)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      vals.default_theme === opt.val
                        ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
                        : "bg-white/5 text-gray-400 border-white/10 hover:text-white"
                    }`}
                  >
                    <Icon name={opt.icon as "Moon"} size={15} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={vals.theme_toggle_enabled !== "false"}
                onChange={(e) => set("theme_toggle_enabled", e.target.checked ? "true" : "false")}
                className="accent-cyan-400 w-4 h-4"
              />
              <span className="text-gray-300 text-sm">Показывать переключатель темы в шапке</span>
            </label>
          </div>
          <DesignColorsTab vals={vals} set={set} />
        </>
      )}
      {section === "animations" && (
        <DesignAnimationsTab vals={vals} set={set} />
      )}
      {section === "background" && (
        <DesignBackgroundTab vals={vals} set={set} />
      )}
      {section === "components" && (
        <DesignComponentsTab vals={vals} set={set} />
      )}

      <SaveButton saving={saving} onClick={handleSave} />
    </div>
  );
}
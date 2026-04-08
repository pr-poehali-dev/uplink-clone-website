import { useState, useEffect } from "react";
import { CmsContent } from "@/hooks/useCmsContent";
import { SaveButton, SaveFn } from "./AdminShared";
import Icon from "@/components/ui/icon";

const SECTIONS = [
  { key: "section_hero_visible",       label: "Главный экран",  desc: "Заголовок, описание, кнопки CTA" },
  { key: "section_services_visible",   label: "Услуги",         desc: "Карточки с перечнем услуг" },
  { key: "section_whyus_visible",      label: "Почему мы",      desc: "Преимущества и статистика" },
  { key: "section_pricing_visible",    label: "Тарифы",         desc: "Тарифные планы с ценами" },
  { key: "section_quickorder_visible", label: "Быстрый заказ",  desc: "Аккордеон с шагами заказа" },
  { key: "section_projects_visible",   label: "Проекты",        desc: "Кейсы и реализованные проекты" },
  { key: "section_contacts_visible",   label: "Контакты",       desc: "Телефон, email, адрес" },
];

export function SectionsTab({ content, save, saving }: { content: CmsContent; password: string; save: SaveFn; saving: boolean }) {
  const [vals, setVals] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initial: Record<string, boolean> = {};
    SECTIONS.forEach(({ key }) => {
      initial[key] = content.settings[key] !== "false";
    });
    setVals(initial);
  }, [content.settings]);

  const handleSave = () => {
    const updates: Record<string, string> = {};
    SECTIONS.forEach(({ key }) => {
      updates[key] = vals[key] ? "true" : "false";
    });
    save("/save/settings", { updates });
  };

  const toggle = (key: string) => setVals((prev) => ({ ...prev, [key]: !prev[key] }));

  const visibleCount = Object.values(vals).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="glass-card neon-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-white font-bold font-['Oswald'] text-lg">Видимость секций</h3>
            <p className="text-gray-500 text-sm mt-0.5">Показано {visibleCount} из {SECTIONS.length} секций</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs">
            <Icon name="Eye" size={12} />
            Изменения применяются сразу после сохранения
          </div>
        </div>
        <div className="space-y-3">
          {SECTIONS.map(({ key, label, desc }) => {
            const isOn = vals[key] ?? true;
            return (
              <div
                key={key}
                onClick={() => toggle(key)}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all select-none ${
                  isOn
                    ? "bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/10"
                    : "bg-white/3 border-white/5 opacity-50 hover:opacity-70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isOn ? "bg-cyan-500/20" : "bg-white/5"}`}>
                    <Icon name={isOn ? "Eye" : "EyeOff"} size={16} className={isOn ? "text-cyan-400" : "text-gray-500"} />
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{label}</div>
                    <div className="text-gray-500 text-xs">{desc}</div>
                  </div>
                </div>
                {/* Toggle switch */}
                <div className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 ${isOn ? "bg-cyan-500" : "bg-gray-700"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${isOn ? "left-5" : "left-0.5"}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <SaveButton onClick={handleSave} saving={saving} />
    </div>
  );
}

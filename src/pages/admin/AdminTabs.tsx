import { useState, useEffect } from "react";
import { CmsContent, CmsService, CmsPlan } from "@/hooks/useCmsContent";
import { SaveButton, SaveFn } from "./AdminShared";

// ---- SETTINGS TAB ----
export function SettingsTab({ content, save, saving }: { content: CmsContent; password: string; save: SaveFn; saving: boolean }) {
  const [vals, setVals] = useState<Record<string, string>>({});

  useEffect(() => {
    const filtered: Record<string, string> = {};
    Object.entries(content.settings).forEach(([k, v]) => {
      if (k !== "admin_password") filtered[k] = v;
    });
    setVals(filtered);
  }, [content.settings]);

  const handleSave = () => save("save_settings", { updates: vals });

  const groups: { label: string; keys: string[] }[] = [
    { label: "Контакты", keys: ["phone", "phone_href", "email_support", "email_info", "address", "work_hours", "response_time"] },
    { label: "Главный экран", keys: ["hero_badge", "hero_title_1", "hero_title_2", "hero_description"] },
    { label: "Цифры в шапке", keys: ["hero_stat_1_value", "hero_stat_1_label", "hero_stat_2_value", "hero_stat_2_label", "hero_stat_3_value", "hero_stat_3_label"] },
    { label: "Достижения", keys: ["whyus_stat_1_num", "whyus_stat_1_label", "whyus_stat_2_num", "whyus_stat_2_label", "whyus_stat_3_num", "whyus_stat_3_label", "whyus_stat_4_num", "whyus_stat_4_label"] },
  ];

  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <div key={g.label} className="glass-card neon-border rounded-2xl p-6">
          <h3 className="text-white font-bold font-['Oswald'] text-lg mb-4">{g.label}</h3>
          <div className="space-y-3">
            {g.keys.map((key) => {
              const label = content.settings[key] !== undefined ? key : key;
              const settingsMeta: Record<string, string> = {
                phone: "Телефон (отображается)", phone_href: "Телефон (ссылка tel:)", email_support: "Email поддержки", email_info: "Email общий",
                address: "Адрес", work_hours: "Режим работы", response_time: "Время реагирования",
                hero_badge: "Подпись над заголовком", hero_title_1: "Заголовок (строка 1)", hero_title_2: "Заголовок (строка 2)", hero_description: "Описание",
                hero_stat_1_value: "Цифра 1", hero_stat_1_label: "Подпись 1", hero_stat_2_value: "Цифра 2", hero_stat_2_label: "Подпись 2", hero_stat_3_value: "Цифра 3", hero_stat_3_label: "Подпись 3",
                whyus_stat_1_num: "Цифра 1", whyus_stat_1_label: "Подпись 1", whyus_stat_2_num: "Цифра 2", whyus_stat_2_label: "Подпись 2",
                whyus_stat_3_num: "Цифра 3", whyus_stat_3_label: "Подпись 3", whyus_stat_4_num: "Цифра 4", whyus_stat_4_label: "Подпись 4",
              };
              void label;
              return (
                <div key={key}>
                  <label className="block text-gray-400 text-xs mb-1">{settingsMeta[key] || key}</label>
                  {(key === "hero_description") ? (
                    <textarea
                      value={vals[key] || ""}
                      onChange={(e) => setVals({ ...vals, [key]: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
                    />
                  ) : (
                    <input
                      value={vals[key] || ""}
                      onChange={(e) => setVals({ ...vals, [key]: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <SaveButton onClick={handleSave} saving={saving} />
    </div>
  );
}

// ---- SERVICES TAB ----
export function ServicesTab({ content, save, saving }: { content: CmsContent; password: string; save: SaveFn; saving: boolean }) {
  const [selected, setSelected] = useState<CmsService | null>(null);

  useEffect(() => {
    if (content.services.length && !selected) setSelected(content.services[0]);
  }, [content.services]);

  const handleSave = () => selected && save("save_service", { service: selected });

  if (!selected) return null;

  return (
    <div className="flex gap-4">
      <div className="w-48 flex-shrink-0 space-y-1">
        {content.services.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelected({ ...s })}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${selected.id === s.id ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
          >
            {s.title}
          </button>
        ))}
      </div>
      <div className="flex-1 glass-card neon-border rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-bold font-['Oswald'] text-lg">Редактирование услуги</h3>
        <div>
          <label className="block text-gray-400 text-xs mb-1">Название</label>
          <input value={selected.title} onChange={(e) => setSelected({ ...selected, title: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
        </div>
        <div>
          <label className="block text-gray-400 text-xs mb-1">Описание</label>
          <textarea value={selected.description} onChange={(e) => setSelected({ ...selected, description: e.target.value })}
            rows={3} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all resize-none" />
        </div>
        <div>
          <label className="block text-gray-400 text-xs mb-2">Пункты услуги</label>
          <div className="space-y-2">
            {selected.items.filter(i => i.item_text !== "[удалено]").map((item, idx) => (
              <input key={item.id} value={item.item_text}
                onChange={(e) => {
                  const items = [...selected.items];
                  items[idx] = { ...item, item_text: e.target.value };
                  setSelected({ ...selected, items });
                }}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="svc_active" checked={selected.is_active}
            onChange={(e) => setSelected({ ...selected, is_active: e.target.checked })} className="accent-cyan-400" />
          <label htmlFor="svc_active" className="text-gray-400 text-sm">Показывать на сайте</label>
        </div>
        <SaveButton onClick={handleSave} saving={saving} />
      </div>
    </div>
  );
}

// ---- PLANS TAB ----
export function PlansTab({ content, save, saving }: { content: CmsContent; password: string; save: SaveFn; saving: boolean }) {
  const [selected, setSelected] = useState<CmsPlan | null>(null);

  useEffect(() => {
    if (content.plans.length && !selected) setSelected(content.plans[0]);
  }, [content.plans]);

  const handleSave = () => selected && save("save_plan", { plan: selected });

  if (!selected) return null;

  return (
    <div className="flex gap-4">
      <div className="w-48 flex-shrink-0 space-y-1">
        {content.plans.map((p) => (
          <button key={p.id} onClick={() => setSelected({ ...p })}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${selected.id === p.id ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
            {p.name}
          </button>
        ))}
      </div>
      <div className="flex-1 glass-card neon-border rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-bold font-['Oswald'] text-lg">Редактирование тарифа</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-400 text-xs mb-1">Название тарифа</label>
            <input value={selected.name} onChange={(e) => setSelected({ ...selected, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Цена</label>
            <input value={selected.price} onChange={(e) => setSelected({ ...selected, price: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
          </div>
        </div>
        <div>
          <label className="block text-gray-400 text-xs mb-1">Бейдж (например: «Рекомендуем»)</label>
          <input value={selected.badge || ""} onChange={(e) => setSelected({ ...selected, badge: e.target.value || null })}
            placeholder="Оставьте пустым, если не нужен"
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
        </div>
        <div>
          <label className="block text-gray-400 text-xs mb-1">Описание тарифа</label>
          <textarea value={selected.description} onChange={(e) => setSelected({ ...selected, description: e.target.value })}
            rows={2} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all resize-none" />
        </div>
        <div>
          <label className="block text-gray-400 text-xs mb-2">Что включено</label>
          <div className="space-y-2">
            {selected.features.filter(f => f.feature_text !== "[удалено]").map((feat, idx) => (
              <input key={feat.id} value={feat.feature_text}
                onChange={(e) => {
                  const features = [...selected.features];
                  features[idx] = { ...feat, feature_text: e.target.value };
                  setSelected({ ...selected, features });
                }}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input type="checkbox" checked={selected.is_highlighted} onChange={(e) => setSelected({ ...selected, is_highlighted: e.target.checked })} className="accent-cyan-400" />
            Выделить (рекомендуемый)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input type="checkbox" checked={selected.is_active} onChange={(e) => setSelected({ ...selected, is_active: e.target.checked })} className="accent-cyan-400" />
            Показывать на сайте
          </label>
        </div>
        <SaveButton onClick={handleSave} saving={saving} />
      </div>
    </div>
  );
}
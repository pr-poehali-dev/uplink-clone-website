import { useState, useEffect } from "react";
import { CmsContent, CmsNavItem } from "@/hooks/useCmsContent";
import { SaveButton, SaveFn } from "./AdminShared";
import Icon from "@/components/ui/icon";

interface Props {
  content: CmsContent;
  password: string;
  save: SaveFn;
  saving: boolean;
}

const cls = {
  input:
    "px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 w-full transition-colors",
  select:
    "px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors",
  label: "block text-gray-400 text-xs mb-1",
  addBtn:
    "px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-sm hover:bg-cyan-500/30 transition-colors flex items-center gap-1.5",
  delBtn: "text-red-400 hover:text-red-300 p-1 transition-colors",
  moveBtn: "p-1 text-gray-500 hover:text-cyan-400 disabled:opacity-25 transition-colors",
};

const NAV_TYPES = [
  { value: "anchor", label: "Якорь (#section)" },
  { value: "internal", label: "Внутренняя страница" },
  { value: "external", label: "Внешняя ссылка" },
];

const BRAND_FIELDS: { key: string; label: string; placeholder: string }[] = [
  { key: "nav_logo_name", label: "Название компании", placeholder: "ИТК Аплинк-IT" },
  { key: "nav_logo_subtitle", label: "Подпись под названием", placeholder: "IT-услуги для вашего бизнеса" },
  { key: "nav_logo_icon", label: "Иконка логотипа (Lucide)", placeholder: "Wifi" },
  { key: "nav_cta_text", label: "Текст кнопки CTA", placeholder: "Связаться" },
];

export function NavTab({ content, save, saving }: Props) {
  const [navItems, setNavItems] = useState<CmsNavItem[]>([]);
  const [brand, setBrand] = useState<Record<string, string>>({});

  useEffect(() => {
    const sorted = [...(content.nav_items ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order
    );
    setNavItems(sorted);
  }, [content.nav_items]);

  useEffect(() => {
    const vals: Record<string, string> = {};
    BRAND_FIELDS.forEach(({ key }) => {
      vals[key] = content.settings[key] ?? "";
    });
    setBrand(vals);
  }, [content.settings]);

  /* ---- nav helpers ---- */
  const updateItem = (id: number, patch: Partial<CmsNavItem>) =>
    setNavItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const removeItem = (id: number) =>
    setNavItems((prev) => prev.filter((it) => it.id !== id));

  const moveItem = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= navItems.length) return;
    const next = [...navItems];
    [next[index], next[target]] = [next[target], next[index]];
    setNavItems(next);
  };

  const addItem = () => {
    const tempId = -Date.now();
    setNavItems((prev) => [
      ...prev,
      {
        id: tempId,
        label: "Новый пункт",
        href: "/",
        type: "internal",
        sort_order: prev.length + 1,
        is_visible: true,
      },
    ]);
  };

  const handleSaveNav = () => {
    const toSend = navItems.map((it, i) => ({
      ...it,
      sort_order: i + 1,
      id: it.id < 0 ? undefined : it.id,
    }));
    save("save_nav_items", { items: toSend });
  };

  const handleSaveBrand = () => {
    save("save_settings", { updates: brand });
  };

  return (
    <div className="space-y-5">
      {/* Nav items */}
      <div className="glass-card neon-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold font-['Oswald'] text-lg flex items-center gap-2">
            <Icon name="Menu" size={18} className="text-cyan-400" />
            Пункты меню
            <span className="text-gray-500 text-sm font-normal">
              ({navItems.length})
            </span>
          </h3>
          <button onClick={addItem} disabled={saving} className={cls.addBtn}>
            <Icon name="Plus" size={14} />
            Добавить пункт
          </button>
        </div>

        {navItems.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">
            Нет пунктов меню
          </p>
        )}

        <div className="space-y-2">
          {navItems.map((item, i) => (
            <div
              key={item.id}
              className={`border rounded-xl p-3 transition-opacity ${
                item.is_visible
                  ? "bg-white/3 border-white/10"
                  : "bg-white/[0.02] border-white/5 opacity-55"
              }`}
            >
              <div className="flex items-center gap-2 flex-wrap">
                {/* Label */}
                <div className="flex-1 min-w-[130px]">
                  <input
                    value={item.label}
                    onChange={(e) => updateItem(item.id, { label: e.target.value })}
                    placeholder="Название пункта"
                    className={cls.input}
                  />
                </div>

                {/* Href */}
                <div className="flex-1 min-w-[130px]">
                  <input
                    value={item.href}
                    onChange={(e) => updateItem(item.id, { href: e.target.value })}
                    placeholder="/#about или /pricing"
                    className={cls.input + " font-mono text-xs"}
                  />
                </div>

                {/* Type */}
                <select
                  value={item.type}
                  onChange={(e) => updateItem(item.id, { type: e.target.value })}
                  className={cls.select}
                >
                  {NAV_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>

                {/* Visible */}
                <label className="flex items-center gap-1.5 cursor-pointer select-none flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={item.is_visible}
                    onChange={(e) => updateItem(item.id, { is_visible: e.target.checked })}
                    className="accent-cyan-400 w-3.5 h-3.5"
                  />
                  <span className="text-gray-400 text-xs">Видим</span>
                </label>

                {/* Move + delete */}
                <div className="flex items-center gap-0 flex-shrink-0">
                  <button
                    onClick={() => moveItem(i, -1)}
                    disabled={i === 0}
                    className={cls.moveBtn}
                    title="Вверх"
                  >
                    <Icon name="ChevronUp" size={15} />
                  </button>
                  <button
                    onClick={() => moveItem(i, 1)}
                    disabled={i === navItems.length - 1}
                    className={cls.moveBtn}
                    title="Вниз"
                  >
                    <Icon name="ChevronDown" size={15} />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className={cls.delBtn}
                    title="Удалить"
                  >
                    <Icon name="X" size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {navItems.length > 0 && (
          <div className="pt-2 border-t border-white/5">
            <SaveButton onClick={handleSaveNav} saving={saving} />
          </div>
        )}
      </div>

      {/* Brand settings */}
      <div className="glass-card neon-border rounded-2xl p-5 space-y-4">
        <h3 className="text-white font-bold font-['Oswald'] text-lg flex items-center gap-2">
          <Icon name="Layers" size={18} className="text-cyan-400" />
          Логотип и бренд
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BRAND_FIELDS.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className={cls.label}>{label}</label>
              <input
                value={brand[key] ?? ""}
                onChange={(e) => setBrand((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                className={
                  key === "nav_logo_icon"
                    ? cls.input + " font-mono text-cyan-400"
                    : cls.input
                }
              />
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center gap-3">
          <SaveButton onClick={handleSaveBrand} saving={saving} />
          <p className="text-gray-600 text-xs">
            Изменения отражаются в шапке сайта
          </p>
        </div>
      </div>
    </div>
  );
}

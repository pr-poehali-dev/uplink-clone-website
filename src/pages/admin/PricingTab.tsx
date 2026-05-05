import { useState, useEffect } from "react";
import { CmsContent, CmsPricingItem } from "@/hooks/useCmsContent";
import { SaveButton, SaveFn } from "./AdminShared";
import Icon from "@/components/ui/icon";

interface Props {
  content: CmsContent;
  password: string;
  save: SaveFn;
  saving: boolean;
}

const cls = {
  input: "px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 w-full transition-colors",
  textarea: "px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 w-full transition-colors resize-none",
  label: "block text-gray-400 text-xs mb-1",
  addBtn: "px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-sm hover:bg-cyan-500/30 transition-colors flex items-center gap-1.5",
  delBtn: "text-red-400 hover:text-red-300 p-1 transition-colors",
  moveBtn: "p-1 text-gray-500 hover:text-cyan-400 disabled:opacity-25 transition-colors",
};

const ACCENT_OPTIONS = [
  { label: "Голубой", value: "from-cyan-400 to-blue-500" },
  { label: "Фиолетовый", value: "from-violet-400 to-purple-500" },
  { label: "Синий", value: "from-blue-400 to-indigo-500" },
  { label: "Зелёный", value: "from-green-400 to-emerald-500" },
  { label: "Оранжевый", value: "from-orange-400 to-amber-500" },
  { label: "Розовый", value: "from-pink-400 to-rose-500" },
  { label: "Красный", value: "from-red-400 to-rose-600" },
  { label: "Жёлтый", value: "from-yellow-400 to-orange-400" },
];

interface Category {
  slug: string;
  title: string;
  icon: string;
  accent: string;
}

function getCategories(items: CmsPricingItem[]): Category[] {
  const seen = new Set<string>();
  const cats: Category[] = [];
  for (const it of items) {
    if (!seen.has(it.category_slug)) {
      seen.add(it.category_slug);
      cats.push({ slug: it.category_slug, title: it.category_title, icon: it.category_icon, accent: it.category_accent || "from-cyan-400 to-blue-500" });
    }
  }
  return cats;
}

type TabId = "items" | "page";

export function PricingTab({ content, save, saving }: Props) {
  const [tab, setTab] = useState<TabId>("items");
  const [items, setItems] = useState<CmsPricingItem[]>([]);
  const [activeCatSlug, setActiveCatSlug] = useState<string | null>(null);

  const s = content.settings ?? {};
  const [pageSettings, setPageSettings] = useState({
    pricing_page_title: s.pricing_page_title ?? "Прайс на IT-услуги",
    pricing_page_city: s.pricing_page_city ?? "в Воронеже",
    pricing_page_badge: s.pricing_page_badge ?? "Стоимость услуг",
    pricing_page_subtitle: s.pricing_page_subtitle ?? "Фиксированные цены без скрытых доплат. Точную стоимость под ваши задачи рассчитываем на бесплатной консультации.",
    pricing_info_text: s.pricing_info_text ?? "Цены указаны ориентировочно и зависят от объёма работ, сложности задачи и удалённости объекта.",
    pricing_cta_text: s.pricing_cta_text ?? "Нужен индивидуальный расчёт или не нашли нужную услугу?",
  });

  useEffect(() => {
    const sorted = [...(content.pricing_items ?? [])].sort((a, b) => a.sort_order - b.sort_order);
    setItems(sorted);
    if (sorted.length && activeCatSlug === null) {
      setActiveCatSlug(sorted[0].category_slug);
    }
  }, [content.pricing_items]);

  useEffect(() => {
    const s = content.settings ?? {};
    setPageSettings({
      pricing_page_title: s.pricing_page_title ?? "Прайс на IT-услуги",
      pricing_page_city: s.pricing_page_city ?? "в Воронеже",
      pricing_page_badge: s.pricing_page_badge ?? "Стоимость услуг",
      pricing_page_subtitle: s.pricing_page_subtitle ?? "Фиксированные цены без скрытых доплат.",
      pricing_info_text: s.pricing_info_text ?? "Цены указаны ориентировочно.",
      pricing_cta_text: s.pricing_cta_text ?? "Нужен индивидуальный расчёт?",
    });
  }, [content.settings]);

  const categories = getCategories(items);
  const activeCat = categories.find((c) => c.slug === activeCatSlug) ?? null;
  const catItems = items.filter((it) => it.category_slug === activeCatSlug);

  const updateItem = (id: number, patch: Partial<CmsPricingItem>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const updateCatMeta = (patch: Partial<Pick<CmsPricingItem, "category_title" | "category_icon" | "category_accent">>) =>
    setItems((prev) => prev.map((it) => it.category_slug === activeCatSlug ? { ...it, ...patch } : it));

  const removeItem = (id: number) => setItems((prev) => prev.filter((it) => it.id !== id));

  const moveItem = (id: number, dir: -1 | 1) => {
    const allIdx = items.findIndex((it) => it.id === id);
    if (allIdx < 0) return;
    const catIdx = catItems.findIndex((it) => it.id === id);
    const targetCatIdx = catIdx + dir;
    if (targetCatIdx < 0 || targetCatIdx >= catItems.length) return;
    const targetId = catItems[targetCatIdx].id;
    const targetAllIdx = items.findIndex((it) => it.id === targetId);
    const next = [...items];
    [next[allIdx], next[targetAllIdx]] = [next[targetAllIdx], next[allIdx]];
    setItems(next);
  };

  const addItem = () => {
    if (!activeCat) return;
    const tempId = -Date.now();
    const newItem: CmsPricingItem = {
      id: tempId,
      category_slug: activeCat.slug,
      category_title: activeCat.title,
      category_icon: activeCat.icon,
      category_accent: activeCat.accent,
      name: "",
      price: "",
      description: "",
      sort_order: items.length + 1,
      is_active: true,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleSaveItems = () => {
    const toSend = items.map((it, i) => ({
      ...it,
      sort_order: i + 1,
      id: it.id < 0 ? undefined : it.id,
    }));
    save("save_pricing_items", { items: toSend });
  };

  const handleSavePage = () => {
    const settings: Record<string, string> = {};
    Object.entries(pageSettings).forEach(([k, v]) => { settings[k] = v; });
    save("save_settings", { settings });
  };

  const subTabs = [
    { id: "items" as TabId, label: "Категории и позиции", icon: "List" },
    { id: "page" as TabId, label: "Настройки страницы", icon: "Settings" },
  ];

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1">
        {subTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? "bg-cyan-500/20 text-cyan-400" : "text-gray-400 hover:text-white"
            }`}
          >
            <Icon name={t.icon as "List"} size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB: Категории и позиции */}
      {tab === "items" && (
        <div className="flex gap-4 min-h-0">
          {/* Sidebar — categories */}
          <div className="w-52 flex-shrink-0 space-y-1">
            <p className="text-gray-500 text-xs px-2 mb-2 uppercase tracking-wider font-semibold">Категории</p>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCatSlug(cat.slug)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all text-left ${
                  activeCatSlug === cat.slug
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${cat.accent} flex items-center justify-center flex-shrink-0`}>
                  <Icon name={cat.icon as "Tag"} size={11} className="text-white" fallback="Tag" />
                </div>
                <span className="truncate">{cat.title}</span>
                <span className="ml-auto text-xs opacity-60 flex-shrink-0">
                  {items.filter((it) => it.category_slug === cat.slug).length}
                </span>
              </button>
            ))}
            {categories.length === 0 && <p className="text-gray-600 text-xs px-2">Нет категорий</p>}
          </div>

          {/* Right panel */}
          <div className="flex-1 min-w-0 space-y-4">
            {!activeCat ? (
              <div className="glass-card neon-border rounded-2xl p-8 flex items-center justify-center">
                <p className="text-gray-500 text-sm">Выберите категорию</p>
              </div>
            ) : (
              <>
                {/* Category meta */}
                <div className="glass-card neon-border rounded-2xl p-5">
                  <h3 className="text-white font-bold font-['Oswald'] text-base mb-4 flex items-center gap-2">
                    <Icon name="Tag" size={16} className="text-cyan-400" />
                    Настройки категории
                  </h3>
                  <div className="grid grid-cols-[1fr_160px] gap-3 mb-3">
                    <div>
                      <label className={cls.label}>Название категории</label>
                      <input
                        value={activeCat.title}
                        onChange={(e) => updateCatMeta({ category_title: e.target.value })}
                        placeholder="Название"
                        className={cls.input}
                      />
                    </div>
                    <div>
                      <label className={cls.label}>Иконка (Lucide)</label>
                      <input
                        value={activeCat.icon}
                        onChange={(e) => updateCatMeta({ category_icon: e.target.value })}
                        placeholder="Monitor"
                        className={cls.input + " font-mono text-cyan-400"}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={cls.label}>Цвет категории</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {ACCENT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => updateCatMeta({ category_accent: opt.value })}
                          title={opt.label}
                          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${opt.value} transition-all ${
                            activeCat.accent === opt.value ? "ring-2 ring-white ring-offset-1 ring-offset-[#0d1420] scale-110" : "opacity-70 hover:opacity-100"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="glass-card neon-border rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white font-bold font-['Oswald'] text-base flex items-center gap-2">
                      <Icon name="List" size={16} className="text-cyan-400" />
                      Позиции прайса
                      <span className="text-gray-500 text-sm font-normal">({catItems.length})</span>
                    </h3>
                    <button onClick={addItem} disabled={saving} className={cls.addBtn}>
                      <Icon name="Plus" size={14} />
                      Добавить
                    </button>
                  </div>

                  {catItems.length === 0 && (
                    <p className="text-gray-500 text-sm py-4 text-center">Нет позиций в этой категории</p>
                  )}

                  <div className="space-y-2">
                    {catItems.map((it, i) => (
                      <div
                        key={it.id}
                        className={`border rounded-xl p-3 space-y-2 transition-opacity ${
                          it.is_active ? "bg-white/3 border-white/10" : "bg-white/[0.02] border-white/5 opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <input
                              value={it.name}
                              onChange={(e) => updateItem(it.id, { name: e.target.value })}
                              placeholder="Название услуги"
                              className={cls.input}
                            />
                          </div>
                          <div className="w-36 flex-shrink-0">
                            <input
                              value={it.price}
                              onChange={(e) => updateItem(it.id, { price: e.target.value })}
                              placeholder="от 1 500 ₽"
                              className={cls.input}
                            />
                          </div>
                          <div className="flex items-center gap-0 flex-shrink-0">
                            <button onClick={() => moveItem(it.id, -1)} disabled={i === 0} className={cls.moveBtn} title="Вверх">
                              <Icon name="ChevronUp" size={15} />
                            </button>
                            <button onClick={() => moveItem(it.id, 1)} disabled={i === catItems.length - 1} className={cls.moveBtn} title="Вниз">
                              <Icon name="ChevronDown" size={15} />
                            </button>
                            <button onClick={() => removeItem(it.id)} className={cls.delBtn} title="Удалить">
                              <Icon name="X" size={15} />
                            </button>
                          </div>
                        </div>
                        <textarea
                          value={it.description}
                          onChange={(e) => updateItem(it.id, { description: e.target.value })}
                          placeholder="Описание (необязательно)"
                          rows={1}
                          className={cls.textarea}
                        />
                        <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
                          <input
                            type="checkbox"
                            checked={it.is_active}
                            onChange={(e) => updateItem(it.id, { is_active: e.target.checked })}
                            className="accent-cyan-400 w-3.5 h-3.5"
                          />
                          <span className="text-gray-400 text-xs">Показывать на сайте</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <SaveButton onClick={handleSaveItems} saving={saving} />
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB: Настройки страницы */}
      {tab === "page" && (
        <div className="space-y-4 max-w-2xl">
          <div className="glass-card neon-border rounded-2xl p-5 space-y-4">
            <h3 className="text-white font-bold font-['Oswald'] text-base flex items-center gap-2">
              <Icon name="FileText" size={16} className="text-cyan-400" />
              Hero-блок страницы
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={cls.label}>Бейдж над заголовком</label>
                <input
                  value={pageSettings.pricing_page_badge}
                  onChange={(e) => setPageSettings({ ...pageSettings, pricing_page_badge: e.target.value })}
                  className={cls.input}
                />
              </div>
              <div>
                <label className={cls.label}>Заголовок страницы</label>
                <input
                  value={pageSettings.pricing_page_title}
                  onChange={(e) => setPageSettings({ ...pageSettings, pricing_page_title: e.target.value })}
                  className={cls.input}
                />
              </div>
              <div>
                <label className={cls.label}>Город (выделяется цветом)</label>
                <input
                  value={pageSettings.pricing_page_city}
                  onChange={(e) => setPageSettings({ ...pageSettings, pricing_page_city: e.target.value })}
                  placeholder="в Воронеже"
                  className={cls.input}
                />
              </div>
              <div className="col-span-2">
                <label className={cls.label}>Подзаголовок</label>
                <textarea
                  value={pageSettings.pricing_page_subtitle}
                  onChange={(e) => setPageSettings({ ...pageSettings, pricing_page_subtitle: e.target.value })}
                  rows={2}
                  className={cls.textarea}
                />
              </div>
            </div>
          </div>

          <div className="glass-card neon-border rounded-2xl p-5 space-y-4">
            <h3 className="text-white font-bold font-['Oswald'] text-base flex items-center gap-2">
              <Icon name="Info" size={16} className="text-cyan-400" />
              Блок «Как формируется цена»
            </h3>
            <div>
              <label className={cls.label}>Текст блока</label>
              <textarea
                value={pageSettings.pricing_info_text}
                onChange={(e) => setPageSettings({ ...pageSettings, pricing_info_text: e.target.value })}
                rows={3}
                className={cls.textarea}
              />
            </div>
          </div>

          <div className="glass-card neon-border rounded-2xl p-5 space-y-4">
            <h3 className="text-white font-bold font-['Oswald'] text-base flex items-center gap-2">
              <Icon name="MousePointerClick" size={16} className="text-cyan-400" />
              CTA в боковой панели
            </h3>
            <div>
              <label className={cls.label}>Текст над кнопкой</label>
              <textarea
                value={pageSettings.pricing_cta_text}
                onChange={(e) => setPageSettings({ ...pageSettings, pricing_cta_text: e.target.value })}
                rows={2}
                className={cls.textarea}
              />
            </div>
          </div>

          <SaveButton onClick={handleSavePage} saving={saving} />
        </div>
      )}
    </div>
  );
}

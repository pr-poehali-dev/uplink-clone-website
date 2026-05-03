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
  input:
    "px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 w-full transition-colors",
  textarea:
    "px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 w-full transition-colors resize-none",
  label: "block text-gray-400 text-xs mb-1",
  addBtn:
    "px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-sm hover:bg-cyan-500/30 transition-colors flex items-center gap-1.5",
  delBtn: "text-red-400 hover:text-red-300 p-1 transition-colors",
  moveBtn: "p-1 text-gray-500 hover:text-cyan-400 disabled:opacity-25 transition-colors",
};

interface Category {
  slug: string;
  title: string;
  icon: string;
}

function getCategories(items: CmsPricingItem[]): Category[] {
  const seen = new Set<string>();
  const cats: Category[] = [];
  for (const it of items) {
    if (!seen.has(it.category_slug)) {
      seen.add(it.category_slug);
      cats.push({ slug: it.category_slug, title: it.category_title, icon: it.category_icon });
    }
  }
  return cats;
}

export function PricingTab({ content, save, saving }: Props) {
  const [items, setItems] = useState<CmsPricingItem[]>([]);
  const [activeCatSlug, setActiveCatSlug] = useState<string | null>(null);

  useEffect(() => {
    const sorted = [...(content.pricing_items ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order
    );
    setItems(sorted);
    if (sorted.length && activeCatSlug === null) {
      setActiveCatSlug(sorted[0].category_slug);
    }
  }, [content.pricing_items]);

  const categories = getCategories(items);
  const activeCat = categories.find((c) => c.slug === activeCatSlug) ?? null;
  const catItems = items.filter((it) => it.category_slug === activeCatSlug);

  /* ---- helpers ---- */
  const updateItem = (id: number, patch: Partial<CmsPricingItem>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const updateCatMeta = (patch: Partial<Pick<CmsPricingItem, "category_title" | "category_icon">>) =>
    setItems((prev) =>
      prev.map((it) =>
        it.category_slug === activeCatSlug ? { ...it, ...patch } : it
      )
    );

  const removeItem = (id: number) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

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
      name: "",
      price: "",
      description: "",
      sort_order: items.length + 1,
      is_active: true,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleSave = () => {
    const toSend = items.map((it, i) => ({
      ...it,
      sort_order: i + 1,
      id: it.id < 0 ? undefined : it.id,
    }));
    save("save_pricing_items", { items: toSend });
  };

  return (
    <div className="flex gap-4 min-h-0">
      {/* Sidebar — categories */}
      <div className="w-52 flex-shrink-0 space-y-1">
        <p className="text-gray-500 text-xs px-2 mb-2 uppercase tracking-wider font-semibold">
          Категории
        </p>
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
            <Icon name={cat.icon as "Tag"} size={14} className="flex-shrink-0" />
            <span className="truncate">{cat.title}</span>
            <span className="ml-auto text-xs opacity-60 flex-shrink-0">
              {items.filter((it) => it.category_slug === cat.slug).length}
            </span>
          </button>
        ))}

        {categories.length === 0 && (
          <p className="text-gray-600 text-xs px-2">Нет категорий</p>
        )}
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
              <div className="grid grid-cols-[1fr_160px] gap-3">
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
            </div>

            {/* Items */}
            <div className="glass-card neon-border rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-white font-bold font-['Oswald'] text-base flex items-center gap-2">
                  <Icon name="List" size={16} className="text-cyan-400" />
                  Позиции прайса
                  <span className="text-gray-500 text-sm font-normal">
                    ({catItems.length})
                  </span>
                </h3>
                <button onClick={addItem} disabled={saving} className={cls.addBtn}>
                  <Icon name="Plus" size={14} />
                  Добавить
                </button>
              </div>

              {catItems.length === 0 && (
                <p className="text-gray-500 text-sm py-4 text-center">
                  Нет позиций в этой категории
                </p>
              )}

              <div className="space-y-2">
                {catItems.map((it, i) => (
                  <div
                    key={it.id}
                    className={`border rounded-xl p-3 space-y-2 transition-opacity ${
                      it.is_active
                        ? "bg-white/3 border-white/10"
                        : "bg-white/[0.02] border-white/5 opacity-60"
                    }`}
                  >
                    {/* Row 1: name + price + controls */}
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
                          placeholder="Цена, напр. от 1 500 ₽"
                          className={cls.input}
                        />
                      </div>
                      {/* Move + delete */}
                      <div className="flex items-center gap-0 flex-shrink-0">
                        <button
                          onClick={() => moveItem(it.id, -1)}
                          disabled={i === 0}
                          className={cls.moveBtn}
                          title="Вверх"
                        >
                          <Icon name="ChevronUp" size={15} />
                        </button>
                        <button
                          onClick={() => moveItem(it.id, 1)}
                          disabled={i === catItems.length - 1}
                          className={cls.moveBtn}
                          title="Вниз"
                        >
                          <Icon name="ChevronDown" size={15} />
                        </button>
                        <button
                          onClick={() => removeItem(it.id)}
                          className={cls.delBtn}
                          title="Удалить"
                        >
                          <Icon name="X" size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Row 2: description */}
                    <textarea
                      value={it.description}
                      onChange={(e) => updateItem(it.id, { description: e.target.value })}
                      placeholder="Описание (необязательно)"
                      rows={1}
                      className={cls.textarea}
                    />

                    {/* Row 3: active */}
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

            <SaveButton onClick={handleSave} saving={saving} />
          </>
        )}
      </div>
    </div>
  );
}

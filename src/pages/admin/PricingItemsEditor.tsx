import { CmsPricingItem } from "@/hooks/useCmsContent";
import { SaveButton, SaveFn } from "./AdminShared";
import Icon from "@/components/ui/icon";
import { cls, ACCENT_OPTIONS, Category, getCategories } from "./pricing-shared";

interface Props {
  items: CmsPricingItem[];
  activeCatSlug: string | null;
  saving: boolean;
  onSetActiveCatSlug: (slug: string) => void;
  onUpdateItem: (id: number, patch: Partial<CmsPricingItem>) => void;
  onUpdateCatMeta: (patch: Partial<Pick<CmsPricingItem, "category_title" | "category_icon" | "category_accent">>) => void;
  onRemoveItem: (id: number) => void;
  onMoveItem: (id: number, dir: -1 | 1) => void;
  onAddItem: () => void;
  onSave: () => void;
}

export function PricingItemsEditor({
  items,
  activeCatSlug,
  saving,
  onSetActiveCatSlug,
  onUpdateItem,
  onUpdateCatMeta,
  onRemoveItem,
  onMoveItem,
  onAddItem,
  onSave,
}: Props) {
  const categories: Category[] = getCategories(items);
  const activeCat = categories.find((c) => c.slug === activeCatSlug) ?? null;
  const catItems = items.filter((it) => it.category_slug === activeCatSlug);

  return (
    <div className="flex gap-4 min-h-0">
      {/* Sidebar — categories */}
      <div className="w-52 flex-shrink-0 space-y-1">
        <p className="text-gray-500 text-xs px-2 mb-2 uppercase tracking-wider font-semibold">Категории</p>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => onSetActiveCatSlug(cat.slug)}
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
                    onChange={(e) => onUpdateCatMeta({ category_title: e.target.value })}
                    placeholder="Название"
                    className={cls.input}
                  />
                </div>
                <div>
                  <label className={cls.label}>Иконка (Lucide)</label>
                  <input
                    value={activeCat.icon}
                    onChange={(e) => onUpdateCatMeta({ category_icon: e.target.value })}
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
                      onClick={() => onUpdateCatMeta({ category_accent: opt.value })}
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
                <button onClick={onAddItem} disabled={saving} className={cls.addBtn}>
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
                          onChange={(e) => onUpdateItem(it.id, { name: e.target.value })}
                          placeholder="Название услуги"
                          className={cls.input}
                        />
                      </div>
                      <div className="w-36 flex-shrink-0">
                        <input
                          value={it.price}
                          onChange={(e) => onUpdateItem(it.id, { price: e.target.value })}
                          placeholder="от 1 500 ₽"
                          className={cls.input}
                        />
                      </div>
                      <div className="flex items-center gap-0 flex-shrink-0">
                        <button onClick={() => onMoveItem(it.id, -1)} disabled={i === 0} className={cls.moveBtn} title="Вверх">
                          <Icon name="ChevronUp" size={15} />
                        </button>
                        <button onClick={() => onMoveItem(it.id, 1)} disabled={i === catItems.length - 1} className={cls.moveBtn} title="Вниз">
                          <Icon name="ChevronDown" size={15} />
                        </button>
                        <button onClick={() => onRemoveItem(it.id)} className={cls.delBtn} title="Удалить">
                          <Icon name="X" size={15} />
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={it.description}
                      onChange={(e) => onUpdateItem(it.id, { description: e.target.value })}
                      placeholder="Описание (необязательно)"
                      rows={1}
                      className={cls.textarea}
                    />
                    <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
                      <input
                        type="checkbox"
                        checked={it.is_active}
                        onChange={(e) => onUpdateItem(it.id, { is_active: e.target.checked })}
                        className="accent-cyan-400 w-3.5 h-3.5"
                      />
                      <span className="text-gray-400 text-xs">Показывать на сайте</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <SaveButton onClick={onSave} saving={saving} />
          </>
        )}
      </div>
    </div>
  );
}

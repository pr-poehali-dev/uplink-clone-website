import { useState, useEffect } from "react";
import { CmsContent, CmsPricingItem, CmsPage } from "@/hooks/useCmsContent";
import { SaveFn } from "./AdminShared";
import Icon from "@/components/ui/icon";
import { PricingSectionsEditor } from "./PricingSectionsEditor";
import { PricingItemsEditor } from "./PricingItemsEditor";
import { PricingPageEditor } from "./PricingPageEditor";
import { PricingPageSeoEditor } from "./PricingPageSeoEditor";

interface Props {
  content: CmsContent;
  password: string;
  save: SaveFn;
  saving: boolean;
}

type TabId = "sections" | "items" | "page" | "seo";

interface PageSettings {
  pricing_page_title: string;
  pricing_page_city: string;
  pricing_page_badge: string;
  pricing_page_subtitle: string;
  pricing_info_text: string;
  pricing_cta_text: string;
}

export function PricingTab({ content, save, saving }: Props) {
  const [tab, setTab] = useState<TabId>("items");
  const [items, setItems] = useState<CmsPricingItem[]>([]);
  const [activeCatSlug, setActiveCatSlug] = useState<string | null>(null);

  const s = content.settings ?? {};
  const [pageSettings, setPageSettings] = useState<PageSettings>({
    pricing_page_title: s.pricing_page_title ?? "Прайс на IT-услуги",
    pricing_page_city: s.pricing_page_city ?? "в Воронеже",
    pricing_page_badge: s.pricing_page_badge ?? "Стоимость услуг",
    pricing_page_subtitle: s.pricing_page_subtitle ?? "Фиксированные цены без скрытых доплат. Точную стоимость под ваши задачи рассчитываем на бесплатной консультации.",
    pricing_info_text: s.pricing_info_text ?? "Цены указаны ориентировочно и зависят от объёма работ, сложности задачи и удалённости объекта.",
    pricing_cta_text: s.pricing_cta_text ?? "Нужен индивидуальный расчёт или не нашли нужную услугу?",
  });

  const [pages, setPages] = useState<CmsPage[]>([]);
  const [pricingPage, setPricingPage] = useState<(CmsPage & { is_published?: boolean; metrika_counter?: string }) | null>(null);

  useEffect(() => {
    const sorted = [...(content.pricing_items ?? [])].sort((a, b) => a.sort_order - b.sort_order);
    setItems(sorted);
    if (sorted.length && activeCatSlug === null) {
      setActiveCatSlug(sorted[0].category_slug);
    }
  }, [content.pricing_items]);

  useEffect(() => {
    const all = [...(content.pages ?? [])];
    setPages(all);
    const found = all.find((p) => p.route === "/pricing");
    if (found) setPricingPage(found as CmsPage & { is_published?: boolean; metrika_counter?: string });
  }, [content.pages]);

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

  const updateItem = (id: number, patch: Partial<CmsPricingItem>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const updateCatMeta = (patch: Partial<Pick<CmsPricingItem, "category_title" | "category_icon" | "category_accent">>) =>
    setItems((prev) => prev.map((it) => it.category_slug === activeCatSlug ? { ...it, ...patch } : it));

  const removeItem = (id: number) => setItems((prev) => prev.filter((it) => it.id !== id));

  const moveItem = (id: number, dir: -1 | 1) => {
    const catItems = items.filter((it) => it.category_slug === activeCatSlug);
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
    const categories = Array.from(new Map(items.map(i => [i.category_slug, i])).values());
    const activeCat = categories.find((c) => c.category_slug === activeCatSlug);
    if (!activeCat) return;
    const tempId = -Date.now();
    const newItem: CmsPricingItem = {
      id: tempId,
      category_slug: activeCat.category_slug,
      category_title: activeCat.category_title,
      category_icon: activeCat.category_icon,
      category_accent: activeCat.category_accent,
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

  const updatePricingPage = (patch: Partial<CmsPage & { is_published?: boolean; metrika_counter?: string }>) => {
    if (!pricingPage) return;
    setPricingPage({ ...pricingPage, ...patch });
    setPages((prev) => prev.map((p) => p.route === "/pricing" ? { ...p, ...patch } : p));
  };

  const handleSaveSeo = () => {
    save("save_pages", { items: pages });
  };

  const subTabs = [
    { id: "sections" as TabId, label: "Секции", icon: "Layers" },
    { id: "items" as TabId, label: "Категории и позиции", icon: "List" },
    { id: "page" as TabId, label: "Настройки страницы", icon: "Settings" },
    { id: "seo" as TabId, label: "SEO", icon: "Search" },
  ];

  return (
    <div className="space-y-4">
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

      {tab === "sections" && (
        <PricingSectionsEditor settings={content.settings ?? {}} save={save} saving={saving} />
      )}

      {tab === "items" && (
        <PricingItemsEditor
          items={items}
          activeCatSlug={activeCatSlug}
          saving={saving}
          onSetActiveCatSlug={setActiveCatSlug}
          onUpdateItem={updateItem}
          onUpdateCatMeta={updateCatMeta}
          onRemoveItem={removeItem}
          onMoveItem={moveItem}
          onAddItem={addItem}
          onSave={handleSaveItems}
        />
      )}

      {tab === "page" && (
        <PricingPageEditor
          pageSettings={pageSettings}
          saving={saving}
          onChangeSettings={setPageSettings}
          onSave={handleSavePage}
        />
      )}

      {tab === "seo" && (
        <PricingPageSeoEditor
          pricingPage={pricingPage}
          saving={saving}
          onUpdatePage={updatePricingPage}
          onSave={handleSaveSeo}
        />
      )}
    </div>
  );
}

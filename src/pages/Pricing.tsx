import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactModal from "@/components/ContactModal";
import Icon from "@/components/ui/icon";
import { useCmsContent } from "@/hooks/useCmsContent";

const DEFAULT_SECTION_ORDER = ["hero", "items", "info", "cta"];

function parsePricingSections(settings: Record<string, string>) {
  const raw = settings.pricing_section_order;
  const order = raw
    ? raw.split(",").map((s) => s.trim()).filter((s) => DEFAULT_SECTION_ORDER.includes(s))
    : DEFAULT_SECTION_ORDER;
  const missing = DEFAULT_SECTION_ORDER.filter((s) => !order.includes(s));
  const visible: Record<string, boolean> = {};
  for (const id of DEFAULT_SECTION_ORDER) {
    visible[id] = settings[`pricing_section_${id}_visible`] !== "false";
  }
  return { order: [...order, ...missing], visible };
}

export default function PricingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { content, loading } = useCmsContent();

  const s = content?.settings ?? {};

  const pageTitle = s.pricing_page_title || "Прайс на IT-услуги";
  const pageCity = s.pricing_page_city || "";
  const pageSubtitle = s.pricing_page_subtitle || "Фиксированные цены без скрытых доплат. Точную стоимость под ваши задачи рассчитываем на бесплатной консультации.";
  const pageBadge = s.pricing_page_badge || "Стоимость услуг";
  const infoText = s.pricing_info_text || "Цены указаны ориентировочно и зависят от объёма работ, сложности задачи и удалённости объекта. Точную стоимость рассчитываем после бесплатной консультации или выезда специалиста.";
  const ctaText = s.pricing_cta_text || "Нужен индивидуальный расчёт или не нашли нужную услугу?";

  const allItems = (content?.pricing_items ?? []).filter(i => i.is_active);

  const categories = Array.from(
    new Map(allItems.map(i => [i.category_slug, {
      slug: i.category_slug,
      title: i.category_title,
      icon: i.category_icon,
      accent: i.category_accent || "from-cyan-400 to-blue-500",
    }])).values()
  );

  const activeCatSlug = activeCategory ?? categories[0]?.slug ?? null;
  const activeCat = categories.find(c => c.slug === activeCatSlug) ?? categories[0] ?? null;
  const activeItems = allItems.filter(i => i.category_slug === activeCatSlug);

  const { order: sectionOrder, visible: sectionVisible } = parsePricingSections(s);
  const show = (id: string) => sectionVisible[id] !== false;

  // Позиция блока "info" относительно items определяет куда его рендерить
  const infoBeforeItems = sectionOrder.indexOf("info") < sectionOrder.indexOf("items");
  const ctaBeforeItems = sectionOrder.indexOf("cta") < sectionOrder.indexOf("items");

  const heroSection = show("hero") ? (
    <section key="hero" className="pt-32 pb-10 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <div className="absolute top-20 -left-40 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="container mx-auto px-4 relative">
        <nav className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-8">
          <Link to="/" className="hover:text-cyan-500 transition-colors">Главная</Link>
          <Icon name="ChevronRight" size={14} />
          <span className="text-[var(--text-primary)]">Прайс</span>
        </nav>
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-sm font-medium mb-5">
            <Icon name="Receipt" size={14} />
            {pageBadge}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-['Oswald'] mb-4 leading-tight">
            {pageTitle}{pageCity && <> <span className="gradient-text">{pageCity}</span></>}
          </h1>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed">{pageSubtitle}</p>
        </div>
      </div>
    </section>
  ) : null;

  const infoBlock = show("info") && infoText ? (
    <div key="info" className="mt-8 rounded-2xl bg-cyan-500/8 border border-cyan-500/20 p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon name="Info" size={18} className="text-cyan-500" />
        </div>
        <div>
          <h4 className="font-semibold text-[var(--text-primary)] mb-1">Как формируется цена?</h4>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">{infoText}</p>
        </div>
      </div>
    </div>
  ) : null;

  const ctaBlock = show("cta") ? (
    <div key="cta" className="glass-card neon-border rounded-2xl p-5 mt-4">
      <p className="text-sm text-[var(--text-muted)] mb-3 leading-relaxed">{ctaText}</p>
      <button onClick={() => setModalOpen(true)} className="btn-neon w-full py-3 rounded-xl text-sm font-semibold">
        Получить расчёт
      </button>
    </div>
  ) : null;

  // Секции которые идут до основного блока с таблицей
  const beforeItems = sectionOrder
    .filter((id) => id !== "items" && sectionOrder.indexOf(id) < sectionOrder.indexOf("items"))
    .map((id) => (id === "info" ? infoBlock : id === "cta" ? ctaBlock : null));

  // Секции которые идут после основного блока
  const afterItems = sectionOrder
    .filter((id) => id !== "items" && sectionOrder.indexOf(id) > sectionOrder.indexOf("items"))
    .map((id) => (id === "info" ? infoBlock : id === "cta" ? ctaBlock : null));

  // Убираем предупреждения об неиспользуемых переменных
  void infoBeforeItems;
  void ctaBeforeItems;

  return (
    <div className="min-h-screen" style={{ background: "var(--dark-bg)", color: "var(--text-primary)" }}>
      <Header onContactClick={() => setModalOpen(true)} settings={content?.settings} services={content?.services} />

      {heroSection}

      <section className="pb-16 relative">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-24 text-[var(--text-muted)]">Загрузка...</div>
          ) : (
            <div className="grid lg:grid-cols-[260px_1fr] gap-8 max-w-7xl mx-auto">
              {/* Левая панель — категории + CTA/info если они перед items */}
              <div className="lg:sticky lg:top-24 h-fit">
                <div className="glass-card neon-border rounded-2xl p-3 space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => setActiveCategory(cat.slug)}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                        activeCatSlug === cat.slug
                          ? "bg-cyan-500/15 text-cyan-500 border border-cyan-500/30"
                          : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] border border-transparent"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cat.accent} flex items-center justify-center flex-shrink-0`}>
                        <Icon name={cat.icon as "Server"} size={15} className="text-white" fallback="Settings" />
                      </div>
                      <span className="leading-tight">{cat.title}</span>
                    </button>
                  ))}
                </div>

                {/* CTA блок в сайдбаре — только если show("cta") */}
                {show("cta") && ctaBlock}
              </div>

              {/* Правая панель */}
              <div>
                {/* Блоки до таблицы */}
                {beforeItems.filter((b) => b && b.key !== "cta")}

                {activeCat && (
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${activeCat.accent} flex items-center justify-center`}>
                      <Icon name={activeCat.icon as "Server"} size={20} className="text-white" fallback="Settings" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold font-['Oswald'] text-[var(--text-primary)]">{activeCat.title}</h2>
                      <Link to={`/services/${activeCat.slug}`} className="text-sm text-cyan-500 hover:underline flex items-center gap-1">
                        Подробнее об услуге <Icon name="ArrowRight" size={12} />
                      </Link>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {activeItems.map((item) => (
                    <div key={item.id} className="glass-card neon-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-3 group hover:border-cyan-500/30 transition-all">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[var(--text-primary)] mb-1">{item.name}</h3>
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-lg font-bold gradient-text font-['Oswald'] whitespace-nowrap">{item.price}</div>
                        <button
                          onClick={() => setModalOpen(true)}
                          className="btn-outline-neon px-4 py-2 rounded-xl text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block"
                        >
                          Заказать
                        </button>
                      </div>
                    </div>
                  ))}
                  {activeItems.length === 0 && (
                    <div className="text-center py-16 text-[var(--text-muted)]">Позиции в этой категории не найдены</div>
                  )}
                </div>

                {/* Блоки после таблицы (info по умолчанию) */}
                {afterItems.filter((b) => b && b.key !== "cta")}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer onContactClick={() => setModalOpen(true)} settings={content?.settings} />
      <ContactModal open={modalOpen} onClose={() => setModalOpen(false)} source="Страница прайса" />
    </div>
  );
}

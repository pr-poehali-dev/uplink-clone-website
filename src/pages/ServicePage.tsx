import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactModal from "@/components/ContactModal";
import Calculator from "@/components/Calculator";
import VideoSurveillanceCalculator from "@/components/VideoSurveillanceCalculator";
import Icon from "@/components/ui/icon";
import { useCmsContent, CmsService } from "@/hooks/useCmsContent";
import ServicePageHero from "./service-page/ServicePageHero";
import ServicePageSections from "./service-page/ServicePageSections";

const DEFAULT_SECTION_ORDER = ["description", "benefits", "steps", "faq", "cta", "other", "calculator"];

function parseSectionSettings(settings: Record<string, string> | undefined, slug: string) {
  if (!settings || !slug) return { order: DEFAULT_SECTION_ORDER, visible: {} as Record<string, boolean> };
  const orderKey = `service_${slug}_section_order`;
  const raw = settings[orderKey];
  const order = raw
    ? raw.split(",").map((s) => s.trim()).filter((s) => DEFAULT_SECTION_ORDER.includes(s))
    : DEFAULT_SECTION_ORDER;
  const missing = DEFAULT_SECTION_ORDER.filter((s) => !order.includes(s));

  const visible: Record<string, boolean> = {};
  for (const id of DEFAULT_SECTION_ORDER) {
    visible[id] = settings[`service_${slug}_section_${id}_visible`] !== "false";
  }
  return { order: [...order, ...missing], visible };
}

export default function ServicePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { content, loading } = useCmsContent();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSource, setModalSource] = useState("");
  const [prefillMessage, setPrefillMessage] = useState<string | undefined>();
  const [prefillService, setPrefillService] = useState<string | undefined>();

  const service: CmsService | undefined = useMemo(
    () => content?.services?.find((s) => s.slug === slug && s.is_active && s.page_visible !== false),
    [content, slug]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [slug]);

  useEffect(() => {
    if (!service) return;

    if (service.seo_title) document.title = service.seo_title;

    // SEO description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) { metaDesc = document.createElement('meta'); (metaDesc as HTMLMetaElement).name = 'description'; document.head.appendChild(metaDesc); }
    if (service.seo_description) metaDesc.setAttribute('content', service.seo_description);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `https://uplink-it.ru/services/${service.slug}`;

    // Schema.org Service + BreadcrumbList
    const schemaId = 'service-page-schema';
    document.getElementById(schemaId)?.remove();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = schemaId;
    script.text = JSON.stringify([
      {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": service.title,
        "description": service.seo_description || service.short_desc || service.description,
        "provider": { "@type": "LocalBusiness", "name": "ИТК Аплинк-IT", "telephone": "+78452397738", "address": { "@type": "PostalAddress", "addressLocality": "Саратов", "addressCountry": "RU" } },
        "areaServed": { "@type": "City", "name": "Саратов" },
        "url": `https://uplink-it.ru/services/${service.slug}`,
        ...(service.price_from ? { "offers": { "@type": "Offer", "price": service.price_from, "priceCurrency": "RUB" } } : {}),
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://uplink-it.ru/" },
          { "@type": "ListItem", "position": 2, "name": service.title, "item": `https://uplink-it.ru/services/${service.slug}` }
        ]
      }
    ]);
    document.head.appendChild(script);

    return () => { document.getElementById(schemaId)?.remove(); };
  }, [service]);

  const openModal = (source: string, payload?: string) => {
    setModalSource(source);
    setPrefillMessage(payload);
    setPrefillService(service?.title);
    setModalOpen(true);
  };

  if (loading && !content) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <div className="text-cyan-400 animate-pulse">Загрузка...</div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-[#080c14] text-white">
        <Header onContactClick={() => openModal("Шапка")} settings={content?.settings} services={content?.services} />
        <div className="container mx-auto px-4 py-32 text-center">
          <Icon name="AlertCircle" size={48} className="text-cyan-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold font-['Oswald'] mb-3">Услуга не найдена</h1>
          <p className="text-gray-400 mb-6">Возможно, услуга была переименована или временно скрыта.</p>
          <button onClick={() => navigate("/")} className="btn-neon px-6 py-3 rounded-xl font-semibold">
            На главную
          </button>
        </div>
        <Footer onContactClick={() => openModal("Подвал")} settings={content?.settings} />
      </div>
    );
  }

  const benefits = (service.benefits || []).filter((b) => b.title !== "[удалено]");
  const steps = (service.steps || []).filter((s) => s.step_title !== "[удалено]");
  const sFaq = (service.faq || []).filter((f) => f.question !== "[удалено]");
  const items = (service.items || []).filter((i) => i.item_text !== "[удалено]");

  const otherServices = (content?.services || [])
    .filter((s) => s.is_active && s.slug && s.slug !== slug)
    .slice(0, 3);

  const isOutsourcing = slug === "it-outsourcing";
  const isVideoSurveillance = slug === "video-surveillance";

  const { order: sectionOrder, visible: sectionVisible } = parseSectionSettings(content?.settings, slug || "");

  // Собираем секции, которые рендерятся вне ServicePageSections — калькулятор
  const showCalculator = sectionVisible["calculator"] !== false && (isOutsourcing || isVideoSurveillance);

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      <Header onContactClick={() => openModal("Шапка сайта")} settings={content?.settings} services={content?.services} />

      <ServicePageHero
        service={service}
        items={items}
        isOutsourcing={isOutsourcing}
        isVideoSurveillance={isVideoSurveillance}
        onContactClick={() => openModal(`Услуга: ${service.title}`)}
      />

      <ServicePageSections
        service={service}
        benefits={benefits}
        steps={steps}
        sFaq={sFaq}
        otherServices={otherServices}
        settings={content?.settings}
        onContactClick={openModal}
        sectionOrder={sectionOrder}
        sectionVisible={sectionVisible}
      />

      {showCalculator && sectionOrder.indexOf("calculator") > sectionOrder.indexOf("faq") && (
        <>
          {isOutsourcing && (
            <Calculator
              calcSettings={content?.calc_settings}
              calcOptions={content?.calc_options}
              calcSliders={content?.calc_sliders}
              onContactClick={openModal}
            />
          )}
          {isVideoSurveillance && (
            <VideoSurveillanceCalculator
              onContactClick={openModal}
              videoCameras={content?.video_cameras}
              videoEquipment={content?.video_equipment}
              settings={content?.settings}
            />
          )}
        </>
      )}

      <Footer onContactClick={() => openModal("Подвал")} settings={content?.settings} />

      <ContactModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        source={modalSource}
        prefillMessage={prefillMessage}
        prefillService={prefillService}
      />
    </div>
  );
}
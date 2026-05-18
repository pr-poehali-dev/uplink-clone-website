import { lazy, Suspense, useState, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import WhyUs from "@/components/WhyUs";
import Footer from "@/components/Footer";
import ContactModal from "@/components/ContactModal";
import CalculatorModal, { CalcModalType } from "@/components/CalculatorModal";
import { useCmsContent } from "@/hooks/useCmsContent";
import { SECTIONS_ORDER } from "@/config/sections.config";

const Pricing = lazy(() => import("@/components/Pricing"));
const QuickOrder = lazy(() => import("@/components/QuickOrder"));
const Projects = lazy(() => import("@/components/Projects"));
const About = lazy(() => import("@/components/About"));
const Contacts = lazy(() => import("@/components/Contacts"));
const Faq = lazy(() => import("@/components/Faq"));

function parseOrder(raw: string | undefined): string[] {
  if (!raw) return SECTIONS_ORDER;
  const parsed = raw.split(",").map(s => s.trim()).filter(s => SECTIONS_ORDER.includes(s));
  const missing = SECTIONS_ORDER.filter(s => !parsed.includes(s));
  return [...parsed, ...missing];
}

export default function Index() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSource, setModalSource] = useState("Не указан");
  const [calcModalOpen, setCalcModalOpen] = useState(false);
  const [calcModalType, setCalcModalType] = useState<CalcModalType>("it");
  const { content } = useCmsContent();

  const openModal = (source: string) => {
    setModalSource(source);
    setModalOpen(true);
  };

  const openCalcModal = (type: CalcModalType) => {
    setCalcModalType(type);
    setCalcModalOpen(true);
  };

  const handleCalcContact = (source: string, payload?: string) => {
    setCalcModalOpen(false);
    setModalSource(source);
    setModalOpen(true);
  };

  useEffect(() => {
    const homePage = content?.pages?.find(p => p.route === "/");
    if (homePage?.seo_title) document.title = homePage.seo_title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (homePage?.seo_description && metaDesc) metaDesc.setAttribute("content", homePage.seo_description);
    const metaOgTitle = document.querySelector('meta[property="og:title"]');
    if (homePage?.og_title && metaOgTitle) metaOgTitle.setAttribute("content", homePage.og_title);
    const metaOgDesc = document.querySelector('meta[property="og:description"]');
    if (homePage?.og_description && metaOgDesc) metaOgDesc.setAttribute("content", homePage.og_description);
  }, [content?.pages]);

  const s = content?.settings;
  const show = (id: string) => !s || s[`section_${id}_visible`] !== "false";
  const order = parseOrder(s?.section_order);

  const sectionMap: Record<string, JSX.Element | null> = {
    hero:       <Hero onContactClick={() => openModal("Главный экран (Hero)")} settings={s} />,
    services:   <Services onContactClick={() => openModal("Блок услуг")} onCalcClick={openCalcModal} services={content?.services} />,
    whyus:      <WhyUs settings={s} whyusCards={content?.whyus_cards} />,
    pricing:    <Suspense fallback={null}><Pricing onContactClick={() => openModal("Блок тарифов")} plans={content?.plans} /></Suspense>,
    quickorder: <Suspense fallback={null}><QuickOrder steps={content?.quickorder_steps} /></Suspense>,
    projects:   <Suspense fallback={null}><Projects projects={content?.projects} /></Suspense>,
    team:       <Suspense fallback={null}><About team={content?.team} /></Suspense>,
    contacts:   <Suspense fallback={null}><Contacts onContactClick={() => openModal("Блок контактов")} settings={s} /></Suspense>,
    faq:        <Suspense fallback={null}><Faq items={content?.faq} /></Suspense>,
  };

  return (
    <div className="min-h-screen bg-[#080c14]">
      {/* Слой для фоновых эффектов (data-bg-effect на body управляет стилями) */}
      <div className="bg-effect-layer" aria-hidden="true" />
      <Header onContactClick={() => openModal("Шапка сайта")} settings={s} services={content?.services} navItems={content?.nav_items} />

      {order.map(id => show(id) ? <div key={id}>{sectionMap[id]}</div> : null)}

      <Footer onContactClick={() => openModal("Подвал сайта")} settings={s} navItems={content?.nav_items} services={content?.services} />

      <Suspense fallback={null}>
        <ContactModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          source={modalSource}
        />
      </Suspense>

      <CalculatorModal
        open={calcModalOpen}
        type={calcModalType}
        onClose={() => setCalcModalOpen(false)}
        onContactClick={handleCalcContact}
        calcSettings={content?.calc_settings}
        calcOptions={content?.calc_options}
        calcSliders={content?.calc_sliders}
        videoCameras={content?.video_cameras}
        videoEquipment={content?.video_equipment}
        videoCalcSliders={content?.video_calc_sliders}
        settings={s}
      />

      {s?.design_float_btn_visible !== "false" && (
        <button
          onClick={() => openModal("Плавающая кнопка")}
          className="fixed bottom-6 right-6 z-40 btn-neon w-14 h-14 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/30 animate-glow"
          title="Получить консультацию"
        >
          <span className="text-xl">{s?.design_float_btn_emoji ?? "💬"}</span>
        </button>
      )}
    </div>
  );
}
import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Pricing from "@/components/Pricing";
import WhyUs from "@/components/WhyUs";
import QuickOrder from "@/components/QuickOrder";
import Projects from "@/components/Projects";
import About from "@/components/About";
import Contacts from "@/components/Contacts";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import ContactModal from "@/components/ContactModal";
import { useCmsContent } from "@/hooks/useCmsContent";
import { SECTIONS_ORDER } from "@/config/sections.config";

function parseOrder(raw: string | undefined): string[] {
  if (!raw) return SECTIONS_ORDER;
  const parsed = raw.split(",").map((s) => s.trim()).filter((s) => SECTIONS_ORDER.includes(s));
  const missing = SECTIONS_ORDER.filter((s) => !parsed.includes(s));
  return [...parsed, ...missing];
}

export default function Index() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSource, setModalSource] = useState("Не указан");
  const { content } = useCmsContent();

  const openModal = (source: string) => {
    setModalSource(source);
    setModalOpen(true);
  };

  const s = content?.settings;
  const show = (id: string) => !s || s[`section_${id}_visible`] !== "false";
  const order = parseOrder(s?.section_order);

  const sectionMap: Record<string, JSX.Element | null> = {
    hero:       <Hero onContactClick={() => openModal("Главный экран (Hero)")} settings={s} />,
    services:   <Services onContactClick={() => openModal("Блок услуг")} services={content?.services} />,
    whyus:      <WhyUs settings={s} />,
    pricing:    <Pricing onContactClick={() => openModal("Блок тарифов")} plans={content?.plans} />,
    quickorder: <QuickOrder />,
    projects:   <Projects projects={content?.projects} />,
    team:       <About team={content?.team} />,
    contacts:   <Contacts onContactClick={() => openModal("Блок контактов")} settings={s} />,
  };

  return (
    <div className="min-h-screen bg-[#080c14]">
      <Header onContactClick={() => openModal("Шапка сайта")} settings={s} />

      {order.map((id) => show(id) ? <div key={id}>{sectionMap[id]}</div> : null)}

      <Faq items={content?.faq} />

      <Footer onContactClick={() => openModal("Подвал сайта")} settings={s} />

      <ContactModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        source={modalSource}
      />

      <button
        onClick={() => openModal("Плавающая кнопка")}
        className="fixed bottom-6 right-6 z-40 btn-neon w-14 h-14 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/30 animate-glow"
        title="Получить консультацию"
      >
        <span className="text-xl">💬</span>
      </button>
    </div>
  );
}
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
import Footer from "@/components/Footer";
import ContactModal from "@/components/ContactModal";
import { useCmsContent } from "@/hooks/useCmsContent";

export default function Index() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSource, setModalSource] = useState("Не указан");
  const { content } = useCmsContent();

  const openModal = (source: string) => {
    setModalSource(source);
    setModalOpen(true);
  };

  const s = content?.settings;
  const show = (key: string) => !s || s[key] !== "false";

  return (
    <div className="min-h-screen bg-[#080c14]">
      <Header onContactClick={() => openModal("Шапка сайта")} settings={s} />
      {show("section_hero_visible")       && <Hero onContactClick={() => openModal("Главный экран (Hero)")} settings={s} />}
      {show("section_services_visible")   && <Services onContactClick={() => openModal("Блок услуг")} services={content?.services} />}
      {show("section_whyus_visible")      && <WhyUs settings={s} />}
      {show("section_pricing_visible")    && <Pricing onContactClick={() => openModal("Блок тарифов")} plans={content?.plans} />}
      {show("section_quickorder_visible") && <QuickOrder />}
      {show("section_projects_visible")   && <Projects projects={content?.projects} />}
      <div className="hidden"><About team={content?.team} /></div>
      {show("section_contacts_visible")   && <Contacts onContactClick={() => openModal("Блок контактов")} settings={s} />}
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
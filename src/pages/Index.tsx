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

export default function Index() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSource, setModalSource] = useState("Не указан");

  const openModal = (source: string) => {
    setModalSource(source);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#080c14]">
      <Header onContactClick={() => openModal("Шапка сайта")} />
      <Hero onContactClick={() => openModal("Главный экран (Hero)")} />
      <Services onContactClick={() => openModal("Блок услуг")} />
      <WhyUs />
      <Pricing onContactClick={() => openModal("Блок тарифов")} />
      <QuickOrder />
      <Projects />
      <About />
      <Contacts onContactClick={() => openModal("Блок контактов")} />
      <Footer onContactClick={() => openModal("Подвал сайта")} />
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

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactModal from "@/components/ContactModal";
import Icon from "@/components/ui/icon";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function ServicesIndex() {
  const { content } = useCmsContent();
  const [modalOpen, setModalOpen] = useState(false);
  const [source, setSource] = useState("");

  useEffect(() => {
    document.title = "Все услуги — ИТК Аплинк-IT";
    window.scrollTo(0, 0);
  }, []);

  const services = (content?.services || []).filter((s) => s.is_active && s.slug);

  const open = (s: string) => { setSource(s); setModalOpen(true); };

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      <Header
        onContactClick={() => open("Шапка сайта")}
        settings={content?.settings}
        services={content?.services}
      />

      <section className="pt-32 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="absolute top-20 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-blob pointer-events-none" />
        <div className="absolute -top-10 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-blob pointer-events-none" style={{ animationDelay: "5s" }} />

        <div className="container mx-auto px-4 relative">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 animate-fade-in">
            <Link to="/" className="hover:text-cyan-400 transition-colors">Главная</Link>
            <Icon name="ChevronRight" size={14} />
            <span className="text-gray-300">Услуги</span>
          </nav>
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
              <Icon name="LayoutGrid" size={14} />
              Каталог услуг
            </div>
            <h1 className="section-title text-white mb-4">
              Все <span className="gradient-text">IT-услуги</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Полный спектр IT-услуг для бизнеса в Саратове. От обслуживания компьютеров до проектирования корпоративных сетей.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-20 relative">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {services.map((s, i) => <ServiceCard key={s.id} s={s} i={i} />)}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => open("Каталог услуг")}
              className="btn-neon px-10 py-4 rounded-xl font-semibold inline-flex items-center gap-3 animate-glow"
            >
              <Icon name="PhoneCall" size={20} />
              Заказать IT-аудит бесплатно
            </button>
          </div>
        </div>
      </section>

      <Footer onContactClick={() => open("Подвал")} settings={content?.settings} />

      <ContactModal open={modalOpen} onClose={() => setModalOpen(false)} source={source} />
    </div>
  );
}

function ServiceCard({ s, i }: { s: { id: number; slug?: string | null; icon: string; title: string; accent: string; short_desc?: string | null; description: string; price_from?: string | null }; i: number }) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <Link
      ref={ref as unknown as React.Ref<HTMLAnchorElement>}
      to={`/services/${s.slug}`}
      className={`glass-card neon-border neon-hover rounded-2xl p-7 group flex flex-col transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      style={{ transitionDelay: isVisible ? "0ms" : `${i * 80}ms` }}
    >
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.accent || "from-cyan-400 to-blue-500"} flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
        <Icon name={s.icon as "Monitor"} size={26} className="text-[#080c14]" fallback="Settings" />
      </div>
      <h3 className="text-xl font-bold text-white font-['Oswald'] mb-2 group-hover:text-cyan-400 transition-colors">
        {s.title}
      </h3>
      <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-1">
        {s.short_desc || s.description}
      </p>
      {s.price_from && (
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-xs text-gray-500">Стоимость</span>
          <span className="text-cyan-400 font-bold text-lg font-['Oswald']">{s.price_from}</span>
        </div>
      )}
      <div className="inline-flex items-center gap-1.5 text-cyan-400 text-sm font-semibold">
        Подробнее
        <Icon name="ArrowRight" size={14} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}

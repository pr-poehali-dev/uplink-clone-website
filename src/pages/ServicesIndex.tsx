import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactModal from "@/components/ContactModal";
import Icon from "@/components/ui/icon";
import { useCmsContent } from "@/hooks/useCmsContent";

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

      <section className="pt-32 pb-12 relative">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="container mx-auto px-4 relative">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-cyan-400 transition-colors">Главная</Link>
            <Icon name="ChevronRight" size={14} />
            <span className="text-gray-300">Услуги</span>
          </nav>
          <div className="text-center mb-12">
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

      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {services.map((s) => (
              <Link
                key={s.id}
                to={`/services/${s.slug}`}
                className="glass-card neon-border neon-hover rounded-2xl p-6 group flex flex-col"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.accent || "from-cyan-400 to-blue-500"} flex items-center justify-center shadow-lg mb-4`}>
                  <Icon name={s.icon as "Monitor"} size={22} className="text-[#080c14]" fallback="Settings" />
                </div>
                <h3 className="text-xl font-bold text-white font-['Oswald'] mb-2 group-hover:text-cyan-400 transition-colors">
                  {s.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-1">
                  {s.short_desc || s.description}
                </p>
                {s.price_from && (
                  <div className="text-cyan-400 font-bold mb-3">{s.price_from}</div>
                )}
                <div className="inline-flex items-center gap-1.5 text-cyan-400 text-sm font-semibold">
                  Подробнее
                  <Icon name="ArrowRight" size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => open("Каталог услуг")}
              className="btn-neon px-10 py-4 rounded-xl font-semibold inline-flex items-center gap-3"
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

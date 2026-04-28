import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactModal from "@/components/ContactModal";
import Calculator from "@/components/Calculator";
import Icon from "@/components/ui/icon";
import { useCmsContent, CmsService } from "@/hooks/useCmsContent";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function ServicePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { content, loading } = useCmsContent();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSource, setModalSource] = useState("");
  const [prefillMessage, setPrefillMessage] = useState<string | undefined>();
  const [prefillService, setPrefillService] = useState<string | undefined>();

  const service: CmsService | undefined = useMemo(
    () => content?.services?.find((s) => s.slug === slug && s.is_active),
    [content, slug]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [slug]);

  useEffect(() => {
    if (service?.seo_title) {
      document.title = service.seo_title;
    }
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
        <div className="text-cyan-400">Загрузка...</div>
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
          <button onClick={() => navigate("/services")} className="btn-neon px-6 py-3 rounded-xl font-semibold">
            Все услуги
          </button>
        </div>
        <Footer onContactClick={() => openModal("Подвал")} settings={content?.settings} />
      </div>
    );
  }

  const benefits = service.benefits || [];
  const steps = service.steps || [];
  const sFaq = service.faq || [];
  const items = service.items || [];

  const otherServices = (content?.services || [])
    .filter((s) => s.is_active && s.slug && s.slug !== slug)
    .slice(0, 3);

  const isOutsourcing = slug === "it-outsourcing";

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      <Header onContactClick={() => openModal("Шапка сайта")} settings={content?.settings} services={content?.services} />

      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="container mx-auto px-4 relative">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link to="/" className="hover:text-cyan-400 transition-colors">Главная</Link>
            <Icon name="ChevronRight" size={14} />
            <Link to="/services" className="hover:text-cyan-400 transition-colors">Услуги</Link>
            <Icon name="ChevronRight" size={14} />
            <span className="text-gray-300 truncate">{service.title}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-5">
                <Icon name={service.icon as "Monitor"} size={14} fallback="Settings" />
                {service.title}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-['Oswald'] text-white mb-5 leading-tight">
                {service.hero_title || service.title}
              </h1>
              <p className="text-lg text-gray-400 mb-7 leading-relaxed">
                {service.hero_subtitle || service.short_desc || service.description}
              </p>
              {service.price_from && (
                <div className="inline-flex items-baseline gap-2 mb-7">
                  <span className="text-sm text-gray-500">Стоимость</span>
                  <span className="text-2xl font-bold gradient-text font-['Oswald']">{service.price_from}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <button onClick={() => openModal(`Услуга: ${service.title}`)} className="btn-neon px-7 py-3.5 rounded-xl font-semibold flex items-center gap-2">
                  <Icon name="PhoneCall" size={18} />
                  Получить консультацию
                </button>
                {isOutsourcing && (
                  <a href="#calculator" className="btn-outline-neon px-7 py-3.5 rounded-xl font-semibold flex items-center gap-2">
                    <Icon name="Calculator" size={18} />
                    Калькулятор
                  </a>
                )}
              </div>
            </div>

            <div className="glass-card neon-border rounded-2xl p-7">
              <h3 className="text-lg font-bold text-white font-['Oswald'] mb-5 flex items-center gap-2">
                <Icon name="ListChecks" size={18} className="text-cyan-400" />
                Что входит
              </h3>
              <ul className="space-y-3">
                {items.length > 0 ? items.map((it) => (
                  <li key={it.id} className="flex items-start gap-2.5 text-gray-300">
                    <Icon name="CheckCircle2" size={18} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">{it.item_text}</span>
                  </li>
                )) : (
                  <li className="text-gray-500 text-sm">Состав уточняется</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Описание */}
      {service.full_description && (
        <section className="py-16 relative">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h2 className="text-3xl font-bold font-['Oswald'] text-white mb-5">
                  Подробно об услуге
                </h2>
                <p className="text-gray-400 leading-relaxed text-lg whitespace-pre-line">
                  {service.full_description}
                </p>
              </div>
              {service.for_whom && (
                <div className="glass-card neon-border rounded-2xl p-6 self-start">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon name="Users" size={18} className="text-cyan-400" />
                    <h3 className="font-bold text-white font-['Oswald']">Для кого</h3>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{service.for_whom}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Преимущества */}
      {benefits.length > 0 && (
        <section className="py-16 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
                <Icon name="Sparkles" size={14} />
                Преимущества
              </div>
              <h2 className="section-title text-white">Почему выбирают <span className="gradient-text">нас</span></h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {benefits.map((b, i) => <BenefitCard key={b.id} b={b} i={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* Калькулятор для IT-аутсорсинга */}
      {isOutsourcing && (
        <Calculator
          calcSettings={content?.calc_settings}
          calcOptions={content?.calc_options}
          onContactClick={(src, payload) => openModal(src, payload)}
        />
      )}

      {/* Этапы работы */}
      {steps.length > 0 && (
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
          <div className="container mx-auto px-4 relative">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
                <Icon name="Workflow" size={14} />
                Как мы работаем
              </div>
              <h2 className="section-title text-white">Этапы <span className="gradient-text">сотрудничества</span></h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {steps.map((st, i) => (
                <div key={st.id} className="glass-card neon-border rounded-2xl p-6 relative">
                  <div className="absolute -top-3 -left-3 w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-[#080c14] shadow-lg shadow-cyan-500/30">
                    {i + 1}
                  </div>
                  <h3 className="text-lg font-bold text-white font-['Oswald'] mb-2 mt-2">{st.step_title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{st.step_description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ по услуге */}
      {sFaq.length > 0 && (
        <section className="py-16 relative">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
                <Icon name="HelpCircle" size={14} />
                Частые вопросы
              </div>
              <h2 className="section-title text-white">Вопросы и <span className="gradient-text">ответы</span></h2>
            </div>
            <div className="space-y-3">
              {sFaq.map((f) => <FaqRow key={f.id} f={f} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="glass-card neon-border rounded-3xl p-10 md:p-14 text-center max-w-4xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold font-['Oswald'] text-white mb-4">
                Готовы обсудить вашу задачу?
              </h2>
              <p className="text-gray-400 mb-7 text-lg">
                Бесплатный IT-аудит и расчёт стоимости в течение 24 часов
              </p>
              <button onClick={() => openModal(`Услуга CTA: ${service.title}`)} className="btn-neon px-10 py-4 rounded-xl font-semibold inline-flex items-center gap-3 animate-glow">
                <Icon name="Send" size={20} />
                Оставить заявку
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Другие услуги */}
      {otherServices.length > 0 && (
        <section className="py-16 relative">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold font-['Oswald'] text-white mb-8 text-center">
              Другие <span className="gradient-text">услуги</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {otherServices.map((s) => (
                <Link
                  key={s.id}
                  to={`/services/${s.slug}`}
                  className="glass-card neon-border neon-hover rounded-2xl p-5 group"
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.accent || "from-cyan-400 to-blue-500"} flex items-center justify-center mb-3`}>
                    <Icon name={s.icon as "Monitor"} size={20} className="text-[#080c14]" fallback="Settings" />
                  </div>
                  <h3 className="font-bold text-white font-['Oswald'] mb-1.5 group-hover:text-cyan-400 transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">
                    {s.short_desc || s.description}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1 text-cyan-400 text-sm font-medium">
                    Подробнее
                    <Icon name="ArrowRight" size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
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

function BenefitCard({ b, i }: { b: { id: number; icon: string; title: string; description: string | null }; i: number }) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`glass-card neon-border rounded-2xl p-5 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      style={{ transitionDelay: isVisible ? "0ms" : `${i * 60}ms` }}
    >
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-3 shadow-lg shadow-cyan-500/20">
        <Icon name={b.icon as "Check"} size={20} className="text-[#080c14]" fallback="Check" />
      </div>
      <h3 className="font-bold text-white font-['Oswald'] mb-1.5">{b.title}</h3>
      {b.description && <p className="text-sm text-gray-400 leading-relaxed">{b.description}</p>}
    </div>
  );
}

function FaqRow({ f }: { f: { question: string; answer: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`glass-card rounded-2xl border transition-all ${open ? "border-cyan-500/40" : "border-cyan-500/15"}`}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
      >
        <span className="font-semibold text-white">{f.question}</span>
        <Icon name="ChevronDown" size={18} className={`text-cyan-400 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 text-gray-400 leading-relaxed text-sm">
          {f.answer}
        </div>
      )}
    </div>
  );
}

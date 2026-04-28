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
    window.scrollTo({ top: 0, behavior: "auto" });
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

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      <Header onContactClick={() => openModal("Шапка сайта")} settings={content?.settings} services={content?.services} />

      {/* HERO */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Декоративные блобы */}
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="absolute top-20 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-blob pointer-events-none" />
        <div className="absolute -top-10 -right-40 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-blob pointer-events-none" style={{ animationDelay: "4s" }} />

        <div className="container mx-auto px-4 relative">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 animate-fade-in">
            <Link to="/" className="hover:text-cyan-400 transition-colors">Главная</Link>
            <Icon name="ChevronRight" size={14} />
            <button
              onClick={() => { navigate("/"); setTimeout(() => { document.getElementById("services")?.scrollIntoView({ behavior: "smooth" }); }, 80); }}
              className="hover:text-cyan-400 transition-colors"
            >
              Услуги
            </button>
            <Icon name="ChevronRight" size={14} />
            <span className="text-gray-300 truncate">{service.title}</span>
          </nav>

          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-5">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${service.accent || "from-cyan-400 to-blue-500"} flex items-center justify-center -ml-1`}>
                  <Icon name={service.icon as "Monitor"} size={14} className="text-[#080c14]" fallback="Settings" />
                </div>
                {service.title}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-['Oswald'] text-white mb-6 leading-[1.1]">
                {service.hero_title || service.title}
              </h1>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                {service.hero_subtitle || service.short_desc || service.description}
              </p>

              {/* Бейджи преимуществ */}
              <div className="flex flex-wrap gap-2 mb-8">
                <Badge icon="Zap" text="От 15 мин" />
                <Badge icon="ShieldCheck" text="Договор и SLA" />
                <Badge icon="Award" text="Гарантия" />
              </div>

              {service.price_from && (
                <div className="inline-flex items-baseline gap-3 mb-8 px-5 py-3 rounded-2xl glass-card neon-border">
                  <span className="text-sm text-gray-400">Стоимость</span>
                  <span className="text-2xl font-bold gradient-text font-['Oswald']">{service.price_from}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => openModal(`Услуга: ${service.title}`)}
                  className="btn-neon px-7 py-3.5 rounded-xl font-semibold flex items-center gap-2"
                >
                  <Icon name="PhoneCall" size={18} />
                  Получить консультацию
                </button>
                {isOutsourcing && (
                  <a
                    href="#calculator"
                    className="btn-outline-neon px-7 py-3.5 rounded-xl font-semibold flex items-center gap-2"
                  >
                    <Icon name="Calculator" size={18} />
                    Калькулятор
                  </a>
                )}
              </div>
            </div>

            {/* Карточка "Что входит" */}
            <div className="animate-fade-in-up delay-200">
              <div className="glass-card neon-border rounded-3xl p-7 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                      <Icon name="ListChecks" size={18} className="text-[#080c14]" />
                    </div>
                    <h3 className="text-xl font-bold text-white font-['Oswald']">Что входит</h3>
                  </div>
                  {items.length > 0 ? (
                    <ul className="space-y-3">
                      {items.map((it, i) => (
                        <li
                          key={it.id}
                          className="flex items-start gap-2.5 text-gray-300 animate-fade-in-up"
                          style={{ animationDelay: `${i * 80 + 300}ms` }}
                        >
                          <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Icon name="Check" size={12} className="text-cyan-400" />
                          </div>
                          <span className="text-sm leading-relaxed">{it.item_text}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">Состав уточняется</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Подробное описание */}
      {service.full_description && (
        <section className="py-20 relative">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid lg:grid-cols-3 gap-8">
              <AnimateOnScroll className="lg:col-span-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-5">
                  <Icon name="BookOpen" size={14} />
                  Подробно
                </div>
                <h2 className="text-3xl md:text-4xl font-bold font-['Oswald'] text-white mb-6">
                  Об услуге <span className="gradient-text">детально</span>
                </h2>
                <div className="text-gray-400 leading-relaxed text-base whitespace-pre-line">
                  {service.full_description}
                </div>
              </AnimateOnScroll>

              {service.for_whom && (
                <AnimateOnScroll className="self-start">
                  <div className="glass-card neon-border rounded-3xl p-6 sticky top-24">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                        <Icon name="Users" size={18} className="text-[#080c14]" />
                      </div>
                      <h3 className="font-bold text-white font-['Oswald'] text-lg">Для кого</h3>
                    </div>
                    <p className="text-gray-400 leading-relaxed text-sm">{service.for_whom}</p>

                    <div className="mt-5 pt-5 border-t border-cyan-500/15">
                      <button
                        onClick={() => openModal(`Услуга sidebar: ${service.title}`)}
                        className="w-full btn-neon py-3 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm"
                      >
                        <Icon name="Send" size={16} />
                        Обсудить задачу
                      </button>
                    </div>
                  </div>
                </AnimateOnScroll>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Преимущества */}
      {benefits.length > 0 && (
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
          <div className="container mx-auto px-4 relative">
            <AnimateOnScroll className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
                <Icon name="Sparkles" size={14} />
                Преимущества
              </div>
              <h2 className="section-title text-white mb-4">Почему выбирают <span className="gradient-text">нас</span></h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Мы знаем, как сделать IT-инфраструктуру надёжной и предсказуемой
              </p>
            </AnimateOnScroll>
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
        <section className="py-20 relative overflow-hidden faq-bg">
          <div className="container mx-auto px-4 relative">
            <AnimateOnScroll className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
                <Icon name="Workflow" size={14} />
                Как мы работаем
              </div>
              <h2 className="section-title text-white mb-4">Этапы <span className="gradient-text">сотрудничества</span></h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Прозрачный процесс от первой встречи до запуска обслуживания
              </p>
            </AnimateOnScroll>

            <div className="relative max-w-5xl mx-auto">
              {/* Горизонтальная линия только на десктопе */}
              <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {steps.map((st, i) => <StepCard key={st.id} step={st} index={i} />)}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ по услуге */}
      {sFaq.length > 0 && (
        <section className="py-20 relative">
          <div className="container mx-auto px-4 max-w-3xl">
            <AnimateOnScroll className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
                <Icon name="HelpCircle" size={14} />
                Частые вопросы
              </div>
              <h2 className="section-title text-white mb-4">Вопросы и <span className="gradient-text">ответы</span></h2>
            </AnimateOnScroll>
            <div className="space-y-3">
              {sFaq.map((f, i) => <FaqRow key={f.id} f={f} i={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <AnimateOnScroll>
            <div className="glass-card neon-border rounded-3xl p-10 md:p-16 text-center max-w-5xl mx-auto relative overflow-hidden">
              <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
              <div className="absolute -top-32 -left-32 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-blob pointer-events-none" />
              <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-blob pointer-events-none" style={{ animationDelay: "3s" }} />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 mb-6 shadow-lg shadow-cyan-500/30">
                  <Icon name="Send" size={28} className="text-[#080c14]" />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold font-['Oswald'] text-white mb-4">
                  Готовы обсудить <span className="gradient-text">вашу задачу?</span>
                </h2>
                <p className="text-gray-400 mb-8 text-lg max-w-2xl mx-auto">
                  Бесплатный IT-аудит и расчёт стоимости в течение 24 часов. Без обязательств.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => openModal(`CTA услуги: ${service.title}`)}
                    className="btn-neon px-10 py-4 rounded-xl font-semibold inline-flex items-center gap-3 animate-glow"
                  >
                    <Icon name="Send" size={20} />
                    Оставить заявку
                  </button>
                  <a
                    href={content?.settings?.phone_href || "tel:+79869860136"}
                    className="btn-outline-neon px-10 py-4 rounded-xl font-semibold inline-flex items-center gap-3"
                  >
                    <Icon name="Phone" size={20} />
                    {content?.settings?.phone || "Позвонить"}
                  </a>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Другие услуги */}
      {otherServices.length > 0 && (
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <AnimateOnScroll className="text-center mb-10">
              <h2 className="text-3xl font-bold font-['Oswald'] text-white">
                Другие <span className="gradient-text">услуги</span>
              </h2>
            </AnimateOnScroll>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {otherServices.map((s, i) => (
                <AnimateOnScroll key={s.id} delay={i * 100}>
                  <Link
                    to={`/services/${s.slug}`}
                    className="block glass-card neon-border neon-hover rounded-2xl p-6 group h-full"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.accent || "from-cyan-400 to-blue-500"} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon name={s.icon as "Monitor"} size={20} className="text-[#080c14]" fallback="Settings" />
                    </div>
                    <h3 className="font-bold text-white font-['Oswald'] mb-2 text-lg group-hover:text-cyan-400 transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 mb-4">
                      {s.short_desc || s.description}
                    </p>
                    <div className="inline-flex items-center gap-1.5 text-cyan-400 text-sm font-semibold">
                      Подробнее
                      <Icon name="ArrowRight" size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </AnimateOnScroll>
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

function Badge({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-medium">
      <Icon name={icon as "Zap"} size={12} className="text-cyan-400" fallback="Check" />
      {text}
    </div>
  );
}

function BenefitCard({ b, i }: { b: { id: number; icon: string; title: string; description: string | null }; i: number }) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`glass-card neon-border neon-hover rounded-2xl p-6 transition-all duration-700 group ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: isVisible ? "0ms" : `${i * 80}ms` }}
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
        <Icon name={b.icon as "Check"} size={24} className="text-[#080c14]" fallback="Check" />
      </div>
      <h3 className="font-bold text-white font-['Oswald'] mb-2 text-lg">{b.title}</h3>
      {b.description && <p className="text-sm text-gray-400 leading-relaxed">{b.description}</p>}
    </div>
  );
}

function StepCard({ step, index }: { step: { id: number; step_title: string; step_description: string | null }; index: number }) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`relative transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      style={{ transitionDelay: isVisible ? "0ms" : `${index * 120}ms` }}
    >
      <div className="glass-card neon-border rounded-2xl p-6 pt-12 h-full hover:border-cyan-500/40 transition-colors duration-300">
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 lg:left-6 lg:translate-x-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-2xl text-[#080c14] shadow-lg shadow-cyan-500/40 font-['Oswald'] z-10">
          {index + 1}
        </div>
        <h3 className="text-lg font-bold text-white font-['Oswald'] mb-2 mt-2 text-center lg:text-left">
          {step.step_title}
        </h3>
        <p className="text-sm text-gray-400 leading-relaxed text-center lg:text-left">
          {step.step_description}
        </p>
      </div>
    </div>
  );
}

function FaqRow({ f, i }: { f: { question: string; answer: string }; i: number }) {
  const [open, setOpen] = useState(false);
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`glass-card rounded-2xl border transition-all duration-500 overflow-hidden ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${open ? "border-cyan-500/40" : "border-cyan-500/15 hover:border-cyan-500/30"}`}
      style={{ transitionDelay: isVisible ? "0ms" : `${i * 60}ms` }}
    >
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left group"
      >
        <span className={`font-semibold transition-colors ${open ? "text-cyan-400" : "text-white group-hover:text-cyan-400"}`}>
          {f.question}
        </span>
        <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
          open ? "bg-cyan-500 rotate-45" : "bg-cyan-500/10 border border-cyan-500/20"
        }`}>
          <Icon name="Plus" size={15} className={open ? "text-[#080c14]" : "text-cyan-400"} />
        </div>
      </button>
      <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pt-0 text-gray-400 leading-relaxed text-sm border-t border-white/5">
            <p className="pt-4">{f.answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnimateOnScroll({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: isVisible ? "0ms" : `${delay}ms` }}
    >
      {children}
    </div>
  );
}
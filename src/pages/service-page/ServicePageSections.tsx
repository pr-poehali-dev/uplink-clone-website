import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { CmsService } from "@/hooks/useCmsContent";
import { AnimateOnScroll, BenefitCard, StepCard, FaqRow } from "./ServicePageWidgets";

interface ServicePageSectionsProps {
  service: CmsService;
  benefits: CmsService["benefits"];
  steps: CmsService["steps"];
  sFaq: CmsService["faq"];
  otherServices: CmsService[];
  settings: Record<string, string> | undefined;
  onContactClick: (source: string) => void;
}

export default function ServicePageSections({
  service,
  benefits,
  steps,
  sFaq,
  otherServices,
  settings,
  onContactClick,
}: ServicePageSectionsProps) {
  return (
    <>
      {/* Подробное описание */}
      {service.full_description && (
        <section className="py-12 relative">
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
                        onClick={() => onContactClick(`Услуга sidebar: ${service.title}`)}
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
      {benefits && benefits.length > 0 && (
        <section className="py-12 relative overflow-hidden">
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

      {/* Этапы работы */}
      {steps && steps.length > 0 && (
        <section className="py-12 relative overflow-hidden faq-bg">
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
      {sFaq && sFaq.length > 0 && (
        <section className="py-12 relative">
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
      <section className="py-12 relative">
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
                    onClick={() => onContactClick(`CTA услуги: ${service.title}`)}
                    className="btn-neon px-10 py-4 rounded-xl font-semibold inline-flex items-center gap-3 animate-glow"
                  >
                    <Icon name="Send" size={20} />
                    Оставить заявку
                  </button>
                  <a
                    href={settings?.phone_href || "tel:+79869860136"}
                    className="btn-outline-neon px-10 py-4 rounded-xl font-semibold inline-flex items-center gap-3"
                  >
                    <Icon name="Phone" size={20} />
                    {settings?.phone || "Позвонить"}
                  </a>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Другие услуги */}
      {otherServices.length > 0 && (
        <section className="py-12 relative">
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
    </>
  );
}

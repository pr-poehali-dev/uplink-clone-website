import { Link, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { CmsService } from "@/hooks/useCmsContent";
import { Badge } from "./ServicePageWidgets";

interface ServicePageHeroProps {
  service: CmsService;
  items: CmsService["items"];
  isOutsourcing: boolean;
  isVideoSurveillance: boolean;
  onContactClick: () => void;
}

export default function ServicePageHero({
  service,
  items,
  isOutsourcing,
  isVideoSurveillance,
  onContactClick,
}: ServicePageHeroProps) {
  const navigate = useNavigate();

  return (
    <section data-section="svc_hero" className="pt-32 pb-20 relative overflow-hidden">
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
              <div className="inline-flex items-baseline gap-3 mb-8 px-5 py-3 rounded-2xl glass-card hover-card neon-border">
                <span className="text-sm text-gray-400">Стоимость</span>
                <span className="text-2xl font-bold gradient-text font-['Oswald']">{service.price_from}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                onClick={onContactClick}
                className="btn-neon hover-btn px-7 py-3.5 rounded-xl font-semibold flex items-center gap-2"
              >
                <Icon name="PhoneCall" size={18} />
                Получить консультацию
              </button>
              {(isOutsourcing || isVideoSurveillance) && (
                <a
                  href={isVideoSurveillance ? "#video-calculator" : "#calculator"}
                  className="btn-outline-neon hover-btn px-7 py-3.5 rounded-xl font-semibold flex items-center gap-2"
                >
                  <Icon name="Calculator" size={18} />
                  Калькулятор
                </a>
              )}
            </div>
          </div>

          {/* Карточка "Что входит" */}
          <div className="animate-fade-in-up delay-200">
            <div className="glass-card hover-card neon-border rounded-3xl p-7 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                    <Icon name="ListChecks" size={18} className="text-[#080c14]" />
                  </div>
                  <h3 className="text-xl font-bold text-white font-['Oswald']">Что входит</h3>
                </div>
                {items && items.length > 0 ? (
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
  );
}
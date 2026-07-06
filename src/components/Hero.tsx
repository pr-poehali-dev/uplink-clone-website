import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

import { CmsSettings } from "@/hooks/useCmsContent";

interface HeroProps {
  onContactClick: () => void;
  settings?: CmsSettings;
}

export default function Hero({ onContactClick, settings }: HeroProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const badge = settings?.hero_badge ?? "IT-аутсорсинг для бизнеса в Саратове";
  const title1 = settings?.hero_title_1 ?? "ИТК Аплинк-IT";
  const title2 = settings?.hero_title_2 ?? "Надёжный IT-партнёр";
  const description =
    settings?.hero_description ??
    "Обслуживание компьютеров и серверов, монтаж ЛВС/СКС, видеонаблюдение под ключ и IP-телефония для малого и среднего бизнеса в Саратове.";
  const stats = [
    { value: settings?.hero_stat_1_value ?? "10+", label: settings?.hero_stat_1_label ?? "лет опыта" },
    { value: settings?.hero_stat_2_value ?? "15+", label: settings?.hero_stat_2_label ?? "клиентов" },
    { value: settings?.hero_stat_3_value ?? "24/7", label: settings?.hero_stat_3_label ?? "поддержка" },
  ];

  // Пункты-достоинства справа (в духе строгого B2B-референса)
  const features = [
    { icon: "ShieldCheck", text: "Гарантия и SLA на все работы" },
    { icon: "Zap", text: "Реакция на инцидент — от 15 минут" },
    { icon: "Users", text: "Выделенный инженер под ваш бизнес" },
    { icon: "Award", text: "Сертифицированные специалисты" },
  ];

  const cls = (delay: string) =>
    `transition-all duration-[900ms] ${delay} ${
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
    }`;

  return (
    <section
      id="home"
      data-section="home"
      className="hero-corp relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Фон: строгая техно-сетка + мягкие световые пятна */}
      <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[38rem] h-[38rem] bg-cyan-500/[0.07] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[34rem] h-[34rem] bg-blue-600/[0.06] rounded-full blur-[120px]" />
      </div>
      {/* Тонкая верхняя и нижняя линии-акценты */}
      <div className="absolute top-20 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

      <div className="container mx-auto px-4 pt-28 pb-16 relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Левая колонка — контент */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <div className={cls("delay-0")}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/25 bg-cyan-500/[0.06] text-cyan-400 text-xs sm:text-sm font-medium mb-7 tracking-wide uppercase">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                {badge}
              </div>
            </div>

            <div className={cls("delay-100")}>
              <h1 className="font-['Oswald'] font-bold leading-[1.05] tracking-tight text-white mb-6 text-4xl sm:text-5xl lg:text-6xl">
                <span className="gradient-text">{title1}</span>
                <br />
                <span className="text-gray-200">{title2}</span>
              </h1>
            </div>

            <div className={cls("delay-200")}>
              <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 mb-9 leading-relaxed">
                {description}
              </p>
            </div>

            <div className={`flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12 ${cls("delay-300")}`}>
              <button
                onClick={onContactClick}
                data-elem-id="btn-hero-cta"
                data-elem-type="btn"
                className="btn-neon hover-btn px-7 py-3.5 rounded-lg text-[15px] font-semibold flex items-center gap-2 justify-center"
              >
                <Icon name="PhoneCall" size={19} />
                Получить консультацию
              </button>
              <button
                onClick={() =>
                  document.querySelector("#services")?.scrollIntoView({ behavior: "smooth" })
                }
                data-elem-id="btn-hero-services"
                data-elem-type="btn"
                className="btn-outline-neon hover-btn px-7 py-3.5 rounded-lg text-[15px] font-semibold flex items-center gap-2 justify-center"
              >
                Наши услуги
                <Icon name="ArrowRight" size={19} />
              </button>
            </div>

            {/* Статистика — строгая линия с разделителями */}
            <div className={`flex flex-wrap justify-center lg:justify-start items-center gap-6 sm:gap-10 ${cls("delay-[400ms]")}`}>
              {stats.map((s, idx) => (
                <div key={s.value} className="flex items-center gap-6 sm:gap-10">
                  {idx > 0 && <span className="hidden sm:block w-px h-10 bg-white/10" />}
                  <div
                    data-elem-id={`card-hero-stat-${idx + 1}`}
                    data-elem-type="card"
                    className="text-center lg:text-left"
                  >
                    <div className="text-3xl sm:text-4xl font-bold gradient-text font-['Oswald'] leading-none mb-1">
                      {s.value}
                    </div>
                    <div className="text-gray-500 text-sm">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Правая колонка — «панель» преимуществ в техно-стиле */}
          <div className="lg:col-span-5">
            <div className={cls("delay-[300ms]")}>
              <div className="relative">
                {/* Декоративный каркас за карточкой */}
                <div className="absolute -inset-3 rounded-3xl border border-cyan-500/10 pointer-events-none" />
                <div className="absolute -top-3 -right-3 w-16 h-16 border-t border-r border-cyan-500/30 rounded-tr-3xl pointer-events-none" />
                <div className="absolute -bottom-3 -left-3 w-16 h-16 border-b border-l border-cyan-500/30 rounded-bl-3xl pointer-events-none" />

                <div className="glass-card neon-border rounded-2xl p-6 sm:p-7">
                  <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/[0.06]">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 flex-shrink-0">
                      <Icon name="ServerCog" size={22} className="text-[#080c14]" fallback="Settings" />
                    </div>
                    <div>
                      <div className="text-white font-semibold font-['Oswald'] text-lg leading-tight">
                        Почему выбирают нас
                      </div>
                      <div className="text-gray-500 text-xs">Работаем по договору и SLA</div>
                    </div>
                  </div>

                  <ul className="space-y-4">
                    {features.map((f, i) => (
                      <li
                        key={f.text}
                        className="flex items-center gap-3 group"
                        style={{ animation: visible ? `fadeInUp 0.6s ${500 + i * 100}ms both` : "none" }}
                      >
                        <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-500/20 transition-colors">
                          <Icon name={f.icon as "ShieldCheck"} size={17} className="text-cyan-400" fallback="Check" />
                        </div>
                        <span className="text-gray-300 text-sm sm:text-[15px]">{f.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Индикатор скролла */}
      <div
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-2 hidden sm:flex transition-opacity duration-1000 ${
          visible ? "opacity-60" : "opacity-0"
        }`}
      >
        <span className="text-gray-500 text-[11px] uppercase tracking-widest">Листайте вниз</span>
        <Icon name="ChevronDown" size={18} className="text-cyan-400 animate-bounce" />
      </div>
    </section>
  );
}

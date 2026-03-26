import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

interface HeroProps {
  onContactClick: () => void;
}

const stats = [
  { value: "10+", label: "лет опыта" },
  { value: "15+", label: "клиентов" },
  { value: "24/7", label: "поддержка" },
];

export default function Hero({ onContactClick }: HeroProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center grid-bg overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse-slow" />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-400/4 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "1.5s" }}
        />
        <div className="absolute top-10 right-10 w-2 h-2 bg-cyan-400 rounded-full opacity-60 animate-float" />
        <div
          className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-cyan-300 rounded-full opacity-40 animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-1/3 left-1/5 w-1 h-1 bg-cyan-400 rounded-full opacity-50 animate-float"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-8">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              Комплексные IT-решения для бизнеса
            </div>
          </div>

          <div
            className={`transition-all duration-700 delay-100 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <h1 className="section-title text-white mb-6">
              ИТК <span className="gradient-text">Аплинк-IT</span>
              <br />
              <span className="text-gray-300">Надёжный IT-партнёр</span>
              <br />
              для вашего бизнеса
            </h1>
          </div>

          <div
            className={`transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Аутсорсинг IT-инфраструктуры, администрирование серверов, монтаж
              сетей и видеонаблюдения. Работаем быстро, профессионально, с
              гарантией.
            </p>
          </div>

          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center mb-16 transition-all duration-700 delay-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <button
              onClick={onContactClick}
              className="btn-neon px-8 py-4 rounded-xl text-base font-semibold flex items-center gap-2 justify-center"
            >
              <Icon name="PhoneCall" size={20} />
              Получить бесплатную консультацию
            </button>
            <button
              onClick={() =>
                document
                  .querySelector("#services")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="btn-outline-neon px-8 py-4 rounded-xl text-base font-semibold flex items-center gap-2 justify-center"
            >
              Наши услуги
              <Icon name="ArrowDown" size={20} />
            </button>
          </div>

          <div
            className={`flex flex-wrap justify-center gap-6 transition-all duration-700 delay-400 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            {stats.map((s) => (
              <div
                key={s.value}
                className="glass-card rounded-xl p-5 neon-border neon-hover"
              >
                <div className="text-3xl font-bold gradient-text font-['Oswald'] mb-1">
                  {s.value}
                </div>
                <div className="text-gray-400 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
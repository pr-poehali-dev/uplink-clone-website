import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import Icon from "@/components/ui/icon";

interface ServicesProps {
  onContactClick: () => void;
}

const services = [
  {
    icon: "Monitor",
    title: "IT-аутсорсинг",
    desc: "Полное обслуживание IT-инфраструктуры вашей компании. Берём на себя все IT-задачи, чтобы вы могли сосредоточиться на бизнесе.",
    items: [
      "Техническая поддержка пользователей",
      "Обслуживание компьютеров и оргтехники",
      "Настройка и сопровождение ПО",
      "Консультации и помощь по IT",
      "Планирование IT-бюджета",
    ],
    accent: "from-cyan-400 to-blue-500",
  },
  {
    icon: "Server",
    title: "Администрирование серверов",
    desc: "Профессиональное управление серверами Windows и Linux. Обеспечиваем стабильность, безопасность и производительность.",
    items: [
      "Настройка и конфигурирование серверов",
      "Мониторинг производительности",
      "Резервное копирование данных",
      "Обновление и патчинг систем",
      "Устранение неисправностей 24/7",
    ],
    accent: "from-purple-400 to-cyan-400",
  },
  {
    icon: "Network",
    title: "Поддержка IT-инфраструктуры",
    desc: "Проектирование и сопровождение корпоративных сетей. Надёжная и безопасная инфраструктура для вашего офиса.",
    items: [
      "Проектирование сетевой инфраструктуры",
      "Настройка сетевого оборудования",
      "Обеспечение информационной безопасности",
      "Техподдержка и мониторинг",
      "Оптимизация сетевых процессов",
    ],
    accent: "from-green-400 to-cyan-400",
  },
  {
    icon: "Camera",
    title: "Видеонаблюдение",
    desc: "Проектирование и монтаж систем видеонаблюдения под ключ. Удалённый доступ и надёжная запись видеоархива.",
    items: [
      "Аудит и проектирование СВН",
      "Монтаж IP и аналоговых камер",
      "Настройка удалённого доступа",
      "Хранение видеоархива",
      "Гарантийное обслуживание",
    ],
    accent: "from-orange-400 to-cyan-400",
  },
  {
    icon: "Cable",
    title: "Монтаж ЛВС / СКС",
    desc: "Прокладка структурированных кабельных систем и локальных сетей. Качественный монтаж с соблюдением стандартов.",
    items: [
      "Проектирование схемы ЛВС",
      "Прокладка кабельных трасс",
      "Монтаж коммутационного оборудования",
      "Настройка сетевых устройств",
      "Тестирование и сертификация",
    ],
    accent: "from-blue-400 to-purple-500",
  },
  {
    icon: "IP-tel",
    title: "IP-телефония",
    desc: "Установка, настройка и администрирование цифровой связи",
    items: [
      "Установка и конфигурация IP-АТС и ВАТС",
      "Подключение и настройка IP-телефонов",
      "Интеграция с CRM",
      "Администрирование и безопасность",
      "Обучение сотрудников",
    ],
    accent: "from-red-400 to-orange-400",
  },
];

function ServiceCard({ s, index }: { s: (typeof services)[0]; index: number }) {
  const { ref, isVisible, animationStyle } = useScrollAnimation(0.1, index * 100);
  return (
    <div
      ref={ref}
      className={`glass-card neon-border rounded-2xl p-6 flex flex-col gap-4 transition-[opacity,transform] duration-[800ms] ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
      }`}
      style={animationStyle}
    >
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.accent} flex items-center justify-center shadow-lg`}
      >
        <Icon name={s.icon as "Monitor"} size={24} className="text-[#080c14]" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-white font-['Oswald'] mb-2">
          {s.title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
      </div>
      <ul className="space-y-1.5">
        {s.items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-sm text-gray-300"
          >
            <Icon
              name="ChevronRight"
              size={14}
              className="text-cyan-400 mt-0.5 flex-shrink-0"
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Services({ onContactClick }: ServicesProps) {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();

  return (
    <section id="services" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="container mx-auto px-4">
        <div
          ref={titleRef}
          className={`text-center mb-16 transition-all duration-[800ms] ${titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
            <Icon name="Settings" size={14} />
            Наши услуги
          </div>
          <h2 className="section-title text-white mb-4">
            Комплексные <span className="gradient-text">IT-решения</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Предоставляем полный спектр IT-услуг для малого и среднего бизнеса.
            Берём на себя всю техническую нагрузку — вы занимаетесь развитием.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((s, i) => (
            <ServiceCard key={s.title} s={s} index={i} />
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={onContactClick}
            className="btn-neon px-10 py-4 rounded-xl text-base font-semibold flex items-center gap-3 animate-glow"
          >
            <Icon name="PhoneCall" size={20} />
            Заказать IT-аудит бесплатно
          </button>
        </div>
      </div>
    </section>
  );
}
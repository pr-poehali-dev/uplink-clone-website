import { Link } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
// Link оставлен для карточек услуг с переходом на страницу
import Icon from "@/components/ui/icon";
import { CmsService } from "@/hooks/useCmsContent";

interface ServicesProps {
  onContactClick: () => void;
  services?: CmsService[];
}

const services = [
  {
    icon: "Monitor",
    title: "IT-аутсорсинг",
    desc: "IT-аутсорсинг в Саратове — полное обслуживание IT-инфраструктуры компании. Системный администратор на аутсорсе дешевле штатного сотрудника до 40%.",
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
    desc: "Администрирование серверов Windows Server и Linux в Саратове. Настройка, мониторинг, резервное копирование — стабильная работа 24/7.",
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
    desc: "Проектирование и сопровождение корпоративных сетей в Саратове. Настройка Mikrotik, Cisco, D-Link. Информационная безопасность и мониторинг.",
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
    desc: "Монтаж видеонаблюдения под ключ в Саратове. Установка IP и аналоговых камер, настройка удалённого просмотра, хранение архива.",
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
    desc: "Монтаж ЛВС и СКС в Саратове. Прокладка кабеля, установка коммутаторов, тестирование и сертификация линий по стандартам.",
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
    desc: "IP-телефония для бизнеса в Саратове. Настройка IP-АТС и ВАТС, интеграция с CRM, подключение IP-телефонов. Корпоративная связь без лишних затрат.",
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

function ServiceCard({ s, index }: { s: { icon: string; title: string; description: string; accent: string; items: { item_text: string }[]; slug?: string | null }; index: number }) {
  const { ref, isVisible } = useScrollAnimation();
  const hasPage = !!s.slug;
  return (
    <div
      ref={ref}
      className={`glass-card neon-border neon-hover rounded-2xl p-6 flex flex-col gap-4 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{ transitionDelay: isVisible ? '0ms' : `${index * 80}ms` }}
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
        <p className="text-gray-400 text-sm leading-relaxed">{s.description}</p>
      </div>
      <ul className="space-y-1.5 flex-1">
        {s.items.slice(0, 5).map((item) => (
          <li
            key={item.item_text}
            className="flex items-start gap-2 text-sm text-gray-300"
          >
            <Icon
              name="ChevronRight"
              size={14}
              className="text-cyan-400 mt-0.5 flex-shrink-0"
            />
            {item.item_text}
          </li>
        ))}
      </ul>
      {hasPage && (
        <Link
          to={`/services/${s.slug}`}
          className="inline-flex items-center gap-1.5 text-cyan-400 text-sm font-semibold hover:gap-2 transition-all mt-1 group"
        >
          Подробнее об услуге
          <Icon name="ArrowRight" size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
}

const defaultServices = services.map(s => ({ ...s, description: s.desc, items: s.items.map(i => ({ item_text: i })) }));

export default function Services({ onContactClick, services: cmsServices }: ServicesProps) {
  const displayServices = (cmsServices && cmsServices.length > 0)
    ? cmsServices.filter(s => s.is_active)
    : defaultServices;
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();

  return (
    <section id="services" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="container mx-auto px-4">
        <div
          ref={titleRef}
          className={`text-center mb-16 transition-[opacity,transform] duration-700 ${titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
            <Icon name="Settings" size={14} />
            Наши услуги
          </div>
          <h2 className="section-title text-white mb-4">
            Комплексные <span className="gradient-text">IT-решения</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Предоставляем полный спектр IT-услуг для малого и среднего бизнеса в Саратове.
            IT-аутсорсинг, вызов системного администратора, монтаж сетей и видеонаблюдения —
            берём на себя всю техническую нагрузку, вы занимаетесь бизнесом.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {displayServices.map((s, i) => (
            <ServiceCard key={s.title} s={s} index={i} />
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
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
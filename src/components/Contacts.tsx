import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import Icon from "@/components/ui/icon";
import { CmsSettings } from "@/hooks/useCmsContent";

interface ContactsProps {
  onContactClick: () => void;
  settings?: CmsSettings;
}

const contactItems = [
  {
    icon: "Phone",
    title: "Телефон",
    lines: ["8 (986) 986-01-36"],
    link: "tel:+79869860136",
    accent: "from-cyan-400 to-blue-500",
  },
  {
    icon: "Mail",
    title: "Email",
    lines: ["support@uplink-it.ru", "Отвечаем в течение часа"],
    link: "mailto:info@uplink-it.ru",
    accent: "from-purple-400 to-cyan-400",
  },
  {
    icon: "MapPin",
    title: "Адрес",
    lines: ["Саратов, Россия", "Выезд по всему Саратову и СО"],
    link: null,
    accent: "from-green-400 to-cyan-400",
  },
];

function ContactCard({
  item,
  index,
}: {
  item: (typeof contactItems)[0];
  index: number;
}) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`glass-card neon-border neon-hover neon-scale-sm rounded-2xl p-7 text-center ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: isVisible ? '0ms' : `${index * 100}ms` }}
    >
      <div
        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.accent} flex items-center justify-center mx-auto mb-4 shadow-lg`}
      >
        <Icon name={item.icon as "Phone"} size={26} className="text-white" />
      </div>
      <h3 className="text-white font-bold font-['Oswald'] text-lg mb-2">
        {item.title}
      </h3>
      {item.link ? (
        <a
          href={item.link}
          className="text-gray-300 hover:text-cyan-400 transition-colors text-sm leading-relaxed block"
        >
          {item.lines[0]}
        </a>
      ) : (
        <p className="text-gray-300 text-sm">{item.lines[0]}</p>
      )}
      <p className="text-gray-500 text-xs mt-1">{item.lines[1]}</p>
    </div>
  );
}

export default function Contacts({ onContactClick, settings }: ContactsProps) {
  const contactItems = [
    { icon: "Phone", title: "Телефон", lines: [settings?.phone ?? "8 (986) 986-01-36"], link: settings?.phone_href ?? "tel:+79869860136", accent: "from-cyan-400 to-blue-500" },
    { icon: "Mail", title: "Email", lines: [settings?.email_support ?? "support@uplink-it.ru", "Отвечаем в течение часа"], link: `mailto:${settings?.email_info ?? "info@uplink-it.ru"}`, accent: "from-purple-400 to-cyan-400" },
    { icon: "MapPin", title: "Адрес", lines: [settings?.address ?? "Саратов, Россия", "Выезд по всему Саратову и СО"], link: null, accent: "from-green-400 to-cyan-400" },
  ];
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      id="contacts"
      className="py-24 bg-[#0a0f1a] relative overflow-hidden"
    >
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`text-center mb-16 transition-[opacity,transform] duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
            <Icon name="Phone" size={14} />
            Контакты
          </div>
          <h2 className="section-title text-white mb-4">
            Свяжитесь <span className="gradient-text">с нами</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Готовы ответить на вопросы и подобрать оптимальное решение для
            вашего бизнеса. Работаем без выходных.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {contactItems.map((item, i) => (
            <ContactCard key={item.title} item={item} index={i} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="glass-card neon-border neon-hover rounded-3xl p-10 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white font-['Oswald'] mb-3">
              Готовы начать сотрудничество?
            </h3>
            <p className="text-gray-400 mb-8">
              Оставьте заявку — мы свяжемся с вами в течение 15 минут и проведём
              бесплатную консультацию.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onContactClick}
                className="btn-neon px-8 py-4 rounded-xl font-semibold flex items-center gap-2 justify-center"
              >
                <Icon name="Send" size={18} />
                Оставить заявку
              </button>
              <a
                href={settings?.phone_href ?? "tel:+79869860136"}
                className="btn-outline-neon px-8 py-4 rounded-xl font-semibold flex items-center gap-2 justify-center"
              >
                <Icon name="Phone" size={18} />
                Позвонить сейчас
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
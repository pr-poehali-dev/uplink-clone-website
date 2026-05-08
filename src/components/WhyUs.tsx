import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import Icon from "@/components/ui/icon";
import { CmsSettings, CmsWhyusCard } from "@/hooks/useCmsContent";

const advantages = [
  {
    icon: "Clock",
    title: "Быстрое реагирование",
    desc: "Принимаем заявки 24/7. Приходящий системный администратор в Саратове выедет за 30 минут, удалённо подключимся за 15 — без ожидания и бюрократии.",
    accent: "from-cyan-400 to-blue-500",
  },
  {
    icon: "Users",
    title: "Опытная команда",
    desc: "Сертифицированные специалисты с опытом от 5 лет. Администрирование серверов Windows Server и Linux, настройка сетей Mikrotik и Cisco, монтаж ЛВС/СКС — всё в одной команде.",
    accent: "from-green-400 to-cyan-400",
  },
  {
    icon: "DollarSign",
    title: "Экономия до 40%",
    desc: "IT-аутсорсинг для малого бизнеса в Саратове обходится до 40% дешевле штатного IT-отдела. Фиксированная сумма от 7 000 ₽/мес — без скрытых переплат.",
    accent: "from-yellow-400 to-orange-400",
  },
  {
    icon: "FileText",
    title: "Прозрачная отчётность",
    desc: "После каждого выезда — краткий отчёт о выполненных работах. Вы всегда знаете, что происходит с вашей IT-инфраструктурой и за что платите.",
    accent: "from-purple-400 to-pink-400",
  },
  {
    icon: "ShieldCheck",
    title: "Гарантия на работы",
    desc: "Даём гарантию на монтаж видеонаблюдения, прокладку кабеля, настройку серверов и любые другие работы. Ответственность закреплена в договоре.",
    accent: "from-red-400 to-orange-400",
  },
  {
    icon: "Headphones",
    title: "Персональный менеджер",
    desc: "За каждым клиентом закреплён личный менеджер: знает вашу инфраструктуру, историю заявок и готов помочь в любой момент — по телефону или в мессенджере.",
    accent: "from-blue-400 to-purple-500",
  },
];

const statsData = [
  { num: "10+", label: "Лет на рынке" },
  { num: "10+", label: "Довольных клиентов" },
  { num: "20+", label: "Завершённых проектов" },
  { num: "99%", label: "Индекс удовлетворённости" },
];

function StatItem({
  num,
  label,
  delay,
}: {
  num: string;
  label: string;
  delay: number;
}) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`text-center glass-card hover-card neon-border neon-hover rounded-2xl p-6 scroll-anim ${isVisible ? "opacity-100 scale-100 visible" : "opacity-0 scale-90"}`}
      style={{ transitionDelay: isVisible ? '0ms' : `${delay}ms` }}
    >
      <div className="text-4xl font-bold gradient-text font-['Oswald'] mb-2">
        {num}
      </div>
      <div className="text-gray-400 text-sm">{label}</div>
    </div>
  );
}

const ACCENTS = [
  "from-cyan-400 to-blue-500",
  "from-green-400 to-cyan-400",
  "from-yellow-400 to-orange-400",
  "from-purple-400 to-pink-400",
  "from-red-400 to-orange-400",
  "from-blue-400 to-purple-500",
];

function AdvCard({ card, index }: { card: CmsWhyusCard | (typeof advantages)[0]; index: number }) {
  const { ref, isVisible } = useScrollAnimation();
  const icon = "icon" in card ? card.icon : card.icon;
  const title = "title" in card ? card.title : card.title;
  const desc = "description" in card ? (card as CmsWhyusCard).description : (card as (typeof advantages)[0]).desc;
  const accent = "accent" in card ? (card as (typeof advantages)[0]).accent : ACCENTS[index % ACCENTS.length];
  return (
    <div
      ref={ref}
      className={`glass-card hover-card neon-border neon-hover neon-scale rounded-2xl p-6 scroll-anim ${
        isVisible ? "opacity-100 translate-y-0 visible" : "opacity-0 translate-y-10"
      }`}
      style={{ transitionDelay: isVisible ? '0ms' : `${index * 80}ms` }}
    >
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${accent} flex items-center justify-center mb-4 shadow-lg transition-transform duration-300`}>
        <Icon name={icon as "Clock"} size={28} className="text-white" fallback="Check" />
      </div>
      <h3 className="text-lg font-bold text-white font-['Oswald'] mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

export default function WhyUs({ settings, whyusCards }: { settings?: CmsSettings; whyusCards?: CmsWhyusCard[] }) {
  const { ref, isVisible } = useScrollAnimation();
  const stats = [
    { num: settings?.whyus_stat_1_num ?? statsData[0].num, label: settings?.whyus_stat_1_label ?? statsData[0].label },
    { num: settings?.whyus_stat_2_num ?? statsData[1].num, label: settings?.whyus_stat_2_label ?? statsData[1].label },
    { num: settings?.whyus_stat_3_num ?? statsData[2].num, label: settings?.whyus_stat_3_label ?? statsData[2].label },
    { num: settings?.whyus_stat_4_num ?? statsData[3].num, label: settings?.whyus_stat_4_label ?? statsData[3].label },
  ];

  const activeCards = whyusCards?.filter(c => c.is_active) ?? [];
  const cards = activeCards.length > 0 ? activeCards : advantages;

  return (
    <section className="py-14 relative overflow-hidden bg-[#0a0f1a]">
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`text-center mb-16 scroll-anim transition-[opacity,transform] duration-700 ${isVisible ? "opacity-100 translate-y-0 visible" : "opacity-0 translate-y-8"}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
            <Icon name="Star" size={14} />
            Наши преимущества
          </div>
          <h2 className="section-title text-white mb-4">
            Почему стоит работать <span className="gradient-text">с нами</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Мы не просто подрядчики — мы становимся частью вашей команды. IT-компания в Саратове с опытом 10+ лет: обслуживание компьютеров, серверов, сетей и видеонаблюдения для бизнеса любого масштаба.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <AdvCard key={"id" in card ? card.id : (card as (typeof advantages)[0]).title} card={card} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}
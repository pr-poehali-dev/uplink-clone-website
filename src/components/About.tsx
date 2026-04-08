import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import Icon from "@/components/ui/icon";
import { CmsTeamMember } from "@/hooks/useCmsContent";

const timeline = [
  {
    year: "2014",
    title: "Пройденый путь",
    desc: "От младшего сис-админа до руководителя службы ИТ.",
  },
  {
    year: "2024",
    title: "Основание компании",
    desc: "Начали с небольшой команды из 3 специалистов. Первые клиенты — малый и средний бизнес Саратова",
  },
  {
    year: "2025",
    title: "Расширение услуг",
    desc: "Добавили монтаж систем видеонаблюдения, СКС и домофонии. Команда выросла до 5 человек.",
  },
  //{ year: "2022", title: "Сертификации", desc: "Получили статус партнёра Microsoft и сертификации Cisco. Запустили круглосуточную поддержку." },
  //{ year: "2026", title: "10 лет на рынке", desc: "Отметили 10-летие. 150+ клиентов, 500+ проектов, 30+ специалистов в команде." },
];

const approaches = [
  {
    icon: "Zap",
    title: "Проактивность",
    desc: "Мы не ждём, пока что-то сломается. Мониторим инфраструктуру и устраняем угрозы до их появления.",
  },
  {
    icon: "Lock",
    title: "Безопасность",
    desc: "Конфиденциальность данных клиентов — наш приоритет. Все работы ведутся согласно политике NDA.",
  },
  {
    icon: "BarChart",
    title: "Результат",
    desc: "Измеримые KPI: время реагирования, uptime, количество инцидентов. Прозрачная отчётность каждый месяц.",
  },
  {
    icon: "Heart",
    title: "Партнёрство",
    desc: "Строим долгосрочные отношения. 85% наших клиентов сотрудничают с нами более 2 лет.",
  },
];

const team = [
  { name: "Латифов Тимур", role: "Основатель", exp: "12 лет в IT" },
  {
    name: "Емельянов Илья",
    role: "Главный инженер сетей",
    exp: "17 лет опыта",
  },
  {
    name: "Ангелов Иван",
    role: "Руководитель монтажной группы",
    exp: "10 лет опыта",
  },
  {
    name: "Витюков Анвар",
    role: "Старший системный администратор",
    exp: "10 лет опыта",
  },
];

function TimelineItem({
  item,
  index,
}: {
  item: (typeof timeline)[0];
  index: number;
}) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`flex gap-4 transition-[opacity,transform] duration-700 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-[#080c14] font-bold text-xs flex-shrink-0 shadow-lg shadow-cyan-500/30">
          {item.year.slice(2)}
        </div>
        {index < timeline.length - 1 && (
          <div className="w-px flex-1 bg-gradient-to-b from-cyan-500/40 to-transparent mt-2" />
        )}
      </div>
      <div className="pb-8">
        <div className="text-cyan-400 text-sm font-medium mb-0.5">
          {item.year}
        </div>
        <h4 className="text-white font-bold font-['Oswald'] text-lg mb-1">
          {item.title}
        </h4>
        <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
      </div>
    </div>
  );
}

function ApproachItem({
  item,
  index,
}: {
  item: (typeof approaches)[0];
  index: number;
}) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`flex gap-4 glass-card neon-border neon-hover rounded-xl p-4 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
      style={{ transitionDelay: isVisible ? "0ms" : `${index * 100}ms` }}
    >
      <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
        <Icon name={item.icon as "Zap"} size={20} className="text-cyan-400" />
      </div>
      <div>
        <h4 className="text-white font-bold mb-1 font-['Oswald']">
          {item.title}
        </h4>
        <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
      </div>
    </div>
  );
}

function TeamCard({
  member,
  index,
}: {
  member: (typeof team)[0];
  index: number;
}) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`glass-card neon-border neon-hover neon-scale-sm rounded-2xl p-5 text-center ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: isVisible ? "0ms" : `${index * 100}ms` }}
    >
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3">
        <Icon name="User" size={32} className="text-cyan-400" />
      </div>
      <h4 className="text-white font-bold text-sm font-['Oswald'] mb-1">
        {member.name}
      </h4>
      <div className="text-cyan-400 text-xs mb-1">{member.role}</div>
      <div className="text-gray-500 text-xs">{member.exp}</div>
    </div>
  );
}

export default function About({ team: cmsTeam }: { team?: CmsTeamMember[] }) {
  const displayTeam = (cmsTeam && cmsTeam.length > 0)
    ? cmsTeam.filter(m => m.is_active).map(m => ({ name: m.name, role: m.position, exp: m.experience ?? "" }))
    : team;
  const { ref, isVisible } = useScrollAnimation();
  const { ref: teamRef, isVisible: teamVisible } = useScrollAnimation();

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-cyan-500/4 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-purple-500/4 rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`text-center mb-16 transition-[opacity,transform] duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
            <Icon name="Info" size={14} />О компании
          </div>
          <h2 className="section-title text-white mb-4">
            ИТК <span className="gradient-text">Аплинк-IT</span>
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed">
            Мы — команда профессиональных IT-специалистов. Специализируемся на
            комплексном обслуживании IT-инфраструктуры малого и среднего
            бизнеса. Наша миссия — освободить предпринимателей от IT-головной
            боли и дать им инструменты для роста.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
          <div>
            <h3 className="text-2xl font-bold text-white font-['Oswald'] mb-8 flex items-center gap-2">
              <Icon name="Clock" size={24} className="text-cyan-400" />
              История компании
            </h3>
            {timeline.map((item, i) => (
              <TimelineItem key={item.year} item={item} index={i} />
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white font-['Oswald'] flex items-center gap-2 mb-8">
              <Icon name="Target" size={24} className="text-cyan-400" />
              Наш подход
            </h3>
            {approaches.map((item, i) => (
              <ApproachItem key={item.title} item={item} index={i} />
            ))}
          </div>
        </div>

        <div
          ref={teamRef}
          className={`transition-all duration-700 ${teamVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <h3 className="text-2xl font-bold text-white font-['Oswald'] mb-8 text-center flex items-center justify-center gap-2">
            <Icon name="Users" size={24} className="text-cyan-400" />
            Наша команда
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {displayTeam.map((member, i) => (
              <TeamCard key={member.name} member={member} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
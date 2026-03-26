import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import Icon from "@/components/ui/icon";

const projects = [
  {
    category: "IT-аутсорсинг",
    title: "Медицинский центр «МедЛайн»",
    desc: "Полное обслуживание IT-инфраструктуры сети из 3 клиник. Настройка серверной инфраструктуры, рабочих станций и медицинского ПО. Время реагирования на заявки — до 30 минут.",
    metrics: [
      { label: "ПК на обслуживании", value: "45" },
      { label: "Серверов", value: "4" },
      { label: "Сотрудников", value: "120" },
    ],
    tags: ["IT-аутсорсинг", "Серверы", "Поддержка"],
    icon: "Building2",
    accent: "from-cyan-400 to-blue-500",
    result: "Снижение простоев на 95%",
  },
  {
    category: "Видеонаблюдение",
    title: "Торговый центр «Меркурий»",
    desc: "Проектирование и монтаж системы видеонаблюдения на 3 этажах ТЦ. Установлено 86 IP-камер с разрешением 4K, организовано хранение видеоархива 30 дней, настроен удалённый доступ для службы безопасности.",
    metrics: [
      { label: "Камер установлено", value: "86" },
      { label: "Дней архива", value: "30" },
      { label: "Этажей", value: "3" },
    ],
    tags: ["Видеонаблюдение", "IP-камеры", "Монтаж"],
    icon: "Camera",
    accent: "from-orange-400 to-yellow-400",
    result: "Охвачено 100% территории",
  },
  {
    category: "ЛВС / СКС",
    title: "Офисный центр «Бизнес Парк»",
    desc: "Проектирование и прокладка структурированной кабельной системы для нового офисного центра. 5 этажей, 200 рабочих мест. Организована серверная комната с системой бесперебойного питания.",
    metrics: [
      { label: "Рабочих мест", value: "200" },
      { label: "Этажей", value: "5" },
      { label: "Портов СКС", value: "400" },
    ],
    tags: ["СКС", "ЛВС", "Проектирование"],
    icon: "Cable",
    accent: "from-purple-400 to-pink-400",
    result: "Скорость сети 10 Гбит/с",
  },
  {
    category: "Администрирование",
    title: "Производственное предприятие «АгроТех»",
    desc: "Миграция инфраструктуры на виртуализацию VMware. Настройка Active Directory, почтового сервера Microsoft Exchange и системы резервного копирования. Обеспечена отказоустойчивость критических сервисов.",
    metrics: [
      { label: "Виртуальных машин", value: "18" },
      { label: "Пользователей AD", value: "80" },
      { label: "ТБ данных", value: "12" },
    ],
    tags: ["VMware", "AD", "Exchange"],
    icon: "Server",
    accent: "from-green-400 to-cyan-400",
    result: "Uptime 99.9%",
  },
  {
    category: "IT-аутсорсинг",
    title: "Розничная сеть «TechStore»",
    desc: "Обслуживание сети розничных магазинов электроники. Единая IT-инфраструктура для 12 точек продаж, интеграция с 1С и кассовым ПО, мониторинг торгового оборудования 24/7.",
    metrics: [
      { label: "Магазинов", value: "12" },
      { label: "Касс", value: "36" },
      { label: "Городов", value: "3" },
    ],
    tags: ["Розница", "1С", "Кассы"],
    icon: "ShoppingCart",
    accent: "from-blue-400 to-purple-500",
    result: "Экономия 35% на IT-затратах",
  },
  {
    category: "Безопасность",
    title: "Банковский офис «ФинансГрупп»",
    desc: "Комплексный аудит информационной безопасности и приведение инфраструктуры к требованиям PCI DSS. Настройка периметральной защиты, системы обнаружения вторжений и шифрования данных.",
    metrics: [
      { label: "Уязвимостей устранено", value: "47" },
      { label: "Дней аудита", value: "14" },
      { label: "Серверов защищено", value: "8" },
    ],
    tags: ["ИБ", "PCI DSS", "Аудит"],
    icon: "ShieldCheck",
    accent: "from-red-400 to-orange-400",
    result: "Сертификация PCI DSS пройдена",
  },
];

function ProjectCard({ p, index }: { p: (typeof projects)[0]; index: number }) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`glass-card neon-border neon-hover rounded-2xl overflow-hidden flex flex-col transition-all duration-700 group hover:scale-[1.02] ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className={`h-1.5 bg-gradient-to-r ${p.accent}`} />
      <div className="p-6 flex flex-col flex-1 gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.accent} flex items-center justify-center flex-shrink-0 shadow-md`}
          >
            <Icon
              name={p.icon as "Building2"}
              size={20}
              className="text-white"
            />
          </div>
          <div>
            <div className="text-xs text-cyan-400 font-medium mb-1">
              {p.category}
            </div>
            <h3 className="text-lg font-bold text-white font-['Oswald'] leading-tight">
              {p.title}
            </h3>
          </div>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed flex-1">{p.desc}</p>
        <div className="grid grid-cols-3 gap-2">
          {p.metrics.map((m) => (
            <div
              key={m.label}
              className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-2.5 text-center"
            >
              <div className="text-lg font-bold text-cyan-400 font-['Oswald']">
                {m.value}
              </div>
              <div className="text-gray-500 text-xs leading-tight mt-0.5">
                {m.label}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5 flex-wrap">
            {p.tags.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-xs border border-cyan-500/20"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1 text-green-400 text-xs font-medium flex-shrink-0">
            <Icon name="TrendingUp" size={12} />
            {p.result}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      id="projects"
      className="py-24 bg-[#0a0f1a] relative overflow-hidden"
    >
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
            <Icon name="Briefcase" size={14} />
            Кейсы
          </div>
          <h2 className="section-title text-white mb-4">
            Реализованные <span className="gradient-text">проекты</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Более 30 успешно завершённых проектов в различных отраслях. Вот
            несколько примеров того, что мы уже сделали для наших клиентов.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, i) => (
            <ProjectCard key={p.title} p={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
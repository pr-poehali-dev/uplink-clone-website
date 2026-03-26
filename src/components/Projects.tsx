import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import Icon from "@/components/ui/icon";

const projects = [
  {
    category: "Видеонаблюдение",
    title: "Банк ВТБ",
    desc: "Монтаж системы видеонаблюдения на 30 камер: прокладка кабельных трасс, установка и подключение оборудования, настройка записи и удалённого доступа для службы безопасности.",
    metrics: [
      { label: "Камер установлено", value: "30" },
      { label: "Дней архива", value: "14" },
      { label: "Дней монтажа", value: "5" },
    ],
    tags: ["Видеонаблюдение", "Монтаж", "Кабельные трассы"],
    icon: "Camera",
    accent: "from-orange-400 to-yellow-400",
    result: "Сдан в срок",
  },
  {
    category: "IT-аутсорсинг",
    title: "ООО АКРОН",
    desc: "Принятие на IT-обслуживание небольшого офиса на 30 ПК. Настройка и администрирование всех IT-сервисов: сеть, печать, почта, антивирусная защита, техподдержка сотрудников.",
    metrics: [
      { label: "ПК на обслуживании", value: "30" },
      { label: "IT-сервисов", value: "8" },
      { label: "Реагирование", value: "4ч" },
    ],
    tags: ["IT-аутсорсинг", "Администрирование", "Поддержка"],
    icon: "Monitor",
    accent: "from-cyan-400 to-blue-500",
    result: "Офис работает без сбоев",
  },
  {
    category: "ЛВС / СКС",
    title: "ООО ЛукБелОйл",
    desc: "Монтаж локальной вычислительной сети с межэтажной коммутацией: прокладка кабеля, установка коммутаторов, организация кроссовых узлов и проверка качества линий.",
    metrics: [
      { label: "Портов ЛВС", value: "48" },
      { label: "Этажей", value: "3" },
      { label: "Коммутаторов", value: "4" },
    ],
    tags: ["ЛВС", "Монтаж", "Коммутация"],
    icon: "Cable",
    accent: "from-purple-400 to-pink-400",
    result: "Сеть принята с первого раза",
  },
];

function ProjectCard({ p, index }: { p: (typeof projects)[0]; index: number }) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`glass-card neon-border neon-hover neon-scale rounded-2xl overflow-hidden flex flex-col ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{ transitionDelay: isVisible ? '0ms' : `${index * 80}ms` }}
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
          className={`text-center mb-16 transition-[opacity,transform] duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
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
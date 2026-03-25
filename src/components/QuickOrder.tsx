import { useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import Icon from "@/components/ui/icon";

const services = [
  {
    icon: "Camera",
    title: "Видеонаблюдение",
    steps: [
      "Закажите бесплатный выезд специалиста для аудита и осмотра объекта",
      "Составьте план-проект размещения камер системы видеонаблюдения",
      "Получите готовый расчёт в виде коммерческого предложения и договора",
      "Согласуйте время для проведения монтажных работ",
      "Примите работы: проверьте камеры, удалённый доступ и видеоархив",
    ],
    accent: "from-orange-400 to-yellow-400",
  },
  {
    icon: "Monitor",
    title: "IT-аутсорсинг",
    steps: [
      "Оставьте заявку или позвоните — проведём бесплатную консультацию",
      "Аудит текущей IT-инфраструктуры вашей компании",
      "Подбор оптимального пакета обслуживания под ваши задачи",
      "Подписание договора и передача IT-задач нашей команде",
      "Старт работы: ваши сотрудники получают поддержку с первого дня",
    ],
    accent: "from-cyan-400 to-blue-500",
  },
  {
    icon: "Search",
    title: "Аудит IT-инфраструктуры",
    steps: [
      "Заявка на аудит: опишите вашу IT-инфраструктуру и задачи",
      "Выезд специалиста и инвентаризация оборудования и ПО",
      "Анализ уязвимостей, производительности и надёжности системы",
      "Подготовка детального отчёта с рекомендациями",
      "Презентация результатов и план по улучшениям",
    ],
    accent: "from-purple-400 to-pink-400",
  },
  {
    icon: "Cable",
    title: "Монтаж ЛВС / СКС",
    steps: [
      "Бесплатный выезд и замер для расчёта стоимости работ",
      "Проектирование схемы кабельных трасс и подбор оборудования",
      "Согласование плана работ и заключение договора",
      "Прокладка кабелей, монтаж коммутаторов и патч-панелей",
      "Тестирование сети и передача документации заказчику",
    ],
    accent: "from-blue-400 to-purple-500",
  },
  {
    icon: "Server",
    title: "Администрирование серверов",
    steps: [
      "Оставьте заявку с описанием текущей серверной инфраструктуры",
      "Аудит серверов: безопасность, производительность, актуальность ПО",
      "Разработка плана регламентного обслуживания и мониторинга",
      "Настройка систем резервного копирования и защиты данных",
      "Заключение договора на постоянное администрирование",
    ],
    accent: "from-green-400 to-cyan-400",
  },
  {
    icon: "UserCheck",
    title: "Вызов IT-специалиста",
    steps: [
      "Позвоните или оставьте заявку на сайте — отвечаем за 15 минут",
      "Уточните задачу: наш диспетчер поможет определить срочность",
      "Выезд специалиста в удобное для вас время",
      "Диагностика и устранение неисправности на месте",
      "Оплата только выполненных работ по прозрачному прайсу",
    ],
    accent: "from-red-400 to-orange-400",
  },
];

function ServiceAccordion({ s }: { s: (typeof services)[0] }) {
  const [open, setOpen] = useState(false);
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`glass-card neon-border rounded-2xl overflow-hidden transition-[opacity,transform] duration-700 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-cyan-500/5 transition-colors"
      >
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.accent} flex items-center justify-center flex-shrink-0 shadow-md`}>
          <Icon name={s.icon as "Camera"} size={20} className="text-white" />
        </div>
        <span className="flex-1 text-white font-semibold font-['Oswald'] text-lg">{s.title}</span>
        <Icon
          name="ChevronDown"
          size={20}
          className={`text-cyan-400 transition-transform duration-300 flex-shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5">
          <ol className="space-y-2.5">
            {s.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-gray-300 text-sm leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default function QuickOrder() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
            <Icon name="Zap" size={14} />
            Быстрый заказ
          </div>
          <h2 className="section-title text-white mb-4">
            Как <span className="gradient-text">заказать услугу</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Нажмите на нужную услугу и узнайте, как проходит процесс работы.
            Всё просто и прозрачно — от заявки до результата.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {services.map((s) => (
            <ServiceAccordion key={s.title} s={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
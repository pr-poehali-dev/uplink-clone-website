import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import Icon from "@/components/ui/icon";

interface PricingProps {
  onContactClick: () => void;
}

const plans = [
  {
    name: "Базовый",
    price: "от 7 000 ₽/мес",
    badge: null,
    desc: "Пакет для небольших компаний и стартапов. Оптимальное решение по доступной цене.",
    features: [
      "Техподдержка до 5 ПК",
      "Удалённая диагностика и помощь",
      "Настройка ПО и обновления",
      "1 выезд специалиста в месяц",
      "Время реагирования до 8 часов",
      "Email-поддержка",
    ],
    color: "from-gray-600 to-gray-700",
    border: "border-gray-700/50",
    btnClass: "btn-outline-neon",
  },
  {
    name: "Премиум",
    price: "от 30 000 ₽/мес",
    badge: "Рекомендуем",
    desc: "Расширенный пакет для комплексной поддержки. Быстрое реагирование и приоритетный сервис.",
    features: [
      "Техподдержка до 25 ПК",
      "Администрирование серверов",
      "Мониторинг инфраструктуры",
      "Неограниченные выезды специалиста",
      "Время реагирования до 2 часов",
      "Резервное копирование данных",
      "Обеспечение информационной безопасности",
      "Приоритетная горячая линия",
    ],
    color: "from-cyan-400 to-blue-500",
    border: "border-cyan-500/40",
    btnClass: "btn-neon",
    highlight: true,
  },
  {
    name: "Стандарт",
    price: "от 12 000 ₽/мес",
    badge: null,
    desc: "Базовый пакет услуг для решения текущих IT-задач среднего офиса.",
    features: [
      "Техподдержка до 15 ПК",
      "Удалённая и выездная поддержка",
      "Настройка сетевого оборудования",
      "2 выезда специалиста в месяц",
      "Время реагирования до 4 часов",
      "Антивирусная защита",
      "Телефонная поддержка",
    ],
    color: "from-purple-500 to-cyan-500",
    border: "border-purple-500/30",
    btnClass: "btn-outline-neon",
  },
];

function PricingCard({
  plan,
  index,
}: {
  plan: (typeof plans)[0];
  index: number;
}) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`relative flex flex-col rounded-2xl p-8 border transition-all duration-700 ${plan.border} ${
        plan.highlight
          ? "bg-gradient-to-b from-cyan-500/10 to-blue-500/5 shadow-2xl shadow-cyan-500/20 scale-105"
          : "glass-card"
      } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      {plan.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-[#080c14] text-xs font-bold shadow-lg shadow-cyan-500/30">
          {plan.badge}
        </div>
      )}
      <div
        className={`inline-flex w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} items-center justify-center mb-4`}
      >
        <Icon name="Package" size={20} className="text-white" />
      </div>
      <h3 className="text-2xl font-bold text-white font-['Oswald'] mb-1">
        {plan.name}
      </h3>
      <div className="text-3xl font-bold gradient-text font-['Oswald'] mb-3">
        {plan.price}
      </div>
      <p className="text-gray-400 text-sm mb-6 leading-relaxed">{plan.desc}</p>
      <ul className="space-y-2.5 flex-1 mb-8">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
            <Icon
              name="Check"
              size={16}
              className="text-cyan-400 mt-0.5 flex-shrink-0"
            />
            {f}
          </li>
        ))}
      </ul>
      <button
        className={`${plan.btnClass} w-full py-3 rounded-xl font-semibold text-sm`}
      >
        Выбрать тариф
      </button>
    </div>
  );
}

export default function Pricing({ onContactClick }: PricingProps) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
            <Icon name="CreditCard" size={14} />
            Тарифы
          </div>
          <h2 className="section-title text-white mb-4">
            Прозрачные <span className="gradient-text">цены</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Выберите подходящий пакет или обратитесь к нам для расчёта
            индивидуального предложения.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {plans.map((p, i) => (
            <PricingCard key={p.name} plan={p} index={i} />
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4 text-sm">
            Нужен индивидуальный расчёт?
          </p>
          <button
            onClick={onContactClick}
            className="btn-outline-neon px-8 py-3 rounded-xl font-semibold text-sm"
          >
            Получить коммерческое предложение
          </button>
        </div>
      </div>
    </section>
  );
}

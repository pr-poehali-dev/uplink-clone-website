import { useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import Icon from "@/components/ui/icon";

const SEND_EMAIL_URL = "https://functions.poehali.dev/97638ab8-62ea-4ada-8078-f5aa05a3f044";

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

interface PlanOrderModalProps {
  plan: (typeof plans)[0] | null;
  onClose: () => void;
}

function PlanOrderModal({ plan, onClose }: PlanOrderModalProps) {
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!plan) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(SEND_EMAIL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          source: "Блок тарифов",
          service: `Тариф «${plan.name}» (${plan.price})`,
          message: `Клиент выбрал тариф «${plan.name}» (${plan.price})`,
        }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      setError("Не удалось отправить заявку. Позвоните нам напрямую.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSent(false);
    setError("");
    setForm({ name: "", phone: "", email: "" });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-md glass-card rounded-3xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-cyan-400 to-blue-500" />
        <div className="p-8">
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
          >
            <Icon name="X" size={22} />
          </button>

          {sent ? (
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/30">
                <Icon name="Check" size={40} className="text-[#080c14]" />
              </div>
              <h3 className="text-2xl font-bold text-white font-['Oswald'] mb-3">
                Заявка отправлена!
              </h3>
              <p className="text-gray-400 mb-2">
                Мы получили вашу заявку на тариф
              </p>
              <p className="text-cyan-400 font-bold font-['Oswald'] text-lg mb-6">
                «{plan.name}» — {plan.price}
              </p>
              <p className="text-gray-400 text-sm mb-6">
                Свяжемся с вами в ближайшее время для уточнения деталей и подписания договора.
              </p>
              <button onClick={handleClose} className="btn-neon px-8 py-3 rounded-xl font-semibold">
                Отлично, жду звонка!
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-1">Вы выбрали тариф</p>
                <h3 className="text-2xl font-bold text-white font-['Oswald']">
                  «{plan.name}»
                </h3>
                <p className="text-cyan-400 font-bold font-['Oswald'] text-lg">{plan.price}</p>
              </div>

              <p className="text-gray-400 text-sm mb-5">
                Оставьте контакты — мы свяжемся с вами, чтобы уточнить детали и оформить договор.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">Ваше имя *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Иван Иванов"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">Телефон *</label>
                  <input
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+7 (999) 000-00-00"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@company.ru"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all"
                  />
                </div>

                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-neon w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#080c14]/30 border-t-[#080c14] rounded-full animate-spin" />
                      Отправляем...
                    </>
                  ) : (
                    <>
                      <Icon name="Send" size={18} />
                      Отправить заявку
                    </>
                  )}
                </button>
                <p className="text-gray-600 text-xs text-center">
                  Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PricingCard({
  plan,
  index,
  onSelect,
}: {
  plan: (typeof plans)[0];
  index: number;
  onSelect: () => void;
}) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`relative flex flex-col rounded-2xl p-8 border transition-[opacity,transform] duration-700 ${plan.border} ${
        plan.highlight
          ? "bg-gradient-to-b from-cyan-500/10 to-blue-500/5 shadow-2xl shadow-cyan-500/20 scale-105"
          : "glass-card"
      } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      style={{ transitionDelay: isVisible ? "0ms" : `${index * 120}ms` }}
    >
      {plan.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-[#080c14] text-xs font-bold shadow-lg shadow-cyan-500/30">
          {plan.badge}
        </div>
      )}
      <div className={`inline-flex w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} items-center justify-center mb-4`}>
        <Icon name="Package" size={20} className="text-white" />
      </div>
      <h3 className="text-2xl font-bold text-white font-['Oswald'] mb-1">{plan.name}</h3>
      <div className="text-3xl font-bold gradient-text font-['Oswald'] mb-3">{plan.price}</div>
      <p className="text-gray-400 text-sm mb-6 leading-relaxed">{plan.desc}</p>
      <ul className="space-y-2.5 flex-1 mb-8">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
            <Icon name="Check" size={16} className="text-cyan-400 mt-0.5 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={onSelect}
        className={`${plan.btnClass} w-full py-3 rounded-xl font-semibold text-sm`}
      >
        Выбрать тариф
      </button>
    </div>
  );
}

export default function Pricing({ onContactClick }: PricingProps) {
  const { ref, isVisible } = useScrollAnimation();
  const [selectedPlan, setSelectedPlan] = useState<(typeof plans)[0] | null>(null);

  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`text-center mb-16 transition-[opacity,transform] duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
            <Icon name="CreditCard" size={14} />
            Тарифы
          </div>
          <h2 className="section-title text-white mb-4">
            Прозрачные <span className="gradient-text">цены</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Выберите подходящий пакет или обратитесь к нам для расчёта индивидуального предложения.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {plans.map((p, i) => (
            <PricingCard key={p.name} plan={p} index={i} onSelect={() => setSelectedPlan(p)} />
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4 text-sm">Нужен индивидуальный расчёт?</p>
          <button
            onClick={onContactClick}
            className="btn-outline-neon px-8 py-3 rounded-xl font-semibold text-sm"
          >
            Получить коммерческое предложение
          </button>
        </div>
      </div>

      <PlanOrderModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
    </section>
  );
}

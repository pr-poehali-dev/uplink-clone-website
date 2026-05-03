import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactModal from "@/components/ContactModal";
import Icon from "@/components/ui/icon";
import { useCmsContent } from "@/hooks/useCmsContent";

const PRICING_DATA = [
  {
    id: "it-outsourcing",
    title: "IT-аутсорсинг",
    icon: "Laptop",
    accent: "from-cyan-400 to-blue-500",
    slug: "it-outsourcing",
    items: [
      { name: "Тариф «Базовый» (до 10 ПК)", price: "от 7 000 ₽/мес", desc: "Техподдержка пользователей, обслуживание оргтехники, консультации" },
      { name: "Тариф «Стандарт» (до 25 ПК)", price: "от 15 000 ₽/мес", desc: "Базовый + администрирование серверов, мониторинг сети, резервное копирование" },
      { name: "Тариф «Бизнес» (до 50 ПК)", price: "от 25 000 ₽/мес", desc: "Стандарт + выезды без ограничений, аудит безопасности, SLA до 1 часа" },
      { name: "Тариф «Корпорация» (50+ ПК)", price: "по договору", desc: "Индивидуальные условия под задачи предприятия" },
      { name: "Разовый выезд IT-специалиста", price: "от 1 500 ₽", desc: "Диагностика, настройка, устранение неисправностей на месте" },
      { name: "Удалённая помощь (разовая)", price: "от 800 ₽", desc: "Подключение и решение задачи без выезда" },
    ],
  },
  {
    id: "server-administration",
    title: "Администрирование серверов",
    icon: "Server",
    accent: "from-violet-400 to-purple-500",
    slug: "server-administration",
    items: [
      { name: "Первичная настройка сервера", price: "от 8 000 ₽", desc: "Установка ОС, базовая конфигурация, настройка служб" },
      { name: "Настройка Active Directory / домена", price: "от 12 000 ₽", desc: "Развёртывание контроллера домена, групповые политики, пользователи" },
      { name: "Настройка сервера 1С", price: "от 10 000 ₽", desc: "Установка, настройка, оптимизация производительности" },
      { name: "Настройка резервного копирования", price: "от 5 000 ₽", desc: "Разработка стратегии, настройка и тестирование бэкапов" },
      { name: "Мониторинг и обслуживание серверов", price: "от 5 000 ₽/мес", desc: "Контроль состояния, обновления, оперативное устранение сбоев" },
      { name: "Миграция данных / виртуализация", price: "от 15 000 ₽", desc: "Перенос данных, настройка виртуальных машин" },
    ],
  },
  {
    id: "it-infrastructure",
    title: "Поддержка IT-инфраструктуры",
    icon: "Network",
    accent: "from-blue-400 to-indigo-500",
    slug: "it-infrastructure",
    items: [
      { name: "Аудит IT-инфраструктуры", price: "от 5 000 ₽", desc: "Обследование сети, оборудования, анализ уязвимостей, отчёт с рекомендациями" },
      { name: "Проектирование сети", price: "от 10 000 ₽", desc: "Разработка схемы сети, техническое задание, спецификация" },
      { name: "Настройка маршрутизатора / коммутатора", price: "от 3 500 ₽/уст.", desc: "VLAN, QoS, ACL, VPN, настройка по задаче" },
      { name: "Настройка Wi-Fi инфраструктуры", price: "от 5 000 ₽", desc: "Точки доступа, контроллер, гостевая сеть, роуминг" },
      { name: "Настройка VPN / удалённый доступ", price: "от 5 000 ₽", desc: "L2TP, OpenVPN, WireGuard — для сотрудников и филиалов" },
      { name: "Абонентское сопровождение сети", price: "от 4 000 ₽/мес", desc: "Мониторинг, обновление прошивок, реагирование на инциденты" },
    ],
  },
  {
    id: "video-surveillance",
    title: "Видеонаблюдение",
    icon: "Camera",
    accent: "from-green-400 to-emerald-500",
    slug: "video-surveillance",
    items: [
      { name: "Внутренняя IP-камера (монтаж + настройка)", price: "от 4 500 ₽/шт.", desc: "Установка, подключение, настройка записи и удалённого доступа" },
      { name: "Уличная IP-камера (монтаж + настройка)", price: "от 6 500 ₽/шт.", desc: "Монтаж на улице, подключение, настройка" },
      { name: "Поворотная PTZ-камера (монтаж + настройка)", price: "от 9 500 ₽/шт.", desc: "Установка, настройка управления и патрулирования" },
      { name: "Прокладка кабеля", price: "от 150 ₽/м", desc: "Монтаж кабельной трассы по кабель-каналу или скрыто" },
      { name: "Настройка видеорегистратора (NVR)", price: "от 3 500 ₽", desc: "Подключение камер, настройка архива, удалённого доступа" },
      { name: "Пакет «Офис» (4 камеры под ключ)", price: "от 35 000 ₽", desc: "4 внутренние камеры, NVR, прокладка кабеля до 50 м, настройка" },
      { name: "Техническое обслуживание", price: "от 2 000 ₽/мес", desc: "Проверка работоспособности, чистка, обновление прошивок" },
    ],
  },
  {
    id: "lan-installation",
    title: "Монтаж ЛВС / СКС",
    icon: "Cable",
    accent: "from-orange-400 to-amber-500",
    slug: "lan-installation",
    items: [
      { name: "Прокладка кабеля и монтаж трассы", price: "от 120 ₽/м", desc: "Прокладка по кабельным каналам, лоткам или скрытым способом" },
      { name: "Установка информационной розетки", price: "от 600 ₽/шт.", desc: "Монтаж, разделка, тестирование точки подключения" },
      { name: "Монтаж коммутационного шкафа", price: "от 5 000 ₽", desc: "Установка 19'' шкафа, кросс-панелей, органайзеров" },
      { name: "Настройка коммутатора", price: "от 3 000 ₽/уст.", desc: "VLAN, агрегация каналов, управление доступом" },
      { name: "Тестирование линий", price: "от 200 ₽/порт", desc: "Профессиональная проверка с оформлением протокола" },
      { name: "Разработка проекта сети", price: "от 8 000 ₽", desc: "Схемы, спецификации, документация по объекту" },
      { name: "Монтаж «под ключ» (20 портов)", price: "от 30 000 ₽", desc: "Весь цикл: проект, монтаж, коммутационный шкаф, тестирование" },
    ],
  },
  {
    id: "ip-telephony",
    title: "IP-телефония",
    icon: "Phone",
    accent: "from-pink-400 to-rose-500",
    slug: "ip-telephony",
    items: [
      { name: "Установка и настройка АТС", price: "от 12 000 ₽", desc: "Развёртывание программной АТС, настройка транков и внутренних номеров" },
      { name: "Подключение 1 линии / номера", price: "от 3 000 ₽", desc: "Настройка SIP-транка, маршрутизация вызовов" },
      { name: "Настройка IP-телефона", price: "от 800 ₽/шт.", desc: "Регистрация, прошивка, настройка функций" },
      { name: "Настройка голосового меню (IVR)", price: "от 5 000 ₽", desc: "Запись меню, настройка сценариев переадресации" },
      { name: "Настройка записи разговоров", price: "от 4 000 ₽", desc: "Организация хранилища, запись, поиск по дате и номеру" },
      { name: "Техническое сопровождение АТС", price: "от 3 000 ₽/мес", desc: "Администрирование, добавление номеров, устранение сбоев" },
    ],
  },
];

const CAT_ACCENTS: Record<string, string> = {
  "it-outsourcing": "from-cyan-400 to-blue-500",
  "server-administration": "from-violet-400 to-purple-500",
  "it-infrastructure": "from-blue-400 to-indigo-500",
  "video-surveillance": "from-green-400 to-emerald-500",
  "lan-installation": "from-orange-400 to-amber-500",
  "ip-telephony": "from-pink-400 to-rose-500",
};

export default function PricingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("it-outsourcing");
  const { content } = useCmsContent();

  // Получаем категории из CMS или fallback к хардкоду
  const cmsItems = content?.pricing_items?.filter(i => i.is_active) ?? [];
  const cmsCategories = Array.from(new Map(cmsItems.map(i => [i.category_slug, {
    id: i.category_slug, title: i.category_title, icon: i.category_icon,
    accent: CAT_ACCENTS[i.category_slug] || "from-cyan-400 to-blue-500",
    slug: i.category_slug,
  }])).values());

  const categories = cmsCategories.length > 0 ? cmsCategories : PRICING_DATA.map(d => ({ id: d.id, title: d.title, icon: d.icon, accent: d.accent, slug: d.slug }));

  const activeCat = categories.find(c => c.id === activeCategory) ?? categories[0];
  const activeCmsItems = cmsItems.filter(i => i.category_slug === activeCategory);
  const activeFallback = PRICING_DATA.find(d => d.id === activeCategory);
  const activeItems = activeCmsItems.length > 0 ? activeCmsItems.map(i => ({ name: i.name, price: i.price, desc: i.description }))
    : (activeFallback?.items ?? []);

  return (
    <div className="min-h-screen" style={{ background: "var(--dark-bg)", color: "var(--text-primary)" }}>
      <Header
        onContactClick={() => setModalOpen(true)}
        settings={content?.settings}
        services={content?.services}
      />

      <section className="pt-32 pb-10 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
        <div className="absolute top-20 -left-40 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 relative">
          <nav className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-8">
            <Link to="/" className="hover:text-cyan-500 transition-colors">Главная</Link>
            <Icon name="ChevronRight" size={14} />
            <span className="text-[var(--text-primary)]">Прайс</span>
          </nav>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-sm font-medium mb-5">
              <Icon name="Receipt" size={14} />
              Стоимость услуг
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-['Oswald'] mb-4 leading-tight">
              Прайс на IT-услуги <span className="gradient-text">в Саратове</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
              Фиксированные цены без скрытых доплат. Точную стоимость под ваши задачи рассчитываем на бесплатной консультации.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-16 relative">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[260px_1fr] gap-8 max-w-7xl mx-auto">
            {/* Левая панель — категории */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="glass-card neon-border rounded-2xl p-3 space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                      activeCategory === cat.id
                        ? "bg-cyan-500/15 text-cyan-500 border border-cyan-500/30"
                        : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] border border-transparent"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cat.accent} flex items-center justify-center flex-shrink-0`}>
                      <Icon name={cat.icon as "Server"} size={15} className="text-white" fallback="Settings" />
                    </div>
                    <span className="leading-tight">{cat.title}</span>
                  </button>
                ))}
              </div>

              <div className="glass-card neon-border rounded-2xl p-5 mt-4">
                <p className="text-sm text-[var(--text-muted)] mb-3 leading-relaxed">
                  Нужен индивидуальный расчёт или не нашли нужную услугу?
                </p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="btn-neon w-full py-3 rounded-xl text-sm font-semibold"
                >
                  Получить расчёт
                </button>
              </div>
            </div>

            {/* Правая панель — позиции прайса */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${activeCat?.accent || "from-cyan-400 to-blue-500"} flex items-center justify-center`}>
                  <Icon name={(activeCat?.icon || "Server") as "Server"} size={20} className="text-white" fallback="Settings" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-['Oswald'] text-[var(--text-primary)]">{activeCat?.title}</h2>
                  <Link to={`/services/${activeCat?.slug}`} className="text-sm text-cyan-500 hover:underline flex items-center gap-1">
                    Подробнее об услуге <Icon name="ArrowRight" size={12} />
                  </Link>
                </div>
              </div>

              <div className="space-y-3">
                {activeItems.map((item, i) => (
                  <div key={i} className="glass-card neon-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-3 group hover:border-cyan-500/30 transition-all">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[var(--text-primary)] mb-1">{item.name}</h3>
                      <p className="text-sm text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-lg font-bold gradient-text font-['Oswald'] whitespace-nowrap">{item.price}</div>
                      <button
                        onClick={() => setModalOpen(true)}
                        className="btn-outline-neon px-4 py-2 rounded-xl text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block"
                      >
                        Заказать
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl bg-cyan-500/8 border border-cyan-500/20 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="Info" size={18} className="text-cyan-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--text-primary)] mb-1">Как формируется цена?</h4>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                      Цены указаны ориентировочно и зависят от объёма работ, сложности задачи и удалённости объекта. Точную стоимость рассчитываем после бесплатной консультации или выезда специалиста.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer onContactClick={() => setModalOpen(true)} settings={content?.settings} />

      <ContactModal open={modalOpen} onClose={() => setModalOpen(false)} source="Страница прайса" />
    </div>
  );
}
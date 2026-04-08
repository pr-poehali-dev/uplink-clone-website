import { useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import Icon from "@/components/ui/icon";

const faqs = [
  {
    q: "Сколько стоит IT-аутсорсинг в Саратове?",
    a: "Стоимость начинается от 7 000 ₽/мес — это абонентское обслуживание с фиксированной ценой. Точная сумма зависит от количества рабочих мест и набора услуг. Это до 40% дешевле, чем держать штатного системного администратора.",
  },
  {
    q: "Как быстро приедет системный администратор?",
    a: "Реагирование на критические инциденты — выезд от 30 минут, удалённое подключение за 15 минут. Заявки принимаем 24/7 по телефону 8 (986) 986-01-36.",
  },
  {
    q: "Вы делаете монтаж видеонаблюдения под ключ?",
    a: "Да. Берём на себя весь цикл: проектирование, поставка оборудования, монтаж IP и аналоговых камер для офиса, склада или магазина, настройка удалённого доступа и архива.",
  },
  {
    q: "Выполняете монтаж локальной сети (ЛВС/СКС)?",
    a: "Да, выполняем полный цикл: проектирование, прокладка кабеля, монтаж коммутационного оборудования Mikrotik и Cisco, настройка корпоративной сети, тестирование и сертификация.",
  },
  {
    q: "Можно подключить IP-телефонию для бизнеса в Саратове?",
    a: "Конечно. Настраиваем IP-АТС и виртуальные АТС (ВАТС), подключаем IP-телефоны, интегрируем с CRM-системами, администрируем Asterisk и FreePBX.",
  },
  {
    q: "Работаете ли вы с малым бизнесом?",
    a: "Да, малый и средний бизнес — наша основная аудитория. IT-аутсорсинг особенно выгоден небольшим компаниям: не нужен штатный сотрудник, платите только за реальный объём работ.",
  },
];

function FaqItem({ item, index }: { item: (typeof faqs)[0]; index: number }) {
  const [open, setOpen] = useState(false);
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`glass-card neon-border rounded-2xl overflow-hidden transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      style={{ transitionDelay: isVisible ? "0ms" : `${index * 60}ms` }}
      itemScope
      itemProp="mainEntity"
      itemType="https://schema.org/Question"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left gap-4 group"
      >
        <span className="text-white font-medium text-sm leading-snug group-hover:text-cyan-400 transition-colors" itemProp="name">
          {item.q}
        </span>
        <div className={`flex-shrink-0 w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center transition-all duration-300 ${open ? "bg-cyan-500/20 rotate-45" : ""}`}>
          <Icon name="Plus" size={14} className="text-cyan-400" />
        </div>
      </button>
      {open && (
        <div
          className="px-5 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5"
          itemScope
          itemProp="acceptedAnswer"
          itemType="https://schema.org/Answer"
        >
          <p className="pt-4" itemProp="text">{item.a}</p>
        </div>
      )}
    </div>
  );
}

export default function Faq() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      className="py-24 bg-[#080c14] relative overflow-hidden"
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`text-center mb-12 transition-[opacity,transform] duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
            <Icon name="HelpCircle" size={14} />
            Частые вопросы
          </div>
          <h2 className="section-title text-white mb-4">
            Ответы на <span className="gradient-text">ваши вопросы</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Собрали самые частые вопросы об IT-аутсорсинге и наших услугах в Саратове.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((item, i) => (
            <FaqItem key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

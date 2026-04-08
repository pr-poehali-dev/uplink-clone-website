import { useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import Icon from "@/components/ui/icon";
// useScrollAnimation используется только в FaqItem, не в основном компоненте
import { CmsFaqItem } from "@/hooks/useCmsContent";

function FaqItem({ item, index }: { item: CmsFaqItem; index: number }) {
  const [open, setOpen] = useState(false);
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`rounded-2xl border transition-all duration-500 overflow-hidden ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${
        open
          ? "border-cyan-500/30 bg-cyan-500/5"
          : "border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5"
      }`}
      style={{ transitionDelay: isVisible ? "0ms" : `${index * 60}ms` }}
      itemScope
      itemProp="mainEntity"
      itemType="https://schema.org/Question"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 group"
      >
        <span
          className={`font-medium text-sm leading-snug transition-colors ${open ? "text-cyan-400" : "text-white group-hover:text-cyan-400"}`}
          itemProp="name"
        >
          {item.question}
        </span>
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
            open ? "bg-cyan-500 rotate-45" : "bg-cyan-500/10 border border-cyan-500/20"
          }`}
        >
          <Icon name="Plus" size={15} className={open ? "text-[#080c14]" : "text-cyan-400"} />
        </div>
      </button>

      <div
        className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div
            className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5"
            itemScope
            itemProp="acceptedAnswer"
            itemType="https://schema.org/Answer"
          >
            <p className="pt-4" itemProp="text">{item.answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FaqProps {
  items?: CmsFaqItem[];
}

export default function Faq({ items }: FaqProps) {
  const activeItems = (items ?? []).filter((i) => i.is_active);

  if (activeItems.length === 0) return null;

  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0a0f1a 0%, #080c14 100%)" }}
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      {/* Декоративный разделитель сверху */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

      <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />

      {/* Фоновое свечение */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-500/3 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">

        {/* Заголовок — без анимации, всегда виден */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-5">
            <Icon name="HelpCircle" size={14} />
            Частые вопросы
          </div>
          <h2 className="section-title text-white mb-4">
            Ответы на <span className="gradient-text">ваши вопросы</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-base">
            Собрали самые частые вопросы об IT-аутсорсинге и наших услугах в Саратове.
          </p>
        </div>

        {/* Две колонки на десктопе */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {activeItems.map((item, i) => (
              <FaqItem key={item.id} item={item} index={i} />
            ))}
          </div>
        </div>

      </div>

      {/* Декоративный разделитель снизу */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
    </section>
  );
}
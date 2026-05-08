import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function Badge({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-medium">
      <Icon name={icon as "Zap"} size={12} className="text-cyan-400" fallback="Check" />
      {text}
    </div>
  );
}

export function BenefitCard({ b, i }: { b: { id: number; icon: string; title: string; description: string | null }; i: number }) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div
      ref={ref}
      data-elem-id={`card-svc-benefit-${i}`}
      data-elem-type="card"
      className={`glass-card hover-card neon-border neon-hover rounded-2xl p-6 scroll-anim group ${isVisible ? "visible" : ""}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
        <Icon name={b.icon as "Check"} size={24} className="text-[#080c14]" fallback="Check" />
      </div>
      <h3 className="font-bold text-white font-['Oswald'] mb-2 text-lg">{b.title}</h3>
      {b.description && <p className="text-sm text-gray-400 leading-relaxed">{b.description}</p>}
    </div>
  );
}

export function StepCard({ step, index }: { step: { id: number; step_title: string; step_description: string | null }; index: number }) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`relative scroll-anim ${isVisible ? "visible" : ""}`}
    >
      <div
        data-elem-id={`card-svc-step-${index}`}
        data-elem-type="card"
        className="glass-card hover-card neon-border rounded-2xl p-6 pt-12 h-full hover:border-cyan-500/40 transition-colors duration-300"
      >
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 lg:left-6 lg:translate-x-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-2xl text-[#080c14] shadow-lg shadow-cyan-500/40 font-['Oswald'] z-10">
          {index + 1}
        </div>
        <h3 className="text-lg font-bold text-white font-['Oswald'] mb-2 mt-2 text-center lg:text-left">
          {step.step_title}
        </h3>
        <p className="text-sm text-gray-400 leading-relaxed text-center lg:text-left">
          {step.step_description}
        </p>
      </div>
    </div>
  );
}

export function FaqRow({ f, i }: { f: { question: string; answer: string }; i: number }) {
  const [open, setOpen] = useState(false);
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div
      ref={ref}
      data-elem-id={`card-svc-faq-${i}`}
      data-elem-type="card"
      className={`glass-card hover-card rounded-2xl border scroll-anim overflow-hidden ${
        isVisible ? "visible" : ""
      } ${open ? "border-cyan-500/40" : "border-cyan-500/15 hover:border-cyan-500/30"}`}
    >
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left group"
      >
        <span className={`font-semibold transition-colors ${open ? "text-cyan-400" : "text-white group-hover:text-cyan-400"}`}>
          {f.question}
        </span>
        <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
          open ? "bg-cyan-500 rotate-45" : "bg-cyan-500/10 border border-cyan-500/20"
        }`}>
          <Icon name="Plus" size={15} className={open ? "text-[#080c14]" : "text-cyan-400"} />
        </div>
      </button>
      <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pt-0 text-gray-400 leading-relaxed text-sm border-t border-white/5">
            <p className="pt-4">{f.answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AnimateOnScroll({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`scroll-anim ${className} ${isVisible ? "visible" : ""}`}
    >
      {children}
    </div>
  );
}
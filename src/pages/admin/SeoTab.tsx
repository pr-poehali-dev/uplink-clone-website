import { useState } from "react";
import Icon from "@/components/ui/icon";
import { KeywordsSection } from "./SeoKeywordsSection";
import { AuditSection } from "./SeoAuditSection";
import { MassSection } from "./SeoMassSection";

interface Props {
  token: string;
}

export function SeoTab({ token }: Props) {
  const [activeSection, setActiveSection] = useState<"keywords" | "audit" | "mass">("keywords");

  const sections = [
    { id: "keywords" as const, label: "Семантическое ядро", icon: "Tag" },
    { id: "audit" as const, label: "Аудит страниц", icon: "Search" },
    { id: "mass" as const, label: "Массовая оптимизация", icon: "Zap" },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <Icon name="TrendingUp" size={20} className="text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white font-['Oswald']">SEO-оптимизация</h2>
          <p className="text-gray-500 text-xs">Семантическое ядро, аудит страниц и ИИ-генерация</p>
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeSection === s.id
                ? "bg-green-500/20 text-green-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Icon name={s.icon as "Tag"} size={14} />
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === "keywords" && <KeywordsSection token={token} />}
      {activeSection === "audit" && <AuditSection token={token} />}
      {activeSection === "mass" && <MassSection token={token} />}
    </div>
  );
}

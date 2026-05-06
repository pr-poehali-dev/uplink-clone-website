import { useState } from "react";
import { CmsService, CmsSettings, CmsContent } from "@/hooks/useCmsContent";
import Icon from "@/components/ui/icon";
import { SaveFn } from "./AdminShared";
import { getStoredToken } from "@/hooks/useAdminAuth";
import { QuickAuditBadge } from "./QuickAuditBadge";
import { ServiceSectionsEditor } from "./ServiceSectionsEditor";
import { ServiceInfoEditor } from "./ServiceInfoEditor";
import { BenefitsEditor, StepsEditor, ServiceFaqEditor } from "./ServiceExtrasEditor";
import { CalculatorTab } from "./CalculatorTab";
import { VideoCalcTab } from "./VideoCalcTab";

interface Props {
  service: CmsService;
  save: SaveFn;
  saving: boolean;
  settings?: CmsSettings;
  content?: CmsContent;
  password?: string;
}

export function ServicePageEditor({ service, save, saving, settings, content, password }: Props) {
  const hasCalc = service.slug === "it-outsourcing";
  const hasVideoCalc = service.slug === "video-surveillance";
  const showCalcTab = hasCalc || hasVideoCalc;

  const [tab, setTab] = useState<"sections" | "info" | "benefits" | "steps" | "faq" | "calculator">("sections");

  const subTabs: { id: typeof tab; label: string; icon: string }[] = [
    { id: "sections", label: "Секции", icon: "Layers" },
    { id: "info", label: "Контент страницы", icon: "FileText" },
    { id: "benefits", label: "Преимущества", icon: "Sparkles" },
    { id: "steps", label: "Этапы", icon: "Workflow" },
    { id: "faq", label: "FAQ", icon: "HelpCircle" },
    ...(showCalcTab ? [{ id: "calculator" as const, label: "Калькулятор", icon: "Calculator" }] : []),
  ];

  return (
    <div className="mt-6 pt-6 border-t border-cyan-500/15">
      <div className="relative flex items-center gap-2 mb-1">
        <Icon name="LayoutGrid" size={16} className="text-cyan-400" />
        <h4 className="text-white font-bold font-['Oswald']">Страница услуги</h4>
        {service.slug && (
          <a
            href={`/services/${service.slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
          >
            <Icon name="ExternalLink" size={12} />
            Открыть страницу
          </a>
        )}
        <button
          onClick={() => save("save_service", { service: { ...service, page_visible: service.page_visible === false ? true : false }, order: [] })}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
            service.page_visible !== false
              ? "bg-green-500/15 text-green-400 border-green-500/25 hover:bg-green-500/25"
              : "bg-gray-500/15 text-gray-400 border-gray-500/25 hover:bg-gray-500/25"
          }`}
        >
          <Icon name={service.page_visible !== false ? "Eye" : "EyeOff"} size={12} />
          {service.page_visible !== false ? "Опубликована" : "Скрыта"}
        </button>
        <QuickAuditBadge slug={service.slug || ""} token={getStoredToken()} />
      </div>
      {!service.slug && (
        <p className="text-amber-400/80 text-xs mb-3 flex items-start gap-1.5">
          <Icon name="AlertTriangle" size={12} className="mt-0.5 flex-shrink-0" />
          Не задан slug — страница не будет доступна. Заполните поле slug ниже.
        </p>
      )}

      <div className="flex flex-wrap gap-1 mb-4 bg-white/5 rounded-xl p-1">
        {subTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              tab === t.id
                ? "bg-cyan-500/20 text-cyan-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Icon name={t.icon as "FileText"} size={12} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "sections" && <ServiceSectionsEditor service={service} settings={settings ?? {}} save={save} saving={saving} />}
      {tab === "info" && <ServiceInfoEditor service={service} save={save} saving={saving} />}
      {tab === "benefits" && <BenefitsEditor service={service} save={save} saving={saving} />}
      {tab === "steps" && <StepsEditor service={service} save={save} saving={saving} />}
      {tab === "faq" && <ServiceFaqEditor service={service} save={save} saving={saving} />}
      {tab === "calculator" && content && hasCalc && (
        <CalculatorTab content={content} save={save} saving={saving} />
      )}
      {tab === "calculator" && content && hasVideoCalc && (
        <VideoCalcTab content={content} password={password ?? ""} save={save} saving={saving} />
      )}
    </div>
  );
}

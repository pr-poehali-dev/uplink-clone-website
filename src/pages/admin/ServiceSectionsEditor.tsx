import { useState, useEffect } from "react";
import { CmsService, CmsSettings } from "@/hooks/useCmsContent";
import { SaveFn } from "./AdminShared";
import Icon from "@/components/ui/icon";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  service: CmsService;
  settings: CmsSettings;
  save: SaveFn;
  saving: boolean;
}

interface SectionMeta {
  id: string;
  label: string;
  desc: string;
  icon: string;
  alwaysOn?: boolean;
  requiresData?: boolean;
  calcOnly?: "it-outsourcing" | "video-surveillance";
}

const SERVICE_SECTIONS: SectionMeta[] = [
  { id: "description", label: "Описание + «Для кого»", desc: "Полное описание услуги и блок целевой аудитории", icon: "BookOpen", requiresData: true },
  { id: "benefits", label: "Преимущества", desc: "Карточки с преимуществами компании", icon: "Sparkles", requiresData: true },
  { id: "steps", label: "Этапы работы", desc: "Шаги процесса сотрудничества", icon: "Workflow", requiresData: true },
  { id: "faq", label: "FAQ", desc: "Часто задаваемые вопросы по услуге", icon: "HelpCircle", requiresData: true },
  { id: "cta", label: "CTA-блок", desc: "Призыв к действию — «Оставить заявку»", icon: "Send", alwaysOn: true },
  { id: "other", label: "Другие услуги", desc: "Блок с похожими услугами компании", icon: "Grid" },
  { id: "calculator", label: "Калькулятор", desc: "Калькулятор стоимости (только для IT-аутсорсинга и видеонаблюдения)", icon: "Calculator" },
];

function sectionKey(slug: string, id: string, type: "visible" | "order") {
  return `service_${slug}_section_${type === "order" ? "order" : id + "_visible"}`;
}

function parseOrder(val: string | undefined, defaults: string[]): string[] {
  if (!val) return defaults;
  const parts = val.split(",").map((s) => s.trim()).filter(Boolean);
  const valid = parts.filter((p) => defaults.includes(p));
  const missing = defaults.filter((d) => !valid.includes(d));
  return [...valid, ...missing];
}

function SortableRow({
  section,
  visible,
  onToggle,
}: {
  section: SectionMeta;
  visible: boolean;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${visible ? "bg-white/5 border-white/10" : "bg-white/[0.02] border-white/5 opacity-60"}`}>
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
      >
        <Icon name="GripVertical" size={14} />
      </button>

      {/* Icon */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${visible ? "bg-cyan-500/20" : "bg-white/5"}`}>
        <Icon name={section.icon as "Send"} size={15} className={visible ? "text-cyan-400" : "text-gray-600"} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${visible ? "text-white" : "text-gray-500"}`}>{section.label}</span>
          {section.alwaysOn && (
            <span className="text-xs text-gray-600 border border-white/10 rounded px-1.5 py-0.5">всегда</span>
          )}
          {section.requiresData && (
            <span className="text-xs text-gray-600 border border-white/10 rounded px-1.5 py-0.5">нужны данные</span>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-0.5">{section.desc}</p>
      </div>

      {/* Toggle */}
      {!section.alwaysOn ? (
        <button
          onClick={onToggle}
          className={`relative w-10 h-5 rounded-full transition-all flex-shrink-0 ${visible ? "bg-cyan-500" : "bg-white/10"}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${visible ? "left-5" : "left-0.5"}`} />
        </button>
      ) : (
        <div className="w-10 flex-shrink-0 flex justify-center">
          <Icon name="Eye" size={14} className="text-gray-600" />
        </div>
      )}
    </div>
  );
}

export function ServiceSectionsEditor({ service, settings, save, saving }: Props) {
  const slug = service.slug || "";
  const defaultOrder = SERVICE_SECTIONS.map((s) => s.id);

  const [order, setOrder] = useState<string[]>(defaultOrder);
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const orderVal = settings[sectionKey(slug, "", "order")];
    setOrder(parseOrder(orderVal, defaultOrder));

    const vis: Record<string, boolean> = {};
    for (const s of SERVICE_SECTIONS) {
      const key = sectionKey(slug, s.id, "visible");
      vis[s.id] = settings[key] !== "false";
    }
    setVisible(vis);
  }, [service.slug, settings]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setOrder((prev) => {
      const from = prev.indexOf(String(active.id));
      const to = prev.indexOf(String(over.id));
      return arrayMove(prev, from, to);
    });
  };

  const toggleVisible = (id: string) => {
    setVisible((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = () => {
    const s: Record<string, string> = {};
    s[sectionKey(slug, "", "order")] = order.join(",");
    for (const id of defaultOrder) {
      s[sectionKey(slug, id, "visible")] = visible[id] === false ? "false" : "true";
    }
    save("save_settings", { settings: s });
  };

  const orderedSections = order
    .map((id) => SERVICE_SECTIONS.find((s) => s.id === id))
    .filter(Boolean) as SectionMeta[];

  if (!slug) {
    return (
      <div className="text-amber-400/80 text-sm flex items-center gap-2 py-4">
        <Icon name="AlertTriangle" size={14} />
        Сначала задайте slug услуги во вкладке «Контент страницы»
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-500 text-xs">
        Перетащите секции чтобы изменить порядок. Переключите тумблер чтобы скрыть секцию.
        Секции с пометкой «нужны данные» показываются только если контент заполнен.
      </p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {orderedSections.map((section) => (
              <SortableRow
                key={section.id}
                section={section}
                visible={visible[section.id] !== false}
                onToggle={() => toggleVisible(section.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-neon px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 disabled:opacity-60"
      >
        <Icon name="Save" size={16} />
        {saving ? "Сохраняю..." : "Сохранить секции"}
      </button>
    </div>
  );
}

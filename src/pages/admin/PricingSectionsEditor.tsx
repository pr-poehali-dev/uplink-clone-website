import { useState, useEffect } from "react";
import { CmsSettings } from "@/hooks/useCmsContent";
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
}

const PRICING_SECTIONS: SectionMeta[] = [
  { id: "hero", label: "Hero-заголовок", desc: "Бейдж, заголовок страницы и подзаголовок", icon: "Heading" },
  { id: "items", label: "Категории и прайс", desc: "Боковая панель категорий и список позиций", icon: "List", alwaysOn: true },
  { id: "info", label: "Блок «Как формируется цена»", desc: "Информационный блок в правой панели", icon: "Info" },
  { id: "cta", label: "CTA в боковой панели", desc: "Текст и кнопка «Получить расчёт»", icon: "MousePointerClick" },
];

const DEFAULT_ORDER = PRICING_SECTIONS.map((s) => s.id);

function parseOrder(val: string | undefined): string[] {
  if (!val) return DEFAULT_ORDER;
  const parts = val.split(",").map((s) => s.trim()).filter((s) => DEFAULT_ORDER.includes(s));
  const missing = DEFAULT_ORDER.filter((d) => !parts.includes(d));
  return [...parts, ...missing];
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
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
        visible ? "bg-white/5 border-white/10" : "bg-white/[0.02] border-white/5 opacity-60"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
      >
        <Icon name="GripVertical" size={14} />
      </button>

      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${visible ? "bg-cyan-500/20" : "bg-white/5"}`}>
        <Icon name={section.icon as "Info"} size={15} className={visible ? "text-cyan-400" : "text-gray-600"} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${visible ? "text-white" : "text-gray-500"}`}>{section.label}</span>
          {section.alwaysOn && (
            <span className="text-xs text-gray-600 border border-white/10 rounded px-1.5 py-0.5">всегда</span>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-0.5">{section.desc}</p>
      </div>

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

export function PricingSectionsEditor({ settings, save, saving }: Props) {
  const [order, setOrder] = useState<string[]>(DEFAULT_ORDER);
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOrder(parseOrder(settings.pricing_section_order));
    const vis: Record<string, boolean> = {};
    for (const s of PRICING_SECTIONS) {
      vis[s.id] = settings[`pricing_section_${s.id}_visible`] !== "false";
    }
    setVisible(vis);
  }, [settings]);

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
    const s: Record<string, string> = {
      pricing_section_order: order.join(","),
    };
    for (const id of DEFAULT_ORDER) {
      s[`pricing_section_${id}_visible`] = visible[id] === false ? "false" : "true";
    }
    save("save_settings", { settings: s });
  };

  const orderedSections = order
    .map((id) => PRICING_SECTIONS.find((s) => s.id === id))
    .filter(Boolean) as SectionMeta[];

  return (
    <div className="space-y-4 max-w-xl">
      <p className="text-gray-500 text-xs">
        Перетащите секции чтобы изменить порядок. Переключите тумблер чтобы скрыть секцию.
        Секция «Категории и прайс» скрыть нельзя — это основа страницы.
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

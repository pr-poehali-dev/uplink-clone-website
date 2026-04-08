import { useState, useEffect } from "react";
import { CmsContent } from "@/hooks/useCmsContent";
import { SaveButton, SaveFn } from "./AdminShared";
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

const SECTIONS_META: Record<string, { label: string; desc: string }> = {
  hero:       { label: "Главный экран",  desc: "Заголовок, описание, кнопки CTA" },
  services:   { label: "Услуги",         desc: "Карточки с перечнем услуг" },
  whyus:      { label: "Почему мы",      desc: "Преимущества и статистика" },
  pricing:    { label: "Тарифы",         desc: "Тарифные планы с ценами" },
  quickorder: { label: "Быстрый заказ",  desc: "Аккордеон с шагами заказа" },
  projects:   { label: "Проекты",        desc: "Кейсы и реализованные проекты" },
  team:       { label: "Наша команда",   desc: "История компании, подход и состав команды" },
  contacts:   { label: "Контакты",       desc: "Телефон, email, адрес" },
};

const DEFAULT_ORDER = ["hero", "services", "whyus", "pricing", "quickorder", "projects", "team", "contacts"];

function parseOrder(raw: string | undefined): string[] {
  if (!raw) return DEFAULT_ORDER;
  const parsed = raw.split(",").map((s) => s.trim()).filter((s) => s in SECTIONS_META);
  const missing = DEFAULT_ORDER.filter((s) => !parsed.includes(s));
  return [...parsed, ...missing];
}

interface SortableItemProps {
  id: string;
  isOn: boolean;
  onToggle: () => void;
}

function SortableItem({ id, isOn, onToggle }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };

  const meta = SECTIONS_META[id];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-4 rounded-xl border transition-colors select-none ${
        isDragging ? "shadow-2xl shadow-cyan-500/20 bg-[#0d1321] border-cyan-500/40" :
        isOn
          ? "bg-cyan-500/5 border-cyan-500/20"
          : "bg-white/3 border-white/5 opacity-50"
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-1 mr-2 text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <Icon name="GripVertical" size={16} />
      </button>

      {/* Info — click toggles visibility */}
      <div
        className="flex items-center gap-3 flex-1 cursor-pointer"
        onClick={onToggle}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isOn ? "bg-cyan-500/20" : "bg-white/5"}`}>
          <Icon name={isOn ? "Eye" : "EyeOff"} size={16} className={isOn ? "text-cyan-400" : "text-gray-500"} />
        </div>
        <div>
          <div className="text-white text-sm font-medium">{meta.label}</div>
          <div className="text-gray-500 text-xs">{meta.desc}</div>
        </div>
      </div>

      {/* Toggle switch — click toggles visibility */}
      <div
        className="cursor-pointer ml-3 flex-shrink-0"
        onClick={onToggle}
      >
        <div className={`w-10 h-5 rounded-full transition-all relative ${isOn ? "bg-cyan-500" : "bg-gray-700"}`}>
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${isOn ? "left-5" : "left-0.5"}`} />
        </div>
      </div>
    </div>
  );
}

export function SectionsTab({ content, save, saving }: { content: CmsContent; password: string; save: SaveFn; saving: boolean }) {
  const [order, setOrder] = useState<string[]>(DEFAULT_ORDER);
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOrder(parseOrder(content.settings["section_order"]));
    const vis: Record<string, boolean> = {};
    DEFAULT_ORDER.forEach((id) => {
      vis[id] = content.settings[`section_${id}_visible`] !== "false";
    });
    setVisible(vis);
  }, [content.settings]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOrder((prev) => {
        const oldIndex = prev.indexOf(String(active.id));
        const newIndex = prev.indexOf(String(over.id));
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const toggle = (id: string) => setVisible((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleSave = () => {
    const updates: Record<string, string> = {
      section_order: order.join(","),
    };
    DEFAULT_ORDER.forEach((id) => {
      updates[`section_${id}_visible`] = visible[id] ? "true" : "false";
    });
    save("save_settings", { updates });
  };

  const visibleCount = DEFAULT_ORDER.filter((id) => visible[id]).length;

  return (
    <div className="space-y-4">
      <div className="glass-card neon-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-white font-bold font-['Oswald'] text-lg">Секции сайта</h3>
            <p className="text-gray-500 text-sm mt-0.5">
              Показано {visibleCount} из {DEFAULT_ORDER.length} · перетащите для смены порядка
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs">
            <Icon name="GripVertical" size={12} />
            Drag &amp; drop
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={order} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {order.map((id) => (
                <SortableItem
                  key={id}
                  id={id}
                  isOn={visible[id] ?? true}
                  onToggle={() => toggle(id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <SaveButton onClick={handleSave} saving={saving} />
    </div>
  );
}
import { useState, useEffect } from "react";
import { CmsContent, CmsFaqItem } from "@/hooks/useCmsContent";
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

function SortableFaqItem({
  item,
  isSelected,
  onClick,
}: {
  item: CmsFaqItem;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-1">
      <button
        {...attributes}
        {...listeners}
        className="p-1 text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <Icon name="GripVertical" size={14} />
      </button>
      <button
        onClick={onClick}
        className={`flex-1 text-left px-2 py-2 rounded-xl text-sm transition-all truncate ${
          isSelected
            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
            : item.is_active
            ? "text-gray-400 hover:text-white hover:bg-white/5"
            : "text-gray-600 hover:text-gray-400 hover:bg-white/5 line-through"
        }`}
      >
        {item.question}
      </button>
    </div>
  );
}

export function FaqTab({ content, save, saving }: { content: CmsContent; password: string; save: SaveFn; saving: boolean }) {
  const [selected, setSelected] = useState<CmsFaqItem | null>(null);
  const [order, setOrder] = useState<number[]>([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setOrder(content.faq.map((f) => f.id));
    if (content.faq.length && !selected) setSelected({ ...content.faq[0] });
  }, [content.faq]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOrder((prev) => {
        const oldIndex = prev.indexOf(Number(active.id));
        const newIndex = prev.indexOf(Number(over.id));
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const orderedFaq = order
    .map((id) => content.faq.find((f) => f.id === id))
    .filter(Boolean) as CmsFaqItem[];

  const handleSave = () => {
    if (!selected) return;
    const itemWithOrder = { ...selected, sort_order: order.indexOf(selected.id) + 1 };
    const orderUpdates = order.map((id, idx) => ({ id, sort_order: idx + 1 }));
    save("save_faq", { item: itemWithOrder, order: orderUpdates });
  };

  const handleAdd = () => save("add_faq", {});

  const handleDelete = async () => {
    if (!selected || !confirm(`Удалить вопрос «${selected.question}»?`)) return;
    setDeleting(true);
    await save("delete_faq", { id: selected.id });
    setSelected(null);
    setDeleting(false);
  };

  return (
    <div className="flex gap-4">
      <div className="w-56 flex-shrink-0 space-y-1">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={order} strategy={verticalListSortingStrategy}>
            {orderedFaq.map((f) => (
              <SortableFaqItem
                key={f.id}
                item={f}
                isSelected={selected?.id === f.id}
                onClick={() => setSelected({ ...f })}
              />
            ))}
          </SortableContext>
        </DndContext>
        <button
          onClick={handleAdd}
          disabled={saving}
          className="w-full flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-cyan-400 border border-dashed border-cyan-500/30 hover:bg-cyan-500/5 transition-all disabled:opacity-50 mt-1"
        >
          <Icon name="Plus" size={14} />Добавить
        </button>
      </div>

      <div className="flex-1 glass-card neon-border rounded-2xl p-6 space-y-4">
        {!selected ? (
          <p className="text-gray-500 text-sm">Выберите вопрос</p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold font-['Oswald'] text-lg">Редактирование вопроса</h3>
              <button
                onClick={handleDelete}
                disabled={deleting || saving}
                className="flex items-center gap-1.5 text-red-400 text-xs hover:text-red-300 transition-colors disabled:opacity-50"
              >
                <Icon name="Trash2" size={13} />Удалить
              </button>
            </div>

            <div>
              <label className="block text-gray-400 text-xs mb-1">Вопрос</label>
              <input
                value={selected.question}
                onChange={(e) => setSelected({ ...selected, question: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs mb-1">Ответ</label>
              <textarea
                value={selected.answer}
                onChange={(e) => setSelected({ ...selected, answer: e.target.value })}
                rows={5}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="faq_active"
                checked={selected.is_active}
                onChange={(e) => setSelected({ ...selected, is_active: e.target.checked })}
                className="accent-cyan-400"
              />
              <label htmlFor="faq_active" className="text-gray-400 text-sm">Показывать на сайте</label>
            </div>

            <SaveButton onClick={handleSave} saving={saving} />
          </>
        )}
      </div>
    </div>
  );
}

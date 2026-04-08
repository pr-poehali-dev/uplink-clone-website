import { useState, useEffect, useRef } from "react";
import { CmsContent, CmsProject, CmsTeamMember } from "@/hooks/useCmsContent";
import { SaveButton, SaveFn } from "./AdminShared";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";
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

const UPLOAD_URL: string = (func2url as Record<string, string>)["upload-photo"] ?? "";

// ---- GENERIC SORTABLE SIDEBAR ITEM ----
function SortableSidebarItem({
  id,
  label,
  isSelected,
  onClick,
}: {
  id: number;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

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
            : "text-gray-400 hover:text-white hover:bg-white/5"
        }`}
      >
        {label}
      </button>
    </div>
  );
}

// ---- PROJECTS TAB ----
export function ProjectsTab({ content, save, saving }: { content: CmsContent; password: string; save: SaveFn; saving: boolean }) {
  const [selected, setSelected] = useState<CmsProject | null>(null);
  const [order, setOrder] = useState<number[]>([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setOrder(content.projects.map((p) => p.id));
    if (content.projects.length && !selected) setSelected(content.projects[0]);
  }, [content.projects]);

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

  const orderedProjects = order
    .map((id) => content.projects.find((p) => p.id === id))
    .filter(Boolean) as CmsProject[];

  const handleSave = () => {
    if (!selected) return;
    const projectWithOrder = { ...selected, sort_order: order.indexOf(selected.id) + 1 };
    const orderUpdates = order.map((id, idx) => ({ id, sort_order: idx + 1 }));
    save("save_project", { project: projectWithOrder, order: orderUpdates });
  };

  const handleAdd = () => save("add_project", {});

  const handleDelete = async () => {
    if (!selected || !confirm(`Удалить проект «${selected.client}»?`)) return;
    setDeleting(true);
    await save("delete_project", { id: selected.id });
    setSelected(null);
    setDeleting(false);
  };

  return (
    <div className="flex gap-4">
      <div className="w-52 flex-shrink-0 space-y-1">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={order} strategy={verticalListSortingStrategy}>
            {orderedProjects.map((p) => (
              <SortableSidebarItem
                key={p.id}
                id={p.id}
                label={p.client}
                isSelected={selected?.id === p.id}
                onClick={() => setSelected({ ...p })}
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
          <p className="text-gray-500 text-sm">Выберите проект</p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold font-['Oswald'] text-lg">Редактирование проекта</h3>
              <button
                onClick={handleDelete}
                disabled={deleting || saving}
                className="flex items-center gap-1.5 text-red-400 text-xs hover:text-red-300 transition-colors disabled:opacity-50"
              >
                <Icon name="Trash2" size={13} />Удалить
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 text-xs mb-1">Клиент</label>
                <input value={selected.client} onChange={(e) => setSelected({ ...selected, client: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Категория</label>
                <input value={selected.category} onChange={(e) => setSelected({ ...selected, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Описание</label>
              <textarea value={selected.description} onChange={(e) => setSelected({ ...selected, description: e.target.value })}
                rows={3} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all resize-none" />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Результат</label>
              <input value={selected.result || ""} onChange={(e) => setSelected({ ...selected, result: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-2">Метрики проекта</label>
              <div className="space-y-2">
                {selected.metrics.filter((m) => m.label !== "[удалено]").map((m, idx) => (
                  <div key={m.id} className="flex gap-2">
                    <input value={m.value} placeholder="Значение"
                      onChange={(e) => {
                        const metrics = [...selected.metrics];
                        metrics[idx] = { ...m, value: e.target.value };
                        setSelected({ ...selected, metrics });
                      }}
                      className="w-24 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
                    <input value={m.label} placeholder="Подпись"
                      onChange={(e) => {
                        const metrics = [...selected.metrics];
                        metrics[idx] = { ...m, label: e.target.value };
                        setSelected({ ...selected, metrics });
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="proj_active" checked={selected.is_active}
                onChange={(e) => setSelected({ ...selected, is_active: e.target.checked })} className="accent-cyan-400" />
              <label htmlFor="proj_active" className="text-gray-400 text-sm">Показывать на сайте</label>
            </div>
            <SaveButton onClick={handleSave} saving={saving} />
          </>
        )}
      </div>
    </div>
  );
}

// ---- TEAM TAB ----
export function TeamTab({ content, password, save, saving }: { content: CmsContent; password: string; save: SaveFn; saving: boolean }) {
  const [selected, setSelected] = useState<CmsTeamMember | null>(null);
  const [teamOrder, setTeamOrder] = useState<number[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTeamOrder(content.team.map((m) => m.id));
    if (content.team.length && !selected) setSelected(content.team[0]);
  }, [content.team]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTeamOrder((prev) => {
        const oldIndex = prev.indexOf(Number(active.id));
        const newIndex = prev.indexOf(Number(over.id));
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const orderedTeam = teamOrder
    .map((id) => content.team.find((m) => m.id === id))
    .filter(Boolean) as CmsTeamMember[];

  const handleSave = () => {
    if (!selected) return;
    const memberWithOrder = { ...selected, sort_order: teamOrder.indexOf(selected.id) + 1 };
    const orderUpdates = teamOrder.map((id, idx) => ({ id, sort_order: idx + 1 }));
    save("save_team", { member: memberWithOrder, order: orderUpdates });
  };

  const handleAdd = () => save("add_team_member", {});

  const handleDelete = async () => {
    if (!selected || !confirm(`Удалить сотрудника «${selected.name}»?`)) return;
    setDeleting(true);
    await save("delete_team_member", { id: selected.id });
    setSelected(null);
    setDeleting(false);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selected) return;
    setUploadError("");
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      const r = await fetch(UPLOAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, file_base64: base64, file_name: file.name }),
      });
      setUploading(false);
      if (r.ok) {
        const data = await r.json();
        setSelected({ ...selected, photo_url: data.url });
      } else {
        const data = await r.json();
        setUploadError(data.error ?? "Ошибка загрузки");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="flex gap-4">
      <div className="w-52 flex-shrink-0 space-y-1">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={teamOrder} strategy={verticalListSortingStrategy}>
            {orderedTeam.map((m) => (
              <SortableSidebarItem
                key={m.id}
                id={m.id}
                label={m.name}
                isSelected={selected?.id === m.id}
                onClick={() => { setSelected({ ...m }); setUploadError(""); }}
              />
            ))}
          </SortableContext>
        </DndContext>
        <button onClick={handleAdd} disabled={saving}
          className="w-full flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-cyan-400 border border-dashed border-cyan-500/30 hover:bg-cyan-500/5 transition-all disabled:opacity-50 mt-1">
          <Icon name="Plus" size={14} />Добавить
        </button>
      </div>

      <div className="flex-1 glass-card neon-border rounded-2xl p-6 space-y-4">
        {!selected ? (
          <p className="text-gray-500 text-sm">Выберите сотрудника</p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold font-['Oswald'] text-lg">Редактирование сотрудника</h3>
              <button onClick={handleDelete} disabled={deleting || saving}
                className="flex items-center gap-1.5 text-red-400 text-xs hover:text-red-300 transition-colors disabled:opacity-50">
                <Icon name="Trash2" size={13} />Удалить
              </button>
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-2">Фото</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {selected.photo_url
                    ? <img src={selected.photo_url} alt={selected.name} className="w-full h-full object-cover" />
                    : <Icon name="User" size={32} className="text-gray-600" />
                  }
                </div>
                <div className="space-y-2">
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-all disabled:opacity-50">
                    {uploading
                      ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Загрузка...</>
                      : <><Icon name="Upload" size={14} />Загрузить фото</>
                    }
                  </button>
                  {selected.photo_url && (
                    <button type="button" onClick={() => setSelected({ ...selected, photo_url: null })}
                      className="flex items-center gap-1.5 text-red-400 text-xs hover:text-red-300 transition-colors">
                      <Icon name="Trash2" size={12} />Удалить фото
                    </button>
                  )}
                  {uploadError && <p className="text-red-400 text-xs">{uploadError}</p>}
                  <p className="text-gray-600 text-xs">JPG, PNG, WEBP · до 5 МБ</p>
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Имя</label>
              <input value={selected.name} onChange={(e) => setSelected({ ...selected, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Должность</label>
              <input value={selected.position} onChange={(e) => setSelected({ ...selected, position: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Опыт</label>
              <input value={selected.experience || ""} onChange={(e) => setSelected({ ...selected, experience: e.target.value })}
                placeholder="Например: 10 лет опыта"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="team_active" checked={selected.is_active}
                onChange={(e) => setSelected({ ...selected, is_active: e.target.checked })} className="accent-cyan-400" />
              <label htmlFor="team_active" className="text-gray-400 text-sm">Показывать на сайте</label>
            </div>
            <SaveButton onClick={handleSave} saving={saving} />
          </>
        )}
      </div>
    </div>
  );
}

// ---- PASSWORD TAB ----
export function PasswordTab({ password, setPassword, save, saving }: { password: string; setPassword: (p: string) => void; save: SaveFn; saving: boolean }) {
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (newPwd.length < 6) { setError("Минимум 6 символов"); return; }
    if (newPwd !== confirmPwd) { setError("Пароли не совпадают"); return; }
    setError("");
    save("save_password", { new_password: newPwd });
    setPassword(newPwd);
    setNewPwd("");
    setConfirmPwd("");
  };

  return (
    <div className="glass-card neon-border rounded-2xl p-6 max-w-md space-y-4">
      <h3 className="text-white font-bold font-['Oswald'] text-lg">Изменить пароль</h3>
      <div>
        <label className="block text-gray-400 text-xs mb-1">Новый пароль</label>
        <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
      </div>
      <div>
        <label className="block text-gray-400 text-xs mb-1">Повторите пароль</label>
        <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <SaveButton onClick={handleSave} saving={saving} />
    </div>
  );
}

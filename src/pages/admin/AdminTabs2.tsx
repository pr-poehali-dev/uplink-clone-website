import { useState, useEffect, useRef } from "react";
import { CmsContent, CmsProject, CmsTeamMember } from "@/hooks/useCmsContent";
import { SaveButton, SaveFn } from "./AdminShared";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";

const UPLOAD_URL: string = (func2url as Record<string, string>)["upload-photo"] ?? "";

// ---- PROJECTS TAB ----
export function ProjectsTab({ content, save, saving }: { content: CmsContent; password: string; save: SaveFn; saving: boolean }) {
  const [selected, setSelected] = useState<CmsProject | null>(null);

  useEffect(() => {
    if (content.projects.length && !selected) setSelected(content.projects[0]);
  }, [content.projects]);

  const handleSave = () => selected && save("save_project", { project: selected });

  if (!selected) return null;

  return (
    <div className="flex gap-4">
      <div className="w-48 flex-shrink-0 space-y-1">
        {content.projects.map((p) => (
          <button key={p.id} onClick={() => setSelected({ ...p })}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${selected.id === p.id ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
            {p.client}
          </button>
        ))}
      </div>
      <div className="flex-1 glass-card neon-border rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-bold font-['Oswald'] text-lg">Редактирование проекта</h3>
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
            {selected.metrics.filter(m => m.label !== "[удалено]").map((m, idx) => (
              <div key={m.id} className="flex gap-2">
                <input value={m.value} placeholder="Значение" onChange={(e) => {
                  const metrics = [...selected.metrics];
                  metrics[idx] = { ...m, value: e.target.value };
                  setSelected({ ...selected, metrics });
                }} className="w-24 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
                <input value={m.label} placeholder="Подпись" onChange={(e) => {
                  const metrics = [...selected.metrics];
                  metrics[idx] = { ...m, label: e.target.value };
                  setSelected({ ...selected, metrics });
                }} className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="proj_active" checked={selected.is_active} onChange={(e) => setSelected({ ...selected, is_active: e.target.checked })} className="accent-cyan-400" />
          <label htmlFor="proj_active" className="text-gray-400 text-sm">Показывать на сайте</label>
        </div>
        <SaveButton onClick={handleSave} saving={saving} />
      </div>
    </div>
  );
}

// ---- TEAM TAB ----
export function TeamTab({ content, password, save, saving }: { content: CmsContent; password: string; save: SaveFn; saving: boolean }) {
  const [selected, setSelected] = useState<CmsTeamMember | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (content.team.length && !selected) setSelected(content.team[0]);
  }, [content.team]);

  const handleSave = () => selected && save("save_team", { member: selected });

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
      <div className="w-48 flex-shrink-0 space-y-1">
        {content.team.map((m) => (
          <button key={m.id} onClick={() => { setSelected({ ...m }); setUploadError(""); }}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${selected?.id === m.id ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
            {m.name}
          </button>
        ))}
        <button onClick={handleAdd} disabled={saving}
          className="w-full flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-cyan-400 border border-dashed border-cyan-500/30 hover:bg-cyan-500/5 transition-all disabled:opacity-50 mt-2">
          <Icon name="Plus" size={14} />Добавить
        </button>
      </div>
      <div className="flex-1 glass-card neon-border rounded-2xl p-6 space-y-4">
        {!selected ? (
          <p className="text-gray-500 text-sm">Выберите сотрудника</p>
        ) : (<>
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
              <button type="button" onClick={() => fileRef.current?.click()}
                disabled={uploading}
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
          <input type="checkbox" id="team_active" checked={selected.is_active} onChange={(e) => setSelected({ ...selected, is_active: e.target.checked })} className="accent-cyan-400" />
          <label htmlFor="team_active" className="text-gray-400 text-sm">Показывать на сайте</label>
        </div>
        <SaveButton onClick={handleSave} saving={saving} />
        </>)}
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
import { useState, useEffect } from "react";
import { CmsContent, CmsProject, CmsTeamMember } from "@/hooks/useCmsContent";
import { SaveButton, SaveFn } from "./AdminShared";

// ---- PROJECTS TAB ----
export function ProjectsTab({ content, save, saving }: { content: CmsContent; password: string; save: SaveFn; saving: boolean }) {
  const [selected, setSelected] = useState<CmsProject | null>(null);

  useEffect(() => {
    if (content.projects.length && !selected) setSelected(content.projects[0]);
  }, [content.projects]);

  const handleSave = () => selected && save("/save/project", { project: selected });

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
export function TeamTab({ content, save, saving }: { content: CmsContent; password: string; save: SaveFn; saving: boolean }) {
  const [selected, setSelected] = useState<CmsTeamMember | null>(null);

  useEffect(() => {
    if (content.team.length && !selected) setSelected(content.team[0]);
  }, [content.team]);

  const handleSave = () => selected && save("/save/team", { member: selected });

  if (!selected) return null;

  return (
    <div className="flex gap-4">
      <div className="w-48 flex-shrink-0 space-y-1">
        {content.team.map((m) => (
          <button key={m.id} onClick={() => setSelected({ ...m })}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${selected.id === m.id ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
            {m.name}
          </button>
        ))}
      </div>
      <div className="flex-1 glass-card neon-border rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-bold font-['Oswald'] text-lg">Редактирование сотрудника</h3>
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
    save("/save/password", { new_password: newPwd });
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

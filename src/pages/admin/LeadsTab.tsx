import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { CmsLead } from "@/hooks/useCmsContent";

interface LeadsTabProps {
  password: string;
  cmsApiUrl: string;
}

export function LeadsTab({ password, cmsApiUrl }: LeadsTabProps) {
  const [leads, setLeads] = useState<CmsLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [filterService, setFilterService] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch(cmsApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_leads", password }),
    });
    const data = await r.json();
    setLeads(data.leads ?? []);
    setLoading(false);
  }, [cmsApiUrl, password]);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id: number) => {
    setActionId(id);
    await fetch(cmsApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_lead_read", password, id }),
    });
    setLeads(prev => prev.map(l => l.id === id ? { ...l, is_read: true } : l));
    setActionId(null);
  };

  const deleteLead = async (id: number) => {
    if (!confirm("Удалить заявку?")) return;
    setActionId(id);
    await fetch(cmsApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_lead", password, id }),
    });
    setLeads(prev => prev.filter(l => l.id !== id));
    setActionId(null);
  };

  const services = Array.from(new Set(leads.map(l => l.service).filter(Boolean)));
  const filtered = filterService ? leads.filter(l => l.service === filterService) : leads;
  const unread = leads.filter(l => !l.is_read).length;

  const fmt = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
    } catch { return iso; }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white font-['Oswald']">Заявки с сайта</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Всего: {leads.length} &nbsp;|&nbsp;
            <span className="text-cyan-400 font-semibold">Новых: {unread}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {services.length > 0 && (
            <select
              value={filterService}
              onChange={e => setFilterService(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
            >
              <option value="">Все услуги</option>
              {services.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white text-sm flex items-center gap-1.5 transition-colors"
          >
            <Icon name="RefreshCw" size={14} className={loading ? "animate-spin" : ""} />
            Обновить
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Загрузка...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Icon name="Inbox" size={40} className="mx-auto mb-3 opacity-30" />
          <p>Заявок пока нет</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(lead => (
            <div
              key={lead.id}
              className={`glass-card rounded-2xl p-5 border transition-all ${!lead.is_read ? "border-cyan-500/30 bg-cyan-500/5" : "border-white/10"}`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {!lead.is_read && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-semibold">Новая</span>
                  )}
                  <span className="text-xs text-gray-500">{fmt(lead.created_at)}</span>
                  {lead.source && <span className="text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">{lead.source}</span>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!lead.is_read && (
                    <button
                      onClick={() => markRead(lead.id)}
                      disabled={actionId === lead.id}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors"
                    >
                      Прочитано
                    </button>
                  )}
                  <button
                    onClick={() => deleteLead(lead.id)}
                    disabled={actionId === lead.id}
                    className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-500">Имя: </span><span className="text-white font-semibold">{lead.name}</span></div>
                <div><span className="text-gray-500">Телефон: </span><a href={`tel:${lead.phone}`} className="text-cyan-400 hover:underline font-semibold">{lead.phone}</a></div>
                {lead.email && <div><span className="text-gray-500">Email: </span><a href={`mailto:${lead.email}`} className="text-cyan-400 hover:underline">{lead.email}</a></div>}
                {lead.service && <div><span className="text-gray-500">Услуга: </span><span className="text-gray-300">{lead.service}</span></div>}
              </div>
              {lead.message && (
                <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-xs text-gray-500 mb-1">Комментарий</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{lead.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

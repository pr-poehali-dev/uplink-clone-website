import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

const SEO_API_URL = "https://functions.poehali.dev/39397936-5e11-4d76-9565-841faeb422e3";

interface SeoKeyword {
  id: number;
  keyword: string;
  page_slug: string | null;
  page_type: string;
  priority: "high" | "medium" | "low";
  search_volume_hint: string | null;
  is_active: boolean;
  sort_order: number;
}

interface AuditIssue {
  type: "error" | "warning" | "info";
  field: string;
  text: string;
}

interface AuditRec {
  priority: "high" | "medium" | "low";
  action: string;
  example?: string;
}

interface SeoAudit {
  page_slug: string;
  page_type: string;
  page_title: string;
  seo_score: number;
  issues: AuditIssue[];
  recommendations: AuditRec[];
  audited_at: string | null;
}

interface MassResult {
  id: number;
  slug: string;
  title: string;
  seo_title: string;
  seo_description: string;
  old_seo_title: string | null;
  old_seo_description: string | null;
  selected?: boolean;
}

interface Props {
  token: string;
}

function apiCall(token: string, body: object) {
  return fetch(SEO_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Admin-Token": token },
    body: JSON.stringify(body),
  }).then((r) => r.json());
}

const PRIORITY_LABELS: Record<string, { label: string; cls: string }> = {
  high: { label: "Высокий", cls: "bg-red-500/20 text-red-400 border-red-500/30" },
  medium: { label: "Средний", cls: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  low: { label: "Низкий", cls: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
};

const ISSUE_ICONS: Record<string, { icon: string; cls: string }> = {
  error: { icon: "XCircle", cls: "text-red-400" },
  warning: { icon: "AlertTriangle", cls: "text-amber-400" },
  info: { icon: "Info", cls: "text-blue-400" },
};

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? "text-green-400" : score >= 50 ? "text-amber-400" : "text-red-400";
  const bg = score >= 75 ? "bg-green-500/10 border-green-500/20" : score >= 50 ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-sm font-bold ${bg} ${color}`}>
      {score}/100
    </span>
  );
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

function KeywordsSection({ token }: Props) {
  const [keywords, setKeywords] = useState<SeoKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSlug, setFilterSlug] = useState<string>("all");
  const [generating, setGenerating] = useState(false);
  const [genTopic, setGenTopic] = useState("");
  const [genPageSlug, setGenPageSlug] = useState("");
  const [genResults, setGenResults] = useState<{ keyword: string; priority: string; search_volume_hint: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKw, setNewKw] = useState({ keyword: "", page_slug: "", priority: "medium", search_volume_hint: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const data = await apiCall(token, { action: "get_keywords" });
    setKeywords(data.keywords || []);
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const slugOptions = ["all", ...Array.from(new Set(keywords.map((k) => k.page_slug || "global")))];

  const filtered = filterSlug === "all"
    ? keywords
    : filterSlug === "global"
    ? keywords.filter((k) => !k.page_slug)
    : keywords.filter((k) => k.page_slug === filterSlug);

  const handleDelete = async (id: number) => {
    await apiCall(token, { action: "delete_keyword", id });
    setKeywords(keywords.filter((k) => k.id !== id));
  };

  const handleAddKw = async () => {
    if (!newKw.keyword.trim()) return;
    setSaving(true);
    const data = await apiCall(token, {
      action: "save_keyword",
      keyword: newKw.keyword.trim(),
      page_slug: newKw.page_slug || null,
      page_type: newKw.page_slug ? "service" : "global",
      priority: newKw.priority,
      search_volume_hint: newKw.search_volume_hint || null,
    });
    setSaving(false);
    if (data.ok) {
      setShowAddForm(false);
      setNewKw({ keyword: "", page_slug: "", priority: "medium", search_volume_hint: "" });
      load();
    }
  };

  const handleGenerate = async () => {
    if (!genTopic.trim() && !genPageSlug.trim()) return;
    setGenerating(true);
    setGenResults([]);
    const data = await apiCall(token, {
      action: "generate_keywords",
      topic: genTopic,
      page_slug: genPageSlug || undefined,
      page_title: genTopic,
    });
    setGenerating(false);
    if (data.keywords) setGenResults(data.keywords);
  };

  const handleSaveGenerated = async () => {
    if (!genResults.length) return;
    setSaving(true);
    await apiCall(token, {
      action: "bulk_save_keywords",
      keywords: genResults,
      page_slug: genPageSlug || null,
      page_type: genPageSlug ? "service" : "global",
    });
    setSaving(false);
    setGenResults([]);
    setGenTopic("");
    setGenPageSlug("");
    load();
  };

  return (
    <div className="space-y-6">
      {/* ИИ-генерация ядра */}
      <div className="bg-white/3 border border-green-500/20 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Sparkles" size={16} className="text-green-400" />
          <h3 className="text-white font-semibold text-sm">Генерация ключевых слов с помощью ИИ</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-gray-500 text-xs mb-1 block">Тема / услуга</label>
            <input
              value={genTopic}
              onChange={(e) => setGenTopic(e.target.value)}
              placeholder="IT-аутсорсинг, видеонаблюдение..."
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-green-500/50"
            />
          </div>
          <div>
            <label className="text-gray-500 text-xs mb-1 block">Привязать к slug (необязательно)</label>
            <input
              value={genPageSlug}
              onChange={(e) => setGenPageSlug(e.target.value)}
              placeholder="it-outsourcing"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-green-500/50"
            />
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating || (!genTopic.trim() && !genPageSlug.trim())}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium hover:bg-green-500/30 transition-all disabled:opacity-50"
        >
          {generating ? <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" /> : <Icon name="Sparkles" size={14} />}
          {generating ? "Генерирую..." : "Сгенерировать ядро"}
        </button>

        {genResults.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-xs">{genResults.length} ключевых фраз</span>
              <button
                onClick={handleSaveGenerated}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-medium hover:bg-green-500/30 transition-all disabled:opacity-50"
              >
                <Icon name="Save" size={12} />
                {saving ? "Сохраняю..." : "Сохранить все"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {genResults.map((kw, i) => (
                <span key={i} className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs ${PRIORITY_LABELS[kw.priority]?.cls || "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>
                  {kw.keyword}
                  {kw.search_volume_hint && <span className="opacity-60">· {kw.search_volume_hint}</span>}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Список ключей */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm">Семантическое ядро ({keywords.length} фраз)</h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-cyan-400 border border-dashed border-cyan-500/30 hover:bg-cyan-500/5"
          >
            <Icon name="Plus" size={12} />Добавить вручную
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-3 grid grid-cols-2 gap-2">
            <input
              value={newKw.keyword}
              onChange={(e) => setNewKw({ ...newKw, keyword: e.target.value })}
              placeholder="Ключевая фраза"
              className="col-span-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-green-500/50"
            />
            <input
              value={newKw.page_slug}
              onChange={(e) => setNewKw({ ...newKw, page_slug: e.target.value })}
              placeholder="slug (пусто = глобально)"
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-green-500/50"
            />
            <select
              value={newKw.priority}
              onChange={(e) => setNewKw({ ...newKw, priority: e.target.value })}
              className="px-3 py-2 rounded-xl bg-[#0d1420] border border-white/10 text-white text-sm focus:outline-none focus:border-green-500/50"
            >
              <option value="high">Высокий</option>
              <option value="medium">Средний</option>
              <option value="low">Низкий</option>
            </select>
            <input
              value={newKw.search_volume_hint}
              onChange={(e) => setNewKw({ ...newKw, search_volume_hint: e.target.value })}
              placeholder="Частотность (необяз.)"
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-green-500/50"
            />
            <div className="flex gap-2 col-span-2">
              <button onClick={handleAddKw} disabled={saving} className="btn-neon px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60">
                {saving ? "Сохраняю..." : "Сохранить"}
              </button>
              <button onClick={() => setShowAddForm(false)} className="px-4 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white">
                Отмена
              </button>
            </div>
          </div>
        )}

        {/* Фильтр по странице */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {slugOptions.map((slug) => (
            <button
              key={slug}
              onClick={() => setFilterSlug(slug)}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all ${filterSlug === slug ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-white/5 text-gray-500 hover:text-gray-300"}`}
            >
              {slug === "all" ? "Все" : slug === "global" ? "Глобальные" : slug}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-gray-500 text-sm text-center py-8">Загружаю...</div>
        ) : filtered.length === 0 ? (
          <div className="text-gray-600 text-sm text-center py-8 border border-dashed border-white/10 rounded-xl">
            Нет ключевых слов. Добавьте вручную или сгенерируйте с помощью ИИ.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filtered.map((kw) => (
              <div key={kw.id} className={`group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs ${PRIORITY_LABELS[kw.priority]?.cls || ""}`}>
                <span>{kw.keyword}</span>
                {kw.page_slug && <span className="opacity-50">· {kw.page_slug}</span>}
                {kw.search_volume_hint && <span className="opacity-50">· {kw.search_volume_hint}</span>}
                <button
                  onClick={() => handleDelete(kw.id)}
                  className="opacity-0 group-hover:opacity-100 ml-1 text-current hover:opacity-100 transition-opacity"
                >
                  <Icon name="X" size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AuditSection({ token }: Props) {
  const [audits, setAudits] = useState<SeoAudit[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [auditing, setAuditing] = useState<string | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<SeoAudit | null>(null);
  const [pageSlugInput, setPageSlugInput] = useState("");
  const [pageTypeInput, setPageTypeInput] = useState("service");

  const loadList = useCallback(async () => {
    setLoadingList(true);
    const data = await apiCall(token, { action: "get_audit_list" });
    setAudits(data.audits || []);
    setLoadingList(false);
  }, [token]);

  useEffect(() => { loadList(); }, [loadList]);

  const handleAudit = async () => {
    if (!pageSlugInput.trim()) return;
    setAuditing(pageSlugInput);
    const data = await apiCall(token, {
      action: "audit_page",
      page_slug: pageSlugInput.trim(),
      page_type: pageTypeInput,
    });
    setAuditing(null);
    if (data.ok && data.audit) {
      const newAudit: SeoAudit = {
        page_slug: pageSlugInput,
        page_type: pageTypeInput,
        page_title: data.page_title || pageSlugInput,
        seo_score: data.audit.score || 0,
        issues: data.audit.issues || [],
        recommendations: data.audit.recommendations || [],
        audited_at: new Date().toISOString(),
      };
      setSelectedAudit(newAudit);
      loadList();
    }
  };

  const avgScore = audits.length ? Math.round(audits.reduce((s, a) => s + a.seo_score, 0) / audits.length) : null;

  return (
    <div className="space-y-6">
      {/* Запуск аудита */}
      <div className="bg-white/3 border border-blue-500/20 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Search" size={16} className="text-blue-400" />
          <h3 className="text-white font-semibold text-sm">Запустить SEO-аудит страницы</h3>
        </div>
        <div className="grid grid-cols-[1fr_140px_auto] gap-2 items-end">
          <div>
            <label className="text-gray-500 text-xs mb-1 block">Slug страницы / услуги</label>
            <input
              value={pageSlugInput}
              onChange={(e) => setPageSlugInput(e.target.value)}
              placeholder="it-outsourcing"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <div>
            <label className="text-gray-500 text-xs mb-1 block">Тип</label>
            <select
              value={pageTypeInput}
              onChange={(e) => setPageTypeInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0d1420] border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50"
            >
              <option value="service">Услуга</option>
              <option value="page">Страница</option>
            </select>
          </div>
          <button
            onClick={handleAudit}
            disabled={!!auditing || !pageSlugInput.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-medium hover:bg-blue-500/30 transition-all disabled:opacity-50"
          >
            {auditing ? <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /> : <Icon name="Search" size={14} />}
            {auditing ? "Анализирую..." : "Анализ"}
          </button>
        </div>
      </div>

      {/* Среднее по сайту */}
      {avgScore !== null && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/3 border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-white mb-1">{avgScore}</div>
            <div className="text-gray-500 text-xs">Средний балл</div>
          </div>
          <div className="bg-white/3 border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">{audits.filter((a) => a.seo_score >= 75).length}</div>
            <div className="text-gray-500 text-xs">Хороших страниц</div>
          </div>
          <div className="bg-white/3 border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-red-400 mb-1">{audits.filter((a) => a.seo_score < 50).length}</div>
            <div className="text-gray-500 text-xs">Требуют работы</div>
          </div>
        </div>
      )}

      {/* Список аудитов */}
      <div>
        <h3 className="text-white font-semibold text-sm mb-3">Результаты аудита</h3>
        {loadingList ? (
          <div className="text-gray-500 text-sm text-center py-8">Загружаю...</div>
        ) : audits.length === 0 ? (
          <div className="text-gray-600 text-sm text-center py-8 border border-dashed border-white/10 rounded-xl">
            Аудиты ещё не проводились. Введите slug страницы выше и нажмите «Анализ».
          </div>
        ) : (
          <div className="space-y-2">
            {audits.map((a) => (
              <div
                key={a.page_slug}
                onClick={() => setSelectedAudit(selectedAudit?.page_slug === a.page_slug ? null : a)}
                className="bg-white/3 border border-white/10 rounded-xl p-3 cursor-pointer hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name={a.page_type === "service" ? "Briefcase" : "FileText"} size={14} className="text-gray-500" />
                    <span className="text-white text-sm font-medium">{a.page_title || a.page_slug}</span>
                    <span className="text-gray-600 text-xs">/{a.page_slug}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ScoreBadge score={a.seo_score} />
                    <Icon name={selectedAudit?.page_slug === a.page_slug ? "ChevronUp" : "ChevronDown"} size={14} className="text-gray-600" />
                  </div>
                </div>

                {selectedAudit?.page_slug === a.page_slug && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
                    {a.issues.length > 0 && (
                      <div>
                        <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Проблемы</div>
                        <div className="space-y-1.5">
                          {a.issues.map((issue, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <Icon name={ISSUE_ICONS[issue.type]?.icon as "XCircle"} size={14} className={`mt-0.5 flex-shrink-0 ${ISSUE_ICONS[issue.type]?.cls}`} />
                              <span className="text-gray-300">{issue.text}</span>
                              {issue.field && <span className="text-gray-600 text-xs ml-auto flex-shrink-0">{issue.field}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {a.recommendations.length > 0 && (
                      <div>
                        <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Рекомендации</div>
                        <div className="space-y-2">
                          {a.recommendations.map((rec, i) => (
                            <div key={i} className={`rounded-xl p-3 border ${PRIORITY_LABELS[rec.priority]?.cls || ""}`}>
                              <div className="text-sm font-medium mb-1">{rec.action}</div>
                              {rec.example && (
                                <div className="text-xs opacity-70 bg-black/20 rounded-lg px-2 py-1 font-mono">
                                  {rec.example}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {a.audited_at && (
                      <div className="text-gray-600 text-xs">
                        Аудит: {new Date(a.audited_at).toLocaleString("ru")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MassSection({ token }: Props) {
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<MassResult[]>([]);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    setResults([]);
    setApplied(false);
    const data = await apiCall(token, { action: "mass_generate_seo" });
    setGenerating(false);
    if (data.results) {
      setResults(data.results.map((r: MassResult) => ({ ...r, selected: true })));
    }
  };

  const toggleAll = (val: boolean) => setResults(results.map((r) => ({ ...r, selected: val })));

  const handleApply = async () => {
    const toApply = results.filter((r) => r.selected);
    if (!toApply.length) return;
    setApplying(true);
    await apiCall(token, {
      action: "apply_mass_seo",
      items: toApply.map((r) => ({ id: r.id, seo_title: r.seo_title, seo_description: r.seo_description })),
    });
    setApplying(false);
    setApplied(true);
  };

  const selectedCount = results.filter((r) => r.selected).length;

  return (
    <div className="space-y-6">
      <div className="bg-white/3 border border-amber-500/20 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="Zap" size={16} className="text-amber-400" />
          <h3 className="text-white font-semibold text-sm">Массовая ИИ-оптимизация всех услуг</h3>
        </div>
        <p className="text-gray-500 text-xs mb-4">
          ИИ сгенерирует SEO title и description для каждой услуги с учётом семантического ядра.
          Вы увидите превью и сможете выбрать, что применить.
        </p>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-semibold hover:bg-amber-500/30 transition-all disabled:opacity-50"
        >
          {generating ? <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" /> : <Icon name="Sparkles" size={16} />}
          {generating ? "Генерирую SEO для всех услуг..." : "Сгенерировать SEO для всех услуг"}
        </button>
        {generating && (
          <p className="text-gray-600 text-xs mt-2">Это может занять 1-2 минуты...</p>
        )}
      </div>

      {results.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-sm">Превью ({results.length} услуг)</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleAll(true)} className="text-xs text-gray-500 hover:text-gray-300">Выбрать все</button>
              <span className="text-gray-700">·</span>
              <button onClick={() => toggleAll(false)} className="text-xs text-gray-500 hover:text-gray-300">Снять все</button>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            {results.map((r) => (
              <div key={r.id} className={`border rounded-2xl p-4 transition-all ${r.selected ? "border-amber-500/30 bg-amber-500/5" : "border-white/10 bg-white/3 opacity-60"}`}>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={!!r.selected}
                    onChange={(e) => setResults(results.map((x) => x.id === r.id ? { ...x, selected: e.target.checked } : x))}
                    className="mt-1 accent-amber-400"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-sm mb-2">{r.title}</div>

                    <div className="space-y-2">
                      <div>
                        <div className="text-gray-600 text-xs mb-0.5">SEO Title ({r.seo_title?.length || 0} симв.)</div>
                        <textarea
                          value={r.seo_title || ""}
                          onChange={(e) => setResults(results.map((x) => x.id === r.id ? { ...x, seo_title: e.target.value } : x))}
                          rows={1}
                          className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/50 resize-none"
                        />
                      </div>
                      <div>
                        <div className="text-gray-600 text-xs mb-0.5">SEO Description ({r.seo_description?.length || 0} симв.)</div>
                        <textarea
                          value={r.seo_description || ""}
                          onChange={(e) => setResults(results.map((x) => x.id === r.id ? { ...x, seo_description: e.target.value } : x))}
                          rows={2}
                          className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/50 resize-none"
                        />
                      </div>

                      {(r.old_seo_title || r.old_seo_description) && (
                        <details className="text-xs">
                          <summary className="text-gray-600 cursor-pointer hover:text-gray-500">Показать старые значения</summary>
                          <div className="mt-1 text-gray-600 space-y-1">
                            <div>Старый title: {r.old_seo_title || "—"}</div>
                            <div>Старый description: {r.old_seo_description || "—"}</div>
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {applied ? (
            <div className="flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
              <Icon name="CheckCircle" size={16} />
              Применено! SEO-данные обновлены для {selectedCount} услуг.
            </div>
          ) : (
            <button
              onClick={handleApply}
              disabled={applying || selectedCount === 0}
              className="btn-neon w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {applying ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Icon name="Save" size={16} />}
              {applying ? "Применяю..." : `Применить для ${selectedCount} услуг`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

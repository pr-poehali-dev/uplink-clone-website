import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { SeoAudit, SeoProps, apiCall, PRIORITY_LABELS, ISSUE_ICONS } from "./seo-shared";
import { SeoScoreBadge } from "./SeoScoreBadge";

export function AuditSection({ token }: SeoProps) {
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
                    <SeoScoreBadge score={a.seo_score} />
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

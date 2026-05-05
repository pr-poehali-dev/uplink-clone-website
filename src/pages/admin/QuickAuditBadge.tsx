import { useState } from "react";
import Icon from "@/components/ui/icon";
import { apiCall, ISSUE_ICONS, PRIORITY_LABELS, SeoAudit } from "./seo-shared";
import { SeoScoreBadge } from "./SeoScoreBadge";

interface Props {
  slug: string;
  token: string;
}

export function QuickAuditBadge({ slug, token }: Props) {
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<SeoAudit | null>(null);
  const [open, setOpen] = useState(false);

  const handleAudit = async () => {
    if (!slug) return;
    setLoading(true);
    setAudit(null);
    setOpen(false);
    const data = await apiCall(token, {
      action: "audit_page",
      page_slug: slug,
      page_type: "service",
    });
    setLoading(false);
    if (data.ok && data.audit) {
      const result: SeoAudit = {
        page_slug: slug,
        page_type: "service",
        page_title: data.page_title || slug,
        seo_score: data.audit.score || 0,
        issues: data.audit.issues || [],
        recommendations: data.audit.recommendations || [],
        audited_at: new Date().toISOString(),
      };
      setAudit(result);
      setOpen(true);
    }
  };

  return (
    <div className="ml-auto flex items-center gap-2">
      {audit && !open && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5"
        >
          <SeoScoreBadge score={audit.seo_score} />
        </button>
      )}

      <button
        onClick={handleAudit}
        disabled={loading || !slug}
        title={!slug ? "Сначала задайте slug" : "Быстрый SEO-аудит"}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading
          ? <div className="w-3 h-3 border border-green-400/30 border-t-green-400 rounded-full animate-spin" />
          : <Icon name="TrendingUp" size={12} />}
        {loading ? "Анализирую..." : "Быстрый аудит"}
      </button>

      {open && audit && (
        <div className="absolute left-0 right-0 z-10 mt-2 top-full">
          <div className="bg-[#0d1420] border border-green-500/20 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon name="TrendingUp" size={14} className="text-green-400" />
                <span className="text-white text-sm font-semibold">SEO-аудит: {audit.page_title || audit.page_slug}</span>
              </div>
              <div className="flex items-center gap-2">
                <SeoScoreBadge score={audit.seo_score} />
                <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-gray-400">
                  <Icon name="X" size={14} />
                </button>
              </div>
            </div>

            {audit.issues.length > 0 && (
              <div className="mb-3">
                <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Проблемы</div>
                <div className="space-y-1.5">
                  {audit.issues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <Icon
                        name={ISSUE_ICONS[issue.type]?.icon as "XCircle"}
                        size={13}
                        className={`mt-0.5 flex-shrink-0 ${ISSUE_ICONS[issue.type]?.cls}`}
                      />
                      <span className="text-gray-300">{issue.text}</span>
                      {issue.field && <span className="text-gray-600 ml-auto flex-shrink-0">{issue.field}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {audit.recommendations.length > 0 && (
              <div>
                <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Рекомендации</div>
                <div className="space-y-1.5">
                  {audit.recommendations.map((rec, i) => (
                    <div key={i} className={`rounded-xl px-3 py-2 border text-xs ${PRIORITY_LABELS[rec.priority]?.cls || ""}`}>
                      <span className="font-medium">{rec.action}</span>
                      {rec.example && (
                        <div className="mt-1 opacity-70 font-mono bg-black/20 rounded px-1.5 py-0.5">
                          {rec.example}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {audit.issues.length === 0 && audit.recommendations.length === 0 && (
              <div className="text-gray-500 text-xs text-center py-2">Всё отлично — проблем не найдено!</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

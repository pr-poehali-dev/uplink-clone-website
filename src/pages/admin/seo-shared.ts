export const SEO_API_URL = "https://functions.poehali.dev/39397936-5e11-4d76-9565-841faeb422e3";

export interface SeoKeyword {
  id: number;
  keyword: string;
  page_slug: string | null;
  page_type: string;
  priority: "high" | "medium" | "low";
  search_volume_hint: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface AuditIssue {
  type: "error" | "warning" | "info";
  field: string;
  text: string;
}

export interface AuditRec {
  priority: "high" | "medium" | "low";
  action: string;
  example?: string;
}

export interface SeoAudit {
  page_slug: string;
  page_type: string;
  page_title: string;
  seo_score: number;
  issues: AuditIssue[];
  recommendations: AuditRec[];
  audited_at: string | null;
}

export interface MassResult {
  id: number;
  slug: string;
  title: string;
  seo_title: string;
  seo_description: string;
  old_seo_title: string | null;
  old_seo_description: string | null;
  selected?: boolean;
}

export interface SeoProps {
  token: string;
}

export function apiCall(token: string, body: object) {
  return fetch(SEO_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Admin-Token": token },
    body: JSON.stringify(body),
  }).then((r) => r.json());
}

export const PRIORITY_LABELS: Record<string, { label: string; cls: string }> = {
  high: { label: "Высокий", cls: "bg-red-500/20 text-red-400 border-red-500/30" },
  medium: { label: "Средний", cls: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  low: { label: "Низкий", cls: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
};

export const ISSUE_ICONS: Record<string, { icon: string; cls: string }> = {
  error: { icon: "XCircle", cls: "text-red-400" },
  warning: { icon: "AlertTriangle", cls: "text-amber-400" },
  info: { icon: "Info", cls: "text-blue-400" },
};

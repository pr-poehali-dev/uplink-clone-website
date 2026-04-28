import { useEffect, useState } from "react";

const CMS_API = "https://functions.poehali.dev/2b809096-85e0-45ee-a1bd-a4176cc18baa";

export interface CmsServiceItem {
  id: number;
  sort_order: number;
  item_text: string;
}

export interface CmsServiceBenefit {
  id: number;
  sort_order: number;
  icon: string;
  title: string;
  description: string | null;
}

export interface CmsServiceStep {
  id: number;
  sort_order: number;
  step_title: string;
  step_description: string | null;
}

export interface CmsServiceFaq {
  id: number;
  sort_order: number;
  question: string;
  answer: string;
}

export interface CmsService {
  id: number;
  sort_order: number;
  icon: string;
  title: string;
  description: string;
  accent: string;
  is_active: boolean;
  slug?: string | null;
  short_desc?: string | null;
  hero_title?: string | null;
  hero_subtitle?: string | null;
  full_description?: string | null;
  price_from?: string | null;
  for_whom?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  items: CmsServiceItem[];
  benefits?: CmsServiceBenefit[];
  steps?: CmsServiceStep[];
  faq?: CmsServiceFaq[];
}

export interface CmsCalcOption {
  id: number;
  sort_order: number;
  key: string;
  label: string;
  description: string | null;
  price: number;
  icon: string;
  is_active: boolean;
}

export interface CmsPlanFeature {
  id: number;
  sort_order: number;
  feature_text: string;
}

export interface CmsPlan {
  id: number;
  sort_order: number;
  name: string;
  price: string;
  badge: string | null;
  description: string;
  color: string;
  border_class: string;
  btn_class: string;
  is_highlighted: boolean;
  is_active: boolean;
  features: CmsPlanFeature[];
}

export interface CmsProjectMetric {
  id: number;
  sort_order: number;
  label: string;
  value: string;
}

export interface CmsProject {
  id: number;
  sort_order: number;
  client: string;
  category: string;
  description: string;
  result: string | null;
  accent: string;
  is_active: boolean;
  metrics: CmsProjectMetric[];
}

export interface CmsTeamMember {
  id: number;
  sort_order: number;
  name: string;
  position: string;
  experience: string | null;
  photo_url: string | null;
  is_active: boolean;
}

export interface CmsFaqItem {
  id: number;
  sort_order: number;
  question: string;
  answer: string;
  is_active: boolean;
}

export interface CmsSettings {
  [key: string]: string;
}

export interface CmsContent {
  settings: CmsSettings;
  services: CmsService[];
  plans: CmsPlan[];
  projects: CmsProject[];
  team: CmsTeamMember[];
  faq: CmsFaqItem[];
  calc_settings?: Record<string, string>;
  calc_options?: CmsCalcOption[];
}

const CACHE_KEY = "cms_content_cache_v5";
const CACHE_TTL = 10 * 60 * 1000; // 10 минут

function getCached(): CmsContent | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data as CmsContent;
  } catch {
    return null;
  }
}

function setCache(data: CmsContent) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // localStorage недоступен — игнорируем
  }
}

export function useCmsContent() {
  const [content, setContent] = useState<CmsContent | null>(() => getCached());
  const [loading, setLoading] = useState(() => getCached() === null);

  useEffect(() => {
    // Очищаем старые версии кэша
    try {
      localStorage.removeItem("cms_content_cache");
      localStorage.removeItem("cms_content_cache_v2");
      localStorage.removeItem("cms_content_cache_v3");
      localStorage.removeItem("cms_content_cache_v4");
    } catch (e) { /* игнорируем */ }

    const cached = getCached();
    if (cached) {
      setContent(cached);
      setLoading(false);
      return;
    }

    fetch(CMS_API)
      .then((r) => r.json())
      .then((data) => {
        setCache(data);
        setContent(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { content, loading };
}

export const CMS_API_URL = CMS_API;
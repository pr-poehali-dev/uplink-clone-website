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
  page_visible?: boolean;
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

export interface CmsWhyusCard {
  id: number;
  sort_order: number;
  icon: string;
  title: string;
  description: string;
  is_active: boolean;
}

export interface CmsQuickorderStep {
  id: number;
  sort_order: number;
  icon: string;
  title: string;
  description: string;
  is_active: boolean;
}

export interface CmsPricingItem {
  id: number;
  category_slug: string;
  category_title: string;
  category_icon: string;
  category_accent: string;
  name: string;
  price: string;
  description: string;
  sort_order: number;
  is_active: boolean;
}

export interface CmsNavItem {
  id: number;
  label: string;
  href: string;
  type: string;
  sort_order: number;
  is_visible: boolean;
}

export interface CmsCalcSlider {
  id: number;
  sort_order: number;
  key: string;
  label: string;
  suffix: string;
  price_key: string;
  price_default: number;
  min_val: number;
  max_val: number;
  default_val: number;
  is_active: boolean;
}

export interface CmsVideoCameraType {
  id: number;
  label: string;
  price: number;
  icon: string;
  sort_order: number;
  is_active: boolean;
  min_val: number;
  max_val: number;
}

export interface CmsVideoEquipment {
  id: number;
  label: string;
  price: number;
  icon: string;
  default_checked: boolean;
  sort_order: number;
  is_active: boolean;
}

export interface CmsVideoCalcSlider {
  id: number;
  sort_order: number;
  key: string;
  label: string;
  suffix: string;
  price_per_unit: number;
  min_val: number;
  max_val: number;
  default_val: number;
  is_active: boolean;
}

export interface CmsPage {
  id: number;
  route: string;
  title: string;
  seo_title: string;
  seo_description: string;
  og_title: string;
  og_description: string;
  og_image_url: string;
  is_active: boolean;
}

export interface CmsSectionAnimation {
  section_id: string;
  page: string;
  label: string;
  scroll_anim: string;
  hover_cards: string;
  hover_buttons: string;
  anim_speed: string;
}

export interface CmsElementAnimation {
  elem_id: string;
  section_id: string | null;
  elem_type: string;
  label: string;
  hover_anim: string;
  scroll_anim: string;
  anim_speed: string;
}

export interface CmsLead {
  id: number;
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
  source: string;
  is_read: boolean;
  created_at: string;
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
  calc_sliders?: CmsCalcSlider[];
  whyus_cards?: CmsWhyusCard[];
  quickorder_steps?: CmsQuickorderStep[];
  pricing_items?: CmsPricingItem[];
  nav_items?: CmsNavItem[];
  video_cameras?: CmsVideoCameraType[];
  video_equipment?: CmsVideoEquipment[];
  video_calc_sliders?: CmsVideoCalcSlider[];
  pages?: CmsPage[];
  section_animations?: CmsSectionAnimation[];
  element_animations?: CmsElementAnimation[];
}

const CACHE_KEY = "cms_content_cache_v6";
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

export function clearCmsCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // игнорируем
  }
}

export function useCmsContent() {
  // В режиме визуального редактора (?__editor=1) — не используем кэш, всегда грузим свежее
  const isEditorMode = typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("__editor") === "1";

  const [content, setContent] = useState<CmsContent | null>(() => isEditorMode ? null : getCached());
  const [loading, setLoading] = useState(() => isEditorMode ? true : getCached() === null);

  useEffect(() => {
    // Очищаем старые версии кэша
    try {
      localStorage.removeItem("cms_content_cache");
      localStorage.removeItem("cms_content_cache_v2");
      localStorage.removeItem("cms_content_cache_v3");
      localStorage.removeItem("cms_content_cache_v4");
      localStorage.removeItem("cms_content_cache_v5");
    } catch (e) { /* игнорируем */ }

    if (!isEditorMode) {
      const cached = getCached();
      if (cached) {
        setContent(cached);
        setLoading(false);
        // Не делаем return — продолжаем фоновое обновление, чтобы свежие данные были на следующий рендер
        fetch(CMS_API)
          .then((r) => r.json())
          .then((data) => { setCache(data); setContent(data); })
          .catch(() => { /* молча */ });
        return;
      }
    }

    fetch(CMS_API)
      .then((r) => r.json())
      .then((data) => {
        if (!isEditorMode) setCache(data);
        setContent(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Подписываемся на сообщения от админки для принудительного обновления
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "REFETCH_CMS") {
        fetch(CMS_API)
          .then((r) => r.json())
          .then((data) => {
            if (!isEditorMode) setCache(data);
            setContent(data);
          })
          .catch(() => { /* игнорируем */ });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [isEditorMode]);

  return { content, loading };
}

export const CMS_API_URL = CMS_API;
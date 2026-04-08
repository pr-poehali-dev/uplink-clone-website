import { useEffect, useState } from "react";

const CMS_API = "https://functions.poehali.dev/2b809096-85e0-45ee-a1bd-a4176cc18baa";

export interface CmsServiceItem {
  id: number;
  sort_order: number;
  item_text: string;
}

export interface CmsService {
  id: number;
  sort_order: number;
  icon: string;
  title: string;
  description: string;
  accent: string;
  is_active: boolean;
  items: CmsServiceItem[];
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
}

export function useCmsContent() {
  const [content, setContent] = useState<CmsContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(CMS_API)
      .then((r) => r.json())
      .then((data) => {
        setContent(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { content, loading };
}

export const CMS_API_URL = CMS_API;
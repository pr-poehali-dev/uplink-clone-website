import { CmsPricingItem } from "@/hooks/useCmsContent";

export const cls = {
  input: "px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 w-full transition-colors",
  textarea: "px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 w-full transition-colors resize-none",
  label: "block text-gray-400 text-xs mb-1",
  addBtn: "px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-sm hover:bg-cyan-500/30 transition-colors flex items-center gap-1.5",
  delBtn: "text-red-400 hover:text-red-300 p-1 transition-colors",
  moveBtn: "p-1 text-gray-500 hover:text-cyan-400 disabled:opacity-25 transition-colors",
};

export const ACCENT_OPTIONS = [
  { label: "Голубой", value: "from-cyan-400 to-blue-500" },
  { label: "Фиолетовый", value: "from-violet-400 to-purple-500" },
  { label: "Синий", value: "from-blue-400 to-indigo-500" },
  { label: "Зелёный", value: "from-green-400 to-emerald-500" },
  { label: "Оранжевый", value: "from-orange-400 to-amber-500" },
  { label: "Розовый", value: "from-pink-400 to-rose-500" },
  { label: "Красный", value: "from-red-400 to-rose-600" },
  { label: "Жёлтый", value: "from-yellow-400 to-orange-400" },
];

export interface Category {
  slug: string;
  title: string;
  icon: string;
  accent: string;
}

export function getCategories(items: CmsPricingItem[]): Category[] {
  const seen = new Set<string>();
  const cats: Category[] = [];
  for (const it of items) {
    if (!seen.has(it.category_slug)) {
      seen.add(it.category_slug);
      cats.push({ slug: it.category_slug, title: it.category_title, icon: it.category_icon, accent: it.category_accent || "from-cyan-400 to-blue-500" });
    }
  }
  return cats;
}

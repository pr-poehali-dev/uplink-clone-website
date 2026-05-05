import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { SeoKeyword, SeoProps, apiCall, PRIORITY_LABELS } from "./seo-shared";

export function KeywordsSection({ token }: SeoProps) {
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

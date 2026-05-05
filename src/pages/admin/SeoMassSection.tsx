import { useState } from "react";
import Icon from "@/components/ui/icon";
import { MassResult, SeoProps, apiCall } from "./seo-shared";

export function MassSection({ token }: SeoProps) {
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

import { useState, useEffect, useRef, useCallback } from "react";
import { CmsContent, CmsElementAnimation, clearCmsCache } from "@/hooks/useCmsContent";
import { SaveFn } from "./AdminShared";
import Icon from "@/components/ui/icon";

interface Props {
  content: CmsContent;
  save: SaveFn;
  saving: boolean;
}

// Hover-анимации разбиты по группам для удобства
const HOVER_GROUPS = [
  {
    label: "CSS-эффекты",
    options: [
      { id: "lift",        label: "Подъём",          icon: "ArrowUp" },
      { id: "glow",        label: "Свечение",         icon: "Sparkles" },
      { id: "scale",       label: "Масштаб",          icon: "Maximize2" },
      { id: "border-glow", label: "Бордер-свечение",  icon: "Square" },
      { id: "pulse",       label: "Пульс",            icon: "Activity" },
      { id: "ripple",      label: "Рябь",             icon: "Waves" },
    ],
  },
  {
    label: "JS-эффекты",
    options: [
      { id: "tilt",        label: "3D-наклон",        icon: "RotateCcw" },
      { id: "magnetic",    label: "Магнит",           icon: "Magnet" },
      { id: "spotlight",   label: "Прожектор",        icon: "Flashlight" },
      { id: "float-up",    label: "Парение",          icon: "Cloud" },
      { id: "wipe",        label: "Неон-заливка",     icon: "Paintbrush" },
      { id: "heartbeat",   label: "Сердцебиение",     icon: "Heart" },
      { id: "shake",       label: "Тряска",           icon: "Vibrate" },
      { id: "jello",       label: "Желе",             icon: "Wind" },
      { id: "rubber",      label: "Резина",           icon: "Zap" },
      { id: "flicker",     label: "Неон-мигание",     icon: "Lightbulb" },
      { id: "morph",       label: "Морфинг",          icon: "Layers" },
      { id: "glitch",      label: "Глитч",            icon: "AlertTriangle" },
      { id: "trace",       label: "Обводка",          icon: "PenTool" },
      { id: "shockwave",   label: "Волна-клик",       icon: "Radio" },
    ],
  },
];

// Плоский список для поиска label по id
const ALL_HOVER_OPTIONS = HOVER_GROUPS.flatMap((g) => g.options);

const SCROLL_OPTIONS = [
  { id: "inherit",    label: "Как глобально" },
  { id: "none",       label: "Без анимации" },
  { id: "fade-up",    label: "Снизу вверх" },
  { id: "fade-down",  label: "Сверху вниз" },
  { id: "fade-left",  label: "Слева" },
  { id: "fade-right", label: "Справа" },
  { id: "zoom-in",    label: "Увеличение" },
  { id: "zoom-out",   label: "Уменьшение" },
  { id: "flip-x",     label: "Поворот X" },
  { id: "flip-y",     label: "Поворот Y" },
  { id: "slide-up",   label: "Сдвиг вверх" },
  { id: "bounce",     label: "Отскок" },
  { id: "rotate-in",  label: "Вращение" },
  { id: "blur-in",    label: "Расфокус" },
];

const SPEED_OPTIONS = [
  { id: "inherit", label: "Как глобально" },
  { id: "fast",    label: "Быстро (0.35s)" },
  { id: "normal",  label: "Нормально (0.6s)" },
  { id: "slow",    label: "Медленно (1.1s)" },
];

const PAGES = [
  { path: "/",         label: "Главная" },
  { path: "/pricing",  label: "Прайс-лист" },
  { path: "/services", label: "Все услуги" },
];

interface SelectedElement {
  elemId: string;
  elemType: string;
  label: string;
  sectionId: string | null;
}

const cls = {
  select: "w-full px-3 py-2 rounded-lg bg-[#0d1421] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50",
  label: "block text-gray-400 text-xs mb-1.5",
};

export function VisualEditorTab({ content, save }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activePage, setActivePage] = useState("/");
  const [iframeReady, setIframeReady] = useState(false);
  const [selectMode, setSelectMode] = useState(true);
  const [selected, setSelected] = useState<SelectedElement | null>(null);
  const [elemAnims, setElemAnims] = useState<CmsElementAnimation[]>([]);
  const [savingElem, setSavingElem] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    setElemAnims(content.element_animations ?? []);
  }, [content.element_animations]);

  const getElemAnim = (elemId: string): CmsElementAnimation => {
    return elemAnims.find((e) => e.elem_id === elemId) ?? {
      elem_id: elemId, section_id: null, elem_type: "card",
      label: elemId, hover_anim: "inherit", hover_anims: [], scroll_anim: "inherit", anim_speed: "inherit",
    };
  };

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "ELEM_EDITOR_READY") {
        setIframeReady(true);
        iframeRef.current?.contentWindow?.postMessage({ type: "ENABLE_SELECT_MODE" }, "*");
      }
      if (e.data?.type === "ELEM_SELECTED") {
        const { elemId, elemType, sectionId } = e.data;
        setSelected({
          elemId,
          elemType: elemType ?? "card",
          label: elemId,
          sectionId: sectionId ?? null,
        });
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const toggleSelectMode = useCallback(() => {
    const next = !selectMode;
    setSelectMode(next);
    iframeRef.current?.contentWindow?.postMessage(
      { type: next ? "ENABLE_SELECT_MODE" : "DISABLE_SELECT_MODE" },
      "*"
    );
    if (!next) setSelected(null);
  }, [selectMode]);

  const changePage = (path: string) => {
    setActivePage(path);
    setIframeReady(false);
    setSelected(null);
    setIframeKey((k) => k + 1);
  };

  const reloadIframe = () => {
    setIframeReady(false);
    setSelected(null);
    setIframeKey((k) => k + 1);
  };

  const currentAnim = selected ? getElemAnim(selected.elemId) : null;

  // Получаем итоговый массив hover_anims с учётом обратной совместимости
  const getCurrentHoverAnims = (): string[] => {
    if (!currentAnim) return [];
    if (currentAnim.hover_anims && currentAnim.hover_anims.length > 0) return currentAnim.hover_anims;
    if (currentAnim.hover_anim && currentAnim.hover_anim !== "inherit") return [currentAnim.hover_anim];
    return [];
  };

  const toggleHoverAnim = (animId: string) => {
    if (!selected) return;
    const current = getCurrentHoverAnims();
    const next = current.includes(animId)
      ? current.filter((a) => a !== animId)
      : [...current, animId];
    setElemAnims((prev) => {
      const exists = prev.find((e) => e.elem_id === selected.elemId);
      if (exists) return prev.map((e) => e.elem_id === selected.elemId
        ? { ...e, hover_anims: next, hover_anim: next[0] ?? "inherit" }
        : e
      );
      return [...prev, { ...getElemAnim(selected.elemId), hover_anims: next, hover_anim: next[0] ?? "inherit" }];
    });
  };

  const updateCurrentAnim = (patch: Partial<CmsElementAnimation>) => {
    if (!selected) return;
    setElemAnims((prev) => {
      const exists = prev.find((e) => e.elem_id === selected.elemId);
      if (exists) return prev.map((e) => e.elem_id === selected.elemId ? { ...e, ...patch } : e);
      return [...prev, { ...getElemAnim(selected.elemId), ...patch }];
    });
  };

  const handleSaveElem = async () => {
    if (!selected) return;
    setSavingElem(true);
    const anim = getElemAnim(selected.elemId);
    const hoverAnims = getCurrentHoverAnims();
    await save("save_element_animation", {
      item: {
        elem_id: selected.elemId,
        section_id: selected.sectionId,
        elem_type: selected.elemType,
        label: selected.label,
        hover_anims: hoverAnims,
        hover_anim: hoverAnims[0] ?? "inherit",
        scroll_anim: anim.scroll_anim,
        anim_speed: anim.anim_speed,
      },
    });
    setSavingElem(false);
    clearCmsCache();
    setSavedMsg("Сохранено!");
    iframeRef.current?.contentWindow?.postMessage({
      type: "UPDATE_ELEM_ANIM",
      elemId: selected.elemId,
      hover_anims: hoverAnims,
      hover_anim: hoverAnims[0] ?? "inherit",
      scroll_anim: anim.scroll_anim,
      anim_speed: anim.anim_speed,
    }, "*");
    iframeRef.current?.contentWindow?.postMessage({ type: "REFETCH_CMS" }, "*");
    setTimeout(() => setSavedMsg(""), 2000);
  };

  const handleResetElem = async () => {
    if (!selected) return;
    await save("delete_element_animation", { elem_id: selected.elemId });
    setElemAnims((prev) => prev.filter((e) => e.elem_id !== selected.elemId));
    clearCmsCache();
    setSavedMsg("Сброшено!");
    iframeRef.current?.contentWindow?.postMessage({
      type: "UPDATE_ELEM_ANIM",
      elemId: selected.elemId,
      hover_anims: [],
      hover_anim: "inherit",
      scroll_anim: "inherit",
      anim_speed: "inherit",
    }, "*");
    iframeRef.current?.contentWindow?.postMessage({ type: "REFETCH_CMS" }, "*");
    setTimeout(() => setSavedMsg(""), 2000);
  };

  const customizedCount = elemAnims.filter(
    (e) => (e.hover_anims && e.hover_anims.length > 0) || e.hover_anim !== "inherit" || e.scroll_anim !== "inherit" || e.anim_speed !== "inherit"
  ).length;

  const selectedHoverAnims = getCurrentHoverAnims();

  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white font-['Oswald']">Визуальный редактор</h2>
          <p className="text-gray-500 text-xs mt-0.5">
            Кликни на любой элемент сайта чтобы настроить его анимацию
            {customizedCount > 0 && <span className="ml-2 text-cyan-400">· настроено: {customizedCount}</span>}
          </p>
        </div>
        {savedMsg && (
          <div className="ml-auto text-xs text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/20 flex items-center gap-1.5">
            <Icon name="Check" size={12} />{savedMsg}
          </div>
        )}
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Левая панель — iframe */}
        <div className="flex-1 min-w-0 flex flex-col gap-3 min-h-0">
          <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
            <div className="flex gap-1 bg-white/5 rounded-xl p-1">
              {PAGES.map((p) => (
                <button key={p.path} onClick={() => changePage(p.path)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activePage === p.path ? "bg-cyan-500/20 text-cyan-400" : "text-gray-400 hover:text-white"
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
            <button onClick={toggleSelectMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                selectMode
                  ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
              }`}>
              <Icon name={selectMode ? "MousePointer2" : "MousePointer"} size={13} />
              {selectMode ? "Выбор активен" : "Включить выбор"}
            </button>
            <button onClick={reloadIframe}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white text-xs transition-all">
              <Icon name="RefreshCw" size={13} />
              Обновить
            </button>
            <a href={activePage} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white text-xs transition-all ml-auto">
              <Icon name="ExternalLink" size={13} />
              Открыть в новой вкладке
            </a>
          </div>

          <div className={`relative rounded-2xl overflow-hidden border transition-all flex-1 min-h-0 ${
            selectMode ? "border-cyan-500/40 shadow-[0_0_20px_rgba(0,212,255,0.1)]" : "border-white/10"
          }`}>
            {!iframeReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#080c14] z-10">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                  Загружаю сайт...
                </div>
              </div>
            )}
            <iframe
              key={iframeKey}
              ref={iframeRef}
              src={`${activePage}?__editor=1`}
              onLoad={() => {}}
              className="w-full h-full"
              style={{ border: "none", display: "block" }}
              title="Visual Editor"
            />
            {selectMode && !selected && iframeReady && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#080c14]/90 border border-cyan-500/30 text-cyan-400 text-xs px-4 py-2 rounded-full pointer-events-none backdrop-blur-sm">
                Наведи на элемент и кликни
              </div>
            )}
          </div>
        </div>

        {/* Правая панель — настройки выбранного элемента */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-3 overflow-y-auto">
          {!selected ? (
            <div className="glass-card neon-border rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Icon name="MousePointer2" size={22} className="text-cyan-400/50" />
              </div>
              <div>
                <p className="text-gray-400 text-sm font-medium">Элемент не выбран</p>
                <p className="text-gray-600 text-xs mt-1">
                  {selectMode ? "Кликни на карточку или кнопку в превью" : "Включи режим выбора"}
                </p>
              </div>
            </div>
          ) : (
            <div className="glass-card neon-border rounded-2xl p-4 flex flex-col gap-4">
              {/* Заголовок элемента */}
              <div className="flex items-start gap-2 pb-3 border-b border-white/10">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  selected.elemType === "btn" ? "bg-purple-500/15 border border-purple-500/25" : "bg-cyan-500/10 border border-cyan-500/20"
                }`}>
                  <Icon name={selected.elemType === "btn" ? "MousePointerClick" : "Square"} size={16}
                    className={selected.elemType === "btn" ? "text-purple-400" : "text-cyan-400"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">
                    {selected.elemType === "btn" ? "Кнопка" : "Карточка"}
                  </p>
                  <p className="text-gray-600 text-[10px] font-mono mt-0.5 truncate">{selected.elemId}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-600 hover:text-gray-300 transition-colors flex-shrink-0">
                  <Icon name="X" size={14} />
                </button>
              </div>

              {/* Hover-анимации — мультиселект */}
              <div>
                <label className={cls.label}>
                  Эффекты при наведении
                  {selectedHoverAnims.length > 0 && (
                    <span className="ml-2 text-cyan-400 font-medium">· выбрано: {selectedHoverAnims.length}</span>
                  )}
                </label>

                {/* Выбранные анимации — теги */}
                {selectedHoverAnims.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {selectedHoverAnims.map((a) => {
                      const opt = ALL_HOVER_OPTIONS.find((o) => o.id === a);
                      return (
                        <span key={a}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-[10px] font-medium cursor-pointer hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 transition-colors"
                          onClick={() => toggleHoverAnim(a)}
                          title="Кликни чтобы убрать">
                          {opt?.label ?? a}
                          <Icon name="X" size={9} />
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Сетка кнопок выбора */}
                {HOVER_GROUPS.map((group) => (
                  <div key={group.label} className="mb-2">
                    <p className="text-gray-600 text-[10px] uppercase tracking-wider mb-1">{group.label}</p>
                    <div className="flex flex-wrap gap-1">
                      {group.options.map((opt) => {
                        const active = selectedHoverAnims.includes(opt.id);
                        return (
                          <button
                            key={opt.id}
                            onClick={() => toggleHoverAnim(opt.id)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all border ${
                              active
                                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400"
                                : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {selectedHoverAnims.length === 0 && (
                  <p className="text-gray-600 text-[10px] mt-1">Нет эффектов — берётся из глобальных настроек</p>
                )}
              </div>

              {/* Анимация появления */}
              <div>
                <label className={cls.label}>Анимация появления при скролле</label>
                <select value={currentAnim?.scroll_anim ?? "inherit"}
                  onChange={(e) => updateCurrentAnim({ scroll_anim: e.target.value })}
                  className={cls.select}>
                  {SCROLL_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </div>

              {/* Скорость */}
              <div>
                <label className={cls.label}>Скорость анимации</label>
                <select value={currentAnim?.anim_speed ?? "inherit"}
                  onChange={(e) => updateCurrentAnim({ anim_speed: e.target.value })}
                  className={cls.select}>
                  {SPEED_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </div>

              {/* Кнопки */}
              <div className="flex gap-2 pt-1">
                <button onClick={handleSaveElem} disabled={savingElem}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500 text-[#080c14] text-xs font-bold transition-all hover:bg-cyan-400 disabled:opacity-50">
                  {savingElem
                    ? <div className="w-3 h-3 border-2 border-[#080c14]/30 border-t-[#080c14] rounded-full animate-spin" />
                    : <Icon name="Save" size={12} />}
                  Сохранить
                </button>
                <button onClick={handleResetElem}
                  className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-red-400 hover:border-red-500/30 text-xs transition-all"
                  title="Сбросить настройки элемента">
                  <Icon name="RotateCcw" size={12} />
                </button>
              </div>

              <p className="text-[10px] text-gray-600 leading-relaxed">
                Если эффекты не выбраны — элемент берёт настройки из раздела «Дизайн».
                Можно комбинировать: например, «Магнит» + «Свечение».
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

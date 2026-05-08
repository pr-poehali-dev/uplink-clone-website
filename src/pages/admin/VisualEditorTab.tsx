import { useState, useEffect, useRef, useCallback } from "react";
import { CmsContent, CmsElementAnimation } from "@/hooks/useCmsContent";
import { SaveFn } from "./AdminShared";
import Icon from "@/components/ui/icon";

interface Props {
  content: CmsContent;
  save: SaveFn;
  saving: boolean;
}

const HOVER_OPTIONS = [
  { id: "inherit",     label: "Как в секции / глобально" },
  { id: "none",        label: "Без эффекта" },
  { id: "lift",        label: "Подъём" },
  { id: "glow",        label: "Свечение" },
  { id: "scale",       label: "Масштаб" },
  { id: "border-glow", label: "Бордер-свечение" },
  { id: "tilt",        label: "3D-наклон" },
  { id: "spotlight",   label: "Прожектор" },
  { id: "magnetic",    label: "Магнит" },
  { id: "morph",       label: "Морфинг" },
  { id: "flicker",     label: "Неон-мигание" },
  { id: "float-up",    label: "Парение" },
  { id: "trace",       label: "Обводка" },
  { id: "pulse",       label: "Пульс" },
  { id: "shake",       label: "Тряска" },
  { id: "ripple",      label: "Рябь" },
  { id: "rubber",      label: "Резина" },
  { id: "jello",       label: "Желе" },
  { id: "heartbeat",   label: "Сердцебиение" },
  { id: "shockwave",   label: "Волна-клик" },
  { id: "wipe",        label: "Неон-заливка" },
  { id: "glitch",      label: "Глитч" },
];

const SCROLL_OPTIONS = [
  { id: "inherit",    label: "Как в секции / глобально" },
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
  { id: "inherit", label: "Как в секции / глобально" },
  { id: "fast",    label: "Быстро (0.35s)" },
  { id: "normal",  label: "Нормально (0.6s)" },
  { id: "slow",    label: "Медленно (1.1s)" },
];

const PAGES = [
  { path: "/",              label: "Главная" },
  { path: "/pricing",       label: "Прайс-лист" },
  { path: "/services",      label: "Все услуги" },
];

interface SelectedElement {
  elemId: string;
  elemType: string;
  label: string;
  sectionId: string | null;
  rect: { top: number; left: number; width: number; height: number };
}

const cls = {
  select: "w-full px-3 py-2 rounded-lg bg-[#0d1421] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50",
  label: "block text-gray-400 text-xs mb-1.5",
};

export function VisualEditorTab({ content, save }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activePage, setActivePage] = useState("/");
  const [iframeReady, setIframeReady] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<SelectedElement | null>(null);
  const [elemAnims, setElemAnims] = useState<CmsElementAnimation[]>([]);
  const [savingElem, setSavingElem] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [iframeKey, setIframeKey] = useState(0);

  // Загружаем текущие настройки из контента
  useEffect(() => {
    setElemAnims(content.element_animations ?? []);
  }, [content.element_animations]);

  const getElemAnim = (elemId: string): CmsElementAnimation => {
    return elemAnims.find((e) => e.elem_id === elemId) ?? {
      elem_id: elemId, section_id: null, elem_type: "card",
      label: elemId, hover_anim: "inherit", scroll_anim: "inherit", anim_speed: "inherit",
    };
  };

  // Слушаем postMessage от iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "ELEM_EDITOR_READY") {
        setIframeReady(true);
      }
      if (e.data?.type === "ELEM_SELECTED") {
        const { elemId, elemType, sectionId, rect } = e.data;
        setSelected({
          elemId,
          elemType: elemType ?? "card",
          label: elemId,
          sectionId: sectionId ?? null,
          rect,
        });
      }
      if (e.data?.type === "ELEM_HOVER") {
        // подсветка — просто обновляем состояние hoveredId если нужно
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Включаем/выключаем режим выбора в iframe
  const toggleSelectMode = useCallback(() => {
    const next = !selectMode;
    setSelectMode(next);
    iframeRef.current?.contentWindow?.postMessage(
      { type: next ? "ENABLE_SELECT_MODE" : "DISABLE_SELECT_MODE" },
      "*"
    );
    if (!next) setSelected(null);
  }, [selectMode]);

  // При смене страницы — перезагружаем iframe
  const changePage = (path: string) => {
    setActivePage(path);
    setIframeReady(false);
    setSelected(null);
    setSelectMode(false);
    setIframeKey((k) => k + 1);
  };

  // Когда iframe загрузился — инжектируем скрипт выбора элементов
  const onIframeLoad = () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    // Инжектируем скрипт через postMessage после загрузки
    setTimeout(() => {
      setIframeReady(true);
      if (selectMode) {
        iframe.contentWindow?.postMessage({ type: "ENABLE_SELECT_MODE" }, "*");
      }
    }, 300);
  };

  const currentAnim = selected ? getElemAnim(selected.elemId) : null;

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
    await save("save_element_animation", {
      item: {
        elem_id: selected.elemId,
        section_id: selected.sectionId,
        elem_type: selected.elemType,
        label: selected.label,
        hover_anim: anim.hover_anim,
        scroll_anim: anim.scroll_anim,
        anim_speed: anim.anim_speed,
      },
    });
    setSavingElem(false);
    setSavedMsg("Сохранено!");
    // Отправляем обновление в iframe
    iframeRef.current?.contentWindow?.postMessage({
      type: "UPDATE_ELEM_ANIM",
      elemId: selected.elemId,
      hover_anim: anim.hover_anim,
      scroll_anim: anim.scroll_anim,
      anim_speed: anim.anim_speed,
    }, "*");
    setTimeout(() => setSavedMsg(""), 2000);
  };

  const handleResetElem = async () => {
    if (!selected) return;
    await save("delete_element_animation", { elem_id: selected.elemId });
    setElemAnims((prev) => prev.filter((e) => e.elem_id !== selected.elemId));
    setSavedMsg("Сброшено!");
    setTimeout(() => setSavedMsg(""), 2000);
  };

  const customizedCount = elemAnims.filter(
    (e) => e.hover_anim !== "inherit" || e.scroll_anim !== "inherit" || e.anim_speed !== "inherit"
  ).length;

  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white font-['Oswald']">Визуальный редактор</h2>
          <p className="text-gray-500 text-xs mt-0.5">
            Кликни на элемент прямо на сайте — настрой анимацию
            {customizedCount > 0 && <span className="ml-2 text-cyan-400">{customizedCount} элем. настроено</span>}
          </p>
        </div>
        {savedMsg && (
          <div className="ml-auto text-xs text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/20">
            {savedMsg}
          </div>
        )}
      </div>

      {/* Инструкция */}
      <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/15 text-gray-400 text-xs flex items-start gap-2 flex-shrink-0">
        <Icon name="MousePointer2" size={14} className="flex-shrink-0 mt-0.5 text-cyan-400" />
        <span>
          <b className="text-white">Как использовать:</b> Выбери страницу → нажми{" "}
          <b className="text-cyan-400">«Режим выбора»</b> → наведи на элемент (карточку или кнопку) →
          кликни → настрой анимацию в панели справа → сохрани.
        </span>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Левая панель — iframe */}
        <div className="flex-1 min-w-0 flex flex-col gap-3 min-h-0">
          {/* Тулбар */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Страницы */}
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

            {/* Режим выбора */}
            <button onClick={toggleSelectMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                selectMode
                  ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
              }`}>
              <Icon name={selectMode ? "MousePointer2" : "MousePointer"} size={13} />
              {selectMode ? "Режим выбора ВКЛ" : "Режим выбора"}
            </button>

            {/* Перезагрузить */}
            <button onClick={() => { setIframeKey((k) => k + 1); setIframeReady(false); setSelected(null); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white text-xs transition-all">
              <Icon name="RefreshCw" size={13} />
              Обновить
            </button>

            <a href={activePage} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white text-xs transition-all ml-auto">
              <Icon name="ExternalLink" size={13} />
              Открыть
            </a>
          </div>

          {/* iframe */}
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
              onLoad={onIframeLoad}
              className="w-full h-full"
              style={{ border: "none", display: "block" }}
              title="Visual Editor"
            />
            {/* Оверлей подсказки когда режим активен */}
            {selectMode && !selected && iframeReady && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#080c14]/90 border border-cyan-500/30 text-cyan-400 text-xs px-4 py-2 rounded-full pointer-events-none backdrop-blur-sm">
                Наведи на карточку или кнопку и кликни
              </div>
            )}
          </div>
        </div>

        {/* Правая панель — настройки элемента */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-3 overflow-y-auto">
          {!selected ? (
            <div className="glass-card neon-border rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-3" style={{ minHeight: 200 }}>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Icon name="MousePointer2" size={22} className="text-cyan-400/50" />
              </div>
              <div>
                <p className="text-gray-400 text-sm font-medium">Элемент не выбран</p>
                <p className="text-gray-600 text-xs mt-1">
                  {selectMode ? "Кликни на карточку или кнопку" : "Включи режим выбора"}
                </p>
              </div>
            </div>
          ) : (
            <div className="glass-card neon-border rounded-2xl p-4 flex flex-col gap-4">
              {/* Заголовок элемента */}
              <div className="flex items-start gap-2 pb-3 border-b border-white/10">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  selected.elemType === "btn" ? "bg-purple-500/15 border border-purple-500/25" : "bg-cyan-500/10 border border-cyan-500/20"
                }`}>
                  <Icon name={selected.elemType === "btn" ? "MousePointerClick" : "Square"} size={15}
                    className={selected.elemType === "btn" ? "text-purple-400" : "text-cyan-400"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{selected.label}</p>
                  <p className="text-gray-600 text-[10px] font-mono mt-0.5 truncate">{selected.elemId}</p>
                  {selected.sectionId && (
                    <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded mt-1 inline-block">
                      {selected.sectionId}
                    </span>
                  )}
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-600 hover:text-gray-300 transition-colors flex-shrink-0">
                  <Icon name="X" size={14} />
                </button>
              </div>

              {/* Hover анимация */}
              <div>
                <label className={cls.label}>Эффект при наведении</label>
                <select value={currentAnim?.hover_anim ?? "inherit"}
                  onChange={(e) => updateCurrentAnim({ hover_anim: e.target.value })}
                  className={cls.select}>
                  {HOVER_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </div>

              {/* Scroll анимация */}
              <div>
                <label className={cls.label}>Анимация появления</label>
                <select value={currentAnim?.scroll_anim ?? "inherit"}
                  onChange={(e) => updateCurrentAnim({ scroll_anim: e.target.value })}
                  className={cls.select}>
                  {SCROLL_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </div>

              {/* Скорость */}
              <div>
                <label className={cls.label}>Скорость</label>
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
                  {savingElem ? <div className="w-3 h-3 border-2 border-[#080c14]/30 border-t-[#080c14] rounded-full animate-spin" /> : <Icon name="Save" size={12} />}
                  Сохранить
                </button>
                <button onClick={handleResetElem}
                  className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-red-400 hover:border-red-500/30 text-xs transition-all"
                  title="Сбросить до настроек секции">
                  <Icon name="RotateCcw" size={12} />
                </button>
              </div>
            </div>
          )}

          {/* Список настроенных элементов */}
          {elemAnims.filter(e => e.hover_anim !== "inherit" || e.scroll_anim !== "inherit" || e.anim_speed !== "inherit").length > 0 && (
            <div className="glass-card neon-border rounded-2xl p-4">
              <p className="text-gray-400 text-xs font-medium mb-3 flex items-center gap-1.5">
                <Icon name="List" size={12} />
                Настроенные элементы
              </p>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {elemAnims
                  .filter(e => e.hover_anim !== "inherit" || e.scroll_anim !== "inherit" || e.anim_speed !== "inherit")
                  .map((e) => (
                    <button key={e.elem_id}
                      onClick={() => setSelected({ elemId: e.elem_id, elemType: e.elem_type, label: e.label ?? e.elem_id, sectionId: e.section_id, rect: { top: 0, left: 0, width: 0, height: 0 } })}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all ${
                        selected?.elemId === e.elem_id ? "bg-cyan-500/15 text-cyan-400" : "bg-white/3 text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}>
                      <div className="truncate font-medium">{e.label ?? e.elem_id}</div>
                      <div className="text-[10px] opacity-50 font-mono truncate">{e.elem_id}</div>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
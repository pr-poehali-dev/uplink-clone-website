import { useEffect } from "react";

/**
 * Хук для режима визуального редактора.
 * Активируется когда URL содержит ?__editor=1
 * Позволяет выбирать элементы с data-elem-id кликом мышки.
 */
export function useVisualEditor() {
  const isEditorMode =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("__editor") === "1";

  useEffect(() => {
    if (!isEditorMode) return;

    let selectModeActive = false;
    let hoveredEl: HTMLElement | null = null;

    // Сообщаем родительскому окну что мы готовы
    const notifyReady = () => {
      window.parent.postMessage({ type: "ELEM_EDITOR_READY" }, "*");
    };

    // Стили для подсветки
    const style = document.createElement("style");
    style.id = "__editor_styles";
    style.textContent = `
      body[data-editor-select] * { cursor: crosshair !important; user-select: none !important; }
      .__editor_highlight {
        outline: 2px solid #00d4ff !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 4px rgba(0,212,255,0.15) !important;
        transition: outline 0.1s ease, box-shadow 0.1s ease !important;
      }
      .__editor_selected {
        outline: 2px solid #00ff88 !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 4px rgba(0,255,136,0.2), 0 0 20px rgba(0,255,136,0.1) !important;
      }
      .__editor_badge {
        position: fixed;
        background: #00d4ff;
        color: #080c14;
        font-size: 10px;
        font-weight: 700;
        font-family: monospace;
        padding: 2px 6px;
        border-radius: 4px;
        pointer-events: none;
        z-index: 999999;
        white-space: nowrap;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `;
    document.head.appendChild(style);

    // Бейдж с именем элемента
    const badge = document.createElement("div");
    badge.className = "__editor_badge";
    badge.style.display = "none";
    document.body.appendChild(badge);

    const getEditableEl = (target: Element | null): HTMLElement | null => {
      let el = target as HTMLElement | null;
      while (el && el !== document.body) {
        if (el.dataset.elemId) return el;
        el = el.parentElement;
      }
      return null;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!selectModeActive) return;
      const el = getEditableEl(e.target as Element);
      if (el === hoveredEl) return;

      if (hoveredEl && !hoveredEl.classList.contains("__editor_selected")) {
        hoveredEl.classList.remove("__editor_highlight");
      }
      hoveredEl = el;
      if (el) {
        el.classList.add("__editor_highlight");
        badge.textContent = el.dataset.elemId ?? "";
        badge.style.display = "block";
        badge.style.left = `${e.clientX + 12}px`;
        badge.style.top = `${e.clientY - 24}px`;
      } else {
        badge.style.display = "none";
      }
    };

    const onMouseMovePos = (e: MouseEvent) => {
      if (badge.style.display !== "none") {
        badge.style.left = `${e.clientX + 12}px`;
        badge.style.top = `${e.clientY - 24}px`;
      }
    };

    const onClick = (e: MouseEvent) => {
      if (!selectModeActive) return;
      const el = getEditableEl(e.target as Element);
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();

      // Снимаем предыдущий выбор
      document.querySelectorAll(".__editor_selected").forEach((s) => s.classList.remove("__editor_selected"));
      el.classList.add("__editor_selected");
      el.classList.remove("__editor_highlight");

      const rect = el.getBoundingClientRect();
      window.parent.postMessage({
        type: "ELEM_SELECTED",
        elemId: el.dataset.elemId,
        elemType: el.dataset.elemType ?? "card",
        sectionId: el.closest("[data-section]")?.getAttribute("data-section") ?? null,
        rect: {
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        },
      }, "*");
    };

    const onMouseLeave = () => {
      if (hoveredEl && !hoveredEl.classList.contains("__editor_selected")) {
        hoveredEl.classList.remove("__editor_highlight");
      }
      hoveredEl = null;
      badge.style.display = "none";
    };

    // Слушаем команды от родительского окна
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "ENABLE_SELECT_MODE") {
        selectModeActive = true;
        document.body.dataset.editorSelect = "1";
      }
      if (e.data?.type === "DISABLE_SELECT_MODE") {
        selectModeActive = false;
        delete document.body.dataset.editorSelect;
        document.querySelectorAll(".__editor_highlight,.__editor_selected").forEach((el) => {
          el.classList.remove("__editor_highlight", "__editor_selected");
        });
        badge.style.display = "none";
        hoveredEl = null;
      }
      if (e.data?.type === "UPDATE_ELEM_ANIM") {
        // Применяем анимацию к элементу в реальном времени
        const { elemId, hover_anim, scroll_anim } = e.data;
        const el = document.querySelector<HTMLElement>(`[data-elem-id="${elemId}"]`);
        if (!el) return;
        const JS_ANIMS = ["magnetic","tilt","spotlight","glitch","morph","flicker","rubber","swing","jello","float-up","trace","heartbeat","wipe","shockwave"];
        JS_ANIMS.forEach((a) => el.classList.remove(`anim-${a}`));
        if (hover_anim !== "inherit" && hover_anim !== "none" && JS_ANIMS.includes(hover_anim)) {
          el.classList.add(`anim-${hover_anim}`);
        }
        if (scroll_anim && scroll_anim !== "inherit") {
          el.dataset.elemScrollAnim = scroll_anim;
        }
      }
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mousemove", onMouseMovePos);
    document.addEventListener("click", onClick, true);
    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("message", onMessage);
    notifyReady();

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mousemove", onMouseMovePos);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("message", onMessage);
      style.remove();
      badge.remove();
    };
  }, [isEditorMode]);
}

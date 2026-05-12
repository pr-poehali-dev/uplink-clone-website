import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { CmsElementAnimation } from "@/hooks/useCmsContent";

declare global {
  interface Window {
    __INITIAL_ELEM_ANIMS__?: CmsElementAnimation[];
  }
}

const JS_ANIMS = [
  "magnetic", "tilt", "spotlight", "glitch", "morph", "flicker",
  "rubber", "swing", "jello", "float-up", "trace", "heartbeat", "wipe", "shockwave"
];

const CSS_HOVER_ANIMS = ["lift", "glow", "scale", "border-glow", "pulse", "shake", "ripple", "none"];

const SPEED_MAP: Record<string, string> = {
  fast: "0.35s",
  normal: "0.6s",
  slow: "1.1s",
};

const removeAllHoverClasses = (el: HTMLElement) => {
  JS_ANIMS.forEach((a) => el.classList.remove(`anim-${a}`));
  CSS_HOVER_ANIMS.forEach((a) => el.classList.remove(`elem-hover-${a}`));
};

/**
 * Нормализует hover_anims: объединяет новый массив и старое поле hover_anim.
 * Возвращает итоговый массив анимаций.
 */
function resolveHoverAnims(anim: CmsElementAnimation): string[] {
  const anims = Array.isArray(anim.hover_anims) && anim.hover_anims.length > 0
    ? anim.hover_anims
    : (anim.hover_anim && anim.hover_anim !== "inherit" ? [anim.hover_anim] : []);
  return anims.filter(Boolean);
}

/**
 * Применяет настройки анимации к одному элементу.
 * Поддерживает массив hover_anims — несколько классов одновременно.
 */
function applyAnimToElement(el: HTMLElement, anim: CmsElementAnimation) {
  removeAllHoverClasses(el);

  const anims = resolveHoverAnims(anim);
  anims.forEach((name) => {
    if (JS_ANIMS.includes(name)) {
      el.classList.add(`anim-${name}`);
    } else if (CSS_HOVER_ANIMS.includes(name)) {
      el.classList.add(`elem-hover-${name}`);
    }
  });

  // Скорость анимации
  if (anim.anim_speed !== "inherit" && SPEED_MAP[anim.anim_speed]) {
    el.style.setProperty("transition-duration", SPEED_MAP[anim.anim_speed], "important");
    el.dataset.elemAnimSpeed = anim.anim_speed;
  } else {
    el.style.removeProperty("transition-duration");
    delete el.dataset.elemAnimSpeed;
  }

  // Scroll-анимация
  if (anim.scroll_anim !== "inherit") {
    el.dataset.elemScrollAnim = anim.scroll_anim;
  } else {
    delete el.dataset.elemScrollAnim;
  }

  el.dataset.elemAnimApplied = "1";
}

function resetElementAnim(el: HTMLElement) {
  removeAllHoverClasses(el);
  el.style.removeProperty("transition-duration");
  delete el.dataset.elemAnimSpeed;
  delete el.dataset.elemScrollAnim;
  delete el.dataset.elemAnimApplied;
}

/**
 * Возвращает глобальный hover из body.dataset как fallback.
 */
function getGlobalHoverAnim(selector: string): string[] {
  const key = selector === ".hover-card" ? "hoverCards" : "hoverButtons";
  const val = (document.body.dataset[key] || "").trim();
  if (!val || val === "none") return [];
  return [val];
}

/**
 * Применяет глобальный JS-hover к элементу без персональных настроек.
 * CSS-hover (lift/glow/scale) работает через body data-атрибут автоматически.
 */
function applyGlobalAnimToElement(el: HTMLElement, selector: string) {
  removeAllHoverClasses(el);
  const anims = getGlobalHoverAnim(selector);
  anims.forEach((name) => {
    if (JS_ANIMS.includes(name)) el.classList.add(`anim-${name}`);
  });
}

/**
 * Главный хук для применения поэлементных анимаций.
 */
export function useElementAnimations(elementAnimations: CmsElementAnimation[] | undefined) {
  const location = useLocation();

  useLayoutEffect(() => {
    const initial = window.__INITIAL_ELEM_ANIMS__;
    if (!initial || initial.length === 0) return;
    initial.forEach((anim) => {
      document.querySelectorAll<HTMLElement>(`[data-elem-id="${anim.elem_id}"]`).forEach((el) => {
        applyAnimToElement(el, anim);
      });
    });
  }, [location.pathname]);

  useEffect(() => {
    if (!elementAnimations) return;

    window.__INITIAL_ELEM_ANIMS__ = elementAnimations;

    const animMap = new Map<string, CmsElementAnimation>();
    elementAnimations.forEach((a) => animMap.set(a.elem_id, a));

    let raf = 0;
    const apply = () => {
      // 1. Применяем персональные настройки
      animMap.forEach((anim, elemId) => {
        document.querySelectorAll<HTMLElement>(`[data-elem-id="${elemId}"]`).forEach((el) => {
          applyAnimToElement(el, anim);
        });
      });
      // 2. Сбрасываем элементы удалённые из конфига
      document.querySelectorAll<HTMLElement>("[data-elem-anim-applied]").forEach((el) => {
        const id = el.dataset.elemId;
        if (id && !animMap.has(id)) resetElementAnim(el);
      });
      // 3. Глобальный JS-hover для элементов БЕЗ персональных настроек
      for (const selector of [".hover-card", ".hover-btn"]) {
        document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
          if (el.dataset.elemAnimApplied) return;
          applyGlobalAnimToElement(el, selector);
        });
      }
    };

    apply();
    raf = requestAnimationFrame(apply);

    const observer = new MutationObserver((mutations) => {
      let needApply = false;
      for (const m of mutations) {
        if (m.type === "childList" && m.addedNodes.length > 0) {
          for (const node of Array.from(m.addedNodes)) {
            if (node.nodeType === 1) {
              const el = node as HTMLElement;
              if (el.hasAttribute("data-elem-id") || el.querySelector?.("[data-elem-id]")) {
                needApply = true;
                break;
              }
            }
          }
        }
        if (needApply) break;
      }
      if (needApply) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(apply);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [elementAnimations, location.pathname]);
}
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

// CSS hover-эффекты — через классы elem-hover-X
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
 * Применяет настройки анимации к одному элементу.
 */
function applyAnimToElement(el: HTMLElement, anim: CmsElementAnimation) {
  // Сначала чистим все возможные hover-классы (и JS, и CSS)
  removeAllHoverClasses(el);

  // Применяем JS или CSS hover-анимацию
  if (anim.hover_anim !== "inherit") {
    if (JS_ANIMS.includes(anim.hover_anim)) {
      el.classList.add(`anim-${anim.hover_anim}`);
    } else if (CSS_HOVER_ANIMS.includes(anim.hover_anim)) {
      el.classList.add(`elem-hover-${anim.hover_anim}`);
    }
  }

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
 * Главный хук для применения поэлементных анимаций.
 * - Применяет настройки сразу при загрузке контента
 * - Переприменяет при изменении роута (для lazy-страниц)
 * - Использует MutationObserver для динамически добавленных элементов
 */
export function useElementAnimations(elementAnimations: CmsElementAnimation[] | undefined) {
  const location = useLocation();

  // Применяем pre-hydration настройки СИНХРОННО при каждом ре-рендере (включая навигацию)
  // Это предотвращает мерцание — элементы получают правильную анимацию ДО IntersectionObserver
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

    // Обновляем глобальный массив для будущих навигаций (используется в useLayoutEffect)
    window.__INITIAL_ELEM_ANIMS__ = elementAnimations;

    const animMap = new Map<string, CmsElementAnimation>();
    elementAnimations.forEach((a) => animMap.set(a.elem_id, a));

    let raf = 0;
    const apply = () => {
      // Сначала применяем настройки ко всем найденным
      animMap.forEach((anim, elemId) => {
        document.querySelectorAll<HTMLElement>(`[data-elem-id="${elemId}"]`).forEach((el) => {
          applyAnimToElement(el, anim);
        });
      });
      // Потом сбрасываем элементы которые ранее были настроены, но сейчас удалены из конфига
      document.querySelectorAll<HTMLElement>("[data-elem-anim-applied]").forEach((el) => {
        const id = el.dataset.elemId;
        if (id && !animMap.has(id)) {
          resetElementAnim(el);
        }
      });
    };

    // Применяем сразу
    apply();
    // И ещё раз через RAF — на случай если компоненты ещё рендерятся
    raf = requestAnimationFrame(apply);

    // MutationObserver — реагирует на новые элементы (SPA навигация, lazy-загрузка)
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
        // Дебаунс через RAF
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
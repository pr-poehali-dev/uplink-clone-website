import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CmsElementAnimation } from "@/hooks/useCmsContent";

const JS_ANIMS = [
  "magnetic", "tilt", "spotlight", "glitch", "morph", "flicker",
  "rubber", "swing", "jello", "float-up", "trace", "heartbeat", "wipe", "shockwave"
];

const SPEED_MAP: Record<string, string> = {
  fast: "0.35s",
  normal: "0.6s",
  slow: "1.1s",
};

/**
 * Применяет настройки анимации к одному элементу.
 * Использует inline-стили через style.setProperty для гарантированного приоритета над Tailwind.
 */
function applyAnimToElement(el: HTMLElement, anim: CmsElementAnimation) {
  // Hover JS-анимация
  JS_ANIMS.forEach((a) => el.classList.remove(`anim-${a}`));
  if (anim.hover_anim !== "inherit" && anim.hover_anim !== "none" && JS_ANIMS.includes(anim.hover_anim)) {
    el.classList.add(`anim-${anim.hover_anim}`);
  }

  // Скорость анимации — устанавливаем CSS-переменную и transition-duration напрямую
  if (anim.anim_speed !== "inherit" && SPEED_MAP[anim.anim_speed]) {
    el.style.setProperty("transition-duration", SPEED_MAP[anim.anim_speed], "important");
    el.dataset.elemAnimSpeed = anim.anim_speed;
  } else {
    el.style.removeProperty("transition-duration");
    delete el.dataset.elemAnimSpeed;
  }

  // Scroll-анимация — устанавливаем атрибут (CSS-правила в index.css обработают через !important)
  if (anim.scroll_anim !== "inherit" && anim.scroll_anim !== "none") {
    el.dataset.elemScrollAnim = anim.scroll_anim;
  } else if (anim.scroll_anim === "none") {
    el.dataset.elemScrollAnim = "none";
  } else {
    delete el.dataset.elemScrollAnim;
  }

  // Помечаем что элемент обработан текущей версией настроек
  el.dataset.elemAnimApplied = "1";
}

/**
 * Сбрасывает анимации к дефолту (на случай если элемент был настроен раньше, а сейчас сброшен).
 */
function resetElementAnim(el: HTMLElement) {
  JS_ANIMS.forEach((a) => el.classList.remove(`anim-${a}`));
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

  useEffect(() => {
    if (!elementAnimations) return;

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

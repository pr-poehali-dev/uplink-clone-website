import { useEffect } from "react";

/**
 * Читает базовый transform элемента из CSS (не inline style).
 * Используется для восстановления transform после JS-анимации.
 */
function getBaseTransform(el: HTMLElement): string {
  // Если у элемента есть plan-highlighted — базовый scale 1.05
  if (el.classList.contains("plan-highlighted")) return "scale(1.05)";
  return "";
}

function applyMagnetic(el: HTMLElement) {
  const base = getBaseTransform(el);
  const onMouseMove = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.35;
    const dy = (e.clientY - cy) * 0.35;
    const extra = base ? ` ${base}` : "";
    el.style.transform = `translate(${dx}px, ${dy}px)${extra}`;
  };
  const onMouseLeave = () => {
    el.style.transform = base || "";
    el.style.transition = "transform 0.5s cubic-bezier(0.23,1,0.32,1)";
    setTimeout(() => {
      el.style.transition = "";
      if (!base) el.style.transform = "";
    }, 500);
  };
  el.addEventListener("mousemove", onMouseMove);
  el.addEventListener("mouseleave", onMouseLeave);
  return () => {
    el.removeEventListener("mousemove", onMouseMove);
    el.removeEventListener("mouseleave", onMouseLeave);
    el.style.transform = base || "";
  };
}

function applyTilt(el: HTMLElement) {
  const base = getBaseTransform(el);
  // Для premium — scale 1.05, для обычных — 1.02 при наведении
  const hoverScale = el.classList.contains("plan-highlighted") ? 1.07 : 1.02;
  const onMouseMove = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const tiltX = (y - 0.5) * -16;
    const tiltY = (x - 0.5) * 16;
    el.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${hoverScale})`;
  };
  const onMouseLeave = () => {
    el.style.transform = base
      ? `perspective(800px) rotateX(0deg) rotateY(0deg) ${base}`
      : "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)";
    el.style.transition = "transform 0.4s ease";
    setTimeout(() => {
      el.style.transition = "";
      el.style.transform = base || "";
    }, 400);
  };
  el.addEventListener("mousemove", onMouseMove);
  el.addEventListener("mouseleave", onMouseLeave);
  return () => {
    el.removeEventListener("mousemove", onMouseMove);
    el.removeEventListener("mouseleave", onMouseLeave);
    el.style.transform = base || "";
  };
}

function applySpotlight(el: HTMLElement) {
  const onMouseMove = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };
  el.addEventListener("mousemove", onMouseMove);
  return () => el.removeEventListener("mousemove", onMouseMove);
}

const JS_ANIM_HANDLERS: Record<string, (el: HTMLElement) => () => void> = {
  "anim-magnetic": applyMagnetic,
  "anim-tilt": applyTilt,
  "anim-spotlight": applySpotlight,
};

const ALL_JS_CLASSES = Object.keys(JS_ANIM_HANDLERS);

export function useInteractiveAnimations() {
  useEffect(() => {
    const bindings = new WeakMap<HTMLElement, Map<string, () => void>>();

    const syncElement = (el: HTMLElement) => {
      let map = bindings.get(el);
      if (!map) { map = new Map(); bindings.set(el, map); }

      const currentClasses = new Set<string>();
      ALL_JS_CLASSES.forEach((cls) => {
        if (el.classList.contains(cls)) currentClasses.add(cls);
      });

      for (const [cls, cleanup] of map) {
        if (!currentClasses.has(cls)) {
          cleanup();
          map.delete(cls);
        }
      }
      currentClasses.forEach((cls) => {
        if (!map!.has(cls)) {
          const handler = JS_ANIM_HANDLERS[cls];
          if (handler) map!.set(cls, handler(el));
        }
      });
    };

    const scanAll = () => {
      const selector = ALL_JS_CLASSES.map((c) => `.${c}`).join(",");
      document.querySelectorAll<HTMLElement>(selector).forEach(syncElement);
    };

    scanAll();

    const observer = new MutationObserver((mutations) => {
      const elementsToCheck = new Set<HTMLElement>();
      for (const m of mutations) {
        if (m.type === "childList") {
          m.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              const el = node as HTMLElement;
              ALL_JS_CLASSES.forEach((cls) => {
                if (el.classList?.contains(cls)) elementsToCheck.add(el);
                el.querySelectorAll?.<HTMLElement>(`.${cls}`).forEach((c) => elementsToCheck.add(c));
              });
            }
          });
        } else if (m.type === "attributes" && m.attributeName === "class") {
          elementsToCheck.add(m.target as HTMLElement);
        }
      }
      elementsToCheck.forEach(syncElement);
    });

    observer.observe(document.body, {
      childList: true, subtree: true,
      attributes: true, attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      const selector = ALL_JS_CLASSES.map((c) => `.${c}`).join(",");
      document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        const map = bindings.get(el);
        if (map) { map.forEach((cleanup) => cleanup()); map.clear(); }
      });
    };
  }, []);
}

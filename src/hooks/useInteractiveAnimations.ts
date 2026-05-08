import { useEffect } from "react";

function applyMagnetic(el: HTMLElement) {
  const onMouseMove = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.35;
    const dy = (e.clientY - cy) * 0.35;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  const onMouseLeave = () => {
    el.style.transform = "translate(0,0)";
    el.style.transition = "transform 0.5s cubic-bezier(0.23,1,0.32,1)";
    setTimeout(() => { el.style.transition = ""; }, 500);
  };
  el.addEventListener("mousemove", onMouseMove);
  el.addEventListener("mouseleave", onMouseLeave);
  return () => {
    el.removeEventListener("mousemove", onMouseMove);
    el.removeEventListener("mouseleave", onMouseLeave);
  };
}

function applyTilt(el: HTMLElement) {
  const onMouseMove = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const tiltX = (y - 0.5) * -20;
    const tiltY = (x - 0.5) * 20;
    el.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
  };
  const onMouseLeave = () => {
    el.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)";
    el.style.transition = "transform 0.4s ease";
    setTimeout(() => { el.style.transition = ""; }, 400);
  };
  el.addEventListener("mousemove", onMouseMove);
  el.addEventListener("mouseleave", onMouseLeave);
  return () => {
    el.removeEventListener("mousemove", onMouseMove);
    el.removeEventListener("mouseleave", onMouseLeave);
  };
}

function applySpotlight(el: HTMLElement) {
  const onMouseMove = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--mouse-x", `${x}px`);
    el.style.setProperty("--mouse-y", `${y}px`);
  };
  el.addEventListener("mousemove", onMouseMove);
  return () => el.removeEventListener("mousemove", onMouseMove);
}

const JS_ANIM_HANDLERS: Record<string, (el: HTMLElement) => () => void> = {
  "anim-magnetic": applyMagnetic,
  "anim-tilt": applyTilt,
  "anim-spotlight": applySpotlight,
};

export function useInteractiveAnimations() {
  useEffect(() => {
    const cleanups: (() => void)[] = [];

    Object.entries(JS_ANIM_HANDLERS).forEach(([cls, handler]) => {
      document.querySelectorAll<HTMLElement>(`.${cls}`).forEach((el) => {
        cleanups.push(handler(el));
      });
    });

    // MutationObserver — подхватывает новые элементы (SPA навигация)
    const observer = new MutationObserver(() => {
      Object.entries(JS_ANIM_HANDLERS).forEach(([cls, handler]) => {
        document.querySelectorAll<HTMLElement>(`.${cls}:not([data-anim-bound])`).forEach((el) => {
          el.dataset.animBound = "1";
          cleanups.push(handler(el));
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cleanups.forEach((fn) => fn());
      observer.disconnect();
    };
  }, []);
}

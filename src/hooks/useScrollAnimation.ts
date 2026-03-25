import { CSSProperties, useEffect, useRef, useState } from "react";

export function useScrollAnimation(threshold = 0.1, delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"hidden" | "animating" | "done">("hidden");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function trigger() {
      // Set animating (applies transitionDelay + switches to visible classes)
      setState("animating");
      // After animation completes — remove transitionDelay so hover works instantly
      const cleanup = setTimeout(() => setState("done"), delay + 1100);
      return cleanup;
    }

    const rect = el.getBoundingClientRect();
    const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;

    if (alreadyVisible) {
      const t = trigger();
      return () => clearTimeout(t);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          const t = trigger();
          (el as HTMLElement & { _t?: ReturnType<typeof setTimeout> })._t = t;
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      const t = (el as HTMLElement & { _t?: ReturnType<typeof setTimeout> })._t;
      if (t) clearTimeout(t);
    };
  }, [threshold, delay]);

  const isVisible = state !== "hidden";

  // Keep transitionDelay while animating; remove after done (so hover is instant)
  const animationStyle: CSSProperties =
    state === "animating" ? { transitionDelay: `${delay}ms` } : {};

  return { ref, isVisible, animationStyle };
}

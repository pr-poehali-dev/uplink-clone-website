import { CSSProperties, useEffect, useRef, useState } from "react";

export function useScrollAnimation(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

// Extended version for staggered cards — clears delay after animation completes
export function useScrollAnimationDelayed(threshold = 0.15, delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"hidden" | "animating" | "done">("hidden");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          // Start animation after stagger delay
          const t1 = setTimeout(() => {
            setState("animating");
            // Clear delay after animation completes so hover is instant
            const t2 = setTimeout(() => setState("done"), 800);
            (el as HTMLElement & { _t2?: ReturnType<typeof setTimeout> })._t2 = t2;
          }, delay);
          (el as HTMLElement & { _t1?: ReturnType<typeof setTimeout> })._t1 = t1;
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      const e = el as HTMLElement & { _t1?: ReturnType<typeof setTimeout>; _t2?: ReturnType<typeof setTimeout> };
      if (e._t1) clearTimeout(e._t1);
      if (e._t2) clearTimeout(e._t2);
    };
  }, [threshold, delay]);

  const isVisible = state !== "hidden";
  const animationStyle: CSSProperties = state === "animating" ? { transitionDelay: "0ms" } : {};

  return { ref, isVisible, animationStyle };
}

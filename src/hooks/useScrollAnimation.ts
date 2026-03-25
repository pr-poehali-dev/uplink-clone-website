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
          // Switch to "animating" — CSS transition fires with transitionDelay applied
          setState("animating");
          // After delay + transition duration — remove delay so hover is instant
          const t = setTimeout(() => setState("done"), delay + 800);
          (el as HTMLElement & { _t?: ReturnType<typeof setTimeout> })._t = t;
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      const t = (el as HTMLElement & { _t?: ReturnType<typeof setTimeout> })._t;
      if (t) clearTimeout(t);
    };
  }, [threshold, delay]);

  const isVisible = state !== "hidden";
  // Keep transitionDelay during hidden→animating transition; clear after done
  const animationStyle: CSSProperties = state !== "done" ? { transitionDelay: `${delay}ms` } : {};

  return { ref, isVisible, animationStyle };
}
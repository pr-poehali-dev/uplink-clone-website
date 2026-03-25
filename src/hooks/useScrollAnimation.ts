import React, { useEffect, useRef, useState } from "react";

export function useScrollAnimation(threshold = 0.1, delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check if already in viewport on mount
    const rect = el.getBoundingClientRect();
    const alreadyVisible =
      rect.top < window.innerHeight && rect.bottom > 0;

    if (alreadyVisible) {
      const t = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(t);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          const t = setTimeout(() => setIsVisible(true), delay);
          // No cleanup needed after fire, but store for potential unmount
          (el as HTMLElement & { _animTimer?: ReturnType<typeof setTimeout> })._animTimer = t;
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      const t = (el as HTMLElement & { _animTimer?: ReturnType<typeof setTimeout> })._animTimer;
      if (t) clearTimeout(t);
    };
  }, [threshold, delay]);

  // Always keep transitionDelay in style so CSS transition applies correctly
  const animationStyle: React.CSSProperties = isVisible
    ? {}
    : { transitionDelay: `${delay}ms` };

  return { ref, isVisible, animationStyle };
}
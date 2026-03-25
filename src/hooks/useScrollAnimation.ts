import { useEffect, useRef, useState } from "react";

export function useScrollAnimation(threshold = 0.15, delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [delayCleared, setDelayCleared] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setIsVisible(true);
              setTimeout(() => setDelayCleared(true), delay + 750);
            });
          });
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, delay]);

  const animationStyle = delayCleared
    ? {}
    : { transitionDelay: `${delay}ms` };

  return { ref, isVisible, animationStyle };
}

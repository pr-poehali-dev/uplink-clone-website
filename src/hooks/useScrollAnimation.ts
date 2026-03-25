import { useEffect, useRef, useState } from "react";

export function useScrollAnimation(threshold = 0.15, delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [delayCleared, setDelayCleared] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
          setTimeout(() => setDelayCleared(true), delay + 700);
        }
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, delay]);

  const animationStyle = delayCleared
    ? {}
    : { transitionDelay: `${delay}ms` };

  return { ref, isVisible, animationStyle };
}

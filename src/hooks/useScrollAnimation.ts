import { useEffect, useRef, useState } from "react";

export function useScrollAnimation(threshold = 0.05) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
            // После завершения transition-анимации добавляем anim-done,
            // который снимает все transform/opacity ограничения
            // чтобы hover-эффекты работали свободно
            const onEnd = () => {
              el.classList.add("anim-done");
              el.removeEventListener("transitionend", onEnd);
            };
            el.addEventListener("transitionend", onEnd, { once: true });
            // Fallback на случай если transitionend не сработал (нет анимации)
            setTimeout(() => {
              el.classList.add("anim-done");
              el.removeEventListener("transitionend", onEnd);
            }, 1200);
          }, 50);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

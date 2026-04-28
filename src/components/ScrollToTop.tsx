import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    // Если перешли на другой путь (не просто сменился hash)
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      // Если нет якоря — скроллим наверх
      if (!hash) {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    }
  }, [pathname, hash]);

  return null;
}

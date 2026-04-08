import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const COOKIE_KEY = "cookie_consent_accepted";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(COOKIE_KEY);
    if (!accepted) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none">
      <div
        className="pointer-events-auto max-w-3xl mx-auto rounded-2xl border border-white/10 bg-[#0d1424]/95 backdrop-blur-md shadow-2xl shadow-black/50 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        style={{ boxShadow: "0 0 40px rgba(0,0,0,0.6), 0 0 1px rgba(6,182,212,0.2)" }}
      >
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mt-0.5">
            <Icon name="Cookie" size={15} className="text-cyan-400" />
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            Мы используем файлы{" "}
            <span className="text-white font-medium">cookie</span>, чтобы сайт работал корректно и загружался быстрее при повторных визитах.{" "}
            <a href="/privacy" className="text-cyan-400 hover:underline">
              Политика конфиденциальности
            </a>
          </p>
        </div>
        <button
          onClick={accept}
          className="flex-shrink-0 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#080c14] text-sm font-semibold transition-colors duration-200 whitespace-nowrap"
        >
          Принять
        </button>
      </div>
    </div>
  );
}
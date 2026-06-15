import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  applyDefaultTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "uplink_theme";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "light") {
    root.classList.add("light");
    root.classList.remove("dark");
  } else {
    root.classList.add("dark");
    root.classList.remove("light");
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    // Если пользователь сам выбрал тему — уважаем его выбор
    if (saved === "light" || saved === "dark") return saved;
    // Иначе тема по умолчанию из CMS (записывается DesignApplicator), fallback — тёмная
    const cmsDefault = localStorage.getItem("cms_default_theme") as Theme | null;
    return cmsDefault === "light" ? "light" : "dark";
  });
  // Отметка, что пользователь вручную переключал тему
  const [userOverride, setUserOverride] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) != null;
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggleTheme = () => {
    setUserOverride(true);
    setThemeState((p) => {
      const next = p === "dark" ? "light" : "dark";
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { void e; }
      return next;
    });
  };

  // Применить тему по умолчанию из CMS (если пользователь не переключал вручную)
  const applyDefaultTheme = (t: Theme) => {
    try { localStorage.setItem("cms_default_theme", t); } catch (e) { void e; }
    if (!userOverride) setThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, applyDefaultTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return { theme: "dark" as Theme, toggleTheme: () => {}, setTheme: () => {}, applyDefaultTheme: () => {} };
  }
  return ctx;
}
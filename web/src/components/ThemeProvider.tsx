import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { registry, type ThemeComponents, type ThemeId } from "../themes/registry";

const ThemeContext = createContext<ThemeComponents>(registry.notion);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeId>(() => {
    const stored = localStorage.getItem("theme") as ThemeId | null;
    return stored && stored in registry ? stored : "notion";
  });
  useEffect(() => {
    const update = () => setTheme((document.documentElement.dataset.theme as ThemeId) || "notion");
    update();
    window.addEventListener("storage", update);
    window.addEventListener("theme-change", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("theme-change", update);
    };
  }, []);
  return <ThemeContext.Provider value={registry[theme]}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

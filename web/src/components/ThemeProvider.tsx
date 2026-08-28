import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { registry, THEME_IDS, type ThemeComponents, type ThemeId } from "../themes/registry";

const themeColors: Record<ThemeId, string> = {
  notion: "#ffffff",
  brutalist: "#0a0a0a",
  pixel: "#2b1b6b",
  neon: "#05060a",
};

type ThemeContextValue = {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  components: ThemeComponents;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "notion",
  setTheme: () => undefined,
  components: registry.notion,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeId>(() => {
    const stored = localStorage.getItem("theme") as ThemeId | null;
    return stored && THEME_IDS.includes(stored) ? stored : "notion";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColors[theme]);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, components: registry[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

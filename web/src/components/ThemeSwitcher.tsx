import { useEffect, useRef, useState } from "react";
import { THEME_IDS, THEME_LABELS, type ThemeId } from "../themes/registry";

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeId>(() => {
    const stored = localStorage.getItem("theme") as ThemeId | null;
    return stored && THEME_IDS.includes(stored) ? stored : "notion";
  });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(THEME_IDS.indexOf(theme));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const choose = (id: ThemeId) => {
    setTheme(id);
    setActive(THEME_IDS.indexOf(id));
    setOpen(false);
    window.dispatchEvent(new CustomEvent("theme-change", { detail: id }));
  };

  return (
    <div className="relative z-20" ref={ref}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="border border-border bg-surface px-3 py-2 text-xs font-medium text-fg rounded-theme"
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
          if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); setActive((active + 1) % THEME_IDS.length); }
          if (event.key === "ArrowUp") { event.preventDefault(); setOpen(true); setActive((active - 1 + THEME_IDS.length) % THEME_IDS.length); }
          if (event.key === "Enter" && open) choose(THEME_IDS[active]);
        }}
      >
        Theme: {THEME_LABELS[theme]} <span aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div role="listbox" aria-label="Choose theme" className="absolute right-0 mt-2 min-w-40 border border-border bg-surface p-1 rounded-theme shadow-card">
          {THEME_IDS.map((id, index) => (
            <button
              type="button"
              role="option"
              aria-selected={theme === id}
              key={id}
              className={`block w-full px-3 py-2 text-left text-xs text-fg ${active === index ? "bg-bg text-accent" : ""}`}
              onMouseEnter={() => setActive(index)}
              onClick={() => choose(id)}
            >
              {THEME_LABELS[id]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

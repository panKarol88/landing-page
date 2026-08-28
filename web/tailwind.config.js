/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        fg: "var(--color-text)",
        muted: "var(--color-muted)",
        border: "var(--color-border)",
        accent: "var(--color-accent)",
        "accent-2": "var(--color-accent-2)",
      },
      fontFamily: {
        sans: "var(--font-sans)",
        display: "var(--font-display)",
        mono: "var(--font-mono)",
      },
      borderRadius: {
        theme: "var(--radius)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
      },
      spacing: {
        section: "var(--space-section)",
      },
      fontSize: {
        hero: "var(--font-size-hero)",
        "page-title": "var(--font-size-page-title)",
        "section-title": "var(--font-size-section-title)",
      },
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "var(--color-text)",
            "--tw-prose-headings": "var(--color-text)",
            "--tw-prose-lead": "var(--color-muted)",
            "--tw-prose-links": "var(--color-accent)",
            "--tw-prose-bold": "var(--color-text)",
            "--tw-prose-counters": "var(--color-muted)",
            "--tw-prose-bullets": "var(--color-accent)",
            "--tw-prose-hr": "var(--color-border)",
            "--tw-prose-quotes": "var(--color-text)",
            "--tw-prose-quote-borders": "var(--color-accent)",
            "--tw-prose-captions": "var(--color-muted)",
            "--tw-prose-code": "var(--color-text)",
            "--tw-prose-pre-code": "var(--color-text)",
            "--tw-prose-pre-bg": "var(--color-surface)",
            "--tw-prose-th-borders": "var(--color-border)",
            "--tw-prose-td-borders": "var(--color-border)",
            fontFamily: "var(--font-sans)",
            code: {
              "&::before": {
                content: "none",
              },
              "&::after": {
                content: "none",
              },
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

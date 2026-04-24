/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Bungee"', "system-ui", "sans-serif"],
        display: ['"Bungee"', "system-ui", "sans-serif"],
      },
      colors: {
        // Backgrounds
        "bg-base": "#080E1A",
        "bg-depth": "#0B1220",
        "bg-surface": "rgba(255,255,255,0.04)",
        "bg-surface-2": "rgba(255,255,255,0.07)",
        "bg-input": "#0A1628",
        // Primary — Calming Teal
        primary: {
          DEFAULT: "#14B8A6",
          bright: "#2DD4BF",
          dim: "#0D9488",
          glow: "#99F6E4",
          muted: "rgba(20,184,166,0.15)",
          xmuted: "rgba(20,184,166,0.07)",
        },
        // Accent — Cyan
        accent: {
          DEFAULT: "#22D3EE",
          dim: "#0891B2",
          glow: "#A5F3FC",
        },
        // Text
        "text-heading": "#F0FDFA",
        "text-body": "#CBD5E1",
        "text-subtle": "#94A3B8",
        "text-muted": "#475569",
        // Borders
        "border-glass": "rgba(255,255,255,0.08)",
        "border-glass-hover": "rgba(255,255,255,0.14)",
        "border-primary": "rgba(20,184,166,0.3)",
        "border-subtle": "rgba(255,255,255,0.05)",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        "glass-hover":
          "0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(20,184,166,0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
        "glow-primary": "0 0 24px rgba(20,184,166,0.3), 0 0 48px rgba(20,184,166,0.12)",
        "glow-sm": "0 0 12px rgba(20,184,166,0.35)",
        dock: "0 -4px 24px rgba(0,0,0,0.4), 0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)",
        "input-focus": "0 0 0 2px rgba(20,184,166,0.3), 0 4px 24px rgba(0,0,0,0.5)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

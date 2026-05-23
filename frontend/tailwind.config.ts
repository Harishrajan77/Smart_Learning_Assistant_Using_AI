import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
      colors: {
        border: "rgba(148, 163, 184, 0.18)",
        input: "rgba(30, 41, 59, 0.9)",
        ring: "#38bdf8",
        background: "#020617",
        foreground: "#e2e8f0",
        primary: {
          DEFAULT: "#22d3ee",
          foreground: "#082f49",
        },
        secondary: {
          DEFAULT: "#111827",
          foreground: "#e5e7eb",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(34, 211, 238, 0.15), 0 12px 32px rgba(15, 23, 42, 0.4)",
      },
      backgroundImage: {
        grid: "radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.12) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
} satisfies Config;

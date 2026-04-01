import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        panel: "#0f172a",
        border: "#1f2937",
        accent: "#a855f7"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(168,85,247,0.2), 0 30px 80px rgba(88,28,135,0.25)"
      },
      backgroundImage: {
        grid: "linear-gradient(to right, rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.08) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
} satisfies Config;

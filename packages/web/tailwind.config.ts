import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        accent: "#7B3FE4",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(123, 63, 228, 0.2), 0 24px 80px rgba(15, 23, 42, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;

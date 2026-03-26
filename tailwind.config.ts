import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0C0B0E",
        surface: "#16151A",
        border: "#2A2930",
        "border-focus": "#5B4FE8",
        text: "#E8E6EF",
        "text-muted": "#8A8895",
        accent: "#5B4FE8",
        "twitter-blue": "#1D9BF0",
        "reddit-orange": "#FF4500",
        "xhs-red": "#FF2442",
        "score-green": "#34D399",
        "score-yellow": "#FBBF24",
        "score-red": "#F87171",
      },
      fontFamily: {
        garamond: ["EB Garamond", "Noto Serif SC", "serif"],
        sans: ["DM Sans", "Noto Sans SC", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#0d0f12",
          900: "#14171b",
          800: "#1c2025",
          700: "#272c33",
          600: "#3a4048",
        },
        cream: "#f4f2ec",
        accent: {
          DEFAULT: "#5b8def",
          light: "#8fb3f5",
        },
        warn: "#e0a45c",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;

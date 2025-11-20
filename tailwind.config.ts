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
        background: "#FFFFFF",
        textPrimary: "#111111",
        textSecondary: "#4A4A4A",
        border: "#E5E5E5",
        accent: "#F5F5F5",
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tight: "-0.01em",
      },
      lineHeight: {
        relaxed: "1.75",
      },
    },
  },
  plugins: [],
};
export default config;

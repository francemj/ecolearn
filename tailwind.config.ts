import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        serif: ["Merriweather", "Georgia", "serif"],
      },
      colors: {
        'deep-purple': '#0d0b33',
        'dark-purple': '#4c2f6f',
        'medium-purple': '#52489f',
        'pink-accent': '#c266a7',
        'lavender-light': '#e7c8e7',
      },
    },
  },
  plugins: [],
};
export default config;

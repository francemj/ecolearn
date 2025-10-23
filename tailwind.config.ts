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
        'dark-slate': '#161d23',
        'dark-teal': '#0f444c',
        'dark-green': '#114538',
        'sage-green': '#5e8d83',
        'sage-light': '#d2e1cc',
      },
    },
  },
  plugins: [],
};
export default config;

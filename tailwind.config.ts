import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17202a",
        paper: "#f7f8fb",
        line: "#d7dde8",
        accent: "#0f766e"
      }
    }
  },
  plugins: []
};

export default config;

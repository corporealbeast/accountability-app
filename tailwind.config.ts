import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "wolf-gray": "#2C2F33",
        "wolf-gray-light": "#36393F",
        "wolf-gray-dark": "#23262A",
        "powder-blue": "#B0E0E6",
        "powder-blue-dark": "#8ACDD4",
      },
    },
  },
  plugins: [],
};

export default config;

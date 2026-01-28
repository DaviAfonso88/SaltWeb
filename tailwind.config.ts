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
        primary: {
          DEFAULT: "#92348c",
          light: "#a74e9f",
          dark: "#7a2b74",
          lighter: "#c06bb8",
          darker: "#6a2564",
        },
        secondary: "#f2a900",
        background: "#0a0a0b",
        foreground: "#fafafa",
        "muted-foreground": "#a1a1aa",
        card: "#1a1a1d",
        border: "#ffffff",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-poppins)", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        "gradient-xy": {
          "0%, 100%": {
            "background-size": "400% 400%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        "shimmer": {
          "0%": {
            "background-position": "-1000px 0",
          },
          "100%": {
            "background-position": "1000px 0",
          },
        },
        "pulse-glow": {
          "0%, 100%": {
            opacity: "0.5",
          },
          "50%": {
            opacity: "1",
          },
        },
      },
      animation: {
        "animate-gradient-xy": "gradient-xy 15s ease infinite",
        "animate-shimmer": "shimmer 3s linear infinite",
        "animate-pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
      boxShadow: {
        "glow": "0 0 20px rgba(146, 52, 140, 0.3)",
        "glow-lg": "0 0 40px rgba(146, 52, 140, 0.4)",
        "inner-glow": "inset 0 0 20px rgba(146, 52, 140, 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;

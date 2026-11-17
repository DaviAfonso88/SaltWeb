import type { Config } from "tailwindcss";

// Tokens e tema vivem em app/globals.css (@theme). Este arquivo existe apenas para
// ferramentas (shadcn CLI) que ainda o procuram.
const config: Config = {
  content: [
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
};

export default config;

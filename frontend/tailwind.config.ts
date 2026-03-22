import type { Config } from "tailwindcss";

/**
 * Configuration Tailwind ciblée sur l’interface publique.
 * On reste minimal et lisible : la palette est appliquée via classes utilitaires.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;


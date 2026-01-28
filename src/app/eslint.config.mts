import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default defineConfig([
  {
    ignores: ["node_modules/**", ".next/**", "dist/**", "build/**"],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Next rules (compat mode para usar eslint-config-next no flat config)
  ...compat.extends("next", "next/core-web-vitals"),

  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
  },
]);

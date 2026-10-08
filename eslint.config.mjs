import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Prefer arrow functions. `export default function` (Next.js pages/layouts) stays allowed.
    rules: {
      "func-style": ["error", "expression"],
      "prefer-arrow-callback": "error",
      "padding-line-between-statements": ["error", { blankLine: "always", prev: "*", next: "return" }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

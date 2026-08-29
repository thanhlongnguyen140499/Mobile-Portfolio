import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    /*
     * React Three Fiber's entire model is mutating three.js objects imperatively
     * inside useFrame — that's the render loop, sixty times a second, and it is
     * deliberately outside React's render cycle. The compiler's immutability rule
     * reads every one of those as a bug. Scoped to the scene so the rule keeps
     * doing its job everywhere else.
     */
    files: ["src/components/scene/**/*.tsx"],
    rules: {
      "react-hooks/immutability": "off",
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

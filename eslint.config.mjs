// ESLint 9 flat config, shared across every package in the workspace.
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: ["**/dist/**", "**/dist-installers/**", "**/node_modules/**", "**/android/**", "**/ios/**"],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off", // this is CLI and server code, console output is the point
    },
  },
  prettierConfig,
);

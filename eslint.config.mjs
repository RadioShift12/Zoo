import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended, // This replaces "extends": "eslint:recommended"
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "semi": ["error", "always"],      // Force semicolons
      "no-unused-vars": ["warn"],       // Warn about unused variables
      //"prefer-const": "error",          // Suggest const for Panda/Tiger
      "no-console": "off"               // Ensure console.log is allowed
    },
  },
];
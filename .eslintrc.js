/**
 * ESLint Configuration
 *
 * This file configures ESLint for the project, ensuring consistent
 * code style and quality across all JavaScript files.
 */
module.exports = {
  env: {
    node: true,
    browser: true,
    es2021: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
  },
  rules: {
    // Error prevention
    "no-unused-vars": "warn",
    "no-undef": "error",

    // Style consistency
    indent: ["warn", 2],
    quotes: ["warn", "double"],
    semi: ["warn", "never"],

    // Best practices
    "no-console": "off", // Allow console for this project
    eqeqeq: ["warn", "always"],

    // ES6 features
    "arrow-spacing": ["warn", { before: true, after: true }],
    "prefer-const": "warn",
    "prefer-template": "warn",
  },
}

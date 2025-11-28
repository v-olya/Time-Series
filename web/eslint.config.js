const tsPlugin = require('@typescript-eslint/eslint-plugin');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const jsxA11yPlugin = require('eslint-plugin-jsx-a11y');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = [
  // top-level ignores
  {
    ignores: ['node_modules/', '.next/', 'public/static/'],
  },
  // apply rules to JS/TS files using flat config (no `extends`)
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: { React: 'readonly' },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'warn',
      // React settings
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      // React hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // Accessibility (keep defaults light)
      'jsx-a11y/anchor-is-valid': 'off',
      // TypeScript
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
    },
    settings: {
      react: { version: 'detect' },
    },
  },
];

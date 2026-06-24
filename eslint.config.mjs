import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleSort from 'eslint-plugin-simple-import-sort';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    settings: {
      react: {
        version: '19.0',
      },
    },
    plugins: {
      'simple-import-sort': simpleSort,
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      eslintPluginPrettierRecommended,
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react/prefer-stateless-function': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // 'react/prefer-stateless-function': 'error',
      'react/button-has-type': 'error',
      'react/no-unused-prop-types': 'error',
      'react/jsx-pascal-case': 'error',
      'react/jsx-no-script-url': 'error',
      'react/no-children-prop': 'error',
      'react/no-danger': 'error',
      'react/no-danger-with-children': 'error',
      'react/no-unstable-nested-components': ['error', { allowAsProps: true }],
      'react/jsx-fragments': 'error',
      'react/destructuring-assignment': ['error', 'always', { destructureInSignature: 'always' }],
      'react/jsx-no-leaked-render': ['error', { validStrategies: ['ternary'] }],
      'react/jsx-max-depth': ['error', { max: 8 }],
      'react/function-component-definition': ['warn', { namedComponents: 'arrow-function' }],
      'react/jsx-key': [
        'error',
        {
          checkFragmentShorthand: true,
          checkKeyMustBeforeSpread: true,
          warnOnDuplicates: true,
        },
      ],
      'react/jsx-no-useless-fragment': 'warn',
      'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],
      'react/no-typos': 'warn',
      'react/display-name': 'warn',
      'react/self-closing-comp': 'warn',
      'react/jsx-sort-props': ['warn', { callbacksLast: true, shorthandFirst: true, reservedFirst: true }],
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // Сортировка импортов
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000'], // Side effects
            ['^react$', '^@?\\w'],
            ['^@(/.*|$)'],
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            ['^.+\\.module\\.(css|scss)$'],
            ['^.+\\.(gif|png|svg|jpg)$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },
]);

export default eslintConfig;

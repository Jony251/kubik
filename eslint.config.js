// ESLint setup per ADR 0013 (docs/adr/0013-eslint-flat-config-and-kids-purity.md).
import js from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import prettier from 'eslint-config-prettier';
import i18next from 'eslint-plugin-i18next';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const KIDS_CODE = ['apps/web/src/{games,mechanics}/**/*.{ts,tsx}'];
const USE_ENGINE = 'Games are pure: use rng/clock/audio/progress from engine props (principle 2).';

const OWNED_BY_ENGINE = [
  'setTimeout',
  'setInterval',
  'requestAnimationFrame',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'speechSynthesis',
  'fetch',
];

/** Principle 2: games/** and mechanics/** get time, randomness, storage and sound only from the engine. */
export const kidsPurity = [
  {
    name: 'kubik/kids-purity',
    files: KIDS_CODE,
    ignores: ['**/*.test.*'],
    rules: {
      'no-restricted-properties': [
        'error',
        { object: 'Math', property: 'random', message: `Math.random: ${USE_ENGINE}` },
        { object: 'Date', property: 'now', message: `Date.now: ${USE_ENGINE}` },
        { object: 'performance', property: 'now', message: `performance.now: ${USE_ENGINE}` },
        { object: 'crypto', property: 'getRandomValues', message: `crypto.getRandomValues: ${USE_ENGINE}` },
        { object: 'crypto', property: 'randomUUID', message: `crypto.randomUUID: ${USE_ENGINE}` },
        ...['window', 'globalThis', 'self'].flatMap((object) =>
          OWNED_BY_ENGINE.map((property) => ({
            object,
            property,
            message: `${object}.${property}: ${USE_ENGINE}`,
          })),
        ),
      ],
      'no-restricted-globals': [
        'error',
        ...[...OWNED_BY_ENGINE, 'queueMicrotask', 'Audio', 'AudioContext', 'XMLHttpRequest', 'WebSocket'].map(
          (name) => ({ name, message: `${name}: ${USE_ENGINE}` }),
        ),
      ],
      'no-restricted-syntax': [
        'error',
        { selector: "NewExpression[callee.name='Date']", message: `new Date(): ${USE_ENGINE}` },
        { selector: "CallExpression[callee.name='Date']", message: `Date(): ${USE_ENGINE}` },
        {
          selector: 'NewExpression[callee.name=/^(Audio|AudioContext|webkitAudioContext)$/]',
          message: `new Audio/AudioContext: ${USE_ENGINE}`,
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: 'idb-keyval', message: `idb-keyval: ${USE_ENGINE}` }],
          patterns: [
            { group: ['react-dom', 'react-dom/*'], message: `react-dom: ${USE_ENGINE}` },
            { group: ['@sentry/*'], message: `@sentry/*: ${USE_ENGINE}` },
            {
              group: ['**/engine/internal/**', '**/audio/**', '**/progress/**'],
              message: `engine internals, audio and progress: ${USE_ENGINE}`,
            },
          ],
        },
      ],
    },
  },
];

/** Principle 3: user-visible JSX text goes through i18n. */
export const i18nLiteral = [
  {
    name: 'kubik/i18n-literal',
    files: ['apps/web/src/{app,ui,engine,mechanics,games}/**/*.tsx'],
    plugins: { i18next },
    rules: {
      'i18next/no-literal-string': [
        'error',
        {
          mode: 'jsx-only',
          'jsx-attributes': {
            include: ['alt', 'title', 'placeholder', 'aria-label', 'aria-description', 'label'],
          },
          words: { exclude: [/^[\p{N}\p{P}\p{S}\s]*$/u] },
          callees: { exclude: ['t', 'i18n.t'] },
        },
      ],
    },
  },
];

export default defineConfig([
  globalIgnores(['**/dist/', '**/coverage/', 'docs/planning/']),
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // Config files and lint fixtures (linted from memory, not on disk) have no tsconfig.
    files: ['**/*.js', '**/*.mjs', '**/*.config.*', 'tools/**/*.js', '**/__lint_fixture__/**'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    files: ['**/*.{js,mjs}', 'apps/ingest/**', 'apps/api/**', '**/*.config.*'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['apps/web/src/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite, jsxA11y.flatConfigs.recommended],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['**/*.test.{ts,tsx,js,mjs}'],
    plugins: { vitest },
    rules: {
      ...vitest.configs.recommended.rules,
      'vitest/no-focused-tests': 'error',
      'vitest/no-disabled-tests': 'error',
    },
  },
  {
    files: ['tests/**'],
    languageOptions: { globals: vitest.environments.env.globals },
  },
  kidsPurity,
  i18nLiteral,
  prettier,
]);

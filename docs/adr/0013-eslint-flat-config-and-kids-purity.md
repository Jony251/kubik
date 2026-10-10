# 0013. ESLint flat config and kids-purity bans

- **Status:** Accepted
- **Date:** 2026-10-10
- **Source:** D13, `docs/planning/research/architect.md` §8

## Context

Principle 2: a game is pure functions and data; time, randomness, storage and sound come only from the engine ([0006](0006-game-module-contract.md)). User-visible text goes through i18n. Focused or skipped tests must never reach `main`.

## Decision

One root `eslint.config.js` (ESM, `defineConfig` + `globalIgnores`), run with `--max-warnings 0`:

- `typescript-eslint` `recommendedTypeChecked` with `projectService` for TypeScript (for `no-floating-promises` and `no-misused-promises`); `disableTypeChecked` for JavaScript, config files and in-memory lint fixtures.
- `react-hooks`, `react-refresh` and `jsx-a11y` for `apps/web/src`.
- `@vitest/eslint-plugin`: `no-focused-tests` and `no-disabled-tests` as errors. This replaces `no-only-tests` from the plan and also covers `skipIf`, `todo` and chained forms.
- `eslint-plugin-i18next` `no-literal-string` (`jsx-only`, error) in `app`, `ui`, `engine`, `mechanics` and `games`.
- `eslint-config-prettier` last.

The bans for `apps/web/src/{games,mechanics}/**` are exported as `kidsPurity` and use only core rules: `no-restricted-properties`, `no-restricted-globals`, `no-restricted-syntax` and `no-restricted-imports`. Each message names the banned API and points to the engine. Tests and testkits are excluded.

## Rejected alternatives

- **Third-party purity plugins** (`eslint-plugin-functional` and similar): noisy and off target.
- **`eslint-plugin-boundaries`:** overkill for four zones; `no-restricted-imports` is enough.
- **Hand-written `no-restricted-syntax` for `.only`/`.skip`:** misses Vitest-specific forms.

## Consequences

- Aliasing (`const M = Math`) is not caught by ESLint; the contract tests (determinism under a seed, `getTimerCount() === 0`) are the second line of defence.
- `tests/repo/eslint-bans.test.mjs` lints a violating fixture per banned API through the real config.

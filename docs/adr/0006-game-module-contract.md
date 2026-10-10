# 0006. `GameModule` contract, executed by `runGameContract`

- **Status:** Accepted
- **Date:** 2026-10-06
- **Source:** D6, `docs/planning/research/architect.md` §8

## Context

Seven games share one engine. Games must be deterministic and testable without a browser, and the engine must own every side effect.

## Decision

A game exports pure `generateRound({ difficulty, pair, rng, contentPack })` and `isCorrect(round, answer)`, a `testkit` with `solve(round): Move[]` and `wrongAnswers`, and a presentational `View({ round, phase, submit, locale, dir })`.

- The engine owns rng, clock, timers, phases, answer intake, scoring and exactly one `onFinish`. A game never calls them itself.
- Exactly one correct option per round is required. Exceptions are declared with `acceptsMultiple: true`; then `isCorrect` accepts every valid answer and the testkit checks that `solve` is complete.
- The mechanic templates (`choose`, `compare`, `sequence`, `pairs`) are shared `View`s in `mechanics/`. A game on a template supplies data and a generator.
- From WP-06, `describe.each(GAME_REGISTRY)` runs the contract, and a file in `games/` without a registry entry fails a test.

## Rejected alternatives

- **`generate`/`check`/`present` with `onRoundComplete` inside the game:** the game would own side effects and could finish twice.

## Consequences

- ESLint bans timers, randomness, storage and audio in `games/**` and `mechanics/**` ([0013](0013-eslint-flat-config-and-kids-purity.md)); the contract tests are the second line of defence.

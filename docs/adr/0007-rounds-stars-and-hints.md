# 0007. Rounds, stars and hints

- **Status:** Accepted
- **Date:** 2026-10-06
- **Source:** D7, `docs/planning/research/architect.md` §8

## Context

The audience is 4–8 years old. Feedback must encourage and never punish, and language support must not cost a child their reward.

## Decision

- A round has N = 5 questions (ages 4–5) or 8 (ages 6+), set in data.
- Hint ladder: the first mistake shows "try again" and dims the wrong option; the second highlights the correct option and the child taps it. Such an answer counts as **not first try**.
- Stars: ★ always; ★★ at ≥ 60% first-try answers; ★★★ at ≥ 90%. The best result is kept. There are no points.
- Switching to the native language does not lower stars. It is recorded as `native_hint` on the answer and in `native_hints_used` on the session.
- `nextDifficulty` uses the first-try share of the last two rounds.

## Rejected alternatives

- **Points-based scoring** and **stars by share of correct answers:** they punish hints and second tries.

## Consequences

- `starsFor` and `nextDifficulty` live in `packages/shared` as pure functions (WP-03).

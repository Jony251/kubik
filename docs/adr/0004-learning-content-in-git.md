# 0004. Learning content lives in git; the database is a projection

- **Status:** Accepted
- **Date:** 2026-10-06
- **Source:** D4, `docs/planning/research/architect.md` §8

## Context

Phase 1A has no backend. Content (items, translations, Hebrew gender and niqqud) is edited by the owner. Phase 1B needs `answer_events.item_key` to reference real rows for analytics.

## Decision

The source of truth is files in git under `/content`: `games.yaml`, `items/<game>.csv` (`item_key`, `level`, `skill`, `payload`), `items_i18n/<lang>/…` (ICU prompt, `text_marked` with niqqud and stress, `status`), and `concepts` with `gender`/`forms`.

- **1A:** the build compiles them into static JSON packs for the client. CI validates the zod schema of each template, compiles ICU messages for every plural category and requires `gender` for Hebrew.
- **1B:** the same files are seeded idempotently into `items`, `item_translations` and `concepts` (upsert by stable keys). The client still loads static packs from the CDN.

The source moves into the database only when one of these happens: a non-developer edits content, server-side item selection per child is needed, or there are more than about 5,000 items.

## Rejected alternatives

- **The database as the source from day one:** needs a backend and an editor before the first game.
- **JSON packs forever:** no foreign keys or joins for analytics in 1B.

## Consequences

- Every content change goes through a PR until one of the triggers above fires.

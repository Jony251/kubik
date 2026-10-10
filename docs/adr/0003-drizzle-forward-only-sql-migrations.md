# 0003. Drizzle with forward-only SQL migrations

- **Status:** Accepted
- **Date:** 2026-10-06
- **Source:** D3, `docs/planning/research/architect.md` §8

## Context

The API is written in TypeScript. Migrations must be reviewable and must support constructs a query builder cannot express (CHECK constraints, collations, later RLS).

## Decision

Use Drizzle (`drizzle-orm` and `drizzle-kit`). Migration SQL files live in git and are reviewed in the PR. Where the builder cannot express something, use custom SQL migrations (`drizzle-kit generate --custom`).

- Migrations only go forward. A rollback is a new migration or a restore from PITR.
- CI runs `migrate` on an empty database, `drizzle-kit check` and the seed.
- `migrate` is a separate deploy step under the `funzone_migrator` role; the API runs as `funzone_app` without DDL rights.

## Rejected alternatives

- **knex.** It would add a second, untyped layer next to the typed queries.

## Consequences

- There are no down migrations; recovery relies on PITR (runbook in WP-20b).

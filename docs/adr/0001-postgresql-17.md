# 0001. PostgreSQL 17

- **Status:** Accepted
- **Date:** 2026-10-06
- **Source:** D1, `docs/planning/research/architect.md` §8

## Context

Phase 1B adds parent accounts, child profiles and progress. The code is written from scratch, so there is no data to migrate and no engine to stay compatible with. The project has a single developer and no DBA.

## Decision

Use PostgreSQL 17, pinned in Terraform and in the dev compose file (`postgres:17`).

- Transactional DDL: a failed migration leaves no half-applied schema.
- `jsonb`, `timestamptz` and `date_trunc(…, 'Asia/Jerusalem')` for a family's "day".
- ICU collations: comparisons that ignore niqqud and stress marks.
- Partial indexes.

Row-level security is a Phase 2 option, not a 1B task: with one API role and ownership checks in the repository layer it is a second line of defence that costs hours.

## Rejected alternatives

- **MySQL 8.4 LTS.** The owner knows it and AWS pricing is the same, but for a rewrite from scratch these arguments weigh less than the points above.

## Consequences

- RDS PostgreSQL `db.t4g.micro` in `il-central-1` (see [0002](0002-aws-region-il-central-1.md)).
- Schema changes go through Drizzle SQL migrations (see [0003](0003-drizzle-forward-only-sql-migrations.md)).

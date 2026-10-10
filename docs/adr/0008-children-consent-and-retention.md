# 0008. Children, consent and retention

- **Status:** Accepted
- **Date:** 2026-10-06
- **Source:** D8, `docs/planning/research/architect.md` §8

## Context

The product stores progress for children. Full compliance tooling would cost 15–20 hours and push games out of Phase 1; skipping consent now would force a breaking schema migration later.

## Decision

In Phase 1B:

- Local-first guest: the server knows nothing about a child before consent.
- UUIDv7 for every client-generated id.
- `child_profiles` hold no personal data: nickname, avatar, age band, language pair.
- An append-only `consent_events` row (document version, time, method) is written when a profile is created.
- `answer_events` store one row per answer, with no free-text input.
- Deleting an account or a profile cascades physically, through an endpoint.
- **Registration is invite-only** (`REGISTRATION_MODE=invite`) until the Phase 2 compliance package.

Deferred to Phase 2, but required before inviting real users: `staff_access_log`, retention jobs and rollups, `data_requests` and export, `deleted_subjects` tombstones, scheduled restore drills.

## Rejected alternatives

- **Everything in 1B:** about 15–20 extra hours, crowding out games.
- **Everything in Phase 2:** the first schema would lack consent and need a breaking migration.

## Consequences

- Public registration stays off until the compliance package and a lawyer's review.

# 0009. New repository and code provenance

- **Status:** Accepted
- **Date:** 2026-10-06
- **Source:** D9, `docs/planning/research/architect.md` §8

## Context

The previous project was a joint learning project with a co-author. A commercial product must not depend on code the owner does not solely own.

## Decision

- Start a new repository (working product name **Kubik**; the trademark is not checked yet).
- Clean-room rewrite: no code, CSS or assets from the legacy project, not even fragments.
- `PROVENANCE.md` records each module, its date, the specification it was written from, and the statement "written from scratch, no code from the legacy project". `ASSETS.md` records each asset with its source and licence.
- The legacy repository is archived (WP-00).
- Parts of the legacy project the owner wrote alone may be brought over only if the owner confirms authorship and records it in `PROVENANCE.md`. The recommendation is to bring nothing.

## Rejected alternatives

- **A `legacy/` folder in the new repository:** the joint code would stay in the product's tree and history.

## Consequences

- Every PR updates `PROVENANCE.md` (part of the common Definition of Done).

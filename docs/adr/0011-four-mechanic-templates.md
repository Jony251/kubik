# 0011. Four mechanic templates in Phase 1

- **Status:** Accepted
- **Date:** 2026-10-06
- **Source:** D11, `docs/planning/research/architect.md` §8

## Context

Each mechanic is a reusable `View` with its own accessibility and test cost. Drag-and-drop and mazes are the most expensive to make accessible.

## Decision

Phase 1 ships four templates: `choose`, `compare`, `sequence`, `pairs`. `count` is a generator on `choose`, not a separate mechanic.

- On `choose`: Count & Say, Add & Subtract, Shapes & Colors, Missing Number.
- On `compare`: Compare.
- On `sequence`: What Comes Next.
- On `pairs`: Word Memory.

`sort` (Sort It) and `grid` (Direction Maze) move to the second wave.

## Rejected alternatives

- **Six mechanics in Phase 1:** `sort` needs a keyboard alternative to drag-and-drop and `grid` needs RTL-safe directions; both cost more than they return before validation.

## Consequences

- Second-wave games carry e2e on a mobile viewport and a "right does not mirror in RTL" test in their Definition of Done.

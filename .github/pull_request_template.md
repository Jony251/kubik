## What and why

<!-- Work package (WP-NN), what changes and why. Link the spec or ADR. -->

## Definition of Done

- [ ] `npm ci && npm run lint && npm run typecheck && npm test && npm run build` pass
- [ ] Tests were written first (RED) and now pass; no `.only` / `.skip`
- [ ] Diff coverage ≥ 85% (from WP-02)
- [ ] `PROVENANCE.md` updated; `ASSETS.md` updated if assets were added
- [ ] Clean room: no code, CSS or assets from the legacy project
- [ ] Package-specific DoD from `docs/planning/funzone.md` met (list items below)

## How to verify

<!-- Exact commands and manual steps a reviewer can run. -->

```sh
npm ci
npm run lint && npm run typecheck && npm test && npm run build
```

## Notes

<!-- Deviations from the plan, risks, follow-ups. -->

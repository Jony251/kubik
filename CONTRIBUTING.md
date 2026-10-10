# Contributing

## Ground rules

- **Clean room.** Never copy, adapt or paste code, CSS or assets from the legacy project. Write from the specifications in [`docs/`](docs/). Record every new module in [`PROVENANCE.md`](PROVENANCE.md) and every asset in [`ASSETS.md`](ASSETS.md).
- **Games are pure.** Code in `games/**` and `mechanics/**` gets time, randomness, storage and sound only from the engine; ESLint enforces it ([ADR 0013](docs/adr/0013-eslint-flat-config-and-kids-purity.md)).
- **TDD.** Tests are written first (RED), then the code that makes them pass (GREEN), then review.

## Branches

- Trunk-based. `main` is protected and always deployable; unfinished work is hidden behind flags.
- One work package, one branch, one PR: `wp/NN-slug` (for example `wp/04-i18n-rtl`) or `g/NN-slug` for games. A branch lives at most two weeks; if a package does not fit, split it.
- Start each branch from an up-to-date `main`.

## Commits

- Messages follow [Conventional Commits](https://www.conventionalcommits.org/): `feat(web): …`, `fix(shared): …`, `docs: …`, `chore: …`, `test: …`.
- Every commit is signed off (Developer Certificate of Origin): use `git commit -s`, which adds a `Signed-off-by:` trailer.

## Pull requests

- Open the PR against `main` using the [template](.github/pull_request_template.md). The PR title is a Conventional Commits subject, because PRs are **squash-merged** and the title becomes the commit on `main`.
- Fill in the Definition of Done checklist and the "How to verify" section.
- History on `main` is linear; force-pushing to `main` is not allowed.

## Definition of Done (every PR)

- `npm ci && npm run lint && npm run typecheck && npm test && npm run build` pass locally and in CI.
- No `.only` or `.skip` in tests.
- Diff coverage ≥ 85% (enforced from WP-02).
- `PROVENANCE.md` (and `ASSETS.md`, if assets were added) is updated.
- The package-specific Definition of Done from [`docs/planning/funzone.md`](docs/planning/funzone.md) is met.

## Local setup

```sh
nvm use          # Node 22, see .nvmrc
npm ci
npm run dev -w @kubik/web
```

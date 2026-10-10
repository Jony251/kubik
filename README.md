# Kubik

Bilingual (Russian ↔ Hebrew) math and logic games for children aged 4–8. The goal: a child plays in the language they are learning and can switch to their native language at any moment without losing stars; every prompt is voiced by a real person; the interface mirrors correctly for right-to-left Hebrew.

Kubik is a working name.

## Stack

- **Web:** Vite, React 18, TypeScript (strict), React Router 7.
- **Shared:** `packages/shared`, a TypeScript package with the game contract and pure logic.
- **Ingest (Phase 1A):** AWS Lambda + DynamoDB for the waitlist and anonymous counters ([ADR 0012](docs/adr/0012-serverless-ingest-in-1a.md)).
- **API (Phase 1B):** Express 5, PostgreSQL 17 with Drizzle, in AWS `il-central-1`.
- **Quality:** Vitest, ESLint (flat config), Prettier, stylelint with logical properties.

## Repository layout

```
apps/web          Vite + React app
apps/ingest       serverless ingest (stub)
apps/api          parent accounts API (stub)
packages/shared   shared types and pure logic
docs/adr          architecture decision records
docs/planning     plan, strategy and research
tests/repo        repository contract tests
```

## Getting started

Requires Node 22 (see `.nvmrc`).

```sh
npm ci
npm run dev -w @kubik/web   # dev server
npm run lint                # ESLint, stylelint, Prettier
npm run typecheck
npm test                    # Vitest across all workspaces
npm run build
```

## Status

Phase 1A, wave 0: repository bootstrap. See [`docs/planning/funzone.md`](docs/planning/funzone.md) for the plan and [`docs/adr`](docs/adr) for decisions.

## Contributing and licence

See [CONTRIBUTING.md](CONTRIBUTING.md). Source-available for viewing only; all rights reserved, see [LICENSE](LICENSE).

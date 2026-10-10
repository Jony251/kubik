// Preload for running the repo tests under `node --test` (RED phase, no deps).
// Vitest provides the same names when `globals: true`, so test files never import a runner.
import { describe, it, before, after } from 'node:test';

Object.assign(globalThis, { describe, it, beforeAll: before, afterAll: after });

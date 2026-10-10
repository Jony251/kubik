// WP-01 DoD: a violator fixture fails ESLint for EVERY banned API (principle 2),
// in games/** and mechanics/**, while the engine/audio/progress layers that own
// time, sound and storage stay allowed. Focused/skipped tests are errors everywhere.
//
// Fixtures are linted via lintText() with a virtual filePath, so no violating
// file ever lands in the source tree and `npm run lint` stays green.
import assert from 'node:assert/strict';
import { ROOT } from '../support/paths.mjs';

let eslintPromise;
async function getEslint() {
  eslintPromise ??= import('eslint').then(({ ESLint }) => new ESLint({ cwd: ROOT }));
  return eslintPromise;
}

async function lint(code, filePath) {
  const eslint = await getEslint();
  assert.equal(await eslint.isPathIgnored(filePath), false, `${filePath} must not be ignored by ESLint`);
  const [result] = await eslint.lintText(code, { filePath });
  const fatal = result.messages.filter((m) => m.fatal);
  assert.deepEqual(fatal, [], `parse error in fixture ${filePath}: ${JSON.stringify(fatal)}`);
  return result.messages.filter((m) => m.severity === 2);
}

// The ban must come from a core no-restricted-* rule: other rules (e.g. react-hooks/purity)
// also mention Math.random in .tsx and would otherwise satisfy the test by accident.
const isBan = (e, match) => /^no-restricted-/.test(e.ruleId ?? '') && match.test(e.message);

const fmt = (errors) => JSON.stringify(errors.map((e) => `${e.ruleId}: ${e.message}`));

const BANNED = [
  { api: 'Math.random', match: /Math\.random/, code: 'export const x = Math.random();\n' },
  {
    api: 'Math.random (destructured)',
    match: /random/,
    code: 'const { random } = Math;\nexport const x = random();\n',
  },
  { api: 'setTimeout', match: /setTimeout/, code: 'export const t = setTimeout(() => undefined, 10);\n' },
  { api: 'window.setTimeout', match: /setTimeout/, code: 'export const t = window.setTimeout(() => undefined, 10);\n' },
  {
    api: 'globalThis.setTimeout',
    match: /setTimeout/,
    code: 'export const t = globalThis.setTimeout(() => undefined, 10);\n',
  },
  { api: 'setInterval', match: /setInterval/, code: 'export const t = setInterval(() => undefined, 10);\n' },
  {
    api: 'requestAnimationFrame',
    match: /requestAnimationFrame/,
    code: 'export const r = requestAnimationFrame(() => undefined);\n',
  },
  { api: 'Date.now', match: /Date\.now/, code: 'export const n = Date.now();\n' },
  { api: 'new Date()', match: /Date/, code: 'export const d = new Date();\n' },
  { api: 'performance.now', match: /performance\.now/, code: 'export const p = performance.now();\n' },
  { api: 'localStorage', match: /localStorage/, code: "export const v = localStorage.getItem('k');\n" },
  { api: 'window.localStorage', match: /localStorage/, code: "export const v = window.localStorage.getItem('k');\n" },
  { api: 'indexedDB', match: /indexedDB/, code: "export const req = indexedDB.open('db');\n" },
  { api: 'window.indexedDB', match: /indexedDB/, code: "export const req = window.indexedDB.open('db');\n" },
  { api: 'new Audio', match: /Audio/, code: "export const a = new Audio('x.mp3');\n" },
  { api: 'speechSynthesis', match: /speechSynthesis/, code: 'export const s = speechSynthesis;\n' },
  { api: 'window.speechSynthesis', match: /speechSynthesis/, code: 'export const s = window.speechSynthesis;\n' },
];

const PURE_DIRS = ['games', 'mechanics'];

describe('ESLint principle 2: banned APIs in games/** and mechanics/**', () => {
  for (const dir of PURE_DIRS) {
    for (const { api, match, code } of BANNED) {
      it(`${dir}: ${api} is an error`, async () => {
        const errors = await lint(code, `apps/web/src/${dir}/__lint_fixture__/fixture.ts`);
        assert.ok(
          errors.some((e) => isBan(e, match)),
          `expected an error naming ${api}; got ${fmt(errors)}`,
        );
      });
    }

    it(`${dir}: ban also applies to .tsx`, async () => {
      const code = 'export function C() {\n  return <span>{Math.random()}</span>;\n}\n';
      const errors = await lint(code, `apps/web/src/${dir}/__lint_fixture__/Fixture.tsx`);
      assert.ok(
        errors.some((e) => isBan(e, /Math\.random/)),
        `got ${fmt(errors)}`,
      );
    });

    it(`${dir}: clean pure code has no errors (control)`, async () => {
      const code = 'export const add = (a: number, b: number): number => a + b;\n';
      const errors = await lint(code, `apps/web/src/${dir}/__lint_fixture__/clean.ts`);
      assert.deepEqual(errors, [], `clean fixture must pass; got ${fmt(errors)}`);
    });
  }
});

describe('ESLint principle 2: owners of time, sound and storage are not over-banned', () => {
  const OWNERS = [
    {
      where: 'engine',
      code:
        'export const now = (): number => Date.now();\n' +
        'export const later = (fn: () => void): ReturnType<typeof setTimeout> => setTimeout(fn, 10);\n',
    },
    { where: 'audio', code: "export const clip = (): HTMLAudioElement => new Audio('x.mp3');\n" },
    { where: 'progress', code: "export const open = (): IDBOpenDBRequest => indexedDB.open('db');\n" },
  ];
  const banMatch = new RegExp(BANNED.map((b) => b.match.source).join('|'));

  for (const { where, code } of OWNERS) {
    it(`${where}/** may use its own platform API`, async () => {
      const errors = await lint(code, `apps/web/src/${where}/__lint_fixture__/owner.ts`);
      const banErrors = errors.filter((e) => isBan(e, banMatch));
      assert.deepEqual(banErrors, [], `principle-2 bans must be scoped to games/mechanics; got ${fmt(banErrors)}`);
    });
  }
});

describe('ESLint: focused and skipped tests are errors repo-wide', () => {
  const FOCUS_OR_SKIP = /only|focus|skip|disabled/i;
  const header = "import { describe, it, test, expect } from 'vitest';\n";
  const CASES = {
    'describe.only': "describe.only('s', () => { it('t', () => { expect(1).toBe(1); }); });\n",
    'it.only': "describe('s', () => { it.only('t', () => { expect(1).toBe(1); }); });\n",
    'test.only': "test.only('t', () => { expect(1).toBe(1); });\n",
    'describe.skip': "describe.skip('s', () => { it('t', () => { expect(1).toBe(1); }); });\n",
    'it.skip': "describe('s', () => { it.skip('t', () => { expect(1).toBe(1); }); });\n",
    'test.skip': "test.skip('t', () => { expect(1).toBe(1); });\n",
  };
  const LOCATIONS = [
    'apps/web/src/engine/__lint_fixture__/x.test.ts',
    'packages/shared/src/__lint_fixture__/x.test.ts',
  ];

  for (const file of LOCATIONS) {
    for (const [name, body] of Object.entries(CASES)) {
      it(`${name} in ${file.split('/__lint_fixture__')[0]} is an error`, async () => {
        const errors = await lint(header + body, file);
        assert.ok(
          errors.some((e) => FOCUS_OR_SKIP.test(e.ruleId ?? '')),
          `expected a focused/disabled-test rule error; got ${fmt(errors)}`,
        );
      });
    }

    it(`a normal test in ${file.split('/__lint_fixture__')[0]} has no errors (control)`, async () => {
      const body =
        "describe('s', () => { it('t', () => { expect(1).toBe(1); }); test('u', () => { expect(2).toBe(2); }); });\n";
      const errors = await lint(header + body, file);
      assert.deepEqual(errors, [], `got ${fmt(errors)}`);
    });
  }
});

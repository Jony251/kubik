// WP-01 DoD: legal, provenance and process files exist from the first PR,
// and decisions D1-D12 are recorded as ADRs 0001-0012.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fromRoot } from '../support/paths.mjs';

const read = (p) => {
  assert.ok(existsSync(fromRoot(p)), `${p} is missing`);
  const text = readFileSync(fromRoot(p), 'utf8');
  assert.ok(text.trim().length > 0, `${p} is empty`);
  return text;
};

describe('governance files', () => {
  it('LICENSE is proprietary: All rights reserved, holder and year', () => {
    const text = read('LICENSE');
    assert.match(text, /All rights reserved/i);
    assert.match(text, /Evgeny Nemchenko/);
    assert.match(text, /20\d\d/);
  });

  it('PROVENANCE.md states the clean-room rule', () => {
    assert.match(read('PROVENANCE.md'), /clean[- ]room/i);
  });

  it('ASSETS.md exists', () => {
    assert.match(read('ASSETS.md'), /^#/m);
  });

  it('CONTRIBUTING.md requires sign-off and Conventional Commits', () => {
    const text = read('CONTRIBUTING.md');
    assert.match(text, /Signed-off-by|--signoff|\bgit commit -s\b/);
    assert.match(text, /Conventional Commits/i);
  });

  it('PR template has a DoD section and a how-to-verify section', () => {
    const text = read('.github/pull_request_template.md');
    assert.match(text, /Definition of Done|\bDoD\b/i);
    assert.match(text, /how to (test|verify)|как проверить/i);
  });
});

describe('ADRs D1-D12', () => {
  const files = existsSync(fromRoot('docs/adr')) ? readdirSync(fromRoot('docs/adr')) : [];

  for (let n = 1; n <= 12; n++) {
    const id = String(n).padStart(4, '0');
    it(`docs/adr/${id}-*.md exists exactly once and has a Status`, () => {
      const matches = files.filter((f) => f.startsWith(`${id}-`) && f.endsWith('.md'));
      assert.equal(matches.length, 1, `expected one ADR ${id}; found ${JSON.stringify(matches)}`);
      assert.match(read(`docs/adr/${matches[0]}`), /status/i);
    });
  }
});

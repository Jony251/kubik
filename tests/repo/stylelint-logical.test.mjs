// WP-01 DoD: stylelint enforces logical properties so layouts mirror in RTL.
import assert from 'node:assert/strict';
import { ROOT, fromRoot } from '../support/paths.mjs';

async function lintCss(code) {
  const { default: stylelint } = await import('stylelint');
  const { results } = await stylelint.lint({
    code,
    codeFilename: fromRoot('apps/web/src/ui/__lint_fixture__/fixture.module.css'),
    cwd: ROOT,
  });
  return results[0].warnings.filter((w) => w.severity === 'error');
}

const PHYSICAL = {
  'margin-left': '.a { margin-left: 4px; }',
  'padding-right': '.a { padding-right: 4px; }',
  'border-left': '.a { border-left: 1px solid; }',
  'left (inset)': '.a { position: absolute; left: 0; }',
  'text-align: left': '.a { text-align: left; }',
  'float: right': '.a { float: right; }',
};

describe('stylelint: physical direction properties are errors', () => {
  for (const [name, code] of Object.entries(PHYSICAL)) {
    it(`${name} is rejected`, async () => {
      const errors = await lintCss(code);
      assert.ok(
        errors.some((w) => /logical/i.test(w.rule)),
        `expected a use-logical error; got ${JSON.stringify(errors.map((w) => `${w.rule}: ${w.text}`))}`,
      );
    });
  }

  it('logical properties pass (control)', async () => {
    const errors = await lintCss(
      '.a { margin-inline-start: 4px; padding-inline-end: 4px; inset-inline-start: 0; text-align: start; }',
    );
    assert.deepEqual(errors, []);
  });
});

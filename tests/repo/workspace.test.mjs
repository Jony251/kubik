// WP-01 DoD: npm workspaces exist, TS is strict, the shared package is linked,
// and the whole workspace builds into a real Vite bundle.
// Needs a generous timeout under Vitest (build runs inside the test): testTimeout >= 180_000.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fromRoot } from '../support/paths.mjs';
import { run } from '../support/exec.mjs';

const readJson = (p) => JSON.parse(readFileSync(fromRoot(p), 'utf8'));

describe('workspace layout', () => {
  it('root package.json is private and declares workspaces', () => {
    const pkg = readJson('package.json');
    assert.equal(pkg.private, true);
    assert.ok(Array.isArray(pkg.workspaces) && pkg.workspaces.length > 0, 'workspaces must be declared');
  });

  it('npm resolves the four planned workspaces', () => {
    const locations = JSON.parse(run('npm', ['query', '.workspace'])).map((w) => w.location.replaceAll('\\', '/'));
    for (const expected of ['apps/web', 'apps/ingest', 'apps/api', 'packages/shared']) {
      assert.ok(locations.includes(expected), `missing workspace ${expected}; got ${JSON.stringify(locations)}`);
    }
  });

  it('root exposes the scripts CI calls', () => {
    const { scripts = {} } = readJson('package.json');
    for (const name of ['lint', 'typecheck', 'test', 'build']) {
      assert.equal(typeof scripts[name], 'string', `root script "${name}" is missing`);
    }
  });

  it('apps/web depends on packages/shared and npm links it', () => {
    const shared = readJson('packages/shared/package.json').name;
    const web = readJson('apps/web/package.json');
    const deps = { ...web.dependencies, ...web.devDependencies };
    assert.ok(shared in deps, `apps/web must depend on ${shared}`);
    assert.ok(existsSync(fromRoot('node_modules', shared, 'package.json')), `${shared} is not linked in node_modules`);
  });
});

describe('TypeScript strict', () => {
  // Vite templates keep compiler options in tsconfig.app.json behind project references.
  const configFor = (dir) =>
    ['tsconfig.app.json', 'tsconfig.json'].map((f) => `${dir}/${f}`).find((p) => existsSync(fromRoot(p)));

  for (const dir of ['apps/web', 'packages/shared']) {
    it(`${dir} compiles with strict: true`, () => {
      const project = configFor(dir);
      assert.ok(project, `${dir} has no tsconfig`);
      const shown = JSON.parse(run('npx', ['tsc', '--showConfig', '-p', project]));
      assert.equal(shown.compilerOptions?.strict, true, `${project} must enable strict`);
    });
  }
});

describe('build smoke', () => {
  it('npm run build succeeds and emits a Vite bundle for apps/web', () => {
    run('npm', ['run', 'build'], { timeout: 170_000 });
    const html = readFileSync(fromRoot('apps/web/dist/index.html'), 'utf8');
    const script = html.match(/<script[^>]+src="\/?([^"]+\.js)"/);
    assert.ok(script, 'index.html must reference a built JS entry');
    assert.ok(existsSync(fromRoot('apps/web/dist', script[1])), `built entry ${script[1]} is missing`);
  });
});

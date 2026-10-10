import { execFileSync } from 'node:child_process';
import { ROOT } from './paths.mjs';

// npm/npx are .cmd shims on Windows and need a shell there.
export function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
    ...opts,
  });
}

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      'apps/*',
      'packages/*',
      {
        test: {
          name: 'repo',
          include: ['tests/**/*.test.mjs'],
          environment: 'node',
          globals: true,
          // The build smoke test runs `npm run build` in-process.
          testTimeout: 180_000,
        },
      },
    ],
  },
});

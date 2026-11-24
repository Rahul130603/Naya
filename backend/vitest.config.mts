import { defineConfig } from 'vitest/config';

// ESM configuration supports the current Vitest release.

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    fileParallelism: false,
    testTimeout: 45_000,
    hookTimeout: 45_000,
    setupFiles: ['./tests/setup-env.ts'],
  },
});

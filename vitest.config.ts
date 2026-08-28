import path from 'node:path';

import { defineConfig } from 'vitest/config';

// vitest is wired in F2 solely to exercise `apiClient` (envelope parsing, typed
// errors, and the single-flight refresh/replay). `fetch` is mocked in the suite,
// so the `node` environment is sufficient. `VITE_API_BASE_URL` is stubbed here so
// `import.meta.env.VITE_API_BASE_URL` resolves during tests without a `.env` read.
export default defineConfig({
  // Mirrors the `@` alias in vite.config.ts so tests resolve `@/...` imports
  // identically to the app build.
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    env: {
      VITE_API_BASE_URL: 'http://localhost:8080/api/v1',
    },
  },
});

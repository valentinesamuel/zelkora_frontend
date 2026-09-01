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
    // Compile-time-only assertions (`expectTypeOf` + `@ts-expect-error`) for
    // `src/lib/query`'s generic builder typing. Run separately via
    // `npm run test:types`; never picked up by the `include` above.
    typecheck: {
      enabled: false,
      include: ['src/**/*.type-test.ts'],
      // The root tsconfig.json is a `shadcn init`-only solution-style stub
      // (kept solely so the CLI can detect the `@/*` alias) and sets a
      // deprecated `baseUrl` that trips up Vitest's standalone tsc program.
      // `tsconfig.app.json` is the config that actually governs `src/`.
      tsconfig: './tsconfig.app.json',
    },
  },
});

import path from 'node:path';

import { defineConfig } from 'vitest/config';

// vitest was originally wired in F2 solely to exercise `apiClient` (envelope
// parsing, typed errors, and the single-flight refresh/replay); `fetch` is
// mocked in that suite, so a `node` environment was sufficient at the time.
// `VITE_API_BASE_URL` is stubbed here so `import.meta.env.VITE_API_BASE_URL`
// resolves during tests without a `.env` read.
//
// Phase 12 prerequisite fix: new component tests (`.test.tsx`) render React
// components with React Testing Library and need `window`/`document`, so the
// global environment is switched to `jsdom` (a superset of `node` — it adds
// DOM globals without removing anything the existing `.test.ts` specs use).
// The full suite was run after this change and stays green, so a per-file
// environment override is not needed; `include` is widened to also pick up
// colocated `.test.tsx` files.
export default defineConfig({
  // Mirrors the `@` alias in vite.config.ts so tests resolve `@/...` imports
  // identically to the app build.
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
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

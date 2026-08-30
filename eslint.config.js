import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import sonarjs from 'eslint-plugin-sonarjs'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'

// Every `sonarjs/*` rule set to "off". Applied to generated, test, fixture,
// ambient, and in-progress code that is out of scope for the SonarJS cleanup.
const SONARJS_OFF = Object.fromEntries(
  Object.keys(sonarjs.rules).map((name) => [`sonarjs/${name}`, 'off']),
)

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      sonarjs.configs.recommended,
      // Must stay last: disables stylistic rules that would fight Prettier.
      eslintConfigPrettier,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // Decision D9 (DE-approved 2026-08-27): the components/** layer is
    // domain-agnostic and must never import from features/**. See INV-L2.
    files: ['src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['**/features/*', '**/features/**'],
          message: 'components/** is domain-agnostic: it must never import from features/**. Move the domain logic into features/, or lift the generic part into components/.',
        }],
      }],
    },
  },
  {
    // SonarJS scope carve-out: shadcn-generated primitives, tests, fixtures,
    // ambient declarations, and the untracked auth module still in progress.
    files: [
      'src/components/ui/**',
      '**/*.test.{ts,tsx}',
      'src/**/*.fixtures.ts',
      'src/**/*.d.ts',
      'src/features/auth/Can.tsx',
      'src/features/auth/authorize.ts',
      'src/features/auth/authorize.test.ts',
      'src/features/auth/useCan.ts',
    ],
    rules: SONARJS_OFF,
  },
])

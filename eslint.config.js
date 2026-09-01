import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import sonarjs from 'eslint-plugin-sonarjs';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

// Every `sonarjs/*` rule set to "off". Applied to generated, test, fixture,
// ambient, and in-progress code that is out of scope for the SonarJS cleanup.
const SONARJS_OFF = Object.fromEntries(
  Object.keys(sonarjs.rules).map((name) => [`sonarjs/${name}`, 'off']),
);

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
    // Broaden past sonarjs "recommended" toward SonarQube's full "Sonar way"
    // JS/TS profile: rules that ship off in the npm preset but are on in
    // SonarQube itself. `todo-tag` downgraded to warn (TODOs are kept on
    // purpose; the marker should be visible, not fail the build).
    files: ['**/*.{ts,tsx}'],
    rules: {
      'sonarjs/todo-tag': 'warn',
      'sonarjs/no-duplicate-string': ['error', { threshold: 3 }],
      'sonarjs/prefer-immediate-return': 'error',
      'sonarjs/no-collapsible-if': 'error',
      'sonarjs/no-inconsistent-returns': 'error',
      'sonarjs/no-nested-switch': 'error',
      'sonarjs/no-commented-code': 'error',
    },
  },
  {
    // Decision D9 (DE-approved 2026-08-27): the components/** layer is
    // domain-agnostic and must never import from features/**. See INV-L2.
    files: ['src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/features/*', '**/features/**'],
              message:
                'components/** is domain-agnostic: it must never import from features/**. Move the domain logic into features/, or lift the generic part into components/.',
            },
          ],
        },
      ],
    },
  },
  {
    // House rule: no ternaries in components — they hurt readability inside JSX.
    // Use `if` / early return, an extracted helper, or `&&`. Scoped to `.tsx`
    // (plain `.ts` may still use ternaries); shadcn primitives are exempt.
    files: ['src/**/*.tsx'],
    ignores: ['src/components/ui/**'],
    rules: {
      'no-ternary': 'error',
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
]);

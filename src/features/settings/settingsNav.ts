/**
 * Settings sub-navigation configuration.
 *
 * This is DATA, not a component — it lives in a `.ts` module so that
 * `react-refresh/only-export-components` does not fire on `SettingsSubNav`.
 *
 * Deliberate deviation from `src/app/layouts/navigation.ts`: there, a disabled
 * item carries NO `to` at all, so it can never be linked to by accident. Here a
 * disabled section keeps its `to` so the future route wiring is already written
 * down in one place. The safety property is preserved by the renderer instead —
 * `SettingsSubNav` decides link-vs-disabled by `enabled` ALONE, and a section
 * with `enabled: false` MUST NOT be rendered as a link.
 */
export interface SettingsSection {
  label: string;
  to: string;
  enabled: boolean;
}

// Staff deliberately does NOT appear here: it already lives as its own
// top-level item in `src/app/layouts/navigation.ts` (`/staff`, "People"
// group). A disabled `/settings/staff` placeholder used to sit alongside it,
// listing Staff a second time with no route behind it — removed so Staff has
// exactly one place in the sidebar.
export const SETTINGS_SECTIONS: SettingsSection[] = [
  { label: 'Branch', to: '/settings/branch', enabled: true },
  { label: 'Roles & Permissions', to: '/settings/roles', enabled: true },
];

/** Where `/settings` redirects to. Must point at an `enabled` section. */
export const SETTINGS_INDEX_REDIRECT = SETTINGS_SECTIONS[0].to;

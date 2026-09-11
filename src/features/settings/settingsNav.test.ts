import { describe, expect, it } from 'vitest';

import { SETTINGS_INDEX_REDIRECT, SETTINGS_SECTIONS } from './settingsNav';

// Pure data-shape coverage for the settings sub-nav. Node env, no DOM. These
// invariants are what keep the index redirect from landing on a dead route.

describe('SETTINGS_SECTIONS', () => {
  it('is non-empty', () => {
    expect(SETTINGS_SECTIONS.length).toBeGreaterThan(0);
  });

  it('scopes every path under `/settings/`', () => {
    for (const section of SETTINGS_SECTIONS) {
      expect(section.to.startsWith('/settings/')).toBe(true);
    }
  });

  it('leads with an enabled `Branch` section', () => {
    expect(SETTINGS_SECTIONS[0].label).toBe('Branch');
    expect(SETTINGS_SECTIONS[0].enabled).toBe(true);
  });

  it('has unique labels', () => {
    const labels = SETTINGS_SECTIONS.map((section) => section.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('has at least one enabled section', () => {
    const enabled = SETTINGS_SECTIONS.filter((section) => section.enabled);
    expect(enabled.length).toBeGreaterThan(0);
  });

  it('has an enabled `Roles & Permissions` section', () => {
    const section = SETTINGS_SECTIONS.find(
      (s) => s.label === 'Roles & Permissions',
    );
    expect(section?.enabled).toBe(true);
    expect(section?.to).toBe('/settings/roles');
  });
});

describe('SETTINGS_INDEX_REDIRECT', () => {
  it('points at the first section', () => {
    expect(SETTINGS_INDEX_REDIRECT).toBe(SETTINGS_SECTIONS[0].to);
  });

  it('points at an enabled section', () => {
    const target = SETTINGS_SECTIONS.find(
      (section) => section.to === SETTINGS_INDEX_REDIRECT,
    );
    expect(target?.enabled).toBe(true);
  });
});

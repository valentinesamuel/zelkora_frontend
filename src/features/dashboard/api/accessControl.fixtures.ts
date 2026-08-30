import type { AccessControlResponse } from '@/features/dashboard/types/accessControl.types';

// Static, deterministic dummy payload. Both stateLabel values appear.
export const accessControlFixture: AccessControlResponse = {
  toggles: [
    {
      id: 'ac-mfa-required',
      label: 'Require MFA for all staff',
      enabled: true,
      stateLabel: 'Enabled',
    },
    {
      id: 'ac-after-hours-access',
      label: 'After-hours records access',
      enabled: false,
      stateLabel: 'Disabled',
    },
    {
      id: 'ac-bulk-export',
      label: 'Bulk patient data export',
      enabled: false,
      stateLabel: 'Disabled',
    },
    {
      id: 'ac-locum-logins',
      label: 'Locum clinician logins',
      enabled: true,
      stateLabel: 'Enabled',
    },
    {
      id: 'ac-self-service-reset',
      label: 'Self-service password reset',
      enabled: true,
      stateLabel: 'Enabled',
    },
  ],
};

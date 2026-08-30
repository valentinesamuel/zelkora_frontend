import type { SystemAlertsResponse } from '@/features/dashboard/types/systemAlerts.types';

export const systemAlertsFixture: SystemAlertsResponse = {
  alerts: [
    {
      id: 'alert-9001',
      title: 'Backup power switched on',
      detail: 'Mains supply lost at 06:42; generator carrying full load.',
      severity: 'critical',
      severityLabel: 'Critical',
      createdAt: '2026-08-29T06:42:00.000Z',
    },
    {
      id: 'alert-9002',
      title: 'Pharmacy stock low: Amoxicillin 500mg',
      detail: 'Remaining 42 units, below reorder threshold of 100.',
      severity: 'warning',
      severityLabel: 'Warning',
      createdAt: '2026-08-29T07:55:00.000Z',
    },
    {
      id: 'alert-9003',
      title: 'Lab analyser calibration due',
      detail: 'Haematology analyser calibration window opens tomorrow.',
      severity: 'info',
      severityLabel: 'Info',
      createdAt: '2026-08-29T08:30:00.000Z',
    },
    {
      id: 'alert-9004',
      title: 'HMO portal latency elevated',
      detail: 'Reliance claims portal responding slowly (avg 8s).',
      severity: 'warning',
      severityLabel: 'Warning',
      createdAt: '2026-08-29T09:12:00.000Z',
    },
    {
      id: 'alert-9005',
      title: 'Cold chain temperature normalised',
      detail: 'Vaccine fridge 2 back within 2-8°C range.',
      severity: 'info',
      severityLabel: 'Info',
      createdAt: '2026-08-29T09:40:00.000Z',
    },
  ],
};

import type { SystemHealthResponse } from '@/features/dashboard/types/systemHealth.types';

export const systemHealthFixture: SystemHealthResponse = {
  tiles: [
    {
      id: 'health-api',
      label: 'Core API',
      status: 'ok',
      statusLabel: 'Operational',
      detail: 'p95 latency 120ms over the last hour.',
    },
    {
      id: 'health-database',
      label: 'Database',
      status: 'ok',
      statusLabel: 'Operational',
      detail: 'Replication lag under 1s.',
    },
    {
      id: 'health-hmo-gateway',
      label: 'HMO gateway',
      status: 'degraded',
      statusLabel: 'Degraded',
      detail: 'Reliance endpoint timing out intermittently.',
    },
    {
      id: 'health-sms',
      label: 'SMS notifications',
      status: 'down',
      statusLabel: 'Outage',
      detail: 'Provider returning 503 since 09:05.',
    },
    {
      id: 'health-storage',
      label: 'Document storage',
      status: 'ok',
      statusLabel: 'Operational',
      detail: '68% of quota used.',
    },
  ],
};

import type { DashboardKpisResponse } from '@/features/dashboard/types/dashboardKpis.types';

// Four CMO KPIs. Each `spark` is a 7-point weekly history ending at `value`.
export const dashboardKpisFixture: DashboardKpisResponse = {
  items: [
    {
      id: 'kpi-ed-average-wait',
      label: 'ED average wait',
      value: 42,
      display: '42 min',
      delta: -6,
      deltaLabel: '-6 min vs last week',
      deltaIntent: 'good',
      spark: [51, 49, 50, 47, 45, 44, 42],
    },
    {
      id: 'kpi-inpatient-occupancy',
      label: 'Inpatient occupancy',
      value: 87.4,
      display: '87.4%',
      delta: 3.1,
      deltaLabel: '+3.1 pts vs last week',
      deltaIntent: 'bad',
      spark: [82.1, 83.4, 84, 85.2, 86.1, 86.9, 87.4],
    },
    {
      id: 'kpi-awaiting-discharge',
      label: 'Patients awaiting discharge',
      value: 23,
      display: '23',
      delta: 5,
      deltaLabel: '+5 vs last week',
      deltaIntent: 'bad',
      spark: [16, 18, 17, 19, 21, 22, 23],
    },
    {
      id: 'kpi-nursing-overtime',
      label: 'Nursing overtime',
      value: 11.2,
      display: '11.2%',
      delta: -1.4,
      deltaLabel: '-1.4 pts vs last week',
      deltaIntent: 'good',
      spark: [14, 13.6, 13.1, 12.5, 12, 11.6, 11.2],
    },
  ],
};

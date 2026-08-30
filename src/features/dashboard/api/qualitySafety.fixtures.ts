import type { QualitySafetyResponse } from '@/features/dashboard/types/qualitySafety.types';

// Static, deterministic dummy payload: four board-level quality indicators.
// `display` is pre-formatted; `deltaIntent` reflects the direction of travel
// (mortality index below 1.0 and improving → good; readmission rising → bad).
export const qualitySafetyFixture: QualitySafetyResponse = {
  indicators: [
    {
      id: 'qs-mortality-index',
      label: 'Mortality index (O:E)',
      display: '0.92',
      deltaIntent: 'good',
    },
    {
      id: 'qs-hai-rate',
      label: 'HAI rate / 1,000 pt-days',
      display: '1.4',
      deltaIntent: 'neutral',
    },
    {
      id: 'qs-readmission-30d',
      label: '30-day readmission',
      display: '11.8%',
      deltaIntent: 'bad',
    },
    {
      id: 'qs-safety-events',
      label: 'Patient-safety events (30d)',
      display: '7',
      deltaIntent: 'good',
    },
  ],
};

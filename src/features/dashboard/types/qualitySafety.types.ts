// Contract for the quality & safety widget. Backend swap target:
// GET /dashboard/quality-safety (see api/qualitySafety.api.ts).
// `display` is pre-formatted; `deltaIntent` is the semantic reading of the
// current trend, decoupled from any arithmetic sign.

export interface QualitySafetyIndicator {
  id: string;
  label: string;
  display: string;
  deltaIntent: 'good' | 'bad' | 'neutral';
}

export interface QualitySafetyResponse {
  indicators: QualitySafetyIndicator[];
}

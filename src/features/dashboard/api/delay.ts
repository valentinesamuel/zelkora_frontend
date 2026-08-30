// Shared artificial latency for fixture-backed queryFns (Decision E1: fixed
// `await delay(300)` in every dashboard hook). One definition, imported by all
// nine api files. No random failure injection.
export const delay = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

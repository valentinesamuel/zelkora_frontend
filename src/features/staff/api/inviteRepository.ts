// HTTP access for staff invite actions — a plain object of functions, in the
// same style as `staffRepository.ts`. Both endpoints key off the STAFF id
// (`staff.id`), NOT the user id — the invite lifecycle lives on the `staff`
// row until it is accepted, whereas suspend/reactivate (`staffMutations.api.ts`)
// key off the USER id. Do not conflate the two ids across these two files.

import { apiRequest } from '@/lib/apiClient';

function resend(id: string): Promise<null> {
  return apiRequest<null>(`/staff/${id}/invite/resend`, { method: 'POST' });
}

function revoke(id: string): Promise<null> {
  return apiRequest<null>(`/staff/${id}/invite/revoke`, { method: 'POST' });
}

export const inviteRepository = { resend, revoke };

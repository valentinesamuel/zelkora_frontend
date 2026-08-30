import type { FieldValues, UseFormReturn } from 'react-hook-form';

import { ApiError } from '@/lib/apiClient';

/** Shown when a submit fails with no useful server-supplied message. */
export const GENERIC_SUBMIT_ERROR = 'Something went wrong. Please try again.';

/**
 * Route a caught submit error onto the form's `root` error slot: the server's
 * `apiMessage` when it's an `ApiError`, otherwise the generic fallback.
 */
export function setRootSubmitError<T extends FieldValues>(
  form: UseFormReturn<T>,
  err: unknown,
): void {
  form.setError('root', {
    message: err instanceof ApiError ? err.apiMessage : GENERIC_SUBMIT_ERROR,
  });
}

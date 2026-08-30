import type { FieldValues, UseFormReturn } from 'react-hook-form';

import { ApiError } from '@/lib/apiClient';

export const GENERIC_SUBMIT_ERROR = 'Something went wrong. Please try again.';

export function apiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    return err.apiMessage;
  }
  return fallback;
}

export function setRootSubmitError<T extends FieldValues>(
  form: UseFormReturn<T>,
  err: unknown,
): void {
  form.setError('root', {
    message: apiErrorMessage(err, GENERIC_SUBMIT_ERROR),
  });
}

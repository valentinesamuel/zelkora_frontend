import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

import { ApiError } from '../../../lib/apiClient';
import { FormError } from '../../../components/form/FormError';
import { FormField } from '../../../components/form/FormField';
import * as api from '../api';
import { getDeviceLabel } from '../deviceLabel';
import { verifyMfaSchema, type VerifyMfaValues } from '../schemas';
import { useAuthStore } from '../authStore';

interface VerifyMfaStepProps {
  preAuthToken: string;
  onExpired(notice: string): void;
}

export function VerifyMfaStep({ preAuthToken, onExpired }: VerifyMfaStepProps) {
  const completeLogin = useAuthStore((s) => s.completeLogin);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<VerifyMfaValues>({
    resolver: zodResolver(verifyMfaSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { passcode: '' },
  });

  async function onSubmit({ passcode }: VerifyMfaValues) {
    try {
      // The server sets the `refresh_token` cookie on THIS response.
      // `deviceLabel` must be non-empty (backend binding:"required", INV-11).
      const { accessToken } = await api.verifyMfa({
        preAuthToken,
        passcode,
        deviceLabel: getDeviceLabel(),
      });
      await completeLogin(accessToken);
      navigate('/', { replace: true });
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.apiMessage === 'invalid or expired token'
      ) {
        // Pre-auth token expired — a retype cannot help; restart at credentials.
        onExpired('Your sign-in session expired. Please enter your password again.');
        return;
      }
      // "invalid mfa code" and anything else: keep the step unchanged so the
      // user can retype. Resetting to credentials on a typo is hostile UX.
      setError('root', {
        message:
          err instanceof ApiError
            ? err.apiMessage
            : 'Verification failed. Please try again.',
      });
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <p className="auth-help">
        Enter the current 6-digit code from your authenticator app.
      </p>

      <FormField
        id="verify-passcode"
        label="Authentication code"
        inputMode="numeric"
        autoComplete="one-time-code"
        required
        labelClassName="auth-label"
        inputClassName="auth-input"
        errorClassName="auth-error"
        registration={register('passcode')}
        error={errors.passcode}
      />

      <FormError message={errors.root?.message} className="auth-error" />

      <button className="auth-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Verifying…' : 'Verify'}
      </button>
    </form>
  );
}

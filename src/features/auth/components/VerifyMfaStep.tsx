import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';

import { ApiError } from '../../../lib/apiClient';
import { FormError } from '../../../components/form/FormError';
import { FormField } from '../../../components/form/FormField';
import * as api from '../api';
import { getDeviceLabel } from '../deviceLabel';
import { verifyMfaSchema, type VerifyMfaValues } from '../schemas';
import { useAuthStore } from '../authStore';

// `FormField` is prop-based by locked decision (INV-F3/INV-F5): it renders its
// own <label>/<input>, so the shadcn look arrives as Tailwind utility classes
// mirroring `components/ui/{input,label}` rather than as those components.
const labelClass = 'flex flex-col gap-1.5 text-sm leading-none font-medium';
const inputClass =
  'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base font-normal transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm';
const fieldErrorClass = 'text-sm text-destructive';
const formErrorClass =
  'rounded-lg border bg-card px-2.5 py-2 text-sm text-destructive';

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
    <form
      className="flex flex-col gap-3.5"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <p className="text-sm leading-relaxed text-muted-foreground">
        Enter the current 6-digit code from your authenticator app.
      </p>

      <FormField
        id="verify-passcode"
        label="Authentication code"
        inputMode="numeric"
        autoComplete="one-time-code"
        required
        labelClassName={labelClass}
        inputClassName={inputClass}
        errorClassName={fieldErrorClass}
        registration={register('passcode')}
        error={errors.passcode}
      />

      <FormError message={errors.root?.message} className={formErrorClass} />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Verifying…' : 'Verify'}
      </Button>
    </form>
  );
}

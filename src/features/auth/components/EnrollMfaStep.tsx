import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as QRCode from 'qrcode';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

import { ApiError } from '../../../lib/apiClient';
import { FormError } from '../../../components/form/FormError';
import { FormField } from '../../../components/form/FormField';
import * as api from '../api';
import { enrollVerifySchema, type EnrollVerifyValues } from '../schemas';

// `FormField` is prop-based by locked decision (INV-F3/INV-F5): it renders its
// own <label>/<input>, so the shadcn look arrives as Tailwind utility classes
// mirroring `components/ui/{input,label}` rather than as those components.
const labelClass = 'flex flex-col gap-1.5 text-sm leading-none font-medium';
const inputClass =
  'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base font-normal transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm';
const fieldErrorClass = 'text-sm text-destructive';
const formErrorClass =
  'rounded-lg border bg-card px-2.5 py-2 text-sm text-destructive';

interface EnrollMfaStepProps {
  enrollmentToken: string;
  onEnrolled(): void;
}

export function EnrollMfaStep({
  enrollmentToken,
  onEnrolled,
}: EnrollMfaStepProps) {

  const startedRef = useRef(false);

  const [secret, setSecret] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EnrollVerifyValues>({
    resolver: zodResolver(enrollVerifySchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { passcode: '' },
  });

  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;

    void (async () => {
      try {
        const { secret: mfaSecret, otpAuthUrl } =
          await api.enrollMfa(enrollmentToken);

        const dataUrl = await QRCode.toDataURL(otpAuthUrl);
        setSecret(mfaSecret);
        setQrDataUrl(dataUrl);
      } catch (err) {
        if (err instanceof ApiError && err.statusCode === 409) {

          onEnrolled();
          return;
        }
        setLoadError(
          err instanceof ApiError
            ? err.apiMessage
            : 'Could not start MFA enrollment. Return to sign in and try again.',
        );
      }
    })();

  }, []);

  async function onVerify({ passcode }: EnrollVerifyValues) {
    try {
      await api.verifyEnroll(enrollmentToken, passcode);
      onEnrolled();
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        onEnrolled();
        return;
      }
      setError('root', {
        message:
          err instanceof ApiError
            ? err.apiMessage
            : 'Verification failed. Please try again.',
      });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Scan this QR code with an authenticator app (Google Authenticator,
        1Password, Authy…). Enrolling does <strong>not</strong> sign you in — you
        will enter your email and password again once MFA is enabled.
      </p>

      {loadError && (
        <Alert variant="destructive" role="alert">
          {loadError}
        </Alert>
      )}

      {qrDataUrl && (
        <img
          className="size-[200px] self-center rounded-md border [image-rendering:pixelated]"
          src={qrDataUrl}
          alt="MFA QR code"
          width={200}
          height={200}
        />
      )}

      {secret && (
        <p className="text-center text-sm text-muted-foreground">
          Can&rsquo;t scan? Enter this key manually:
          <br />
          <code className="mt-1.5 inline-block rounded-md bg-muted px-2 py-1.5 font-mono text-sm tracking-wider break-all text-foreground select-all">
            {secret}
          </code>
        </p>
      )}

      <form
        className="flex flex-col gap-3.5"
        onSubmit={handleSubmit(onVerify)}
        noValidate
      >
        <FormField
          id="enroll-passcode"
          label="6-digit code from your authenticator"
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

        <Button type="submit" disabled={isSubmitting || !qrDataUrl}>
          {isSubmitting ? 'Verifying…' : 'Enable MFA'}
        </Button>
      </form>
    </div>
  );
}

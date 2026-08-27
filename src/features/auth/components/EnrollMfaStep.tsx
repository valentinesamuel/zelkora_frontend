import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as QRCode from 'qrcode';

import { ApiError } from '../../../lib/apiClient';
import { FormError } from '../../../components/form/FormError';
import { FormField } from '../../../components/form/FormField';
import * as api from '../api';
import { enrollVerifySchema, type EnrollVerifyValues } from '../schemas';

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
    <div className="auth-enroll">
      <p className="auth-help">
        Scan this QR code with an authenticator app (Google Authenticator,
        1Password, Authy…). Enrolling does <strong>not</strong> sign you in — you
        will enter your email and password again once MFA is enabled.
      </p>

      {loadError && (
        <p className="auth-error" role="alert">
          {loadError}
        </p>
      )}

      {qrDataUrl && (
        <img
          className="auth-qr"
          src={qrDataUrl}
          alt="MFA QR code"
          width={200}
          height={200}
        />
      )}

      {secret && (
        <p className="auth-secret">
          Can&rsquo;t scan? Enter this key manually:
          <br />
          <code className="auth-secret-code">{secret}</code>
        </p>
      )}

      <form className="auth-form" onSubmit={handleSubmit(onVerify)} noValidate>
        <FormField
          id="enroll-passcode"
          label="6-digit code from your authenticator"
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

        <button
          className="auth-button"
          type="submit"
          disabled={isSubmitting || !qrDataUrl}
        >
          {isSubmitting ? 'Verifying…' : 'Enable MFA'}
        </button>
      </form>
    </div>
  );
}

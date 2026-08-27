import { useEffect, useRef, useState, type FormEvent } from 'react';
import * as QRCode from 'qrcode';

import { ApiError } from '../../../lib/apiClient';
import * as api from '../api';

interface EnrollMfaStepProps {
  enrollmentToken: string;
  onEnrolled(): void;
}

export function EnrollMfaStep({
  enrollmentToken,
  onEnrolled,
}: EnrollMfaStepProps) {
  // One-shot guard. StrictMode double-invokes effects in dev; a second
  // POST /auth/mfa/enroll runs SetMFASecret again and the QR the user just
  // scanned corresponds to a superseded secret -> every subsequent code is
  // rejected as "invalid mfa code" on an objectively correct code (R2 / KFM-3).
  const startedRef = useRef(false);

  const [secret, setSecret] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [passcode, setPasscode] = useState('');
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;

    let cancelled = false;

    void (async () => {
      try {
        const { secret: mfaSecret, otpAuthUrl } =
          await api.enrollMfa(enrollmentToken);
        // otpAuthUrl MUST be rendered as a scannable QR — users will not
        // hand-type an `otpauth://` URI.
        const dataUrl = await QRCode.toDataURL(otpAuthUrl);
        if (cancelled) return;
        setSecret(mfaSecret);
        setQrDataUrl(dataUrl);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.statusCode === 409) {
          // "mfa already enrolled" — nothing to enroll; send them to sign in.
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

    return () => {
      cancelled = true;
    };
    // Run exactly once on mount: `enrollmentToken` is fixed for this component
    // instance and `onEnrolled` is only invoked, never observed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleVerify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setVerifyError(null);
    setPending(true);
    try {
      await api.verifyEnroll(enrollmentToken, passcode);
      onEnrolled();
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        onEnrolled();
        return;
      }
      setVerifyError(
        err instanceof ApiError
          ? err.apiMessage
          : 'Verification failed. Please try again.',
      );
      setPending(false);
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

      <form className="auth-form" onSubmit={handleVerify} noValidate>
        <label className="auth-label" htmlFor="enroll-passcode">
          6-digit code from your authenticator
          <input
            id="enroll-passcode"
            className="auth-input"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            required
          />
        </label>

        {verifyError && (
          <p className="auth-error" role="alert">
            {verifyError}
          </p>
        )}

        <button
          className="auth-button"
          type="submit"
          disabled={pending || !qrDataUrl}
        >
          {pending ? 'Verifying…' : 'Enable MFA'}
        </button>
      </form>
    </div>
  );
}

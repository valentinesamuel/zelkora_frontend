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

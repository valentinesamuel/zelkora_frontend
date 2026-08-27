import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiError } from '../../../lib/apiClient';
import * as api from '../api';
import { getDeviceLabel } from '../deviceLabel';
import { useAuth } from '../useAuth';

interface VerifyMfaStepProps {
  preAuthToken: string;
  onExpired(notice: string): void;
}

export function VerifyMfaStep({ preAuthToken, onExpired }: VerifyMfaStepProps) {
  const { completeLogin } = useAuth();
  const navigate = useNavigate();

  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
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
      setError(
        err instanceof ApiError
          ? err.apiMessage
          : 'Verification failed. Please try again.',
      );
      setPending(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <p className="auth-help">
        Enter the current 6-digit code from your authenticator app.
      </p>

      <label className="auth-label" htmlFor="verify-passcode">
        Authentication code
        <input
          id="verify-passcode"
          className="auth-input"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          required
        />
      </label>

      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}

      <button className="auth-button" type="submit" disabled={pending}>
        {pending ? 'Verifying…' : 'Verify'}
      </button>
    </form>
  );
}

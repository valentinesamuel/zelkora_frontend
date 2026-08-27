import { useState, type FormEvent } from 'react';

import { ApiError } from '../../../lib/apiClient';
import type { LoginResult } from '../types';
import { useAuth } from '../useAuth';

interface CredentialsStepProps {
  notice?: string;
  onResult(result: LoginResult): void;
}

export function CredentialsStep({ notice, onResult }: CredentialsStepProps) {
  const { loginWithCredentials } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = await loginWithCredentials({ email, password });
      onResult(result);
    } catch (err) {
      // Render the backend's human-readable message inline
      // ("invalid email or password", "account is disabled").
      setError(
        err instanceof ApiError
          ? err.apiMessage
          : 'Something went wrong. Please try again.',
      );
      setPending(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {notice && (
        <p className="auth-notice" role="status">
          {notice}
        </p>
      )}

      <label className="auth-label" htmlFor="email">
        Email
        <input
          id="email"
          type="email"
          className="auth-input"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      <label className="auth-label" htmlFor="password">
        Password
        <input
          id="password"
          type="password"
          className="auth-input"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>

      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}

      <button className="auth-button" type="submit" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

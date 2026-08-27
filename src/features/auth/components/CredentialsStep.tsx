import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { ApiError } from '../../../lib/apiClient';
import { FormError } from '../../../components/form/FormError';
import { FormField } from '../../../components/form/FormField';
import type { LoginResult } from '../types';
import { credentialsSchema, type CredentialsValues } from '../schemas';
import { useAuthStore } from '../authStore';

interface CredentialsStepProps {
  notice?: string;
  onResult(result: LoginResult): void;
}

export function CredentialsStep({ notice, onResult }: CredentialsStepProps) {
  const loginWithCredentials = useAuthStore((s) => s.loginWithCredentials);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CredentialsValues>({
    resolver: zodResolver(credentialsSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: CredentialsValues) {
    try {
      const result = await loginWithCredentials(values);
      onResult(result);
    } catch (err) {
      // Render the backend's human-readable message inline
      // ("invalid email or password", "account is disabled").
      setError('root', {
        message:
          err instanceof ApiError
            ? err.apiMessage
            : 'Something went wrong. Please try again.',
      });
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {notice && (
        <p className="auth-notice" role="status">
          {notice}
        </p>
      )}

      <FormField
        id="email"
        label="Email"
        type="email"
        autoComplete="username"
        required
        labelClassName="auth-label"
        inputClassName="auth-input"
        errorClassName="auth-error"
        registration={register('email')}
        error={errors.email}
      />

      <FormField
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        labelClassName="auth-label"
        inputClassName="auth-input"
        errorClassName="auth-error"
        registration={register('password')}
        error={errors.password}
      />

      <FormError message={errors.root?.message} className="auth-error" />

      <button className="auth-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

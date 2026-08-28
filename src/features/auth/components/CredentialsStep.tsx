import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

import { ApiError } from '../../../lib/apiClient';
import { FormError } from '../../../components/form/FormError';
import { FormField } from '../../../components/form/FormField';
import type { LoginResult } from '../types';
import { credentialsSchema, type CredentialsValues } from '../schemas';
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
    <form
      className="flex flex-col gap-3.5"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      {notice && (
        <Alert role="status" className="mb-1">
          {notice}
        </Alert>
      )}

      <FormField
        id="email"
        label="Email"
        type="email"
        autoComplete="username"
        required
        labelClassName={labelClass}
        inputClassName={inputClass}
        errorClassName={fieldErrorClass}
        registration={register('email')}
        error={errors.email}
      />

      <FormField
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        labelClassName={labelClass}
        inputClassName={inputClass}
        errorClassName={fieldErrorClass}
        registration={register('password')}
        error={errors.password}
      />

      <FormError message={errors.root?.message} className={formErrorClass} />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}

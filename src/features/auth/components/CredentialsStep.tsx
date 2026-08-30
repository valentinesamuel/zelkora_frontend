import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { ApiError } from '../../../lib/apiClient';
import type { LoginResult } from '../types';
import { credentialsSchema, type CredentialsValues } from '../schemas';
import { useAuthStore } from '../authStore';
import { AuthField } from './AuthField';

interface CredentialsStepProps {
  notice?: string;
  onResult(result: LoginResult): void;
}

export function CredentialsStep({
  notice,
  onResult,
}: Readonly<CredentialsStepProps>) {
  const loginWithCredentials = useAuthStore((s) => s.loginWithCredentials);
  const form = useForm<CredentialsValues>({
    resolver: zodResolver(credentialsSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  const [showPassword, setShowPassword] = useState(false);
  // Non-functional: no backend support for persistent sessions. Visual-only,
  // never included in the submitted payload — see the invariant comment in
  // ../schemas.ts.
  const [remember, setRemember] = useState(false);

  async function onSubmit(values: CredentialsValues) {
    try {
      const result = await loginWithCredentials(values);
      onResult(result);
    } catch (err) {
      form.setError('root', {
        message:
          err instanceof ApiError
            ? err.apiMessage
            : 'Something went wrong. Please try again.',
      });
    }
  }

  return (
    <>
      <Form {...form}>
        <form
          className="flex flex-col gap-3.5"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          {notice && (
            <Alert role="status" className="mb-1">
              {notice}
            </Alert>
          )}

          {form.formState.errors.root?.message && (
            <Alert variant="destructive" role="alert">
              {form.formState.errors.root.message}
            </Alert>
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <AuthField label="Email">
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="username"
                    required
                    className="h-14 rounded-[10px] px-3.5 text-base md:text-base"
                    {...field}
                  />
                </FormControl>
              </AuthField>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <AuthField label="Password">
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      className="h-14 rounded-[10px] px-3.5 text-base md:text-base"
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    aria-pressed={showPassword}
                    className="absolute top-1/2 right-3.5 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="size-5 text-muted-foreground" />
                    ) : (
                      <Eye className="size-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </AuthField>
            )}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember-me"
                checked={remember}
                onCheckedChange={(v) => setRemember(v === true)}
              />
              <Label htmlFor="remember-me">Remember me</Label>
            </div>

            <a href="#" className="text-auth-link text-sm font-medium">
              {/* TODO: Create a forgot password screen */}
              Forgot Password
            </a>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Signing in…' : 'Login'}
          </Button>

          <div className="flex items-center gap-4" aria-hidden="true">
            <div className="flex-1 border-t" />
            <span className="text-muted-foreground text-sm">or</span>
            <div className="flex-1 border-t" />
          </div>
        </form>
      </Form>

      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled
        title="Google sign-in isn't available yet"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
          <path
            fill="#4285F4"
            d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3.01h3.88c2.27-2.09 3.57-5.17 3.57-8.83z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3.01c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A11.998 11.998 0 0 0 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.27A11.998 11.998 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39l4-3.11z"
          />
          <path
            fill="#EA4335"
            d="M12 4.76c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.27 6.61l4 3.11C6.22 6.87 8.87 4.76 12 4.76z"
          />
        </svg>
        Login with Google
      </Button>

      {/* <p className="text-center text-sm">
        Don&apos;t have an account?{' '}
        <a href="#" className="text-auth-link font-medium">
          Register Here
        </a>
      </p> */}
    </>
  );
}

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { ApiError } from '../../../lib/apiClient';
import type { LoginResult } from '../types';
import { credentialsSchema, type CredentialsValues } from '../schemas';
import { useAuthStore } from '../authStore';

interface CredentialsStepProps {
  notice?: string;
  onResult(result: LoginResult): void;
}

export function CredentialsStep({ notice, onResult }: Readonly<CredentialsStepProps>) {
  const loginWithCredentials = useAuthStore((s) => s.loginWithCredentials);
  const form = useForm<CredentialsValues>({
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
      form.setError('root', {
        message:
          err instanceof ApiError
            ? err.apiMessage
            : 'Something went wrong. Please try again.',
      });
    }
  }

  return (
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

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="username"
                  required
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="current-password"
                  required
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root?.message && (
          <Alert variant="destructive" role="alert">
            {form.formState.errors.root.message}
          </Alert>
        )}

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </Form>
  );
}

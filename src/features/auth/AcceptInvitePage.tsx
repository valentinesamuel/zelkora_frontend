import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { ApiError } from '@/lib/apiClient';
import { apiErrorMessage, GENERIC_SUBMIT_ERROR } from '@/lib/formErrors';
import { acceptInvite } from './api';
import { acceptInviteSchema, type AcceptInviteValues } from './schemas';
import { AuthShell } from './components/AuthShell';
import { AuthField } from './components/AuthField';

const INVALID_INVITE_MESSAGE =
  'This invite link is invalid or has expired. Ask your administrator to resend it.';

const INPUT_CLASS = 'h-14 rounded-[10px] px-3.5 text-base md:text-base';

export function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  // Separate from RHF's `root` error: an invalid invite is terminal (the form
  // replaces itself with the notice), while a transient submit failure leaves
  // the form usable for a retry.
  const [inviteError, setInviteError] = useState<string | null>(null);

  const form = useForm<AcceptInviteValues>({
    resolver: zodResolver(acceptInviteSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { newPassword: '', confirm: '' },
  });

  async function onSubmit(values: AcceptInviteValues) {
    if (!token) return;
    try {
      await acceptInvite(token, values.newPassword);
      navigate('/login', {
        state: {
          notice: 'Password set — sign in to finish setting up your account',
        },
      });
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 400) {
        setInviteError(INVALID_INVITE_MESSAGE);
        return;
      }
      form.setError('root', {
        message: apiErrorMessage(err, GENERIC_SUBMIT_ERROR),
      });
    }
  }

  let submitLabel = 'Set password';
  if (form.formState.isSubmitting) {
    submitLabel = 'Setting password…';
  }

  return (
    <AuthShell
      title="Set your password"
      subtitle="Choose a password to finish setting up your account"
    >
      {(!token || inviteError) && (
        <Alert variant="destructive" role="alert">
          {inviteError ?? INVALID_INVITE_MESSAGE}
        </Alert>
      )}

      {token && !inviteError && (
        <Form {...form}>
          <form
            className="flex flex-col gap-3.5"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            {form.formState.errors.root?.message && (
              <Alert variant="destructive" role="alert">
                {form.formState.errors.root.message}
              </Alert>
            )}

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <AuthField label="New password">
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      required
                      className={INPUT_CLASS}
                      {...field}
                    />
                  </FormControl>
                </AuthField>
              )}
            />

            <FormField
              control={form.control}
              name="confirm"
              render={({ field }) => (
                <AuthField label="Confirm password">
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      required
                      className={INPUT_CLASS}
                      {...field}
                    />
                  </FormControl>
                </AuthField>
              )}
            />

            <Button
              type="submit"
              size="lg"
              disabled={form.formState.isSubmitting}
            >
              {submitLabel}
            </Button>
          </form>
        </Form>
      )}
    </AuthShell>
  );
}

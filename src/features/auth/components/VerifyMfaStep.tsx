import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

import { ApiError } from '../../../lib/apiClient';
import { apiErrorMessage } from '@/lib/formErrors';
import * as api from '../api';
import { getDeviceLabel } from '../deviceLabel';
import { verifyMfaSchema, type VerifyMfaValues } from '../schemas';
import { useAuthStore } from '../authStore';

interface VerifyMfaStepProps {
  preAuthToken: string;
  onExpired(notice: string): void;
}

export function VerifyMfaStep({
  preAuthToken,
  onExpired,
}: Readonly<VerifyMfaStepProps>) {
  const completeLogin = useAuthStore((s) => s.completeLogin);
  const navigate = useNavigate();

  const form = useForm<VerifyMfaValues>({
    resolver: zodResolver(verifyMfaSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { passcode: '' },
  });

  async function onSubmit({ passcode }: VerifyMfaValues) {
    try {
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
        onExpired(
          'Your sign-in session expired. Please enter your password again.',
        );
        return;
      }
      form.setError('root', {
        message: apiErrorMessage(err, 'Verification failed. Please try again.'),
      });
    }
  }

  let submitLabel = 'Verify';
  if (form.formState.isSubmitting) {
    submitLabel = 'Verifying…';
  }

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-5"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        <FormField
          control={form.control}
          name="passcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Authentication code</FormLabel>
              <FormDescription>
                Enter the current 6-digit code from your authenticator app.
              </FormDescription>
              <FormControl>
                <InputOTP
                  maxLength={6}
                  autoComplete="one-time-code"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  name={field.name}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
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

        <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}

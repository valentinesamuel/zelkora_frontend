import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as QRCode from 'qrcode';

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
import * as api from '../api';
import { enrollVerifySchema, type EnrollVerifyValues } from '../schemas';

interface EnrollMfaStepProps {
  enrollmentToken: string;
  onEnrolled(): void;
}

export function EnrollMfaStep({
  enrollmentToken,
  onEnrolled,
}: Readonly<EnrollMfaStepProps>) {

  const startedRef = useRef(false);

  const [secret, setSecret] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const form = useForm<EnrollVerifyValues>({
    resolver: zodResolver(enrollVerifySchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { passcode: '' },
  });

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

  async function onVerify({ passcode }: EnrollVerifyValues) {
    try {
      await api.verifyEnroll(enrollmentToken, passcode);
      onEnrolled();
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        onEnrolled();
        return;
      }
      form.setError('root', {
        message:
          err instanceof ApiError
            ? err.apiMessage
            : 'Verification failed. Please try again.',
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Scan this QR code with an authenticator app (Google Authenticator,
        1Password, Authy…). Enrolling does <strong>not</strong> sign you in — you
        will enter your email and password again once MFA is enabled.
      </p>

      {loadError && (
        <Alert variant="destructive" role="alert">
          {loadError}
        </Alert>
      )}

      {qrDataUrl && (
        <img
          className="size-[200px] shrink-0 self-center rounded-xl border bg-background p-2 [image-rendering:pixelated]"
          src={qrDataUrl}
          alt="MFA QR code"
          width={200}
          height={200}
        />
      )}

      {secret && (
        <p className="text-center text-sm text-muted-foreground">
          Can&rsquo;t scan? Enter this key manually:
          <br />
          <code className="mt-1.5 inline-block rounded-lg bg-muted px-3 py-2 font-mono text-sm tracking-wider break-all text-foreground select-all">
            {secret}
          </code>
        </p>
      )}

      <Form {...form}>
        <form
          className="flex flex-col gap-5"
          onSubmit={form.handleSubmit(onVerify)}
          noValidate
        >
          <FormField
            control={form.control}
            name="passcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>6-digit code from your authenticator</FormLabel>
                <FormDescription>
                  Enter the 6-digit code from your authenticator app.
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

          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting || !qrDataUrl}
          >
            {form.formState.isSubmitting ? 'Verifying…' : 'Enable MFA'}
          </Button>
        </form>
      </Form>
    </div>
  );
}

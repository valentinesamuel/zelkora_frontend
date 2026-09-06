import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { AuthShell } from './components/AuthShell';
import { CredentialsStep } from './components/CredentialsStep';
import { EnrollMfaStep } from './components/EnrollMfaStep';
import { VerifyMfaStep } from './components/VerifyMfaStep';
import type { LoginResult } from './types';

type Step =
  | { name: 'credentials'; notice?: string }
  | { name: 'enroll'; enrollmentToken: string }
  | { name: 'verify'; preAuthToken: string };

export function LoginPage() {
  // Router state is untrusted input (anyone can craft a `navigate` state), so
  // narrow it to a string before it reaches the notice Alert.
  const location = useLocation();
  const routerNotice = (location.state as { notice?: unknown } | null)?.notice;
  let initialNotice: string | undefined;
  if (typeof routerNotice === 'string') {
    initialNotice = routerNotice;
  }
  const [step, setStep] = useState<Step>({
    name: 'credentials',
    notice: initialNotice,
  });

  function handleCredentialsResult(result: LoginResult) {
    if (result.requiresEnrollment) {
      setStep({
        name: 'enroll',
        enrollmentToken: result.enrollmentToken ?? '',
      });
    } else {
      setStep({ name: 'verify', preAuthToken: result.preAuthToken ?? '' });
    }
  }

  function handleEnrolled() {
    setStep({ name: 'credentials', notice: 'MFA enabled — sign in again.' });
  }

  function handlePreAuthExpired(notice: string) {
    setStep({ name: 'credentials', notice });
  }

  const titleByStep: Record<Step['name'], string> = {
    credentials: 'Login',
    enroll: 'Set up two-factor authentication',
    verify: 'Two-factor authentication',
  };

  const subtitleByStep: Record<Step['name'], string> = {
    credentials: "Now that you're here, let's log in to your Zelkora account",
    enroll:
      'Scan the code with your authenticator app to finish securing your account',
    verify: 'Enter the code from your authenticator app',
  };

  return (
    <AuthShell
      title={titleByStep[step.name]}
      subtitle={subtitleByStep[step.name]}
    >
      {step.name === 'credentials' && (
        <CredentialsStep
          notice={step.notice}
          onResult={handleCredentialsResult}
        />
      )}

      {step.name === 'enroll' && (
        <EnrollMfaStep
          enrollmentToken={step.enrollmentToken}
          onEnrolled={handleEnrolled}
        />
      )}

      {step.name === 'verify' && (
        <VerifyMfaStep
          preAuthToken={step.preAuthToken}
          onExpired={handlePreAuthExpired}
        />
      )}
    </AuthShell>
  );
}

import { useState } from 'react';

import './auth.css';
import { CredentialsStep } from './components/CredentialsStep';
import { EnrollMfaStep } from './components/EnrollMfaStep';
import { VerifyMfaStep } from './components/VerifyMfaStep';
import type { LoginResult } from './types';

// Discriminated union, not parallel booleans: "in the enroll step but no token"
// is unrepresentable. The pre-auth / enrollment tokens live ONLY here in
// component state — never in storage, never in a URL, never in the auth context
// (INV-5).
type Step =
  | { name: 'credentials'; notice?: string }
  | { name: 'enroll'; enrollmentToken: string }
  | { name: 'verify'; preAuthToken: string };

export function LoginPage() {
  const [step, setStep] = useState<Step>({ name: 'credentials' });

  // Both /auth/login branches return HTTP 200. Discriminate ONLY on
  // `requiresEnrollment` (INV-7):
  //   true  -> enrollmentToken present, preAuthToken absent -> enroll step
  //   false -> preAuthToken present                          -> verify step
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

  // After /mfa/enroll/verify the enrollment token is spent and is NOT a session
  // (D4). Return to credentials; the next login takes the requiresEnrollment:
  // false branch and yields a preAuthToken.
  function handleEnrolled() {
    setStep({ name: 'credentials', notice: 'MFA enabled — sign in again.' });
  }

  // Pre-auth token expired mid-verify: restart from credentials with a notice.
  function handlePreAuthExpired(notice: string) {
    setStep({ name: 'credentials', notice });
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Sign in</h1>

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
      </div>
    </main>
  );
}

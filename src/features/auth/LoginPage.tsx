import { useState } from 'react';

import './auth.css';
import { CredentialsStep } from './components/CredentialsStep';
import { EnrollMfaStep } from './components/EnrollMfaStep';
import { VerifyMfaStep } from './components/VerifyMfaStep';
import type { LoginResult } from './types';


type Step =
  | { name: 'credentials'; notice?: string }
  | { name: 'enroll'; enrollmentToken: string }
  | { name: 'verify'; preAuthToken: string };

export function LoginPage() {
  const [step, setStep] = useState<Step>({ name: 'credentials' });


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

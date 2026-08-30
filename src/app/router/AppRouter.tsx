import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from '@/app/layouts/AppLayout';
import { PublicOnly, RequireAuth } from '@/features/auth/guards';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { StubPage } from '@/features/dashboard/pages/StubPage';
import { PatientCreatePage } from '@/features/patients/pages/PatientCreatePage';
import { PatientDetailPage } from '@/features/patients/pages/PatientDetailPage';
import { PatientEditPage } from '@/features/patients/pages/PatientEditPage';
import { PatientListPage } from '@/features/patients/pages/PatientListPage';
import { ProfilePage } from '@/features/profile/ProfilePage';

export function AppRouter() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnly>
            <LoginPage />
          </PublicOnly>
        }
      />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="patients" element={<PatientListPage />} />
        <Route path="patients/new" element={<PatientCreatePage />} />
        <Route path="patients/:patientId/edit" element={<PatientEditPage />} />
        <Route path="patients/:patientId" element={<PatientDetailPage />} />
        <Route
          path="billing"
          element={<StubPage title="Billing" note="Billing overview lands in a later phase." />}
        />
        <Route
          path="billing/claims"
          element={<StubPage title="HMO claims" note="Claims management lands in a later phase." />}
        />
        <Route
          path="queue"
          element={<StubPage title="Queue & appointments" note="Queue view lands in a later phase." />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

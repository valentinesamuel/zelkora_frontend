import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from '@/app/layouts/AppLayout';
import { PublicOnly, RequireAuth, RequirePermission } from '@/features/auth/guards';
import { LoginPage } from '@/features/auth/LoginPage';
import { PERMISSIONS } from '@/features/auth/permissions';
import { BranchCreatePage } from '@/features/branch/pages/BranchCreatePage';
import { BranchEditPage } from '@/features/branch/pages/BranchEditPage';
import { BranchListPage } from '@/features/branch/pages/BranchListPage';
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
        {/* `branches/new` MUST precede any `branches/:branchId`-style route.
            No detail route exists (list/create/edit only). */}
        <Route
          path="branches"
          element={
            <RequirePermission permission={[PERMISSIONS.BRANCH.READ]}>
              <BranchListPage />
            </RequirePermission>
          }
        />
        <Route
          path="branches/new"
          element={
            <RequirePermission permission={[PERMISSIONS.BRANCH.CREATE]}>
              <BranchCreatePage />
            </RequirePermission>
          }
        />
        <Route
          path="branches/:branchId/edit"
          element={
            <RequirePermission permission={[PERMISSIONS.BRANCH.UPDATE]}>
              <BranchEditPage />
            </RequirePermission>
          }
        />
        <Route
          path="billing"
          element={
            <StubPage
              title="Billing"
              note="Billing overview lands in a later phase."
            />
          }
        />
        <Route
          path="billing/claims"
          element={
            <StubPage
              title="HMO claims"
              note="Claims management lands in a later phase."
            />
          }
        />
        <Route
          path="queue"
          element={
            <StubPage
              title="Queue & appointments"
              note="Queue view lands in a later phase."
            />
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

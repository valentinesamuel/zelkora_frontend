import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from '@/app/layouts/AppLayout';
import { AcceptInvitePage } from '@/features/auth/AcceptInvitePage';
import { PublicOnly, RequireAdmin, RequireAuth, RequirePermission } from '@/features/auth/guards';
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
import { StaffEditPage } from '@/features/staff/pages/StaffEditPage';
import { StaffInvitePage } from '@/features/staff/pages/StaffInvitePage';
import { StaffListPage } from '@/features/staff/pages/StaffListPage';
import { SettingsLayout } from '@/features/settings/SettingsLayout';
import { SETTINGS_INDEX_REDIRECT } from '@/features/settings/settingsNav';
import { BranchSettingsPage } from '@/features/settings/sections/BranchSettingsPage';
import { RoleCreatePage } from '@/features/roles/pages/RoleCreatePage';
import { RoleEditPage } from '@/features/roles/pages/RoleEditPage';
import { RoleListPage } from '@/features/roles/pages/RoleListPage';

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
        path="/invite/:token/accept"
        element={
          <PublicOnly>
            <AcceptInvitePage />
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
        {/* `staff/new` MUST precede any `staff/:id`-style route (branch
            precedent). Edit-only this phase (no read-only detail view, same
            as Branch/Role). */}
        <Route
          path="staff"
          element={
            <RequirePermission permission={[PERMISSIONS.STAFF.READ]}>
              <StaffListPage />
            </RequirePermission>
          }
        />
        <Route
          path="staff/new"
          element={
            <RequirePermission permission={[PERMISSIONS.STAFF.CREATE]}>
              <StaffInvitePage />
            </RequirePermission>
          }
        />
        <Route
          path="staff/:staffId/edit"
          element={
            <RequirePermission permission={[PERMISSIONS.STAFF.UPDATE]}>
              <StaffEditPage />
            </RequirePermission>
          }
        />
        <Route
          path="settings"
          element={
            <RequireAdmin>
              <SettingsLayout />
            </RequireAdmin>
          }
        >
          <Route
            index
            element={<Navigate to={SETTINGS_INDEX_REDIRECT} replace />}
          />
          <Route path="branch" element={<BranchSettingsPage />} />
          {/* `roles/new` MUST precede any `roles/:id`-style route (branch/staff
              precedent). */}
          <Route
            path="roles"
            element={
              <RequirePermission permission={[PERMISSIONS.ROLE.READ]}>
                <RoleListPage />
              </RequirePermission>
            }
          />
          <Route
            path="roles/new"
            element={
              <RequirePermission permission={[PERMISSIONS.ROLE.CREATE]}>
                <RoleCreatePage />
              </RequirePermission>
            }
          />
          <Route
            path="roles/:roleId/edit"
            element={
              <RequirePermission permission={[PERMISSIONS.ROLE.UPDATE]}>
                <RoleEditPage />
              </RequirePermission>
            }
          />
        </Route>
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

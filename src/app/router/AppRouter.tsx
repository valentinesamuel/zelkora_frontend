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
        {/* `settings/roles/new` MUST precede any `settings/roles/:id`-style
            route (branch/staff precedent). The Settings shell/sub-nav was
            removed since Roles & Permissions is reached via the sidebar;
            these routes stay at the same paths so that sidebar link keeps
            working. */}
        <Route
          path="settings/roles"
          element={
            <RequireAdmin>
              <RequirePermission permission={[PERMISSIONS.ROLE.READ]}>
                <RoleListPage />
              </RequirePermission>
            </RequireAdmin>
          }
        />
        <Route
          path="settings/roles/new"
          element={
            <RequireAdmin>
              <RequirePermission permission={[PERMISSIONS.ROLE.CREATE]}>
                <RoleCreatePage />
              </RequirePermission>
            </RequireAdmin>
          }
        />
        <Route
          path="settings/roles/:roleId/edit"
          element={
            <RequireAdmin>
              <RequirePermission permission={[PERMISSIONS.ROLE.UPDATE]}>
                <RoleEditPage />
              </RequirePermission>
            </RequireAdmin>
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

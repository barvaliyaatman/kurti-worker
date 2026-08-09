import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout.jsx';
import SplashPage from '../pages/SplashPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import HomePage from '../pages/HomePage.jsx';
import EmployeeListPage from '../pages/EmployeeListPage.jsx';
import EmployeeWorkspacePage from '../pages/EmployeeWorkspacePage.jsx';
import JobCardListPage from '../pages/JobCardListPage.jsx';
import CuttingListPage from '../pages/CuttingListPage.jsx';
import CuttingDetailsPage from '../pages/CuttingDetailsPage.jsx';
import BundleListPage from '../pages/BundleListPage.jsx';
import AssignmentListPage from '../pages/AssignmentListPage.jsx';
import JobCardAssignmentWorkspacePage from '../pages/JobCardAssignmentWorkspacePage.jsx';
import SalaryDashboardPage from '../pages/SalaryDashboardPage.jsx';
import EmployeeSalaryDetailsPage from '../pages/EmployeeSalaryDetailsPage.jsx';
import AdvancePaymentDashboardPage from '../pages/AdvancePaymentDashboardPage.jsx';
import ReportsDashboardPage from '../pages/ReportsDashboardPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import SettingsPage from '../pages/SettingsPage.jsx';
import ArchiveTrashPage from '../pages/ArchiveTrashPage.jsx';
import ComingSoonPage from '../pages/ComingSoonPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import UnauthorizedPage from '../pages/UnauthorizedPage.jsx';
import ForbiddenPage from '../pages/ForbiddenPage.jsx';
import ProtectedRoute from '../components/common/ProtectedRoute.jsx';
import RoleRoute from '../components/common/RoleRoute.jsx';
import { ROUTES } from '../constants/index.js';
import { useAuth } from '../hooks/useAuth.js';
import { Navigate, useLocation } from 'react-router-dom';
import Loading from '../components/common/Loading.jsx';

import SuperAdminDashboard from '../pages/super-admin/SuperAdminDashboard.jsx';
import CompanyManagementPage from '../pages/super-admin/CompanyManagementPage.jsx';
import OwnerManagementPage from '../pages/super-admin/OwnerManagementPage.jsx';
import UserManagementPage from '../pages/super-admin/UserManagementPage.jsx';
import SystemSettingsPage from '../pages/super-admin/SystemSettingsPage.jsx';
import AuditLogsPage from '../pages/super-admin/AuditLogsPage.jsx';
import ForcePasswordResetPage from '../pages/ForcePasswordResetPage.jsx';
import CompanyUsersPage from '../pages/CompanyUsersPage.jsx';
import { useConfig } from '../contexts/ConfigContext.jsx';

const SuperAdminRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'SUPER_ADMIN') {
    return <Navigate to="/super-admin/dashboard" replace />;
  }
  return <HomePage />;
};

const ForceResetRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <Loading fullScreen message="Verifying session..." />;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  return children;
};

const WorkflowRoute = ({ stage, children }) => {
  const { workflowSettings } = useConfig();
  const { user } = useAuth();
  if (user?.role === 'SUPER_ADMIN') return children;

  if (stage === 'cutting' && workflowSettings?.skip_cutting) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }
  if (stage === 'bundles' && workflowSettings?.skip_bundle) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }
  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Standalone Public Routes */}
      <Route path={ROUTES.SPLASH} element={<SplashPage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
      <Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />

      {/* Force password reset route - requires auth but has its own full screen layout */}
      <Route
        path="/force-password-reset"
        element={
          <ForceResetRoute>
            <ForcePasswordResetPage />
          </ForceResetRoute>
        }
      />

      {/* Protected Routes (Wrapped in AppLayout) */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path={ROUTES.HOME}
          element={<SuperAdminRedirect />}
        />
        {/* Super Admin Workspace Routes */}
        <Route
          path="/super-admin/dashboard"
          element={
            <RoleRoute allowedRoles={['SUPER_ADMIN']}>
              <SuperAdminDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/super-admin/companies"
          element={
            <RoleRoute allowedRoles={['SUPER_ADMIN']}>
              <CompanyManagementPage />
            </RoleRoute>
          }
        />
        <Route
          path="/super-admin/owners"
          element={
            <RoleRoute allowedRoles={['SUPER_ADMIN']}>
              <OwnerManagementPage />
            </RoleRoute>
          }
        />
        <Route
          path="/super-admin/users"
          element={
            <RoleRoute allowedRoles={['SUPER_ADMIN']}>
              <UserManagementPage />
            </RoleRoute>
          }
        />
        <Route
          path="/super-admin/settings"
          element={
            <RoleRoute allowedRoles={['SUPER_ADMIN']}>
              <SystemSettingsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/super-admin/audit-logs"
          element={
            <RoleRoute allowedRoles={['SUPER_ADMIN']}>
              <AuditLogsPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.EMPLOYEES}
          element={
            <RoleRoute allowedRoles={['OWNER']}>
              <EmployeeListPage />
            </RoleRoute>
          }
        />
        <Route
          path="/employees/:employeeId/workspace"
          element={
            <RoleRoute allowedRoles={['OWNER']}>
              <EmployeeWorkspacePage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.JOB_CARDS}
          element={
            <RoleRoute allowedRoles={['OWNER', 'MANAGER']}>
              <JobCardListPage />
            </RoleRoute>
          }
        />
        <Route
          path="/job-cards/:jobCardId"
          element={
            <RoleRoute allowedRoles={['OWNER', 'MANAGER']}>
              <JobCardAssignmentWorkspacePage />
            </RoleRoute>
          }
        />
        <Route
          path="/assignment/job-cards/:jobCardId"
          element={
            <RoleRoute allowedRoles={['OWNER', 'MANAGER']}>
              <JobCardAssignmentWorkspacePage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.CUTTING}
          element={
            <RoleRoute allowedRoles={['OWNER', 'MANAGER', 'CUTTING_MASTER']}>
              <WorkflowRoute stage="cutting">
                <CuttingListPage />
              </WorkflowRoute>
            </RoleRoute>
          }
        />
        <Route
          path="/cutting/:jobCardId"
          element={
            <RoleRoute allowedRoles={['OWNER', 'MANAGER', 'CUTTING_MASTER']}>
              <WorkflowRoute stage="cutting">
                <CuttingDetailsPage />
              </WorkflowRoute>
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.BUNDLES}
          element={
            <RoleRoute allowedRoles={['OWNER', 'MANAGER', 'CUTTING_MASTER']}>
              <WorkflowRoute stage="bundles">
                <BundleListPage />
              </WorkflowRoute>
            </RoleRoute>
          }
        />
        <Route
          path="/assignments"
          element={
            <RoleRoute allowedRoles={['OWNER', 'MANAGER']}>
              <AssignmentListPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.SALARY}
          element={
            <RoleRoute allowedRoles={['OWNER', 'MANAGER']}>
              <SalaryDashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path="/salary/:employeeId"
          element={
            <RoleRoute allowedRoles={['OWNER', 'MANAGER']}>
              <EmployeeSalaryDetailsPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.ADVANCES_PAYMENTS}
          element={
            <RoleRoute allowedRoles={['OWNER', 'MANAGER']}>
              <AdvancePaymentDashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.REPORTS}
          element={
            <RoleRoute allowedRoles={['OWNER', 'MANAGER', 'CUTTING_MASTER']}>
              <ReportsDashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.PROFILE}
          element={
            <RoleRoute allowedRoles={['OWNER', 'MANAGER', 'CUTTING_MASTER']}>
              <ProfilePage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.SETTINGS}
          element={
            <RoleRoute allowedRoles={['OWNER']}>
              <SettingsPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.ARCHIVE}
          element={
            <RoleRoute allowedRoles={['OWNER']}>
              <ArchiveTrashPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.COMPANY_USERS}
          element={
            <RoleRoute allowedRoles={['OWNER']}>
              <CompanyUsersPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.COMING_SOON}
          element={
            <RoleRoute allowedRoles={['OWNER', 'MANAGER', 'CUTTING_MASTER']}>
              <ComingSoonPage />
            </RoleRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

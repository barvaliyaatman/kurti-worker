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

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Standalone Public Routes */}
      <Route path={ROUTES.SPLASH} element={<SplashPage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
      <Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />

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
          element={
            <RoleRoute allowedRoles={['OWNER', 'MANAGER', 'CUTTING_MASTER']}>
              <HomePage />
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
              <CuttingListPage />
            </RoleRoute>
          }
        />
        <Route
          path="/cutting/:jobCardId"
          element={
            <RoleRoute allowedRoles={['OWNER', 'MANAGER', 'CUTTING_MASTER']}>
              <CuttingDetailsPage />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.BUNDLES}
          element={
            <RoleRoute allowedRoles={['OWNER', 'MANAGER', 'CUTTING_MASTER']}>
              <BundleListPage />
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

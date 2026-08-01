import React from 'react';
import { useAuth } from '../hooks/useAuth.js';
import OwnerDashboard from '../components/dashboard/OwnerDashboard.jsx';
import ManagerDashboard from '../components/dashboard/ManagerDashboard.jsx';
import CuttingMasterDashboard from '../components/dashboard/CuttingMasterDashboard.jsx';

export const HomePage = () => {
  const { user } = useAuth();
  const userRole = (user?.role || 'OWNER').toUpperCase();

  // Format today's date (e.g., 31 Jul 2026)
  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Dynamic greeting based on current time
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Good Morning'
      : currentHour < 17
      ? 'Good Afternoon'
      : 'Good Evening';

  const userName = user?.full_name?.split(' ')[0] || 'User';

  // Render role-specific dashboard
  const commonProps = { greeting, userName, todayFormatted };

  if (userRole === 'CUTTING_MASTER') {
    return <CuttingMasterDashboard {...commonProps} />;
  }

  if (userRole === 'MANAGER') {
    return <ManagerDashboard {...commonProps} />;
  }

  return <OwnerDashboard {...commonProps} />;
};

export default HomePage;

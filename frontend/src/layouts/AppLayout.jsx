import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Users, 
  Scissors, 
  CheckSquare, 
  Banknote, 
  BarChart3, 
  User, 
  Settings, 
  Menu, 
  LogOut, 
  PanelLeftClose, 
  PanelLeft,
  ShieldCheck,
  Layers,
  CreditCard,
  ChevronRight,
  Search,
  Sparkles,
  Trash2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useConfig } from '../contexts/ConfigContext.jsx';
import { APP_NAME, FACTORY_NAME, ROUTES, NAVIGATION_ITEMS } from '../constants/index.js';
import { cn } from '../utils/cn.js';
import Avatar from '../components/ui/Avatar.jsx';
import Drawer from '../components/ui/Drawer.jsx';
import SessionExpiredDialog from '../components/common/SessionExpiredDialog.jsx';
import NotificationBellDropdown from '../components/notifications/NotificationBellDropdown.jsx';

const ICON_MAP = {
  Home,
  FileText,
  Users,
  Scissors,
  CheckSquare,
  Banknote,
  BarChart3,
  User,
  Settings,
  CreditCard,
  Trash2,
};

const BREADCRUMB_MAP = {
  '/home': 'Dashboard',
  '/employees': 'Employees Master',
  '/job-cards': 'Production Job Cards',
  '/cutting': 'Cutting Queue & Bundles',
  '/assignments': 'Work Assignment Workspace',
  '/salary': 'Salary & Payroll',
  '/advances-payments': 'Advances & Payments Ledger',
  '/reports': 'Reports & Analytics',
  '/settings': 'Dynamic System Settings',
  '/archive': 'Safe Delete & Trash Archive',
  '/profile': 'User Profile',
};

export const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, sessionExpiredModalOpen, closeSessionExpiredModal } = useAuth();
  const { config } = useConfig();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const displayAppName = config.company_name || APP_NAME;
  const displayFactoryName = config.factory_name || FACTORY_NAME;

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const userRoleUpper = user?.role ? user.role.toUpperCase() : 'OWNER';

  // Filter menu items strictly by user role
  const filteredNavItems = NAVIGATION_ITEMS.filter((item) =>
    item.allowedRoles.includes(userRoleUpper)
  );

  // Compute Breadcrumb Trail
  const currentPath = location.pathname;
  let pageTitle = BREADCRUMB_MAP[currentPath] || 'ERP Workspace';
  if (currentPath.startsWith('/employees/')) {
    pageTitle = 'Employee 360° Workspace';
  } else if (currentPath.startsWith('/job-cards/')) {
    pageTitle = 'Job Card Assignment Workspace';
  } else if (currentPath.startsWith('/cutting/')) {
    pageTitle = 'Cutting Progress Details';
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row antialiased select-none font-sans">
      <SessionExpiredDialog
        isOpen={sessionExpiredModalOpen}
        onClose={closeSessionExpiredModal}
      />

      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR (<lg hidden, lg+ visible) */}
      {/* ========================================================================= */}
      <aside
        className={cn(
          'hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-[#0B132B] text-white z-30 shadow-2xl border-r border-slate-800/80 transition-all duration-300',
          sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'
        )}
      >
        {/* Brand Header */}
        <div className="h-20 px-5 flex items-center justify-between border-b border-slate-800/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#384CF0] flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 font-bold shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <h1 className="font-extrabold text-base tracking-tight text-white truncate max-w-[160px]">{displayAppName}</h1>
                <p className="text-xs text-slate-400 font-medium truncate max-w-[160px]">
                  {displayFactoryName}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800/80 transition-colors"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeft className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = ICON_MAP[item.icon] || Home;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 group relative',
                  isActive
                    ? 'bg-[#384CF0] text-white shadow-lg shadow-indigo-500/25 font-bold'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={cn('w-5 h-5 shrink-0', isActive ? 'text-white' : 'text-slate-400 group-hover:text-white')} />
                {!sidebarCollapsed && (
                  <span className="truncate flex-1 text-left text-xs">{item.label}</span>
                )}
                {!sidebarCollapsed && item.badge && (
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-900/40">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name={user?.full_name || 'User'} size="sm" status="active" />
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user?.full_name}</p>
                  <span className="text-[10px] text-[#384CF0] font-extrabold uppercase bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
                    {user?.role}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 p-2 rounded-xl hover:bg-slate-800 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT CONTAINER */}
      {/* ========================================================================= */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-all duration-300',
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        )}
      >
        {/* ----------------------------------------------------------------------- */}
        {/* TOP HEADER BAR */}
        {/* ----------------------------------------------------------------------- */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 h-16 sm:h-20 px-4 sm:px-8 flex items-center justify-between shadow-xs">
          {/* Header Title & Breadcrumb Trail */}
          <div className="flex items-center gap-3">
            <div className="lg:hidden w-10 h-10 rounded-xl bg-[#384CF0] flex items-center justify-center text-white font-bold text-sm shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                <span>{displayFactoryName}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-brand-600">{pageTitle}</span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                {pageTitle}
              </h2>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            {/* User Role Badge Capsule */}
            <div className="hidden sm:flex items-center gap-2.5 bg-indigo-50/80 border border-indigo-200/80 px-3.5 py-1.5 rounded-full text-xs font-semibold text-indigo-900 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#384CF0]" />
              <span className="font-bold text-slate-800">{user?.full_name || 'Factory Owner'}</span>
              <span className="bg-[#384CF0] text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wide">
                {user?.role || 'OWNER'}
              </span>
            </div>

            {/* Notification Bell Dropdown */}
            <NotificationBellDropdown />

            {/* Mobile Drawer Hamburger */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2.5 rounded-xl text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* ----------------------------------------------------------------------- */}
        {/* MOBILE NAVIGATION DRAWER (Slide-out) */}
        {/* ----------------------------------------------------------------------- */}
        <Drawer
          isOpen={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          title="Factory Navigation"
          subtitle={displayFactoryName}
          position="left"
          size="max-w-xs"
        >
          <div className="space-y-4">
            <div className="bg-slate-100 p-3.5 rounded-2xl flex items-center gap-3">
              <Avatar name={user?.full_name || 'User'} size="md" status="active" showStatus />
              <div>
                <p className="text-sm font-bold text-slate-900">{user?.full_name}</p>
                <p className="text-xs text-[#384CF0] font-bold uppercase">{user?.role}</p>
              </div>
            </div>

            <div className="space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = ICON_MAP[item.icon] || Home;
                const isActive = location.pathname === item.path;

                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      navigate(item.path);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors',
                      isActive
                        ? 'bg-[#384CF0] text-white font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] bg-indigo-100 text-[#384CF0] px-2 py-0.5 rounded-full font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </Drawer>

        {/* PAGE CONTENT ROUTER VIEW */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

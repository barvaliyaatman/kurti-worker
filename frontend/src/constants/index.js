import { 
  Home, 
  Users, 
  FileText, 
  Scissors, 
  CheckSquare, 
  Banknote, 
  BarChart3, 
  Settings, 
  User,
  PackageCheck,
  CreditCard,
  Trash2
} from 'lucide-react';

export const APP_NAME = 'Kurti ERP';
export const FACTORY_NAME = 'Kurti Manufacturing Factory';
export const API_BASE_URL = 'http://localhost:5000/api';

export const ROUTES = {
  SPLASH: '/',
  LOGIN: '/login',
  HOME: '/home',
  EMPLOYEES: '/employees',
  JOB_CARDS: '/job-cards',
  CUTTING: '/cutting',
  BUNDLES: '/bundles',
  ASSIGNMENT: '/assignment',
  SALARY: '/salary',
  ADVANCES_PAYMENTS: '/advances-payments',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  ARCHIVE: '/archive',
  PROFILE: '/profile',
  UNAUTHORIZED: '/unauthorized',
  FORBIDDEN: '/forbidden',
  COMING_SOON: '/coming-soon',
};

export const USER_ROLES = {
  OWNER: 'OWNER',
  MANAGER: 'MANAGER',
  CUTTING_MASTER: 'CUTTING_MASTER',
};

export const NAVIGATION_ITEMS = [
  {
    id: 'home',
    label: 'Dashboard',
    path: ROUTES.HOME,
    icon: 'Home',
    allowedRoles: ['OWNER', 'MANAGER', 'CUTTING_MASTER'],
    mobileBottom: true,
  },
  {
    id: 'job_cards',
    label: 'Job Cards',
    path: ROUTES.JOB_CARDS,
    icon: 'FileText',
    badge: 'View Only',
    allowedRoles: ['OWNER', 'MANAGER'],
    mobileBottom: true,
  },
  {
    id: 'employees',
    label: 'Employees Master',
    path: ROUTES.EMPLOYEES,
    icon: 'Users',
    badge: 'Workforce',
    allowedRoles: ['OWNER'],
    mobileBottom: true,
  },
  {
    id: 'cutting',
    label: 'Cutting Queue',
    path: ROUTES.CUTTING,
    icon: 'Scissors',
    badge: 'Cutting',
    allowedRoles: ['OWNER', 'MANAGER', 'CUTTING_MASTER'],
    mobileBottom: true,
  },
  {
    id: 'assignments',
    label: 'Bundle Assignment',
    path: '/assignments',
    icon: 'CheckSquare',
    badge: 'Stitching',
    allowedRoles: ['OWNER', 'MANAGER'],
    mobileBottom: true,
  },
  {
    id: 'salary',
    label: 'Salary & Payroll',
    path: ROUTES.SALARY,
    icon: 'Banknote',
    badge: 'Payroll',
    allowedRoles: ['OWNER', 'MANAGER'],
    mobileBottom: false,
  },
  {
    id: 'advances_payments',
    label: 'Advances & Ledger',
    path: ROUTES.ADVANCES_PAYMENTS,
    icon: 'CreditCard',
    badge: 'Ledger',
    allowedRoles: ['OWNER', 'MANAGER'],
    mobileBottom: false,
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    path: ROUTES.REPORTS,
    icon: 'BarChart3',
    badge: 'Reports',
    allowedRoles: ['OWNER', 'MANAGER', 'CUTTING_MASTER'],
    mobileBottom: false,
  },
  {
    id: 'settings',
    label: 'System Settings',
    path: ROUTES.SETTINGS,
    icon: 'Settings',
    badge: 'Config',
    allowedRoles: ['OWNER'],
    mobileBottom: false,
  },
  {
    id: 'archive',
    label: 'Archive / Trash',
    path: ROUTES.ARCHIVE,
    icon: 'Trash2',
    badge: 'Safe Delete',
    allowedRoles: ['OWNER'],
    mobileBottom: false,
  },
  {
    id: 'profile',
    label: 'My Profile',
    path: ROUTES.PROFILE,
    icon: 'User',
    allowedRoles: ['OWNER', 'MANAGER', 'CUTTING_MASTER'],
    mobileBottom: false,
  },
];

export const PRIORITY_OPTIONS = [
  { value: 'NORMAL', label: 'Normal', color: 'blue' },
  { value: 'HIGH', label: 'High', color: 'orange' },
  { value: 'URGENT', label: 'Urgent', color: 'red' },
];

export const JOB_CARD_STATUSES = [
  { value: 'CREATED', label: 'Created', color: 'blue' },
  { value: 'READY_FOR_CUTTING', label: 'Ready for Cutting', color: 'amber' },
  { value: 'CUTTING_IN_PROGRESS', label: 'Cutting In Progress', color: 'indigo' },
  { value: 'CUTTING_COMPLETED', label: 'Cutting Completed', color: 'emerald' },
];

export const DEFAULT_CUTTING_COMPONENTS = [
  'Top',
  'Pant',
  'Top Aster',
  'Pant Aster',
  'Dupatta',
];

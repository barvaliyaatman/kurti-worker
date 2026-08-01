import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, FilePlus, CheckSquare, BarChart3, Scissors } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/index.js';
import { cn } from '../../utils/cn.js';

export const QuickActionCard = ({ userRole = 'OWNER' }) => {
  const navigate = useNavigate();

  const allActions = [
    {
      id: 'add_employee',
      label: '+ Add Employee',
      desc: 'Register new production worker',
      icon: UserPlus,
      path: ROUTES.COMING_SOON,
      roles: ['OWNER'],
      bg: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200',
    },
    {
      id: 'create_job_card',
      label: '+ Job Card',
      desc: 'Create cutting & production batch',
      icon: FilePlus,
      path: ROUTES.COMING_SOON,
      roles: ['OWNER', 'MANAGER'],
      bg: 'bg-brand-50 text-brand-700 hover:bg-brand-100 border-brand-200',
    },
    {
      id: 'assign_work',
      label: '+ Assign Work',
      desc: 'Assign operations to workers',
      icon: CheckSquare,
      path: ROUTES.COMING_SOON,
      roles: ['OWNER', 'MANAGER'],
      bg: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200',
    },
    {
      id: 'cutting_queue',
      label: 'Cutting Queue',
      desc: 'View pending fabric cutting batches',
      icon: Scissors,
      path: ROUTES.COMING_SOON,
      roles: ['OWNER', 'MANAGER', 'CUTTING_MASTER'],
      bg: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200',
    },
    {
      id: 'view_reports',
      label: 'View Reports',
      desc: 'Production & payroll summary',
      icon: BarChart3,
      path: ROUTES.COMING_SOON,
      roles: ['OWNER', 'MANAGER'],
      bg: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
    },
  ];

  const allowedActions = allActions.filter((action) =>
    action.roles.includes(userRole.toUpperCase())
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {allowedActions.map((action) => {
        const Icon = action.icon;
        return (
          <motion.button
            key={action.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(action.path)}
            className={cn(
              'btn-touch flex flex-col items-start justify-between p-3.5 rounded-2xl border text-left transition-all h-full min-h-[96px]',
              action.bg
            )}
          >
            <div className="w-8 h-8 rounded-xl bg-white/80 backdrop-blur-xs flex items-center justify-center font-bold mb-2 shadow-xs">
              <Icon className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="font-bold text-xs leading-tight block">{action.label}</span>
              <span className="text-[10px] opacity-75 line-clamp-1 mt-0.5">{action.desc}</span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default QuickActionCard;

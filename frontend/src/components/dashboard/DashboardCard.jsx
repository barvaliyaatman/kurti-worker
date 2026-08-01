import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import { cn } from '../../utils/cn.js';

export const DashboardCard = ({
  title,
  value,
  icon: Icon,
  badgeText,
  status = 'active',
  iconBg = 'bg-brand-50 text-brand-600',
  onClick,
  className,
}) => {
  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.99 }}>
      <Card
        hoverable={!!onClick}
        onClick={onClick}
        className={cn('p-4 sm:p-5 flex flex-col justify-between h-full border border-factory-border', className)}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-xs', iconBg)}>
            {Icon && <Icon className="w-6 h-6" />}
          </div>
          {badgeText && <StatusBadge status={status} label={badgeText} />}
        </div>

        <div>
          <p className="text-xs font-semibold text-factory-muted uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-factory-navy mt-1 tracking-tight">
            {value !== undefined ? value : '—'}
          </h3>
        </div>
      </Card>
    </motion.div>
  );
};

export default DashboardCard;

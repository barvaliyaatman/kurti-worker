import React from 'react';
import { cn } from '../../utils/cn.js';
import { THEME } from '../../constants/theme.js';

export const StatusBadge = ({
  status = 'active',
  label,
  showDot = true,
  className,
}) => {
  const statusKey = status.toLowerCase();
  const config = THEME.status[statusKey] || THEME.status.active;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border capitalize leading-none select-none',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {showDot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} />}
      <span>{label || status}</span>
    </span>
  );
};

export default StatusBadge;

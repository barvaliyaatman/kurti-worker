import React from 'react';
import { cn } from '../../utils/cn.js';

export const Avatar = ({
  name = 'User',
  src,
  size = 'md',
  showStatus = false,
  status = 'active',
  className,
}) => {
  const initials = name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base font-extrabold',
    xl: 'w-20 h-20 text-xl font-extrabold',
  };

  return (
    <div className="relative inline-block shrink-0">
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn('rounded-full object-cover border border-factory-border', sizes[size], className)}
        />
      ) : (
        <div
          className={cn(
            'rounded-full bg-brand-600 text-white border border-brand-500 font-bold flex items-center justify-center shadow-sm',
            sizes[size],
            className
          )}
        >
          {initials}
        </div>
      )}

      {showStatus && (
        <span
          className={cn(
            'absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white',
            status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
          )}
        />
      )}
    </div>
  );
};

export default Avatar;

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn.js';

export const LoadingSpinner = ({ size = 'md', className, message }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <motion.div
        className={cn(
          'rounded-full border-brand-200 border-t-brand-600',
          sizes[size],
          className
        )}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {message && (
        <p className="mt-3 text-xs font-medium text-factory-muted animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;

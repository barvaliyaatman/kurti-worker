import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  icon: Icon,
  className,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold tracking-tight transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed select-none cursor-pointer';

  const variants = {
    primary:
      'bg-[#384CF0] hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-xs hover:shadow-md focus:ring-indigo-500',
    secondary:
      'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 border border-slate-200/80 focus:ring-slate-400',
    outline:
      'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs focus:ring-slate-300',
    danger:
      'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-xs focus:ring-red-500',
    ghost:
      'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-300',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
    md: 'h-10 px-4 text-xs rounded-xl gap-2',
    lg: 'h-11 px-5 text-sm rounded-xl gap-2',
  };

  return (
    <motion.button
      whileTap={{ scale: isDisabled || isLoading ? 1 : 0.98 }}
      type={type}
      disabled={isDisabled || isLoading}
      onClick={onClick}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 shrink-0" />}
          {children && <span>{children}</span>}
        </>
      )}
    </motion.button>
  );
};

export default Button;

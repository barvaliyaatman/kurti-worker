import React from 'react';
import { cn } from '../../utils/cn.js';

export const Card = ({ children, className, onClick, hoverable = false, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'card-factory',
        hoverable && 'hover:border-brand-300 hover:shadow-md cursor-pointer transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className, action, subtitle, title }) => {
  return (
    <div className={cn('flex items-center justify-between pb-3 mb-3 border-b border-slate-100', className)}>
      <div>
        {title && <h3 className="font-bold text-base text-factory-navy">{title}</h3>}
        {subtitle && <p className="text-xs text-factory-muted mt-0.5">{subtitle}</p>}
        {children}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export const CardBody = ({ children, className }) => {
  return <div className={cn('space-y-3', className)}>{children}</div>;
};

export const CardFooter = ({ children, className }) => {
  return (
    <div className={cn('pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs', className)}>
      {children}
    </div>
  );
};

export default Card;

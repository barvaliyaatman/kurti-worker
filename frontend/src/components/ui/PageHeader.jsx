import React from 'react';
import Breadcrumb from './Breadcrumb.jsx';
import { cn } from '../../utils/cn.js';

export const PageHeader = ({
  title,
  subtitle,
  action,
  showBreadcrumb = true,
  className,
}) => {
  return (
    <div className={cn('mb-6', className)}>
      {showBreadcrumb && <Breadcrumb />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-factory-navy tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-factory-muted mt-1 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
};

export default PageHeader;

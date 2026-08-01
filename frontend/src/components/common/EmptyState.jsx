import React from 'react';
import { PackageOpen } from 'lucide-react';

export const EmptyState = ({
  title = 'No Data Found',
  description = 'There are no records to display at this moment.',
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="card-factory text-center max-w-md mx-auto my-8 p-8 flex flex-col items-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
        {icon || <PackageOpen className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-bold text-factory-navy mb-1">{title}</h3>
      <p className="text-sm text-factory-muted mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

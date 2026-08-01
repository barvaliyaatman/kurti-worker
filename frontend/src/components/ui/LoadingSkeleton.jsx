import React from 'react';
import { cn } from '../../utils/cn.js';

export const LoadingSkeleton = ({ className, count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'bg-slate-200/70 animate-pulse rounded-xl',
            className
          )}
        />
      ))}
    </>
  );
};

export const CardSkeleton = () => (
  <div className="card-factory space-y-3">
    <div className="flex items-center justify-between">
      <LoadingSkeleton className="w-10 h-10 rounded-xl" />
      <LoadingSkeleton className="w-16 h-5 rounded-full" />
    </div>
    <LoadingSkeleton className="w-3/4 h-5" />
    <LoadingSkeleton className="w-1/2 h-4" />
    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
      <LoadingSkeleton className="w-20 h-4" />
      <LoadingSkeleton className="w-16 h-4" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 4 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-14 bg-slate-100 animate-pulse rounded-xl flex items-center px-4 gap-4">
        <LoadingSkeleton className="w-8 h-8 rounded-full" />
        <LoadingSkeleton className="w-1/3 h-4" />
        <LoadingSkeleton className="w-1/4 h-4" />
        <LoadingSkeleton className="w-16 h-6 rounded-full ml-auto" />
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;

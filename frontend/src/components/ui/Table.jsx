import React from 'react';
import { cn } from '../../utils/cn.js';

export const Table = ({ headers = [], children, className }) => {
  return (
    <div className={cn('w-full overflow-x-auto rounded-2xl border border-factory-border bg-white shadow-card', className)}>
      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-slate-50 border-b border-factory-border text-xs font-semibold uppercase tracking-wider text-factory-navy">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className="px-4 py-3.5 first:pl-6 last:pr-6">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-factory-navy font-medium">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export const TableRow = ({ children, className, onClick }) => {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'hover:bg-slate-50/80 transition-colors',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </tr>
  );
};

export const TableCell = ({ children, className }) => {
  return <td className={cn('px-4 py-3.5 first:pl-6 last:pr-6 align-middle', className)}>{children}</td>;
};

export default Table;

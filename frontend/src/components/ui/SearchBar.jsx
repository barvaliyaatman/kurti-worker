import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export const SearchBar = ({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search workers, job cards, cuttings...',
  className,
}) => {
  return (
    <div className={cn('relative flex items-center w-full', className)}>
      <Search className="w-4 h-4 text-factory-muted absolute left-3.5 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-11 pl-10 pr-10 rounded-xl border border-factory-border bg-slate-50 text-sm font-medium text-factory-navy placeholder:text-factory-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 p-1 text-factory-muted hover:text-factory-navy rounded-md"
          aria-label="Clear search query"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;

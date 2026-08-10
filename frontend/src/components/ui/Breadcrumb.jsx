import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { ROUTES } from '../../constants/index.js';

export const Breadcrumb = ({ items = [] }) => {
  const location = useLocation();

  const autoItems = items.length > 0 ? items : [
    { label: 'Home', path: ROUTES.HOME },
    ...location.pathname
      .split('/')
      .filter(Boolean)
      .map((segment, index, arr) => ({
        label: segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' '),
        path: '/' + arr.slice(0, index + 1).join('/'),
      })),
  ];

  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-xs text-factory-muted mb-4 select-none py-1 w-full overflow-hidden">
      <Link to={ROUTES.HOME} className="hover:text-brand-600 flex items-center gap-1 font-medium shrink-0">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {autoItems.map((item, idx) => {
        const isLast = idx === autoItems.length - 1;
        return (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {isLast ? (
              <span className="font-bold text-factory-navy truncate max-w-[120px] sm:max-w-[200px] shrink-0">
                {item.label}
              </span>
            ) : (
              <Link to={item.path} className="hover:text-brand-600 font-medium shrink-0 truncate max-w-[80px] sm:max-w-none">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;

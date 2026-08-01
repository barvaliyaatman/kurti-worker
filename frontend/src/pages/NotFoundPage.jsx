import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { ROUTES } from '../constants/index.js';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="card-factory text-center max-w-md w-full p-8 sm:p-10 flex flex-col items-center">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 text-factory-navy flex items-center justify-center mb-6 shadow-sm">
          <Compass className="w-10 h-10 text-brand-600" />
        </div>

        <span className="text-4xl font-extrabold text-brand-600 mb-1">404</span>

        <h1 className="text-xl sm:text-2xl font-bold text-factory-navy tracking-tight mb-2">
          Page Not Found
        </h1>

        <p className="text-xs sm:text-sm text-factory-muted mb-8 leading-relaxed">
          The page or route you requested does not exist or has been moved.
        </p>

        <button onClick={() => navigate(ROUTES.HOME)} className="btn-primary w-full">
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;

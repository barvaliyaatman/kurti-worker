import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn } from 'lucide-react';
import { ROUTES } from '../constants/index.js';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="card-factory text-center max-w-md w-full p-8 sm:p-10 flex flex-col items-center">
        <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6 shadow-sm">
          <Lock className="w-10 h-10" />
        </div>

        <span className="text-4xl font-extrabold text-amber-600 mb-1">401</span>

        <h1 className="text-xl sm:text-2xl font-bold text-factory-navy tracking-tight mb-2">
          Authentication Required
        </h1>

        <p className="text-xs sm:text-sm text-factory-muted mb-8 leading-relaxed">
          You must be logged in to view this page. Please sign in with your account credentials.
        </p>

        <button onClick={() => navigate(ROUTES.LOGIN)} className="btn-primary w-full flex items-center justify-center gap-2">
          <LogIn className="w-4 h-4" />
          <span>Go to Login</span>
        </button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;

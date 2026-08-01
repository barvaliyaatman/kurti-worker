import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { ROUTES } from '../constants/index.js';

export const ForbiddenPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="card-factory text-center max-w-md w-full p-8 sm:p-10 flex flex-col items-center">
        <div className="w-20 h-20 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mb-6 shadow-sm">
          <ShieldX className="w-10 h-10" />
        </div>

        <span className="text-4xl font-extrabold text-red-600 mb-1">403</span>

        <h1 className="text-xl sm:text-2xl font-bold text-factory-navy tracking-tight mb-2">
          Access Forbidden
        </h1>

        <p className="text-xs sm:text-sm text-factory-muted mb-4 leading-relaxed">
          Your current account role <strong className="text-factory-navy">({user?.role || 'User'})</strong> does not have permission to access this module.
        </p>

        <div className="w-full bg-slate-50 border border-factory-border rounded-xl p-3.5 mb-8 text-left text-xs text-factory-muted">
          <span className="font-bold text-factory-navy block mb-1">Role Restrictions:</span>
          • <strong>Owner</strong>: Access all modules<br />
          • <strong>Manager</strong>: Dashboard, Assignment, Salary, Reports<br />
          • <strong>Cutting Master</strong>: Cutting module only
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button onClick={() => navigate(-1)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          <button onClick={() => navigate(ROUTES.HOME)} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;

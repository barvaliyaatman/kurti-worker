import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShieldAlert } from 'lucide-react';
import { ROUTES } from '../../constants/index.js';

export const SessionExpiredDialog = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleConfirm = () => {
    onClose();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-factory-navy/80 backdrop-blur-sm">
      <div className="card-factory w-full max-w-sm p-6 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-bold text-factory-navy mb-1">Session Expired</h3>
        <p className="text-xs text-factory-muted mb-6 leading-relaxed">
          Your security token has expired or is no longer valid. Please log in again to continue managing factory operations.
        </p>

        <button onClick={handleConfirm} className="btn-primary w-full flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4" />
          <span>Return to Login</span>
        </button>
      </div>
    </div>
  );
};

export default SessionExpiredDialog;

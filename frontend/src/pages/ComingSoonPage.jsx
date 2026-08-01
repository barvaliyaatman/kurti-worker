import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowLeft, Layers } from 'lucide-react';
import { ROUTES } from '../constants/index.js';
import Button from '../components/ui/Button.jsx';

export const ComingSoonPage = () => {
  const navigate = useNavigate();

  return (
    <div className="py-8 px-4 flex items-center justify-center min-h-[calc(100vh-120px)]">
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200/80 max-w-xl w-full text-center">
        {/* Soft Clock Icon */}
        <div className="w-16 h-16 bg-indigo-50 text-[#384CF0] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100/60 shadow-xs">
          <Clock className="w-8 h-8" />
        </div>

        {/* Badge Pill */}
        <span className="bg-indigo-50 text-[#384CF0] font-extrabold text-[11px] uppercase tracking-wider px-4 py-1.5 rounded-full inline-block mb-3 border border-indigo-100">
          FUTURE PHASE MODULE
        </span>

        {/* Heading */}
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Coming Soon
        </h1>

        {/* Subtitle */}
        <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed mb-6">
          This module is scheduled for implementation in upcoming project phases after Phase P-001 foundation setup.
        </p>

        {/* Roadmap Status Box */}
        <div className="bg-[#F8FAFC] p-5 rounded-2xl text-left border border-slate-200/80 mb-6 space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs text-slate-900 uppercase tracking-wider mb-2">
            <Layers className="w-4 h-4 text-[#384CF0]" />
            <span>Roadmap Status</span>
          </div>

          <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
            <li className="flex items-start gap-2">
              <span className="text-slate-400">•</span>
              <span>Phase P-001: Project Foundation & Architecture (Current)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400">•</span>
              <span>Phase P-002: Employee Management</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400">•</span>
              <span>Phase P-003: Cutting & Job Cards</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400">•</span>
              <span>Phase P-004: Work Assignments & Operations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400">•</span>
              <span>Phase P-005: Salary & Payouts</span>
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <button
          onClick={() => navigate(ROUTES.HOME)}
          className="bg-[#384CF0] hover:bg-indigo-700 active:scale-98 text-white font-bold px-6 py-3.5 rounded-2xl inline-flex items-center justify-center gap-2 mx-auto shadow-lg shadow-indigo-600/30 transition-all text-sm"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
          <span>Return to Home</span>
        </button>
      </div>
    </div>
  );
};

export default ComingSoonPage;

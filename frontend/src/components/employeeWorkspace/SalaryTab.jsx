import React from 'react';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import { Banknote, CreditCard, CheckCircle2, ArrowRight } from 'lucide-react';

export const SalaryTab = ({ summary = {}, employee = {}, onAddAdvance, onPaySalary, canManage = false }) => {
  const grossSalary = summary.gross_salary || 0;
  const advanceBalance = summary.advance_balance || 0;
  const totalPaid = summary.total_paid_salary || 0;
  const netPayable = summary.pending_payment || Math.max(0, grossSalary - advanceBalance - totalPaid);

  return (
    <div className="space-y-6">
      {/* Salary Calculation Formula Banner Card */}
      <Card className="p-5 bg-slate-900 text-white space-y-4 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-brand-400 uppercase tracking-wider block">
              Salary Ledger Formula
            </span>
            <h3 className="text-lg font-extrabold mt-0.5">
              Completed Pieces × Job Card Stitching Rate
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {canManage && (
              <>
                <Button size="sm" variant="outline" className="text-white border-slate-700 hover:bg-slate-800" onClick={onAddAdvance}>
                  + Add Advance
                </Button>
                <Button size="sm" variant="primary" onClick={onPaySalary}>
                  Pay Salary
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="p-3 bg-slate-800/80 rounded-xl space-y-1">
            <span className="text-slate-400 block font-medium">Completed Pieces</span>
            <span className="text-lg font-black text-white">{summary.completed_pieces || 0} Pieces</span>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl space-y-1">
            <span className="text-slate-400 block font-medium">Gross Earned Salary</span>
            <span className="text-lg font-black text-emerald-400">₹{grossSalary.toFixed(2)}</span>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl space-y-1">
            <span className="text-slate-400 block font-medium">Advance Loan Deductions</span>
            <span className="text-lg font-black text-amber-400">- ₹{advanceBalance.toFixed(2)}</span>
          </div>

          <div className="p-3 bg-brand-900/60 border border-brand-500/40 rounded-xl space-y-1">
            <span className="text-brand-300 block font-medium">Net Pending Payable</span>
            <span className="text-xl font-black text-brand-400">₹{netPayable.toFixed(2)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SalaryTab;

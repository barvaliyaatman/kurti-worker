import React from 'react';
import Drawer from '../ui/Drawer.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import Button from '../ui/Button.jsx';
import { UserCheck, Calendar, Layers, CheckCircle2, Clock, Ban, Edit3, ArrowRight } from 'lucide-react';

export const AssignmentDetailsDrawer = ({
  isOpen,
  onClose,
  assignment,
  onUpdateProgress,
  onComplete,
  onCancel,
  canManage = false,
}) => {
  if (!assignment) return null;

  const {
    id,
    assigned_sets,
    completed_sets,
    status,
    assigned_by,
    remarks,
    created_at,
    employee,
    bundle,
    history = [],
  } = assignment;

  const stitchingRate = assignment.stitching_rate || bundle?.job_card?.stitching_rate || 110.0;

  const isCompleted = status === 'COMPLETED' || status === 'SALARY_PENDING';
  const isCancelled = status === 'CANCELLED';

  const progressPercent = assigned_sets > 0
    ? Math.round((completed_sets / assigned_sets) * 100)
    : 0;

  const totalEarnings = (completed_sets * stitchingRate).toFixed(2);
  const maxPossibleEarnings = (assigned_sets * stitchingRate).toFixed(2);

  const statusBadgeVariant = {
    ASSIGNED: 'draft',
    IN_PROGRESS: 'warning',
    COMPLETED: 'completed',
    SALARY_PENDING: 'active',
    CANCELLED: 'inactive',
  };

  const statusLabels = {
    ASSIGNED: 'Assigned',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    SALARY_PENDING: 'Salary Pending',
    CANCELLED: 'Cancelled',
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Assignment: ${employee?.employee_name || 'Worker'}`}
      subtitle={`Bundle: ${bundle?.bundle_number || '—'} | Design: ${bundle?.job_card?.design_code || '—'}`}
    >
      <div className="space-y-6">
        {/* Header Summary Card */}
        <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200">
                {employee?.employee_name} ({employee?.employee_code})
              </span>
              <h2 className="text-2xl font-extrabold text-factory-navy mt-1">
                {completed_sets} / {assigned_sets} Sets
              </h2>
              <p className="text-xs text-factory-muted mt-0.5">Assigned by {assigned_by}</p>
            </div>

            <StatusBadge
              status={statusBadgeVariant[status] || 'draft'}
              label={statusLabels[status] || status}
            />
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
            <span>Job Card Rate: <strong className="text-factory-navy">₹{stitchingRate.toFixed(2)}/Pcs</strong></span>
            <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Earnings: ₹{totalEarnings} / ₹{maxPossibleEarnings}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-factory-navy">
            <span>Work Completion Progress</span>
            <span className="text-brand-600 font-extrabold">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="h-full bg-brand-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Remarks */}
        {remarks && (
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 text-xs">
            <span className="font-bold text-factory-muted uppercase tracking-wider block">Remarks / Instructions</span>
            <p className="text-factory-navy italic">{remarks}</p>
          </div>
        )}

        {/* History Audit Log */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-factory-navy uppercase tracking-wider border-b border-slate-100 pb-2">
            Assignment Audit History ({history.length})
          </h3>

          <div className="space-y-2">
            {history.map((item) => (
              <div key={item.id} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-factory-navy">{item.action}</span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(item.created_at).toLocaleString('en-GB')}
                  </span>
                </div>
                <p className="text-factory-muted">{item.notes}</p>
                <span className="text-[10px] text-slate-500 block">By: {item.performed_by}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions Footer */}
        {canManage && !isCancelled && (
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-end gap-2">
            {!isCompleted && (
              <>
                <Button
                  variant="outline"
                  icon={Clock}
                  onClick={() => {
                    onClose();
                    onUpdateProgress(assignment);
                  }}
                >
                  Update Progress
                </Button>

                <Button
                  variant="primary"
                  icon={CheckCircle2}
                  onClick={() => {
                    onClose();
                    onComplete(assignment);
                  }}
                >
                  Mark Completed
                </Button>
              </>
            )}

            <Button
              variant="danger"
              icon={Ban}
              onClick={() => {
                onClose();
                onCancel(assignment);
              }}
            >
              Cancel Assignment
            </Button>
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default AssignmentDetailsDrawer;

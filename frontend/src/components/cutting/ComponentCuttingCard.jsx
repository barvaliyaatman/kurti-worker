import React from 'react';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import { CheckCircle2, Play, Clock } from 'lucide-react';

export const ComponentCuttingCard = ({
  componentProgress = [],
  onUpdateStatus,
  canOperate = false,
  isUpdating = false,
}) => {
  return (
    <Card className="p-5 space-y-4 border border-factory-border">
      <h3 className="text-xs font-bold text-factory-navy uppercase tracking-wider border-b border-slate-100 pb-2">
        Batch Component Cutting Checklist
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {componentProgress.map((cp) => {
          const isDone = cp.status === 'COMPLETED';
          const isInProgress = cp.status === 'IN_PROGRESS';

          return (
            <div
              key={cp.component}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                isDone
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : isInProgress
                  ? 'bg-amber-50/70 border-amber-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-factory-navy">
                    {cp.component} Cutting
                  </span>
                  <StatusBadge
                    status={isDone ? 'completed' : isInProgress ? 'warning' : 'draft'}
                    label={isDone ? 'COMPLETED' : isInProgress ? 'IN PROGRESS' : 'PENDING'}
                  />
                </div>
                {cp.completed_by && (
                  <span className="text-[10px] text-emerald-800 font-medium block mt-1">
                    Completed by {cp.completed_by} on {new Date(cp.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>

              {canOperate && !isDone && (
                <div className="flex items-center gap-1.5">
                  {!isInProgress && (
                    <Button
                      size="sm"
                      variant="outline"
                      icon={Play}
                      isLoading={isUpdating}
                      onClick={() => onUpdateStatus(cp.component, 'IN_PROGRESS')}
                    >
                      Start
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="primary"
                    icon={CheckCircle2}
                    isLoading={isUpdating}
                    onClick={() => onUpdateStatus(cp.component, 'COMPLETED')}
                  >
                    Done
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default ComponentCuttingCard;

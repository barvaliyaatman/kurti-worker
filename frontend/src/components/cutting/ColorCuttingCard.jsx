import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, XCircle, Play, Pause, Check, PackageCheck } from 'lucide-react';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';

export const ColorCuttingCard = ({
  colorData,
  jobCardId,
  onUpdateComponentStatus,
  onGenerateBundle,
  isCuttingMaster = false,
  isGeneratingBundle = false,
}) => {
  const {
    color,
    total_sets,
    components = [],
    progress_percentage = 0,
    can_generate_bundle = false,
    bundle = null,
  } = colorData;

  const statusIcons = {
    COMPLETED: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
    IN_PROGRESS: <Clock className="w-4 h-4 text-amber-600 animate-pulse shrink-0" />,
    PENDING: <XCircle className="w-4 h-4 text-slate-400 shrink-0" />,
  };

  const statusLabels = {
    COMPLETED: 'Completed',
    IN_PROGRESS: 'In Progress',
    PENDING: 'Pending',
  };

  return (
    <Card className="p-4 space-y-4 border border-factory-border shadow-sm">
      {/* Color Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span className="text-xs font-semibold text-factory-muted uppercase tracking-wider">
            Color Batch
          </span>
          <h3 className="text-xl font-extrabold text-factory-navy mt-0.5">
            {color}
          </h3>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold text-factory-muted uppercase tracking-wider block">
            Quantity
          </span>
          <span className="text-sm font-extrabold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-xl border border-brand-200 inline-block mt-0.5">
            {total_sets} Sets
          </span>
        </div>
      </div>

      {/* Components Status Breakdown */}
      <div className="space-y-2 py-1">
        {components.map((comp) => {
          const isCompCompleted = comp.status === 'COMPLETED';
          const isCompInProgress = comp.status === 'IN_PROGRESS';

          return (
            <div
              key={comp.component}
              className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2 font-bold text-factory-navy min-w-0">
                {statusIcons[comp.status]}
                <span className="truncate">{comp.component}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className={`font-extrabold px-2 py-0.5 rounded-lg border text-[10px] ${
                    isCompCompleted
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : isCompInProgress
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  {statusLabels[comp.status]}
                </span>

                {/* Component Actions for Cutting Master */}
                {isCuttingMaster && !isCompCompleted && (
                  <div className="flex items-center gap-1">
                    {!isCompInProgress && (
                      <button
                        onClick={() =>
                          onUpdateComponentStatus({
                            job_card_id: jobCardId,
                            color,
                            component: comp.component,
                            status: 'IN_PROGRESS',
                          })
                        }
                        title="Start Cutting Component"
                        className="px-2 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-md border border-brand-200 transition-colors flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        <span>Start</span>
                      </button>
                    )}

                    <button
                      onClick={() =>
                        onUpdateComponentStatus({
                          job_card_id: jobCardId,
                          color,
                          component: comp.component,
                          status: 'COMPLETED',
                        })
                      }
                      title="Mark Component Completed"
                      className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md border border-emerald-200 transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 font-bold" />
                      <span>Done</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1 pt-1">
        <div className="flex items-center justify-between text-xs font-bold text-factory-navy">
          <span>Cutting Progress</span>
          <span className="text-brand-600 font-extrabold">{progress_percentage}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <motion.div
            className="h-full bg-brand-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress_percentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Bundle Generation Action / Generated Status */}
      <div className="pt-1">
        {bundle ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-extrabold text-emerald-900 block">
                  Bundle: {bundle.bundle_number}
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  Ready For Assignment
                </span>
              </div>
            </div>
            <span className="font-extrabold text-emerald-700 bg-white px-2 py-1 rounded-lg border border-emerald-200">
              {bundle.total_sets} Sets
            </span>
          </div>
        ) : (
          <Button
            variant="primary"
            className="w-full"
            size="sm"
            isDisabled={!can_generate_bundle || !isCuttingMaster}
            isLoading={isGeneratingBundle}
            icon={PackageCheck}
            onClick={() => onGenerateBundle(color)}
          >
            {can_generate_bundle
              ? `Generate Bundle (${total_sets} Sets)`
              : `Complete Components First (${progress_percentage}%)`}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ColorCuttingCard;

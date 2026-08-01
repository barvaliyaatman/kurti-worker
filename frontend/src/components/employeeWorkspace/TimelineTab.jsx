import React from 'react';
import Card from '../ui/Card.jsx';
import EmptyState from '../common/EmptyState.jsx';

export const TimelineTab = ({ timeline = [] }) => {
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h3 className="text-xs font-bold text-factory-navy uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
          Chronological Activity Timeline ({timeline.length})
        </h3>

        {timeline.length === 0 ? (
          <EmptyState
            title="No Activity Events Logged"
            description="Timeline events will be recorded automatically as work is assigned and completed."
          />
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {timeline.map((evt) => (
              <div key={evt.id} className="relative">
                <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-brand-600 ring-4 ring-white" />
                <div className="bg-slate-50 border border-slate-200/70 p-3.5 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-xs text-factory-navy">
                      {evt.title}
                    </span>
                    <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {evt.badge}
                    </span>
                  </div>
                  <p className="text-xs text-factory-muted">{evt.description}</p>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    {new Date(evt.timestamp).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default TimelineTab;

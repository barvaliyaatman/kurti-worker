import React from 'react';
import { FileText, Scissors, CheckSquare, Users, Banknote, Clock } from 'lucide-react';
import Card from '../ui/Card.jsx';
import { cn } from '../../utils/cn.js';

const TYPE_ICONS = {
  job_card: { icon: FileText, bg: 'bg-blue-50 text-blue-600' },
  cutting: { icon: Scissors, bg: 'bg-amber-50 text-amber-600' },
  assignment: { icon: CheckSquare, bg: 'bg-purple-50 text-purple-600' },
  employee: { icon: Users, bg: 'bg-emerald-50 text-emerald-600' },
  salary: { icon: Banknote, bg: 'bg-green-50 text-green-600' },
};

export const ActivityCard = ({ title, description, time, type = 'job_card', user }) => {
  const config = TYPE_ICONS[type] || TYPE_ICONS.job_card;
  const Icon = config.icon;

  return (
    <div className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl hover:bg-slate-100/60 transition-colors flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 font-bold', config.bg)}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-factory-navy leading-tight">{title}</h4>
          <p className="text-[11px] text-factory-muted mt-0.5">{description}</p>
          {user && (
            <span className="text-[10px] text-slate-400 font-medium block mt-1">
              By {user}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium shrink-0 bg-white px-2 py-1 rounded-full border border-slate-200/80">
        <Clock className="w-3 h-3 text-slate-400" />
        <span>{time}</span>
      </div>
    </div>
  );
};

export default ActivityCard;

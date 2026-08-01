import React from 'react';
import Card from '../ui/Card.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import { User, Phone, Calendar, CheckCircle2 } from 'lucide-react';

export const ProfileTab = ({ employee }) => {
  if (!employee) return null;

  return (
    <div className="space-y-4">
      <Card className="p-5 space-y-4 border border-factory-border">
        <h3 className="text-sm font-bold text-factory-navy uppercase tracking-wider border-b border-slate-100 pb-2">
          Personal & Work Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <User className="w-4 h-4 text-brand-600 shrink-0" />
            <div>
              <span className="text-factory-muted block">Full Name</span>
              <span className="font-extrabold text-factory-navy text-sm">{employee.employee_name}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded border border-brand-200">
              #
            </span>
            <div>
              <span className="text-factory-muted block">Employee Code</span>
              <span className="font-extrabold text-factory-navy text-sm">{employee.employee_code}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-factory-muted block">Phone Number</span>
              <span className="font-bold text-factory-navy">{employee.phone}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-factory-muted block">Joining Date</span>
              <span className="font-bold text-factory-navy">
                {employee.joining_date ? new Date(employee.joining_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl col-span-1 sm:col-span-2">
            <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
            <div>
              <span className="text-factory-muted block">Employment Status</span>
              <StatusBadge
                status={employee.status === 'ACTIVE' ? 'active' : 'inactive'}
                label={employee.status}
              />
            </div>
          </div>
        </div>

        {employee.notes && (
          <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl text-xs space-y-1">
            <span className="font-bold text-factory-muted uppercase tracking-wider block">Notes / Remarks</span>
            <p className="text-factory-navy italic">{employee.notes}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProfileTab;

import React from 'react';
import Drawer from '../ui/Drawer.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import Button from '../ui/Button.jsx';
import Avatar from '../ui/Avatar.jsx';
import { User, Phone, Calendar, Edit3, Power, Clock } from 'lucide-react';

export const EmployeeDetailsDrawer = ({
  isOpen,
  onClose,
  employee,
  onEdit,
  onToggleStatus,
  canManage = false,
}) => {
  if (!employee) return null;

  const {
    employee_code,
    employee_name,
    phone,
    status,
    joining_date,
    notes,
    created_at,
  } = employee;

  const isActive = status === 'ACTIVE';

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Worker Profile Details">
      <div className="space-y-6">
        {/* Profile Card Header */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-4">
          <Avatar name={employee_name} size="lg" status={isActive ? 'active' : 'inactive'} showStatus />
          <div>
            <h3 className="text-lg font-bold text-factory-navy">{employee_name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded border border-brand-200">
                {employee_code}
              </span>
              <StatusBadge status={isActive ? 'active' : 'inactive'} />
            </div>
          </div>
        </div>

        {/* Detailed Specs */}
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl">
            <Phone className="w-4 h-4 text-brand-600 shrink-0" />
            <div>
              <span className="text-factory-muted block">Phone Number</span>
              <a href={`tel:${phone}`} className="font-bold text-factory-navy hover:underline">
                {phone}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-factory-muted block">Joining Date</span>
              <span className="font-bold text-factory-navy">
                {joining_date ? new Date(joining_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
              </span>
            </div>
          </div>

          {notes && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-factory-muted block uppercase tracking-wider">
                Notes & Remarks
              </span>
              <p className="text-factory-navy italic">{notes}</p>
            </div>
          )}
        </div>

        {/* Management Controls */}
        {canManage && (
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              icon={Edit3}
              onClick={() => {
                onClose();
                onEdit(employee);
              }}
            >
              Edit Details
            </Button>

            <Button
              variant={isActive ? 'danger' : 'secondary'}
              icon={Power}
              onClick={() => {
                onClose();
                onToggleStatus(employee);
              }}
            >
              {isActive ? 'Deactivate Worker' : 'Activate Worker'}
            </Button>
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default EmployeeDetailsDrawer;

import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Calendar, Edit3, Power, Eye, LayoutDashboard, Trash2 } from 'lucide-react';
import Card from '../ui/Card.jsx';
import Avatar from '../ui/Avatar.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';

export const EmployeeCard = ({
  employee,
  onView,
  onEdit,
  onToggleStatus,
  onArchive,
  onOpenWorkspace,
  canManage = false,
}) => {
  const {
    employee_code,
    employee_name,
    phone,
    status,
    joining_date,
  } = employee;

  const isActive = status === 'ACTIVE';

  return (
    <motion.div whileTap={{ scale: 0.99 }}>
      <Card hoverable className="p-4 flex flex-col justify-between h-full border border-factory-border">
        {/* Header: Avatar, Name, Code & Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={employee_name} size="md" status={isActive ? 'active' : 'inactive'} showStatus />
            <div className="min-w-0">
              <h3 className="font-bold text-base text-factory-navy truncate">
                {employee_name}
              </h3>
              <span className="inline-block text-[11px] font-extrabold text-brand-600 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-md mt-0.5">
                {employee_code}
              </span>
            </div>
          </div>
          <StatusBadge status={isActive ? 'active' : 'inactive'} />
        </div>

        {/* Details: Phone & Joining Date */}
        <div className="space-y-2 py-2 border-t border-b border-slate-100 text-xs">
          <div className="flex items-center justify-between text-factory-muted">
            <span className="flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              Phone Number
            </span>
            <a
              href={`tel:${phone}`}
              className="font-bold text-factory-navy hover:text-brand-600 underline decoration-slate-300"
            >
              {phone}
            </a>
          </div>

          {joining_date && (
            <div className="flex items-center justify-between text-xs text-factory-muted">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                Joining Date
              </span>
              <span className="font-bold text-factory-navy">
                {new Date(joining_date).toLocaleDateString('en-GB')}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 flex items-center justify-between gap-2">
          {onOpenWorkspace && (
            <button
              onClick={() => onOpenWorkspace(employee)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </button>
          )}

          <div className="flex items-center gap-1.5">
            {onView && (
              <button
                onClick={() => onView(employee)}
                className="px-2.5 py-1.5 text-xs font-bold text-factory-navy bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-brand-600" />
                <span>Details</span>
              </button>
            )}

            {canManage && (
              <>
                <button
                  onClick={() => onEdit(employee)}
                  className="px-2.5 py-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => onToggleStatus(employee)}
                  className={`p-1.5 rounded-lg border text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  }`}
                  title={isActive ? 'Deactivate Employee' : 'Activate Employee'}
                >
                  <Power className="w-3.5 h-3.5" />
                </button>

                {onArchive && (
                  <button
                    onClick={() => onArchive(employee)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Archive Employee"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default EmployeeCard;

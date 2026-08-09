import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Layers, Send, Eye, Edit3, Scissors, Trash2 } from 'lucide-react';
import Card from '../ui/Card.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useConfig } from '../../contexts/ConfigContext.jsx';
import { getJobCardPrimaryAction } from '../../utils/workflowEngine.js';
import { bundleService } from '../../services/bundleService.js';

export const JobCardItemCard = ({
  jobCard,
  onView,
  onEdit,
  onSendToCutting,
  onCreateBundle,
  onArchive,
  canManage = false,
}) => {
  const navigate = useNavigate();
  const { workflowSettings } = useConfig();

  const {
    id,
    job_card_number,
    design_code,
    total_quantity,
    priority,
    due_date,
    status,
  } = jobCard;

  const isCreated = status === 'CREATED';
  const primaryAction = getJobCardPrimaryAction(workflowSettings, jobCard);

  // Priority Color styling
  const priorityStyles = {
    URGENT: 'bg-red-100 text-red-700 border-red-200',
    HIGH: 'bg-amber-100 text-amber-800 border-amber-200',
    NORMAL: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const statusBadgeVariant = {
    CREATED: 'draft',
    READY_FOR_CUTTING: 'pending',
    CUTTING_IN_PROGRESS: 'warning',
    CUTTING_COMPLETED: 'completed',
    READY_FOR_BUNDLE: 'completed',
    READY_FOR_ASSIGNMENT: 'completed',
  };

  const handleActionClick = () => {
    if (primaryAction.actionKey === 'SEND_TO_CUTTING') {
      onSendToCutting(jobCard);
    } else if (primaryAction.actionKey === 'SEND_TO_BUNDLE') {
      if (onCreateBundle) {
        onCreateBundle(jobCard);
      }
    } else if (primaryAction.targetPath) {
      navigate(primaryAction.targetPath);
    } else {
      onView(jobCard);
    }
  };

  return (
    <motion.div whileTap={{ scale: 0.99 }}>
      <Card hoverable className="p-4 flex flex-col justify-between h-full border border-factory-border">
        {/* Header: Number, Priority Badge, Status Badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <span className="font-extrabold text-base text-factory-navy tracking-tight block">
              {job_card_number}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold text-factory-muted">Design:</span>
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                {design_code}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge
              status={statusBadgeVariant[status] || 'draft'}
              label={status}
            />
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${
                priorityStyles[priority] || priorityStyles.NORMAL
              }`}
            >
              {priority}
            </span>
          </div>
        </div>

        {/* Quantities & Due Date */}
        <div className="py-2.5 border-y border-slate-100 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-factory-muted">
            <span className="flex items-center gap-1.5 font-medium">
              <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              Total Quantity
            </span>
            <span className="font-extrabold text-sm text-factory-navy">
              {total_quantity} Pcs
            </span>
          </div>

          <div className="flex items-center justify-between text-factory-muted">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              Due Date
            </span>
            <span className="font-bold text-factory-navy">
              {due_date ? new Date(due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'N/A'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 flex items-center justify-between gap-2">
          <button
            onClick={() => onView(jobCard)}
            className="px-3 py-1.5 text-xs font-bold text-factory-navy bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-brand-600" />
            <span>Details</span>
          </button>

          {canManage && (
            <div className="flex items-center gap-1.5">
              {isCreated && (
                <button
                  onClick={() => onEdit(jobCard)}
                  className="px-2.5 py-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              )}

              {primaryAction.allowed && primaryAction.actionKey !== 'VIEW_DETAILS' && (
                <button
                  onClick={handleActionClick}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{primaryAction.label}</span>
                </button>
              )}

              {onArchive && (
                <button
                  onClick={() => onArchive(jobCard)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Archive Job Card"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default JobCardItemCard;

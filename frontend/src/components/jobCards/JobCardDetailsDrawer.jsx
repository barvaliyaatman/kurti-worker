import React from 'react';
import Drawer from '../ui/Drawer.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import Button from '../ui/Button.jsx';
import Table, { TableRow, TableCell } from '../ui/Table.jsx';
import { Hash, Layers, Calendar, AlertCircle, Edit3, Send, Banknote } from 'lucide-react';

export const JobCardDetailsDrawer = ({
  isOpen,
  onClose,
  jobCard,
  onEdit,
  onSendToCutting,
  canManage = false,
  isSending = false,
}) => {
  if (!jobCard) return null;

  const {
    job_card_number,
    design_code,
    components,
    stitching_rate = 110.0,
    total_quantity,
    priority,
    due_date,
    status,
    remarks,
    created_by,
    items = [],
  } = jobCard;

  const compsList = typeof components === 'string' ? components.split(',') : components || [];

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={`Job Card: ${job_card_number}`} maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* Header Summary Box */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded border border-brand-200">
              Design #{design_code}
            </span>
            <h3 className="text-lg font-extrabold text-factory-navy mt-1">
              Job Card {job_card_number}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={status === 'READY_FOR_CUTTING' ? 'warning' : status === 'CUTTING_COMPLETED' ? 'completed' : 'draft'} label={status} />
            {priority === 'URGENT' && <StatusBadge status="danger" label="URGENT" />}
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="text-factory-muted font-medium block">Total Batch Quantity</span>
            <span className="text-base font-extrabold text-brand-600 block">{total_quantity} Pcs</span>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
            <span className="text-emerald-800 font-medium block">Stitching Rate</span>
            <span className="text-base font-extrabold text-emerald-700 block">₹{stitching_rate.toFixed(2)} / Pcs</span>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="text-factory-muted font-medium block">Due Date</span>
            <span className="text-sm font-bold text-factory-navy block">
              {due_date ? new Date(due_date).toLocaleDateString('en-GB') : 'N/A'}
            </span>
          </div>
        </div>

        {/* Components List */}
        <div className="p-3.5 bg-brand-50/50 border border-brand-200/80 rounded-xl space-y-2">
          <span className="text-xs font-bold text-brand-900 uppercase tracking-wider block">
            Garment Production Components
          </span>
          <div className="flex flex-wrap gap-1.5">
            {compsList.map((c) => (
              <span key={c} className="px-2.5 py-1 bg-white border border-brand-200 text-brand-700 text-xs font-bold rounded-lg">
                ✓ {c}
              </span>
            ))}
          </div>
        </div>

        {/* Items Breakdown Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-factory-navy uppercase tracking-wider">
            Color & Size Quantity Breakdown
          </h4>
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <Table headers={['Color', 'Size', 'Quantity']}>
              {items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell className="font-bold text-factory-navy">{it.color}</TableCell>
                  <TableCell className="font-extrabold text-brand-600">{it.size}</TableCell>
                  <TableCell className="font-extrabold text-emerald-600">{it.quantity} Pcs</TableCell>
                </TableRow>
              ))}
            </Table>
          </div>
        </div>

        {/* Remarks */}
        {remarks && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <span className="font-bold text-factory-muted uppercase tracking-wider block">Remarks</span>
            <p className="text-factory-navy italic">{remarks}</p>
          </div>
        )}

        {/* Action Controls */}
        {canManage && (
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            {status === 'CREATED' && (
              <Button
                variant="primary"
                icon={Send}
                isLoading={isSending}
                onClick={() => {
                  onClose();
                  onSendToCutting(jobCard);
                }}
              >
                Send to Cutting Queue
              </Button>
            )}

            <Button
              variant="outline"
              icon={Edit3}
              onClick={() => {
                onClose();
                onEdit(jobCard);
              }}
            >
              Edit Job Card
            </Button>
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default JobCardDetailsDrawer;

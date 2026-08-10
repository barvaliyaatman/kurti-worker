import React from 'react';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import Table, { TableRow, TableCell } from '../ui/Table.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { Clock, Eye, Edit3 } from 'lucide-react';

export const CurrentWorkTab = ({
  assignments = [],
  onUpdateProgress,
  canManage = false,
}) => {
  const activeAssignments = assignments.filter((a) =>
    ['ASSIGNED', 'IN_PROGRESS'].includes(a.status)
  );

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-xs font-bold text-factory-navy uppercase tracking-wider mb-3">
          Current Active Work Bundles ({activeAssignments.length})
        </h3>

        {activeAssignments.length === 0 ? (
          <EmptyState
            title="No Active Assignments"
            description="This employee currently has no active bundle assignments assigned."
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
              <Table
                headers={[
                  'Bundle #',
                  'Job Card',
                  'Design Code',
                  'Color / Size',
                  'Assigned Qty',
                  'Completed Qty',
                  'Remaining Qty',
                  'Stitching Rate',
                  'Assigned Date',
                  'Status',
                  'Actions',
                ]}
              >
                {activeAssignments.map((asgn) => {
                  const remaining = Math.max(0, asgn.assigned_sets - asgn.completed_sets);
                  const rate = asgn.stitching_rate || asgn.bundle?.job_card?.stitching_rate || 110.0;

                  return (
                    <TableRow key={asgn.id}>
                      <TableCell className="font-extrabold text-brand-600">
                        {asgn.bundle?.bundle_number}
                      </TableCell>
                      <TableCell className="font-bold text-factory-navy">
                        {asgn.bundle?.job_card?.job_card_number}
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded border border-brand-200 text-xs">
                          #{asgn.bundle?.job_card?.design_code}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold text-factory-navy">
                        {asgn.bundle?.color} ({asgn.bundle?.size})
                      </TableCell>
                      <TableCell className="font-extrabold text-factory-navy">
                        {asgn.assigned_sets} Sets
                      </TableCell>
                      <TableCell className="font-extrabold text-emerald-600">
                        {asgn.completed_sets} Sets
                      </TableCell>
                      <TableCell className="font-extrabold text-amber-700 bg-amber-50 rounded px-2">
                        {remaining} Sets
                      </TableCell>
                      <TableCell className="font-bold text-slate-700">
                        ₹{rate.toFixed(2)}/Pcs
                      </TableCell>
                      <TableCell>
                        {new Date(asgn.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status="warning" label={asgn.status} />
                      </TableCell>
                      <TableCell>
                        {canManage && (
                          <Button
                            size="sm"
                            variant="outline"
                            icon={Edit3}
                            onClick={() => onUpdateProgress(asgn)}
                          >
                            Update Progress
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </Table>
            </div>
            
            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col gap-3">
              {activeAssignments.map((asgn) => {
                const remaining = Math.max(0, asgn.assigned_sets - asgn.completed_sets);
                const rate = asgn.stitching_rate || asgn.bundle?.job_card?.stitching_rate || 110.0;
                const progressPercent = Math.round((asgn.completed_sets / asgn.assigned_sets) * 100) || 0;

                return (
                  <div key={asgn.id} className="p-4 bg-white border border-slate-200/80 rounded-xl space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="font-bold text-factory-navy truncate">
                        JC-{asgn.bundle?.job_card?.job_card_number} | Bundle {asgn.bundle?.bundle_number}
                      </div>
                      <StatusBadge status="warning" label={asgn.status} />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-factory-muted font-bold">Design / Detail:</span>
                      <div className="text-right">
                        <span className="font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200 break-words">
                          #{asgn.bundle?.job_card?.design_code}
                        </span>
                        <div className="text-factory-navy font-bold mt-1">
                          {asgn.bundle?.color} / {asgn.bundle?.size}
                        </div>
                      </div>
                    </div>
                    
                    {/* Worker Progress */}
                    <div className="space-y-1 pt-1 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-factory-muted">Progress</span>
                        <span className="text-brand-600">{progressPercent}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-brand-500 transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] pt-0.5">
                        <span className="font-medium text-emerald-600">
                          {asgn.completed_sets} Completed
                        </span>
                        <span className="font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                          Remaining: {remaining}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <div className="text-left">
                        <span className="text-factory-muted font-bold text-[10px] uppercase block">Assigned On</span>
                        <span className="font-bold text-slate-700">{new Date(asgn.created_at).toLocaleDateString('en-GB')}</span>
                      </div>
                      {canManage && (
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Edit3}
                          onClick={() => onUpdateProgress(asgn)}
                        >
                          Update Progress
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default CurrentWorkTab;

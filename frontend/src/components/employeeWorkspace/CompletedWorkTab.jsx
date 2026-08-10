import React from 'react';
import Card from '../ui/Card.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import Table, { TableRow, TableCell } from '../ui/Table.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { CheckCircle2 } from 'lucide-react';

export const CompletedWorkTab = ({ assignments = [] }) => {
  const completedAssignments = assignments.filter((a) =>
    ['COMPLETED', 'SALARY_PENDING'].includes(a.status)
  );

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-xs font-bold text-factory-navy uppercase tracking-wider mb-3">
          Completed Work Batches ({completedAssignments.length})
        </h3>

        {completedAssignments.length === 0 ? (
          <EmptyState
            title="No Completed Work Records"
            description="Completed bundle assignments will appear here."
          />
        ) : (
          <>
            <div className="hidden md:block border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
              <Table
                headers={[
                  'Bundle #',
                  'Design Code',
                  'Color / Size',
                  'Completed Quantity',
                  'Job Card Rate',
                  'Earned Amount',
                  'Completion Date',
                  'Status',
                ]}
              >
                {completedAssignments.map((asgn) => {
                  const rate = asgn.stitching_rate || asgn.bundle?.job_card?.stitching_rate || 110.0;
                  const earned = (asgn.completed_sets * rate).toFixed(2);
                  return (
                    <TableRow key={asgn.id}>
                      <TableCell className="font-extrabold text-brand-600">
                        {asgn.bundle?.bundle_number}
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded border border-brand-200 text-xs">
                          {asgn.bundle?.job_card?.design_code}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold text-factory-navy">
                        {asgn.bundle?.color} ({asgn.bundle?.size})
                      </TableCell>
                      <TableCell className="font-extrabold text-emerald-600">
                        {asgn.completed_sets} Pieces
                      </TableCell>
                      <TableCell className="font-bold text-slate-700">
                        ₹{rate.toFixed(2)}/Pcs
                      </TableCell>
                      <TableCell className="font-extrabold text-emerald-700">
                        ₹{earned}
                      </TableCell>
                      <TableCell>
                        {new Date(asgn.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status="completed" label="Completed" />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </Table>
            </div>
            
            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col gap-3">
              {completedAssignments.map((asgn) => {
                const rate = asgn.stitching_rate || asgn.bundle?.job_card?.stitching_rate || 110.0;
                const earned = (asgn.completed_sets * rate).toFixed(2);
                return (
                  <div key={asgn.id} className="p-4 bg-white border border-slate-200/80 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="font-bold text-factory-navy truncate">
                        JC-{asgn.bundle?.job_card?.job_card_number} | Bundle {asgn.bundle?.bundle_number}
                      </div>
                      <StatusBadge status="completed" label="Completed" />
                    </div>
                    
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
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
                    
                    <div className="grid grid-cols-2 gap-2 pt-1 border-b border-slate-100 pb-2">
                      <div>
                        <span className="text-factory-muted font-bold block mb-0.5">Completed:</span>
                        <span className="font-extrabold text-emerald-600">{asgn.completed_sets} Pcs</span>
                      </div>
                      <div className="text-right">
                        <span className="text-factory-muted font-bold block mb-0.5">Rate:</span>
                        <span className="font-bold text-slate-700">₹{rate.toFixed(2)}/Pcs</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-1">
                      <div className="font-semibold text-slate-500">
                        {new Date(asgn.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-right">
                        <span className="text-factory-muted font-bold text-[10px] uppercase block">Earned</span>
                        <span className="font-black text-emerald-700 text-lg">₹{earned}</span>
                      </div>
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

export default CompletedWorkTab;

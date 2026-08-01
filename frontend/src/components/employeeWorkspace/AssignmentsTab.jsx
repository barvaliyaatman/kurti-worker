import React from 'react';
import Card from '../ui/Card.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import Table, { TableRow, TableCell } from '../ui/Table.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { Layers, CheckCircle2 } from 'lucide-react';

export const AssignmentsTab = ({ assignments = [] }) => {
  const activeAssignments = assignments.filter((a) =>
    ['ASSIGNED', 'IN_PROGRESS'].includes(a.status)
  );

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-xs font-bold text-factory-navy uppercase tracking-wider mb-3">
          Current Active Assignments ({activeAssignments.length})
        </h3>

        {activeAssignments.length === 0 ? (
          <EmptyState
            title="No Active Assignments"
            description="Worker currently has no open or in-progress bundle assignments."
          />
        ) : (
          <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
            <Table
              headers={[
                'Bundle #',
                'Design Code',
                'Color',
                'Assigned Qty',
                'Completed Qty',
                'Remaining Qty',
                'Status',
              ]}
            >
              {activeAssignments.map((asgn) => {
                const remaining = asgn.assigned_sets - asgn.completed_sets;
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
                      {asgn.bundle?.color}
                    </TableCell>
                    <TableCell className="font-bold">{asgn.assigned_sets} Sets</TableCell>
                    <TableCell className="font-extrabold text-emerald-600">
                      {asgn.completed_sets} Sets
                    </TableCell>
                    <TableCell className="font-extrabold text-amber-700">
                      {remaining} Sets
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={asgn.status === 'IN_PROGRESS' ? 'warning' : 'draft'}
                        label={asgn.status === 'IN_PROGRESS' ? 'In Progress' : 'Assigned'}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AssignmentsTab;

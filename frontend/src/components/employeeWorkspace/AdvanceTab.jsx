import React from 'react';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Table, { TableRow, TableCell } from '../ui/Table.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { CreditCard, Plus } from 'lucide-react';

export const AdvanceTab = ({ advances = [], onAddAdvance, canManage = false }) => {
  const totalAdvance = advances.reduce((sum, a) => sum + a.amount, 0);

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-factory-navy uppercase tracking-wider">
              Salary Advance History ({advances.length})
            </h3>
            <span className="text-xs text-amber-800 font-extrabold block mt-0.5">
              Total Outstanding Advances: ₹{totalAdvance.toFixed(2)}
            </span>
          </div>

          {canManage && (
            <Button
              size="sm"
              variant="primary"
              icon={Plus}
              onClick={onAddAdvance}
            >
              Add Advance
            </Button>
          )}
        </div>

        {advances.length === 0 ? (
          <EmptyState
            title="No Salary Advances Issued"
            description="Advance loan entries for this employee will appear here."
          />
        ) : (
          <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
            <Table
              headers={[
                'Date Issued',
                'Advance Amount',
                'Reason / Remarks',
                'Issued By',
              ]}
            >
              {advances.map((adv) => (
                <TableRow key={adv.id}>
                  <TableCell className="font-bold text-factory-navy">
                    {new Date(adv.advance_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="font-extrabold text-amber-700">
                    ₹{adv.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-factory-navy italic">
                    {adv.reason || 'Salary advance'}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-700">
                    {adv.created_by}
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdvanceTab;

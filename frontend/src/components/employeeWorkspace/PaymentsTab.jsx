import React from 'react';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Table, { TableRow, TableCell } from '../ui/Table.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { Banknote, Plus } from 'lucide-react';

export const PaymentsTab = ({ payments = [], onPaySalary, canManage = false }) => {
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-factory-navy uppercase tracking-wider">
              Disbursed Salary Payment History ({payments.length})
            </h3>
            <span className="text-xs text-emerald-800 font-extrabold block mt-0.5 break-words">
              Total Salary Disbursed: ₹{totalPaid.toFixed(2)}
            </span>
          </div>

          {canManage && (
            <Button
              size="sm"
              variant="primary"
              className="w-full sm:w-auto"
              icon={Plus}
              onClick={onPaySalary}
            >
              Pay Salary
            </Button>
          )}
        </div>

        {payments.length === 0 ? (
          <EmptyState
            title="No Salary Payments Disbursed"
            description="Disbursed salary payments for this employee will appear here."
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
              <Table
                headers={[
                  'Payment Date',
                  'Amount Paid',
                  'Payment Mode',
                  'Reference Number',
                  'Paid By',
                ]}
              >
                {payments.map((pmt) => (
                  <TableRow key={pmt.id}>
                    <TableCell className="font-bold text-factory-navy">
                      {new Date(pmt.payment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="font-extrabold text-emerald-700 break-words">
                      ₹{pmt.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="font-bold text-brand-600">
                      {pmt.payment_mode}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-700 break-words">
                      {pmt.reference_no || 'N/A'}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-700">
                      {pmt.created_by}
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </div>
            
            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col gap-3">
              {payments.map((pmt) => (
                <div key={pmt.id} className="p-4 bg-white border border-slate-200/80 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-factory-navy">
                      {new Date(pmt.payment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="font-extrabold text-emerald-700 break-words">
                      ₹{pmt.amount.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-1 border-b border-slate-100 pb-2">
                    <div>
                      <span className="text-factory-muted font-bold block mb-0.5">Payment Mode:</span>
                      <span className="font-bold text-brand-600">{pmt.payment_mode}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-factory-muted font-bold block mb-0.5">Reference:</span>
                      <span className="font-semibold text-slate-700 break-words">{pmt.reference_no || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-factory-muted font-bold block">Paid By:</span>
                    <span className="font-semibold text-slate-700 block">{pmt.created_by}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default PaymentsTab;

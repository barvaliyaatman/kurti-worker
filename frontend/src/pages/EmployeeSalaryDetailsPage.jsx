import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Banknote, 
  CreditCard, 
  CheckCircle2, 
  RefreshCw, 
  Calendar, 
  Layers,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { salaryService } from '../services/salaryService.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Table, { TableRow, TableCell } from '../components/ui/Table.jsx';
import { CardSkeleton } from '../components/ui/LoadingSkeleton.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorComponent from '../components/common/ErrorComponent.jsx';
import AddPaymentModal from '../components/employeeWorkspace/AddPaymentModal.jsx';

export const EmployeeSalaryDetailsPage = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isManagerOrOwner = user?.role === 'MANAGER' || user?.role === 'OWNER';
  const canManage = isManagerOrOwner;

  const [payModalOpen, setPayModalOpen] = useState(false);

  // Fetch detailed employee salary workspace
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['employeeSalaryDetails', employeeId],
    queryFn: () => salaryService.getEmployeeSalaryDetails(employeeId),
  });

  const employee = data?.employee;
  const summary = data?.summary || {};
  const completedBundles = data?.completed_bundles || [];
  const advances = data?.advances || [];
  const payments = data?.payments || [];

  // Pay Salary Mutation
  const payMutation = useMutation({
    mutationFn: (payData) =>
      salaryService.disbursePayment({
        employee_id: employeeId,
        ...payData,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['employeeSalaryDetails', employeeId]);
      queryClient.invalidateQueries(['payrollDashboard']);
      setPayModalOpen(false);
    },
  });

  const statusBadgeConfig = {
    PAID: { variant: 'completed', label: 'PAID' },
    PARTIALLY_PAID: { variant: 'warning', label: 'PARTIALLY PAID' },
    PENDING: { variant: 'active', label: 'PENDING' },
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header & Back Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/salary')}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-factory-navy transition-colors"
          title="Back to Salary Dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <PageHeader
          title={`Salary Workspace: ${employee?.employee_name || 'Loading...'}`}
          subtitle={`Worker ID: ${employee?.employee_code || '—'}`}
          action={
            <div className="flex items-center gap-2">
              {canManage && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={Banknote}
                  onClick={() => setPayModalOpen(true)}
                >
                  Pay Salary
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => refetch()}
                isLoading={isFetching}
                icon={RefreshCw}
              >
                Refresh
              </Button>
            </div>
          }
        />
      </div>

      {/* ERROR STATE */}
      {isError && (
        <ErrorComponent
          title="Failed to load employee salary workspace"
          message={error?.response?.data?.message || 'Server connection error'}
          onRetry={() => refetch()}
        />
      )}

      {/* LOADING STATE */}
      {isLoading && !isError && (
        <div className="space-y-4">
          <CardSkeleton />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      )}

      {/* WORKSPACE CONTENT */}
      {!isLoading && !isError && employee && (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
              <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
                Completed Pieces
              </span>
              <span className="text-xl font-extrabold text-factory-navy block">
                {summary.completed_pieces || 0} Pcs
              </span>
            </div>

            <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
              <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
                Gross Salary
              </span>
              <span className="text-xl font-extrabold text-emerald-600 block">
                ₹{(summary.gross_salary || 0).toFixed(2)}
              </span>
            </div>

            <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
              <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
                Advance Deductions
              </span>
              <span className="text-xl font-extrabold text-amber-700 block">
                - ₹{(summary.total_advances || 0).toFixed(2)}
              </span>
            </div>

            <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
              <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
                Net Payable
              </span>
              <span className="text-xl font-extrabold text-brand-600 block">
                ₹{(summary.net_salary || 0).toFixed(2)}
              </span>
            </div>

            <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
              <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
                Already Paid
              </span>
              <span className="text-xl font-extrabold text-emerald-700 block">
                ₹{(summary.total_paid || 0).toFixed(2)}
              </span>
            </div>

            <div className="p-3.5 bg-brand-50 border border-brand-200 rounded-2xl space-y-1 shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-brand-900 uppercase tracking-wider block">
                Pending Balance
              </span>
              <span className="text-xl font-extrabold text-brand-600 block">
                ₹{(summary.pending_salary || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* COMPLETED BUNDLES BREAKDOWN TABLE */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-factory-navy uppercase tracking-wider">
              Completed Bundles Breakdown ({completedBundles.length})
            </h3>

            {completedBundles.length === 0 ? (
              <Card>
                <EmptyState
                  title="No Completed Work Found"
                  description="Completed bundle assignments will populate this earnings ledger."
                />
              </Card>
            ) : (
              <Card>
                <Table
                  headers={[
                    'Bundle #',
                    'Job Card #',
                    'Design Code',
                    'Color / Size',
                    'Completed Quantity',
                    'Stitching Rate',
                    'Earned Amount',
                    'Completion Date',
                  ]}
                >
                  {completedBundles.map((bnd) => (
                    <TableRow key={bnd.id}>
                      <TableCell className="font-extrabold text-brand-600">
                        {bnd.bundle_number}
                      </TableCell>
                      <TableCell className="font-bold text-factory-navy">
                        {bnd.job_card_number}
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded border border-brand-200 text-xs">
                          #{bnd.design_code}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold text-factory-navy">
                        {bnd.color} ({bnd.size})
                      </TableCell>
                      <TableCell className="font-extrabold text-emerald-600">
                        {bnd.completed_pieces} Pcs
                      </TableCell>
                      <TableCell className="font-bold text-slate-700">
                        ₹{bnd.stitching_rate.toFixed(2)}/Pcs
                      </TableCell>
                      <TableCell className="font-extrabold text-emerald-700">
                        ₹{bnd.earned_amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {new Date(bnd.completed_date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </Table>
              </Card>
            )}
          </div>

          {/* ADVANCE DEDUCTIONS & DISBURSED PAYMENTS TABLES GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Advance Deductions Ledger */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-factory-navy uppercase tracking-wider">
                Advance Deductions Ledger ({advances.length})
              </h3>
              {advances.length === 0 ? (
                <Card>
                  <EmptyState
                    title="No Advances Issued"
                    description="No advance loans deducted for this worker."
                  />
                </Card>
              ) : (
                <Card>
                  <Table headers={['Date', 'Amount', 'Reason / Remarks', 'Issued By']}>
                    {advances.map((adv) => (
                      <TableRow key={adv.id}>
                        <TableCell className="font-bold text-factory-navy">
                          {new Date(adv.advance_date).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </TableCell>
                        <TableCell className="font-extrabold text-amber-700">
                          ₹{adv.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="italic text-factory-navy">
                          {adv.reason || 'Salary advance'}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-700">
                          {adv.created_by}
                        </TableCell>
                      </TableRow>
                    ))}
                  </Table>
                </Card>
              )}
            </div>

            {/* Salary Payments Ledger */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-factory-navy uppercase tracking-wider">
                Disbursed Salary Payments Log ({payments.length})
              </h3>
              {payments.length === 0 ? (
                <Card>
                  <EmptyState
                    title="No Payments Disbursed"
                    description="Disbursed salary payments will appear here."
                  />
                </Card>
              ) : (
                <Card>
                  <Table headers={['Date', 'Amount Paid', 'Mode', 'Ref No', 'Paid By']}>
                    {payments.map((pmt) => (
                      <TableRow key={pmt.id}>
                        <TableCell className="font-bold text-factory-navy">
                          {new Date(pmt.payment_date).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </TableCell>
                        <TableCell className="font-extrabold text-emerald-700">
                          ₹{pmt.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="font-bold text-brand-600">
                          {pmt.payment_mode}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-700">
                          {pmt.reference_no || 'N/A'}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-700">
                          {pmt.created_by}
                        </TableCell>
                      </TableRow>
                    ))}
                  </Table>
                </Card>
              )}
            </div>
          </div>
        </>
      )}

      {/* Disburse Salary Payment Modal */}
      {employee && (
        <AddPaymentModal
          isOpen={payModalOpen}
          onClose={() => setPayModalOpen(false)}
          onSubmit={(payData) => payMutation.mutate(payData)}
          employee={employee}
          summary={{
            pending_payment: summary.pending_salary,
          }}
          isLoading={payMutation.isPending}
        />
      )}
    </div>
  );
};

export default EmployeeSalaryDetailsPage;

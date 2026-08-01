import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Banknote, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { salaryService } from '../services/salaryService.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import SearchBar from '../components/ui/SearchBar.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Table, { TableRow, TableCell } from '../components/ui/Table.jsx';
import { CardSkeleton } from '../components/ui/LoadingSkeleton.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorComponent from '../components/common/ErrorComponent.jsx';
import AddPaymentModal from '../components/employeeWorkspace/AddPaymentModal.jsx';

export const SalaryDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isManagerOrOwner = user?.role === 'MANAGER' || user?.role === 'OWNER';
  const canManage = isManagerOrOwner;

  // Search & Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Fetch Payroll Summary & Table
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['payrollDashboard', { search, status: statusFilter }],
    queryFn: () =>
      salaryService.getPayrollDashboard({
        search,
        status: statusFilter,
      }),
  });

  const summary = data?.summary || {};
  const payroll = data?.payroll || [];

  // Pay Salary Mutation
  const payMutation = useMutation({
    mutationFn: (payload) => salaryService.disbursePayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['payrollDashboard']);
      setPayModalOpen(false);
      setSelectedRecord(null);
    },
  });

  const handleOpenPayModal = (rec) => {
    setSelectedRecord(rec);
    setPayModalOpen(true);
  };

  const statusBadgeConfig = {
    PAID: { variant: 'completed', label: 'PAID' },
    PARTIALLY_PAID: { variant: 'warning', label: 'PARTIALLY PAID' },
    PENDING: { variant: 'active', label: 'PENDING' },
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <PageHeader
        title="Salary & Payroll Management"
        subtitle="Calculated strictly from Completed Pieces × Job Card Stitching Rate"
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            icon={RefreshCw}
          >
            Refresh
          </Button>
        }
      />

      {/* ERROR STATE */}
      {isError && (
        <ErrorComponent
          title="Failed to load payroll dashboard"
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

      {/* CONTENT */}
      {!isLoading && !isError && (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
              <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
                Active Workers
              </span>
              <span className="text-xl font-extrabold text-factory-navy block">
                {summary.total_employees || 0}
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
                Advances Deducted
              </span>
              <span className="text-xl font-extrabold text-amber-700 block">
                - ₹{(summary.advance_deductions || 0).toFixed(2)}
              </span>
            </div>

            <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
              <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
                Net Salary
              </span>
              <span className="text-xl font-extrabold text-brand-600 block">
                ₹{(summary.net_salary || 0).toFixed(2)}
              </span>
            </div>

            <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
              <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
                Total Paid
              </span>
              <span className="text-xl font-extrabold text-emerald-700 block">
                ₹{(summary.paid_amount || 0).toFixed(2)}
              </span>
            </div>

            <div className="p-3.5 bg-brand-50 border border-brand-200 rounded-2xl space-y-1 shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-brand-900 uppercase tracking-wider block">
                Pending Salary
              </span>
              <span className="text-xl font-extrabold text-brand-600 block">
                ₹{(summary.pending_salary || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Search & Filter Chips Bar */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex-1">
                <SearchBar
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClear={() => setSearch('')}
                  placeholder="Search worker by name, ID code, or phone number..."
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {['ALL', 'PENDING', 'PARTIALLY_PAID', 'PAID'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                      statusFilter === st
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'bg-slate-100 text-factory-navy hover:bg-slate-200'
                    }`}
                  >
                    {st === 'ALL' && 'All Status'}
                    {st === 'PENDING' && 'Pending'}
                    {st === 'PARTIALLY_PAID' && 'Partially Paid'}
                    {st === 'PAID' && 'Paid'}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* EMPLOYEE PAYROLL TABLE */}
          {payroll.length === 0 ? (
            <Card>
              <EmptyState
                title="No Payroll Records Found"
                description={
                  search || statusFilter !== 'ALL'
                    ? 'No workers match your search query or filter criteria.'
                    : 'Payroll records will appear here as workers complete Job Card bundles.'
                }
              />
            </Card>
          ) : (
            <Card>
              <Table
                headers={[
                  'Worker Name',
                  'Worker ID',
                  'Completed Pieces',
                  'Gross Salary',
                  'Advances',
                  'Net Salary',
                  'Paid Amount',
                  'Pending Amount',
                  'Status',
                  'Actions',
                ]}
              >
                {payroll.map((rec) => {
                  const badgeInfo = statusBadgeConfig[rec.payment_status] || {
                    variant: 'draft',
                    label: rec.payment_status,
                  };

                  return (
                    <TableRow key={rec.employee_id}>
                      <TableCell className="font-extrabold text-factory-navy">
                        {rec.employee_name}
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded border border-brand-200 text-xs">
                          {rec.employee_code}
                        </span>
                      </TableCell>
                      <TableCell className="font-extrabold text-slate-700">
                        {rec.completed_pieces} Pcs
                      </TableCell>
                      <TableCell className="font-extrabold text-emerald-600">
                        ₹{rec.gross_salary.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-bold text-amber-700">
                        ₹{rec.advance.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-extrabold text-factory-navy">
                        ₹{rec.net_salary.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-bold text-emerald-700">
                        ₹{rec.paid.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-extrabold text-brand-600">
                        ₹{rec.pending.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={badgeInfo.variant} label={badgeInfo.label} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={Eye}
                            onClick={() => navigate(`/salary/${rec.employee_id}`)}
                          >
                            Details
                          </Button>

                          {canManage && rec.pending > 0 && (
                            <Button
                              size="sm"
                              variant="primary"
                              icon={Banknote}
                              onClick={() => handleOpenPayModal(rec)}
                            >
                              Pay Salary
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </Table>
            </Card>
          )}
        </>
      )}

      {/* Disburse Salary Payment Modal */}
      {selectedRecord && (
        <AddPaymentModal
          isOpen={payModalOpen}
          onClose={() => {
            setPayModalOpen(false);
            setSelectedRecord(null);
          }}
          onSubmit={(payData) =>
            payMutation.mutate({
              employee_id: selectedRecord.employee_id,
              ...payData,
            })
          }
          employee={{
            employee_name: selectedRecord.employee_name,
            employee_code: selectedRecord.employee_code,
          }}
          summary={{
            pending_payment: selectedRecord.pending,
          }}
          isLoading={payMutation.isPending}
        />
      )}
    </div>
  );
};

export default SalaryDashboardPage;

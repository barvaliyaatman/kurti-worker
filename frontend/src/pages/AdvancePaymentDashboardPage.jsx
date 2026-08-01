import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Banknote, 
  Search, 
  Filter, 
  RefreshCw, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { advancePaymentService } from '../services/advancePaymentService.js';
import { employeeService } from '../services/employeeService.js';

import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import SearchBar from '../components/ui/SearchBar.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Table, { TableRow, TableCell } from '../components/ui/Table.jsx';
import { CardSkeleton } from '../components/ui/LoadingSkeleton.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorComponent from '../components/common/ErrorComponent.jsx';

import AddAdvanceModal from '../components/employeeWorkspace/AddAdvanceModal.jsx';
import AddPaymentModal from '../components/employeeWorkspace/AddPaymentModal.jsx';

export const AdvancePaymentDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isManagerOrOwner = user?.role === 'MANAGER' || user?.role === 'OWNER';
  const canManage = isManagerOrOwner;

  const [activeTab, setActiveTab] = useState('advances');

  // Search & Filter states
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('ALL');

  // Modal states
  const [advanceModalOpen, setAdvanceModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // Fetch employees list for modal dropdown selection
  const { data: employeesData } = useQuery({
    queryKey: ['employeesListSelect'],
    queryFn: () => employeeService.getEmployees({ limit: 200 }),
    enabled: canManage,
  });
  const employeesList = employeesData?.employees || [];

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Fetch Advances Overview
  const {
    data: advancesData,
    isLoading: advancesLoading,
    isError: advancesIsError,
    error: advancesError,
    refetch: refetchAdvances,
    isFetching: advancesFetching,
  } = useQuery({
    queryKey: ['advancesOverview', { search, timeFilter }],
    queryFn: () =>
      advancePaymentService.getAdvancesOverview({
        search,
        timeFilter,
      }),
  });

  // Fetch Payments Overview
  const {
    data: paymentsData,
    isLoading: paymentsLoading,
    isError: paymentsIsError,
    refetch: refetchPayments,
    isFetching: paymentsFetching,
  } = useQuery({
    queryKey: ['paymentsOverview', { search }],
    queryFn: () =>
      advancePaymentService.getPaymentsOverview({
        search,
      }),
  });

  const summary = advancesData?.summary || {};
  const advances = advancesData?.advances || [];
  const payments = paymentsData?.payments || [];

  // Create Advance Mutation
  const createAdvanceMutation = useMutation({
    mutationFn: (advancePayload) => advancePaymentService.createAdvance(advancePayload),
    onSuccess: () => {
      queryClient.invalidateQueries(['advancesOverview']);
      queryClient.invalidateQueries(['payrollDashboard']);
      setAdvanceModalOpen(false);
      setSelectedEmployee(null);
    },
  });

  // Create Payment Mutation
  const createPaymentMutation = useMutation({
    mutationFn: (paymentPayload) => advancePaymentService.createPayment(paymentPayload),
    onSuccess: () => {
      queryClient.invalidateQueries(['paymentsOverview']);
      queryClient.invalidateQueries(['advancesOverview']);
      queryClient.invalidateQueries(['payrollDashboard']);
      setPaymentModalOpen(false);
      setSelectedEmployee(null);
    },
  });

  const handleOpenAdvanceModal = () => {
    if (employeesList.length > 0) {
      setSelectedEmployee(employeesList[0]);
    }
    setAdvanceModalOpen(true);
  };

  const handleOpenPaymentModal = () => {
    if (employeesList.length > 0) {
      setSelectedEmployee(employeesList[0]);
    }
    setPaymentModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <PageHeader
        title="Advance & Salary Payment Management"
        subtitle="Manage employee advance loans, salary payment disbursals, and payment audit logs"
        action={
          <div className="flex items-center gap-2">
            {canManage && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={CreditCard}
                  onClick={handleOpenAdvanceModal}
                >
                  Issue Advance
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Banknote}
                  onClick={handleOpenPaymentModal}
                >
                  Pay Salary
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                refetchAdvances();
                refetchPayments();
              }}
              isLoading={advancesFetching || paymentsFetching}
              icon={RefreshCw}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* ERROR STATE */}
      {advancesIsError && (
        <ErrorComponent
          title="Failed to load advance & payment data"
          message={advancesError?.response?.data?.message || 'Server connection error'}
          onRetry={() => {
            refetchAdvances();
            refetchPayments();
          }}
        />
      )}

      {/* LOADING STATE */}
      {advancesLoading && !advancesIsError && (
        <div className="space-y-4">
          <CardSkeleton />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      )}

      {/* CONTENT */}
      {!advancesLoading && !advancesIsError && (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
              <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
                Total Advances
              </span>
              <span className="text-xl font-extrabold text-amber-700 block">
                ₹{(summary.total_advances || 0).toFixed(2)}
              </span>
            </div>

            <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
              <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
                Today's Advances
              </span>
              <span className="text-xl font-extrabold text-amber-800 block">
                ₹{(summary.today_advances || 0).toFixed(2)}
              </span>
            </div>

            <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
              <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
                Monthly Advances
              </span>
              <span className="text-xl font-extrabold text-amber-900 block">
                ₹{(summary.monthly_advances || 0).toFixed(2)}
              </span>
            </div>

            <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
              <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
                Total Salary Paid
              </span>
              <span className="text-xl font-extrabold text-emerald-700 block">
                ₹{(summary.total_salary_paid || 0).toFixed(2)}
              </span>
            </div>

            <div className="p-3.5 bg-brand-50 border border-brand-200 rounded-2xl space-y-1 shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-brand-900 uppercase tracking-wider block">
                Pending Salary Balance
              </span>
              <span className="text-xl font-extrabold text-brand-600 block">
                ₹{(summary.pending_salary || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Tab Selection Bar */}
          <div className="border-b border-slate-200 flex items-center gap-2">
            <button
              onClick={() => setActiveTab('advances')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'advances'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 text-factory-navy hover:bg-slate-200'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Employee Advances Ledger ({advances.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'payments'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 text-factory-navy hover:bg-slate-200'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span>Disbursed Salary Payments Log ({payments.length})</span>
            </button>
          </div>

          {/* TAB 1: ADVANCES LEDGER */}
          {activeTab === 'advances' && (
            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <SearchBar
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onClear={() => setSearch('')}
                      placeholder="Search advances by worker name, code, advance #, or reason..."
                    />
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                    {['ALL', 'TODAY', 'THIS_MONTH', 'PREVIOUS_MONTH'].map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setTimeFilter(tf)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                          timeFilter === tf
                            ? 'bg-brand-600 text-white shadow-xs'
                            : 'bg-slate-100 text-factory-navy hover:bg-slate-200'
                        }`}
                      >
                        {tf === 'ALL' && 'All Time'}
                        {tf === 'TODAY' && "Today's"}
                        {tf === 'THIS_MONTH' && 'This Month'}
                        {tf === 'PREVIOUS_MONTH' && 'Previous Month'}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              {advances.length === 0 ? (
                <Card>
                  <EmptyState
                    title="No Advance Loan Entries Found"
                    description={
                      search || timeFilter !== 'ALL'
                        ? 'No advance entries match your search query or date filter.'
                        : 'Issued salary advance loans will appear in this ledger.'
                    }
                  />
                </Card>
              ) : (
                <Card>
                  <Table
                    headers={[
                      'Advance #',
                      'Worker Name',
                      'Worker ID',
                      'Date Issued',
                      'Advance Amount',
                      'Reason / Remarks',
                      'Approved By',
                      'Status',
                      'Actions',
                    ]}
                  >
                    {advances.map((adv) => (
                      <TableRow key={adv.id}>
                        <TableCell className="font-extrabold text-brand-600">
                          {adv.advance_number}
                        </TableCell>
                        <TableCell className="font-extrabold text-factory-navy">
                          {adv.employee_name}
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded border border-brand-200 text-xs">
                            {adv.employee_code}
                          </span>
                        </TableCell>
                        <TableCell className="font-bold text-slate-700">
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
                          {adv.reason}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-700">
                          {adv.approved_by}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status="completed" label="APPROVED" />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/employees/${adv.employee_id}/workspace`)}
                          >
                            Workspace
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </Table>
                </Card>
              )}
            </div>
          )}

          {/* TAB 2: PAYMENTS HISTORY LOG */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <Card className="p-4">
                <SearchBar
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClear={() => setSearch('')}
                  placeholder="Search payments by worker name, code, payment #, or mode..."
                />
              </Card>

              {payments.length === 0 ? (
                <Card>
                  <EmptyState
                    title="No Salary Payment Logs Found"
                    description="Disbursed salary payments will be recorded in this audit history log."
                  />
                </Card>
              ) : (
                <Card>
                  <Table
                    headers={[
                      'Payment #',
                      'Worker Name',
                      'Worker ID',
                      'Payment Date',
                      'Amount Paid',
                      'Payment Mode',
                      'Reference No.',
                      'Paid By',
                      'Actions',
                    ]}
                  >
                    {payments.map((pmt) => (
                      <TableRow key={pmt.id}>
                        <TableCell className="font-extrabold text-brand-600">
                          {pmt.payment_number}
                        </TableCell>
                        <TableCell className="font-extrabold text-factory-navy">
                          {pmt.employee_name}
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded border border-brand-200 text-xs">
                            {pmt.employee_code}
                          </span>
                        </TableCell>
                        <TableCell className="font-bold text-slate-700">
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
                          {pmt.reference_no}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-700">
                          {pmt.paid_by}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/salary/${pmt.employee_id}`)}
                          >
                            Salary Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </Table>
                </Card>
              )}
            </div>
          )}
        </>
      )}

      {/* Add Advance Modal */}
      {selectedEmployee && (
        <AddAdvanceModal
          isOpen={advanceModalOpen}
          onClose={() => {
            setAdvanceModalOpen(false);
            setSelectedEmployee(null);
          }}
          onSubmit={(advanceData) =>
            createAdvanceMutation.mutate({
              employee_id: selectedEmployee.id,
              ...advanceData,
            })
          }
          employee={selectedEmployee}
          isLoading={createAdvanceMutation.isPending}
        />
      )}

      {/* Add Payment Modal */}
      {selectedEmployee && (
        <AddPaymentModal
          isOpen={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setSelectedEmployee(null);
          }}
          onSubmit={(paymentData) =>
            createPaymentMutation.mutate({
              employee_id: selectedEmployee.id,
              ...paymentData,
            })
          }
          employee={selectedEmployee}
          summary={{
            pending_payment: summary.pending_salary,
          }}
          isLoading={createPaymentMutation.isPending}
        />
      )}
    </div>
  );
};

export default AdvancePaymentDashboardPage;

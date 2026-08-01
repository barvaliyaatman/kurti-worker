import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  RefreshCw, 
  FileText, 
  Scissors, 
  CheckSquare, 
  Users, 
  Banknote, 
  CreditCard,
  TrendingUp,
  PackageCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { reportService } from '../services/reportService.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import SearchBar from '../components/ui/SearchBar.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Table, { TableRow, TableCell } from '../components/ui/Table.jsx';
import { CardSkeleton } from '../components/ui/LoadingSkeleton.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorComponent from '../components/common/ErrorComponent.jsx';

const REPORT_TABS = [
  { id: 'production', label: 'Production Reports', icon: Scissors },
  { id: 'employee', label: 'Employee Reports', icon: Users },
  { id: 'job_card', label: 'Job Card Reports', icon: FileText },
  { id: 'bundle', label: 'Bundle Reports', icon: PackageCheck },
  { id: 'salary', label: 'Salary Reports', icon: Banknote },
  { id: 'advance', label: 'Advance Reports', icon: CreditCard },
  { id: 'payment', label: 'Payment Reports', icon: CreditCard },
];

export const ReportsDashboardPage = () => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('production');
  const [timeFilter, setTimeFilter] = useState('THIS_MONTH');
  const [search, setSearch] = useState('');

  // Fetch Dashboard Summary Metrics
  const {
    data: summary = {},
    isLoading: summaryLoading,
    isError: summaryIsError,
    refetch: refetchSummary,
    isFetching: summaryFetching,
  } = useQuery({
    queryKey: ['reportsDashboard', { timeFilter }],
    queryFn: () => reportService.getDashboard({ timeFilter }),
  });

  // Fetch Category Specific Data
  const { data: productionData = { metrics: {}, records: [] }, isLoading: prodLoading } = useQuery({
    queryKey: ['productionReport', { timeFilter, search }],
    queryFn: () => reportService.getProductionReport({ timeFilter, search }),
    enabled: activeCategory === 'production',
  });

  const { data: employeeRecords = [], isLoading: empLoading } = useQuery({
    queryKey: ['employeeReport', { search }],
    queryFn: () => reportService.getEmployeeReport({ search }),
    enabled: activeCategory === 'employee',
  });

  const { data: jobCardRecords = [], isLoading: jcLoading } = useQuery({
    queryKey: ['jobCardReport', { search }],
    queryFn: () => reportService.getJobCardReport({ search }),
    enabled: activeCategory === 'job_card',
  });

  const { data: bundleRecords = [], isLoading: bundleLoading } = useQuery({
    queryKey: ['bundleReport', { search }],
    queryFn: () => reportService.getBundleReport({ search }),
    enabled: activeCategory === 'bundle',
  });

  const { data: salaryRecords = [], isLoading: salaryLoading } = useQuery({
    queryKey: ['salaryReport'],
    queryFn: () => reportService.getSalaryReport(),
    enabled: activeCategory === 'salary',
  });

  const { data: advanceRecords = [], isLoading: advanceLoading } = useQuery({
    queryKey: ['advanceReport'],
    queryFn: () => reportService.getAdvanceReport(),
    enabled: activeCategory === 'advance',
  });

  const { data: paymentRecords = [], isLoading: paymentLoading } = useQuery({
    queryKey: ['paymentReport'],
    queryFn: () => reportService.getPaymentReport(),
    enabled: activeCategory === 'payment',
  });

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = (dataArray, filename = 'report.csv') => {
    if (!dataArray || dataArray.length === 0) return;
    const headers = Object.keys(dataArray[0]).join(',');
    const rows = dataArray.map((row) =>
      Object.values(row)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20 print:p-0">
      {/* Page Header */}
      <div className="print:hidden">
        <PageHeader
          title="Reports & Analytics Dashboard"
          subtitle="Real-time analytics and production ledgers powered by live factory database"
          action={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" icon={Printer} onClick={handlePrint}>
                Print Report
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={Download}
                onClick={() => {
                  let exportData = [];
                  if (activeCategory === 'production') exportData = productionData.records;
                  if (activeCategory === 'employee') exportData = employeeRecords;
                  if (activeCategory === 'job_card') exportData = jobCardRecords;
                  if (activeCategory === 'bundle') exportData = bundleRecords;
                  if (activeCategory === 'salary') exportData = salaryRecords;
                  if (activeCategory === 'advance') exportData = advanceRecords;
                  if (activeCategory === 'payment') exportData = paymentRecords;
                  exportCSV(exportData, `${activeCategory}_report.csv`);
                }}
              >
                Export CSV
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetchSummary()}
                isLoading={summaryFetching}
                icon={RefreshCw}
              >
                Refresh
              </Button>
            </div>
          }
        />
      </div>

      {/* 11 STICKY SUMMARY METRIC CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
          <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
            Today's Production
          </span>
          <span className="text-xl font-extrabold text-brand-600 block">
            {summary.todays_production || 0} Pcs
          </span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
          <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
            Monthly Production
          </span>
          <span className="text-xl font-extrabold text-emerald-600 block">
            {summary.monthly_production || 0} Pcs
          </span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
          <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
            Completed Job Cards
          </span>
          <span className="text-xl font-extrabold text-emerald-700 block">
            {summary.completed_job_cards || 0}
          </span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
          <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
            Active Job Cards
          </span>
          <span className="text-xl font-extrabold text-amber-700 block">
            {summary.active_job_cards || 0}
          </span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
          <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
            Completed Bundles
          </span>
          <span className="text-xl font-extrabold text-emerald-600 block">
            {summary.completed_bundles || 0}
          </span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
          <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
            Active Bundles
          </span>
          <span className="text-xl font-extrabold text-brand-600 block">
            {summary.active_bundles || 0}
          </span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
          <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
            Completed Pieces (All Time)
          </span>
          <span className="text-xl font-extrabold text-factory-navy block">
            {summary.completed_pieces || 0} Pcs
          </span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
          <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
            Total Active Workers
          </span>
          <span className="text-xl font-extrabold text-factory-navy block">
            {summary.total_employees || 0}
          </span>
        </div>

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
            Salary Paid
          </span>
          <span className="text-xl font-extrabold text-emerald-700 block">
            ₹{(summary.salary_paid || 0).toFixed(2)}
          </span>
        </div>

        <div className="p-3.5 bg-brand-50 border border-brand-200 rounded-2xl space-y-1 shadow-2xs col-span-2 sm:col-span-2">
          <span className="text-[11px] font-bold text-brand-900 uppercase tracking-wider block">
            Pending Salary Balance
          </span>
          <span className="text-xl font-extrabold text-brand-600 block">
            ₹{(summary.pending_salary || 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* CATEGORY TAB BAR */}
      <div className="border-b border-slate-200 overflow-x-auto print:hidden">
        <div className="flex items-center gap-1 min-w-max pb-1">
          {REPORT_TABS.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-factory-navy hover:bg-slate-200'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <Card className="p-4 print:hidden">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder="Search report by worker name, job card #, design, bundle #..."
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'TODAY', 'YESTERDAY', 'THIS_WEEK', 'THIS_MONTH', 'LAST_MONTH'].map((tf) => (
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
                {tf === 'TODAY' && 'Today'}
                {tf === 'YESTERDAY' && 'Yesterday'}
                {tf === 'THIS_WEEK' && 'This Week'}
                {tf === 'THIS_MONTH' && 'This Month'}
                {tf === 'LAST_MONTH' && 'Last Month'}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* REPORT CONTENT RENDER BY CATEGORY */}

      {/* 1. PRODUCTION REPORT */}
      {activeCategory === 'production' && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-factory-navy uppercase tracking-wider">
              Production Report Records ({productionData.records?.length || 0})
            </h3>
          </div>

          {productionData.records?.length === 0 ? (
            <EmptyState title="No Production Records Found" description="Production logs will appear here." />
          ) : (
            <Table
              headers={[
                'Bundle #',
                'Job Card #',
                'Design',
                'Color / Size',
                'Worker Name',
                'Assigned Qty',
                'Completed Qty',
                'Stitching Rate',
                'Earned Amount',
                'Date',
              ]}
            >
              {productionData.records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-extrabold text-brand-600">{r.bundle_number}</TableCell>
                  <TableCell className="font-bold text-factory-navy">{r.job_card_number}</TableCell>
                  <TableCell>
                    <span className="font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 text-xs">
                      #{r.design_code}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold text-factory-navy">{r.color} ({r.size})</TableCell>
                  <TableCell className="font-extrabold text-factory-navy">{r.worker_name}</TableCell>
                  <TableCell className="font-extrabold text-slate-700">{r.assigned_sets} Pcs</TableCell>
                  <TableCell className="font-extrabold text-emerald-600">{r.completed_sets} Pcs</TableCell>
                  <TableCell className="font-bold text-slate-700">₹{r.stitching_rate.toFixed(2)}/Pcs</TableCell>
                  <TableCell className="font-extrabold text-emerald-700">₹{r.earned_amount.toFixed(2)}</TableCell>
                  <TableCell>{new Date(r.updated_at).toLocaleDateString('en-GB')}</TableCell>
                </TableRow>
              ))}
            </Table>
          )}
        </Card>
      )}

      {/* 2. EMPLOYEE REPORT */}
      {activeCategory === 'employee' && (
        <Card className="p-4 space-y-4">
          <h3 className="text-xs font-bold text-factory-navy uppercase tracking-wider">
            Employee Performance & Earnings Report ({employeeRecords.length})
          </h3>

          {employeeRecords.length === 0 ? (
            <EmptyState title="No Employee Records Found" description="Worker metrics will populate here." />
          ) : (
            <Table
              headers={[
                'Worker ID',
                'Worker Name',
                'Phone',
                'Completed Pieces',
                'Completed Bundles',
                'Active Bundles',
                'Gross Salary',
                'Advance',
                'Pending Salary',
                'Performance %',
              ]}
            >
              {employeeRecords.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <span className="font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 text-xs">
                      {r.employee_code}
                    </span>
                  </TableCell>
                  <TableCell className="font-extrabold text-factory-navy">{r.employee_name}</TableCell>
                  <TableCell className="font-semibold text-slate-700">{r.phone}</TableCell>
                  <TableCell className="font-extrabold text-emerald-600">{r.completed_pieces} Pcs</TableCell>
                  <TableCell className="font-bold text-factory-navy">{r.completed_bundles}</TableCell>
                  <TableCell className="font-bold text-brand-600">{r.current_bundles}</TableCell>
                  <TableCell className="font-extrabold text-emerald-700">₹{r.gross_salary.toFixed(2)}</TableCell>
                  <TableCell className="font-bold text-amber-700">₹{r.advance.toFixed(2)}</TableCell>
                  <TableCell className="font-extrabold text-brand-600">₹{r.pending_salary.toFixed(2)}</TableCell>
                  <TableCell className="font-extrabold text-emerald-600">{r.performance_percentage}%</TableCell>
                </TableRow>
              ))}
            </Table>
          )}
        </Card>
      )}

      {/* 3. JOB CARD REPORT */}
      {activeCategory === 'job_card' && (
        <Card className="p-4 space-y-4">
          <h3 className="text-xs font-bold text-factory-navy uppercase tracking-wider">
            Job Card Status & Progress Report ({jobCardRecords.length})
          </h3>

          {jobCardRecords.length === 0 ? (
            <EmptyState title="No Job Cards Found" description="Job Cards report entries will appear here." />
          ) : (
            <Table
              headers={[
                'Job Card #',
                'Design Code',
                'Stitching Rate',
                'Order Qty',
                'Priority',
                'Completion %',
                'Created Date',
                'Due Date',
                'Status',
              ]}
            >
              {jobCardRecords.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-extrabold text-factory-navy">{r.job_card_number}</TableCell>
                  <TableCell>
                    <span className="font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 text-xs">
                      #{r.design_code}
                    </span>
                  </TableCell>
                  <TableCell className="font-extrabold text-emerald-600">₹{r.stitching_rate.toFixed(2)}/Pcs</TableCell>
                  <TableCell className="font-bold text-slate-700">{r.total_quantity} Pcs</TableCell>
                  <TableCell className="font-bold text-factory-navy">{r.priority}</TableCell>
                  <TableCell className="font-extrabold text-brand-600">{r.completion_percentage}%</TableCell>
                  <TableCell>{new Date(r.created_at).toLocaleDateString('en-GB')}</TableCell>
                  <TableCell>{r.due_date ? new Date(r.due_date).toLocaleDateString('en-GB') : 'N/A'}</TableCell>
                  <TableCell><StatusBadge status={r.status === 'COMPLETED' ? 'completed' : 'active'} label={r.status} /></TableCell>
                </TableRow>
              ))}
            </Table>
          )}
        </Card>
      )}

      {/* 4. BUNDLE REPORT */}
      {activeCategory === 'bundle' && (
        <Card className="p-4 space-y-4">
          <h3 className="text-xs font-bold text-factory-navy uppercase tracking-wider">
            Color + Size Bundle Progress Report ({bundleRecords.length})
          </h3>

          {bundleRecords.length === 0 ? (
            <EmptyState title="No Bundles Found" description="Bundles list report will appear here." />
          ) : (
            <Table
              headers={[
                'Bundle #',
                'Job Card #',
                'Design Code',
                'Color / Size',
                'Assigned Worker',
                'Total Sets',
                'Completed Sets',
                'Pending Sets',
                'Status',
              ]}
            >
              {bundleRecords.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-extrabold text-brand-600">{r.bundle_number}</TableCell>
                  <TableCell className="font-bold text-factory-navy">{r.job_card_number}</TableCell>
                  <TableCell>
                    <span className="font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 text-xs">
                      #{r.design_code}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold text-factory-navy">{r.color} ({r.size})</TableCell>
                  <TableCell className="font-extrabold text-factory-navy">{r.assigned_worker}</TableCell>
                  <TableCell className="font-bold text-slate-700">{r.total_sets} Pcs</TableCell>
                  <TableCell className="font-extrabold text-emerald-600">{r.completed_sets} Pcs</TableCell>
                  <TableCell className="font-extrabold text-amber-700">{r.pending_sets} Pcs</TableCell>
                  <TableCell><StatusBadge status={r.status === 'COMPLETED' ? 'completed' : 'warning'} label={r.status} /></TableCell>
                </TableRow>
              ))}
            </Table>
          )}
        </Card>
      )}

      {/* 5. SALARY REPORT */}
      {activeCategory === 'salary' && (
        <Card className="p-4 space-y-4">
          <h3 className="text-xs font-bold text-factory-navy uppercase tracking-wider">
            Factory Salary Ledger Report ({salaryRecords.length})
          </h3>

          {salaryRecords.length === 0 ? (
            <EmptyState title="No Salary Records Found" description="Salary records will appear here." />
          ) : (
            <Table
              headers={[
                'Worker ID',
                'Worker Name',
                'Completed Pieces',
                'Gross Earned Salary',
                'Advances Deducted',
                'Total Paid',
                'Pending Balance',
              ]}
            >
              {salaryRecords.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <span className="font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 text-xs">
                      {r.employee_code}
                    </span>
                  </TableCell>
                  <TableCell className="font-extrabold text-factory-navy">{r.employee_name}</TableCell>
                  <TableCell className="font-extrabold text-slate-700">{r.completed_pieces} Pcs</TableCell>
                  <TableCell className="font-extrabold text-emerald-600">₹{r.gross_salary.toFixed(2)}</TableCell>
                  <TableCell className="font-bold text-amber-700">₹{r.advance.toFixed(2)}</TableCell>
                  <TableCell className="font-bold text-emerald-700">₹{r.paid.toFixed(2)}</TableCell>
                  <TableCell className="font-extrabold text-brand-600">₹{r.pending.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </Table>
          )}
        </Card>
      )}

      {/* 6. ADVANCE REPORT */}
      {activeCategory === 'advance' && (
        <Card className="p-4 space-y-4">
          <h3 className="text-xs font-bold text-factory-navy uppercase tracking-wider">
            Employee Advance Loans Report ({advanceRecords.length})
          </h3>

          {advanceRecords.length === 0 ? (
            <EmptyState title="No Advance Loan Records Found" description="Issued advance loans will appear here." />
          ) : (
            <Table
              headers={[
                'Advance #',
                'Worker ID',
                'Worker Name',
                'Date Issued',
                'Amount Issued',
                'Reason / Remarks',
                'Issued By',
              ]}
            >
              {advanceRecords.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-extrabold text-brand-600">{r.advance_number}</TableCell>
                  <TableCell>
                    <span className="font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 text-xs">
                      {r.employee_code}
                    </span>
                  </TableCell>
                  <TableCell className="font-extrabold text-factory-navy">{r.employee_name}</TableCell>
                  <TableCell>{new Date(r.advance_date).toLocaleDateString('en-GB')}</TableCell>
                  <TableCell className="font-extrabold text-amber-700">₹{r.amount.toFixed(2)}</TableCell>
                  <TableCell className="italic text-factory-navy">{r.reason}</TableCell>
                  <TableCell className="font-semibold text-slate-700">{r.created_by}</TableCell>
                </TableRow>
              ))}
            </Table>
          )}
        </Card>
      )}

      {/* 7. PAYMENT REPORT */}
      {activeCategory === 'payment' && (
        <Card className="p-4 space-y-4">
          <h3 className="text-xs font-bold text-factory-navy uppercase tracking-wider">
            Salary Payment Transactions Audit Log ({paymentRecords.length})
          </h3>

          {paymentRecords.length === 0 ? (
            <EmptyState title="No Salary Payment Logs Found" description="Payment transactions will appear here." />
          ) : (
            <Table
              headers={[
                'Payment #',
                'Worker ID',
                'Worker Name',
                'Payment Date',
                'Amount Paid',
                'Payment Mode',
                'Reference No.',
                'Disbursed By',
              ]}
            >
              {paymentRecords.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-extrabold text-brand-600">{r.payment_number}</TableCell>
                  <TableCell>
                    <span className="font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 text-xs">
                      {r.employee_code}
                    </span>
                  </TableCell>
                  <TableCell className="font-extrabold text-factory-navy">{r.employee_name}</TableCell>
                  <TableCell>{new Date(r.payment_date).toLocaleDateString('en-GB')}</TableCell>
                  <TableCell className="font-extrabold text-emerald-700">₹{r.amount.toFixed(2)}</TableCell>
                  <TableCell className="font-bold text-brand-600">{r.payment_mode}</TableCell>
                  <TableCell className="font-semibold text-slate-700">{r.reference_no}</TableCell>
                  <TableCell className="font-semibold text-slate-700">{r.paid_by}</TableCell>
                </TableRow>
              ))}
            </Table>
          )}
        </Card>
      )}
    </div>
  );
};

export default ReportsDashboardPage;

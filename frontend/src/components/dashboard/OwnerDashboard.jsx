import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  FileText,
  Scissors,
  Layers,
  Banknote,
  RefreshCw,
  ChevronRight,
  UserPlus,
  FilePlus,
  BarChart3,
  Settings,
  ArrowUpRight,
  TrendingUp,
  Package,
  Activity,
  PlusCircle,
  PiggyBank
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService.js';
import PageHeader from '../ui/PageHeader.jsx';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import { CardSkeleton } from '../ui/LoadingSkeleton.jsx';
import EmptyState from '../common/EmptyState.jsx';
import ErrorComponent from '../common/ErrorComponent.jsx';
import { useConfig } from '../../contexts/ConfigContext.jsx';
import DashboardCard from './DashboardCard.jsx';

const OwnerDashboard = ({ greeting, userName, todayFormatted }) => {
  const navigate = useNavigate();
  const { workflowSettings } = useConfig();
  const skipCutting = Boolean(workflowSettings?.skip_cutting);
  const skipBundle = Boolean(workflowSettings?.skip_bundle);

  const {
    data: dashboard,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['dashboardMetrics', 'OWNER'],
    queryFn: dashboardService.getMetrics,
    refetchInterval: 30000,
  });

  const metrics = dashboard?.metrics || {};
  const charts = dashboard?.charts || {};
  const recentJobCards = dashboard?.recentJobCards || [];
  const recentPayments = dashboard?.recentPayments || [];

  // Quick Actions list - dynamically filtered by workflow settings
  const quickActions = [
    { id: 'add_jc', label: 'Create Job Card', icon: FilePlus, path: '/job-cards' },
    { id: 'add_emp', label: 'Register Employee', icon: UserPlus, path: '/employees' },
    ...(!skipCutting ? [{ id: 'cutting', label: 'Cutting Queue', icon: Scissors, path: '/cutting' }] : []),
    { id: 'salary', label: 'Process Payroll', icon: Banknote, path: '/salary' },
    { id: 'reports', label: 'Reports Panel', icon: BarChart3, path: '/reports' },
  ];

  // Chart color mapping for job card status
  const statusColors = {
    CREATED: { bg: '#6366f1', label: 'Created' },
    READY_FOR_CUTTING: { bg: '#f59e0b', label: 'Ready for Cutting' },
    CUTTING_IN_PROGRESS: { bg: '#3b82f6', label: 'Cutting In Progress' },
    CUTTING_COMPLETED: { bg: '#10b981', label: 'Cutting Completed' },
  };

  const hasMonthlyProduction = charts.monthlyProduction && charts.monthlyProduction.length > 0;
  const hasJobCardStatus = charts.jobCardStatusDistribution && charts.jobCardStatusDistribution.length > 0;
  const hasSalaryTrend = charts.salaryTrend && charts.salaryTrend.length > 0;

  return (
    <div className="space-y-5 font-sans select-none max-w-7xl mx-auto">
      {/* Top Header */}
      <PageHeader
        title={`${greeting}, ${userName} 👋`}
        subtitle={`${todayFormatted} • Factory Owner Portal`}
        action={
          <Button variant="secondary" size="sm" onClick={() => refetch()} isLoading={isFetching} icon={RefreshCw}>
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        }
      />


      {isError && (
        <ErrorComponent
          title="Failed to load dashboard"
          message={error?.response?.data?.message || 'Network error'}
          onRetry={() => refetch()}
        />
      )}

      {isLoading && !isError && (
        <div className="space-y-6">
          <div className="h-12 bg-slate-100 animate-pulse rounded-xl" />
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {/* ═══ QUICK ACTIONS ROW (TOP) ═══ */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-3">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quick Operations</h3>
            </div>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => navigate(action.path)}
                    className="flex items-center justify-center sm:justify-start gap-1.5 px-3 py-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>


          {/* ═══ PRIMARY KPI CARDS (Filtered by Workflow Settings) ═══ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <DashboardCard title="Total Employees" value={metrics.totalEmployees ?? 0} icon={Users} badgeText="Active" status="active" iconBg="bg-blue-50 text-blue-600" onClick={() => navigate('/employees')} />
            <DashboardCard title="Active Job Cards" value={metrics.activeJobCards ?? 0} icon={FileText} badgeText="In Progress" status="active" iconBg="bg-indigo-50 text-indigo-600" onClick={() => navigate('/job-cards')} />
            {!skipCutting && (
              <DashboardCard title="Ready for Cutting" value={metrics.readyForCutting ?? 0} icon={Scissors} badgeText="Queue" status="warning" iconBg="bg-amber-50 text-amber-600" onClick={() => navigate('/cutting')} />
            )}
            {!skipBundle && (
              <div className="hidden sm:block">
                <DashboardCard title="Pending Bundles" value={metrics.pendingBundles ?? 0} icon={Layers} badgeText="Unassigned" status="pending" iconBg="bg-rose-50 text-rose-600" onClick={() => navigate('/assignments')} />
              </div>
            )}
            <div className="hidden sm:block">
              <DashboardCard title="Salary Due" value={`₹${(metrics.pendingSalary ?? 0).toLocaleString('en-IN')}`} icon={Banknote} badgeText="Due" status="pending" iconBg="bg-red-50 text-red-600" onClick={() => navigate('/salary')} />
            </div>
          </div>


          {/* ═══ CHARTS SECTION (2-column, reduced spacing) ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Monthly Production Bar Chart */}
            <Card className="p-4 border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Monthly Production</h3>
                  <p className="text-[10px] text-slate-400">Completed pieces – Last 6 months</p>
                </div>
                <BarChart3 className="w-4 h-4 text-indigo-500" />
              </div>
              {hasMonthlyProduction ? (
                <div className="flex items-end gap-2 h-36 pt-2">
                  {(charts.monthlyProduction || []).map((m, i) => {
                    const maxVal = Math.max(...(charts.monthlyProduction || []).map((x) => x.completedPieces || 1), 1);
                    const height = Math.max(8, ((m.completedPieces || 0) / maxVal) * 100);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-bold text-slate-700">{m.completedPieces}</span>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 0.6, delay: i * 0.1 }}
                          className="w-full rounded-t bg-gradient-to-t from-indigo-600 to-indigo-400 min-h-[6px]"
                        />
                        <span className="text-[10px] font-semibold text-slate-400">{m.month}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-36 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-4">
                  <BarChart3 className="w-8 h-8 text-slate-300 mb-2" />
                  <span className="text-xs font-bold text-slate-500">No Production Data Yet</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 text-center">Charts will populate once stitching assignments are completed.</span>
                </div>
              )}
            </Card>

            {/* Job Card Status Donut – Hidden on Mobile */}
            <div className="hidden sm:block">
              <Card className="p-4 border border-slate-100 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Job Card Distribution</h3>
                    <p className="text-[10px] text-slate-400">Distribution by current status</p>
                  </div>
                  <Activity className="w-4 h-4 text-indigo-500" />
                </div>
                {hasJobCardStatus ? (
                  <div className="flex items-center gap-6 h-36">
                    <div className="relative w-28 h-28 shrink-0">
                      <svg viewBox="0 0 36 36" className="w-full h-full">
                        {(() => {
                          const dist = charts.jobCardStatusDistribution || [];
                          const total = dist.reduce((s, d) => s + d.count, 0) || 1;
                          let cumOffset = 0;
                          return dist.map((d, i) => {
                            const pct = (d.count / total) * 100;
                            const dashArray = `${pct} ${100 - pct}`;
                            const offset = cumOffset;
                            cumOffset += pct;
                            const color = statusColors[d.status]?.bg || '#94a3b8';
                            return (
                              <circle
                                key={i}
                                cx="18" cy="18" r="15.9155"
                                fill="none"
                                stroke={color}
                                strokeWidth="3.5"
                                strokeDasharray={dashArray}
                                strokeDashoffset={-offset}
                                className="transition-all duration-700"
                              />
                            );
                          });
                        })()}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-extrabold text-slate-800">
                          {(charts.jobCardStatusDistribution || []).reduce((s, d) => s + d.count, 0)}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Total</span>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-col gap-1.5 flex-1 max-h-36 overflow-y-auto pr-1">
                      {(charts.jobCardStatusDistribution || []).map((d, i) => (
                        <div key={i} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: statusColors[d.status]?.bg || '#94a3b8' }} />
                            <span className="text-[11px] font-semibold text-slate-600 truncate max-w-[100px]">
                              {statusColors[d.status]?.label || d.status}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-slate-900">{d.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-36 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-4">
                    <Activity className="w-8 h-8 text-slate-300 mb-2" />
                    <span className="text-xs font-bold text-slate-500">No Job Cards Registered</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 text-center">Register a Job Card to view status splits.</span>
                  </div>
                )}
              </Card>
            </div>
          </div>


          {/* ═══ SALARY TREND CHART ═══ */}
          {/* Salary Trend Chart – Hidden on Mobile */}
          <div className="hidden sm:block">
            <Card className="p-4 border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Salary & Advances Trend</h3>
                  <p className="text-[10px] text-slate-400">Payments vs Advances – Last 6 months</p>
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              {hasSalaryTrend ? (
                <div>
                  <div className="flex items-end gap-3 h-32 pt-2">
                    {(charts.salaryTrend || []).map((m, i) => {
                      const maxVal = Math.max(...(charts.salaryTrend || []).map((x) => Math.max(x.paid, x.advanced) || 1), 1);
                      const paidH = Math.max(4, ((m.paid || 0) / maxVal) * 100);
                      const advH = Math.max(4, ((m.advanced || 0) / maxVal) * 100);
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="flex items-end gap-0.5 w-full h-24">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${paidH}%` }}
                              transition={{ duration: 0.5, delay: i * 0.08 }}
                              className="flex-1 rounded bg-emerald-500 min-h-[3px]"
                              title={`Paid: ₹${m.paid}`}
                            />
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${advH}%` }}
                              transition={{ duration: 0.5, delay: i * 0.08 + 0.05 }}
                              className="flex-1 rounded bg-amber-400 min-h-[3px]"
                              title={`Advance: ₹${m.advanced}`}
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400">{m.month}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4 mt-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                      <span className="text-[10px] font-bold text-slate-500">Salary Paid</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
                      <span className="text-[10px] font-bold text-slate-500">Advance Given</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-32 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-4">
                  <PiggyBank className="w-8 h-8 text-slate-300 mb-2" />
                  <span className="text-xs font-bold text-slate-500">No Salary Transactions Recorded</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 text-center">Process salary payments to populate cash trends.</span>
                </div>
              )}
            </Card>
          </div>


          {/* ═══ RECENT ACTIVITY LISTINGS (SIDE-BY-SIDE TABLE SPLITS) ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Recent Job Cards */}
            <Card className="p-4 space-y-3 border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Recent Job Cards
                  </h3>
                  <p className="text-[10px] text-slate-400">Latest production batches</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/job-cards')} icon={ChevronRight}>View All</Button>
              </div>

              {recentJobCards.length > 0 ? (
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-2 px-3">Job Card #</th>
                        <th className="py-2 px-3">Design</th>
                        <th className="py-2 px-3 text-center">Priority</th>
                        <th className="py-2 px-3 text-center">Qty</th>
                        <th className="py-2 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                      {recentJobCards.map((jc) => (
                        <tr key={jc.id} className="hover:bg-slate-50/40 transition-colors cursor-pointer" onClick={() => navigate('/job-cards')}>
                          <td className="py-2 px-3 font-bold text-indigo-600">{jc.job_card_number}</td>
                          <td className="py-2 px-3 text-slate-700">{jc.design_code}</td>
                          <td className="py-2 px-3 text-center"><StatusBadge status={jc.priority?.toLowerCase() || 'normal'} label={jc.priority} /></td>
                          <td className="py-2 px-3 text-center font-bold text-slate-800">{jc.total_quantity} Pcs</td>
                          <td className="py-2 px-3 text-center"><StatusBadge status={jc.status === 'CUTTING_COMPLETED' ? 'completed' : jc.status === 'CUTTING_IN_PROGRESS' ? 'active' : 'pending'} label={jc.status?.replace(/_/g, ' ')} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 bg-slate-50/50 border border-slate-100 rounded-2xl">
                  <span className="text-xs text-slate-400 font-bold mb-3">No Job Cards Registered</span>
                  <Button size="xs" variant="primary" onClick={() => navigate('/job-cards')} icon={FilePlus}>Create Job Card</Button>
                </div>
              )}
            </Card>


            {/* Recent Salary Payments */}
            <Card className="p-4 space-y-3 border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    Recent Salary Payments
                  </h3>
                  <p className="text-[10px] text-slate-400">Latest payment disbursements</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/salary')} icon={ChevronRight}>View All</Button>
              </div>

              {recentPayments.length > 0 ? (
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-2 px-3">Employee</th>
                        <th className="py-2 px-3">Code</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                        <th className="py-2 px-3 text-center">Mode</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                      {recentPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="py-2 px-3 font-bold text-slate-700">{p.employee_name}</td>
                          <td className="py-2 px-3 text-slate-400">{p.employee_code}</td>
                          <td className="py-2 px-3 text-right font-extrabold text-emerald-600">₹{p.amount.toLocaleString('en-IN')}</td>
                          <td className="py-2 px-3 text-center"><StatusBadge status="active" label={p.payment_mode} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 bg-slate-50/50 border border-slate-100 rounded-2xl">
                  <span className="text-xs text-slate-400 font-bold mb-3">No Payments Recorded</span>
                  <Button size="xs" variant="primary" onClick={() => navigate('/salary')} icon={UserPlus}>Add Payment</Button>
                </div>
              )}
            </Card>

          </div>
        </>
      )}
    </div>
  );
};

export default OwnerDashboard;

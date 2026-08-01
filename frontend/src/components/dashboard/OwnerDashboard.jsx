import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  FileText,
  Scissors,
  CheckSquare,
  Layers,
  Banknote,
  CreditCard,
  TrendingUp,
  RefreshCw,
  Clock,
  ChevronRight,
  UserPlus,
  FilePlus,
  BarChart3,
  Settings,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService.js';
import PageHeader from '../ui/PageHeader.jsx';
import Card, { CardHeader, CardBody } from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import { CardSkeleton } from '../ui/LoadingSkeleton.jsx';
import EmptyState from '../common/EmptyState.jsx';
import ErrorComponent from '../common/ErrorComponent.jsx';
import DashboardCard from './DashboardCard.jsx';
import NotificationWidget from './NotificationWidget.jsx';

const OwnerDashboard = ({ greeting, userName, todayFormatted }) => {
  const navigate = useNavigate();

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

  // Quick Actions
  const quickActions = [
    { id: 'add_emp', label: '+ Add Employee', desc: 'Register new worker', icon: UserPlus, path: '/employees', bg: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200' },
    { id: 'add_jc', label: '+ Job Card', desc: 'Create production batch', icon: FilePlus, path: '/job-cards', bg: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200' },
    { id: 'reports', label: 'Open Reports', desc: 'Analytics & exports', icon: BarChart3, path: '/reports', bg: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200' },
    { id: 'settings', label: 'Settings', desc: 'System configuration', icon: Settings, path: '/settings', bg: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300' },
  ];

  // Chart color mapping for job card status
  const statusColors = {
    CREATED: { bg: '#6366f1', label: 'Created' },
    READY_FOR_CUTTING: { bg: '#f59e0b', label: 'Ready for Cutting' },
    CUTTING_IN_PROGRESS: { bg: '#3b82f6', label: 'Cutting In Progress' },
    CUTTING_COMPLETED: { bg: '#10b981', label: 'Cutting Completed' },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting}, ${userName} 👋`}
        subtitle={`${todayFormatted} • Factory Owner Dashboard`}
        action={
          <Button variant="secondary" size="sm" onClick={() => refetch()} isLoading={isFetching} icon={RefreshCw}>
            Refresh
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {/* ═══ METRIC CARDS (4-column grid) ═══ */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
            <DashboardCard title="Total Employees" value={metrics.totalEmployees ?? 0} icon={Users} badgeText="Active" status="active" iconBg="bg-blue-50 text-blue-600" onClick={() => navigate('/employees')} />
            <DashboardCard title="Active Job Cards" value={metrics.activeJobCards ?? 0} icon={FileText} badgeText="In Progress" status="active" iconBg="bg-indigo-50 text-indigo-600" onClick={() => navigate('/job-cards')} />
            <DashboardCard title="Ready for Cutting" value={metrics.readyForCutting ?? 0} icon={Scissors} badgeText="Queue" status="warning" iconBg="bg-amber-50 text-amber-600" onClick={() => navigate('/cutting')} />
            <DashboardCard title="Cutting In Progress" value={metrics.cuttingInProgress ?? 0} icon={Scissors} badgeText="Active" status="active" iconBg="bg-orange-50 text-orange-600" />
            <DashboardCard title="Cutting Completed" value={metrics.cuttingCompleted ?? 0} icon={CheckSquare} badgeText="Done" status="completed" iconBg="bg-emerald-50 text-emerald-600" />
            <DashboardCard title="Total Bundles" value={metrics.totalBundles ?? 0} icon={Layers} badgeText="Total" status="active" iconBg="bg-purple-50 text-purple-600" />
            <DashboardCard title="Pending Bundles" value={metrics.pendingBundles ?? 0} icon={Package} badgeText="Unassigned" status="pending" iconBg="bg-rose-50 text-rose-600" onClick={() => navigate('/assignments')} />
            <DashboardCard title="Completed Bundles" value={metrics.completedBundles ?? 0} icon={CheckSquare} badgeText="Finished" status="completed" iconBg="bg-teal-50 text-teal-600" />
            <DashboardCard title="Salary This Month" value={`₹${(metrics.totalSalaryThisMonth ?? 0).toLocaleString('en-IN')}`} icon={Banknote} badgeText="Paid" status="completed" iconBg="bg-green-50 text-green-600" onClick={() => navigate('/salary')} />
            <DashboardCard title="Advance This Month" value={`₹${(metrics.totalAdvanceThisMonth ?? 0).toLocaleString('en-IN')}`} icon={CreditCard} badgeText="Given" status="warning" iconBg="bg-yellow-50 text-yellow-600" onClick={() => navigate('/advances-payments')} />
            <DashboardCard title="Total Salary Paid" value={`₹${(metrics.totalSalaryPaid ?? 0).toLocaleString('en-IN')}`} icon={TrendingUp} badgeText="All Time" status="active" iconBg="bg-cyan-50 text-cyan-600" />
            <DashboardCard title="Pending Salary" value={`₹${(metrics.pendingSalary ?? 0).toLocaleString('en-IN')}`} icon={Banknote} badgeText="Due" status="pending" iconBg="bg-red-50 text-red-600" onClick={() => navigate('/salary')} />
          </div>

          {/* ═══ CHARTS SECTION ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Production Bar Chart */}
            <Card className="p-5 border border-factory-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-factory-navy uppercase tracking-wider">Monthly Production</h3>
                  <p className="text-xs text-factory-muted">Completed pieces – Last 6 months</p>
                </div>
                <BarChart3 className="w-5 h-5 text-brand-500" />
              </div>
              <div className="flex items-end gap-2 h-40">
                {(charts.monthlyProduction || []).map((m, i) => {
                  const maxVal = Math.max(...(charts.monthlyProduction || []).map((x) => x.completedPieces || 1), 1);
                  const height = Math.max(8, ((m.completedPieces || 0) / maxVal) * 100);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <span className="text-[10px] font-bold text-factory-navy">{m.completedPieces}</span>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 min-h-[8px]"
                      />
                      <span className="text-[10px] font-semibold text-factory-muted">{m.month}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Job Card Status Donut */}
            <Card className="p-5 border border-factory-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-factory-navy uppercase tracking-wider">Job Card Status</h3>
                  <p className="text-xs text-factory-muted">Distribution by current status</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                {/* Simple visual donut using CSS */}
                <div className="relative w-32 h-32 shrink-0">
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
                    <span className="text-xl font-extrabold text-factory-navy">
                      {(charts.jobCardStatusDistribution || []).reduce((s, d) => s + d.count, 0)}
                    </span>
                    <span className="text-[10px] text-factory-muted font-semibold">Total</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-2">
                  {(charts.jobCardStatusDistribution || []).map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: statusColors[d.status]?.bg || '#94a3b8' }} />
                      <span className="text-xs font-semibold text-factory-navy">{statusColors[d.status]?.label || d.status}</span>
                      <span className="text-xs font-bold text-brand-600 ml-auto">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* ═══ SALARY TREND CHART ═══ */}
          <Card className="p-5 border border-factory-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-factory-navy uppercase tracking-wider">Salary Trend</h3>
                <p className="text-xs text-factory-muted">Payments vs Advances – Last 6 months</p>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex items-end gap-3 h-36">
              {(charts.salaryTrend || []).map((m, i) => {
                const maxVal = Math.max(...(charts.salaryTrend || []).map((x) => Math.max(x.paid, x.advanced) || 1), 1);
                const paidH = Math.max(4, ((m.paid || 0) / maxVal) * 100);
                const advH = Math.max(4, ((m.advanced || 0) / maxVal) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="flex items-end gap-0.5 w-full h-28">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${paidH}%` }}
                        transition={{ duration: 0.5, delay: i * 0.08 }}
                        className="flex-1 rounded-t-md bg-emerald-500 min-h-[4px]"
                        title={`Paid: ₹${m.paid}`}
                      />
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${advH}%` }}
                        transition={{ duration: 0.5, delay: i * 0.08 + 0.05 }}
                        className="flex-1 rounded-t-md bg-amber-400 min-h-[4px]"
                        title={`Advance: ₹${m.advanced}`}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-factory-muted">{m.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                <span className="text-[11px] font-semibold text-factory-muted">Salary Paid</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-amber-400" />
                <span className="text-[11px] font-semibold text-factory-muted">Advance Given</span>
              </div>
            </div>
          </Card>

          {/* ═══ NOTIFICATIONS ═══ */}
          <NotificationWidget />

          {/* ═══ TABLES + QUICK ACTIONS ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Job Cards */}
            <Card className="lg:col-span-2 p-5 space-y-4 border border-factory-border">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-factory-navy uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-600" />
                    Recent Job Cards
                  </h3>
                  <p className="text-xs text-factory-muted">Latest production batches</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/job-cards')} icon={ChevronRight}>View All</Button>
              </div>

              {recentJobCards.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                        <th className="py-2.5 px-3">Job Card #</th>
                        <th className="py-2.5 px-3">Design</th>
                        <th className="py-2.5 px-3 text-center">Priority</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-center">Due</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                      {recentJobCards.map((jc) => (
                        <tr key={jc.id} className="hover:bg-slate-50/60 transition-colors cursor-pointer" onClick={() => navigate('/job-cards')}>
                          <td className="py-2.5 px-3 font-extrabold text-brand-600">{jc.job_card_number}</td>
                          <td className="py-2.5 px-3 text-slate-800">{jc.design_code}</td>
                          <td className="py-2.5 px-3 text-center"><StatusBadge status={jc.priority?.toLowerCase() || 'normal'} label={jc.priority} /></td>
                          <td className="py-2.5 px-3 text-center font-bold">{jc.total_quantity} Pcs</td>
                          <td className="py-2.5 px-3 text-center"><StatusBadge status={jc.status === 'CUTTING_COMPLETED' ? 'completed' : jc.status === 'CUTTING_IN_PROGRESS' ? 'active' : 'pending'} label={jc.status?.replace(/_/g, ' ')} /></td>
                          <td className="py-2.5 px-3 text-center text-slate-600">{new Date(jc.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="No Job Cards Yet" description="Create your first production batch." />
              )}
            </Card>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-factory-navy uppercase tracking-wider">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate(action.path)}
                      className={`btn-touch flex flex-col items-start justify-between p-3.5 rounded-2xl border text-left transition-all h-full min-h-[96px] ${action.bg}`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-white/80 backdrop-blur-xs flex items-center justify-center mb-2 shadow-xs">
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className="font-bold text-xs block">{action.label}</span>
                        <span className="text-[10px] opacity-75">{action.desc}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ═══ RECENT SALARY PAYMENTS TABLE ═══ */}
          <Card className="p-5 space-y-4 border border-factory-border">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-factory-navy uppercase tracking-wider flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  Recent Salary Payments
                </h3>
                <p className="text-xs text-factory-muted">Latest payment disbursements</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/salary')} icon={ChevronRight}>View All</Button>
            </div>

            {recentPayments.length > 0 ? (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Employee</th>
                      <th className="py-2.5 px-3">Code</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-center">Mode</th>
                      <th className="py-2.5 px-3 text-center">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                    {recentPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-factory-navy">{p.employee_name}</td>
                        <td className="py-2.5 px-3 text-slate-500">{p.employee_code}</td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-emerald-600">₹{p.amount.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3 text-center"><StatusBadge status="active" label={p.payment_mode} /></td>
                        <td className="py-2.5 px-3 text-center text-slate-600">{new Date(p.payment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No Payments Yet" description="Payment records will appear here." />
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default OwnerDashboard;

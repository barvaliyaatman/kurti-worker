import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckSquare,
  Package,
  Layers,
  Clock,
  Banknote,
  RefreshCw,
  ChevronRight,
  UserCheck,
  Scissors,
  AlertCircle,
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

const ManagerDashboard = ({ greeting, userName, todayFormatted }) => {
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
    queryKey: ['dashboardMetrics', 'MANAGER'],
    queryFn: dashboardService.getMetrics,
    refetchInterval: 30000,
  });

  const metrics = dashboard?.metrics || {};
  const todaysAssignments = dashboard?.todaysAssignments || [];
  const recentlyCompletedBundles = dashboard?.recentlyCompletedBundles || [];
  const workersWithPendingWork = dashboard?.workersWithPendingWork || [];

  // Quick Actions
  const quickActions = [
    { id: 'assign', label: skipBundle ? 'Work Assignment' : 'Assign Work', desc: 'Assign work to workers', icon: UserCheck, path: '/assignments', bg: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200' },
    ...(!skipCutting ? [{ id: 'cutting', label: 'Cutting Queue', desc: 'View cutting progress', icon: Scissors, path: '/cutting', bg: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200' }] : []),
    { id: 'salary', label: 'Salary', desc: 'Process payments', icon: Banknote, path: '/salary', bg: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting}, ${userName} 👋`}
        subtitle={`${todayFormatted} • Production Manager Dashboard`}
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {/* ═══ METRIC CARDS (Filtered by Workflow Settings) ═══ */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {!skipCutting && (
              <DashboardCard
                title="Cutting Completed"
                value={metrics.cuttingCompletedCards ?? 0}
                icon={CheckSquare}
                badgeText="Ready"
                status="completed"
                iconBg="bg-emerald-50 text-emerald-600"
                onClick={() => navigate('/cutting')}
              />
            )}
            {!skipBundle && (
              <DashboardCard
                title="Bundles Waiting"
                value={metrics.bundlesWaiting ?? 0}
                icon={Package}
                badgeText="Unassigned"
                status="warning"
                iconBg="bg-amber-50 text-amber-600"
                onClick={() => navigate('/assignments')}
              />
            )}
            <DashboardCard
              title="Active Assignments"
              value={metrics.activeAssignments ?? 0}
              icon={Layers}
              badgeText="In Progress"
              status="active"
              iconBg="bg-blue-50 text-blue-600"
              onClick={() => navigate('/assignments')}
            />
            <DashboardCard
              title="Completed Today"
              value={metrics.completedToday ?? 0}
              icon={CheckSquare}
              badgeText="Today"
              status="completed"
              iconBg="bg-teal-50 text-teal-600"
            />
            <DashboardCard
              title="Pending Work"
              value={metrics.pendingWork ?? 0}
              icon={Clock}
              badgeText="Outstanding"
              status="pending"
              iconBg="bg-rose-50 text-rose-600"
            />
            <DashboardCard
              title="Salary Paid Today"
              value={`₹${(metrics.todaysSalaryPaid ?? 0).toLocaleString('en-IN')}`}
              icon={Banknote}
              badgeText="Today"
              status="completed"
              iconBg="bg-green-50 text-green-600"
              onClick={() => navigate('/salary')}
            />
          </div>

          {/* ═══ QUICK ACTIONS ═══ */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-factory-navy uppercase tracking-wider">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate(action.path)}
                    className={`btn-touch flex flex-col items-start justify-between p-3.5 rounded-2xl border text-left transition-all min-h-[88px] ${action.bg}`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/80 flex items-center justify-center mb-2 shadow-xs">
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

          {/* ═══ TODAY'S ASSIGNMENTS TABLE ═══ */}
          <Card className="p-5 space-y-4 border border-factory-border">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-factory-navy uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-600" />
                  Today's Assignments
                </h3>
                <p className="text-xs text-factory-muted">Work assigned today</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/assignments')} icon={ChevronRight}>View All</Button>
            </div>

            {todaysAssignments.length > 0 ? (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Worker</th>
                      <th className="py-2.5 px-3">Bundle</th>
                      <th className="py-2.5 px-3">Job Card</th>
                      <th className="py-2.5 px-3 text-center">Color/Size</th>
                      <th className="py-2.5 px-3 text-center">Assigned</th>
                      <th className="py-2.5 px-3 text-center">Done</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                    {todaysAssignments.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-factory-navy">{a.employee_name}</div>
                          <div className="text-[10px] text-factory-muted">{a.employee_code}</div>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-brand-600">{a.bundle_number}</td>
                        <td className="py-2.5 px-3 text-slate-700">{a.job_card_number}</td>
                        <td className="py-2.5 px-3 text-center">{a.color} / {a.size}</td>
                        <td className="py-2.5 px-3 text-center font-bold">{a.assigned_sets}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-600">{a.completed_sets}</td>
                        <td className="py-2.5 px-3 text-center">
                          <StatusBadge
                            status={a.status === 'COMPLETED' ? 'completed' : a.status === 'IN_PROGRESS' ? 'active' : 'pending'}
                            label={a.status?.replace(/_/g, ' ')}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No Assignments Today" description="No work has been assigned today yet." />
            )}
          </Card>

          {/* ═══ BOTTOM GRID: Completed Bundles + Pending Workers ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recently Completed Bundles */}
            <Card className="p-5 space-y-4 border border-factory-border">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-factory-navy uppercase tracking-wider flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    Recently Completed Bundles
                  </h3>
                </div>
              </div>

              {recentlyCompletedBundles.length > 0 ? (
                <div className="space-y-2">
                  {recentlyCompletedBundles.map((b) => (
                    <div key={b.id} className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                      <div>
                        <span className="font-bold text-xs text-factory-navy block">{b.bundle_number}</span>
                        <span className="text-[10px] text-factory-muted">{b.job_card_number} • {b.color} / {b.size}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-xs text-emerald-600">{b.completed_sets}/{b.total_sets} Pcs</span>
                        <span className="text-[10px] text-factory-muted block">{new Date(b.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No Completed Bundles" description="Completed bundles will appear here." />
              )}
            </Card>

            {/* Workers with Pending Work */}
            <Card className="p-5 space-y-4 border border-factory-border">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-factory-navy uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Workers with Pending Work
                  </h3>
                </div>
              </div>

              {workersWithPendingWork.length > 0 ? (
                <div className="space-y-2">
                  {workersWithPendingWork.map((w) => (
                    <div key={w.id} className="flex items-center justify-between p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                      <div>
                        <span className="font-bold text-xs text-factory-navy block">{w.employee_name}</span>
                        <span className="text-[10px] text-factory-muted">{w.bundle_number} • {w.color} / {w.size}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-xs text-amber-600">{w.pending_sets} Pending</span>
                        <span className="text-[10px] text-factory-muted block">{w.completed_sets}/{w.assigned_sets} Done</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No Pending Work" description="All workers have completed their tasks." />
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default ManagerDashboard;

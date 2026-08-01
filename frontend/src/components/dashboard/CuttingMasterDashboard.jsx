import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Scissors,
  Clock,
  CheckSquare,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  Play,
  CheckCircle,
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService.js';
import PageHeader from '../ui/PageHeader.jsx';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import { CardSkeleton } from '../ui/LoadingSkeleton.jsx';
import EmptyState from '../common/EmptyState.jsx';
import ErrorComponent from '../common/ErrorComponent.jsx';
import DashboardCard from './DashboardCard.jsx';

const CuttingMasterDashboard = ({ greeting, userName, todayFormatted }) => {
  const navigate = useNavigate();

  const {
    data: dashboard,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['dashboardMetrics', 'CUTTING_MASTER'],
    queryFn: dashboardService.getMetrics,
    refetchInterval: 20000,
  });

  const metrics = dashboard?.metrics || {};
  const readyJobCards = dashboard?.readyJobCards || [];
  const recentlyCompletedCutting = dashboard?.recentlyCompletedCutting || [];

  // Quick Actions
  const quickActions = [
    { id: 'start', label: 'Start Cutting', desc: 'Begin a new batch', icon: Play, path: '/cutting', bg: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200' },
    { id: 'complete', label: 'Complete Cutting', desc: 'Finish current batch', icon: CheckCircle, path: '/cutting', bg: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting}, ${userName} ✂️`}
        subtitle={`${todayFormatted} • Cutting Master Dashboard`}
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
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {/* ═══ METRIC CARDS (4 cards, 2x2 grid) ═══ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <DashboardCard
              title="Ready for Cutting"
              value={metrics.readyForCutting ?? 0}
              icon={Scissors}
              badgeText="Queue"
              status="warning"
              iconBg="bg-amber-50 text-amber-600"
              onClick={() => navigate('/cutting')}
            />
            <DashboardCard
              title="Cutting In Progress"
              value={metrics.cuttingInProgress ?? 0}
              icon={Clock}
              badgeText="Active"
              status="active"
              iconBg="bg-blue-50 text-blue-600"
              onClick={() => navigate('/cutting')}
            />
            <DashboardCard
              title="Completed Today"
              value={metrics.completedToday ?? 0}
              icon={CheckSquare}
              badgeText="Today"
              status="completed"
              iconBg="bg-emerald-50 text-emerald-600"
            />
            <DashboardCard
              title="Pending Cutting"
              value={metrics.pendingCutting ?? 0}
              icon={AlertTriangle}
              badgeText="Total"
              status="pending"
              iconBg="bg-rose-50 text-rose-600"
              onClick={() => navigate('/cutting')}
            />
          </div>

          {/* ═══ QUICK ACTIONS ═══ */}
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
                    className={`btn-touch flex flex-col items-start justify-between p-4 rounded-2xl border text-left transition-all min-h-[100px] ${action.bg}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center mb-2 shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-sm block">{action.label}</span>
                      <span className="text-[11px] opacity-75">{action.desc}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* ═══ READY JOB CARDS TABLE ═══ */}
          <Card className="p-5 space-y-4 border border-factory-border">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-factory-navy uppercase tracking-wider flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-amber-600" />
                  Ready for Cutting
                </h3>
                <p className="text-xs text-factory-muted">Job cards waiting in the cutting queue</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/cutting')} icon={ChevronRight}>View All</Button>
            </div>

            {readyJobCards.length > 0 ? (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Job Card #</th>
                      <th className="py-2.5 px-3">Design</th>
                      <th className="py-2.5 px-3">Components</th>
                      <th className="py-2.5 px-3 text-center">Priority</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-center">Due Date</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                    {readyJobCards.map((jc) => (
                      <tr key={jc.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-extrabold text-brand-600">{jc.job_card_number}</td>
                        <td className="py-2.5 px-3 text-slate-800">{jc.design_code}</td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {(jc.components || '').split(',').map((c, i) => (
                            <span key={i} className="inline-block bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded mr-1 mb-0.5">{c.trim()}</span>
                          ))}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <StatusBadge status={jc.priority?.toLowerCase() || 'normal'} label={jc.priority} />
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold">{jc.total_quantity} Pcs</td>
                        <td className="py-2.5 px-3 text-center text-slate-600">
                          {new Date(jc.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate(`/cutting/${jc.id}`)}
                            className="text-[10px] px-2.5 py-1"
                          >
                            Start
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No Pending Job Cards"
                description="All job cards have been processed. New batches will appear here when they are ready for cutting."
              />
            )}
          </Card>

          {/* ═══ RECENTLY COMPLETED CUTTING ═══ */}
          <Card className="p-5 space-y-4 border border-factory-border">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-factory-navy uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  Recently Completed Cutting
                </h3>
                <p className="text-xs text-factory-muted">Recently finished cutting batches</p>
              </div>
            </div>

            {recentlyCompletedCutting.length > 0 ? (
              <div className="space-y-2">
                {recentlyCompletedCutting.map((jc) => (
                  <div key={jc.id} className="flex items-center justify-between p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl hover:bg-emerald-50 transition-colors">
                    <div>
                      <span className="font-extrabold text-xs text-factory-navy block">{jc.job_card_number}</span>
                      <span className="text-[10px] text-factory-muted">{jc.design_code} • {jc.total_quantity} Pcs</span>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <StatusBadge status={jc.priority?.toLowerCase() || 'normal'} label={jc.priority} />
                      <span className="text-[10px] text-factory-muted">
                        {new Date(jc.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Completed Cutting"
                description="Completed cutting batches will appear here."
              />
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default CuttingMasterDashboard;

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  CheckSquare, 
  Search, 
  Layers, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Package,
  Banknote,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { jobCardAssignmentService } from '../services/jobCardAssignmentService.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import SearchBar from '../components/ui/SearchBar.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { CardSkeleton } from '../components/ui/LoadingSkeleton.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorComponent from '../components/common/ErrorComponent.jsx';

export const AssignmentListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isManagerOrOwner = user?.role === 'MANAGER' || user?.role === 'OWNER';

  // Search & Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Fetch Job Cards ready for assignment
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['assignmentQueue', { search, status: statusFilter }],
    queryFn: () =>
      jobCardAssignmentService.getAssignmentQueue({
        search,
        status: statusFilter,
      }),
  });

  const jobCards = data?.jobCards || [];

  const statusBadgeConfig = {
    READY_FOR_ASSIGNMENT: { variant: 'active', label: 'Ready For Assignment' },
    IN_ASSIGNMENT: { variant: 'warning', label: 'In Assignment' },
    COMPLETED: { variant: 'completed', label: 'Completed' },
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <PageHeader
        title="Work Assignment Management"
        subtitle="Job Card based workspace – Manage production bundles and worker assignments"
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

      {/* Search & Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder="Search by Job Card # or Design Code..."
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'READY_FOR_ASSIGNMENT', 'IN_ASSIGNMENT', 'COMPLETED'].map((st) => (
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
                {st === 'READY_FOR_ASSIGNMENT' && 'Ready For Assignment'}
                {st === 'IN_ASSIGNMENT' && 'In Assignment'}
                {st === 'COMPLETED' && 'Completed'}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* ERROR STATE */}
      {isError && (
        <ErrorComponent
          title="Failed to load Work Assignment queue"
          message={error?.response?.data?.message || 'Server connection error'}
          onRetry={() => refetch()}
        />
      )}

      {/* LOADING STATE */}
      {isLoading && !isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {/* DATA CONTENT */}
      {!isLoading && !isError && (
        <>
          {jobCards.length === 0 ? (
            <Card>
              <EmptyState
                title="No Job Cards Ready for Assignment"
                description="Once Cutting Master completes cutting progress, job cards will appear here for bundle assignment."
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {jobCards.map((jc) => {
                const badgeInfo = statusBadgeConfig[jc.assignment_status] || {
                  variant: 'draft',
                  label: jc.assignment_status,
                };

                return (
                  <Card
                    key={jc.id}
                    hoverable
                    className="p-5 flex flex-col justify-between space-y-4 border border-factory-border"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-base font-extrabold text-factory-navy block">
                          {jc.job_card_number}
                        </span>
                        <span className="text-xs font-bold text-brand-600 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded inline-block mt-1">
                          #{jc.design_code}
                        </span>
                      </div>

                      <StatusBadge status={badgeInfo.variant} label={badgeInfo.label} />
                    </div>

                    {/* Specifications */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between text-factory-muted">
                        <span className="font-semibold">Stitching Rate:</span>
                        <span className="font-extrabold text-emerald-600">
                          ₹{jc.stitching_rate.toFixed(2)} / Pcs
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-factory-muted">
                        <span className="font-semibold">Total Finished Pieces:</span>
                        <span className="font-extrabold text-factory-navy">
                          {jc.total_quantity} Pcs
                        </span>
                      </div>
                    </div>

                    {/* Bundles Summary Box */}
                    <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-center text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-factory-muted uppercase block">
                          Total
                        </span>
                        <span className="font-extrabold text-factory-navy block text-sm">
                          {jc.total_bundles}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-brand-700 uppercase block">
                          Assigned
                        </span>
                        <span className="font-extrabold text-brand-600 block text-sm">
                          {jc.assigned_bundles}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-amber-800 uppercase block">
                          Pending
                        </span>
                        <span className="font-extrabold text-amber-700 block text-sm">
                          {jc.pending_bundles}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                          Done
                        </span>
                        <span className="font-extrabold text-emerald-600 block text-sm">
                          {jc.completed_bundles}
                        </span>
                      </div>
                    </div>

                    {/* Overall Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-factory-navy uppercase tracking-wider">
                          Assignment Progress
                        </span>
                        <span className="text-brand-600 font-extrabold">
                          {jc.progress_percentage}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${jc.progress_percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Open Assignment Workspace Action */}
                    <div className="pt-2">
                      <Button
                        variant="primary"
                        className="w-full"
                        icon={FolderOpen}
                        onClick={() => navigate(`/job-cards/${jc.id}`)}
                      >
                        Open Assignment Workspace
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AssignmentListPage;

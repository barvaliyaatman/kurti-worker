import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Layers,
  Calendar,
  CheckCircle2,
  Clock,
  Package,
  UserCheck,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Eye,
  Ban,
  ArrowRight,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { jobCardAssignmentService } from '../services/jobCardAssignmentService.js';
import { assignmentService } from '../services/assignmentService.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import SearchBar from '../components/ui/SearchBar.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Table, { TableRow, TableCell } from '../components/ui/Table.jsx';
import { CardSkeleton } from '../components/ui/LoadingSkeleton.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorComponent from '../components/common/ErrorComponent.jsx';
import ConfirmationDialog from '../components/ui/ConfirmationDialog.jsx';

import AssignmentModal from '../components/assignments/AssignmentModal.jsx';
import UpdateProgressModal from '../components/assignments/UpdateProgressModal.jsx';
import AssignmentDetailsDrawer from '../components/assignments/AssignmentDetailsDrawer.jsx';

export const JobCardAssignmentWorkspacePage = () => {
  const { id, jobCardId } = useParams();
  const targetId = id || jobCardId;
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isManagerOrOwner = user?.role === 'MANAGER' || user?.role === 'OWNER';
  const canManage = isManagerOrOwner;

  // Search & Filter inside Job Card
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal & Drawer states
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState(null);

  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [assignmentToCancel, setAssignmentToCancel] = useState(null);

  // Fetch Job Card Workspace data
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['jobCardAssignmentWorkspace', targetId],
    queryFn: () => jobCardAssignmentService.getAssignmentWorkspace(targetId),
    enabled: Boolean(targetId),
  });

  const jobCard = data?.jobCard;
  const summary = data?.summary || {};
  const allBundles = data?.bundles || [];
  const assignments = data?.assignments || [];

  // Create Assignment Mutation
  const createMutation = useMutation({
    mutationFn: assignmentService.createAssignment,
    onSuccess: (res) => {
      queryClient.invalidateQueries(['jobCardAssignmentWorkspace', id]);
      queryClient.invalidateQueries(['assignmentQueue']);
      toast.success(res?.message || 'Worker assigned to bundle successfully!');
      setAssignModalOpen(false);
      setSelectedBundle(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to assign worker to bundle');
    },
  });

  // Update Progress Mutation
  const progressMutation = useMutation({
    mutationFn: ({ id: asgnId, completed_sets, notes }) =>
      assignmentService.updateProgress(asgnId, { completed_sets, notes }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['jobCardAssignmentWorkspace', id]);
      queryClient.invalidateQueries(['assignmentQueue']);
      toast.success(res?.message || 'Progress updated successfully!');
      setProgressModalOpen(false);
      setSelectedAssignment(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to update progress');
    },
  });

  // Complete Assignment Mutation
  const completeMutation = useMutation({
    mutationFn: (asgnId) => assignmentService.completeAssignment(asgnId),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['jobCardAssignmentWorkspace', id]);
      queryClient.invalidateQueries(['assignmentQueue']);
      toast.success(res?.message || 'Assignment marked as completed!');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to complete assignment');
    },
  });

  // Cancel Assignment Mutation
  const cancelMutation = useMutation({
    mutationFn: (asgnId) => assignmentService.cancelAssignment(asgnId),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['jobCardAssignmentWorkspace', id]);
      queryClient.invalidateQueries(['assignmentQueue']);
      toast.success(res?.message || 'Assignment cancelled cleanly');
      setConfirmCancelOpen(false);
      setAssignmentToCancel(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to cancel assignment');
    },
  });

  // Start Assignment Mutation
  const startMutation = useMutation({
    mutationFn: (asgnId) => assignmentService.startAssignment(asgnId),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['jobCardAssignmentWorkspace', id]);
      queryClient.invalidateQueries(['assignmentQueue']);
      toast.success(res?.message || 'Work started successfully!');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to start work');
    },
  });

  // Client Filter Bundles
  const filteredBundles = allBundles.filter((bnd) => {
    // A bundle's remaining quantity (unassigned)
    const unassignedQty = Math.max(0, bnd.total_sets - (bnd.assigned_sets || 0));
    
    // Total assigned and completed sets across all active assignments
    const activeAssignments = (bnd.assignments || []).filter(a => a.status !== 'CANCELLED');
    const totalAssigned = activeAssignments.reduce((acc, a) => acc + a.assigned_sets, 0);
    const totalCompleted = activeAssignments.reduce((acc, a) => acc + a.completed_sets, 0);
    
    // Active assigned work is anything assigned that is NOT yet completed
    const activeAssignedQty = Math.max(0, totalAssigned - totalCompleted);
    
    // It's fully completed if total completed is >= total sets
    const isFullyCompleted = totalCompleted >= bnd.total_sets || bnd.status === 'COMPLETED';
    
    let matchesStatus = true;
    if (statusFilter === 'READY_FOR_ASSIGNMENT') {
      matchesStatus = unassignedQty > 0;
    } else if (statusFilter === 'IN_ASSIGNMENT') {
      matchesStatus = activeAssignedQty > 0;
    } else if (statusFilter === 'COMPLETED') {
      matchesStatus = isFullyCompleted;
    }

    let matchesSearch = true;
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      const assignedWorkerNames = activeAssignments.map((a) => a.employee?.employee_name?.toLowerCase() || '');
      matchesSearch =
        bnd.bundle_number.toLowerCase().includes(term) ||
        bnd.color.toLowerCase().includes(term) ||
        bnd.size.toLowerCase().includes(term) ||
        assignedWorkerNames.some((n) => n.includes(term));
    }

    return matchesStatus && matchesSearch;
  });

  const handleOpenAssignModal = (bnd) => {
    setSelectedBundle({
      ...bnd,
      job_card: jobCard,
    });
    setAssignModalOpen(true);
  };

  const handleOpenProgressModal = (asgn) => {
    setSelectedAssignment(asgn);
    setProgressModalOpen(true);
  };

  const handleOpenDetailsDrawer = (asgn) => {
    setSelectedAssignment(asgn);
    setDetailsDrawerOpen(true);
  };

  const handleOpenCancelDialog = (asgn) => {
    setAssignmentToCancel(asgn);
    setConfirmCancelOpen(true);
  };

  const statusBadgeConfig = {
    ASSIGNED: { variant: 'draft', label: 'Assigned' },
    IN_PROGRESS: { variant: 'warning', label: 'In Progress' },
    COMPLETED: { variant: 'completed', label: 'Completed' },
    SALARY_PENDING: { variant: 'active', label: 'Salary Pending' },
    CANCELLED: { variant: 'inactive', label: 'Cancelled' },
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header & Back Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/assignment')}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-factory-navy transition-colors"
          title="Back to Assignment Queue"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <PageHeader
          title={`Assignment Workspace: ${jobCard?.job_card_number || 'Loading...'}`}
          subtitle={`Design Code: #${jobCard?.design_code || '—'}`}
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
      </div>

      {/* ERROR STATE */}
      {isError && (
        <ErrorComponent
          title="Failed to load Job Card assignment workspace"
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
      {!isLoading && !isError && jobCard && (
        <>
          {/* Header Summary Cards */}
          <Card className="p-5 space-y-4 border border-factory-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl text-factory-navy">
                    Job Card {jobCard.job_card_number}
                  </span>
                  <span className="font-bold text-xs text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded border border-brand-200">
                    Design #{jobCard.design_code}
                  </span>
                  <StatusBadge
                    status={
                      summary.completed_bundles === summary.total_bundles && summary.total_bundles > 0
                        ? 'completed'
                        : summary.assigned_bundles > 0
                          ? 'warning'
                          : 'active'
                    }
                    label={
                      summary.completed_bundles === summary.total_bundles && summary.total_bundles > 0
                        ? 'COMPLETED'
                        : summary.assigned_bundles > 0
                          ? 'IN ASSIGNMENT'
                          : 'READY FOR ASSIGNMENT'
                    }
                  />
                </div>
                <p className="text-xs text-factory-muted mt-1">
                  Stitching Rate: <strong className="text-emerald-700 font-extrabold">₹{jobCard.stitching_rate.toFixed(2)}/Pcs</strong> | Order Quantity: <strong>{jobCard.total_quantity} Finished Pieces</strong> | Priority: <strong>{jobCard.priority}</strong>
                </p>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-factory-navy uppercase tracking-wider">
                  Overall Job Card Bundle Completion Progress
                </span>
                <span className="text-brand-600 font-extrabold">{summary.progress_percentage}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                  style={{ width: `${summary.progress_percentage}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Sticky Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
              <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
                Total Bundles
              </span>
              <span className="text-xl font-extrabold text-factory-navy block">
                {summary.total_bundles || 0}
              </span>
            </div>

            <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
              <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
                Assigned Bundles
              </span>
              <span className="text-xl font-extrabold text-brand-600 block">
                {summary.assigned_bundles || 0}
              </span>
            </div>

            <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
              <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
                Pending Bundles
              </span>
              <span className="text-xl font-extrabold text-amber-700 block">
                {summary.pending_bundles || 0}
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
          </div>

          {/* Search & Filter inside Job Card */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex-1">
                <SearchBar
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClear={() => setSearch('')}
                  placeholder="Search by bundle #, color, size, or worker name..."
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {['ALL', 'READY_FOR_ASSIGNMENT', 'IN_ASSIGNMENT', 'COMPLETED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${statusFilter === st
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'bg-slate-100 text-factory-navy hover:bg-slate-200'
                      }`}
                  >
                    {st === 'ALL' && 'All Bundles'}
                    {st === 'READY_FOR_ASSIGNMENT' && 'Ready For Assignment'}
                    {st === 'IN_ASSIGNMENT' && 'Assigned / In Progress'}
                    {st === 'COMPLETED' && 'Completed'}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* BUNDLE CARDS GRID */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-factory-navy uppercase tracking-wider">
              Production Bundles ({filteredBundles.length})
            </h3>

            {filteredBundles.length === 0 ? (
              <Card>
                <EmptyState
                  title="No Bundles Found"
                  description="No bundles match your filter criteria inside this Job Card."
                />
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBundles.map((bnd) => {
                  const unassignedQty = Math.max(0, bnd.total_sets - (bnd.assigned_sets || 0));
                  const isFullyAssigned = unassignedQty === 0;
                  
                  const activeAssignmentsAll = (bnd.assignments || []).filter(a => a.status !== 'CANCELLED');
                  const totalCompleted = activeAssignmentsAll.reduce((acc, a) => acc + a.completed_sets, 0);
                  const isCompleted = bnd.status === 'COMPLETED' || totalCompleted >= bnd.total_sets;

                  // Find the active assignment that hasn't been fully completed
                  const activeAssignment = activeAssignmentsAll.find(a => 
                    (a.assigned_sets - a.completed_sets) > 0 && a.status !== 'COMPLETED'
                  ) || (isCompleted ? activeAssignmentsAll[0] : null);

                  return (
                    <Card
                      key={bnd.id}
                      hoverable
                      className="p-4 flex flex-col justify-between space-y-3 border border-factory-border hover:border-brand-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-extrabold text-brand-600 text-base block">
                            {bnd.bundle_number}
                          </span>
                          <span className="text-xs font-bold text-factory-navy">
                            {bnd.color} ({bnd.size})
                          </span>
                        </div>

                        {activeAssignment ? (
                          <StatusBadge
                            status={activeAssignment.status === 'COMPLETED' ? 'completed' : activeAssignment.status === 'IN_PROGRESS' ? 'warning' : 'draft'}
                            label={activeAssignment.status === 'COMPLETED' ? 'Completed' : activeAssignment.status === 'IN_PROGRESS' ? 'In Progress' : 'Assigned'}
                          />
                        ) : (
                          <StatusBadge
                            status={isCompleted ? 'completed' : bnd.assigned_sets > 0 ? 'warning' : 'active'}
                            label={isCompleted ? 'Completed' : bnd.assigned_sets > 0 ? 'Assigned' : 'Ready'}
                          />
                        )}
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-factory-muted font-medium">Total Quantity:</span>
                          <span className="font-extrabold text-factory-navy">{bnd.total_sets} Sets</span>
                        </div>
                        
                        {!activeAssignment && (
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-factory-muted font-medium">Available to Assign:</span>
                            <span className="font-extrabold text-emerald-600">{unassignedQty} Sets</span>
                          </div>
                        )}
                        
                        <div className="pt-1.5 border-t border-slate-200/60 pb-1.5">
                          <span className="text-factory-muted font-bold uppercase block mb-1">Components:</span>
                          <div className="grid grid-cols-2 gap-1">
                            {['Top', 'Pant', 'Top Aster', 'Pant Aster'].map(comp => {
                              const jobCardComponents = (jobCard?.components || '').split(',').map(c => c.trim());
                              const hasComp = jobCardComponents.includes(comp);
                              return (
                                <div key={comp} className="flex items-center gap-1">
                                  {hasComp ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Ban className="w-3.5 h-3.5 text-slate-400" />}
                                  <span className={hasComp ? 'text-factory-navy font-medium' : 'text-slate-400 line-through text-[10px]'}>{comp}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {activeAssignment && (
                          <div className="pt-2 border-t border-slate-200/60 space-y-2">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-factory-muted">Assigned Worker:</span>
                              <span className="font-bold text-brand-700">{activeAssignment.employee?.employee_name}</span>
                            </div>
                            
                            {/* Worker Progress */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-bold">
                                <span className="text-factory-muted">Progress</span>
                                <span className="text-brand-600">
                                  {Math.round((activeAssignment.completed_sets / activeAssignment.assigned_sets) * 100) || 0}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                <div
                                  className="h-full bg-brand-500 transition-all duration-300"
                                  style={{ width: `${Math.round((activeAssignment.completed_sets / activeAssignment.assigned_sets) * 100) || 0}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-[10px] pt-0.5">
                                <span className="font-medium text-emerald-600">
                                  {activeAssignment.completed_sets} / {activeAssignment.assigned_sets} Completed
                                </span>
                                <span className="font-medium text-amber-600">
                                  Remaining: {Math.max(0, activeAssignment.assigned_sets - activeAssignment.completed_sets)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {canManage && !isCompleted && (
                        <>
                          {activeAssignment ? (
                            <div className="flex flex-col gap-2">
                               {activeAssignment.status === 'ASSIGNED' && (
                                 <Button
                                    variant="primary"
                                    size="sm"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    icon={Clock}
                                    isLoading={startMutation.isPending}
                                    onClick={() => startMutation.mutate(activeAssignment.id)}
                                 >
                                   Start Work
                                 </Button>
                               )}
                               {activeAssignment.status === 'IN_PROGRESS' && (
                                 <Button
                                    variant="primary"
                                    size="sm"
                                    className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                                    icon={Layers}
                                    onClick={() => handleOpenProgressModal(activeAssignment)}
                                 >
                                   Update Progress
                                 </Button>
                               )}
                               {activeAssignment.status !== 'ASSIGNED' && activeAssignment.status !== 'IN_PROGRESS' && (
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   className="w-full"
                                   icon={Eye}
                                   onClick={() => handleOpenDetailsDrawer(activeAssignment)}
                                 >
                                   View Assignment
                                 </Button>
                               )}
                            </div>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              className="w-full"
                              icon={UserCheck}
                              onClick={() => handleOpenAssignModal(bnd)}
                            >
                              Assign Worker
                            </Button>
                          )}
                        </>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* ASSIGNMENT HISTORY AUDIT TABLE */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold text-factory-navy uppercase tracking-wider">
              Job Card Work Assignment History ({assignments.length})
            </h3>

            {assignments.length === 0 ? (
              <Card>
                <EmptyState
                  title="No Worker Assignments Created Yet"
                  description="Assign a bundle above to record work assignments for this Job Card."
                />
              </Card>
            ) : (
              <Card>
                <Table
                  headers={[
                    'Worker Name',
                    'Bundle #',
                    'Color / Size',
                    'Assigned Qty',
                    'Completed Qty',
                    'Stitching Rate',
                    'Status',
                    'Actions',
                  ]}
                >
                  {assignments.map((asgn) => {
                    const badgeInfo = statusBadgeConfig[asgn.status] || { variant: 'draft', label: asgn.status };
                    const isDone = asgn.status === 'COMPLETED' || asgn.status === 'CANCELLED';
                    const rate = asgn.stitching_rate || jobCard.stitching_rate || 110.0;

                    return (
                      <TableRow key={asgn.id}>
                        <TableCell className="font-extrabold text-factory-navy">
                          {asgn.employee?.employee_name} ({asgn.employee?.employee_code})
                        </TableCell>
                        <TableCell className="font-bold text-brand-600">
                          {asgn.bundle?.bundle_number}
                        </TableCell>
                        <TableCell className="font-bold text-factory-navy">
                          {asgn.bundle?.color} ({asgn.bundle?.size})
                        </TableCell>
                        <TableCell className="font-extrabold text-factory-navy">
                          {asgn.assigned_sets} pcs
                        </TableCell>
                        <TableCell className="font-extrabold text-emerald-600">
                          {asgn.completed_sets} pcs
                        </TableCell>
                        <TableCell className="font-bold text-emerald-700">
                          ₹{rate.toFixed(2)}/Pcs
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={badgeInfo.variant} label={badgeInfo.label} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenDetailsDrawer(asgn)}
                            >
                              View
                            </Button>

                            {canManage && !isDone && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenProgressModal(asgn)}
                                >
                                  Progress
                                </Button>
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={() => completeMutation.mutate(asgn.id)}
                                  isLoading={completeMutation.isPending}
                                >
                                  Done
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </Table>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        bundle={selectedBundle}
        isLoading={createMutation.isPending}
      />

      {/* Update Progress Modal */}
      <UpdateProgressModal
        isOpen={progressModalOpen}
        onClose={() => setProgressModalOpen(false)}
        onSubmit={(data) => progressMutation.mutate(data)}
        assignment={selectedAssignment}
        isLoading={progressMutation.isPending}
      />

      {/* Assignment Details Drawer */}
      <AssignmentDetailsDrawer
        isOpen={detailsDrawerOpen}
        onClose={() => setDetailsDrawerOpen(false)}
        assignment={selectedAssignment}
        onUpdateProgress={handleOpenProgressModal}
        onComplete={(item) => completeMutation.mutate(item.id)}
        onCancel={handleOpenCancelDialog}
        canManage={canManage}
      />

      {/* Cancel Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmCancelOpen}
        onClose={() => setConfirmCancelOpen(false)}
        onConfirm={() => assignmentToCancel && cancelMutation.mutate(assignmentToCancel.id)}
        title={`Cancel Assignment for ${assignmentToCancel?.employee?.employee_name}?`}
        message={`This action will cancel the assignment and restore ${assignmentToCancel?.assigned_sets} sets back to the bundle remaining queue.`}
        confirmText="Confirm Cancel"
        isDanger={true}
        isLoading={cancelMutation.isPending}
      />
    </div>
  );
};

export default JobCardAssignmentWorkspacePage;

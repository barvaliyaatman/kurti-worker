import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Filter, 
  Send, 
  Edit3, 
  Eye, 
  RefreshCw,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { jobCardService } from '../services/jobCardService.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Table, { TableRow, TableCell } from '../components/ui/Table.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import SearchBar from '../components/ui/SearchBar.jsx';
import CardList from '../components/ui/CardList.jsx';
import { CardSkeleton } from '../components/ui/LoadingSkeleton.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorComponent from '../components/common/ErrorComponent.jsx';
import ConfirmationDialog from '../components/ui/ConfirmationDialog.jsx';
import JobCardFormModal from '../components/jobCards/JobCardFormModal.jsx';
import JobCardDetailsDrawer from '../components/jobCards/JobCardDetailsDrawer.jsx';
import JobCardItemCard from '../components/jobCards/JobCardItemCard.jsx';

export const JobCardListPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const userRole = user?.role ? user.role.toUpperCase() : 'OWNER';
  const isOwner = userRole === 'OWNER';
  const canManage = isOwner || userRole === 'MANAGER';

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  // Modals & Drawers State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedCardForEdit, setSelectedCardForEdit] = useState(null);

  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [selectedCardForDetails, setSelectedCardForDetails] = useState(null);

  const [isSendCuttingDialogOpen, setIsSendCuttingDialogOpen] = useState(false);
  const [selectedCardForSend, setSelectedCardForSend] = useState(null);

  // Archive / Soft Delete Modal State
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [selectedCardForArchive, setSelectedCardForArchive] = useState(null);

  // Fetch Job Cards
  const {
    data = { jobCards: [], pagination: {} },
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['jobCards', { search, statusFilter, page }],
    queryFn: () =>
      jobCardService.getJobCards({
        search,
        status: statusFilter,
        page,
        limit: 50,
      }),
  });

  const jobCards = data.jobCards || [];

  // Automatically trigger Create Modal if URL has ?action=create query param
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'create' && canManage) {
      // Clear parameter to avoid opening modal repeatedly on subsequent renders
      window.history.replaceState({}, document.title, window.location.pathname);
      handleOpenAddModal();
    }
  }, [canManage]);


  // Create Job Card Mutation
  const createMutation = useMutation({
    mutationFn: (payload) => jobCardService.createJobCard(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['jobCards']);
      toast.success(res.message || 'Job Card created successfully!');
      setIsFormModalOpen(false);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to create Job Card');
    },
  });

  // Update Job Card Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => jobCardService.updateJobCard(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['jobCards']);
      toast.success(res.message || 'Job Card updated successfully!');
      setIsFormModalOpen(false);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to update Job Card');
    },
  });

  // Send to Cutting Mutation
  const sendToCuttingMutation = useMutation({
    mutationFn: (id) => jobCardService.sendToCutting(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['jobCards']);
      toast.success(res.message || 'Job Card sent to cutting queue!');
      setIsSendCuttingDialogOpen(false);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to send Job Card to cutting');
    },
  });

  // Soft Delete / Archive Mutation
  const archiveMutation = useMutation({
    mutationFn: (id) => jobCardService.deleteJobCard(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['jobCards']);
      queryClient.invalidateQueries(['archivedRecords']);
      toast.success(res.message || 'Job Card moved to Trash Archive!');
      setIsArchiveDialogOpen(false);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to archive Job Card');
      setIsArchiveDialogOpen(false);
    },
  });

  const handleOpenAddModal = () => {
    setSelectedCardForEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (card) => {
    setSelectedCardForEdit(card);
    setIsFormModalOpen(true);
  };

  const handleOpenDetailsDrawer = (card) => {
    setSelectedCardForDetails(card);
    setIsDetailsDrawerOpen(true);
  };

  const handleOpenSendDialog = (card) => {
    setSelectedCardForSend(card);
    setIsSendCuttingDialogOpen(true);
  };

  const handleOpenArchiveDialog = (card) => {
    if (card.status !== 'CREATED') {
      toast.error(`Job Card '${card.job_card_number}' has entered active production (${card.status}) and cannot be archived or deleted.`);
      return;
    }
    setSelectedCardForArchive(card);
    setIsArchiveDialogOpen(true);
  };

  const handleFormSubmit = (payload) => {
    if (selectedCardForEdit) {
      updateMutation.mutate({ id: selectedCardForEdit.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleConfirmSendCutting = () => {
    if (selectedCardForSend) {
      sendToCuttingMutation.mutate(selectedCardForSend.id);
    }
  };

  const handleConfirmArchive = () => {
    if (selectedCardForArchive) {
      archiveMutation.mutate(selectedCardForArchive.id);
    }
  };

  const statusBadgeConfig = {
    CREATED: { variant: 'draft', label: 'Created' },
    READY_FOR_CUTTING: { variant: 'ready', label: 'Ready For Cutting' },
    CUTTING_IN_PROGRESS: { variant: 'in_progress', label: 'Cutting In Progress' },
    CUTTING_COMPLETED: { variant: 'completed', label: 'Cutting Done' },
    COMPLETED: { variant: 'completed', label: 'Completed' },
    CANCELLED: { variant: 'inactive', label: 'Cancelled' },
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Create / Edit Form Modal */}
      <JobCardFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        jobCard={selectedCardForEdit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Details Drawer */}
      <JobCardDetailsDrawer
        isOpen={isDetailsDrawerOpen}
        onClose={() => setIsDetailsDrawerOpen(false)}
        jobCard={selectedCardForDetails}
        onSendToCutting={(card) => {
          setIsDetailsDrawerOpen(false);
          handleOpenSendDialog(card);
        }}
        onEdit={(card) => {
          setIsDetailsDrawerOpen(false);
          handleOpenEditModal(card);
        }}
        canManage={canManage}
      />

      {/* Send to Cutting Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isSendCuttingDialogOpen}
        onClose={() => setIsSendCuttingDialogOpen(false)}
        onConfirm={handleConfirmSendCutting}
        title="Send Job Card to Cutting Queue"
        message={`Are you sure you want to transition Job Card '${selectedCardForSend?.job_card_number}' to READY FOR CUTTING status?`}
        confirmText="Send to Cutting"
        cancelText="Cancel"
        variant="primary"
        isLoading={sendToCuttingMutation.isPending}
      />

      {/* Archive / Soft Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isArchiveDialogOpen}
        onClose={() => setIsArchiveDialogOpen(false)}
        onConfirm={handleConfirmArchive}
        title="Archive Job Card"
        message={`This action will archive Job Card '${selectedCardForArchive?.job_card_number}'. It can be restored later from Trash Archive.`}
        confirmText="Archive"
        cancelText="Cancel"
        variant="danger"
        isLoading={archiveMutation.isPending}
      />

      {/* Page Header */}
      <PageHeader
        title="Job Card Management"
        subtitle="Manage production orders, garment breakdown specs, and cutting status"
        action={
          <div className="flex items-center gap-2">
            {canManage && (
              <Button
                variant="primary"
                icon={Plus}
                onClick={handleOpenAddModal}
              >
                Create Job Card
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
            {['ALL', 'CREATED', 'READY_FOR_CUTTING', 'CUTTING_IN_PROGRESS', 'CUTTING_COMPLETED', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-factory-navy hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' && 'All Status'}
                {st === 'CREATED' && 'Created'}
                {st === 'READY_FOR_CUTTING' && 'Ready For Cutting'}
                {st === 'CUTTING_IN_PROGRESS' && 'Cutting In Progress'}
                {st === 'CUTTING_COMPLETED' && 'Cutting Done'}
                {st === 'COMPLETED' && 'Completed'}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* ERROR STATE */}
      {isError && (
        <ErrorComponent
          title="Failed to load Job Cards"
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
                title="No Job Cards Found"
                description={
                  search || statusFilter !== 'ALL'
                    ? 'No Job Cards match your search query or filter criteria.'
                    : 'Get started by creating your first production Job Card.'
                }
                action={
                  canManage ? (
                    <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
                      Create Job Card
                    </Button>
                  ) : null
                }
              />
            </Card>
          ) : (
            <>
              {/* Mobile Card List View (< lg) */}
              <div className="lg:hidden">
                <CardList>
                  {jobCards.map((card) => (
                    <JobCardItemCard
                      key={card.id}
                      jobCard={card}
                      onView={handleOpenDetailsDrawer}
                      onEdit={handleOpenEditModal}
                      onSendToCutting={handleOpenSendDialog}
                      onArchive={handleOpenArchiveDialog}
                      canManage={canManage}
                    />
                  ))}
                </CardList>
              </div>

              {/* Desktop Table View (lg+) */}
              <div className="hidden lg:block">
                <Card>
                  <Table
                    headers={[
                      'Job Card #',
                      'Design Code',
                      'Stitching Rate',
                      'Quantity',
                      'Priority',
                      'Due Date',
                      'Status',
                      'Actions',
                    ]}
                  >
                    {jobCards.map((card) => {
                      const badgeInfo = statusBadgeConfig[card.status] || { variant: 'draft', label: card.status };
                      const canSendCut = card.status === 'CREATED';

                      return (
                        <TableRow key={card.id}>
                          <TableCell className="font-extrabold text-factory-navy">
                            {card.job_card_number}
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded border border-brand-200 text-xs">
                              #{card.design_code}
                            </span>
                          </TableCell>
                          <TableCell className="font-bold text-emerald-600">
                            ₹{card.stitching_rate.toFixed(2)} / Pcs
                          </TableCell>
                          <TableCell className="font-extrabold text-factory-navy">
                            {card.total_quantity} Pcs
                          </TableCell>
                          <TableCell className="font-bold text-slate-700">
                            {card.priority}
                          </TableCell>
                          <TableCell>
                            {card.due_date ? new Date(card.due_date).toLocaleDateString('en-GB') : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={badgeInfo.variant} label={badgeInfo.label} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleOpenDetailsDrawer(card)}
                              >
                                View
                              </Button>

                              {canManage && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleOpenEditModal(card)}
                                  >
                                    Edit
                                  </Button>

                                  {canSendCut && (
                                    <Button
                                      size="sm"
                                      variant="primary"
                                      icon={Send}
                                      onClick={() => handleOpenSendDialog(card)}
                                    >
                                      Send to Cutting
                                    </Button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleOpenArchiveDialog(card)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Archive Job Card"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </Table>
                </Card>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default JobCardListPage;

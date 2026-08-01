import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Scissors, 
  Search, 
  Play, 
  Eye, 
  Layers, 
  Calendar, 
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { cuttingService } from '../services/cuttingService.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import SearchBar from '../components/ui/SearchBar.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Table, { TableRow, TableCell } from '../components/ui/Table.jsx';
import CardList from '../components/ui/CardList.jsx';
import { CardSkeleton } from '../components/ui/LoadingSkeleton.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorComponent from '../components/common/ErrorComponent.jsx';

export const CuttingListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isCuttingMaster = user?.role === 'CUTTING_MASTER' || user?.role === 'OWNER';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['cuttingQueue', { search, status: statusFilter }],
    queryFn: () =>
      cuttingService.getCuttingQueue({
        search,
        status: statusFilter,
      }),
  });

  const jobCards = data?.jobCards || [];

  // Start Cutting Mutation
  const startCuttingMutation = useMutation({
    mutationFn: cuttingService.startCutting,
    onSuccess: (res, jobCardId) => {
      queryClient.invalidateQueries(['cuttingQueue']);
      navigate(`/cutting/${jobCardId}`);
    },
  });

  const handleStartCutting = (jobCardId) => {
    startCuttingMutation.mutate(jobCardId);
  };

  const statusBadgeConfig = {
    READY_FOR_CUTTING: { variant: 'pending', label: 'Ready' },
    CUTTING_IN_PROGRESS: { variant: 'warning', label: 'In Progress' },
    CUTTING_COMPLETED: { variant: 'completed', label: 'Completed' },
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <PageHeader
        title="Cutting Management Queue"
        subtitle="Fabric cutting operations and component breakdown tracking"
      />

      {/* Search & Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder="Search by job card # or design code..."
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'All Queue' },
              { id: 'READY_FOR_CUTTING', label: 'Ready' },
              { id: 'CUTTING_IN_PROGRESS', label: 'In Progress' },
              { id: 'CUTTING_COMPLETED', label: 'Completed' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                  statusFilter === st.id
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-factory-navy hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* ERROR STATE */}
      {isError && (
        <ErrorComponent
          title="Failed to load cutting queue"
          message={error?.response?.data?.message || 'Server connection error'}
          onRetry={() => refetch()}
        />
      )}

      {/* SKELETON LOADING STATE */}
      {isLoading && !isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {/* CUTTING QUEUE DATA CONTENT */}
      {!isLoading && !isError && (
        <>
          {jobCards.length === 0 ? (
            <Card>
              <EmptyState
                title="No Cutting Job Cards Found"
                description={
                  search || statusFilter !== 'ALL'
                    ? 'No production job cards match your filter parameters.'
                    : 'Job cards sent by the Owner to cutting will appear in this ready queue.'
                }
              />
            </Card>
          ) : (
            <>
              {/* Mobile Card List View (< lg) */}
              <div className="lg:hidden">
                <CardList>
                  {jobCards.map((card) => {
                    const isReady = card.status === 'READY_FOR_CUTTING';
                    const badgeInfo = statusBadgeConfig[card.status] || { variant: 'draft', label: card.status };

                    return (
                      <Card key={card.id} hoverable className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-extrabold text-base text-factory-navy">
                              {card.job_card_number}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-semibold text-factory-muted">Design:</span>
                              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                                {card.design_code}
                              </span>
                            </div>
                          </div>

                          <StatusBadge
                            status={badgeInfo.variant}
                            label={badgeInfo.label}
                          />
                        </div>

                        <div className="py-2 border-t border-b border-slate-100 flex items-center justify-between text-xs text-factory-muted">
                          <span>Total: <strong className="text-factory-navy">{card.total_quantity} Pcs</strong></span>
                          <span>Priority: <strong className="text-amber-700">{card.priority}</strong></span>
                        </div>

                        <div className="pt-1 flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/cutting/${card.id}`)}
                          >
                            Workspace
                          </Button>

                          {isReady && isCuttingMaster && (
                            <Button
                              size="sm"
                              variant="primary"
                              icon={Play}
                              onClick={() => handleStartCutting(card.id)}
                              isLoading={startCuttingMutation.isPending}
                            >
                              Start
                            </Button>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </CardList>
              </div>

              {/* Desktop Table View (lg+) */}
              <div className="hidden lg:block">
                <Card>
                  <Table
                    headers={[
                      'Job Card #',
                      'Design Code',
                      'Total Quantity',
                      'Priority',
                      'Due Date',
                      'Status',
                      'Actions',
                    ]}
                  >
                    {jobCards.map((card) => {
                      const isReady = card.status === 'READY_FOR_CUTTING';
                      const badgeInfo = statusBadgeConfig[card.status] || { variant: 'draft', label: card.status };

                      return (
                        <TableRow key={card.id}>
                          <TableCell className="font-extrabold text-factory-navy">
                            {card.job_card_number}
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded border border-brand-200">
                              {card.design_code}
                            </span>
                          </TableCell>
                          <TableCell className="font-extrabold text-factory-navy">
                            {card.total_quantity} Pcs
                          </TableCell>
                          <TableCell>
                            <span className="text-[11px] font-extrabold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200 uppercase">
                              {card.priority}
                            </span>
                          </TableCell>
                          <TableCell>
                            {card.due_date ? new Date(card.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              status={badgeInfo.variant}
                              label={badgeInfo.label}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/cutting/${card.id}`)}
                              >
                                Workspace
                              </Button>

                              {isReady && isCuttingMaster && (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  icon={Play}
                                  onClick={() => handleStartCutting(card.id)}
                                  isLoading={startCuttingMutation.isPending}
                                >
                                  Start
                                </Button>
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

export default CuttingListPage;

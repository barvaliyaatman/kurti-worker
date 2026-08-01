import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PackageCheck, Search, Layers, Calendar, CheckCircle2 } from 'lucide-react';
import { cuttingService } from '../services/cuttingService.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import SearchBar from '../components/ui/SearchBar.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Table, { TableRow, TableCell } from '../components/ui/Table.jsx';
import CardList from '../components/ui/CardList.jsx';
import { CardSkeleton } from '../components/ui/LoadingSkeleton.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorComponent from '../components/common/ErrorComponent.jsx';

export const BundleListPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['bundles', { search, status: statusFilter }],
    queryFn: () => cuttingService.getBundles({ search, status: statusFilter }),
  });

  const bundles = data?.bundles || [];

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <PageHeader
        title="Production Bundles"
        subtitle="Completed cutting bundles ready for work assignment"
      />

      {/* Search & Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder="Search by bundle #, color, or job card..."
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'READY_FOR_ASSIGNMENT', 'IN_ASSIGNMENT', 'COMPLETED'].map((st) => (
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
          title="Failed to load production bundles"
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

      {/* BUNDLE LIST DATA CONTENT */}
      {!isLoading && !isError && (
        <>
          {bundles.length === 0 ? (
            <Card>
              <EmptyState
                title="No Production Bundles Generated Yet"
                description="Bundles will appear here automatically when the Cutting Master completes 100% of components for a color."
              />
            </Card>
          ) : (
            <>
              {/* Mobile Card List View (< lg) */}
              <div className="lg:hidden">
                <CardList>
                  {bundles.map((bnd) => (
                    <Card key={bnd.id} hoverable className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-extrabold text-base text-brand-600">
                            {bnd.bundle_number}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-semibold text-factory-muted">Job Card:</span>
                            <span className="text-xs font-bold text-factory-navy bg-slate-100 px-2 py-0.5 rounded">
                              {bnd.job_card?.job_card_number}
                            </span>
                          </div>
                        </div>

                        <StatusBadge
                          status="active"
                          label={bnd.status === 'READY_FOR_ASSIGNMENT' ? 'Ready For Assignment' : bnd.status}
                        />
                      </div>

                      <div className="py-2 border-t border-b border-slate-100 flex items-center justify-between text-xs text-factory-muted">
                        <span>Color: <strong className="text-factory-navy">{bnd.color}</strong></span>
                        <span>Total Sets: <strong className="text-emerald-600">{bnd.total_sets} Sets</strong></span>
                      </div>

                      <div className="text-right text-[11px] text-slate-400 font-medium">
                        Generated on {new Date(bnd.created_at).toLocaleDateString('en-GB')}
                      </div>
                    </Card>
                  ))}
                </CardList>
              </div>

              {/* Desktop Table View (lg+) */}
              <div className="hidden lg:block">
                <Card>
                  <Table
                    headers={[
                      'Bundle #',
                      'Job Card #',
                      'Design Code',
                      'Color',
                      'Total Sets',
                      'Status',
                      'Generated Date',
                    ]}
                  >
                    {bundles.map((bnd) => (
                      <TableRow key={bnd.id}>
                        <TableCell className="font-extrabold text-brand-600">
                          {bnd.bundle_number}
                        </TableCell>
                        <TableCell className="font-bold text-factory-navy">
                          {bnd.job_card?.job_card_number}
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded border border-brand-200">
                            {bnd.job_card?.design_code}
                          </span>
                        </TableCell>
                        <TableCell className="font-bold text-factory-navy">
                          {bnd.color}
                        </TableCell>
                        <TableCell>
                          <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                            {bnd.total_sets} Sets
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status="active"
                            label={bnd.status === 'READY_FOR_ASSIGNMENT' ? 'Ready For Assignment' : bnd.status}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(bnd.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </TableCell>
                      </TableRow>
                    ))}
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

export default BundleListPage;

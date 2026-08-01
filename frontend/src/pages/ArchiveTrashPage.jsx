import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
  Trash2, 
  RotateCcw, 
  FileText, 
  Users, 
  Package, 
  AlertTriangle, 
  ShieldAlert,
  Search,
  RefreshCw,
  Clock,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { archiveService } from '../services/archiveService.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import { CardSkeleton } from '../components/ui/LoadingSkeleton.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

export const ArchiveTrashPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isOwner = user?.role === 'OWNER';

  const [activeTab, setActiveTab] = useState('jobCards');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data = { jobCards: [], employees: [], bundles: [], totalArchived: 0 },
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['archivedRecords'],
    queryFn: archiveService.getArchivedRecords,
  });

  // Restore Mutation
  const restoreMutation = useMutation({
    mutationFn: ({ type, id }) => archiveService.restoreRecord(type, id),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['archivedRecords']);
      queryClient.invalidateQueries(['jobCards']);
      queryClient.invalidateQueries(['employees']);
      queryClient.invalidateQueries(['bundles']);
      toast.success(res.message || 'Record restored from Trash!');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to restore record');
    },
  });

  // Permanent Delete Mutation
  const permanentDeleteMutation = useMutation({
    mutationFn: ({ type, id }) => archiveService.permanentDeleteRecord(type, id),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['archivedRecords']);
      toast.success(res.message || 'Record permanently deleted');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to permanently delete record');
    },
  });

  const handleRestore = (type, id, name) => {
    if (window.confirm(`Restore '${name}' back to active system?`)) {
      restoreMutation.mutate({ type, id });
    }
  };

  const handlePermanentDelete = (type, id, name) => {
    if (window.confirm(`⚠️ PERMANENT DELETE WARNING:\n\nAre you sure you want to permanently purge '${name}' from database?\nThis action CANNOT be undone.`)) {
      permanentDeleteMutation.mutate({ type, id });
    }
  };

  // Filtering
  const filterList = (list, searchKey) => {
    if (!searchQuery.trim()) return list;
    const term = searchQuery.toLowerCase();
    return list.filter((item) => {
      const val = item[searchKey] || '';
      return val.toLowerCase().includes(term);
    });
  };

  const filteredJobCards = filterList(data.jobCards || [], 'job_card_number');
  const filteredEmployees = filterList(data.employees || [], 'employee_name');
  const filteredBundles = filterList(data.bundles || [], 'bundle_number');

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Safe Delete & Trash Archive"
        subtitle="Inspect, restore, or permanently purge soft-deleted factory records"
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            icon={RefreshCw}
          >
            Refresh Archive
          </Button>
        }
      />

      {/* Safety Notice Capsule */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3 shadow-2xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h4 className="font-extrabold text-amber-900">Enterprise Data Safety System Active</h4>
          <p className="text-amber-800">
            Soft-deleted Job Cards, Employees, and Bundles are preserved here in Trash Archive. Restoring returns them immediately to production workflows.
          </p>
        </div>
      </div>

      {isLoading ? (
        <CardSkeleton />
      ) : (
        <Card className="p-6 space-y-5">
          {/* TABS & SEARCH HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('jobCards')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'jobCards'
                    ? 'bg-[#384CF0] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Job Cards ({data.jobCards?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('employees')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'employees'
                    ? 'bg-[#384CF0] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Employees ({data.employees?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('bundles')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'bundles'
                    ? 'bg-[#384CF0] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-200 hover:bg-slate-200'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Bundles ({data.bundles?.length || 0})</span>
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search archived..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 focus:border-[#384CF0] outline-none"
              />
            </div>
          </div>

          {/* JOB CARDS ARCHIVE TAB */}
          {activeTab === 'jobCards' && (
            <div>
              {filteredJobCards.length === 0 ? (
                <EmptyState
                  title="No Archived Job Cards"
                  description="Trash is empty for Job Cards."
                />
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                        <th className="py-2.5 px-3">Job Card #</th>
                        <th className="py-2.5 px-3">Design Code</th>
                        <th className="py-2.5 px-3 text-center">Archived Date</th>
                        <th className="py-2.5 px-3 text-center">Deleted By</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                      {filteredJobCards.map((jc) => (
                        <tr key={jc.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-3 font-extrabold text-brand-600">{jc.job_card_number}</td>
                          <td className="py-2.5 px-3 text-slate-800">{jc.design_code}</td>
                          <td className="py-2.5 px-3 text-center text-slate-500">
                            {jc.deleted_at ? new Date(jc.deleted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Unknown'}
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-700">{jc.deleted_by || 'System'}</td>
                          <td className="py-2.5 px-3 text-right space-x-1">
                            <button
                              onClick={() => handleRestore('job_card', jc.id, jc.job_card_number)}
                              className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors inline-flex items-center gap-1"
                              title="Restore Record"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restore</span>
                            </button>

                            {isOwner && (
                              <button
                                onClick={() => handlePermanentDelete('job_card', jc.id, jc.job_card_number)}
                                className="px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 transition-colors inline-flex items-center gap-1"
                                title="Permanent Delete (Owner Only)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Purge</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* EMPLOYEES ARCHIVE TAB */}
          {activeTab === 'employees' && (
            <div>
              {filteredEmployees.length === 0 ? (
                <EmptyState
                  title="No Archived Employees"
                  description="Trash is empty for workers."
                />
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                        <th className="py-2.5 px-3">Worker Code</th>
                        <th className="py-2.5 px-3">Employee Name</th>
                        <th className="py-2.5 px-3">Phone</th>
                        <th className="py-2.5 px-3 text-center">Archived Date</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                      {filteredEmployees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-3 font-extrabold text-brand-600">{emp.employee_code}</td>
                          <td className="py-2.5 px-3 text-slate-800">{emp.employee_name}</td>
                          <td className="py-2.5 px-3 text-slate-600">{emp.phone}</td>
                          <td className="py-2.5 px-3 text-center text-slate-500">
                            {emp.deleted_at ? new Date(emp.deleted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Unknown'}
                          </td>
                          <td className="py-2.5 px-3 text-right space-x-1">
                            <button
                              onClick={() => handleRestore('employee', emp.id, emp.employee_name)}
                              className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors inline-flex items-center gap-1"
                              title="Restore Record"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restore</span>
                            </button>

                            {isOwner && (
                              <button
                                onClick={() => handlePermanentDelete('employee', emp.id, emp.employee_name)}
                                className="px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 transition-colors inline-flex items-center gap-1"
                                title="Permanent Delete (Owner Only)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Purge</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* BUNDLES ARCHIVE TAB */}
          {activeTab === 'bundles' && (
            <div>
              {filteredBundles.length === 0 ? (
                <EmptyState
                  title="No Archived Bundles"
                  description="Trash is empty for garment bundles."
                />
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                        <th className="py-2.5 px-3">Bundle #</th>
                        <th className="py-2.5 px-3">Job Card #</th>
                        <th className="py-2.5 px-3 text-center">Color / Size</th>
                        <th className="py-2.5 px-3 text-center">Total Sets</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                      {filteredBundles.map((bnd) => (
                        <tr key={bnd.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-3 font-extrabold text-brand-600">{bnd.bundle_number}</td>
                          <td className="py-2.5 px-3 text-slate-800">{bnd.job_card?.job_card_number || 'N/A'}</td>
                          <td className="py-2.5 px-3 text-center text-slate-700">{bnd.color} / {bnd.size}</td>
                          <td className="py-2.5 px-3 text-center font-bold">{bnd.total_sets} Sets</td>
                          <td className="py-2.5 px-3 text-right space-x-1">
                            <button
                              onClick={() => handleRestore('bundle', bnd.id, bnd.bundle_number)}
                              className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors inline-flex items-center gap-1"
                              title="Restore Record"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restore</span>
                            </button>

                            {isOwner && (
                              <button
                                onClick={() => handlePermanentDelete('bundle', bnd.id, bnd.bundle_number)}
                                className="px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 transition-colors inline-flex items-center gap-1"
                                title="Permanent Delete (Owner Only)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Purge</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default ArchiveTrashPage;

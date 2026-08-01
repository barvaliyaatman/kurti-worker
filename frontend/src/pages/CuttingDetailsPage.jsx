import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Scissors, 
  Layers, 
  Calendar, 
  CheckCircle2, 
  Play, 
  Package, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { cuttingService } from '../services/cuttingService.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Table, { TableRow, TableCell } from '../components/ui/Table.jsx';
import { CardSkeleton } from '../components/ui/LoadingSkeleton.jsx';
import ErrorComponent from '../components/common/ErrorComponent.jsx';
import ComponentCuttingCard from '../components/cutting/ComponentCuttingCard.jsx';

export const CuttingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isCuttingMaster = user?.role === 'CUTTING_MASTER';
  const isManagerOrOwner = ['OWNER', 'MANAGER'].includes(user?.role);
  const canOperate = isCuttingMaster || isManagerOrOwner;

  const [activeComponent, setActiveComponent] = useState(null);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['cuttingDetails', id],
    queryFn: () => cuttingService.getCuttingDetails(id),
  });

  const jobCard = data?.jobCard;
  const componentProgress = data?.component_progress || [];
  const progressPercentage = data?.progress_percentage || 0;
  const canGenerateBundles = data?.can_generate_bundles || false;
  const bundles = data?.bundles || [];

  const startCuttingMutation = useMutation({
    mutationFn: () => cuttingService.startCutting(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['cuttingDetails', id]);
      queryClient.invalidateQueries(['cuttingQueue']);
      toast.success(res?.message || 'Component cutting process started!');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to start cutting');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ component, status }) =>
      cuttingService.updateComponentStatus({ job_card_id: id, component, status }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['cuttingDetails', id]);
      queryClient.invalidateQueries(['cuttingQueue']);
      toast.success(res?.message || 'Component status updated successfully!');
      setActiveComponent(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to update component status');
      setActiveComponent(null);
    },
  });

  const generateBundlesMutation = useMutation({
    mutationFn: () => cuttingService.completeColorAndGenerateBundle({ job_card_id: id }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['cuttingDetails', id]);
      queryClient.invalidateQueries(['cuttingQueue']);
      queryClient.invalidateQueries(['bundles']);
      toast.success(res?.message || 'Color + Size Bundles generated successfully!');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to generate bundles');
    },
  });

  const handleUpdateComponent = (comp, status) => {
    setActiveComponent(comp);
    updateStatusMutation.mutate({ component: comp, status });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Navigation & Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/cutting')}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-factory-navy transition-colors"
          title="Back to Cutting Queue"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <PageHeader
          title={`Cutting Workspace: ${jobCard?.job_card_number || 'Loading...'}`}
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
          title="Failed to load cutting workspace"
          message={error?.response?.data?.message || 'Server connection error'}
          onRetry={() => refetch()}
        />
      )}

      {/* LOADING STATE */}
      {isLoading && !isError && <CardSkeleton />}

      {/* WORKSPACE CONTENT */}
      {!isLoading && !isError && jobCard && (
        <>
          {/* Header Specs Card */}
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
                      jobCard.status === 'CUTTING_COMPLETED'
                        ? 'completed'
                        : jobCard.status === 'CUTTING_IN_PROGRESS'
                        ? 'warning'
                        : 'active'
                    }
                    label={jobCard.status}
                  />
                </div>
                <p className="text-xs text-factory-muted mt-1">
                  Stitching Rate: <strong className="text-emerald-700 font-extrabold">₹{jobCard.stitching_rate.toFixed(2)}/Pcs</strong> | Order Quantity: <strong>{jobCard.total_quantity} Finished Pieces</strong>
                </p>
              </div>

              {/* Start Cutting Action */}
              {canOperate && jobCard.status === 'READY_FOR_CUTTING' && (
                <Button
                  variant="primary"
                  icon={Play}
                  onClick={() => startCuttingMutation.mutate()}
                  isLoading={startCuttingMutation.isPending}
                >
                  Start Cutting Batch
                </Button>
              )}
            </div>

            {/* Overall Component Progress Bar */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-factory-navy uppercase tracking-wider">
                  Component Batch Cutting Checklist ({componentProgress.filter((c) => c.status === 'COMPLETED').length} / {componentProgress.length} Done)
                </span>
                <span className="text-brand-600 font-extrabold">{progressPercentage}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </Card>

          {/* COMPONENT-WISE CUTTING CHECKLIST GRID */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-factory-navy uppercase tracking-wider">
              Component Batch Cutting Checklist
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {componentProgress.map((item) => (
                <ComponentCuttingCard
                  key={item.component}
                  component={item.component}
                  status={item.status}
                  onUpdateStatus={(comp, status) => handleUpdateComponent(comp, status)}
                  canOperate={canOperate && jobCard.status !== 'CREATED'}
                  isLoading={updateStatusMutation.isPending && activeComponent === item.component}
                />
              ))}
            </div>
          </div>

          {/* GENERATE BUNDLES SECTION */}
          {canOperate && (
            <Card className="p-5 bg-brand-50/60 border border-brand-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-extrabold text-sm text-brand-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-brand-600" />
                    <span>Color + Size Bundle Generator</span>
                  </h4>
                  <p className="text-xs text-brand-700 mt-0.5">
                    {canGenerateBundles
                      ? 'All components are 100% cut. Click to generate Color-wise & Size-wise production bundles.'
                      : 'Complete all component batch cutting checkboxes above to unlock bundle generation.'}
                  </p>
                </div>

                <Button
                  variant="primary"
                  icon={CheckCircle2}
                  disabled={!canGenerateBundles || jobCard.status === 'CUTTING_COMPLETED'}
                  onClick={() => generateBundlesMutation.mutate()}
                  isLoading={generateBundlesMutation.isPending}
                >
                  {jobCard.status === 'CUTTING_COMPLETED' ? 'Bundles Already Generated' : 'Generate Color + Size Bundles'}
                </Button>
              </div>
            </Card>
          )}

          {/* GENERATED BUNDLES AUDIT TABLE */}
          {bundles.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h3 className="text-xs font-bold text-factory-navy uppercase tracking-wider">
                Generated Production Bundles ({bundles.length})
              </h3>

              <Card>
                <Table
                  headers={[
                    'Bundle #',
                    'Color',
                    'Size',
                    'Total Quantity',
                    'Assigned Quantity',
                    'Status',
                  ]}
                >
                  {bundles.map((bnd) => (
                    <TableRow key={bnd.id}>
                      <TableCell className="font-extrabold text-brand-600">
                        {bnd.bundle_number}
                      </TableCell>
                      <TableCell className="font-bold text-factory-navy">
                        {bnd.color}
                      </TableCell>
                      <TableCell className="font-extrabold text-factory-navy">
                        {bnd.size}
                      </TableCell>
                      <TableCell className="font-extrabold text-emerald-600">
                        {bnd.total_sets} Sets
                      </TableCell>
                      <TableCell className="font-bold text-slate-700">
                        {bnd.assigned_sets || 0} / {bnd.total_sets} Sets
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={bnd.status === 'COMPLETED' ? 'completed' : 'active'} label={bnd.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </Table>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CuttingDetailsPage;

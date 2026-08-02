import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Calendar, 
  Banknote, 
  Layers, 
  CheckCircle2, 
  CreditCard, 
  Clock, 
  RefreshCw,
  Edit3,
  Plus,
  Package,
  TrendingUp,
  Power,
  Trash2
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth.js';
import { employeeWorkspaceService } from '../services/employeeWorkspaceService.js';
import { assignmentService } from '../services/assignmentService.js';
import { employeeService } from '../services/employeeService.js';

import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { CardSkeleton } from '../components/ui/LoadingSkeleton.jsx';
import ErrorComponent from '../components/common/ErrorComponent.jsx';
import ConfirmationDialog from '../components/ui/ConfirmationDialog.jsx';


import CurrentWorkTab from '../components/employeeWorkspace/CurrentWorkTab.jsx';
import CompletedWorkTab from '../components/employeeWorkspace/CompletedWorkTab.jsx';
import SalaryTab from '../components/employeeWorkspace/SalaryTab.jsx';
import AdvanceTab from '../components/employeeWorkspace/AdvanceTab.jsx';
import PaymentsTab from '../components/employeeWorkspace/PaymentsTab.jsx';
import TimelineTab from '../components/employeeWorkspace/TimelineTab.jsx';

import AddAdvanceModal from '../components/employeeWorkspace/AddAdvanceModal.jsx';
import AddPaymentModal from '../components/employeeWorkspace/AddPaymentModal.jsx';
import UpdateProgressModal from '../components/assignments/UpdateProgressModal.jsx';
import EmployeeFormModal from '../components/employees/EmployeeFormModal.jsx';

const TABS = [
  { id: 'current', label: 'Current Work', icon: Layers },
  { id: 'completed', label: 'Completed Work', icon: CheckCircle2 },
  { id: 'salary', label: 'Salary', icon: Banknote },
  { id: 'advance', label: 'Advance', icon: CreditCard },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'timeline', label: 'Timeline', icon: Clock },
];

export const EmployeeWorkspacePage = () => {
  const { employeeId: id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isManagerOrOwner = user?.role === 'MANAGER' || user?.role === 'OWNER';
  const canManage = isManagerOrOwner;

  const [activeTab, setActiveTab] = useState('current');

  // Modal states
  const [advanceModalOpen, setAdvanceModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [editEmployeeModalOpen, setEditEmployeeModalOpen] = useState(false);
  const [isConfirmToggleOpen, setIsConfirmToggleOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);


  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Fetch consolidated workspace data
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['employeeWorkspace', id],
    queryFn: () => employeeWorkspaceService.getWorkspace(id),
  });

  const employee = data?.employee;
  const currentWorkingBundle = data?.current_working_bundle;
  const summary = data?.summary || {};
  const activeAssignments = data?.active_assignments || [];
  const completedAssignments = data?.completed_assignments || [];
  const advances = data?.advances || [];
  const payments = data?.payments || [];
  const timeline = data?.timeline || [];

  // Create Advance Mutation
  const advanceMutation = useMutation({
    mutationFn: (advanceData) => employeeWorkspaceService.createAdvance(id, advanceData),
    onSuccess: () => {
      queryClient.invalidateQueries(['employeeWorkspace', id]);
      setAdvanceModalOpen(false);
    },
  });

  // Create Payment Mutation
  const paymentMutation = useMutation({
    mutationFn: (paymentData) => employeeWorkspaceService.createPayment(id, paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries(['employeeWorkspace', id]);
      setPaymentModalOpen(false);
    },
  });

  // Update Progress Mutation
  const progressMutation = useMutation({
    mutationFn: ({ id: asgnId, completed_sets, notes }) =>
      assignmentService.updateProgress(asgnId, { completed_sets, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries(['employeeWorkspace', id]);
      setProgressModalOpen(false);
      setSelectedAssignment(null);
    },
  });

  // Update Employee Mutation
  const updateEmployeeMutation = useMutation({
    mutationFn: (empData) => employeeService.updateEmployee(id, empData),
    onSuccess: () => {
      queryClient.invalidateQueries(['employeeWorkspace', id]);
      setEditEmployeeModalOpen(false);
      toast.success('Worker details updated successfully!');
    },
  });

  // Toggle Employee Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id: empId, status: nextStatus }) => employeeService.toggleEmployeeStatus(empId, nextStatus),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['employeeWorkspace', id]);
      queryClient.invalidateQueries(['employees']);
      toast.success(res.message || 'Worker status updated!');
      setIsConfirmToggleOpen(false);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to toggle status');
    },
  });

  // Archive / Soft Delete Employee Mutation
  const archiveMutation = useMutation({
    mutationFn: (empId) => employeeService.deleteEmployee(empId),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['employees']);
      queryClient.invalidateQueries(['archivedRecords']);
      toast.success(res.message || 'Worker moved to Trash Archive!');
      setIsArchiveDialogOpen(false);
      navigate('/employees');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to archive worker');
      setIsArchiveDialogOpen(false);
    },
  });

  const handleOpenConfirmToggle = () => {
    setIsConfirmToggleOpen(true);
  };

  const handleOpenArchiveDialog = () => {
    const assignmentCount = employee?._count?.assignments || activeAssignments.length + completedAssignments.length;
    if (assignmentCount > 0) {
      toast.error(`Employee '${employee?.employee_name}' has ${assignmentCount} production assignment history records and cannot be deleted. You may only Deactivate this employee.`);
      return;
    }
    setIsArchiveDialogOpen(true);
  };

  const handleConfirmToggle = () => {
    if (employee) {
      const nextStatus = employee.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      toggleStatusMutation.mutate({ id: employee.id, status: nextStatus });
    }
  };

  const handleConfirmArchive = () => {
    if (employee) {
      archiveMutation.mutate(employee.id);
    }
  };


  const handleOpenProgressModal = (asgn) => {
    setSelectedAssignment(asgn);
    setProgressModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header & Back Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/employees')}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-factory-navy transition-colors"
          title="Back to Employee List"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <PageHeader
          title={`Employee Workspace: ${employee?.employee_name || 'Loading...'}`}
          subtitle={`Worker ID: ${employee?.employee_code || '—'}`}
          action={
            <div className="flex items-center gap-2">
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
      </div>

      {/* ERROR STATE */}
      {isError && (
        <ErrorComponent
          title="Failed to load employee workspace"
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
      {!isLoading && !isError && employee && (
        <>
          {/* Employee Header Profile Card */}
          <Card className="p-5 space-y-4 border border-factory-border">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar name={employee.employee_name} size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-extrabold text-factory-navy">
                      {employee.employee_name}
                    </h2>
                    <StatusBadge
                      status={employee.status === 'ACTIVE' ? 'active' : 'inactive'}
                      label={employee.status}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs">
                    <span className="font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded border border-brand-200">
                      {employee.employee_code}
                    </span>
                    <span className="text-factory-muted">•</span>
                    <span className="font-semibold text-factory-navy">Phone: {employee.phone}</span>
                    <span className="text-factory-muted">•</span>
                    <span className="font-semibold text-factory-navy">
                      Joined: {employee.joining_date ? new Date(employee.joining_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Working Bundle Card */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3 text-xs">
                <Package className="w-6 h-6 text-brand-600 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-factory-muted uppercase tracking-wider block">
                    Current Working Bundle
                  </span>
                  {currentWorkingBundle ? (
                    <span className="font-extrabold text-factory-navy block">
                      Bundle #{currentWorkingBundle.bundle_number} | Job Card: {currentWorkingBundle.job_card_number} (#{currentWorkingBundle.design_code})
                    </span>
                  ) : (
                    <span className="font-semibold text-slate-500 italic block">
                      No active bundle currently in progress
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Actions Button Bar */}
              {canManage && (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Edit3}
                    onClick={() => setEditEmployeeModalOpen(true)}
                  >
                    Edit Worker
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={employee.status === 'ACTIVE' ? Power : CheckCircle2}
                    onClick={handleOpenConfirmToggle}
                    className={employee.status === 'ACTIVE' ? 'text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border-red-200' : 'text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'}
                  >
                    {employee.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Trash2}
                    onClick={handleOpenArchiveDialog}
                    className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={CreditCard}
                    onClick={() => setAdvanceModalOpen(true)}
                  >
                    Add Advance
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    icon={Banknote}
                    onClick={() => setPaymentModalOpen(true)}
                  >
                    Pay Salary
                  </Button>
                </div>
              )}

            </div>
          </Card>

          {/* Sticky Summary Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
              <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
                Active Bundles
              </span>
              <span className="text-xl font-extrabold text-brand-600 block">
                {summary.active_bundles_count || 0}
              </span>
            </div>

            <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
              <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
                Completed Bundles
              </span>
              <span className="text-xl font-extrabold text-emerald-600 block">
                {summary.completed_bundles_count || 0}
              </span>
            </div>

            <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
              <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
                Pending Pieces
              </span>
              <span className="text-xl font-extrabold text-amber-700 block">
                {summary.pending_pieces || 0} Pcs
              </span>
            </div>

            <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
              <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
                Today's Completed
              </span>
              <span className="text-xl font-extrabold text-emerald-700 block">
                {summary.today_completed_pieces || 0} Pcs
              </span>
            </div>

            <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
              <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
                This Month Completed
              </span>
              <span className="text-xl font-extrabold text-emerald-800 block">
                {summary.month_completed_pieces || 0} Pcs
              </span>
            </div>

            <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
              <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
                Gross Earned Salary
              </span>
              <span className="text-xl font-extrabold text-emerald-600 block">
                ₹{(summary.gross_salary || 0).toFixed(2)}
              </span>
            </div>

            <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
              <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
                Advance Balance
              </span>
              <span className="text-xl font-extrabold text-amber-700 block">
                ₹{(summary.advance_balance || 0).toFixed(2)}
              </span>
            </div>

            <div className="p-3.5 bg-brand-50 border border-brand-200 rounded-2xl space-y-1 shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-brand-900 uppercase tracking-wider block">
                Net Pending Payable
              </span>
              <span className="text-xl font-extrabold text-brand-600 block">
                ₹{(summary.net_payable || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* 6 Tab Navigation Bar */}
          <div className="border-b border-slate-200 overflow-x-auto">
            <div className="flex items-center gap-1 min-w-max pb-1">
              {TABS.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'bg-slate-100 text-factory-navy hover:bg-slate-200'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Tab Panel Render */}
          <div className="pt-2">
            {activeTab === 'current' && (
              <CurrentWorkTab
                assignments={activeAssignments}
                onUpdateProgress={handleOpenProgressModal}
                canManage={canManage}
              />
            )}
            {activeTab === 'completed' && (
              <CompletedWorkTab assignments={completedAssignments} />
            )}
            {activeTab === 'salary' && (
              <SalaryTab
                summary={summary}
                employee={employee}
                onAddAdvance={() => setAdvanceModalOpen(true)}
                onPaySalary={() => setPaymentModalOpen(true)}
                canManage={canManage}
              />
            )}
            {activeTab === 'advance' && (
              <AdvanceTab
                advances={advances}
                onAddAdvance={() => setAdvanceModalOpen(true)}
                canManage={canManage}
              />
            )}
            {activeTab === 'payments' && (
              <PaymentsTab
                payments={payments}
                onPaySalary={() => setPaymentModalOpen(true)}
                canManage={canManage}
              />
            )}
            {activeTab === 'timeline' && <TimelineTab timeline={timeline} />}
          </div>
        </>
      )}

      {/* Add Advance Modal */}
      <AddAdvanceModal
        isOpen={advanceModalOpen}
        onClose={() => setAdvanceModalOpen(false)}
        onSubmit={(data) => advanceMutation.mutate(data)}
        employee={employee}
        isLoading={advanceMutation.isPending}
      />

      {/* Add Payment Modal */}
      <AddPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSubmit={(data) => paymentMutation.mutate(data)}
        employee={employee}
        summary={summary}
        isLoading={paymentMutation.isPending}
      />

      {/* Update Progress Modal */}
      <UpdateProgressModal
        isOpen={progressModalOpen}
        onClose={() => setProgressModalOpen(false)}
        onSubmit={(data) => progressMutation.mutate(data)}
        assignment={selectedAssignment}
        isLoading={progressMutation.isPending}
      />

      {/* Edit Employee Modal */}
      <EmployeeFormModal
        isOpen={editEmployeeModalOpen}
        onClose={() => setEditEmployeeModalOpen(false)}
        onSubmit={(data) => updateEmployeeMutation.mutate(data)}
        employee={employee}
        isLoading={updateEmployeeMutation.isPending}
      />

      {/* Status Toggle Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmToggleOpen}
        onClose={() => setIsConfirmToggleOpen(false)}
        onConfirm={handleConfirmToggle}
        title={employee?.status === 'ACTIVE' ? 'Deactivate Employee' : 'Activate Employee'}
        message={`Are you sure you want to ${employee?.status === 'ACTIVE' ? 'deactivate' : 'activate'} '${employee?.employee_name}'?`}
        confirmText={employee?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        cancelText="Cancel"
        variant={employee?.status === 'ACTIVE' ? 'danger' : 'primary'}
        isLoading={toggleStatusMutation.isPending}
      />

      {/* Archive / Soft Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isArchiveDialogOpen}
        onClose={() => setIsArchiveDialogOpen(false)}
        onConfirm={handleConfirmArchive}
        title="Archive Employee"
        message={`This action will archive worker '${employee?.employee_name}'. It can be restored later from Trash Archive.`}
        confirmText="Archive"
        cancelText="Cancel"
        variant="danger"
        isLoading={archiveMutation.isPending}
      />
    </div>
  );
};

export default EmployeeWorkspacePage;


import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Users, 
  Power, 
  Edit3, 
  LayoutDashboard, 
  RefreshCw,
  Phone,
  Calendar,
  Sparkles,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { employeeService } from '../services/employeeService.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Table, { TableRow, TableCell } from '../components/ui/Table.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import SearchBar from '../components/ui/SearchBar.jsx';
import CardList from '../components/ui/CardList.jsx';
import { CardSkeleton } from '../components/ui/LoadingSkeleton.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorComponent from '../components/common/ErrorComponent.jsx';
import ConfirmationDialog from '../components/ui/ConfirmationDialog.jsx';
import EmployeeFormModal from '../components/employees/EmployeeFormModal.jsx';
import EmployeeCard from '../components/employees/EmployeeCard.jsx';

export const EmployeeListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const userRole = user?.role ? user.role.toUpperCase() : 'OWNER';
  const isOwner = userRole === 'OWNER';
  const canManage = isOwner || userRole === 'MANAGER';

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  // Modals & Confirmation State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedEmpForEdit, setSelectedEmpForEdit] = useState(null);

  const [isConfirmToggleOpen, setIsConfirmToggleOpen] = useState(false);
  const [selectedEmpForToggle, setSelectedEmpForToggle] = useState(null);

  // Archive / Soft Delete Modal State
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [selectedEmpForArchive, setSelectedEmpForArchive] = useState(null);

  // Fetch Employees
  const {
    data = { employees: [], pagination: {} },
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['employees', { search, statusFilter, page }],
    queryFn: () =>
      employeeService.getEmployees({
        search,
        status: statusFilter,
        page,
        limit: 50,
      }),
  });

  const employees = data.employees || [];

  // Create Employee Mutation
  const createMutation = useMutation({
    mutationFn: (payload) => employeeService.createEmployee(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['employees']);
      toast.success(res.message || 'Worker registered successfully!');
      setIsFormModalOpen(false);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to create worker');
    },
  });

  // Update Employee Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => employeeService.updateEmployee(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['employees']);
      toast.success(res.message || 'Worker details updated successfully!');
      setIsFormModalOpen(false);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to update worker');
    },
  });

  // Toggle Employee Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }) => employeeService.toggleEmployeeStatus(id, status),
    onSuccess: (res) => {
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
    mutationFn: (id) => employeeService.deleteEmployee(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['employees']);
      queryClient.invalidateQueries(['archivedRecords']);
      toast.success(res.message || 'Worker moved to Trash Archive!');
      setIsArchiveDialogOpen(false);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to archive worker');
      setIsArchiveDialogOpen(false);
    },
  });

  const handleOpenAddModal = () => {
    setSelectedEmpForEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (emp) => {
    setSelectedEmpForEdit(emp);
    setIsFormModalOpen(true);
  };

  const handleOpenConfirmToggle = (emp) => {
    setSelectedEmpForToggle(emp);
    setIsConfirmToggleOpen(true);
  };

  const handleOpenArchiveDialog = (emp) => {
    const assignmentCount = emp._count?.assignments || 0;
    if (assignmentCount > 0) {
      toast.error(`Employee '${emp.employee_name}' has ${assignmentCount} production assignment history records and cannot be deleted. You may only Deactivate this employee.`);
      return;
    }
    setSelectedEmpForArchive(emp);
    setIsArchiveDialogOpen(true);
  };

  const handleFormSubmit = (payload) => {
    if (selectedEmpForEdit) {
      updateMutation.mutate({ id: selectedEmpForEdit.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleConfirmToggle = () => {
    if (selectedEmpForToggle) {
      const nextStatus = selectedEmpForToggle.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      toggleStatusMutation.mutate({ id: selectedEmpForToggle.id, status: nextStatus });
    }
  };

  const handleConfirmArchive = () => {
    if (selectedEmpForArchive) {
      archiveMutation.mutate(selectedEmpForArchive.id);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Create / Edit Form Modal */}
      <EmployeeFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        employee={selectedEmpForEdit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Status Toggle Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmToggleOpen}
        onClose={() => setIsConfirmToggleOpen(false)}
        onConfirm={handleConfirmToggle}
        title={selectedEmpForToggle?.status === 'ACTIVE' ? 'Deactivate Employee' : 'Activate Employee'}
        message={`Are you sure you want to ${selectedEmpForToggle?.status === 'ACTIVE' ? 'deactivate' : 'activate'} '${selectedEmpForToggle?.employee_name}'?`}
        confirmText={selectedEmpForToggle?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        cancelText="Cancel"
        variant={selectedEmpForToggle?.status === 'ACTIVE' ? 'danger' : 'primary'}
        isLoading={toggleStatusMutation.isPending}
      />

      {/* Archive / Soft Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isArchiveDialogOpen}
        onClose={() => setIsArchiveDialogOpen(false)}
        onConfirm={handleConfirmArchive}
        title="Archive Employee"
        message={`This action will archive worker '${selectedEmpForArchive?.employee_name}'. It can be restored later from Trash Archive.`}
        confirmText="Archive"
        cancelText="Cancel"
        variant="danger"
        isLoading={archiveMutation.isPending}
      />

      {/* Page Header */}
      <PageHeader
        title="Employees Master"
        subtitle="Manage factory worker ledger, piece rates, and active workforce status"
        action={
          <div className="flex items-center gap-2">
            {canManage && (
              <Button
                variant="primary"
                icon={Plus}
                onClick={handleOpenAddModal}
              >
                Add Employee
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
              placeholder="Search by name, employee code, or phone number..."
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'ACTIVE', 'INACTIVE'].map((st) => (
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
                {st === 'ACTIVE' && 'Active Workers'}
                {st === 'INACTIVE' && 'Inactive'}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* ERROR STATE */}
      {isError && (
        <ErrorComponent
          title="Failed to load Employees"
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
          {employees.length === 0 ? (
            <Card>
              <EmptyState
                title="No Employees Found"
                description={
                  search || statusFilter !== 'ALL'
                    ? 'No workers match your search query or status filter.'
                    : 'Get started by adding your first factory employee.'
                }
                action={
                  canManage ? (
                    <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
                      Add Employee
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
                  {employees.map((emp) => (
                    <EmployeeCard
                      key={emp.id}
                      employee={emp}
                      onOpenWorkspace={(e) => navigate(`/employees/${e.id}/workspace`)}
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
                      'Employee',
                      'Code',
                      'Phone',
                      'Joining Date',
                      'Status',
                      'Actions',
                    ]}
                  >
                    {employees.map((emp) => {
                      const isActive = emp.status === 'ACTIVE';

                      return (
                        <TableRow key={emp.id}>
                          <TableCell className="font-extrabold text-factory-navy">
                            <div className="flex items-center gap-3">
                              <Avatar name={emp.employee_name} size="sm" />
                              <span>{emp.employee_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded border border-brand-200 text-xs">
                              {emp.employee_code}
                            </span>
                          </TableCell>
                          <TableCell className="font-semibold text-slate-700">
                            {emp.phone}
                          </TableCell>
                          <TableCell>
                            {emp.joining_date ? new Date(emp.joining_date).toLocaleDateString('en-GB') : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={isActive ? 'active' : 'inactive'} label={emp.status} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                icon={LayoutDashboard}
                                onClick={() => navigate(`/employees/${emp.id}/workspace`)}
                              >
                                Workspace
                              </Button>

                              {canManage && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleOpenEditModal(emp)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={isActive ? 'danger' : 'secondary'}
                                    icon={Power}
                                    onClick={() => handleOpenConfirmToggle(emp)}
                                  >
                                    {isActive ? 'Deactivate' : 'Activate'}
                                  </Button>

                                  <button
                                    type="button"
                                    onClick={() => handleOpenArchiveDialog(emp)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Archive Employee"
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

export default EmployeeListPage;

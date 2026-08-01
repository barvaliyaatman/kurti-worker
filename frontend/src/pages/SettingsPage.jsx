import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
  Building2, 
  Factory, 
  Users, 
  FileText, 
  Package, 
  Banknote, 
  Bell, 
  ShieldCheck, 
  Database, 
  Save, 
  Download, 
  RefreshCw,
  Search,
  RotateCcw,
  Sliders,
  Hash,
  Palette,
  Ruler,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useConfig } from '../contexts/ConfigContext.jsx';
import { settingService } from '../services/settingService.js';
import { garmentSizeService } from '../services/garmentSizeService.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { CardSkeleton } from '../components/ui/LoadingSkeleton.jsx';
import GarmentSizeFormModal from '../components/settings/GarmentSizeFormModal.jsx';

const ENTERPRISE_CATEGORIES = [
  { id: 'company', label: '1. Company Settings', icon: Building2 },
  { id: 'factory', label: '2. Factory Settings', icon: Factory },
  { id: 'employee', label: '3. Employee Settings', icon: Users },
  { id: 'job_card', label: '4. Job Card Settings', icon: FileText },
  { id: 'bundle', label: '5. Bundle Settings', icon: Package },
  { id: 'salary', label: '6. Salary Settings', icon: Banknote },
  { id: 'notification', label: '7. Notification Settings', icon: Bell },
  { id: 'garment_sizes', label: '8. Garment Sizes Master', icon: Ruler },
  { id: 'preferences', label: '9. App Preferences', icon: Palette },
  { id: 'number_series', label: '10. Number Series', icon: Hash },
  { id: 'defaults', label: '11. Default Values', icon: Sliders },
  { id: 'roles', label: 'Role & Permissions', icon: ShieldCheck },
  { id: 'backup', label: 'Backup & System Info', icon: Database },
];

export const SettingsPage = () => {
  const { user } = useAuth();
  const { refetchConfig } = useConfig();
  const queryClient = useQueryClient();

  const isOwner = user?.role === 'OWNER';
  const canManage = isOwner;

  const [activeCategory, setActiveCategory] = useState('company');
  const [searchQuery, setSearchQuery] = useState('');

  // Garment Size Modal State
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [selectedSizeObj, setSelectedSizeObj] = useState(null);

  // Fetch System Settings
  const {
    data: settingsData = { settings: {}, categories: {} },
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: settingService.getSettings,
  });

  // Fetch Garment Sizes Master
  const {
    data: garmentSizesList = [],
    isLoading: isLoadingSizes,
    refetch: refetchSizesList,
  } = useQuery({
    queryKey: ['allGarmentSizes'],
    queryFn: () => garmentSizeService.getGarmentSizes(false),
  });

  const { data: roleMatrix = {} } = useQuery({
    queryKey: ['rolePermissions'],
    queryFn: settingService.getRolePermissions,
  });

  const [formData, setFormData] = useState({});

  // Local sync
  const currentSettings = {
    ...settingsData.settings,
    ...formData,
  };

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Update Settings Mutation
  const updateMutation = useMutation({
    mutationFn: (newSettingsMap) => settingService.updateSettings(newSettingsMap),
    onSuccess: () => {
      queryClient.invalidateQueries(['systemSettings']);
      refetchConfig();
      toast.success('System settings saved successfully!');
      setFormData({});
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to update settings');
    },
  });

  // Reset Settings Mutation
  const resetMutation = useMutation({
    mutationFn: () => settingService.resetSettings(),
    onSuccess: () => {
      queryClient.invalidateQueries(['systemSettings']);
      refetchConfig();
      toast.success('System settings reset to default factory values!');
      setFormData({});
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to reset settings');
    },
  });

  // Garment Size Mutations
  const createSizeMutation = useMutation({
    mutationFn: (sizeData) => garmentSizeService.createGarmentSize(sizeData),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['allGarmentSizes']);
      queryClient.invalidateQueries(['activeGarmentSizes']);
      refetchConfig();
      toast.success(res.message || 'Garment size created!');
      setIsSizeModalOpen(false);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to create size');
    },
  });

  const updateSizeMutation = useMutation({
    mutationFn: ({ id, data }) => garmentSizeService.updateGarmentSize(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['allGarmentSizes']);
      queryClient.invalidateQueries(['activeGarmentSizes']);
      refetchConfig();
      toast.success(res.message || 'Garment size updated!');
      setIsSizeModalOpen(false);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to update size');
    },
  });

  const deleteSizeMutation = useMutation({
    mutationFn: (id) => garmentSizeService.deleteGarmentSize(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['allGarmentSizes']);
      queryClient.invalidateQueries(['activeGarmentSizes']);
      refetchConfig();
      toast.success(res.message || 'Garment size deleted!');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to delete size');
    },
  });

  const handleSave = () => {
    updateMutation.mutate(currentSettings);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to factory default configurations?')) {
      resetMutation.mutate();
    }
  };

  const handleOpenAddSize = () => {
    setSelectedSizeObj(null);
    setIsSizeModalOpen(true);
  };

  const handleOpenEditSize = (sizeObj) => {
    setSelectedSizeObj(sizeObj);
    setIsSizeModalOpen(true);
  };

  const handleToggleSizeActive = (sizeObj) => {
    updateSizeMutation.mutate({
      id: sizeObj.id,
      data: { is_active: !sizeObj.is_active },
    });
  };

  const handleDeleteSize = (sizeObj) => {
    if (window.confirm(`Delete size '${sizeObj.size_name}' from catalog?`)) {
      deleteSizeMutation.mutate(sizeObj.id);
    }
  };

  const handleSaveSizeForm = (payload) => {
    if (selectedSizeObj) {
      updateSizeMutation.mutate({ id: selectedSizeObj.id, data: payload });
    } else {
      createSizeMutation.mutate(payload);
    }
  };

  const filteredCategories = ENTERPRISE_CATEGORIES.filter((cat) =>
    cat.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      <GarmentSizeFormModal
        isOpen={isSizeModalOpen}
        onClose={() => setIsSizeModalOpen(false)}
        onSubmit={handleSaveSizeForm}
        sizeObj={selectedSizeObj}
        isLoading={createSizeMutation.isPending || updateSizeMutation.isPending}
      />

      {/* Page Header */}
      <PageHeader
        title="Dynamic Configuration Engine"
        subtitle="Enterprise settings driving numbering series, rates, garment size catalog, and module workflows"
        action={
          <div className="flex items-center gap-2">
            {canManage && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  icon={RotateCcw}
                  onClick={handleReset}
                  isLoading={resetMutation.isPending}
                >
                  Reset Defaults
                </Button>
                <Button
                  variant="primary"
                  icon={Save}
                  onClick={handleSave}
                  isLoading={updateMutation.isPending}
                >
                  Save Settings
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                refetch();
                refetchSizesList();
              }}
              isLoading={isFetching}
              icon={RefreshCw}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <CardSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* CATEGORIES SIDEBAR */}
          <div className="space-y-3 lg:col-span-1">
            {/* Search Settings Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:border-brand-600 outline-none"
              />
            </div>

            <Card className="p-2 space-y-1 h-fit border border-factory-border">
              {filteredCategories.map((cat) => {
                const IconComponent = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'text-factory-navy hover:bg-slate-100'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </Card>
          </div>

          {/* FORM CONTENT */}
          <div className="lg:col-span-3 space-y-6">
            {/* 1. COMPANY SETTINGS */}
            {activeCategory === 'company' && (
              <Card className="p-6 space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-extrabold text-factory-navy uppercase tracking-wider">
                    Company Settings
                  </h3>
                  <p className="text-xs text-factory-muted">
                    Dynamic company information displayed on dashboards, reports, PDFs, and headers
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Company Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-600 outline-none"
                      value={currentSettings.company_name || ''}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Factory Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-600 outline-none"
                      value={currentSettings.factory_name || ''}
                      onChange={(e) => handleInputChange('factory_name', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">GST Number</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-600 outline-none"
                      value={currentSettings.gst_number || ''}
                      onChange={(e) => handleInputChange('gst_number', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Currency</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-600 outline-none"
                      value={currentSettings.currency || '₹ INR'}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* 2. FACTORY SETTINGS */}
            {activeCategory === 'factory' && (
              <Card className="p-6 space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-extrabold text-factory-navy uppercase tracking-wider">
                    Factory Settings
                  </h3>
                  <p className="text-xs text-factory-muted">Shift timings, working hours, and operational schedules</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Factory Working Hours</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-600 outline-none"
                      value={currentSettings.working_hours || ''}
                      onChange={(e) => handleInputChange('working_hours', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Working Days</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-600 outline-none"
                      value={currentSettings.working_days || ''}
                      onChange={(e) => handleInputChange('working_days', e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* 3. EMPLOYEE SETTINGS */}
            {activeCategory === 'employee' && (
              <Card className="p-6 space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-extrabold text-factory-navy uppercase tracking-wider">
                    Employee Settings
                  </h3>
                  <p className="text-xs text-factory-muted">Worker prefix and auto-fill defaults</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Employee Code Prefix</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-600 outline-none uppercase"
                      value={currentSettings.employee_prefix || 'EMP'}
                      onChange={(e) => handleInputChange('employee_prefix', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Default Employee Status</label>
                    <select
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-600 outline-none"
                      value={currentSettings.default_employee_status || 'ACTIVE'}
                      onChange={(e) => handleInputChange('default_employee_status', e.target.value)}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>
              </Card>
            )}

            {/* 4. JOB CARD SETTINGS */}
            {activeCategory === 'job_card' && (
              <Card className="p-6 space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-extrabold text-factory-navy uppercase tracking-wider">
                    Job Card Settings
                  </h3>
                  <p className="text-xs text-factory-muted">Dynamic rates, default priorities, and due date rules</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Job Card Prefix</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-600 outline-none uppercase"
                      value={currentSettings.job_card_prefix || 'JC'}
                      onChange={(e) => handleInputChange('job_card_prefix', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Default Stitching Rate (₹/Pcs)</label>
                    <input
                      type="number"
                      step="0.5"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-600 outline-none"
                      value={currentSettings.default_stitching_rate || ''}
                      onChange={(e) => handleInputChange('default_stitching_rate', e.target.value)}
                      placeholder="Leave blank or enter rate"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Default Due Days</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-600 outline-none"
                      value={currentSettings.default_due_days || '7'}
                      onChange={(e) => handleInputChange('default_due_days', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Default Priority</label>
                    <select
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-600 outline-none"
                      value={currentSettings.default_priority || 'NORMAL'}
                      onChange={(e) => handleInputChange('default_priority', e.target.value)}
                    >
                      <option value="NORMAL">NORMAL</option>
                      <option value="HIGH">HIGH</option>
                      <option value="URGENT">URGENT</option>
                    </select>
                  </div>
                </div>
              </Card>
            )}

            {/* 5. BUNDLE SETTINGS */}
            {activeCategory === 'bundle' && (
              <Card className="p-6 space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-extrabold text-factory-navy uppercase tracking-wider">
                    Bundle Settings
                  </h3>
                  <p className="text-xs text-factory-muted">Bundle number prefixes and status generation</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Bundle Prefix</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-600 outline-none uppercase"
                      value={currentSettings.bundle_prefix || 'BND'}
                      onChange={(e) => handleInputChange('bundle_prefix', e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* 6. SALARY SETTINGS */}
            {activeCategory === 'salary' && (
              <Card className="p-6 space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-extrabold text-factory-navy uppercase tracking-wider">
                    Salary Settings
                  </h3>
                  <p className="text-xs text-factory-muted">Salary disbursal cycles and default payment modes</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Salary Cycle</label>
                    <select
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-600 outline-none"
                      value={currentSettings.salary_cycle || 'Monthly'}
                      onChange={(e) => handleInputChange('salary_cycle', e.target.value)}
                    >
                      <option value="Weekly">Weekly</option>
                      <option value="15 Days">15 Days</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Default Payment Method</label>
                    <select
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-600 outline-none"
                      value={currentSettings.default_payment_mode || 'CASH'}
                      onChange={(e) => handleInputChange('default_payment_mode', e.target.value)}
                    >
                      <option value="CASH">CASH</option>
                      <option value="UPI">UPI</option>
                      <option value="BANK_TRANSFER">BANK TRANSFER</option>
                      <option value="CHEQUE">CHEQUE</option>
                    </select>
                  </div>
                </div>
              </Card>
            )}

            {/* 7. NOTIFICATION SETTINGS */}
            {activeCategory === 'notification' && (
              <Card className="p-6 space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-extrabold text-factory-navy uppercase tracking-wider">
                    Notification Settings
                  </h3>
                  <p className="text-xs text-factory-muted">In-app alert behavior and retention policies</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Retention Days</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-600 outline-none"
                      value={currentSettings.notification_retention_days || '30'}
                      onChange={(e) => handleInputChange('notification_retention_days', e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* 8. GARMENT SIZES MASTER */}
            {activeCategory === 'garment_sizes' && (
              <Card className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-factory-navy uppercase tracking-wider">
                      Garment Sizes Master Catalog
                    </h3>
                    <p className="text-xs text-factory-muted">
                      Add, edit, reorder, and enable/disable sizes (e.g., XS, S, M, L, XL, XXL, 3XL, Free Size, 28, 30)
                    </p>
                  </div>

                  {canManage && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Plus}
                      onClick={handleOpenAddSize}
                    >
                      Add New Size
                    </Button>
                  )}
                </div>

                {isLoadingSizes ? (
                  <p className="text-xs text-slate-500 py-4">Loading garment sizes catalog...</p>
                ) : garmentSizesList.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl space-y-2">
                    <p className="text-xs font-bold text-slate-600">No Garment Sizes Configured</p>
                    <p className="text-[11px] text-slate-400">
                      Click <strong className="text-brand-600">+ Add New Size</strong> to create size options.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                          <th className="py-2.5 px-3 w-16 text-center">Sort</th>
                          <th className="py-2.5 px-3">Size Name</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {garmentSizesList.map((sz) => (
                          <tr key={sz.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2.5 px-3 font-extrabold text-brand-700 text-center">
                              #{sz.display_order}
                            </td>
                            <td className="py-2.5 px-3 font-extrabold text-factory-navy">
                              {sz.size_name}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <StatusBadge
                                status={sz.is_active ? 'active' : 'inactive'}
                                label={sz.is_active ? 'ACTIVE' : 'INACTIVE'}
                              />
                            </td>
                            <td className="py-2.5 px-3 text-right space-x-1">
                              {canManage && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSizeActive(sz)}
                                    className={`p-1.5 rounded-lg border text-xs font-bold transition-colors ${
                                      sz.is_active
                                        ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    }`}
                                    title={sz.is_active ? 'Disable Size' : 'Enable Size'}
                                  >
                                    {sz.is_active ? 'Disable' : 'Enable'}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditSize(sz)}
                                    className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                                    title="Edit Size"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSize(sz)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Size"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            )}

            {/* 9. APPLICATION PREFERENCES */}
            {activeCategory === 'preferences' && (
              <Card className="p-6 space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-extrabold text-factory-navy uppercase tracking-wider">
                    Application Preferences
                  </h3>
                  <p className="text-xs text-factory-muted">Theme, table pagination sizes, and branding primary color</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Table Page Size</label>
                    <select
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-600 outline-none"
                      value={currentSettings.table_page_size || '50'}
                      onChange={(e) => handleInputChange('table_page_size', e.target.value)}
                    >
                      <option value="10">10 Rows</option>
                      <option value="25">25 Rows</option>
                      <option value="50">50 Rows</option>
                      <option value="100">100 Rows</option>
                    </select>
                  </div>
                </div>
              </Card>
            )}

            {/* 10. NUMBER SERIES */}
            {activeCategory === 'number_series' && (
              <Card className="p-6 space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-extrabold text-factory-navy uppercase tracking-wider">
                    Enterprise Number Series Prefixes
                  </h3>
                  <p className="text-xs text-factory-muted">Configurable auto-generated reference sequence numbers</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Job Card Series (e.g. JC-1)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-600 outline-none uppercase"
                      value={currentSettings.job_card_prefix || 'JC'}
                      onChange={(e) => handleInputChange('job_card_prefix', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Employee Series (e.g. EMP-1)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-600 outline-none uppercase"
                      value={currentSettings.employee_prefix || 'EMP'}
                      onChange={(e) => handleInputChange('employee_prefix', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Advance Series (e.g. ADV-1)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-600 outline-none uppercase"
                      value={currentSettings.advance_prefix || 'ADV'}
                      onChange={(e) => handleInputChange('advance_prefix', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Payment Series (e.g. PAY-1)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-600 outline-none uppercase"
                      value={currentSettings.payment_prefix || 'PAY'}
                      onChange={(e) => handleInputChange('payment_prefix', e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* 11. DEFAULT VALUES */}
            {activeCategory === 'defaults' && (
              <Card className="p-6 space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-extrabold text-factory-navy uppercase tracking-wider">
                    Default Values Summary
                  </h3>
                  <p className="text-xs text-factory-muted">Global default form values across all modules</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Default Priority</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 outline-none"
                      value={currentSettings.default_priority || 'NORMAL'}
                      disabled
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Default Payment Mode</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 outline-none"
                      value={currentSettings.default_payment_mode || 'CASH'}
                      disabled
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* ROLES & PERMISSIONS */}
            {activeCategory === 'roles' && (
              <Card className="p-6 space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-extrabold text-factory-navy uppercase tracking-wider">
                    Role Access Control & Permission Matrix
                  </h3>
                  <p className="text-xs text-factory-muted">Defined role capabilities for Owner, Manager, and Cutting Master</p>
                </div>

                <div className="space-y-4">
                  {Object.entries(roleMatrix).map(([roleKey, info]) => (
                    <div key={roleKey} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-factory-navy uppercase tracking-wider">
                          {info.title} ({roleKey})
                        </span>
                        <StatusBadge status="active" label="CONFIGURED" />
                      </div>
                      <p className="text-xs text-slate-700">{info.description}</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {info.permissions?.map((p) => (
                          <span
                            key={p}
                            className="bg-brand-50 text-brand-700 font-bold px-2.5 py-0.5 rounded border border-brand-200 text-[10px]"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* BACKUP & SYSTEM INFO */}
            {activeCategory === 'backup' && (
              <Card className="p-6 space-y-6">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-extrabold text-factory-navy uppercase tracking-wider">
                    System Backup & Database Status
                  </h3>
                  <p className="text-xs text-factory-muted">Download full factory database snapshot and inspect system status</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                    <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
                      Application Version
                    </span>
                    <span className="text-lg font-extrabold text-brand-600 block">v1.0.0</span>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                    <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
                      Database Status
                    </span>
                    <span className="text-lg font-extrabold text-emerald-600 block">Supabase Connected</span>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                    <span className="text-[11px] font-bold text-factory-muted uppercase tracking-wider block">
                      REST API Server
                    </span>
                    <span className="text-lg font-extrabold text-emerald-600 block">Online (200 OK)</span>
                  </div>
                </div>

                {canManage && (
                  <div className="p-5 bg-brand-50/60 border border-brand-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-extrabold text-sm text-brand-900">
                        Export Full System Database Backup
                      </h4>
                      <p className="text-xs text-brand-700 mt-0.5">
                        Download JSON snapshot containing Job Cards, Bundles, Assignments, Employees, Salary & Advances.
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      icon={Download}
                      onClick={() => settingService.downloadBackup()}
                    >
                      Download Backup
                    </Button>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;

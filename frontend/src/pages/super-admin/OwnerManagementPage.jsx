import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  ShieldCheck, 
  Search, 
  Plus, 
  Key, 
  Lock, 
  Unlock, 
  X, 
  Building2, 
  Mail, 
  Check, 
  AlertTriangle
} from 'lucide-react';
import { api } from '../../services/api.js';
import Loading from '../../components/common/Loading.jsx';
import toast from 'react-hot-toast';

export const OwnerManagementPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [owners, setOwners] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    full_name: '',
    email: '',
    password: '',
    company_id: '',
  });

  const [resetPasswordValue, setResetPasswordValue] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ownersRes, companiesRes] = await Promise.all([
        api.get('/owners'),
        api.get('/companies'),
      ]);

      if (ownersRes.data?.success) {
        setOwners(ownersRes.data.data.owners);
      }
      if (companiesRes.data?.success) {
        setCompanies(companiesRes.data.data.companies);
      }
    } catch (error) {
      console.error('Failed to load owner data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      handleOpenCreate();
      setSearchParams({});
    }
  }, [searchParams]);

  const handleOpenCreate = () => {
    setCreateForm({
      full_name: '',
      email: '',
      password: '',
      company_id: '',
    });
    setCreateModalOpen(true);
  };

  const handleOpenResetPassword = (owner) => {
    setSelectedOwner(owner);
    setResetPasswordValue('');
    setResetModalOpen(true);
  };

  const handleStatusToggle = async (owner) => {
    const nextStatus = owner.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const confirmMsg = `Are you sure you want to ${
      nextStatus === 'ACTIVE' ? 'unlock/activate' : 'lock/deactivate'
    } account for ${owner.full_name}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const response = await api.put(`/system/users/${owner.id}/status`, { status: nextStatus });
      if (response.data?.success) {
        toast.success(`Owner account has been ${nextStatus === 'ACTIVE' ? 'unlocked' : 'locked'}!`);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.company_id) {
      toast.error('Please assign a company to the owner.');
      return;
    }
    try {
      const response = await api.post('/owners', createForm);
      if (response.data?.success) {
        toast.success('Owner account created successfully!');
        setCreateModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create owner account:', error);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetPasswordValue || resetPasswordValue.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    try {
      const response = await api.put(`/system/users/${selectedOwner.id}/reset-password`, {
        password: resetPasswordValue,
      });
      if (response.data?.success) {
        toast.success('Owner password has been updated!');
        setResetModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to reset password:', error);
    }
  };

  const filteredOwners = owners.filter((owner) =>
    owner.full_name.toLowerCase().includes(search.toLowerCase()) ||
    owner.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-indigo-600" />
            Factory Owners
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage company administrator credentials, lock accounts, or update login access passwords.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Owner
        </button>
      </div>

      {/* Advanced Filters */}
      <div className="grid grid-cols-1 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by owner name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Owner Grid List */}
      {isLoading ? (
        <Loading message="Fetching administrative credentials..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="p-4">Owner Profile</th>
                  <th className="p-4">Assigned Company</th>
                  <th className="p-4">Last Login</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOwners.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-slate-400 font-medium">
                      No owner accounts match the search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOwners.map((owner) => (
                    <tr key={owner.id} className="hover:bg-slate-50/30 transition-colors">
                      {/* Name & Email */}
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{owner.full_name}</div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {owner.email}
                        </div>
                      </td>

                      {/* Company */}
                      <td className="p-4">
                        {owner.company ? (
                          <div className="flex items-center gap-1.5 text-slate-700 text-xs font-semibold">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            {owner.company.company_name}
                            <span className="text-[10px] font-mono bg-slate-100 px-1 py-0.2 rounded font-bold text-slate-500 uppercase">
                              {owner.company.company_code}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-rose-500 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Last Login */}
                      <td className="p-4 text-xs text-slate-500">
                        {owner.last_login 
                          ? new Date(owner.last_login).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Never logged in'
                        }
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          owner.status === 'ACTIVE' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            owner.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                          }`} />
                          {owner.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenResetPassword(owner)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Reset Password"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusToggle(owner)}
                            className={`p-1.5 rounded-lg transition-all ${
                              owner.status === 'ACTIVE' 
                                ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50' 
                                : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={owner.status === 'ACTIVE' ? 'Suspend Credentials' : 'Activate Credentials'}
                          >
                            {owner.status === 'ACTIVE' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Owner Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                Register Owner Account
              </h2>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {/* Company Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Select Associated Company *
                </label>
                <select
                  required
                  value={createForm.company_id}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, company_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose Tenant --</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name} ({c.company_code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Owner Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={createForm.full_name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Owner Login Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="owner@factory.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Set Initial Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={createForm.password}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 font-semibold text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-600" />
                Reset Credentials
              </h2>
              <button onClick={() => setResetModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetSubmit} className="p-6 space-y-4">
              <p className="text-xs text-slate-500">
                Update account password for: <span className="font-bold text-slate-800">{selectedOwner?.full_name}</span>
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={resetPasswordValue}
                  onChange={(e) => setResetPasswordValue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 font-semibold text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-50 text-white font-semibold text-xs rounded-lg"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerManagementPage;

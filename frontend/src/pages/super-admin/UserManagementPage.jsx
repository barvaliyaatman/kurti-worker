import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Lock, 
  Unlock, 
  Key, 
  X, 
  Building2, 
  Mail, 
  AlertTriangle 
} from 'lucide-react';
import { api } from '../../services/api.js';
import Loading from '../../components/common/Loading.jsx';
import toast from 'react-hot-toast';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Password reset modal
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, companiesRes] = await Promise.all([
        api.get('/system/users'),
        api.get('/companies'),
      ]);

      if (usersRes.data?.success) {
        setUsers(usersRes.data.data.users);
      }
      if (companiesRes.data?.success) {
        setCompanies(companiesRes.data.data.companies);
      }
    } catch (error) {
      console.error('Failed to load user management details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusToggle = async (user) => {
    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const confirmMsg = `Are you sure you want to ${
      nextStatus === 'ACTIVE' ? 'unlock/activate' : 'lock/deactivate'
    } account for ${user.full_name}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const response = await api.put(`/system/users/${user.id}/status`, { status: nextStatus });
      if (response.data?.success) {
        toast.success(`User account has been ${nextStatus === 'ACTIVE' ? 'activated' : 'locked'}!`);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleOpenReset = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setResetModalOpen(true);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    try {
      const response = await api.put(`/system/users/${selectedUser.id}/reset-password`, {
        password: newPassword,
      });
      if (response.data?.success) {
        toast.success(`Password reset successful for ${selectedUser.full_name}!`);
        setResetModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to update password:', error);
    }
  };

  // Filter logic on client-side or we can query, let's filter client-side for immediate response
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    const matchesCompany = companyFilter ? u.company_id === companyFilter : true;

    return matchesSearch && matchesRole && matchesCompany;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-7 h-7 text-indigo-600" />
          Global User Registry
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor login sessions, lock accounts, reset staff credentials, and audit active users across all manufacturing instances.
        </p>
      </div>

      {/* Advanced Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Role Filter */}
        <div className="relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors appearance-none"
          >
            <option value="">All Roles</option>
            <option value="OWNER">Owner</option>
            <option value="MANAGER">Manager</option>
            <option value="CUTTING_MASTER">Cutting Master</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>

        {/* Company Filter */}
        <div className="relative">
          <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors appearance-none"
          >
            <option value="">All Companies</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company_name} ({c.company_code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <Loading message="Fetching registered account listings..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="p-4">User Details</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Company Binding</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-slate-400 font-medium">
                      No accounts match the selected parameters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/30 transition-colors">
                      {/* Name & Email */}
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{u.full_name}</div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {u.email}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold uppercase ${
                          u.role === 'SUPER_ADMIN' 
                            ? 'bg-slate-900 text-white' 
                            : u.role === 'OWNER' 
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                            : u.role === 'MANAGER'
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Company */}
                      <td className="p-4">
                        {u.company ? (
                          <div className="flex items-center gap-1.5 text-slate-700 text-xs font-semibold">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            {u.company.company_name}
                          </div>
                        ) : u.role === 'SUPER_ADMIN' ? (
                          <span className="text-slate-400 text-xs font-medium italic">Global Instance</span>
                        ) : (
                          <span className="text-xs text-rose-500 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Orphaned Account
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          u.status === 'ACTIVE' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            u.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                          }`} />
                          {u.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        {u.role !== 'SUPER_ADMIN' ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenReset(u)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                              title="Reset Password"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusToggle(u)}
                              className={`p-1.5 rounded-lg transition-all ${
                                u.status === 'ACTIVE' 
                                  ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50' 
                                  : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                              }`}
                              title={u.status === 'ACTIVE' ? 'Lock Account' : 'Unlock Account'}
                            >
                              {u.status === 'ACTIVE' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </button>
                          </div>
                        ) : (
                          <div className="text-center text-xs text-slate-400 italic">Self (Locked)</div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reset password modal */}
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
                Update account password for: <span className="font-bold text-slate-800">{selectedUser?.full_name}</span>
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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

export default UserManagementPage;

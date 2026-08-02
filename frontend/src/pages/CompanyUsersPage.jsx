import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Search, Filter, RefreshCw, Lock, Unlock, Trash2, KeyRound, Edit, Users, Shield, Scissors, Eye, EyeOff } from 'lucide-react';
import { companyUserService } from '../services/companyUserService.js';
import { useAuth } from '../hooks/useAuth.js';

// ─── Role badge ───────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const styles = {
    MANAGER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    CUTTING_MASTER: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  };
  const icons = { MANAGER: <Shield size={11} />, CUTTING_MASTER: <Scissors size={11} /> };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${styles[role] || 'bg-gray-100 text-gray-700'}`}>
      {icons[role]} {role === 'CUTTING_MASTER' ? 'Cutting Master' : 'Manager'}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const s = {
    ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    INACTIVE: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

const Avatar = ({ name }) => {
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
  const color = colors[name?.charCodeAt(0) % colors.length] || '#6366f1';
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  return (
    <div className="cu-avatar" style={{ background: color }}>
      {initials}
    </div>
  );
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ─── Modal – Create / Edit user ───────────────────────────────
const UserFormModal = ({ open, onClose, onSaved, editUser }) => {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', role: 'MANAGER', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEdit = Boolean(editUser);

  useEffect(() => {
    if (editUser) {
      setForm({ full_name: editUser.full_name, email: editUser.email, phone: editUser.phone || '', role: editUser.role, password: '' });
    } else {
      setForm({ full_name: '', email: '', phone: '', role: 'MANAGER', password: '' });
    }
    setError('');
  }, [editUser, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        await companyUserService.update(editUser.id, { full_name: form.full_name, phone: form.phone });
      } else {
        await companyUserService.create(form);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="cu-modal-overlay" onClick={onClose}>
      <div className="cu-modal" onClick={e => e.stopPropagation()}>
        <div className="cu-modal-header">
          <h2 className="cu-modal-title">{isEdit ? 'Edit User' : 'Create New User'}</h2>
          <button onClick={onClose} className="cu-modal-close">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="cu-modal-body">
          {error && <div className="cu-error-banner">{error}</div>}
          <div className="cu-field">
            <label className="cu-label">Full Name *</label>
            <input className="cu-input" placeholder="Enter full name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required />
          </div>
          {!isEdit && (
            <div className="cu-field">
              <label className="cu-label">Email Address *</label>
              <input className="cu-input" type="email" placeholder="user@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
          )}
          <div className="cu-field">
            <label className="cu-label">Phone</label>
            <input className="cu-input" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          {!isEdit && (
            <>
              <div className="cu-field">
                <label className="cu-label">Role *</label>
                <select className="cu-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} required>
                  <option value="MANAGER">Manager</option>
                  <option value="CUTTING_MASTER">Cutting Master</option>
                </select>
              </div>
              <div className="cu-field">
                <label className="cu-label">Password *</label>
                <div className="cu-pwd-wrap">
                  <input className="cu-input" type={showPwd ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
                  <button type="button" className="cu-pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </>
          )}
          <div className="cu-modal-footer">
            <button type="button" className="cu-btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="cu-btn-primary" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Modal – Reset password ───────────────────────────────────
const ResetPasswordModal = ({ open, onClose, user, onDone }) => {
  const [mode, setMode] = useState('auto'); // 'auto' | 'manual'
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => { if (open) { setMode('auto'); setPassword(''); setError(''); setResult(null); } }, [open]);

  const handleReset = async () => {
    setError('');
    setLoading(true);
    try {
      const payload = mode === 'manual' ? { new_password: password } : {};
      const res = await companyUserService.resetPassword(user.id, payload);
      setResult(res.data?.data?.temporary_password || null);
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || 'Error resetting password.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="cu-modal-overlay" onClick={onClose}>
      <div className="cu-modal" onClick={e => e.stopPropagation()}>
        <div className="cu-modal-header">
          <h2 className="cu-modal-title">Reset Password</h2>
          <button onClick={onClose} className="cu-modal-close">✕</button>
        </div>
        <div className="cu-modal-body">
          {error && <div className="cu-error-banner">{error}</div>}
          {result ? (
            <div className="cu-success-box">
              <p className="cu-success-text">✅ Password reset successfully!</p>
              <p className="cu-hint">Temporary password for <strong>{user?.full_name}</strong>:</p>
              <div className="cu-temp-pwd">{result}</div>
              <p className="cu-hint">Share this with the user. They will be forced to change it on login.</p>
              <button className="cu-btn-primary" onClick={onClose}>Done</button>
            </div>
          ) : (
            <>
              <p className="cu-hint">Reset password for <strong>{user?.full_name}</strong> ({user?.email}). They will be forced to change it on next login.</p>
              <div className="cu-toggle-group">
                <button className={`cu-toggle ${mode === 'auto' ? 'active' : ''}`} onClick={() => setMode('auto')}>Auto-generate</button>
                <button className={`cu-toggle ${mode === 'manual' ? 'active' : ''}`} onClick={() => setMode('manual')}>Set manually</button>
              </div>
              {mode === 'manual' && (
                <div className="cu-field">
                  <label className="cu-label">New Password</label>
                  <div className="cu-pwd-wrap">
                    <input className="cu-input" type={showPwd ? 'text' : 'password'} placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
                    <button type="button" className="cu-pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}
              <div className="cu-modal-footer">
                <button className="cu-btn-ghost" onClick={onClose}>Cancel</button>
                <button className="cu-btn-danger" onClick={handleReset} disabled={loading || (mode === 'manual' && password.length < 6)}>
                  {loading ? 'Resetting…' : 'Reset Password'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────
export default function CompanyUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [resetUser, setResetUser] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const fetchUsers = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const res = await companyUserService.getAll({ page: pg, search, role: roleFilter, status: statusFilter });
      setUsers(res.data?.data?.users || []);
      setPagination(res.data?.data?.pagination || { total: 0, page: pg, totalPages: 1 });
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  const handleStatusToggle = async (u) => {
    const newStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setActionLoading(p => ({ ...p, [u.id]: true }));
    try {
      await companyUserService.toggleStatus(u.id, newStatus);
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: newStatus } : x));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setActionLoading(p => ({ ...p, [u.id]: false }));
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete user "${u.full_name}"? This cannot be undone.`)) return;
    setActionLoading(p => ({ ...p, [u.id]: true }));
    try {
      await companyUserService.delete(u.id);
      setUsers(prev => prev.filter(x => x.id !== u.id));
      setPagination(p => ({ ...p, total: p.total - 1 }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setActionLoading(p => ({ ...p, [u.id]: false }));
    }
  };

  return (
    <>
      <style>{`
        .cu-page { padding: 24px; max-width: 1400px; margin: 0 auto; }
        .cu-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
        .cu-title { font-size: 22px; font-weight: 700; color: var(--text-primary, #0f172a); display: flex; align-items: center; gap: 10px; }
        .cu-subtitle { font-size: 13px; color: var(--text-secondary, #64748b); margin-top: 2px; }
        .cu-btn-primary { background: #6366f1; color: #fff; border: none; border-radius: 8px; padding: 9px 18px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background .15s; }
        .cu-btn-primary:hover:not(:disabled) { background: #4f46e5; }
        .cu-btn-primary:disabled { opacity: .6; cursor: not-allowed; }
        .cu-btn-ghost { background: transparent; border: 1px solid #e2e8f0; border-radius: 8px; padding: 9px 16px; font-size: 14px; font-weight: 500; cursor: pointer; color: var(--text-secondary, #64748b); transition: all .15s; }
        .cu-btn-ghost:hover { background: #f1f5f9; }
        .cu-btn-danger { background: #ef4444; color: #fff; border: none; border-radius: 8px; padding: 9px 18px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background .15s; }
        .cu-btn-danger:hover:not(:disabled) { background: #dc2626; }
        .cu-btn-danger:disabled { opacity: .6; cursor: not-allowed; }
        .cu-filters { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
        .cu-search-wrap { position: relative; flex: 1; min-width: 200px; max-width: 360px; }
        .cu-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .cu-search { width: 100%; padding: 9px 12px 9px 36px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; background: var(--bg-card, #fff); color: var(--text-primary, #0f172a); }
        .cu-search:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
        .cu-select { padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; background: var(--bg-card, #fff); color: var(--text-primary, #0f172a); cursor: pointer; outline: none; }
        .cu-table-card { background: var(--bg-card, #fff); border-radius: 14px; box-shadow: 0 1px 4px rgba(0,0,0,.08); overflow: hidden; border: 1px solid #f1f5f9; }
        .cu-table { width: 100%; border-collapse: collapse; }
        .cu-th { padding: 13px 16px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #94a3b8; background: #f8fafc; border-bottom: 1px solid #f1f5f9; }
        .cu-td { padding: 14px 16px; font-size: 14px; color: var(--text-primary, #0f172a); border-bottom: 1px solid #f8fafc; vertical-align: middle; }
        .cu-tr:hover .cu-td { background: #f8fafc; }
        .cu-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 700; flex-shrink: 0; }
        .cu-user-cell { display: flex; align-items: center; gap: 10px; }
        .cu-user-name { font-weight: 600; color: var(--text-primary, #0f172a); font-size: 14px; }
        .cu-user-email { font-size: 12px; color: #64748b; }
        .cu-actions { display: flex; align-items: center; gap: 4px; }
        .cu-icon-btn { width: 32px; height: 32px; border-radius: 7px; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #64748b; transition: all .15s; }
        .cu-icon-btn:hover { background: #f1f5f9; color: #0f172a; }
        .cu-icon-btn.danger:hover { background: #fee2e2; color: #ef4444; }
        .cu-icon-btn.warning:hover { background: #fef3c7; color: #d97706; }
        .cu-icon-btn.success:hover { background: #dcfce7; color: #16a34a; }
        .cu-icon-btn:disabled { opacity: .4; cursor: not-allowed; }
        .cu-empty { text-align: center; padding: 60px 24px; color: #94a3b8; }
        .cu-empty-icon { margin: 0 auto 14px; opacity: .3; }
        .cu-pagination { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-top: 1px solid #f1f5f9; font-size: 13px; color: #64748b; }
        .cu-page-btns { display: flex; gap: 6px; }
        .cu-page-btn { padding: 5px 10px; border: 1px solid #e2e8f0; border-radius: 6px; background: #fff; cursor: pointer; font-size: 13px; }
        .cu-page-btn.active { background: #6366f1; color: #fff; border-color: #6366f1; }
        .cu-page-btn:disabled { opacity: .4; cursor: not-allowed; }
        .cu-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .cu-modal { background: var(--bg-card, #fff); border-radius: 16px; width: 100%; max-width: 460px; box-shadow: 0 20px 60px rgba(0,0,0,.2); }
        .cu-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
        .cu-modal-title { font-size: 18px; font-weight: 700; color: var(--text-primary, #0f172a); }
        .cu-modal-close { background: none; border: none; cursor: pointer; font-size: 18px; color: #64748b; padding: 4px; }
        .cu-modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }
        .cu-modal-footer { display: flex; gap: 10px; justify-content: flex-end; padding-top: 6px; }
        .cu-field { display: flex; flex-direction: column; gap: 5px; }
        .cu-label { font-size: 13px; font-weight: 600; color: var(--text-primary, #0f172a); }
        .cu-input { padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; background: var(--bg-input, #fff); color: var(--text-primary, #0f172a); outline: none; width: 100%; box-sizing: border-box; }
        .cu-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
        .cu-pwd-wrap { position: relative; }
        .cu-pwd-toggle { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #64748b; }
        .cu-error-banner { background: #fee2e2; color: #ef4444; border-radius: 8px; padding: 10px 14px; font-size: 13px; }
        .cu-success-box { display: flex; flex-direction: column; gap: 10px; }
        .cu-success-text { color: #16a34a; font-weight: 600; }
        .cu-temp-pwd { font-family: monospace; font-size: 18px; font-weight: 700; letter-spacing: .1em; padding: 12px; background: #f1f5f9; border-radius: 8px; text-align: center; color: #0f172a; }
        .cu-hint { font-size: 13px; color: #64748b; }
        .cu-toggle-group { display: flex; gap: 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
        .cu-toggle { flex: 1; padding: 8px; border: none; background: #fff; cursor: pointer; font-size: 13px; color: #64748b; transition: all .15s; }
        .cu-toggle.active { background: #6366f1; color: #fff; font-weight: 600; }
        .cu-pr-badge { display: inline-flex; align-items: center; gap: 3px; font-size: 11px; color: #f59e0b; background: #fef3c7; border-radius: 4px; padding: 1px 5px; margin-left: 4px; }
        @media (max-width: 768px) { .cu-td:nth-child(3), .cu-th:nth-child(3) { display: none; } }
      `}</style>

      <div className="cu-page">
        {/* Header */}
        <div className="cu-header">
          <div>
            <div className="cu-title"><Users size={22} /> Team Users</div>
            <div className="cu-subtitle">Manage Managers and Cutting Masters for your company</div>
          </div>
          <button className="cu-btn-primary" onClick={() => setCreateOpen(true)}>
            <UserPlus size={16} /> Add User
          </button>
        </div>

        {/* Filters */}
        <div className="cu-filters">
          <div className="cu-search-wrap">
            <Search size={15} className="cu-search-icon" />
            <input className="cu-search" placeholder="Search by name, email or phone…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="cu-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="ALL">All Roles</option>
            <option value="MANAGER">Manager</option>
            <option value="CUTTING_MASTER">Cutting Master</option>
          </select>
          <select className="cu-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <button className="cu-btn-ghost" onClick={() => fetchUsers(1)} title="Refresh">
            <RefreshCw size={15} />
          </button>
        </div>

        {/* Table */}
        <div className="cu-table-card">
          {loading ? (
            <div className="cu-empty">Loading users…</div>
          ) : users.length === 0 ? (
            <div className="cu-empty">
              <Users size={48} className="cu-empty-icon" />
              <p style={{ fontWeight: 600, marginBottom: 4 }}>No users found</p>
              <p style={{ fontSize: 13 }}>Add your first Manager or Cutting Master to get started.</p>
            </div>
          ) : (
            <table className="cu-table">
              <thead>
                <tr>
                  <th className="cu-th">User</th>
                  <th className="cu-th">Role</th>
                  <th className="cu-th">Phone</th>
                  <th className="cu-th">Status</th>
                  <th className="cu-th">Last Login</th>
                  <th className="cu-th">Created</th>
                  <th className="cu-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="cu-tr">
                    <td className="cu-td">
                      <div className="cu-user-cell">
                        <Avatar name={u.full_name} />
                        <div>
                          <div className="cu-user-name">
                            {u.full_name}
                            {u.password_reset_required && <span className="cu-pr-badge">🔑 Reset req.</span>}
                          </div>
                          <div className="cu-user-email">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="cu-td"><RoleBadge role={u.role} /></td>
                    <td className="cu-td">{u.phone || '—'}</td>
                    <td className="cu-td"><StatusBadge status={u.status} /></td>
                    <td className="cu-td">{formatDate(u.last_login)}</td>
                    <td className="cu-td">{formatDate(u.created_at)}</td>
                    <td className="cu-td">
                      <div className="cu-actions">
                        <button
                          className="cu-icon-btn"
                          title="Edit user"
                          onClick={() => setEditUser(u)}
                          disabled={actionLoading[u.id]}
                        ><Edit size={15} /></button>
                        <button
                          className="cu-icon-btn warning"
                          title="Reset password"
                          onClick={() => setResetUser(u)}
                          disabled={actionLoading[u.id]}
                        ><KeyRound size={15} /></button>
                        <button
                          className={`cu-icon-btn ${u.status === 'ACTIVE' ? 'danger' : 'success'}`}
                          title={u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          onClick={() => handleStatusToggle(u)}
                          disabled={actionLoading[u.id]}
                        >{u.status === 'ACTIVE' ? <Lock size={15} /> : <Unlock size={15} />}</button>
                        <button
                          className="cu-icon-btn danger"
                          title="Delete user"
                          onClick={() => handleDelete(u)}
                          disabled={actionLoading[u.id]}
                        ><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="cu-pagination">
              <span>Showing {users.length} of {pagination.total} users</span>
              <div className="cu-page-btns">
                <button className="cu-page-btn" disabled={pagination.page <= 1} onClick={() => fetchUsers(pagination.page - 1)}>← Prev</button>
                <button className={`cu-page-btn active`}>{pagination.page}</button>
                <button className="cu-page-btn" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchUsers(pagination.page + 1)}>Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <UserFormModal
        open={createOpen || Boolean(editUser)}
        onClose={() => { setCreateOpen(false); setEditUser(null); }}
        onSaved={() => fetchUsers(pagination.page)}
        editUser={editUser}
      />
      <ResetPasswordModal
        open={Boolean(resetUser)}
        onClose={() => setResetUser(null)}
        user={resetUser}
        onDone={() => fetchUsers(pagination.page)}
      />
    </>
  );
}

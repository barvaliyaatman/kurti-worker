import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Calendar, HardDrive, ShieldAlert, RefreshCw } from 'lucide-react';
import { api } from '../../services/api.js';
import Loading from '../../components/common/Loading.jsx';
import toast from 'react-hot-toast';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/system/audit-logs');
      if (response.data?.success) {
        setLogs(response.data.data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      toast.error('Failed to load system audit log history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const term = search.toLowerCase();
    return (
      log.admin_name.toLowerCase().includes(term) ||
      log.target_user.toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term) ||
      (log.ip_address && log.ip_address.toLowerCase().includes(term))
    );
  });

  const formatDateTime = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-indigo-600" />
            Security Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            System-wide record of administrator operations, credential updates, locking events, and tenant modifications.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-lg transition-colors border border-indigo-100 cursor-pointer self-start sm:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Logs
        </button>
      </div>

      {/* Advanced Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Admin, Target, Action or IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      {isLoading ? (
        <Loading message="Decrypting audit records..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Super Admin Name</th>
                  <th className="p-4">Target User / Tenant</th>
                  <th className="p-4">Action Event</th>
                  <th className="p-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700 text-xs">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-slate-400 font-medium">
                      No security audit records match the query.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                      {/* Date & Time */}
                      <td className="p-4 flex items-center gap-2 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDateTime(log.created_at)}
                      </td>

                      {/* Super Admin */}
                      <td className="p-4 font-bold text-slate-900">
                        {log.admin_name}
                      </td>

                      {/* Target User */}
                      <td className="p-4 text-slate-800">
                        {log.target_user}
                      </td>

                      {/* Action Code */}
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase ${
                          log.action.includes('RESET') || log.action.includes('FORCED')
                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                            : log.action.includes('DEACTIVATE') || log.action.includes('LOCK')
                            ? 'bg-rose-50 text-rose-700 border-rose-100'
                            : log.action.includes('ACTIVATE') || log.action.includes('UNLOCK')
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                        }`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* IP Address */}
                      <td className="p-4 text-slate-500 flex items-center gap-1">
                        <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                        {log.ip_address || 'Unknown'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  FileText, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Settings, 
  Database, 
  Cpu, 
  Sparkles, 
  PlusCircle, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { api } from '../../services/api.js';
import Loading from '../../components/common/Loading.jsx';
import { ROUTES } from '../../constants/index.js';

export const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/system/dashboard');
        if (response.data?.success) {
          setData(response.data.data);
        }
      } catch (error) {
        console.error('Failed to load system dashboard statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return <Loading message="Loading system-wide administration workspace..." />;
  }

  const metrics = data?.metrics || {
    totalCompanies: 0,
    activeCompanies: 0,
    inactiveCompanies: 0,
    totalOwners: 0,
    totalManagers: 0,
    totalCuttingMasters: 0,
    totalEmployees: 0,
    totalJobCards: 0,
    todayProduction: 0,
    monthlyProduction: 0,
  };

  const recentCompanies = data?.recentCompanies || [];
  const systemHealth = data?.systemHealth || { server: 'ONLINE', database: 'ONLINE', apiUptime: '100%' };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-4 -mr-4 w-52 h-52 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold tracking-wide uppercase mb-1">
              <Sparkles className="w-4 h-4 animate-pulse" />
              Platform Administration
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Super Admin Control Center</h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              Monitor cloud instances, manage company tenant subscriptions, configure default factory policies, and manage global credentials.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/super-admin/companies?create=true')}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md hover:shadow-indigo-500/20 transition-all duration-200"
            >
              <PlusCircle className="w-4 h-4" />
              Register Company
            </button>
            <button
              onClick={() => navigate('/super-admin/owners?create=true')}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all duration-200"
            >
              <Users className="w-4 h-4" />
              Create Owner
            </button>
          </div>
        </div>
      </div>

      {/* Tenancy Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Companies */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Companies</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{metrics.totalCompanies}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs font-medium border-t border-slate-50 pt-3">
            <span className="text-emerald-600 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              {metrics.activeCompanies} Active
            </span>
            <span className="text-amber-500 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {metrics.inactiveCompanies} Inactive
            </span>
          </div>
        </div>

        {/* Global Users */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">System Users</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">
                {metrics.totalOwners + metrics.totalManagers + metrics.totalCuttingMasters}
              </h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 text-slate-500 text-xs font-medium border-t border-slate-50 pt-3">
            <span>{metrics.totalOwners} Owners</span>
            <span>{metrics.totalManagers} Managers</span>
            <span>{metrics.totalCuttingMasters} Masters</span>
          </div>
        </div>

        {/* Total Production Items */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Production Output</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{metrics.monthlyProduction}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-emerald-600 text-xs font-semibold border-t border-slate-50 pt-3">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            +{metrics.todayProduction} pieces finished today
          </div>
        </div>

        {/* Platform Work Items */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Job Cards</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{metrics.totalJobCards}</h3>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 text-slate-500 text-xs font-medium border-t border-slate-50 pt-3">
            <span>{metrics.totalEmployees} Registered Workforce</span>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Registered Companies */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recently Registered Companies</h2>
            <button
              onClick={() => navigate('/super-admin/companies')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-500 flex items-center gap-1 transition-colors"
            >
              Manage All
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="pb-3">Company Details</th>
                  <th className="pb-3">Code</th>
                  <th className="pb-3">Owner Contact</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentCompanies.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-slate-400 font-medium">
                      No companies registered on the platform yet.
                    </td>
                  </tr>
                ) : (
                  recentCompanies.map((company) => (
                    <tr key={company.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 pr-3">
                        <div className="font-semibold text-slate-900">{company.company_name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{company.phone}</div>
                      </td>
                      <td className="py-3.5 text-slate-600 font-mono font-medium text-xs">
                        {company.company_code}
                      </td>
                      <td className="py-3.5">
                        <div className="text-slate-800 font-medium text-xs">{company.owner_name}</div>
                        <div className="text-xs text-slate-500">{company.email}</div>
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          company.status === 'ACTIVE' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {company.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Health / Status */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Platform Health & Status</h2>
          
          <div className="space-y-4">
            {/* Server Status */}
            <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800 text-sm">Server Instance</div>
                  <div className="text-xs text-slate-500">API Gateway Status</div>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                systemHealth.server === 'OK' || systemHealth.server === 'ONLINE'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                {systemHealth.server}
              </span>
            </div>

            {/* DB Status */}
            <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800 text-sm">PostgreSQL DB</div>
                  <div className="text-xs text-slate-500">Supabase Connection Pool</div>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700`}>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                {systemHealth.database}
              </span>
            </div>

            {/* Uptime */}
            <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800 text-sm">Instance Uptime</div>
                  <div className="text-xs text-slate-500">Trailing 30-day index</div>
                </div>
              </div>
              <span className="text-slate-800 font-bold text-sm">{systemHealth.apiUptime}</span>
            </div>
          </div>

          {/* Quick Config Actions */}
          <div className="border-t border-slate-100 pt-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate('/super-admin/settings')}
                className="flex items-center justify-center gap-2 p-2.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                Global Setup
              </button>
              <button
                onClick={() => navigate('/super-admin/users')}
                className="flex items-center justify-center gap-2 p-2.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                Manage Users
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

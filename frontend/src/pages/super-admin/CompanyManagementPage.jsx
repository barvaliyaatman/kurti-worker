import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  Plus, 
  Filter, 
  Edit, 
  Lock, 
  Unlock, 
  Check, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Users, 
  ShieldAlert
} from 'lucide-react';
import { api } from '../../services/api.js';
import Loading from '../../components/common/Loading.jsx';
import toast from 'react-hot-toast';

export const CompanyManagementPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [formData, setFormData] = useState({
    company_code: '',
    company_name: '',
    owner_name: '',
    phone: '',
    email: '',
    address: '',
    logo: '',
    status: 'ACTIVE',
  });

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/companies', {
        params: { search, status: statusFilter },
      });
      if (response.data?.success) {
        setCompanies(response.data.data.companies);
      }
    } catch (error) {
      console.error('Failed to fetch companies list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [search, statusFilter]);

  useEffect(() => {
    // If the url contains ?create=true, auto-open the create company modal
    if (searchParams.get('create') === 'true') {
      handleOpenCreate();
      // Remove query param
      setSearchParams({});
    }
  }, [searchParams]);

  const handleOpenCreate = () => {
    setSelectedCompany(null);
    setFormData({
      company_code: '',
      company_name: '',
      owner_name: '',
      phone: '',
      email: '',
      address: '',
      logo: '',
      status: 'ACTIVE',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (company) => {
    setSelectedCompany(company);
    setFormData({
      company_code: company.company_code,
      company_name: company.company_name,
      owner_name: company.owner_name,
      phone: company.phone,
      email: company.email,
      address: company.address || '',
      logo: company.logo || '',
      status: company.status,
    });
    setModalOpen(true);
  };

  const handleStatusToggle = async (company) => {
    const nextStatus = company.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const confirmMsg = `Are you sure you want to ${
      nextStatus === 'ACTIVE' ? 'activate' : 'suspend'
    } company: ${company.company_name}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const response = await api.put(`/companies/${company.id}`, { status: nextStatus });
      if (response.data?.success) {
        toast.success(`Company status updated to ${nextStatus}!`);
        fetchCompanies();
      }
    } catch (error) {
      console.error('Failed to change company status:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedCompany) {
        // Edit Mode
        const response = await api.put(`/companies/${selectedCompany.id}`, formData);
        if (response.data?.success) {
          toast.success('Company details updated successfully!');
          setModalOpen(false);
          fetchCompanies();
        }
      } else {
        // Create Mode
        const response = await api.post('/companies', formData);
        if (response.data?.success) {
          toast.success('New company registered successfully!');
          setModalOpen(false);
          fetchCompanies();
        }
      }
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-indigo-600" />
            Company Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Register new business tenants, suspend accounts, and view employee/job card analytics.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Register Company
        </button>
      </div>

      {/* Advanced Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company code, name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors appearance-none"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Company Table */}
      {isLoading ? (
        <Loading message="Fetching registered SaaS company tenants..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="p-4">Company Profile</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">Platform Stats</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companies.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-slate-400 font-medium">
                      No companies match the selected search criteria.
                    </td>
                  </tr>
                ) : (
                  companies.map((company) => (
                    <tr key={company.id} className="hover:bg-slate-50/30 transition-colors">
                      {/* Name & Code */}
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{company.company_name}</div>
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 mt-1">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                            {company.company_code}
                          </span>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="p-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {company.phone}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {company.email}
                        </div>
                        {company.address && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {company.address}
                          </div>
                        )}
                      </td>

                      {/* Employee & Job Card Stats */}
                      <td className="p-4">
                        <div className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <Users className="w-4 h-4 text-indigo-500" />
                            {company._count?.employees || 0} Workforce
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <FileText className="w-4 h-4 text-blue-500" />
                            {company._count?.job_cards || 0} Job Cards
                          </span>
                        </div>
                      </td>

                      {/* Status Badges */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          company.status === 'ACTIVE' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            company.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                          }`} />
                          {company.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(company)}
                            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Company Details"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusToggle(company)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              company.status === 'ACTIVE' 
                                ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50' 
                                : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={company.status === 'ACTIVE' ? 'Suspend Company' : 'Activate Company'}
                          >
                            {company.status === 'ACTIVE' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
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

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                {selectedCompany ? 'Edit Company Details' : 'Register New Company'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Company Code *
                  </label>
                  <input
                    type="text"
                    name="company_code"
                    required
                    disabled={!!selectedCompany}
                    placeholder="e.g. COMP-001"
                    value={formData.company_code}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-colors uppercase font-mono font-bold"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    required
                    placeholder="e.g. Kurti Hub Inc"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Owner Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Primary Owner Name *
                  </label>
                  <input
                    type="text"
                    name="owner_name"
                    required
                    placeholder="e.g. Rajesh Patel"
                    value={formData.owner_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Account Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Owner Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="owner@company.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Owner Phone *
                  </label>
                  <input
                    type="text"
                    name="phone"
                    required
                    placeholder="e.g. +91 9988776655"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Business Address
                </label>
                <textarea
                  name="address"
                  rows="2"
                  placeholder="Street details, city, pincode..."
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 font-semibold text-xs rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow transition-all"
                >
                  {selectedCompany ? 'Update Tenant' : 'Register Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyManagementPage;

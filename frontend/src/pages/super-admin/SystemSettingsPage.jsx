import React, { useState } from 'react';
import { Settings, Globe, Banknote, ShieldAlert, Sparkles, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export const SystemSettingsPage = () => {
  const [settings, setSettings] = useState({
    default_currency: 'INR (₹)',
    default_timezone: 'Asia/Kolkata (IST)',
    number_series_prefix: 'JC-',
    number_series_digits: '6',
    max_companies_allowed: '50',
    trial_period_days: '30',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Global platform configurations saved successfully!');
    }, 800);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-7 h-7 text-indigo-600" />
          Global Platform Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure default behaviors, number series counters, default currency parameters, and timezone templates for all companies.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Configuration Panel */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-50 pb-3">
            <Globe className="w-4 h-4 text-indigo-500" />
            Regional & Localization Parameters
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Currency */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Default Currency Setup
              </label>
              <select
                name="default_currency"
                value={settings.default_currency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors font-medium text-slate-700"
              >
                <option value="INR (₹)">INR - Indian Rupee (₹)</option>
                <option value="USD ($)">USD - US Dollar ($)</option>
                <option value="EUR (€)">EUR - Euro (€)</option>
                <option value="GBP (£)">GBP - British Pound (£)</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Standard currency display unit for salary calculations and ledgers.
              </span>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                System Time Zone
              </label>
              <select
                name="default_timezone"
                value={settings.default_timezone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors font-medium text-slate-700"
              >
                <option value="Asia/Kolkata (IST)">Asia/Kolkata (GMT+05:30)</option>
                <option value="UTC">Coordinated Universal Time (UTC)</option>
                <option value="America/New_York (EST)">America/New_York (GMT-05:00)</option>
                <option value="Europe/London (GMT)">Europe/London (GMT)</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Standard timestamp zone for logging cutting/timeline completions.
              </span>
            </div>
          </div>
        </div>

        {/* Number Series Settings */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-50 pb-3">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Automatic Number Sequencing
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Number Series Prefix */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Job Card Code Prefix
              </label>
              <input
                type="text"
                name="number_series_prefix"
                value={settings.number_series_prefix}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors uppercase font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Default prefix for newly generated Job Cards (e.g. JC-000001).
              </span>
            </div>

            {/* Digit Length */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Padding Width (Digits)
              </label>
              <select
                name="number_series_digits"
                value={settings.number_series_digits}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors font-medium text-slate-700"
              >
                <option value="4">4 digits (e.g. 0001)</option>
                <option value="5">5 digits (e.g. 00001)</option>
                <option value="6">6 digits (e.g. 000001)</option>
                <option value="8">8 digits (e.g. 00000001)</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Zero-padding length for sequential numbers.
              </span>
            </div>
          </div>
        </div>

        {/* Subscription / Tenant Limits */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-50 pb-3">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            SaaS Subscriptions & Tenant Restrictions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Max Companies */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Maximum Tenant Capacity
              </label>
              <input
                type="number"
                name="max_companies_allowed"
                value={settings.max_companies_allowed}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors font-semibold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Hard ceiling for registered active company instances on this server node.
              </span>
            </div>

            {/* Trial Days */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Default Trial Window (Days)
              </label>
              <input
                type="number"
                name="trial_period_days"
                value={settings.trial_period_days}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors font-semibold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Number of free operational days granted to new registered companies.
              </span>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md transition-all hover:shadow-indigo-500/20 disabled:opacity-50"
          >
            {isSaving ? (
              <span>Saving Changes...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Platform Configuration
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemSettingsPage;

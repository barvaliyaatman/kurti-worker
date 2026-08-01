import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { api } from '../services/api.js';
import { ShieldAlert, Key, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const ForcePasswordResetPage = () => {
  const { user, checkAuthStatus, logout } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/change-password', { newPassword: password });
      if (response.data?.success) {
        toast.success('Your password has been changed successfully! Redirecting...');
        
        // Refresh auth state to update user.password_reset_required flag
        await checkAuthStatus();

        // Redirect based on role
        const role = user?.role?.toUpperCase();
        if (role === 'SUPER_ADMIN') {
          navigate('/super-admin/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        setError(response.data?.message || 'Failed to update password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12 relative overflow-hidden select-none font-sans">
      {/* Background blur effects */}
      <div className="absolute right-0 top-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-0 bottom-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 z-10">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden p-8 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Security Reset Required</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Your administrator has flagged this account for a mandatory credentials update. Please select a new secure password.
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-4 pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50 font-medium text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <Key className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-11 px-4 pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50 font-medium text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <Key className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-6 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Credentials...</span>
                </>
              ) : (
                <>
                  <span>Change Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="border-t border-slate-100 pt-4 text-center">
            <button
              onClick={logout}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-500 hover:underline cursor-pointer"
            >
              Sign out and return to Login
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ForcePasswordResetPage;

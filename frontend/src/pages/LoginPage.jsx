import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Scissors, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle,
  Loader2,
  CheckCircle,
  Sparkles,
  Layers,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth.js';
import { APP_NAME, FACTORY_NAME, ROUTES } from '../constants/index.js';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = async (data) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      const result = await login(data.email, data.password, data.rememberMe);

      if (result.success) {
        toast.success(`Welcome back, ${result.user?.full_name || 'User'}!`);
        
        // Automated Redirects based on Role
        const role = result.user?.role?.toUpperCase();
        if (role === 'SUPER_ADMIN') {
          navigate('/super-admin/dashboard', { replace: true });
        } else if (role === 'OWNER') {
          navigate(ROUTES.HOME, { replace: true });
        } else if (role === 'MANAGER') {
          navigate(ROUTES.HOME, { replace: true });
        } else if (role === 'CUTTING_MASTER') {
          navigate(ROUTES.HOME, { replace: true });
        } else {
          navigate(ROUTES.HOME, { replace: true });
        }
      } else {
        // Map friendly error messages
        const msg = result.message || '';
        if (msg.includes('deactivated') || msg.includes('disabled')) {
          setServerError('Your account has been locked. Please contact your system administrator.');
        } else if (msg.includes('company') || msg.includes('suspended')) {
          setServerError('Your company tenant subscription is suspended. Please contact platform support.');
        } else if (msg.includes('unauthorized') || msg.includes('credentials') || msg.includes('email or password')) {
          setServerError('Invalid email or password. Please verify and try again.');
        } else if (msg.includes('connect') || msg.includes('fetch') || msg.includes('Network Error')) {
          setServerError('The server is currently unavailable. Please verify your internet connection or try again later.');
        } else {
          setServerError(msg || 'An unexpected error occurred. Please try again.');
        }
      }
    } catch (_err) {
      setServerError('The server is currently offline or unreachable. Please try again in a few moments.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (email, password) => {
    setValue('email', email);
    setValue('password', password);
    setServerError('');
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans select-none">
      {/* LEFT SIDE: Brand & Illustrative Section (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Dynamic Glowing background circles */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-0 bottom-0 -mb-10 -ml-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white">{APP_NAME}</span>
            <span className="text-[10px] text-indigo-400 font-bold block -mt-1 tracking-wider uppercase">Enterprise</span>
          </div>
        </div>

        {/* Main Content Info */}
        <div className="relative z-10 space-y-6 my-auto max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Platform Version 1.2
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-slate-100">
            Seamless Factory Operations & Workforce ERP
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Monitor real-time cutting progress, assign stitching sets, and automate piece-rate wage calculation in a unified platform.
          </p>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-900">
            <div className="flex gap-3">
              <div className="p-2 bg-slate-900 text-indigo-400 rounded-lg h-9 w-9 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-200 text-sm">Isolated Tenancy</h4>
                <p className="text-xs text-slate-500 mt-0.5">Strict multi-company database separation bounds.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="p-2 bg-slate-900 text-indigo-400 rounded-lg h-9 w-9 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-200 text-sm">Instant Ledger</h4>
                <p className="text-xs text-slate-500 mt-0.5">Auto-compiling worker ledger and pay slips.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Left Footer Info */}
        <div className="relative z-10 text-xs text-slate-500 font-medium">
          © {new Date().getFullYear()} {APP_NAME} SaaS ERP. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE: Login Card Container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-6">
          
          {/* Logo Header (Visible on Mobile Only) */}
          <div className="flex flex-col items-center text-center lg:hidden mb-2">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 shadow-md">
              <Scissors className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{APP_NAME}</h1>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">{FACTORY_NAME}</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Account Access</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your administrative credentials to access your workspace.
              </p>
            </div>

            {/* Error Message */}
            {serverError && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5 text-rose-700 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                <span className="text-xs font-semibold leading-normal">{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="name@company.com"
                    {...register('email')}
                    className={`w-full h-11 px-4 pl-10 rounded-xl border bg-slate-50 font-medium text-xs text-slate-800 focus:outline-none focus:ring-1 focus:bg-white transition-all ${
                      errors.email
                        ? 'border-rose-400 focus:ring-rose-400'
                        : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                  />
                  <Mail className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1 pl-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    disabled
                    className="text-[11px] text-slate-400 cursor-not-allowed font-semibold hover:underline"
                    title="Self password resets are disabled on cloud tenants."
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    className={`w-full h-11 px-4 pl-10 pr-10 rounded-xl border bg-slate-50 font-medium text-xs text-slate-800 focus:outline-none focus:ring-1 focus:bg-white transition-all ${
                      errors.password
                        ? 'border-rose-400 focus:ring-rose-400'
                        : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                  />
                  <Lock className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1 pl-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 select-none">
                  <input
                    type="checkbox"
                    {...register('rememberMe')}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 mt-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Subtle Dev demo credentials switcher at the very bottom (in small text, easily hidden for production) */}
          <div className="text-center bg-slate-100/50 rounded-xl p-3 border border-slate-200/50">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Cloud Tenant Sandbox Credentials
            </p>
            <div className="flex flex-wrap justify-center gap-1.5">
              <button
                onClick={() => handleFillDemo('superadmin@factory.com', 'Super@123')}
                className="px-2 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded text-[10px] font-bold border border-slate-200 transition-colors cursor-pointer"
              >
                Super Admin
              </button>
              <button
                onClick={() => handleFillDemo('owner@factory.com', 'Owner@123')}
                className="px-2 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded text-[10px] font-bold border border-slate-200 transition-colors cursor-pointer"
              >
                Owner
              </button>
              <button
                onClick={() => handleFillDemo('manager@factory.com', 'Manager@123')}
                className="px-2 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded text-[10px] font-bold border border-slate-200 transition-colors cursor-pointer"
              >
                Manager
              </button>
              <button
                onClick={() => handleFillDemo('cutting@factory.com', 'Cutting@123')}
                className="px-2 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded text-[10px] font-bold border border-slate-200 transition-colors cursor-pointer"
              >
                Cutting Master
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

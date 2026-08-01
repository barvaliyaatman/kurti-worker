import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Scissors, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth.js';
import { APP_NAME, FACTORY_NAME, ROUTES } from '../constants/index.js';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
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
      email: 'owner@factory.com',
      password: 'Owner@123',
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
        navigate(ROUTES.HOME, { replace: true });
      } else {
        setServerError(result.message || 'Login failed. Please check credentials.');
      }
    } catch (_err) {
      setServerError('An unexpected connection error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setDemoCredentials = (email, password) => {
    setValue('email', email);
    setValue('password', password);
    setServerError('');
  };

  return (
    <div className="min-h-screen bg-factory-bg flex flex-col justify-center items-center p-4 sm:p-6 select-none">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto mb-3 shadow-touch">
            <Scissors className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-factory-navy tracking-tight">
            {APP_NAME}
          </h1>
          <p className="text-xs sm:text-sm text-factory-muted font-medium mt-0.5">
            {FACTORY_NAME}
          </p>
        </div>

        {/* Login Card */}
        <div className="card-factory p-6 sm:p-8">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-factory-navy">Welcome Back</h2>
            <p className="text-xs text-factory-muted mt-1">
              Sign in to manage factory job cards, cutting, and salaries.
            </p>
          </div>

          {/* Role Access Banner */}
          <div className="mb-5 bg-brand-50 border border-brand-100 rounded-xl p-3 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
            <p className="text-xs text-brand-900 leading-snug">
              Only <strong>Owner</strong>, <strong>Manager</strong>, and <strong>Cutting Master</strong> can log in. Workers do not login.
            </p>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-3 text-red-700 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <div className="text-xs font-semibold leading-relaxed">{serverError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-factory-navy uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@factory.com"
                  {...register('email')}
                  className={`w-full h-12 px-4 pl-11 rounded-xl border bg-slate-50 font-medium text-factory-navy focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-factory-border focus:ring-brand-500'
                  }`}
                />
                <Mail className="w-5 h-5 text-factory-muted absolute left-3.5 top-3.5" />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 font-medium mt-1 pl-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-factory-navy uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full h-12 px-4 pl-11 pr-11 rounded-xl border bg-slate-50 font-medium text-factory-navy focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-factory-border focus:ring-brand-500'
                  }`}
                />
                <Lock className="w-5 h-5 text-factory-muted absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-factory-muted hover:text-factory-navy focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 font-medium mt-1 pl-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-factory-navy select-none">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span>Remember Me</span>
              </label>

              <button
                type="button"
                disabled
                className="text-xs text-slate-400 cursor-not-allowed font-medium hover:underline"
                title="Forgot Password disabled in Phase P-002"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full mt-4 h-12 flex items-center justify-center gap-2 font-bold text-base disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Log In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold text-factory-muted uppercase tracking-wider mb-2 text-center">
              Quick Seed Account Fill
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('owner@factory.com', 'Owner@123')}
                className="py-1.5 px-2 bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-factory-navy rounded-lg text-[11px] font-semibold transition-colors text-center"
              >
                Owner
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('manager@factory.com', 'Manager@123')}
                className="py-1.5 px-2 bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-factory-navy rounded-lg text-[11px] font-semibold transition-colors text-center"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('cutting@factory.com', 'Cutting@123')}
                className="py-1.5 px-2 bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-factory-navy rounded-lg text-[11px] font-semibold transition-colors text-center"
              >
                Cutting Master
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-factory-muted mt-6">
          Worker ERP Version 1.0 • Phase P-002 Auth System
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

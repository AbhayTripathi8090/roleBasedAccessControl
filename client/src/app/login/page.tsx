'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Lock, Mail, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, UserPlus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux.hooks';
import { loginThunk } from '@/features/auth/authThunks';
import { selectAuthLoading, selectAuthError, selectIsAuthenticated, selectCurrentUser } from '@/features/auth/authSelectors';
import { clearAuthError } from '@/features/auth/authSlice';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const isLoading = useAppSelector(selectAuthLoading);
  const authError = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, currentUser, router]);

  // Clear auth errors on unmount or form re-submission
  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const onSubmit = async (data: LoginFormData) => {
    dispatch(clearAuthError());
    const resultAction = await dispatch(loginThunk(data));
    if (loginThunk.fulfilled.match(resultAction)) {
      router.push('/dashboard');
    }
  };

  // Demo credential pre-fill helpers
  const fillPresetCredentials = (email: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', 'password123', { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-8 relative overflow-hidden">
      {/* Dynamic Background Blur Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
            <Shield className="w-5 h-5 text-indigo-400" />
            <span className="text-sm font-bold tracking-wide bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              WorkFlow RBAC Platform
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Welcome Back
          </h1>
          <p className="text-sm text-slate-400 max-w-xs mx-auto">
            Sign in to access your enterprise dashboard and managed resources.
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* API Error Alert */}
          {authError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-rose-200">Authentication Failed</p>
                <p className="text-xs text-rose-300/90">{authError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  autoComplete="email"
                  disabled={isLoading}
                  {...register('email')}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border text-slate-100 placeholder-slate-500 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    errors.email ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-400 font-medium flex items-center gap-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isLoading}
                  {...register('password')}
                  className={`w-full pl-10 pr-11 py-2.5 bg-slate-950/80 border text-slate-100 placeholder-slate-500 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    errors.password ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-400 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/35 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to WorkFlow</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">
              Fill Demo Role Credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillPresetCredentials('admin@test.com')}
                className="px-2.5 py-1.5 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-slate-700/50 transition-colors text-center"
              >
                Admin User
              </button>
              <button
                type="button"
                onClick={() => fillPresetCredentials('manager@test.com')}
                className="px-2.5 py-1.5 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-slate-700/50 transition-colors text-center"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => fillPresetCredentials('user@test.com')}
                className="px-2.5 py-1.5 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-slate-700/50 transition-colors text-center"
              >
                Member User
              </button>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center pt-2 border-t border-slate-800/80">
            <p className="text-xs text-slate-400">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold underline inline-flex items-center gap-1">
                <UserPlus className="w-3.5 h-3.5" />
                Register New Account
              </Link>
            </p>
          </div>
        </div>

        {/* Security Notice Footer */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <p className="flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            Protected by HttpOnly JWT Cookie Authentication
          </p>
        </div>
      </div>
    </div>
  );
}

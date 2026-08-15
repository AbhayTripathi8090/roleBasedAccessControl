'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Lock, Mail, User as UserIcon, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux.hooks';
import { registerThunk } from '@/features/auth/authThunks';
import { selectAuthLoading, selectAuthError, selectIsAuthenticated, selectCurrentUser } from '@/features/auth/authSelectors';
import { clearAuthError } from '@/features/auth/authSlice';
import { UserRole } from '@/types';

const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name cannot exceed 50 characters'),
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(UserRole),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
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
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: UserRole.USER,
    },
  });

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, currentUser, router]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    dispatch(clearAuthError());
    const resultAction = await dispatch(registerThunk(data));
    if (registerThunk.fulfilled.match(resultAction)) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background Gradients */}
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
            Create an Account
          </h1>
          <p className="text-sm text-slate-400 max-w-xs mx-auto">
            Register a new user account with role-based access control permissions.
          </p>
        </div>

        {/* Register Form Card */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* API Error Alert */}
          {authError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-rose-200">Registration Failed</p>
                <p className="text-xs text-rose-300/90">{authError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  disabled={isLoading}
                  {...register('name')}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border text-slate-100 placeholder-slate-500 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    errors.name ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                  }`}
                />
              </div>
              {errors.name && <p className="text-xs text-rose-400 font-medium">{errors.name.message}</p>}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
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
                  disabled={isLoading}
                  {...register('email')}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border text-slate-100 placeholder-slate-500 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    errors.email ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-rose-400 font-medium">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
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
              {errors.password && <p className="text-xs text-rose-400 font-medium">{errors.password.message}</p>}
            </div>

            {/* Role Selection */}
            <div className="space-y-1.5">
              <label htmlFor="role" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                System Role
              </label>
              <select
                id="role"
                disabled={isLoading}
                {...register('role')}
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-sm transition-all focus:outline-none"
              >
                <option value={UserRole.USER}>Regular Member (USER)</option>
                <option value={UserRole.MANAGER}>Project Manager (MANAGER)</option>
                <option value={UserRole.ADMIN}>System Administrator (ADMIN)</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center pt-2 border-t border-slate-800/80">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
                Sign In Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

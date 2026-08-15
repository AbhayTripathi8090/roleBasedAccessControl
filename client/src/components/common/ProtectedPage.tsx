'use client';

import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionAction } from '@/lib/permissions';
import { UserRole } from '@/types';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ProtectedPageProps {
  action?: PermissionAction;
  roles?: UserRole[];
  children: React.ReactNode;
}

/**
 * Page-level permission guard wrapper for Next.js App Router views
 */
export function ProtectedPage({ action, roles, children }: ProtectedPageProps) {
  const { userRole, hasRole, can } = usePermissions();

  let isPermitted = true;

  if (roles && roles.length > 0) {
    isPermitted = isPermitted && hasRole(...roles);
  }

  if (action) {
    isPermitted = isPermitted && can(action);
  }

  if (!isPermitted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
        <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <ShieldAlert className="w-12 h-12" />
        </div>

        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-extrabold text-white">403 Access Denied</h2>
          <p className="text-sm text-slate-400">
            Your current role <strong className="text-rose-300 font-bold uppercase">{userRole}</strong> does not possess permission to access this page.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Workspace Dashboard</span>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}

'use client';

import React from 'react';
import { useAppSelector } from '@/hooks/redux.hooks';
import { selectCurrentUser } from '@/features/auth/authSelectors';
import { UserRole } from '@/types';
import { AdminDashboardView } from '@/components/dashboard/AdminDashboardView';
import { ManagerDashboardView } from '@/components/dashboard/ManagerDashboardView';
import { UserDashboardView } from '@/components/dashboard/UserDashboardView';

export default function DashboardOverviewPage() {
  const currentUser = useAppSelector(selectCurrentUser);

  if (!currentUser) return null;

  switch (currentUser.role) {
    case UserRole.ADMIN:
      return <AdminDashboardView />;
    case UserRole.MANAGER:
      return <ManagerDashboardView />;
    case UserRole.USER:
    default:
      return <UserDashboardView />;
  }
}

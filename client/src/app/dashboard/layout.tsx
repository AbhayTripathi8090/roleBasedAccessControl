'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux.hooks';
import { fetchCurrentUserThunk } from '@/features/auth/authThunks';
import { selectCurrentUser, selectIsAuthenticated, selectIsInitializing } from '@/features/auth/authSelectors';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const currentUser = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitializing = useAppSelector(selectIsInitializing);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCurrentUserThunk());
  }, [dispatch]);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.push('/login');
    }
  }, [isInitializing, isAuthenticated, router]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Verifying Session & Loading Workspace...</p>
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Role-Aware Sidebar */}
      <Sidebar
        userRole={currentUser.role}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <Navbar
          user={currentUser}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

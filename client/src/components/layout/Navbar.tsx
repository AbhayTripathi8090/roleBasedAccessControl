'use client';

import React from 'react';
import { User } from '@/types';
import { UserProfileMenu } from './UserProfileMenu';
import { Menu } from 'lucide-react';

interface NavbarProps {
  user: User;
  onOpenMobileSidebar: () => void;
}

export function Navbar({ user, onOpenMobileSidebar }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/80 border-b border-slate-800/80 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between">
      {/* Left side: Mobile menu toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <h2 className="text-sm font-bold text-white tracking-tight">WorkFlow Workspace</h2>
        </div>
      </div>

      {/* Right side: User Profile Menu */}
      <div className="flex items-center gap-3">
        <UserProfileMenu user={user} />
      </div>
    </header>
  );
}

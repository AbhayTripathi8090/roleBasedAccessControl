'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRole } from '@/types';
import {
  Shield,
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  FileText,
  X,
} from 'lucide-react';

interface SidebarProps {
  userRole: UserRole;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function Sidebar({ userRole, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Role-Aware Navigation Definitions
  const getNavItems = (role: UserRole): NavItem[] => {
    switch (role) {
      case UserRole.ADMIN:
        return [
          { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { label: 'Users', href: '/dashboard/users', icon: Users },
          { label: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
          { label: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
          { label: 'Audit Logs', href: '/dashboard/audit-logs', icon: FileText },
        ];
      case UserRole.MANAGER:
        return [
          { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { label: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
          { label: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
        ];
      default:
        return [
          { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { label: 'My Projects', href: '/dashboard/projects', icon: FolderKanban },
          { label: 'My Tasks', href: '/dashboard/tasks', icon: CheckSquare },
        ];
    }
  };

  const navItems = getNavItems(userRole);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-slate-900/95 border-r border-slate-800/80 backdrop-blur-xl z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header / Brand */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 group-hover:border-indigo-500/40 transition-colors">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base text-white tracking-tight leading-none">WorkFlow</h1>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">RBAC Platform</span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {userRole} Workspace
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  active
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Role Badge Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Active Scope:</span>
            <span className="font-bold text-indigo-400 uppercase tracking-wider">{userRole}</span>
          </div>
        </div>
      </aside>
    </>
  );
}

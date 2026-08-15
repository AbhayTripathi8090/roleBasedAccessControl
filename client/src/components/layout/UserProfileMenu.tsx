'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/hooks/redux.hooks';
import { logoutThunk } from '@/features/auth/authThunks';
import { User, UserRole } from '@/types';
import { User as UserIcon, LogOut, Shield, ChevronDown } from 'lucide-react';

interface UserProfileMenuProps {
  user: User;
}

export function UserProfileMenu({ user }: UserProfileMenuProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await dispatch(logoutThunk());
    router.push('/login');
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case UserRole.MANAGER:
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default:
        return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 pr-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs uppercase shadow-md">
          {user.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            user.name.charAt(0)
          )}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">{user.name}</p>
          <p className="text-[10px] text-slate-400 font-medium">{user.role}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-3 border-b border-slate-800/80 space-y-1">
            <p className="text-sm font-bold text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
            <div className="pt-1.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeStyle(user.role)}`}>
                <Shield className="w-3 h-3" />
                {user.role}
              </span>
            </div>
          </div>

          <div className="p-1.5">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

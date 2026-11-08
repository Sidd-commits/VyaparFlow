'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';
import { registerUserAction, logoutUserAction } from '@/app/actions';
import { LogIn, UserPlus, ArrowRight, UserCheck, LogOut } from 'lucide-react';

interface AuthContainerProps {
  currentUser?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

export default function AuthContainer({ currentUser }: AuthContainerProps) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  useEffect(() => {
    if (searchParams.get('tab') === 'register') {
      setActiveTab('register');
    } else if (searchParams.get('tab') === 'login') {
      setActiveTab('login');
    }
  }, [searchParams]);

  return (
    <div className={`w-full mx-auto space-y-5 transition-all duration-300 ${activeTab === 'register' ? 'max-w-xl' : 'max-w-md'}`}>
      {/* If already signed in, display helpful banner */}
      {currentUser && (
        <div className="bg-emerald-50 border border-emerald-200/90 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-emerald-950 font-bold">
                Currently signed in as <span className="underline">{currentUser.name}</span> ({currentUser.role})
              </p>
              <p className="text-[11px] text-emerald-700 font-medium">
                {currentUser.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={currentUser.role === 'PROVIDER' ? '/provider' : currentUser.role === 'ADMIN' ? '/admin' : '/dashboard'}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={async () => {
                await logoutUserAction();
              }}
              className="px-3 py-2 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab Switcher Header (Sliding Spring Pill) */}
      <div className="flex items-center justify-center">
        <div className="bg-slate-100/90 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/90 w-full max-w-sm shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`relative flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer select-none ${
              activeTab === 'login' ? 'text-orange-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {activeTab === 'login' && (
              <motion.div
                layoutId="auth-tab-pill"
                className="absolute inset-0 bg-white rounded-xl shadow-xs border border-slate-200/70"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <LogIn className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`relative flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer select-none ${
              activeTab === 'register' ? 'text-orange-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {activeTab === 'register' && (
              <motion.div
                layoutId="auth-tab-pill"
                className="absolute inset-0 bg-white rounded-xl shadow-xs border border-slate-200/70"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <UserPlus className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">Create Account</span>
          </button>
        </div>
      </div>

      {/* Content based on Active Tab */}
      <div>
        {activeTab === 'login' ? (
          <LoginForm onSwitchToRegister={() => setActiveTab('register')} />
        ) : (
          <RegisterForm action={registerUserAction} />
        )}
      </div>
    </div>
  );
}

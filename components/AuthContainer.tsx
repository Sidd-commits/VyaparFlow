'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';
import { registerUserAction, logoutUserAction } from '@/app/actions';
import { LogIn, UserPlus, Sparkles, Ship, ArrowRight, UserCheck, LogOut } from 'lucide-react';

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
    }
  }, [searchParams]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* If already signed in, display helpful banner */}
      {currentUser && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-emerald-900 font-bold">
                Currently signed in as <span className="underline">{currentUser.name}</span> ({currentUser.role})
              </p>
              <p className="text-[11px] text-emerald-700">
                {currentUser.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={currentUser.role === 'PROVIDER' ? '/provider' : currentUser.role === 'ADMIN' ? '/admin' : '/dashboard'}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={async () => {
                await logoutUserAction();
              }}
              className="px-3 py-2 bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Tab Switcher Header */}
      <div className="flex items-center justify-center">
        <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center gap-1 shadow-inner border border-slate-300/60 max-w-md w-full">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-slate-900 shadow-md font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <LogIn className="w-4 h-4 text-orange-600" />
            Sign In & Demo Logins
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-slate-900 shadow-md font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <UserPlus className="w-4 h-4 text-orange-600" />
            Register New MSME
          </button>
        </div>
      </div>

      {/* Content based on Active Tab */}
      {activeTab === 'login' ? (
        <LoginForm onSwitchToRegister={() => setActiveTab('register')} />
      ) : (
        <RegisterForm action={registerUserAction} />
      )}
    </div>
  );
}

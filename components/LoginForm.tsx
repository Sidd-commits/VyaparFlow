'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { loginUserAction, quickLoginAction } from '@/app/actions';
import {
  saveRecentAccount,
  getRecentAccounts,
  removeRecentAccount,
  formatRelativeTime,
  type SavedAccount,
} from '@/lib/recentAccounts';
import {
  Ship,
  Building2,
  Truck,
  ShieldCheck,
  Award,
  FileText,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  CheckCircle2,
  KeyRound,
  History,
  X,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';

interface LoginFormProps {
  onSwitchToRegister?: () => void;
}

const PRIMARY_DEMO_PERSONAS = [
  {
    role: 'MSME' as const,
    name: 'Rajesh Patil',
    company: 'Palghar Quality Agro Pvt Ltd',
    email: 'msme@palghar-exports.com',
    target: 'msme@palghar-exports.com',
    desc: 'Alphonso Mango Pulp → UAE (Active Export Readiness Blockers)',
    badge: 'Palghar MSME Exporter',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: Building2,
  },
  {
    role: 'PROVIDER' as const,
    name: 'Captain Vikram Sharma',
    company: 'SwiftGlobe Freight Logistics',
    email: 'provider@freight.com',
    target: 'provider@freight.com',
    desc: 'Freight rate quote comparison & multi-agency logistics desk',
    badge: 'Freight Forwarder',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Truck,
  },
];

const SECONDARY_DEMO_PERSONAS = [
  {
    role: 'PROVIDER' as const,
    name: 'Dr. Anita Roy',
    company: 'Apex Agri Testing Labs',
    email: 'lab@certify.com',
    target: 'lab@certify.com',
    desc: 'Phytosanitary & food safety testing certifications desk',
    badge: 'Testing Lab',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Award,
  },
  {
    role: 'PROVIDER' as const,
    name: 'Suresh Menon',
    company: 'Palghar Port CHA Desk',
    email: 'cha@customs.com',
    target: 'cha@customs.com',
    desc: 'Customs clearance declarations & duty assessment desk',
    badge: 'Customs CHA',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: FileText,
  },
  {
    role: 'ADMIN' as const,
    name: 'Platform Operator Admin',
    company: 'VyaparFlow Compliance HQ',
    email: 'admin@vyaparflow.com',
    target: 'admin@vyaparflow.com',
    desc: 'Compliance rules configurator & document verification audit console',
    badge: 'Platform Admin',
    badgeColor: 'bg-slate-900 text-orange-400 border-slate-700',
    icon: ShieldCheck,
  },
];

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [isPending, startTransition] = useTransition();
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [showAllDemos, setShowAllDemos] = useState(false);

  // Load saved accounts from localStorage upon client mount
  useEffect(() => {
    setSavedAccounts(getRecentAccounts());
  }, []);

  const handleAccountLogin = (account: {
    email: string;
    name?: string;
    role?: 'MSME' | 'PROVIDER' | 'ADMIN';
    companyName?: string;
  }) => {
    setSelectedTarget(account.email);
    // Persist/refresh this account as most recent
    saveRecentAccount({
      email: account.email,
      name: account.name || account.email.split('@')[0],
      role: account.role || 'MSME',
      companyName: account.companyName,
    });
    startTransition(async () => {
      await quickLoginAction(account.email);
    });
  };

  const handleRemoveSaved = (e: React.MouseEvent, targetEmail: string) => {
    e.stopPropagation();
    const updated = removeRecentAccount(targetEmail);
    setSavedAccounts(updated);
  };

  const handleManualFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const emailInput = form.elements.namedItem('email') as HTMLInputElement;
    if (emailInput?.value) {
      saveRecentAccount({
        email: emailInput.value,
        name: emailInput.value.split('@')[0],
        role: emailInput.value.includes('admin')
          ? 'ADMIN'
          : emailInput.value.includes('provider') || emailInput.value.includes('lab') || emailInput.value.includes('cha')
          ? 'PROVIDER'
          : 'MSME',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. SAVED & RECENTLY LOGGED IN ACCOUNTS (Top Priority) */}
      {savedAccounts.length > 0 && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border-2 border-orange-500/30 shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold font-serif text-slate-900 flex items-center gap-2">
                  Recently Used Accounts on this Device
                  <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full">
                    {savedAccounts.length} Saved
                  </span>
                </h2>
                <p className="text-[11px] text-slate-500">
                  Click to quickly resume your session without re-entering credentials
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {savedAccounts.map((acc) => {
              const isLoading = isPending && selectedTarget === acc.email;
              const isMsme = acc.role === 'MSME';
              const isProvider = acc.role === 'PROVIDER';

              return (
                <div
                  key={acc.email}
                  onClick={() => handleAccountLogin(acc)}
                  className={`w-full p-3.5 rounded-xl border border-slate-200 bg-linear-to-r from-orange-50/40 via-white to-white hover:border-orange-400 hover:shadow-md transition-all flex items-center justify-between group cursor-pointer ${
                    isLoading ? 'opacity-70 ring-2 ring-orange-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      {isMsme ? (
                        <Building2 className="w-5 h-5 text-orange-400" />
                      ) : isProvider ? (
                        <Truck className="w-5 h-5 text-blue-400" />
                      ) : (
                        <ShieldCheck className="w-5 h-5 text-orange-400" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {acc.name}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md border bg-orange-50 text-orange-700 border-orange-200">
                          {acc.role}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          • Active {formatRelativeTime(acc.lastActive)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate mt-0.5">
                        {acc.companyName ? (
                          <>
                            <strong className="font-medium text-slate-800">{acc.companyName}</strong> —{' '}
                          </>
                        ) : null}
                        <span className="text-slate-500">{acc.email}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pl-2">
                    <button
                      type="button"
                      onClick={(e) => handleRemoveSaved(e, acc.email)}
                      title="Forget this account from this device"
                      className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    <div className="px-3 py-1.5 rounded-lg bg-orange-600 group-hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors">
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. DEMO ACCOUNTS (1-2 Featured + Expandable for all roles) */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-bold text-slate-900">
                1-Click Instant Demo Access
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Instant evaluation profiles with pre-seeded shipment and compliance records
            </p>
          </div>
          <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
            Evaluation Mode
          </span>
        </div>

        {/* Primary 2 Demos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PRIMARY_DEMO_PERSONAS.map((p) => {
            const Icon = p.icon;
            const isLoading = isPending && selectedTarget === p.target;
            return (
              <button
                key={p.target}
                type="button"
                onClick={() => handleAccountLogin(p)}
                disabled={isPending}
                className={`text-left p-4 rounded-xl border border-slate-200 hover:border-orange-400 hover:shadow-md bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between gap-3 group cursor-pointer ${
                  isLoading ? 'opacity-70 ring-2 ring-orange-500' : ''
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${p.badgeColor}`}>
                      {p.badge}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-orange-600 transition-colors">
                      {p.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {p.company}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                      {p.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold text-orange-600">
                  <span>Enter as {p.name.split(' ')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Expand/Collapse other demo personas */}
        <div>
          <button
            type="button"
            onClick={() => setShowAllDemos(!showAllDemos)}
            className="w-full py-2 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {showAllDemos ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                Hide other demo personas (Lab, Customs CHA, Platform Admin)
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                Show other demo roles: Certification Lab, Customs CHA, Platform Admin
              </>
            )}
          </button>

          {showAllDemos && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 animate-in fade-in duration-200">
              {SECONDARY_DEMO_PERSONAS.map((p) => {
                const Icon = p.icon;
                const isLoading = isPending && selectedTarget === p.target;
                return (
                  <button
                    key={p.target}
                    type="button"
                    onClick={() => handleAccountLogin(p)}
                    disabled={isPending}
                    className={`text-left p-3 rounded-xl border border-slate-200 hover:border-slate-400 hover:shadow-xs bg-white transition-all flex flex-col justify-between gap-2 group cursor-pointer ${
                      isLoading ? 'opacity-70 ring-2 ring-orange-500' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Icon className="w-4 h-4 text-slate-600" />
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${p.badgeColor}`}>
                          {p.badge}
                        </span>
                      </div>
                      <h5 className="font-bold text-xs text-slate-900">{p.name}</h5>
                      <p className="text-[10px] text-slate-500">{p.company}</p>
                    </div>
                    <div className="text-[10px] font-bold text-slate-700 flex items-center justify-between pt-1 border-t border-slate-100">
                      <span>Sign In</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. MANUAL SIGN IN WITH EMAIL & PASSWORD */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <KeyRound className="w-4 h-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900">
            Sign In with Email & Password
          </h3>
        </div>

        <form action={loginUserAction} onSubmit={handleManualFormSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. your-name@company.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-orange-500 text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-orange-500 text-xs"
                required
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Default demo password: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">password123</code>
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            Sign In & Save to this Device →
          </button>
        </form>

        {onSwitchToRegister && (
          <div className="text-center pt-2 text-xs text-slate-600">
            Don&apos;t have an account yet?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-orange-600 font-bold hover:underline cursor-pointer"
            >
              Register new MSME account →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

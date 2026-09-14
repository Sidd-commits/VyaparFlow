'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { loginUserAction } from '@/app/actions';
import {
  getRecentAccounts,
  removeRecentAccount,
  saveRecentAccount,
  type SavedAccount,
} from '@/lib/recentAccounts';
import {
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  History,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface LoginFormProps {
  onSwitchToRegister?: () => void;
}

const ERROR_MESSAGES: Record<string, { title: string; desc: string; type: 'error' | 'warning' | 'info' }> = {
  invalid_password: {
    title: 'Incorrect Password',
    desc: 'The password you entered does not match our records. Please check and try again.',
    type: 'error',
  },
  user_not_found: {
    title: 'Account Not Found',
    desc: 'No account was found with that email address. Please check your spelling or register a new account.',
    type: 'warning',
  },
  use_google_signin: {
    title: 'Google Account Detected',
    desc: 'This account was created with Google. Please click "Continue with Google" above to sign in securely.',
    type: 'info',
  },
  email_required: {
    title: 'Email Required',
    desc: 'Please enter your registered email address.',
    type: 'warning',
  },
  password_required: {
    title: 'Password Required',
    desc: 'Please enter your account password to sign in.',
    type: 'warning',
  },
  google_not_configured: {
    title: 'Google OAuth Not Configured',
    desc: 'GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing in .env. Please sign in with email/password.',
    type: 'warning',
  },
  google_auth_failed: {
    title: 'Google Authentication Cancelled',
    desc: 'Google sign-in was cancelled or encountered an issue. Please try again.',
    type: 'error',
  },
  google_token_exchange_failed: {
    title: 'Google Token Exchange Failed',
    desc: 'Could not verify token with Google. Please check your Authorized redirect URIs in Google Cloud Console.',
    type: 'error',
  },
  google_profile_failed: {
    title: 'Google Profile Access Failed',
    desc: 'Unable to retrieve your email profile from Google. Please try again.',
    type: 'error',
  },
  google_unexpected_error: {
    title: 'Authentication Error',
    desc: 'An unexpected error occurred during Google sign-in. Please try again or sign in with email.',
    type: 'error',
  },
};

function GoogleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('error');

  const [selectedRole, setSelectedRole] = useState<'MSME' | 'PROVIDER'>('MSME');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [showHelperAccounts, setShowHelperAccounts] = useState(false);

  useEffect(() => {
    setSavedAccounts(getRecentAccounts());
  }, []);

  const handleSelectEmail = (targetEmail: string, roleHint?: 'MSME' | 'PROVIDER' | 'ADMIN') => {
    setEmail(targetEmail);
    if (roleHint && (roleHint === 'MSME' || roleHint === 'PROVIDER')) {
      setSelectedRole(roleHint);
    }
    const pwdInput = document.getElementById('password-input') as HTMLInputElement;
    if (pwdInput) {
      pwdInput.focus();
    }
  };

  const handleRemoveSaved = (e: React.MouseEvent, targetEmail: string) => {
    e.stopPropagation();
    const updated = removeRecentAccount(targetEmail);
    setSavedAccounts(updated);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (email) {
      saveRecentAccount({
        email,
        name: email.split('@')[0],
        role: selectedRole,
      });
    }
    startTransition(async () => {
      await loginUserAction(formData);
    });
  };

  const errorInfo = errorCode ? ERROR_MESSAGES[errorCode] : null;

  return (
    <div className="w-full space-y-4">
      {/* 1. ALERT BANNER (IF ERROR OR NOTICE) */}
      {errorInfo && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xs ${
            errorInfo.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : errorInfo.type === 'info'
              ? 'bg-blue-50 border-blue-200 text-blue-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <AlertCircle
            className={`w-5 h-5 shrink-0 mt-0.5 ${
              errorInfo.type === 'error'
                ? 'text-rose-600'
                : errorInfo.type === 'info'
                ? 'text-blue-600'
                : 'text-amber-600'
            }`}
          />
          <div className="space-y-1 min-w-0 flex-1">
            <h4 className="font-bold">{errorInfo.title}</h4>
            <p className="opacity-90 leading-relaxed text-[11px]">{errorInfo.desc}</p>
            {errorCode === 'user_not_found' && onSwitchToRegister && (
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-900 underline hover:text-amber-950 cursor-pointer"
              >
                Create / Register this account now →
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. AUTHENTICATION CARD */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xl shadow-slate-950/20 space-y-6 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />

        {/* PERSONA / PORTAL SELECTOR TABS */}
        <div className="space-y-2">
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            Select Portal to Sign Into:
          </label>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedRole('MSME')}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedRole === 'MSME'
                  ? 'bg-white text-orange-600 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className="text-sm">🏢</span>
              <span className="truncate">MSME Exporter</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('PROVIDER')}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedRole === 'PROVIDER'
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className="text-sm">🚢</span>
              <span className="truncate">Service Provider</span>
            </button>
          </div>

          {/* Contextual Subtitle */}
          <div
            className={`p-2.5 rounded-xl border text-[11px] leading-relaxed transition-all ${
              selectedRole === 'MSME'
                ? 'bg-orange-50/70 border-orange-200/80 text-orange-950'
                : 'bg-blue-50/70 border-blue-200/80 text-blue-950'
            }`}
          >
            {selectedRole === 'MSME' ? (
              <p>
                <strong>🏢 Exporter Command Center:</strong> Access factory export readiness, documents, and carrier quotes.
              </p>
            ) : (
              <p>
                <strong>🚢 Service Provider Desk:</strong> Fulfill freight forwarder bids, quarantine testing, and customs CHA filings.
              </p>
            )}
          </div>
        </div>

        {/* PRIMARY GOOGLE SSO BUTTON */}
        <div className="space-y-2">
          <a
            href={`/api/auth/google?role=${selectedRole}`}
            className={`w-full py-3.5 px-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 shadow-xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer group ${
              selectedRole === 'PROVIDER'
                ? 'border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/20 text-slate-800 font-bold text-sm'
                : 'border-slate-200 hover:border-orange-500 bg-white hover:bg-orange-50/20 text-slate-800 font-bold text-sm'
            }`}
          >
            <GoogleIcon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
            <span>
              Continue with Google (as {selectedRole === 'PROVIDER' ? 'Service Provider' : 'MSME Exporter'})
            </span>
          </a>
          <p className="text-[11px] text-center text-slate-500 font-medium">
            Fast, secure single sign-on with authorized Google accounts
          </p>
        </div>

        {/* OR WORK EMAIL DIVIDER */}
        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-slate-100 text-slate-600 px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 border border-slate-200 shadow-xs mx-2">
            or work email
          </span>
          <div className="border-t border-slate-200 w-full" />
        </div>

        {/* EMAIL & PASSWORD LOGIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <input type="hidden" name="preferredRole" value={selectedRole} />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-bold text-slate-900 text-xs">
                Work Email Address <span className="text-orange-600">*</span>
              </label>
              <span className="text-[10px] text-slate-500 font-medium">
                {selectedRole === 'PROVIDER'
                  ? 'e.g. quotes@freightcorp.com'
                  : 'e.g. ramesh@exportco.com'}
              </span>
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                id="email-input"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  selectedRole === 'PROVIDER'
                    ? 'Enter service provider email address'
                    : 'Enter registered exporter email address'
                }
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 font-medium focus:bg-white focus:ring-4 focus:ring-orange-500/15 focus:border-orange-600 text-xs transition-all outline-none"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-bold text-slate-900 text-xs">
                Account Password <span className="text-orange-600">*</span>
              </label>
              <span className="text-[10px] text-slate-500 font-medium">Test accounts: password123</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your account password"
                className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 font-medium focus:bg-white focus:ring-4 focus:ring-orange-500/15 focus:border-orange-600 text-xs transition-all outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-800 p-0.5 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className={`w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-60 ${
              selectedRole === 'PROVIDER'
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30 hover:shadow-blue-600/40'
                : 'bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-orange-600/30 hover:shadow-orange-600/40'
            }`}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              <>
                <span>
                  {selectedRole === 'PROVIDER'
                    ? 'Sign In to Service Provider Portal'
                    : 'Sign In to Exporter Dashboard'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* RECENT ACCOUNTS AUTO-FILL CHIPS */}
        {savedAccounts.length > 0 && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <History className="w-3 h-3 text-orange-500" /> Recent on this device (click to fill):
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {savedAccounts.slice(0, 3).map((acc) => (
                <div
                  key={acc.email}
                  onClick={() => handleSelectEmail(acc.email, acc.role)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    email === acc.email
                      ? 'bg-orange-50 border-orange-400 text-orange-800 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-orange-300 hover:bg-orange-50/50'
                  }`}
                  title="Click to fill email into form"
                >
                  <span className="truncate max-w-[180px]">{acc.email}</span>
                  <span className="text-[9px] bg-white px-1.5 py-0.2 rounded border border-slate-200 text-slate-500 font-bold">
                    {acc.role}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveSaved(e, acc.email)}
                    className="text-slate-400 hover:text-red-500 ml-1 p-0.5 rounded"
                    title="Remove from device memory"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SWITCH TO REGISTER */}
        {onSwitchToRegister && (
          <div className="text-center pt-2 text-xs text-slate-600 border-t border-slate-100">
            {selectedRole === 'PROVIDER' ? (
              <>
                Looking to partner as a carrier or lab?{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Register as Service Provider →
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an exporter account yet?{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-orange-600 font-bold hover:underline cursor-pointer"
                >
                  Register new MSME account →
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* 3. TEST / SEEDED ACCOUNTS HELPER (COLLAPSED BY DEFAULT) */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg">
        <button
          type="button"
          onClick={() => setShowHelperAccounts(!showHelperAccounts)}
          className="w-full p-3.5 text-left flex items-center justify-between hover:bg-slate-800/50 transition-colors cursor-pointer text-xs"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-bold text-slate-200">
              Need Pre-configured Test Accounts? ({selectedRole} selected)
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 font-medium text-[11px]">
            <span>{showHelperAccounts ? 'Hide' : 'Show accounts'}</span>
            {showHelperAccounts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {showHelperAccounts && (
          <div className="p-4 pt-1 border-t border-slate-800 bg-slate-950/60 space-y-2 text-xs animate-in fade-in duration-150">
            <p className="text-[11px] text-slate-400">
              Click any account below to auto-fill its credentials. Password for test accounts is <code className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-orange-300 font-bold border border-slate-700">password123</code>:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div
                onClick={() => {
                  setSelectedRole('MSME');
                  setEmail('msme@apex-exports.com');
                  setPassword('password123');
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  selectedRole === 'MSME' && email === 'msme@apex-exports.com'
                    ? 'border-orange-500 bg-slate-900 ring-1 ring-orange-500/50'
                    : 'border-slate-800 hover:border-orange-500/60 bg-slate-900/60 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">MSME Exporter 1 (Agro)</span>
                  <span className="text-[9px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-1.5 py-0.2 rounded font-bold">Mango &rarr; UAE</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">msme@apex-exports.com</p>
              </div>

              <div
                onClick={() => {
                  setSelectedRole('MSME');
                  setEmail('msme2@konkan-spices.com');
                  setPassword('password123');
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  selectedRole === 'MSME' && email === 'msme2@konkan-spices.com'
                    ? 'border-orange-500 bg-slate-900 ring-1 ring-orange-500/50'
                    : 'border-slate-800 hover:border-orange-500/60 bg-slate-900/60 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">MSME Exporter 2 (Spices)</span>
                  <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">Turmeric &rarr; USA</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">msme2@konkan-spices.com</p>
              </div>

              <div
                onClick={() => {
                  setSelectedRole('PROVIDER');
                  setEmail('provider@freight.com');
                  setPassword('password123');
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  selectedRole === 'PROVIDER' && email === 'provider@freight.com'
                    ? 'border-blue-500 bg-slate-900 ring-1 ring-blue-500/50'
                    : 'border-slate-800 hover:border-blue-500/60 bg-slate-900/60 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">Freight Forwarder</span>
                  <span className="text-[9px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.2 rounded font-bold">Logistics</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">provider@freight.com</p>
              </div>

              <div
                onClick={() => {
                  setSelectedRole('PROVIDER');
                  setEmail('lab@certify.com');
                  setPassword('password123');
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  selectedRole === 'PROVIDER' && email === 'lab@certify.com'
                    ? 'border-purple-500 bg-slate-900 ring-1 ring-purple-500/50'
                    : 'border-slate-800 hover:border-purple-500/60 bg-slate-900/60 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">Testing Lab</span>
                  <span className="text-[9px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-1.5 py-0.2 rounded font-bold">Phytosanitary</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">lab@certify.com</p>
              </div>

              <div
                onClick={() => {
                  setSelectedRole('PROVIDER');
                  setEmail('cha@customs.com');
                  setPassword('password123');
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  selectedRole === 'PROVIDER' && email === 'cha@customs.com'
                    ? 'border-emerald-500 bg-slate-900 ring-1 ring-emerald-500/50'
                    : 'border-slate-800 hover:border-emerald-500/60 bg-slate-900/60 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">Customs House Agent</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">Customs CHA</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">cha@customs.com</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
  History,
  X,
  ChevronDown,
  ChevronUp,
  Building2,
  Ship,
  KeyRound,
  CheckCircle2,
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
    desc: 'GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing in environment variables. Please sign in with email/password.',
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
  database_connection_failed: {
    title: 'Database Service Unavailable',
    desc: 'Could not connect to the cloud database instance. The database may be paused or offline. Please contact the administrator or try again shortly.',
    type: 'error',
  },
  rate_limited: {
    title: 'Too Many Requests',
    desc: 'Security rate limit triggered due to repeated requests. Please wait 60 seconds before trying again.',
    type: 'warning',
  },
  oauth_state_invalid: {
    title: 'Security Verification Failed',
    desc: 'OAuth state token validation failed or expired. Please initiate sign-in again.',
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
    <div className="w-full space-y-4 font-sans">
      {/* 1. ALERT BANNER (IF ERROR OR NOTICE) */}
      {errorInfo && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xs ${
            errorInfo.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-950'
              : errorInfo.type === 'info'
              ? 'bg-orange-50 border-orange-200 text-orange-950'
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}
        >
          <AlertCircle
            className={`w-4 h-4 shrink-0 mt-0.5 ${
              errorInfo.type === 'error'
                ? 'text-rose-600'
                : errorInfo.type === 'info'
                ? 'text-orange-600'
                : 'text-amber-600'
            }`}
          />
          <div className="space-y-1 min-w-0 flex-1">
            <h4 className="font-bold text-xs">{errorInfo.title}</h4>
            <p className="opacity-90 leading-relaxed text-[11px]">{errorInfo.desc}</p>
            {errorCode === 'user_not_found' && onSwitchToRegister && (
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-700 underline hover:text-orange-800 cursor-pointer"
              >
                Create a new account now &rarr;
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. AUTHENTICATION CARD */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 space-y-6 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-orange-500/5 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

        {/* ROLE SELECTION TABS */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Sign In As:
          </label>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setSelectedRole('MSME')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedRole === 'MSME'
                  ? 'bg-white text-orange-600 shadow-2xs font-bold border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>MSME Exporter</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('PROVIDER')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedRole === 'PROVIDER'
                  ? 'bg-white text-orange-600 shadow-2xs font-bold border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Ship className="w-3.5 h-3.5" />
              <span>Service Provider</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-500 font-medium px-1">
            {selectedRole === 'MSME'
              ? 'Access factory export readiness, statutory documents, and freight quotes.'
              : 'Access freight forwarder bids, quarantine testing reports, and customs CHA filings.'}
          </p>
        </div>

        {/* PRIMARY GOOGLE SSO BUTTON */}
        <div className="space-y-2">
          <a
            href={`/api/auth/google?role=${selectedRole}`}
            className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer group active:scale-[0.99]"
          >
            <GoogleIcon className="w-4 h-4 shrink-0" />
            <span>Continue with Google</span>
          </a>
        </div>

        {/* OR DIVIDER */}
        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white text-slate-500 px-3 text-[11px] uppercase tracking-wider shrink-0 font-medium">
            or continue with email
          </span>
          <div className="border-t border-slate-200 w-full" />
        </div>

        {/* EMAIL & PASSWORD LOGIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <input type="hidden" name="preferredRole" value={selectedRole} />

          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700 text-xs">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                id="email-input"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  selectedRole === 'PROVIDER'
                    ? 'provider@freight.com'
                    : 'exporter@company.com'
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 font-medium focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 text-xs transition-all outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block font-semibold text-slate-700 text-xs">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your account password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 font-medium focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 text-xs transition-all outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-xl font-semibold text-xs sm:text-sm text-white bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-60"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </span>
            ) : (
              <>
                <span>Sign In to {selectedRole === 'PROVIDER' ? 'Provider Portal' : 'Exporter Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* RECENT ACCOUNTS AUTO-FILL CHIPS */}
        {savedAccounts.length > 0 && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <History className="w-3 h-3 text-orange-600" /> Recent on this device:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {savedAccounts.slice(0, 3).map((acc) => (
                <div
                  key={acc.email}
                  onClick={() => handleSelectEmail(acc.email, acc.role)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    email === acc.email
                      ? 'bg-orange-50 border-orange-300 text-orange-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-orange-200 hover:bg-orange-50/40'
                  }`}
                  title="Click to fill email into form"
                >
                  <span className="truncate max-w-[160px] text-[11px]">{acc.email}</span>
                  <span className="text-[9px] bg-white px-1 py-0.5 rounded border border-slate-200 text-slate-500 font-bold">
                    {acc.role}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveSaved(e, acc.email)}
                    className="text-slate-400 hover:text-rose-600 ml-0.5 p-0.5 rounded cursor-pointer"
                    title="Remove from device memory"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SWITCH TO REGISTER */}
        {onSwitchToRegister && (
          <div className="text-center pt-2 text-xs text-slate-600 border-t border-slate-100">
            Don&apos;t have an account yet?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-orange-600 font-semibold hover:underline cursor-pointer"
            >
              Create an account &rarr;
            </button>
          </div>
        )}
      </div>

      {/* 3. TEST / SEEDED ACCOUNTS HELPER (CLEAN LIGHT THEME ACCORDION — ZERO DARK CYBERPUNK) */}
      <div className="bg-orange-50/40 border border-orange-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => setShowHelperAccounts(!showHelperAccounts)}
          className="w-full p-3.5 text-left flex items-center justify-between hover:bg-orange-100/40 transition-colors cursor-pointer text-xs"
        >
          <div className="flex items-center gap-2">
            <KeyRound className="w-3.5 h-3.5 text-orange-600" />
            <span className="font-semibold text-slate-800">
              Need Demo / Test Credentials?
            </span>
            <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-bold border border-orange-200">
              1-Click Fill
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-500 font-medium text-[11px]">
            <span>{showHelperAccounts ? 'Hide' : 'Show accounts'}</span>
            {showHelperAccounts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {showHelperAccounts && (
          <div className="p-4 pt-1 border-t border-orange-200/70 bg-white/70 space-y-2.5 text-xs animate-in fade-in duration-150">
            <p className="text-[11px] text-slate-600">
              Click any verified test account below to auto-fill its credentials. Password is <code className="bg-orange-100/70 px-1.5 py-0.5 rounded font-mono text-orange-900 font-bold border border-orange-200">password123</code>:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {/* MSME 1 */}
              <div
                onClick={() => {
                  setSelectedRole('MSME');
                  setEmail('msme@apex-exports.com');
                  setPassword('password123');
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedRole === 'MSME' && email === 'msme@apex-exports.com'
                    ? 'border-orange-500 bg-orange-50 shadow-2xs ring-1 ring-orange-500/30'
                    : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900">MSME Exporter 1</span>
                  <span className="text-[9px] bg-orange-50 text-orange-700 border border-orange-200 px-1.5 py-0.5 rounded font-bold">Mango &rarr; UAE</span>
                </div>
                <p className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">msme@apex-exports.com</p>
              </div>

              {/* MSME 2 */}
              <div
                onClick={() => {
                  setSelectedRole('MSME');
                  setEmail('msme2@konkan-spices.com');
                  setPassword('password123');
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedRole === 'MSME' && email === 'msme2@konkan-spices.com'
                    ? 'border-orange-500 bg-orange-50 shadow-2xs ring-1 ring-orange-500/30'
                    : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900">MSME Exporter 2</span>
                  <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-bold">Spices &rarr; USA</span>
                </div>
                <p className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">msme2@konkan-spices.com</p>
              </div>

              {/* Freight Forwarder */}
              <div
                onClick={() => {
                  setSelectedRole('PROVIDER');
                  setEmail('provider@freight.com');
                  setPassword('password123');
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedRole === 'PROVIDER' && email === 'provider@freight.com'
                    ? 'border-orange-500 bg-orange-50 shadow-2xs ring-1 ring-orange-500/30'
                    : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900">Freight Forwarder</span>
                  <span className="text-[9px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded font-bold">Ocean &amp; Air</span>
                </div>
                <p className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">provider@freight.com</p>
              </div>

              {/* Lab */}
              <div
                onClick={() => {
                  setSelectedRole('PROVIDER');
                  setEmail('lab@certify.com');
                  setPassword('password123');
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedRole === 'PROVIDER' && email === 'lab@certify.com'
                    ? 'border-orange-500 bg-orange-50 shadow-2xs ring-1 ring-orange-500/30'
                    : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900">Testing Laboratory</span>
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">NABL Certified</span>
                </div>
                <p className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">lab@certify.com</p>
              </div>

              {/* CHA */}
              <div
                onClick={() => {
                  setSelectedRole('PROVIDER');
                  setEmail('cha@customs.com');
                  setPassword('password123');
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer sm:col-span-2 ${
                  selectedRole === 'PROVIDER' && email === 'cha@customs.com'
                    ? 'border-orange-500 bg-orange-50 shadow-2xs ring-1 ring-orange-500/30'
                    : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900">Customs House Agent (CHA)</span>
                  <span className="text-[9px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded font-bold">Port Customs &amp; LEO</span>
                </div>
                <p className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">cha@customs.com</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

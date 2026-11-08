'use client';

import React, { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { Building2, Truck, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { saveRecentAccount } from '@/lib/recentAccounts';

interface RegisterFormProps {
  action: (formData: FormData) => Promise<void>;
}

const REGISTER_ERROR_MESSAGES: Record<string, { title: string; desc: string; type: 'error' | 'warning' }> = {
  invalid_role: {
    title: 'Registration Not Allowed',
    desc: 'Platform Administrator accounts cannot be registered publicly.',
    type: 'error',
  },
  name_required: {
    title: 'Name Required',
    desc: 'Please enter your full legal name.',
    type: 'warning',
  },
  invalid_email: {
    title: 'Invalid Email',
    desc: 'Please enter a valid business or personal email address.',
    type: 'warning',
  },
  password_too_short: {
    title: 'Password Too Short',
    desc: 'Your password must be at least 6 characters long.',
    type: 'warning',
  },
  email_exists: {
    title: 'Account Already Exists',
    desc: 'An account with this email address already exists. Please sign in instead.',
    type: 'warning',
  },
  rate_limited: {
    title: 'Registration Limit Exceeded',
    desc: 'Too many registration attempts from this network. Please wait 60 seconds before trying again.',
    type: 'warning',
  },
  database_connection_failed: {
    title: 'Database Service Unavailable',
    desc: 'Could not connect to the cloud database instance. The database may be paused or offline. Please contact the administrator or try again shortly.',
    type: 'error',
  },
};

export default function RegisterForm({ action }: RegisterFormProps) {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('error');
  const errorInfo = errorCode ? REGISTER_ERROR_MESSAGES[errorCode] : null;

  const [role, setRole] = useState<'MSME' | 'PROVIDER'>('MSME');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const emailInput = form.elements.namedItem('email') as HTMLInputElement;
    const nameInput = form.elements.namedItem('name') as HTMLInputElement;
    const roleInput = form.elements.namedItem('role') as HTMLInputElement;
    const businessNameInput = (form.elements.namedItem('businessName') || form.elements.namedItem('providerName')) as HTMLInputElement;

    if (emailInput?.value) {
      saveRecentAccount({
        email: emailInput.value,
        name: nameInput?.value || emailInput.value.split('@')[0],
        role: (roleInput?.value as 'MSME' | 'PROVIDER') || role,
        companyName: businessNameInput?.value,
      });
    }

    startTransition(async () => {
      await action(formData);
    });
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 space-y-6 font-sans">
      {/* Header Banner */}
      <div className="space-y-1 pb-4 border-b border-slate-100">
        <h2 className="text-xl sm:text-2xl font-bold font-sans text-slate-900 tracking-tight">
          Create your VyaparFlow account
        </h2>
        <p className="text-xs text-slate-600">
          {role === 'MSME'
            ? 'Start your 0–100 export readiness evaluation and automate statutory documents.'
            : 'Join as a verified Freight Forwarder, NABL Laboratory, or Customs Broker.'}
        </p>
      </div>

      {/* Alert Banner (if error or warning) */}
      {errorInfo && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xs ${
            errorInfo.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-950'
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}
        >
          <AlertCircle
            className={`w-4 h-4 shrink-0 mt-0.5 ${
              errorInfo.type === 'error' ? 'text-rose-600' : 'text-amber-600'
            }`}
          />
          <div className="flex-1 space-y-0.5">
            <h4 className="font-bold text-xs">{errorInfo.title}</h4>
            <p className="text-[11px] leading-relaxed opacity-90">{errorInfo.desc}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Category / Persona Selector - Side-by-Side Blocks */}
        <div className="space-y-2">
          <label className="block font-bold text-slate-700 text-xs">
            Account Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category 1: MSME Exporter */}
            <button
              type="button"
              onClick={() => setRole('MSME')}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between gap-2.5 cursor-pointer ${
                role === 'MSME'
                  ? 'border-orange-500 bg-orange-50/50 shadow-2xs ring-2 ring-orange-500/15'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold transition-colors ${
                    role === 'MSME' ? 'bg-orange-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                </div>
                {role === 'MSME' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                    Selected
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <span>MSME Exporter</span>
                  {role === 'MSME' && <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />}
                </h4>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                  Indian manufacturers exporting agricultural, chemical, or engineered products.
                </p>
              </div>
            </button>

            {/* Category 2: Service Provider */}
            <button
              type="button"
              onClick={() => setRole('PROVIDER')}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between gap-2.5 cursor-pointer ${
                role === 'PROVIDER'
                  ? 'border-orange-500 bg-orange-50/50 shadow-2xs ring-2 ring-orange-500/15'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold transition-colors ${
                    role === 'PROVIDER' ? 'bg-orange-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                </div>
                {role === 'PROVIDER' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                    Selected
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <span>Service Provider</span>
                  {role === 'PROVIDER' && <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />}
                </h4>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                  Licensed freight forwarders, NABL-accredited test labs, and customs brokers.
                </p>
              </div>
            </button>
          </div>
          <input type="hidden" name="role" value={role} />
        </div>

        {/* Full Name */}
        <div className="space-y-1">
          <label className="block font-semibold text-slate-700">Full Name</label>
          <input
            type="text"
            name="name"
            placeholder={role === 'PROVIDER' ? 'Vikram Sharma' : 'Ramesh Shah'}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 font-medium focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none text-xs transition-all"
            required
          />
        </div>

        {/* Email Address */}
        <div className="space-y-1">
          <label className="block font-semibold text-slate-700">Work Email Address</label>
          <input
            type="email"
            name="email"
            placeholder={role === 'PROVIDER' ? 'contact@freightpartner.com' : 'ramesh@exportco.com'}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 font-medium focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none text-xs transition-all"
            required
          />
        </div>

        {/* Account Password */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block font-semibold text-slate-700">Password</label>
            <span className="text-[10px] text-slate-500">Min. 6 characters</span>
          </div>
          <input
            type="password"
            name="password"
            placeholder="Create a secure password"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 font-medium focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none text-xs transition-all"
            required
          />
        </div>

        {/* Conditional Role Fields */}
        {role === 'MSME' ? (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Legal Company / Business Name</label>
              <input
                type="text"
                name="businessName"
                placeholder="e.g. Apex Agro Processing & Exports Pvt Ltd"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 font-medium text-xs focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Primary Export Commodity</label>
              <input
                type="text"
                name="productName"
                placeholder="e.g. Alphonso Mango Pulp / CNC Automotive Components"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 font-medium text-xs focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all"
                required
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Provider / Organization Name</label>
              <input
                type="text"
                name="providerName"
                placeholder="e.g. SwiftGlobe Logistics India Ltd"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 font-medium text-xs focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Service Category</label>
              <select
                name="businessCategory"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-xs focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all cursor-pointer"
                required
              >
                <option value="Freight">International Ocean &amp; Air Freight Forwarding</option>
                <option value="Testing">Testing &amp; Quality Certification Laboratory</option>
                <option value="CHA">Customs House Agent (CHA) &amp; Port Clearances</option>
              </select>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 rounded-xl text-white font-semibold text-xs sm:text-sm bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-60"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>Creating your account...</span>
            </span>
          ) : (
            <>
              <span>
                {role === 'PROVIDER'
                  ? 'Register Service Provider Account'
                  : 'Create MSME Account & Continue to Setup'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

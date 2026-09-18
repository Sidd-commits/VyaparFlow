'use client';

import React, { useState, useTransition } from 'react';
import { Building2, Truck, ArrowRight, UserPlus, Sparkles, CheckCircle2 } from 'lucide-react';
import { saveRecentAccount } from '@/lib/recentAccounts';

interface RegisterFormProps {
  action: (formData: FormData) => Promise<void>;
}

export default function RegisterForm({ action }: RegisterFormProps) {
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
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6">
      {/* Header Banner */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
        {role === 'PROVIDER' ? (
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Truck className="w-5 h-5" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold font-serif text-slate-900">
            {role === 'PROVIDER'
              ? 'Service Provider Partner Registration'
              : 'Create MSME Exporter Account'}
          </h2>
          <p className="text-xs text-slate-500">
            {role === 'PROVIDER'
              ? 'CHA, Freight Forwarder & Laboratory Partner onboarding'
              : 'Sign up to begin export readiness evaluation & compliance setup'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Category / Persona Selector - Side-by-Side Blocks */}
        <div className="space-y-2">
          <label className="block font-bold text-slate-900 text-xs">
            Select Account Category *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category 1: MSME Exporter */}
            <button
              type="button"
              onClick={() => setRole('MSME')}
              className={`p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between gap-3 cursor-pointer ${
                role === 'MSME'
                  ? 'border-orange-500 bg-orange-50/60 shadow-md ring-4 ring-orange-500/10'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-colors ${
                  role === 'MSME' ? 'bg-orange-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700'
                }`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  role === 'MSME'
                    ? 'bg-orange-100 text-orange-800 border-orange-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  Exporters
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  MSME Exporter
                  {role === 'MSME' && <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />}
                </h4>
                <p className="text-[11px] text-slate-600 leading-snug mt-1">
                  Evaluate export readiness score, generate trade docs & book freight
                </p>
              </div>
            </button>

            {/* Category 2: Service Provider */}
            <button
              type="button"
              onClick={() => setRole('PROVIDER')}
              className={`p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between gap-3 cursor-pointer ${
                role === 'PROVIDER'
                  ? 'border-blue-500 bg-blue-50/60 shadow-md ring-4 ring-blue-500/10'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-colors ${
                  role === 'PROVIDER' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700'
                }`}>
                  <Truck className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  role === 'PROVIDER'
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  Partners
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  Service Provider
                  {role === 'PROVIDER' && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                </h4>
                <p className="text-[11px] text-slate-600 leading-snug mt-1">
                  CHA customs clearance, test laboratories & freight forwarders
                </p>
              </div>
            </button>
          </div>
          <input type="hidden" name="role" value={role} />
        </div>

        {/* Full Name */}
        <div>
          <label className="block font-bold text-slate-900 mb-1">Full Name *</label>
          <input
            type="text"
            name="name"
            placeholder={
              role === 'PROVIDER'
                ? 'e.g. Vikram Sharma'
                : 'e.g. Ramesh Shah'
            }
            className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 font-medium focus:ring-4 focus:ring-orange-500/15 focus:border-orange-600 outline-none text-xs transition-all"
            required
          />
        </div>

        {/* Email Address */}
        <div>
          <label className="block font-bold text-slate-900 mb-1">Work / Business Email *</label>
          <input
            type="email"
            name="email"
            placeholder={
              role === 'PROVIDER'
                ? 'contact@freightpartner.com'
                : 'ramesh@exportco.com'
            }
            className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 font-medium focus:ring-4 focus:ring-orange-500/15 focus:border-orange-600 outline-none text-xs transition-all"
            required
          />
        </div>

        {/* Account Password */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block font-bold text-slate-900">Password *</label>
            <span className="text-[10px] text-slate-500 font-medium">Min. 6 characters</span>
          </div>
          <input
            type="password"
            name="password"
            placeholder="Choose a strong password"
            className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 font-medium focus:ring-4 focus:ring-orange-500/15 focus:border-orange-600 outline-none text-xs transition-all"
            required
          />
        </div>

        {/* Conditional Role Fields */}
        {role === 'MSME' ? (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-bold text-slate-900 mb-1">Legal Company / Business Name *</label>
              <input
                type="text"
                name="businessName"
                placeholder="e.g. Acme Organic Exports Pvt Ltd"
                className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 font-medium text-xs focus:ring-4 focus:ring-orange-500/15 focus:border-orange-600 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1">Primary Export Product / Commodity *</label>
              <input
                type="text"
                name="productName"
                placeholder="e.g. Organic Alphonso Mangoes"
                className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 font-medium text-xs focus:ring-4 focus:ring-orange-500/15 focus:border-orange-600 outline-none transition-all"
                required
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-bold text-slate-900 mb-1">Provider / Agency Legal Name *</label>
              <input
                type="text"
                name="providerName"
                placeholder="e.g. Apex International Logistics Ltd"
                className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 font-medium text-xs focus:ring-4 focus:ring-blue-500/15 focus:border-blue-600 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1">Service Domain *</label>
              <select
                name="businessCategory"
                className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-xs"
                required
              >
                <option value="Freight">🚢 International Ocean & Air Freight Forwarding</option>
                <option value="Testing">🧪 Testing & Certification Laboratory</option>
                <option value="CHA">📋 Customs House Agent (CHA)</option>
              </select>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className={`w-full py-3.5 rounded-xl text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60 ${
            role === 'PROVIDER'
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-orange-600 hover:bg-orange-700'
          }`}
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Creating account...
            </span>
          ) : role === 'PROVIDER' ? (
            <>
              <Truck className="w-4 h-4" />
              Register Service Partner Account →
            </>
          ) : (
            <>
              <span>Create Account & Continue to Setup</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

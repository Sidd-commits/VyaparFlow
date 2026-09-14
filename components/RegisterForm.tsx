'use client';

import React, { useState, useTransition } from 'react';
import { Building2, Truck, ArrowRight, UserPlus, Sparkles } from 'lucide-react';
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
    const roleSelect = form.elements.namedItem('role') as HTMLSelectElement;
    const businessNameInput = form.elements.namedItem('businessName') as HTMLInputElement;

    if (emailInput?.value) {
      saveRecentAccount({
        email: emailInput.value,
        name: nameInput?.value || emailInput.value.split('@')[0],
        role: (roleSelect?.value as 'MSME' | 'PROVIDER') || role,
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
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold font-serif text-slate-900">
            {role === 'PROVIDER'
              ? 'Service Provider Partner Registration'
              : 'Create Exporter Account'}
          </h2>
          <p className="text-xs text-slate-500">
            {role === 'PROVIDER'
              ? 'CHA, Freight Forwarder & Laboratory Partner onboarding'
              : 'Sign up to begin export readiness evaluation & compliance setup'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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

        {/* Role Persona Selection */}
        <div>
          <label className="block font-bold text-slate-900 mb-1">Account Role *</label>
          <select
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-xs"
          >
            <option value="MSME">MSME Exporter (Evaluate readiness, upload docs, book freight)</option>
            <option value="PROVIDER">Service Provider (Fulfill testing, CHA clearance, logistics)</option>
          </select>
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

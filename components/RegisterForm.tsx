'use client';

import React, { useState } from 'react';
import { Building2, ShieldCheck, Truck, ArrowRight, UserPlus, Sparkles } from 'lucide-react';
import { saveRecentAccount } from '@/lib/recentAccounts';

interface RegisterFormProps {
  action: (formData: FormData) => Promise<void>;
}

export default function RegisterForm({ action }: RegisterFormProps) {
  const [role, setRole] = useState<'MSME' | 'PROVIDER' | 'ADMIN'>('MSME');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const emailInput = form.elements.namedItem('email') as HTMLInputElement;
    const nameInput = form.elements.namedItem('name') as HTMLInputElement;
    const roleSelect = form.elements.namedItem('role') as HTMLSelectElement;
    const businessNameInput = form.elements.namedItem('businessName') as HTMLInputElement;

    if (emailInput?.value) {
      saveRecentAccount({
        email: emailInput.value,
        name: nameInput?.value || emailInput.value.split('@')[0],
        role: (roleSelect?.value as 'MSME' | 'PROVIDER' | 'ADMIN') || role,
        companyName: businessNameInput?.value || (role === 'ADMIN' ? 'Platform Administrator' : undefined),
      });
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6">
      {/* Header Banner */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
        {role === 'ADMIN' ? (
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-orange-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        ) : role === 'PROVIDER' ? (
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
            {role === 'ADMIN'
              ? 'Platform Admin Registration'
              : role === 'PROVIDER'
              ? 'Service Provider Partner'
              : 'Create Exporter Account'}
          </h2>
          <p className="text-xs text-slate-500">
            {role === 'ADMIN'
              ? 'Operator console access for compliance audits & system logs'
              : role === 'PROVIDER'
              ? 'CHA, Freight Forwarder & Laboratory Partner onboarding'
              : 'Sign up to begin export readiness evaluation & compliance setup'}
          </p>
        </div>
      </div>

      <form action={action} onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Full Name */}
        <div>
          <label className="block font-bold text-slate-900 mb-1">Full Name *</label>
          <input
            type="text"
            name="name"
            placeholder={
              role === 'ADMIN'
                ? 'e.g. Platform Administrator'
                : role === 'PROVIDER'
                ? 'e.g. Vikram Sharma'
                : 'e.g. Ramesh Shah'
            }
            defaultValue={role === 'ADMIN' ? 'Platform Administrator' : ''}
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
              role === 'ADMIN'
                ? 'admin@vyaparflow.com'
                : role === 'PROVIDER'
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
            placeholder="Create an account password"
            minLength={6}
            defaultValue="password123"
            className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 font-medium focus:ring-4 focus:ring-orange-500/15 focus:border-orange-600 outline-none text-xs transition-all"
            required
          />
        </div>

        {/* Account Role Selector */}
        <div>
          <label className="block font-bold text-slate-900 mb-1">Account Role *</label>
          <select
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as 'MSME' | 'PROVIDER' | 'ADMIN')}
            className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold cursor-pointer focus:ring-4 focus:ring-orange-500/15 focus:border-orange-600 outline-none text-xs"
            required
          >
            <option value="MSME">🏢 MSME Exporter (Configure Business Profile)</option>
            <option value="PROVIDER">🚢 Service Provider (Freight / Lab / CHA)</option>
            <option value="ADMIN">🛡️ Platform Admin Operator</option>
          </select>
        </div>

        {/* MSME Setup Notice Banner */}
        {role === 'MSME' && (
          <div className="p-3.5 bg-orange-50/70 border border-orange-200/80 rounded-xl flex items-start gap-2.5 text-xs text-orange-950">
            <Sparkles className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Next: Multi-Step Business Onboarding</span>
              <p className="text-[11px] text-orange-800 leading-normal">
                After creating your account, our structured 6-step onboarding wizard will guide you to set up your company profile, products, export destinations, and registrations.
              </p>
            </div>
          </div>
        )}

        {/* Provider Specific Inputs */}
        {role === 'PROVIDER' && (
          <div className="space-y-3 pt-1">
            <div>
              <label className="block font-bold text-slate-900 mb-1">Agency / Provider Name *</label>
              <input
                type="text"
                name="businessName"
                placeholder="e.g. SwiftGlobe Freight Logistics Pvt Ltd"
                className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 font-medium text-xs focus:ring-2 focus:ring-orange-500 outline-none"
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
          className={`w-full py-3.5 rounded-xl text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] ${
            role === 'ADMIN'
              ? 'bg-slate-900 hover:bg-slate-800'
              : role === 'PROVIDER'
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-orange-600 hover:bg-orange-700'
          }`}
        >
          {role === 'ADMIN' ? (
            <>
              <ShieldCheck className="w-4 h-4 text-orange-400" />
              Create Administrator Account →
            </>
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

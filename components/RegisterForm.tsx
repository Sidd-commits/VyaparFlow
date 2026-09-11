'use client';

import React, { useState } from 'react';
import { UserPlus, Building2, FileText, ShieldCheck, Truck, CheckCircle2 } from 'lucide-react';
import GSTLookupButton from '@/components/GSTLookupButton';
import { GSTDetails } from '@/lib/services/sandboxGst';
import { saveRecentAccount } from '@/lib/recentAccounts';

interface RegisterFormProps {
  action: (formData: FormData) => Promise<void>;
}

export default function RegisterForm({ action }: RegisterFormProps) {
  const [role, setRole] = useState<'MSME' | 'PROVIDER' | 'ADMIN'>('MSME');
  const [gstin, setGstin] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const handleGSTFetched = (details: GSTDetails) => {
    if (details.legalName) {
      setBusinessName(details.legalName);
    }
    if (details.address?.city) {
      setCity(details.address.city);
    }
    if (details.address?.state) {
      setState(details.address.state);
    }
  };

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
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6">
      {/* Header Banner */}
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
        {role === 'ADMIN' ? (
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-orange-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        ) : role === 'PROVIDER' ? (
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold font-serif text-slate-900">
            {role === 'ADMIN'
              ? 'Platform Admin Access'
              : role === 'PROVIDER'
              ? 'Service Provider Registration'
              : 'Create MSME Account'}
          </h2>
          <p className="text-xs text-slate-600">
            {role === 'ADMIN'
              ? 'Admin operator console — no business registrations required'
              : role === 'PROVIDER'
              ? 'Logistics, laboratory testing & customs clearance partner'
              : 'Compulsory GSTIN & IEC Code registration for exporters'}
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
            className="w-full p-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 font-medium focus:ring-4 focus:ring-orange-500/15 focus:border-orange-600 outline-none text-xs transition-all"
            required
          />
        </div>

        {/* Email Address */}
        <div>
          <label className="block font-bold text-slate-900 mb-1">Email Address *</label>
          <input
            type="email"
            name="email"
            placeholder={
              role === 'ADMIN'
                ? 'e.g. admin@vyaparflow.com'
                : role === 'PROVIDER'
                ? 'e.g. contact@freightcorp.com'
                : 'e.g. ramesh@exportco.com'
            }
            defaultValue={role === 'ADMIN' ? 'admin@vyaparflow.com' : ''}
            className="w-full p-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 font-medium focus:ring-4 focus:ring-orange-500/15 focus:border-orange-600 outline-none text-xs transition-all"
            required
          />
        </div>

        {/* Account Password */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block font-bold text-slate-900">Account Password *</label>
            <span className="text-[10px] text-slate-500 font-medium">Min. 6 characters</span>
          </div>
          <input
            type="password"
            name="password"
            placeholder="Create a strong account password"
            minLength={6}
            defaultValue="password123"
            className="w-full p-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 font-medium focus:ring-4 focus:ring-orange-500/15 focus:border-orange-600 outline-none text-xs transition-all"
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
            className="w-full p-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold cursor-pointer focus:ring-4 focus:ring-orange-500/15 focus:border-orange-600 outline-none text-xs"
            required
          >
            <option value="MSME" className="text-slate-900 bg-white font-medium">🏢 MSME Exporter (Requires GSTIN & IEC)</option>
            <option value="ADMIN" className="text-slate-900 bg-white font-medium">🛡️ Platform Admin Operator (No GSTIN / Business details)</option>
            <option value="PROVIDER" className="text-slate-900 bg-white font-medium">🚢 Service Provider (Freight / Lab / CHA)</option>
          </select>
        </div>

        {/* --- ROLE: ADMIN VIEW (NO GSTIN, NO IEC, NO TYPE OF BUSINESS, NO BUSINESS NAME) --- */}
        {role === 'ADMIN' && (
          <div className="p-4 rounded-xl bg-slate-900 text-slate-200 border border-slate-700 space-y-2.5">
            <div className="flex items-center gap-2 text-orange-400 font-bold">
              <ShieldCheck className="w-5 h-5" />
              <span>Platform Admin Operator Privileges</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Platform administrators oversee compliance engines, inspect uploaded export documents, and manage audit trails.
            </p>
            <div className="flex items-start gap-2 pt-1 text-[11px] text-emerald-400 font-medium bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800/40">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>
                <strong>No business registration needed:</strong> GSTIN, IEC code, business category, and company name are omitted for admin accounts.
              </span>
            </div>
          </div>
        )}

        {/* --- ROLE: PROVIDER VIEW --- */}
        {role === 'PROVIDER' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
              <label className="block font-bold text-slate-900">
                Provider / Agency Name *
              </label>
              <input
                type="text"
                name="businessName"
                placeholder="e.g. SwiftGlobe Freight Logistics Pvt Ltd"
                className="w-full p-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 font-medium text-xs"
                required
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
              <label className="block font-bold text-slate-900">
                Service Domain *
              </label>
              <select
                name="businessCategory"
                className="w-full p-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold text-xs"
                required
              >
                <option value="Steel" className="text-slate-900 bg-white font-medium">🚢 International Ocean & Air Freight Forwarding</option>
                <option value="Food" className="text-slate-900 bg-white font-medium">🧪 Testing & Certification Laboratory</option>
                <option value="Agricultural Goods" className="text-slate-900 bg-white font-medium">📋 Customs House Agent (CHA)</option>
              </select>
            </div>
          </div>
        )}

        {/* --- ROLE: MSME VIEW (FULL GSTIN, IEC, BUSINESS CATEGORY, LEGAL NAME) --- */}
        {role === 'MSME' && (
          <>
            {/* Business Type / Industry Selector */}
            <div className="p-4 rounded-xl bg-slate-50 border-2 border-slate-300 space-y-2">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-orange-600" />
                <span className="font-bold text-slate-900 text-xs">Type of Business / Industry Sector *</span>
              </div>
              <select
                name="businessCategory"
                defaultValue=""
                className="w-full p-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold text-xs cursor-pointer focus:ring-4 focus:ring-orange-500/15 focus:border-orange-600 outline-none"
                required
              >
                <option value="" disabled className="text-slate-500 bg-white font-semibold">
                  — Select your business type —
                </option>
                <option value="Steel" className="text-slate-900 bg-white font-medium">🏗️ Steel & Metal Products</option>
                <option value="Food" className="text-slate-900 bg-white font-medium">🍱 Food & Processed Foods</option>
                <option value="Agricultural Goods" className="text-slate-900 bg-white font-medium">🌾 Agricultural Goods</option>
                <option value="Diamonds" className="text-slate-900 bg-white font-medium">💎 Diamonds & Precious Stones</option>
                <option value="Gold" className="text-slate-900 bg-white font-medium">🪙 Gold & Precious Metals</option>
              </select>
              <p className="text-[11px] text-slate-600 font-medium">
                Your certificates, documents, and compliance requirements will be generated based on this selection.
              </p>
            </div>

            {/* Compulsory GSTIN & IEC Fields with Format Validation */}
            <div className="p-4 rounded-2xl bg-orange-50/80 border-2 border-orange-200/80 space-y-3">
              <span className="font-bold text-orange-950 text-xs flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-orange-600" /> Mandatory Government Registrations
              </span>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-900">
                    GSTIN Number (15 Characters) <span className="text-red-600 font-bold">* Compulsory</span>
                  </label>
                </div>
                <div className="flex gap-2 items-start">
                  <input
                    type="text"
                    name="gstNumber"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="e.g. 27AAACP1234F1Z5"
                    pattern="[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}[A-Za-z0-9]{1}[Zz]{1}[A-Za-z0-9]{1}"
                    title="GSTIN format: 2 digits (state code) + 5 letters (PAN) + 4 digits + 1 letter + 1 alphanumeric + Z + 1 alphanumeric. Example: 27AAACP1234F1Z5"
                    maxLength={15}
                    minLength={15}
                    className="flex-1 p-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 font-bold uppercase text-xs focus:ring-4 focus:ring-orange-500/15 focus:border-orange-600 outline-none"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-600 mt-1 mb-2 font-medium">
                  Format: 2 digits + 5 letters + 4 digits + 1 letter + 1 alphanumeric + Z + 1 alphanumeric
                </p>

                {/* GST Lookup Button: Fetches Legal Name & details */}
                <GSTLookupButton
                  gstinValue={gstin}
                  onDetailsFetched={handleGSTFetched}
                />
              </div>

              <div className="pt-2 border-t border-orange-200/80">
                <label className="block font-bold text-slate-900 mb-1">
                  DGFT Import Export Code (IEC - 10 Digits) <span className="text-red-600 font-bold">* Compulsory</span>
                </label>
                <input
                  type="text"
                  name="iecCode"
                  placeholder="e.g. 0301099882"
                  pattern="[0-9]{10}"
                  title="IEC Code must be exactly 10 digits. Example: 0301099882"
                  maxLength={10}
                  minLength={10}
                  className="w-full p-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 font-bold uppercase text-xs focus:ring-4 focus:ring-orange-500/15 focus:border-orange-600 outline-none"
                  required
                />
                <p className="text-[10px] text-slate-600 mt-0.5 font-medium">Must be exactly 10 digits (e.g. 0301099882)</p>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1">
                Business / Company Legal Name *
                {businessName && (
                  <span className="ml-2 text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                    Auto-filled from GST Portal
                  </span>
                )}
              </label>
              <input
                type="text"
                name="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Bharat Quality Exports Pvt Ltd"
                className="w-full p-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 font-medium focus:ring-4 focus:ring-orange-500/15 focus:border-orange-600 outline-none text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-900 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai, Surat, Chennai"
                  className="w-full p-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 font-medium focus:ring-4 focus:ring-orange-500/15 focus:border-orange-600 outline-none text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-900 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Maharashtra, Gujarat"
                  className="w-full p-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 font-medium focus:ring-4 focus:ring-orange-500/15 focus:border-orange-600 outline-none text-xs"
                />
              </div>
            </div>
          </>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2 ${
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
              Sign In / Enter Dashboard as Admin →
            </>
          ) : role === 'PROVIDER' ? (
            <>
              <Truck className="w-4 h-4" />
              Create Service Provider Account →
            </>
          ) : (
            'Create MSME Account & Register GSTIN/IEC →'
          )}
        </button>
      </form>
    </div>
  );
}

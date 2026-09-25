'use client';

import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  Award,
  Mail,
  MapPin,
  Edit,
  X,
  CheckCircle2,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { updateProviderDetailsAction } from '@/app/actions';

interface ProviderProfileCardProps {
  provider: {
    id: string;
    name: string;
    type: string;
    serviceArea: string;
    contactEmail: string;
    active: boolean;
  };
}

export default function ProviderProfileCard({ provider }: ProviderProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-orange-600/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 font-serif">
                  {provider.name}
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Accredited Partner
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                VyaparFlow Verified Trade Partner &bull; {provider.type}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5 text-slate-600" /> Edit Service Profile
          </button>
        </div>

        {/* Profile Attributes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Authorized Service Area
            </span>
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              {provider.serviceArea}
            </span>
          </div>

          <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Operations Contact Point
            </span>
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              {provider.contactEmail}
            </span>
          </div>

          <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Accreditation Domain
            </span>
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              {provider.type === 'CERTIFICATION'
                ? 'NABL & Export Inspection Council'
                : provider.type === 'CUSTOMS_CHA'
                ? 'CBIC Licensed Customs Broker'
                : 'DGFT / Multimodal Transport Operator (MTO)'}
            </span>
          </div>
        </div>

        {/* Badges & Regulatory Licenses */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Accreditations &amp; Institutional Certifications
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">DGFT Authorized Trade Partner</span>
                <span className="text-[11px] text-slate-500">Foreign Trade Policy (FTP 2023) Compliant</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5">
              <Award className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">ISO/IEC 17025 &amp; NABL Accredited</span>
                <span className="text-[11px] text-slate-500">Assay &amp; Phytosanitary Testing Scope</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">ICEGATE Digital API Gateway</span>
                <span className="text-[11px] text-slate-500">Direct Electronic Shipping Bill Filing</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 font-serif">
                Update Service Partner Profile
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {message && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  message.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                {message.text}
              </div>
            )}

            <form
              action={async (formData: FormData) => {
                formData.set('providerId', provider.id);
                const res = await updateProviderDetailsAction(formData);
                if (res.success) {
                  setMessage({ type: 'success', text: 'Profile updated successfully.' });
                  setTimeout(() => {
                    setIsEditing(false);
                    setMessage(null);
                  }, 1000);
                } else {
                  setMessage({ type: 'error', text: res.error || 'Failed to update profile.' });
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Entity Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={provider.name}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Area &amp; Ports</label>
                <input
                  type="text"
                  name="serviceArea"
                  defaultValue={provider.serviceArea}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  defaultValue={provider.contactEmail}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

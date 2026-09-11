'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateCompanyProfileAction } from '@/app/actions';
import {
  Building2,
  MapPin,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Edit3,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

interface EditCompanyProfileModalProps {
  business: {
    id: string;
    displayName: string;
    legalName: string;
    businessType: string;
    location: string;
    city: string;
    state: string;
    gstStatus?: string;
    iecStatus?: string;
  };
  triggerClassName?: string;
  buttonText?: string;
}

const BUSINESS_TYPE_OPTIONS = [
  'Food & Agricultural Goods (Processed Foods, Spices, Grains)',
  'Steel & Industrial Metals (Hot-Rolled Coils, Stainless Steel)',
  'Gems & Jewellery (Polished Diamonds, Gold Articles)',
  'Textiles & Apparel (Garments, Cotton Yarn, Home Furnishing)',
  'Chemicals & Pharmaceuticals (Active Pharma Ingredients, Specialty Chemicals)',
  'Engineering & Automotive Goods (Auto Parts, Industrial Machinery)',
  'Handicrafts, Leather & Consumer Products',
];

export default function EditCompanyProfileModal({
  business,
  triggerClassName,
  buttonText = 'Edit Profile',
}: EditCompanyProfileModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    displayName: business?.displayName || '',
    legalName: business?.legalName || '',
    businessType: business?.businessType || BUSINESS_TYPE_OPTIONS[0],
    location: business?.location || '',
    city: business?.city || 'Mumbai',
    state: business?.state || 'Maharashtra',
  });

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleOpen = () => {
    setFormData({
      displayName: business?.displayName || '',
      legalName: business?.legalName || '',
      businessType: business?.businessType || BUSINESS_TYPE_OPTIONS[0],
      location: business?.location || '',
      city: business?.city || 'Mumbai',
      state: business?.state || 'Maharashtra',
    });
    setStatusMessage(null);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (!isPending) {
      setIsOpen(false);
      setStatusMessage(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const data = new FormData();
    data.append('businessId', business?.id || '');
    data.append('displayName', formData.displayName);
    data.append('legalName', formData.legalName);
    data.append('businessType', formData.businessType);
    data.append('location', formData.location);
    data.append('city', formData.city);
    data.append('state', formData.state);

    startTransition(async () => {
      try {
        const res = await updateCompanyProfileAction(data);
        if (res.success) {
          setStatusMessage({
            type: 'success',
            text: 'Company profile updated successfully! Changes are live across your dashboard.',
          });
          router.refresh();
          setTimeout(() => {
            setIsOpen(false);
            setStatusMessage(null);
          }, 1200);
        } else {
          setStatusMessage({
            type: 'error',
            text: res.error || 'Failed to update company profile. Please check the inputs.',
          });
        }
      } catch (err: any) {
        setStatusMessage({
          type: 'error',
          text: err.message || 'An unexpected error occurred while saving.',
        });
      }
    });
  };

  return (
    <>
      <button
        onClick={handleOpen}
        type="button"
        className={
          triggerClassName ||
          'px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 border border-slate-300 hover:border-slate-400 shadow-2xs cursor-pointer'
        }
        title="Manage & update company profile information"
      >
        <Edit3 className="w-3.5 h-3.5 text-orange-600" />
        <span>{buttonText}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-serif">
                    Manage Exporter Company Profile
                  </h3>
                  <p className="text-xs text-slate-500">
                    Update your commercial brand identity, legal entity details, and operating address.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Banner */}
            {statusMessage && (
              <div
                className={`mx-6 mt-4 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium'
                    : 'bg-red-50 border border-red-200 text-red-900 font-medium'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
              {/* Group 1: Company Identity */}
              <div className="space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 block">
                  1. Company &amp; Legal Entity Identity
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Display / Commercial Brand Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      placeholder="e.g. Apex Global Exports"
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Registered Legal Entity Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.legalName}
                      onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                      placeholder="e.g. Apex Global Exporters Pvt Ltd"
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Industry Sector / Business Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    {BUSINESS_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Group 2: Operating Location */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 block">
                  2. Industrial Location &amp; Origin Factory
                </span>

                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Registered Operating Facility / Address
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. MIDC Industrial Area, Phase II"
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">City / District</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. Mumbai / Pune / Nashik"
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">State</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="e.g. Maharashtra"
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 3: Regulatory Verification Notice */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-slate-800 text-[11px]">
                      Statutory Government Registrations
                    </span>
                  </div>
                  <Link
                    href="/business"
                    onClick={handleClose}
                    className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  >
                    <span>Upload Certificates</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>
                    GSTIN Status: <strong className="text-slate-800">{business?.gstStatus || 'Active (Verified)'}</strong>
                  </div>
                  <div>
                    IEC Code Status: <strong className="text-slate-800">{business?.iecStatus || 'Active (Verified)'}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Profile Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

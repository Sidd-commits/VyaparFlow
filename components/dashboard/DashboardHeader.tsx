'use client';

import React from 'react';
import EditCompanyProfileModal from '@/components/EditCompanyProfileModal';
import { MapPin, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface DashboardHeaderProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
  business?: {
    id: string;
    displayName: string;
    legalName: string;
    businessType: string;
    location: string;
    city: string;
    state: string;
    gstStatus: string;
    iecStatus: string;
    profileCompletion?: number | null;
  } | null;
  product?: {
    name: string;
    hsCode: string;
  } | null;
  destinationCountryName?: string | null;
}

export default function DashboardHeader({
  user,
  business,
  product,
  destinationCountryName,
}: DashboardHeaderProps) {
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Good morning'
      : currentHour < 17
      ? 'Good afternoon'
      : 'Good evening';

  const userFirstName = user.name ? user.name.split(' ')[0] : 'Exporter';
  const profileCompletion = business?.profileCompletion || 85;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-orange-700">
          <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
          <span>
            Active Exporter Node &bull; {business?.location || 'Registered Industrial Zone'}, {business?.city || 'Mumbai'}, {business?.state || 'Maharashtra'}
          </span>
        </div>

        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            {greeting}, {userFirstName}
          </span>
          <div className="flex flex-wrap items-center gap-3 mt-0.5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 font-serif tracking-tight">
              {business?.displayName || `${user.name || 'MSME'} Global Exporters`}
            </h1>
            {business && (
              <EditCompanyProfileModal
                business={business}
                buttonText="Manage Profile"
                triggerClassName="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 border border-slate-300 shadow-2xs cursor-pointer"
              />
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium pt-0.5">
          <span>
            Legal Entity: <strong className="text-slate-700 font-semibold">{business?.legalName || `${user.name || 'MSME'} Enterprises Pvt Ltd`}</strong>
          </span>
          <span>&bull;</span>
          <span>
            GSTIN: <strong className="text-emerald-700 font-semibold">{business?.gstStatus || 'Active'}</strong>
          </span>
          <span>&bull;</span>
          <span>
            IEC: <strong className="text-emerald-700 font-semibold">{business?.iecStatus || 'Active'}</strong>
          </span>
          {product && destinationCountryName && (
            <>
              <span>&bull;</span>
              <span>
                Payload: <strong className="text-slate-800 font-semibold">{product.name} (HS {product.hsCode}) &rarr; {destinationCountryName}</strong>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Profile Completion Circular Gauge */}
      <div className="flex items-center gap-4 bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 shrink-0 w-full md:w-auto justify-between md:justify-start">
        <div className="text-left md:text-right">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Profile Completion
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 font-serif">
            {profileCompletion}%
          </span>
          <span className="block text-[10px] text-emerald-600 font-semibold">
            KYC &amp; Registrations Active
          </span>
        </div>

        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-200"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-emerald-500"
              strokeDasharray={`${profileCompletion}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <CheckCircle2 className="w-5 h-5 text-emerald-600 absolute" />
        </div>
      </div>
    </div>
  );
}

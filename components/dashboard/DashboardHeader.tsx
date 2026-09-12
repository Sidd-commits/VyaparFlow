'use client';

import React from 'react';
import EditCompanyProfileModal from '@/components/EditCompanyProfileModal';
import { Globe2, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';

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
  destinationCountryIso?: string | null;
}

export default function DashboardHeader({
  user,
  business,
  product,
  destinationCountryName,
  destinationCountryIso,
}: DashboardHeaderProps) {
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Good morning'
      : currentHour < 17
      ? 'Good afternoon'
      : 'Good evening';

  const userFirstName = user.name ? user.name.split(' ')[0] : 'Exporter';
  const companyName = business?.displayName || `${user.name || 'MSME'} Global Exporters`;
  const destination = destinationCountryName || 'Not configured';
  const destIso = destinationCountryIso || '--';
  const profileCompletion = business?.profileCompletion || 85;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Greeting & Workspace */}
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-500">
            {greeting}, {userFirstName}
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {companyName}
            </h1>
            {business && (
              <EditCompanyProfileModal
                business={business}
                currentDestinationName={destinationCountryName || undefined}
                currentDestinationIso={destinationCountryIso || undefined}
                buttonText="Manage Profile"
                triggerClassName="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer border border-slate-200"
              />
            )}
          </div>
        </div>

        {/* Right: Target Corridor & Compact Status */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Destination Corridor Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50/70 border border-orange-200 text-orange-900 font-semibold">
            <Globe2 className="w-4 h-4 text-orange-600 shrink-0" />
            <span>
              Target: <strong className="font-bold text-orange-950">{destination}</strong>{' '}
              <span className="text-[11px] text-orange-700 uppercase">({destIso})</span>
            </span>
          </div>

          {/* Compact Profile Indicator */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Profile {profileCompletion}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

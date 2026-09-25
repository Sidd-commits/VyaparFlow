'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  FileCheck2,
  TrendingUp,
  Truck,
  Building2,
  Ship,
  Award,
  Layers,
} from 'lucide-react';
import ProviderVerificationDeck from './ProviderVerificationDeck';
import ProviderQuotesDesk from './ProviderQuotesDesk';
import ProviderShipmentMilestones from './ProviderShipmentMilestones';
import ProviderProfileCard from './ProviderProfileCard';

interface ProviderTabsContainerProps {
  provider: {
    id: string;
    name: string;
    type: string;
    serviceArea: string;
    contactEmail: string;
    active: boolean;
  };
  tasks: any[];
  openShipments: any[];
  submittedQuotes: any[];
  assignedShipments: any[];
}

export default function ProviderTabsContainer({
  provider,
  tasks,
  openShipments,
  submittedQuotes,
  assignedShipments,
}: ProviderTabsContainerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabParam = searchParams.get('tab');
  const initialTab =
    tabParam === 'quotes'
      ? 'quotes'
      : tabParam === 'milestones'
      ? 'milestones'
      : tabParam === 'profile'
      ? 'profile'
      : 'verification';

  const [activeTab, setActiveTab] = useState<'verification' | 'quotes' | 'milestones' | 'profile'>(
    initialTab as any
  );

  useEffect(() => {
    if (tabParam && ['verification', 'quotes', 'milestones', 'profile'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'verification' | 'quotes' | 'milestones' | 'profile') => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const pendingVerificationCount = tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'rejected' && t.requirement?.status !== 'verified'
  ).length;

  return (
    <div className="space-y-6">
      {/* Tab Navigation Pill Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap gap-1.5 sm:gap-2">
        <button
          onClick={() => handleTabChange('verification')}
          className={`flex-1 min-w-[140px] sm:min-w-[170px] py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'verification'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileCheck2
            className={`w-4 h-4 ${
              activeTab === 'verification' ? 'text-orange-400' : 'text-slate-400'
            }`}
          />
          <span>Compliance Audit Queue</span>
          {pendingVerificationCount > 0 && (
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                activeTab === 'verification'
                  ? 'bg-orange-600 text-white'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {pendingVerificationCount}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('quotes')}
          className={`flex-1 min-w-[140px] sm:min-w-[170px] py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'quotes'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <TrendingUp
            className={`w-4 h-4 ${
              activeTab === 'quotes' ? 'text-orange-400' : 'text-slate-400'
            }`}
          />
          <span>Freight RFQ &amp; Quotes Desk</span>
          {openShipments.length > 0 && (
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                activeTab === 'quotes'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-100 text-orange-800'
              }`}
            >
              {openShipments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('milestones')}
          className={`flex-1 min-w-[140px] sm:min-w-[170px] py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'milestones'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Truck
            className={`w-4 h-4 ${
              activeTab === 'milestones' ? 'text-orange-400' : 'text-slate-400'
            }`}
          />
          <span>Cargo Fleet Operations</span>
          {assignedShipments.length > 0 && (
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                activeTab === 'milestones'
                  ? 'bg-orange-600 text-white'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {assignedShipments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('profile')}
          className={`flex-1 min-w-[140px] sm:min-w-[170px] py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building2
            className={`w-4 h-4 ${
              activeTab === 'profile' ? 'text-orange-400' : 'text-slate-400'
            }`}
          />
          <span>Partner Accreditations</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'verification' && (
          <ProviderVerificationDeck
            tasks={tasks}
            currentProviderType={provider.type}
          />
        )}

        {activeTab === 'quotes' && (
          <ProviderQuotesDesk
            providerId={provider.id}
            providerName={provider.name}
            openShipments={openShipments}
            submittedQuotes={submittedQuotes}
          />
        )}

        {activeTab === 'milestones' && (
          <ProviderShipmentMilestones
            shipments={assignedShipments}
            providerId={provider.id}
          />
        )}

        {activeTab === 'profile' && (
          <ProviderProfileCard provider={provider} />
        )}
      </div>
    </div>
  );
}

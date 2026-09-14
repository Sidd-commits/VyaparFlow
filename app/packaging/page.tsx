import React from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { requireAuth, updatePackagingItemAction } from '@/app/actions';
import { prisma } from '@/lib/prisma';
import { Box, CheckCircle2, Globe, AlertOctagon, ArrowRight } from 'lucide-react';

interface PackagingPageProps {
  searchParams?: Promise<{ destId?: string }>;
}

export const dynamic = 'force-dynamic';

export default async function PackagingPage({ searchParams }: PackagingPageProps) {
  const { role, user } = await requireAuth();
  const business = user?.businesses[0];
  const product = business?.products[0];
  const destinations = product?.destinations || [];

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const requestedDestId = resolvedSearchParams?.destId;

  // Active destination based on searchParam or default to first
  const activeDestination = (destinations.find((d: any) => d.id === requestedDestId)) || destinations[0];

  const items = activeDestination?.id
    ? await prisma.packagingItem.findMany({
        where: { productCountryId: activeDestination.id },
      })
    : [];

  const completedCount = items.filter((i) => i.status === 'completed').length;

  return (
    <AppShell currentRole={role} userEmail={user?.email} userName={user?.name}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Header */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Export Packaging & Label Compliance
            </span>
            <h1 className="text-3xl font-black text-slate-900 font-serif">
              Packaging & Labelling Checklist
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Verify container seal integrity, bilingual labelling, temperature specifications, and ISPM-15 palletization.
            </p>
          </div>
        </div>

        {/* Prototype Disclaimer Banner (PRD §8.9 / PKG-05) */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
          <AlertOctagon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">PROTOTYPE RULE DISCLAIMER:</span>
            <p className="text-amber-800 mt-0.5">
              Seeded packaging and labelling requirements are reference prototype guidance. MSME exporters should verify final container artwork and storage temperatures with destination customs authorities and certified freight forwarders.
            </p>
          </div>
        </div>

        {/* Destination Corridors Switcher Tabs */}
        {destinations.length > 1 && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-orange-600" /> Switch Target Destination Corridor:
            </span>
            <div className="flex flex-wrap gap-2">
              {destinations.map((d: any) => {
                const isActive = d.id === activeDestination?.id;
                return (
                  <Link
                    key={d.id}
                    href={`/packaging?destId=${d.id}`}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                      isActive
                        ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{d.country?.name || 'Destination'}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${isActive ? 'bg-orange-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {d.country?.isoCode || 'INTL'}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Checklist Cards */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-serif">
                {activeDestination?.country?.name ? `${activeDestination.country.name} Corridor Checklist` : 'Packaging & Labelling Items'}
              </h3>
              <p className="text-xs text-slate-500">
                {items.length > 0 ? `${completedCount} of ${items.length} compliance checkpoints completed` : 'No specific packaging rules mapped yet'}
              </p>
            </div>
            {items.length > 0 && (
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${completedCount === items.length ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {completedCount === items.length ? 'All Completed' : `${items.length - completedCount} Incomplete`}
              </span>
            )}
          </div>

          {items.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto">
                <Box className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800">No Packaging Requirements Found</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No specific export packaging or labelling rules have been configured for this product corridor yet.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
              >
                <span>Return to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${
                    item.status === 'completed'
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-amber-50/60 border-amber-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Box className="w-5 h-5 text-orange-600" />
                      <span className="font-bold text-slate-900 text-base">{item.title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          item.mandatory ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.mandatory ? 'Mandatory' : 'Optional'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{item.notes}</p>
                  </div>

                  <form
                    action={async () => {
                      'use server';
                      const nextStatus = item.status === 'completed' ? 'incomplete' : 'completed';
                      await updatePackagingItemAction(item.id, nextStatus);
                    }}
                  >
                    <button
                      type="submit"
                      className={`px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                        item.status === 'completed'
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-orange-600 text-white hover:bg-orange-700'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {item.status === 'completed' ? 'Marked Completed' : 'Mark as Complete'}
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

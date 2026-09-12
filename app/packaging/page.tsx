import React from 'react';
import AppShell from '@/components/AppShell';
import { requireAuth, updatePackagingItemAction } from '@/app/actions';
import { prisma } from '@/lib/prisma';
import { Box, CheckCircle2, AlertTriangle, Info, AlertOctagon } from 'lucide-react';

export default async function PackagingPage() {
  const { role, user } = await requireAuth();
  const business = user?.businesses[0];
  const product = business?.products[0];
  const destination = product?.destinations[0];

  const items = destination?.id
    ? await prisma.packagingItem.findMany({
        where: { productCountryId: destination.id },
      })
    : [];

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
              Verify container seal integrity, bilingual Arabic/English labelling, and ISPM-15 palletization.
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

        {/* Checklist Cards */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-xl font-bold text-slate-900 font-serif">
            Export Packaging & Labelling Checklist ({items.filter((i) => i.status === 'completed').length} / {items.length} Completed)
          </h3>

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
        </div>
      </div>
    </AppShell>
  );
}

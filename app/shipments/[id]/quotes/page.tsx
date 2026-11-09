import React from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { requireAuth, selectQuoteAction } from '@/app/actions';
import { prisma } from '@/lib/prisma';
import { calculateConsignmentFinancialRoi } from '@/lib/services/financialRoi';
import {
  Truck,
  Clock,
  CheckCircle2,
  DollarSign,
  Award,
  ArrowLeft,
  ShieldCheck,
  TrendingDown,
  Percent,
  Sparkles,
  Info,
} from 'lucide-react';

export default async function QuotesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: shipmentId } = await params;
  const { role, user } = await requireAuth();

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: {
      business: true,
      product: true,
      destinationCountry: true,
      quotes: { include: { provider: true } },
    },
  });

  // Verify ownership for MSME
  if (!shipment || (role === 'MSME' && shipment.business.ownerUserId !== user?.id)) {
    return (
      <AppShell currentRole={role} userEmail={user?.email} userName={user?.name}>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
          <h2 className="text-xl font-bold font-serif text-slate-900">Shipment Not Found</h2>
          <p className="text-xs text-slate-600">The requested shipment ID was not found or you are not authorized to view it.</p>
          <Link href="/shipments" className="text-xs font-bold text-orange-600 underline mt-2 inline-block">
            Return to Shipments
          </Link>
        </div>
      </AppShell>
    );
  }

  // Calculate cheapest, fastest, and recommended quote IDs
  const quotes = shipment.quotes;
  let cheapestId = quotes[0]?.id;
  let fastestId = quotes[0]?.id;
  let recommendedId = quotes[0]?.id;

  if (quotes.length > 0) {
    const sortedByCost = [...quotes].sort((a, b) => a.cost - b.cost);
    const sortedByTime = [...quotes].sort((a, b) => a.transitMin - b.transitMin);
    cheapestId = sortedByCost[0]?.id;
    fastestId = sortedByTime[0]?.id;
    recommendedId = quotes.find((q) => q.provider?.name?.toLowerCase().includes('swiftglobe'))?.id || cheapestId;
  }

  // Calculate financial ROI and statutory export remissions
  const cheapestQuote = quotes.length > 0 ? [...quotes].sort((a, b) => a.cost - b.cost)[0] : null;
  const financialRoi = calculateConsignmentFinancialRoi({
    declaredFobValueInr: shipment.value,
    businessTypeOrSector: shipment.business.businessType,
    destinationCountryIso: shipment.destinationCountry.isoCode,
    destinationCountryName: shipment.destinationCountry.name,
    quotedFreightInr: cheapestQuote?.cost || 120000,
    hsCode: shipment.product.hsCode,
  });

  return (
    <AppShell currentRole={role} userEmail={user?.email} userName={user?.name}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        <Link href="/shipments" className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Back to Shipments
        </Link>

        {/* Header */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Multi-Carrier Freight Rate Engine
            </span>
            <h1 className="text-3xl font-black text-slate-900 font-serif">
              Logistics Quote Comparison
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Shipment #{shipment.shipmentNumber}: {shipment.product.name} ({shipment.quantity} MT) → {shipment.destinationCity}, {shipment.destinationCountry.name}
            </p>
          </div>
          <span className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full">
            Indicative Estimate Label
          </span>
        </div>

        {/* Financial ROI & Statutory Rebates Engine Card */}
        <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white rounded-2xl p-6 md:p-8 border border-emerald-900/50 shadow-lg space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-emerald-800/30 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Government Export Incentives &amp; ROI Engine
                </span>
                <span className="text-xs text-slate-400">DGFT FTP 2023–28 Schedule</span>
              </div>
              <h2 className="text-2xl font-black font-serif text-white mt-1">
                Net Consignment Financial Advantage
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {financialRoi.summaryHeadline}
              </p>
            </div>

            <div className="bg-emerald-900/30 border border-emerald-500/40 px-5 py-3 rounded-xl text-right shrink-0">
              <span className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wider block">
                Total Financial Gain
              </span>
              <span className="text-3xl font-black text-emerald-400 font-serif">
                +₹{financialRoi.totalFinancialAdvantageInr.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* 3 Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Metric 1: Statutory Remission */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1.5 backdrop-blur-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {financialRoi.statutoryIncentive.schemeName} Remission ({financialRoi.statutoryIncentive.ratePercentage}%)
                </span>
                <Percent className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl font-black text-white font-serif">
                +₹{financialRoi.statutoryIncentive.rebateAmountInr.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-400">
                Direct credit to ICEGATE ledger under {financialRoi.statutoryIncentive.schemeName}.
              </p>
            </div>

            {/* Metric 2: Bilateral FTA Duty Saved */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1.5 backdrop-blur-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Destination FTA Saving ({financialRoi.ftaArbitrage.dutySavedPercentage}%)
                </span>
                <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl font-black text-white font-serif">
                +₹{financialRoi.ftaArbitrage.dutySavedAmountInr.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-400">
                0% preferential tariff vs {financialRoi.ftaArbitrage.standardMfnRate}% MFN at destination.
              </p>
            </div>

            {/* Metric 3: Net Surplus after Freight */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 space-y-1.5 backdrop-blur-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-300 uppercase">
                  Net Surplus After Freight
                </span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl font-black text-emerald-300 font-serif">
                +₹{financialRoi.netBenefitAfterFreightInr.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-emerald-200/80">
                Statutory remissions and tariff savings fully offset logistics expenditure.
              </p>
            </div>
          </div>
        </div>

        {/* Quotes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quotes.map((q) => {
            const isCheapest = q.id === cheapestId;
            const isFastest = q.id === fastestId;
            const isRecommended = q.id === recommendedId;

            const platformFee = Math.max(750, Math.round(q.cost * 0.015));
            const baseFreight = q.cost - platformFee;

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl p-6 border flex flex-col justify-between space-y-6 relative transition-all ${
                  q.isSelected
                    ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-lg'
                    : 'border-slate-200 shadow-xs hover:border-slate-300'
                }`}
              >
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {isRecommended && (
                    <span className="bg-orange-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                      ⭐ Recommended
                    </span>
                  )}
                  {isCheapest && (
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Lowest Cost
                    </span>
                  )}
                  {isFastest && (
                    <span className="bg-blue-100 text-blue-800 border border-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Fastest Transit
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold">{q.provider.name}</span>
                    <h3 className="text-lg font-bold text-slate-900 font-serif mt-0.5">{q.mode}</h3>
                  </div>

                  {/* Cost & Monetization Breakdown */}
                  <div className="bg-[#FAF9F6] p-4 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Indicative Rate</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        100% Escrow Protected
                      </span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 font-serif">
                      ₹{q.cost.toLocaleString('en-IN')} <span className="text-sm font-normal text-slate-500">INR</span>
                    </div>

                    {/* Transparent Monetization Fee Itemization */}
                    <div className="border-t border-slate-200/60 pt-2 space-y-1 text-[11px] text-slate-600">
                      <div className="flex justify-between">
                        <span>Base Freight &amp; Line-Haul:</span>
                        <span className="font-medium text-slate-800">
                          ₹{baseFreight.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-orange-950 font-medium">
                        <span className="flex items-center gap-1">
                          VyaparFlow Facilitation Fee (1.5%):
                        </span>
                        <span>₹{platformFee.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Carrier Cargo Insurance Verification:</span>
                        <span className="text-emerald-700 font-semibold">Included ✓</span>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-orange-600 flex items-center gap-1 pt-1">
                      <Clock className="w-3.5 h-3.5" /> Transit: {q.transitMin}–{q.transitMax} Days
                    </div>
                  </div>

                  {/* Inclusions */}
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-slate-800">Inclusions:</span>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{q.inclusions}</p>
                  </div>

                  {/* Exclusions */}
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-slate-800">Exclusions:</span>
                    <p className="text-slate-500 text-[11px] leading-relaxed">{q.exclusions}</p>
                  </div>
                </div>

                {/* Selection Action */}
                <form
                  action={async () => {
                    'use server';
                    await selectQuoteAction(shipmentId, q.id);
                  }}
                >
                  <button
                    type="submit"
                    disabled={q.isSelected}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                      q.isSelected
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-orange-600 hover:bg-orange-700 text-white shadow-md'
                    }`}
                  >
                    {q.isSelected ? 'Selected Freight Carrier ✓' : 'Select This Quote & Assign Task →'}
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
